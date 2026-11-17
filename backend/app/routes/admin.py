from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from app.database import get_db
from app.models.models import User, Farm, Prediction, RiskAnalysis, UserActivity, SystemLog, Alert
from app.utils.auth import get_admin_user, hash_password, verify_password
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import os
import sys

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    active_today = db.query(func.count(func.distinct(UserActivity.user_id))).filter(UserActivity.created_at >= today).scalar() or 0
    new_today = db.query(func.count(User.id)).filter(User.created_at >= today).scalar() or 0
    new_this_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar() or 0
    new_this_month = db.query(func.count(User.id)).filter(User.created_at >= month_ago).scalar() or 0
    total_sessions = db.query(func.count(func.distinct(UserActivity.session_id))).filter(UserActivity.session_id != None).scalar() or 0
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    total_farms = db.query(func.count(Farm.id)).scalar() or 0
    total_risk = db.query(func.count(RiskAnalysis.id)).scalar() or 0
    logged_in_1h = db.query(func.count(func.distinct(UserActivity.user_id))).filter(
        UserActivity.created_at >= now - timedelta(hours=1)
    ).scalar() or 0

    # Feature usage from real activity tracking
    feature_rows = db.query(
        UserActivity.feature,
        func.count(UserActivity.id).label("count")
    ).filter(UserActivity.feature != None, UserActivity.feature != "")\
     .group_by(UserActivity.feature)\
     .order_by(desc("count"))\
     .all()

    feature_usage = [{"feature": r.feature.replace("_", " ").title(), "count": r.count} for r in feature_rows]

    # User growth trend (last 7 days) — distinct active users per day
    user_trend = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59)
        count = db.query(func.count(func.distinct(UserActivity.user_id))).filter(
            UserActivity.created_at >= day_start,
            UserActivity.created_at <= day_end
        ).scalar() or 0
        user_trend.append({"date": day.strftime("%a"), "users": count})

    return {
        "total_users": total_users,
        "active_today": active_today,
        "new_today": new_today,
        "new_this_week": new_this_week,
        "new_this_month": new_this_month,
        "logged_in": logged_in_1h,
        "total_sessions": total_sessions,
        "total_predictions": total_predictions,
        "total_farms": total_farms,
        "total_risk_analyses": total_risk,
        "feature_usage": feature_usage,
        "user_trend": user_trend,
    }


@router.get("/users")
def get_users(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    q = db.query(User)
    if search:
        q = q.filter((User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
    total = q.count()
    users = q.order_by(desc(User.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    return {"users": users, "total": total, "page": page, "per_page": per_page}


@router.get("/users/{user_id}")
def get_user_detail(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    predictions = db.query(func.count(Prediction.id)).filter(Prediction.user_id == user_id).scalar() or 0
    risk_count = db.query(func.count(RiskAnalysis.id)).filter(RiskAnalysis.user_id == user_id).scalar() or 0
    sessions = db.query(func.count(func.distinct(UserActivity.session_id))).filter(
        UserActivity.user_id == user_id, UserActivity.session_id != None
    ).scalar() or 0
    most_used = db.query(UserActivity.feature, func.count(UserActivity.id).label("c"))\
        .filter(UserActivity.user_id == user_id, UserActivity.feature != None)\
        .group_by(UserActivity.feature).order_by(desc("c")).first()

    recent_activity = db.query(UserActivity).filter(UserActivity.user_id == user_id)\
        .order_by(desc(UserActivity.created_at)).limit(20).all()

    return {
        "user": user,
        "stats": {
            "total_predictions": predictions,
            "risk_analyses": risk_count,
            "total_sessions": sessions,
            "most_used_feature": most_used.feature if most_used else None,
        },
        "recent_activity": recent_activity,
    }


@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    if user.role == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot deactivate another admin account")
    user.is_active = not user.is_active
    db.commit()
    return {"user_id": user_id, "is_active": user.is_active}


@router.get("/activity")
def get_activity(
    search: Optional[str] = Query(None),
    feature: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    q = db.query(UserActivity, User.full_name.label("user_name"))\
        .join(User, UserActivity.user_id == User.id)

    if search:
        q = q.filter(User.full_name.ilike(f"%{search}%"))
    if feature:
        q = q.filter(UserActivity.feature == feature)

    total = q.count()
    rows = q.order_by(desc(UserActivity.created_at)).offset((page - 1) * per_page).limit(per_page).all()

    activity = []
    for row in rows:
        act = row[0]
        item = {
            "id": act.id, "user_id": act.user_id, "user_name": row[1],
            "page": act.page, "action": act.action, "feature": act.feature,
            "session_id": act.session_id, "ip_address": act.ip_address,
            "user_agent": act.user_agent, "duration_seconds": act.duration_seconds,
            "created_at": act.created_at,
        }
        activity.append(item)

    return {"activity": activity, "total": total}


@router.get("/predictions")
def get_predictions(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    q = db.query(Prediction, User.full_name.label("user_name"))\
        .join(User, Prediction.user_id == User.id)
    if search:
        q = q.filter((User.full_name.ilike(f"%{search}%")) | (Prediction.crop.ilike(f"%{search}%")))
    total = q.count()
    rows = q.order_by(desc(Prediction.created_at)).offset((page - 1) * per_page).limit(per_page).all()

    predictions = []
    for row in rows:
        p = row[0]
        predictions.append({
            "id": p.id, "user_id": p.user_id, "user_name": row[1],
            "crop": p.crop, "season": p.season, "predicted_yield": p.predicted_yield,
            "confidence": p.confidence, "model_name": p.model_name, "created_at": p.created_at,
        })

    return {"predictions": predictions, "total": total}


@router.get("/system-logs")
def get_system_logs(
    level: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    q = db.query(SystemLog)
    if level:
        q = q.filter(SystemLog.level == level.upper())
    total = q.count()
    logs = q.order_by(desc(SystemLog.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    return {"logs": logs, "total": total}


@router.get("/feature-usage")
def get_feature_usage(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    rows = db.query(
        UserActivity.feature,
        func.count(UserActivity.id).label("count")
    ).filter(UserActivity.feature != None, UserActivity.feature != "")\
     .group_by(UserActivity.feature)\
     .order_by(desc("count"))\
     .all()
    return [{"feature": r.feature.replace("_", " ").title(), "count": r.count} for r in rows]


@router.get("/farms")
def get_all_farms(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    q = db.query(Farm, User.full_name.label("owner_name"), User.email.label("owner_email"))\
        .join(User, Farm.user_id == User.id)
    if search:
        q = q.filter(
            (Farm.farm_name.ilike(f"%{search}%")) |
            (Farm.state.ilike(f"%{search}%")) |
            (Farm.district.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    total = q.count()
    rows = q.order_by(desc(Farm.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    farms = []
    for row in rows:
        f = row[0]
        farms.append({
            "id": f.id, "farm_name": f.farm_name, "state": f.state, "district": f.district,
            "village": f.village, "area": f.area, "soil_type": f.soil_type,
            "irrigation_type": f.irrigation_type, "latitude": f.latitude, "longitude": f.longitude,
            "user_id": f.user_id, "owner_name": row[1], "owner_email": row[2],
            "created_at": f.created_at,
        })
    return {"farms": farms, "total": total, "page": page, "per_page": per_page}


@router.get("/models")
def get_models(_: User = Depends(get_admin_user)):
    """
    Return ML model status based on actual files on disk.
    Metrics are from the ML engine's rule-based implementation.
    No fake performance numbers are returned.
    """
    import importlib.util
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")

    def _check_file(name: str) -> bool:
        path = os.path.join(models_dir, name)
        return os.path.isfile(path)

    # Check which trained model files exist on disk
    xgb_ready = _check_file("yield_xgb.pkl")
    rf_ready = _check_file("yield_rf.pkl")
    risk_ready = _check_file("risk_model.pkl")
    rec_ready = _check_file("crop_recommender.pkl")

    return {
        "models": [
            {
                "name": "Yield Prediction (XGBoost)",
                "type": "regression",
                "status": "trained" if xgb_ready else "rule-based",
                "note": "Using agronomic rule-based model. Train with real dataset for calibrated metrics.",
                "file": "yield_xgb.pkl",
                "file_exists": xgb_ready,
            },
            {
                "name": "Yield Prediction (Random Forest)",
                "type": "regression",
                "status": "trained" if rf_ready else "rule-based",
                "note": "Ensemble fallback model.",
                "file": "yield_rf.pkl",
                "file_exists": rf_ready,
            },
            {
                "name": "Risk Assessment Engine",
                "type": "multi-output",
                "status": "trained" if risk_ready else "rule-based",
                "note": "Computes drought, flood, heat, water, soil, and market risk scores.",
                "file": "risk_model.pkl",
                "file_exists": risk_ready,
            },
            {
                "name": "Crop Recommendation",
                "type": "classification",
                "status": "trained" if rec_ready else "rule-based",
                "note": "Recommends suitable crops from soil and climate parameters.",
                "file": "crop_recommender.pkl",
                "file_exists": rec_ready,
            },
        ],
        "note": "To see calibrated R²/MAE/RMSE metrics, train models on real agricultural datasets and save them as .pkl files."
    }


@router.get("/system-health")
def get_system_health(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    """Real system health check."""
    from app.database import engine
    import platform

    # Database check
    try:
        with engine.connect() as conn:
            from sqlalchemy import text as sa_text
            conn.execute(sa_text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Count errors in last hour
    hour_ago = datetime.utcnow() - timedelta(hours=1)
    error_count = db.query(func.count(SystemLog.id)).filter(
        SystemLog.level.in_(["ERROR", "CRITICAL"]),
        SystemLog.created_at >= hour_ago
    ).scalar() or 0

    total_logs = db.query(func.count(SystemLog.id)).scalar() or 0

    return {
        "database": db_status,
        "python_version": sys.version,
        "platform": platform.system(),
        "errors_last_hour": error_count,
        "total_log_entries": total_logs,
    }


class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.put("/change-password")
def admin_change_password(
    data: AdminPasswordChange,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Admin password change with strength requirements."""
    if not verify_password(data.current_password, current_admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    if not any(c.isupper() for c in data.new_password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not any(c.isdigit() for c in data.new_password):
        raise HTTPException(status_code=400, detail="Password must contain at least one digit")

    current_admin.password_hash = hash_password(data.new_password)
    db.commit()

    # Audit log
    try:
        log = SystemLog(
            level="INFO",
            message=f"Admin password changed: {current_admin.email}",
            endpoint="/api/admin/change-password",
            user_id=current_admin.id
        )
        db.add(log)
        db.commit()
    except Exception:
        pass

    return {"message": "Password updated successfully"}
