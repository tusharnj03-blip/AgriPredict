from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import User, SystemLog
from app.schemas.schemas import UserRegister, UserResponse, Token, UserUpdate
from app.utils.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user
)
from app.config import settings
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# Simple in-memory rate limiting for login (per IP)
# For production, use Redis-backed slowapi
_login_attempts: dict = {}  # ip -> (count, window_start)
_MAX_ATTEMPTS = 10
_WINDOW_SECONDS = 60


def log_to_db(db: Session, level: str, message: str, endpoint: str = None, user_id: int = None):
    try:
        log = SystemLog(level=level, message=message, endpoint=endpoint, user_id=user_id)
        db.add(log)
        db.commit()
    except Exception:
        pass


def _check_rate_limit(ip: str) -> None:
    """Raises 429 if IP has exceeded login attempts in the current window."""
    import time
    now = time.time()
    entry = _login_attempts.get(ip)
    if entry:
        count, window_start = entry
        if now - window_start < _WINDOW_SECONDS:
            if count >= _MAX_ATTEMPTS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many login attempts. Please wait 60 seconds."
                )
            _login_attempts[ip] = (count + 1, window_start)
        else:
            _login_attempts[ip] = (1, now)
    else:
        _login_attempts[ip] = (1, now)


def _validate_password_strength(password: str) -> None:
    """Enforce minimum password requirements."""
    min_len = settings.MIN_PASSWORD_LENGTH
    if len(password) < min_len:
        raise HTTPException(
            status_code=400,
            detail=f"Password must be at least {min_len} characters long."
        )
    if not any(c.isupper() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter.")
    if not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one digit.")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # Security: never allow self-assignment of ADMIN role via registration
    if data.role == "ADMIN":
        raise HTTPException(status_code=403, detail="Cannot self-assign ADMIN role during registration.")

    # Check duplicate email
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate password strength
    _validate_password_strength(data.password)

    user = User(
        full_name=data.full_name.strip(),
        email=data.email.lower().strip(),
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="USER",  # Always USER — never trust client-supplied role
        state=data.state,
        district=data.district,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_to_db(db, "INFO", f"New user registered: {user.email}", "/api/auth/register", user.id)
    logger.info(f"User registered: {user.email}")
    return user


@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Rate limiting by client IP
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    user = db.query(User).filter(
        User.email == form_data.username.lower().strip(),
        User.is_active == True
    ).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        log_to_db(
            db, "WARNING",
            f"Failed login attempt for: {form_data.username} from IP: {client_ip}",
            "/api/auth/login"
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Successful login — reset rate limit for this IP
    _login_attempts.pop(client_ip, None)

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    log_to_db(db, "INFO", f"User logged in: {user.email} from IP: {client_ip}", "/api/auth/login", user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Always return success to prevent email enumeration
    user = db.query(User).filter(User.email == email).first()
    if user:
        # In production: send password reset email with a signed token
        log_to_db(db, "INFO", f"Password reset requested for: {email}", "/api/auth/forgot-password", user.id)
        logger.info(f"Password reset requested for: {email}")
    return {"message": "If that email is registered, password reset instructions have been sent."}
