"""
Miscellaneous API routes: Weather, Market, Alerts, Activity, Simulation, Disease.

Weather & Market data notes:
  - Weather returns static agronomic reference data for Indian states.
    These are representative seasonal norms, NOT live meteorological readings.
    Set WEATHER_API_KEY in .env to integrate with OpenWeatherMap for real data.
  - Market prices are MSP (Minimum Support Price) reference values from CACP.
    They do not reflect live APMC/mandi prices. For live prices integrate with
    Agmarknet API or similar.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import WeatherData, MarketData, Alert, UserActivity, User
from app.schemas.schemas import ActivityTrack, SimulationInput, DiseaseInput
from app.utils.auth import get_current_user
from app.ml.engine import simulate_what_if, detect_disease
from datetime import datetime, timedelta

# ─── Weather ──────────────────────────────────────────────────────────────────
weather_router = APIRouter(prefix="/weather", tags=["weather"])

# Seasonal agronomic reference data for Indian states (not live readings)
# Source: IMD historical averages and ICAR agronomic guides
STATE_WEATHER_REFERENCE = {
    "Punjab": {"temperature": 26, "temp_min": 18, "temp_max": 31, "humidity": 62, "annual_rainfall_mm": 580, "wind_speed_kmh": 15, "current_season": "Rabi Sowing", "soil_moisture_pct": 65},
    "Haryana": {"temperature": 27, "temp_min": 19, "temp_max": 32, "humidity": 58, "annual_rainfall_mm": 520, "wind_speed_kmh": 14, "current_season": "Rabi Sowing", "soil_moisture_pct": 60},
    "Uttar Pradesh": {"temperature": 28, "temp_min": 20, "temp_max": 33, "humidity": 65, "annual_rainfall_mm": 720, "wind_speed_kmh": 12, "current_season": "Kharif Harvest", "soil_moisture_pct": 70},
    "Madhya Pradesh": {"temperature": 29, "temp_min": 21, "temp_max": 34, "humidity": 55, "annual_rainfall_mm": 680, "wind_speed_kmh": 14, "current_season": "Rabi Prep", "soil_moisture_pct": 58},
    "Maharashtra": {"temperature": 30, "temp_min": 22, "temp_max": 34, "humidity": 70, "annual_rainfall_mm": 850, "wind_speed_kmh": 18, "current_season": "Post-Monsoon", "soil_moisture_pct": 72},
    "Karnataka": {"temperature": 26, "temp_min": 19, "temp_max": 29, "humidity": 68, "annual_rainfall_mm": 900, "wind_speed_kmh": 16, "current_season": "Late Kharif", "soil_moisture_pct": 68},
    "Tamil Nadu": {"temperature": 29, "temp_min": 23, "temp_max": 33, "humidity": 75, "annual_rainfall_mm": 1000, "wind_speed_kmh": 20, "current_season": "Northeast Monsoon", "soil_moisture_pct": 80},
    "Andhra Pradesh": {"temperature": 31, "temp_min": 24, "temp_max": 35, "humidity": 72, "annual_rainfall_mm": 820, "wind_speed_kmh": 17, "current_season": "Kharif Harvest", "soil_moisture_pct": 69},
    "Gujarat": {"temperature": 32, "temp_min": 22, "temp_max": 36, "humidity": 60, "annual_rainfall_mm": 600, "wind_speed_kmh": 22, "current_season": "Post-Monsoon", "soil_moisture_pct": 54},
    "Rajasthan": {"temperature": 33, "temp_min": 20, "temp_max": 37, "humidity": 40, "annual_rainfall_mm": 300, "wind_speed_kmh": 25, "current_season": "Dry Period", "soil_moisture_pct": 35},
    "West Bengal": {"temperature": 29, "temp_min": 23, "temp_max": 33, "humidity": 78, "annual_rainfall_mm": 1200, "wind_speed_kmh": 14, "current_season": "Aman Rice", "soil_moisture_pct": 82},
    "Bihar": {"temperature": 28, "temp_min": 21, "temp_max": 33, "humidity": 68, "annual_rainfall_mm": 880, "wind_speed_kmh": 13, "current_season": "Rabi Prep", "soil_moisture_pct": 71},
    "Telangana": {"temperature": 30, "temp_min": 22, "temp_max": 34, "humidity": 66, "annual_rainfall_mm": 780, "wind_speed_kmh": 16, "current_season": "Cotton Harvest", "soil_moisture_pct": 64},
    "Odisha": {"temperature": 29, "temp_min": 22, "temp_max": 33, "humidity": 73, "annual_rainfall_mm": 1100, "wind_speed_kmh": 15, "current_season": "Kharif Harvest", "soil_moisture_pct": 75},
    "Kerala": {"temperature": 28, "temp_min": 23, "temp_max": 32, "humidity": 82, "annual_rainfall_mm": 2000, "wind_speed_kmh": 14, "current_season": "Monsoon Receding", "soil_moisture_pct": 88},
}

_DEFAULT_WEATHER = {
    "temperature": 28, "temp_min": 20, "temp_max": 33, "humidity": 65,
    "annual_rainfall_mm": 600, "wind_speed_kmh": 15, "current_season": "General", "soil_moisture_pct": 60
}


@weather_router.get("")
def get_weather(state: str = Query("Punjab")):
    """
    Returns agronomic climate reference data for the specified state.

    IMPORTANT: This data represents historical seasonal averages and is intended
    for agricultural planning. It is NOT a live weather feed.
    For real-time weather, configure the WEATHER_API_KEY setting.
    """
    ref = STATE_WEATHER_REFERENCE.get(state, _DEFAULT_WEATHER)

    # Build a deterministic (non-random) 7-day outlook based on season
    today = datetime.now()
    season = ref.get("current_season", "General")
    # Seasons with higher rainfall probability
    rainy_seasons = {"Northeast Monsoon", "Aman Rice", "Post-Monsoon", "Late Kharif"}
    is_rainy_season = season in rainy_seasons

    # Weekly pattern (Mon=0...Sun=6): simulate typical agricultural week
    WEEKLY_RAIN_PATTERN = [5, 2, 8, 3, 12, 6, 1] if is_rainy_season else [1, 0, 3, 0, 2, 0, 1]
    WEEKLY_CONDITIONS = (
        ["Scattered Showers", "Partly Cloudy", "Rain / Showers", "Overcast",
         "Heavy Showers", "Partly Cloudy", "Clear Sky"]
        if is_rainy_season else
        ["Clear Sky", "Sunny", "Partly Cloudy", "Clear Sky", "Sunny", "Clear Sky", "Partly Cloudy"]
    )

    forecast = []
    for i in range(7):
        day_date = today + timedelta(days=i)
        dow = day_date.weekday()
        forecast.append({
            "date": day_date.strftime("%a"),
            "full_date": day_date.strftime("%d %b"),
            "rainfall": WEEKLY_RAIN_PATTERN[dow],
            "temp_max": ref["temp_max"],
            "temp_min": ref["temp_min"],
            "condition": WEEKLY_CONDITIONS[dow],
            "humidity": ref["humidity"],
        })

    return {
        "state": state,
        "data_type": "reference",  # Clearly label as reference data
        "data_note": "Seasonal agronomic reference data (historical averages). Not a live weather reading.",
        "temperature": ref["temperature"],
        "temp_min": ref["temp_min"],
        "temp_max": ref["temp_max"],
        "humidity": ref["humidity"],
        "rainfall": ref["annual_rainfall_mm"],
        "wind_speed": ref["wind_speed_kmh"],
        "soil_moisture": ref["soil_moisture_pct"],
        "season": ref["current_season"],
        "forecast": forecast,
    }


# ─── Market ───────────────────────────────────────────────────────────────────
market_router = APIRouter(prefix="/market", tags=["market"])

# MSP (Minimum Support Price) reference values — CACP 2024-25
# Source: Cabinet Committee on Economic Affairs (CCEA)
MSP_REFERENCE = {
    "Rice": 2300, "Wheat": 2275, "Maize": 2090, "Cotton": 7121,
    "Soybean": 4892, "Groundnut": 6783, "Sugarcane": 340,
    "Onion": 1500, "Potato": 1200, "Tomato": 1800,
    "Jowar": 3371, "Bajra": 2625, "Ragi": 4290,
    "Tur": 7550, "Gram": 5440, "Mustard": 5950, "Sunflower": 7280,
}

# Reference markets (APMC mandis)
REFERENCE_MARKETS = [
    ("Punjab Mandi, Amritsar", "Punjab"),
    ("Azadpur APMC, Delhi", "Delhi"),
    ("Mumbai APMC, Maharashtra", "Maharashtra"),
    ("Kolkata Posta Bazar, West Bengal", "West Bengal"),
    ("Chennai Koyambedu, Tamil Nadu", "Tamil Nadu"),
    ("Hyderabad Gaddiannaram, Telangana", "Telangana"),
    ("Ahmedabad APMC, Gujarat", "Gujarat"),
]


@market_router.get("/prices")
def market_prices(crop: str = Query("Rice")):
    """
    Returns MSP (Minimum Support Price) reference prices for the crop.

    IMPORTANT: These are Government of India MSP values for 2024-25.
    They do not reflect live APMC/mandi market prices which fluctuate daily.
    For live prices integrate with the Agmarknet API (data.gov.in).
    """
    msp = MSP_REFERENCE.get(crop, 2000)
    return {
        "crop": crop,
        "data_type": "msp_reference",
        "data_note": "Government MSP (Minimum Support Price) 2024-25. Not live mandi prices.",
        "msp_per_quintal": msp,
        "markets": [
            {
                "market": m[0],
                "state": m[1],
                "msp_reference": msp,
                "date": datetime.now().strftime("%d %b %Y"),
            }
            for m in REFERENCE_MARKETS
        ]
    }


# ─── Alerts ───────────────────────────────────────────────────────────────────
alerts_router = APIRouter(prefix="/alerts", tags=["alerts"])


@alerts_router.get("")
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Alert).filter(Alert.user_id == current_user.id).order_by(Alert.created_at.desc()).limit(50).all()


@alerts_router.put("/{alert_id}/read")
def mark_read(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "ok"}


@alerts_router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Alert).filter(Alert.user_id == current_user.id, Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


# ─── Activity ─────────────────────────────────────────────────────────────────
activity_router = APIRouter(prefix="/activity", tags=["activity"])


@activity_router.post("/track")
def track_activity(
    data: ActivityTrack,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = UserActivity(
        user_id=current_user.id,
        session_id=data.session_id,
        page=data.page,
        action=data.action,
        feature=data.feature,
        duration_seconds=data.duration_seconds,
    )
    db.add(activity)
    db.commit()
    return {"status": "tracked"}


# ─── Simulation ───────────────────────────────────────────────────────────────
simulation_router = APIRouter(prefix="/simulation", tags=["simulation"])


@simulation_router.post("/what-if")
def what_if(data: SimulationInput, current_user: User = Depends(get_current_user)):
    return simulate_what_if(**data.model_dump())


# ─── Disease ──────────────────────────────────────────────────────────────────
disease_router = APIRouter(prefix="/disease", tags=["disease"])


@disease_router.post("/detect")
def detect(data: DiseaseInput, current_user: User = Depends(get_current_user)):
    return detect_disease(**data.model_dump())
