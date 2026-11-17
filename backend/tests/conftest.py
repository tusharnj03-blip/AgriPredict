"""
Shared Pytest Configuration & Fixtures for AgriPredict AI.
Provides clean isolated test database and FastAPI TestClient.
"""
import os
import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = "sqlite:///./test_agripredict.db"

os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-pytest-only"
os.environ["ADMIN_EMAIL"] = "testadmin@example.com"
os.environ["ADMIN_PASSWORD"] = "TestAdmin123!"
os.environ["ADMIN_NAME"] = "Test Administrator"

from app.main import app
from app.database import Base, get_db

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Create tables once for the entire test session and clean up after."""
    Base.metadata.create_all(bind=test_engine)
    # Bootstrap admin for tests
    from app.services.seeder import auto_seed
    auto_seed()
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    time.sleep(0.2)
    try:
        if os.path.exists("./test_agripredict.db"):
            os.remove("./test_agripredict.db")
    except PermissionError:
        pass


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def admin_token(client):
    """Authenticate admin and return JWT access token."""
    resp = client.post("/api/auth/login", data={
        "username": "testadmin@example.com",
        "password": "TestAdmin123!",
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def user_token(client):
    """Register and authenticate test user, returning JWT access token."""
    resp = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "testuser@example.com",
        "password": "TestUser123!",
    })
    assert resp.status_code in (200, 201, 400), f"Register failed: {resp.text}"
    resp = client.post("/api/auth/login", data={
        "username": "testuser@example.com",
        "password": "TestUser123!",
    })
    assert resp.status_code == 200, f"User login failed: {resp.text}"
    return resp.json()["access_token"]

