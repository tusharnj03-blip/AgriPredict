from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.database import get_db
from app.models.models import User, Report, Prediction, RiskAnalysis, Farm
from app.utils.auth import get_current_user
from datetime import datetime

reports_router = APIRouter(prefix="/reports", tags=["reports"])


@reports_router.get("")
def list_reports(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Report).filter(Report.user_id == current_user.id)
    total = q.count()
    reports = q.order_by(desc(Report.created_at)).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "reports": [
            {
                "id": r.id,
                "name": r.name,
                "report_type": r.report_type,
                "farm_id": r.farm_id,
                "created_at": r.created_at,
            }
            for r in reports
        ],
        "total": total,
    }


@reports_router.post("/generate")
def generate_report(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate and persist a structured agricultural report.

    Payload fields:
        report_type: "yield" | "risk" | "comprehensive"
        farm_id:     (optional) restrict to a specific farm
    """
    report_type = payload.get("report_type", "comprehensive")
    farm_id = payload.get("farm_id")

    if report_type not in ("yield", "risk", "market", "comprehensive"):
        raise HTTPException(status_code=400, detail="Invalid report_type")

    # Gather data for the report
    content: dict = {"generated_at": datetime.utcnow().isoformat()}

    # Yield predictions
    pred_q = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    if farm_id:
        pred_q = pred_q.filter(Prediction.farm_id == farm_id)
    predictions = pred_q.order_by(desc(Prediction.created_at)).limit(10).all()
    content["predictions"] = [
        {
            "crop": p.crop, "season": p.season,
            "predicted_yield": p.predicted_yield,
            "confidence": p.confidence,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in predictions
    ]

    # Risk analyses
    risk_q = db.query(RiskAnalysis).filter(RiskAnalysis.user_id == current_user.id)
    if farm_id:
        risk_q = risk_q.filter(RiskAnalysis.farm_id == farm_id)
    risks = risk_q.order_by(desc(RiskAnalysis.created_at)).limit(5).all()
    content["risk_analyses"] = [
        {
            "overall_risk": r.overall_risk,
            "drought_risk": r.drought_risk,
            "flood_risk": r.flood_risk,
            "heat_risk": r.heat_risk,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in risks
    ]

    # Farm info
    farm_q = db.query(Farm).filter(Farm.user_id == current_user.id)
    if farm_id:
        farm_q = farm_q.filter(Farm.id == farm_id)
    farms = farm_q.all()
    content["farms"] = [
        {"id": f.id, "name": f.farm_name, "state": f.state, "area": f.area}
        for f in farms
    ]

    # Create report name
    type_label = report_type.replace("_", " ").title()
    farm_label = f" — Farm {farm_id}" if farm_id else ""
    name = f"{type_label} Report{farm_label} — {datetime.utcnow().strftime('%d %b %Y')}"

    report = Report(
        user_id=current_user.id,
        name=name,
        report_type=report_type,
        farm_id=farm_id,
        content=content,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "name": report.name,
        "report_type": report.report_type,
        "created_at": report.created_at,
        "content": content,
    }


@reports_router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id  # Strict ownership check
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": report.id,
        "name": report.name,
        "report_type": report.report_type,
        "farm_id": report.farm_id,
        "created_at": report.created_at,
        "content": report.content,
    }


@reports_router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted"}
