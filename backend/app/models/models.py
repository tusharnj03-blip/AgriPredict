from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER")  # USER or ADMIN
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    farms = relationship("Farm", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")
    risk_analyses = relationship("RiskAnalysis", back_populates="user")
    activities = relationship("UserActivity", back_populates="user")
    alerts = relationship("Alert", back_populates="user")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String(200), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    village = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area = Column(Float, nullable=False)
    soil_type = Column(String(50), nullable=True)
    irrigation_type = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="farms")
    soil_data = relationship("SoilData", back_populates="farm")
    predictions = relationship("Prediction", back_populates="farm")
    risk_analyses = relationship("RiskAnalysis", back_populates="farm")
    alerts = relationship("Alert", back_populates="farm")


class SoilData(Base):
    __tablename__ = "soil_data"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    nitrogen = Column(Float)
    phosphorus = Column(Float)
    potassium = Column(Float)
    ph = Column(Float)
    organic_carbon = Column(Float)
    moisture = Column(Float)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    farm = relationship("Farm", back_populates="soil_data")


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(200))
    date = Column(DateTime(timezone=True), server_default=func.now())
    rainfall = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    crop = Column(String(100))
    season = Column(String(50))
    predicted_yield = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    confidence = Column(Float)
    model_name = Column(String(100))
    input_data = Column(JSON)
    shap_values = Column(JSON)
    model_metrics = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")
    farm = relationship("Farm", back_populates="predictions")


class RiskAnalysis(Base):
    __tablename__ = "risk_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    drought_risk = Column(Float)
    flood_risk = Column(Float)
    heat_risk = Column(Float)
    water_risk = Column(Float)
    soil_risk = Column(Float)
    market_risk = Column(Float)
    overall_risk = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="risk_analyses")
    farm = relationship("Farm", back_populates="risk_analyses")


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    recommended_crop = Column(String(100))
    score = Column(Float)
    reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String(100), index=True)
    market = Column(String(200))
    state = Column(String(100))
    price = Column(Float)
    date = Column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    type = Column(String(50))  # weather, disease, market, irrigation
    severity = Column(String(20))  # HIGH, MEDIUM, LOW
    title = Column(String(200))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="alerts")
    farm = relationship("Farm", back_populates="alerts")


class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100))
    page = Column(String(200))
    action = Column(String(100))
    feature = Column(String(100), index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    duration_seconds = Column(Integer, nullable=True)

    user = relationship("User", back_populates="activities")


class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), index=True)  # INFO, WARNING, ERROR, CRITICAL
    message = Column(Text)
    endpoint = Column(String(200), nullable=True)
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(300), nullable=False)
    report_type = Column(String(50), nullable=False)  # yield, risk, market, comprehensive
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    content = Column(JSON, nullable=True)  # structured report data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="reports")
    farm = relationship("Farm", backref="reports")
