from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: str = "USER"  # Client-supplied role is ignored — server always uses USER
    state: Optional[str] = None
    district: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        # Always return USER regardless of what client sends
        # The route layer also enforces this; this is defence-in-depth
        return "USER"

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if len(v) > 200:
            raise ValueError("Full name must be at most 200 characters")
        return v


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Farm Schemas ─────────────────────────────────────────────────────────────

class FarmCreate(BaseModel):
    farm_name: str
    state: str
    district: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: float
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    user_id: int
    farm_name: str
    state: str
    district: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: float
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Prediction Schemas ───────────────────────────────────────────────────────

class YieldPredictionInput(BaseModel):
    state: str
    district: Optional[str] = None
    crop: str
    season: str
    area: float
    rainfall: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    irrigation: Optional[str] = None
    previous_yield: Optional[float] = None
    farm_id: Optional[int] = None


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    crop: Optional[str] = None
    season: Optional[str] = None
    predicted_yield: float
    lower_bound: float
    upper_bound: float
    confidence: float
    model_name: str
    shap_values: Optional[Dict[str, float]] = None
    model_metrics: Optional[Dict[str, float]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Risk Schemas ─────────────────────────────────────────────────────────────

class RiskInput(BaseModel):
    state: Optional[str] = None
    crop: Optional[str] = None
    season: Optional[str] = None
    rainfall: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_ph: Optional[float] = None
    farm_id: Optional[int] = None


class RiskResponse(BaseModel):
    id: Optional[int]
    drought_risk: float
    flood_risk: float
    heat_risk: float
    water_risk: float
    soil_risk: float
    market_risk: float
    overall_risk: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Crop Recommendation Schemas ─────────────────────────────────────────────

class CropRecommendationInput(BaseModel):
    state: Optional[str] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ph: Optional[float] = None
    rainfall: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    farm_id: Optional[int] = None


class CropRecommendationItem(BaseModel):
    recommended_crop: str
    score: float
    reason: str


# ─── Soil Schemas ─────────────────────────────────────────────────────────────

class SoilAnalysisInput(BaseModel):
    nitrogen: float = 0
    phosphorus: float = 0
    potassium: float = 0
    ph: float = 7.0
    organic_carbon: float = 0
    moisture: float = 0


class SoilAnalysisResponse(BaseModel):
    health_score: float
    health_label: str
    nitrogen_score: float
    phosphorus_score: float
    potassium_score: float
    ph_score: float
    organic_score: float
    moisture_score: float
    recommendations: List[str]


# ─── Simulation Schemas ───────────────────────────────────────────────────────

class SimulationInput(BaseModel):
    crop: str
    state: Optional[str] = None
    season: Optional[str] = None
    area: float = 1.0
    baseline_yield: float = 4.0
    rainfall_change: float = 0
    temperature_change: float = 0
    irrigation_change: float = 0
    fertilizer_change: float = 0
    moisture_change: float = 0


class SimulationResponse(BaseModel):
    current_yield: float
    scenario_yield: float
    change_percent: float
    profit_change: Optional[float]


# ─── Disease Schemas ──────────────────────────────────────────────────────────

class DiseaseInput(BaseModel):
    crop: str
    symptoms: str
    severity: Optional[str] = None
    affected_area: Optional[float] = None


class DiseaseResponse(BaseModel):
    disease_name: str
    confidence: float
    description: str
    treatment: List[str]
    prevention: str


# ─── Activity Schemas ─────────────────────────────────────────────────────────

class ActivityTrack(BaseModel):
    page: str
    action: str
    feature: Optional[str] = None
    session_id: Optional[str] = None
    duration_seconds: Optional[int] = None


# ─── Admin Schemas ────────────────────────────────────────────────────────────

class AdminAnalyticsResponse(BaseModel):
    total_users: int
    active_today: int
    new_this_week: int
    new_this_month: int
    new_today: int
    logged_in: int
    total_sessions: int
    total_predictions: int
    total_farms: int
    total_risk_analyses: int
    feature_usage: List[Dict[str, Any]]
    user_trend: List[Dict[str, Any]]
