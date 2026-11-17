from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import RiskAnalysis as RiskModel, User
from app.schemas.schemas import RiskInput, RiskResponse
from app.utils.auth import get_current_user
from app.ml.engine import analyze_risk

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/analyze", response_model=RiskResponse)
def risk_analysis(data: RiskInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = analyze_risk(**data.model_dump())
    
    risk = RiskModel(user_id=current_user.id, farm_id=data.farm_id, **result)
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return {**result, "id": risk.id, "created_at": risk.created_at}


@router.get("/history")
def risk_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(RiskModel).filter(RiskModel.user_id == current_user.id).order_by(RiskModel.created_at.desc()).limit(20).all()


# Crop routes
from fastapi import APIRouter as _APIRouter
from app.schemas.schemas import CropRecommendationInput
from app.models.models import CropRecommendation
from app.ml.engine import recommend_crops

crop_router = _APIRouter(prefix="/crop", tags=["crop"])


@crop_router.post("/recommend")
def crop_recommend(data: CropRecommendationInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = recommend_crops(**data.model_dump())
    for r in results:
        rec = CropRecommendation(user_id=current_user.id, farm_id=data.farm_id, **r)
        db.add(rec)
    db.commit()
    return results


@crop_router.get("/list")
def crop_list():
    return ["Rice", "Wheat", "Maize", "Jowar", "Bajra", "Cotton", "Sugarcane", "Groundnut",
            "Soybean", "Ragi", "Tur", "Gram", "Mustard", "Sunflower", "Potato", "Tomato", "Onion"]


# Soil routes
from app.schemas.schemas import SoilAnalysisInput, SoilAnalysisResponse
from app.models.models import SoilData
from app.ml.engine import analyze_soil

soil_router = _APIRouter(prefix="/soil", tags=["soil"])


@soil_router.post("/analyze", response_model=SoilAnalysisResponse)
def soil_analysis(data: SoilAnalysisInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = analyze_soil(**data.model_dump())
    return result


@soil_router.get("/{farm_id}")
def get_soil(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = db.query(SoilData).filter(SoilData.farm_id == farm_id).order_by(SoilData.recorded_at.desc()).first()
    if not data:
        return {}
    return data
