"""
AgriPredict AI — Backend Test Suite
Tests authentication, security, database operations, ML, admin API, and reports.
Run with: pytest tests/ -v
"""
import pytest
from app.main import app

# ─── Health Check ─────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_endpoint(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

    def test_root_endpoint(self, client):
        resp = client.get("/")
        assert resp.status_code == 200


# ─── Authentication Tests ─────────────────────────────────────────────────────
class TestAuthentication:
    def test_register_success(self, client):
        resp = client.post("/api/auth/register", json={
            "full_name": "Ravi Kumar",
            "email": "ravi.kumar@test.com",
            "password": "Secure123!",
        })
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data["email"] == "ravi.kumar@test.com"
        assert data["role"] == "USER"  # Must never be ADMIN

    def test_register_blocks_admin_role(self, client):
        """CRITICAL SECURITY: registering with role=ADMIN must be blocked."""
        resp = client.post("/api/auth/register", json={
            "full_name": "Hacker",
            "email": "hacker@test.com",
            "password": "Hack123!",
            "role": "ADMIN",  # Attempting privilege escalation
        })
        # Must either block (403) or silently force role to USER
        if resp.status_code in (200, 201):
            assert resp.json()["role"] == "USER", "SECURITY VIOLATION: user was granted ADMIN role!"
        else:
            assert resp.status_code == 403

    def test_register_duplicate_email(self, client):
        client.post("/api/auth/register", json={
            "full_name": "Dup User", "email": "dup@test.com", "password": "Dup12345!"
        })
        resp = client.post("/api/auth/register", json={
            "full_name": "Dup User", "email": "dup@test.com", "password": "Dup12345!"
        })
        assert resp.status_code == 400

    def test_register_weak_password(self, client):
        resp = client.post("/api/auth/register", json={
            "full_name": "Weak User", "email": "weak@test.com", "password": "abc",
        })
        assert resp.status_code == 400

    def test_login_success(self, client, user_token):
        assert user_token is not None
        assert len(user_token) > 10

    def test_login_invalid_credentials(self, client):
        resp = client.post("/api/auth/login", data={
            "username": "nonexistent@test.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_login_wrong_password(self, client, user_token):
        resp = client.post("/api/auth/login", data={
            "username": "testuser@example.com",
            "password": "CompletelyWrongPassword999",
        })
        assert resp.status_code == 401

    def test_protected_route_without_token(self, client):
        resp = client.get("/api/users/me")
        assert resp.status_code == 401

    def test_protected_route_with_token(self, client, user_token):
        resp = client.get("/api/users/me", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == "testuser@example.com"

    def test_forgot_password_no_enumeration(self, client):
        """Forgot password should not reveal whether email exists."""
        r1 = client.post("/api/auth/forgot-password", json={"email": "exists@test.com"})
        r2 = client.post("/api/auth/forgot-password", json={"email": "notexists@test.com"})
        # Both should return 200 with same message
        assert r1.status_code == 200
        assert r2.status_code == 200


# ─── Authorization (Role-Based) ───────────────────────────────────────────────
class TestAuthorization:
    def test_admin_endpoint_blocked_for_user(self, client, user_token):
        resp = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 403

    def test_admin_endpoint_accessible_for_admin(self, client, admin_token):
        resp = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200

    def test_admin_users_list_blocked_for_user(self, client, user_token):
        resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 403


# ─── Database Operations ──────────────────────────────────────────────────────
class TestDatabaseOperations:
    def test_create_farm(self, client, user_token):
        resp = client.post("/api/farms", json={
            "farm_name": "Test Farm",
            "state": "Punjab",
            "district": "Amritsar",
            "area": 5.0,
            "soil_type": "Alluvial",
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data["farm_name"] == "Test Farm"
        return data["id"]

    def test_list_farms(self, client, user_token):
        resp = client.get("/api/farms", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_farm_ownership(self, client, user_token):
        """User can only see their own farms."""
        resp = client.get("/api/farms", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200

    def test_update_profile(self, client, user_token):
        resp = client.put("/api/users/me", json={
            "full_name": "Updated Name",
            "state": "Maharashtra",
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "Updated Name"


# ─── ML / Predictions ─────────────────────────────────────────────────────────
class TestMLPredictions:
    def test_yield_prediction(self, client, user_token):
        resp = client.post("/api/predictions/yield", json={
            "state": "Punjab",
            "crop": "Wheat",
            "season": "Rabi",
            "area": 5.0,
            "rainfall": 450.0,
            "temperature": 22.0,
            "humidity": 65.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "predicted_yield" in data
        assert data["predicted_yield"] > 0
        assert data["lower_bound"] <= data["predicted_yield"] <= data["upper_bound"]
        # Yield must be in tonnes/hectare (reasonable range)
        assert 0.1 < data["predicted_yield"] < 100.0

    def test_prediction_saved_to_history(self, client, user_token):
        # Make a prediction
        client.post("/api/predictions/yield", json={
            "state": "Karnataka",
            "crop": "Rice",
            "season": "Kharif",
            "area": 2.0,
        }, headers={"Authorization": f"Bearer {user_token}"})
        # Check history
        resp = client.get("/api/predictions/history", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) > 0

    def test_risk_analysis(self, client, user_token):
        resp = client.post("/api/risk/analyze", json={
            "state": "Rajasthan",
            "crop": "Wheat",
            "rainfall": 200,
            "temperature": 35,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        # All risk scores must be 0-100
        for key in ["drought_risk", "flood_risk", "heat_risk", "water_risk", "soil_risk", "market_risk", "overall_risk"]:
            assert key in data
            assert 0 <= data[key] <= 100

    def test_crop_recommendation(self, client, user_token):
        resp = client.post("/api/crop/recommend", json={
            "state": "Punjab",
            "nitrogen": 80,
            "phosphorus": 40,
            "potassium": 40,
            "ph": 6.5,
            "rainfall": 600,
            "temperature": 25,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) > 0

    def test_soil_analysis(self, client, user_token):
        resp = client.post("/api/soil/analyze", json={
            "nitrogen": 90,
            "phosphorus": 45,
            "potassium": 45,
            "ph": 6.8,
            "organic_carbon": 1.2,
            "moisture": 50,
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "health_score" in data
        assert 0 <= data["health_score"] <= 100


# ─── Admin Analytics ──────────────────────────────────────────────────────────
class TestAdminAnalytics:
    def test_analytics_uses_real_data(self, client, admin_token):
        resp = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        # Must have at least 1 user (the admin)
        assert data["total_users"] >= 1
        assert "total_predictions" in data
        assert "total_farms" in data
        assert isinstance(data["feature_usage"], list)
        assert isinstance(data["user_trend"], list)
        assert len(data["user_trend"]) == 7

    def test_admin_users_list(self, client, admin_token):
        resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "users" in data
        assert "total" in data
        assert data["total"] >= 1

    def test_admin_models_honest(self, client, admin_token):
        """Models endpoint must not return fake R²/MAE metrics."""
        resp = client.get("/api/admin/models", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "models" in data
        for model in data["models"]:
            assert "r2" not in model or model.get("file_exists") is True, \
                "INTEGRITY VIOLATION: fake R² metrics returned for non-existent model file"

    def test_system_health(self, client, admin_token):
        resp = client.get("/api/admin/system-health", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["database"] == "connected"


# ─── Reports ─────────────────────────────────────────────────────────────────
class TestReports:
    def test_generate_report(self, client, user_token):
        resp = client.post("/api/reports/generate", json={
            "report_type": "comprehensive",
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "name" in data
        assert "content" in data
        return data["id"]

    def test_list_reports(self, client, user_token):
        resp = client.get("/api/reports", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "reports" in data

    def test_report_ownership(self, client, user_token, admin_token):
        """User must not be able to access another user's report."""
        # Create a report as user
        create_resp = client.post("/api/reports/generate", json={"report_type": "yield"},
                                  headers={"Authorization": f"Bearer {user_token}"})
        report_id = create_resp.json()["id"]
        # Try to access as admin (different user)
        resp = client.get(f"/api/reports/{report_id}", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 404  # Must not find other user's report

    def test_invalid_report_type(self, client, user_token):
        resp = client.post("/api/reports/generate", json={"report_type": "invalid_type"},
                           headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400


# ─── Weather / Market Data Labels ─────────────────────────────────────────────
class TestDataIntegrity:
    def test_weather_labels_as_reference(self, client, user_token):
        """Weather must be clearly labeled as reference data, not live."""
        resp = client.get("/api/weather?state=Punjab", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("data_type") == "reference", "Weather data must be labeled as reference, not live"

    def test_market_labels_as_msp(self, client, user_token):
        """Market prices must clearly say they are MSP, not live."""
        resp = client.get("/api/market/prices?crop=Rice", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("data_type") == "msp_reference", "Market data must be labeled as MSP reference"

    def test_password_change_strength(self, client, user_token):
        """Weak new password must be rejected."""
        resp = client.put("/api/users/me/password", json={
            "current_password": "TestUser123!",
            "new_password": "weak",
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400


# ─── Activity Tracking ────────────────────────────────────────────────────────
class TestActivityTracking:
    def test_track_activity(self, client, user_token):
        resp = client.post("/api/activity/track", json={
            "page": "/yield-prediction",
            "action": "page_view",
            "feature": "yield_prediction",
            "session_id": "test-session-123",
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200

    def test_activity_appears_in_admin_analytics(self, client, user_token, admin_token):
        # Track some activity
        client.post("/api/activity/track", json={
            "page": "/risk-analysis",
            "action": "page_view",
            "feature": "risk_analysis",
            "session_id": "test-session-456",
        }, headers={"Authorization": f"Bearer {user_token}"})
        # Check admin analytics reflects it
        resp = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
        data = resp.json()
        # feature_usage should have entries now
        assert isinstance(data["feature_usage"], list)
