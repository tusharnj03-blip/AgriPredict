from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Prediction, User
from app.schemas.schemas import YieldPredictionInput, PredictionResponse
from app.utils.auth import get_current_user
from app.ml.engine import predict_yield
import logging

router = APIRouter(prefix="/predictions", tags=["predictions"])
logger = logging.getLogger(__name__)


@router.post("/yield", response_model=PredictionResponse)
def yield_prediction(
    data: YieldPredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = predict_yield(**data.model_dump())
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Save to database
    pred = Prediction(
        user_id=current_user.id,
        farm_id=data.farm_id,
        crop=data.crop,
        season=data.season,
        predicted_yield=result["predicted_yield"],
        lower_bound=result["lower_bound"],
        upper_bound=result["upper_bound"],
        confidence=result["confidence"],
        model_name=result["model_name"],
        input_data=data.model_dump(),
        shap_values=result.get("shap_values"),
        model_metrics=result.get("model_metrics"),
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    return {
        **result,
        "id": pred.id,
        "crop": data.crop,
        "season": data.season,
        "created_at": pred.created_at,
    }



@router.get("/history")
def prediction_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preds = db.query(Prediction)\
        .filter(Prediction.user_id == current_user.id)\
        .order_by(Prediction.created_at.desc())\
        .limit(limit).all()
    return preds
