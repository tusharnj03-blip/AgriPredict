"""
AgriPredict AI — End-to-End User & Admin Journeys Test Suite
Validates the complete 15-step User Journey and 13-step Admin Journey.
Run with: pytest tests/test_e2e_journeys.py -v
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import os

# Use existing app configuration
from app.main import app

class TestUserJourney:
    """
    USER JOURNEY:
    1. Open landing page.
    2. Register an account.
    3. Log in.
    4. Create a farm.
    5. Add soil information.
    6. View weather information.
    7. Run crop yield prediction.
    8. View prediction explanation (SHAP).
    9. Run agricultural risk analysis.
    10. Get crop recommendations.
    11. Run what-if simulation.
    12. View prediction history.
    13. Generate a report.
    14. Update profile.
    15. Log out.
    """

    user_email = f"farmer_{int(datetime.now().timestamp())}@example.com"
    user_password = "FarmerStrongPass123!"
    user_token = None
    farm_id = None
    prediction_id = None

    def test_step_01_open_landing_page(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json().get("name") == "AgriPredict AI API"

    def test_step_02_register_account(self, client):
        resp = client.post("/api/auth/register", json={
            "full_name": "Ramesh Patel",
            "email": self.user_email,
            "password": self.user_password,
            "phone": "+91 98765 43210",
            "state": "Gujarat",
            "district": "Anand"
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == self.user_email
        assert data["role"] == "USER"

    def test_step_03_login(self, client):
        resp = client.post("/api/auth/login", data={
            "username": self.user_email,
            "password": self.user_password
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        TestUserJourney.user_token = data["access_token"]

    def test_step_04_create_farm(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/farms", json={
            "farm_name": "Patel Organic Agri Farm",
            "state": "Gujarat",
            "district": "Anand",
            "village": "Vasad",
            "area": 4.5,
            "soil_type": "Black Soil",
            "irrigation_type": "Drip"
        }, headers=headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["farm_name"] == "Patel Organic Agri Farm"
        TestUserJourney.farm_id = data["id"]

    def test_step_05_add_soil_information(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/soil/analyze", json={
            "farm_id": TestUserJourney.farm_id,
            "nitrogen": 110.0,
            "phosphorus": 55.0,
            "potassium": 50.0,
            "ph": 6.8,
            "organic_carbon": 0.85,
            "moisture": 45.0
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "health_score" in data
        assert data["health_label"] in ["EXCELLENT", "GOOD", "MODERATE", "POOR", "CRITICAL"]

    def test_step_06_view_weather_information(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.get("/api/weather?state=Gujarat", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["state"] == "Gujarat"
        assert "forecast" in data
        assert len(data["forecast"]) == 7

    def test_step_07_run_crop_yield_prediction(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/predictions/yield", json={
            "farm_id": TestUserJourney.farm_id,
            "state": "Gujarat",
            "crop": "Cotton",
            "season": "Kharif",
            "area": 4.5,
            "rainfall": 600.0,
            "temperature": 32.0,
            "humidity": 60.0,
            "soil_ph": 6.8,
            "nitrogen": 110.0,
            "phosphorus": 55.0,
            "potassium": 50.0,
            "irrigation": "Drip"
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["predicted_yield"] > 0
        assert data["crop"] == "Cotton"
        TestUserJourney.prediction_id = data["id"]

    def test_step_08_view_prediction_explanation_shap(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.get("/api/predictions/history", headers=headers)
        assert resp.status_code == 200
        history = resp.json()
        assert len(history) > 0
        latest = history[0]
        assert "shap_values" in latest
        assert isinstance(latest["shap_values"], dict)

    def test_step_09_run_risk_analysis(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/risk/analyze", json={
            "farm_id": TestUserJourney.farm_id,
            "state": "Gujarat",
            "crop": "Cotton",
            "season": "Kharif",
            "rainfall": 600.0,
            "temperature": 32.0,
            "humidity": 60.0,
            "soil_ph": 6.8
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "overall_risk" in data
        assert 0 <= data["overall_risk"] <= 100

    def test_step_10_get_crop_recommendations(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/crop/recommend", json={
            "farm_id": TestUserJourney.farm_id,
            "state": "Gujarat",
            "nitrogen": 110.0,
            "phosphorus": 55.0,
            "potassium": 50.0,
            "ph": 6.8,
            "rainfall": 600.0,
            "temperature": 32.0,
            "humidity": 60.0
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) > 0
        assert "recommended_crop" in data[0]

    def test_step_11_run_what_if_simulation(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/simulation/what-if", json={
            "crop": "Cotton",
            "state": "Gujarat",
            "baseline_yield": 2.5,
            "area": 4.5,
            "rainfall_change": 15.0,
            "temperature_change": -2.0,
            "fertilizer_change": 10.0
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "scenario_yield" in data
        assert "profit_change" in data

    def test_step_12_view_prediction_history(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.get("/api/predictions/history", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1

    def test_step_13_generate_report(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/reports/generate", json={
            "report_type": "comprehensive",
            "farm_id": TestUserJourney.farm_id
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "content" in data

    def test_step_14_update_profile(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.put("/api/users/me", json={
            "full_name": "Ramesh K. Patel",
            "district": "Vadodara"
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["full_name"] == "Ramesh K. Patel"
        assert data["district"] == "Vadodara"

    def test_step_15_logout_telemetry(self, client):
        headers = {"Authorization": f"Bearer {TestUserJourney.user_token}"}
        resp = client.post("/api/activity/track", json={
            "page": "/settings",
            "action": "logout",
            "feature": "authentication",
            "session_id": "test_session_user_logout"
        }, headers=headers)
        assert resp.status_code == 200


class TestAdminJourney:
    """
    ADMIN JOURNEY:
    1. Open administrator login.
    2. Log in with permanent admin credentials.
    3. Open admin dashboard (fetch analytics).
    4. View total registered users.
    5. Search users.
    6. Open user profile / details.
    7. Inspect user activity.
    8. Review prediction statistics.
    9. Review feature usage.
    10. Inspect system health.
    11. Review system logs.
    12. Change administrator password.
    13. Log out telemetry.
    """

    admin_token = None
    target_user_id = None

    def test_step_01_admin_login_endpoint(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_step_02_login_with_permanent_admin_credentials(self, client):
        from app.config import settings
        admin_email = settings.ADMIN_EMAIL or "admin@agripredict.local"
        admin_password = settings.ADMIN_PASSWORD or "ChangeMe123!"

        resp = client.post("/api/auth/login", data={
            "username": admin_email,
            "password": admin_password
        })
        assert resp.status_code == 200, f"Admin login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        TestAdminJourney.admin_token = data["access_token"]

    def test_step_03_open_admin_dashboard_analytics(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/analytics", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_users" in data
        assert "total_predictions" in data
        assert "total_farms" in data

    def test_step_04_view_total_registered_users(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/users", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1
        assert len(data["users"]) > 0
        TestAdminJourney.target_user_id = data["users"][0]["id"]

    def test_step_05_search_users(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/users?search=Patel", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "users" in data

    def test_step_06_open_user_details(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get(f"/api/admin/users/{TestAdminJourney.target_user_id}", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "user" in data
        assert "stats" in data

    def test_step_07_inspect_user_activity(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/activity", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "activity" in data

    def test_step_08_review_prediction_statistics(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/predictions", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "predictions" in data

    def test_step_09_review_feature_usage(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/feature-usage", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_step_10_inspect_system_health(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/system-health", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["database"] == "connected"

    def test_step_11_review_system_logs(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.get("/api/admin/system-logs", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "logs" in data

    def test_step_12_change_admin_password(self, client):
        from app.config import settings
        admin_password = settings.ADMIN_PASSWORD or "ChangeMe123!"
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        
        # Test validation: rejection of weak passwords
        weak_resp = client.put("/api/admin/change-password", json={
            "current_password": admin_password,
            "new_password": "weak"
        }, headers=headers)
        assert weak_resp.status_code == 400

        # Change to new valid password
        new_pass = "NewAdminStrongPass456!"
        resp = client.put("/api/admin/change-password", json={
            "current_password": admin_password,
            "new_password": new_pass
        }, headers=headers)
        assert resp.status_code == 200

        # Revert back to original password for testing consistency
        revert_resp = client.put("/api/admin/change-password", json={
            "current_password": new_pass,
            "new_password": admin_password
        }, headers=headers)
        assert revert_resp.status_code == 200

    def test_step_13_admin_logout_telemetry(self, client):
        headers = {"Authorization": f"Bearer {TestAdminJourney.admin_token}"}
        resp = client.post("/api/activity/track", json={
            "page": "/admin/settings",
            "action": "admin_logout",
            "feature": "authentication",
            "session_id": "test_session_admin_logout"
        }, headers=headers)
        assert resp.status_code == 200
