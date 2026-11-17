"""
Production bootstrap seeder.

On a fresh database this module creates only the permanent administrator account
(from ADMIN_EMAIL / ADMIN_PASSWORD environment variables).

Demo/test users are NEVER created here. Use pytest fixtures or a separate
--seed-demo flag for development data.

This module is called automatically on application startup only when the
database is completely empty. It is safe to re-run — it will not duplicate
the admin account or reset its password.
"""
import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User
from app.utils.auth import hash_password

logger = logging.getLogger(__name__)


def auto_seed() -> None:
    """Bootstrap permanent admin on first run. No-op if any user already exists."""
    from app.config import settings

    # Only run when ADMIN_EMAIL is configured
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        logger.info(
            "[SEED] ADMIN_EMAIL or ADMIN_PASSWORD not configured — "
            "skipping auto-bootstrap. Run `python -m app.cli create-admin` manually."
        )
        return

    db: Session = SessionLocal()
    try:
        existing_count = db.query(User).count()
        if existing_count > 0:
            logger.info("[SEED] Database already has users — skipping auto-bootstrap.")
            return

        _create_admin(db, settings)
    except Exception as e:
        db.rollback()
        logger.error(f"[SEED] Bootstrap failed: {e}")
    finally:
        db.close()


def _create_admin(db: Session, settings) -> None:
    """Create the admin user. Must only be called when users table is empty."""
    existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if existing:
        logger.info(f"[SEED] Admin already exists: {settings.ADMIN_EMAIL}")
        return

    if len(settings.ADMIN_PASSWORD) < 8:
        logger.error("[SEED] ADMIN_PASSWORD is too short (min 8 chars). Admin not created.")
        return

    admin = User(
        full_name=settings.ADMIN_NAME or "System Administrator",
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        role="ADMIN",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    logger.info(f"[SEED] Admin account bootstrapped: {admin.email} (id={admin.id})")
    # IMPORTANT: Never log the password — not even a hint
