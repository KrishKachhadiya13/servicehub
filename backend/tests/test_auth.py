import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
import app.seed as seed_module

TEST_DB_FILE = "./test_auth.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

    Base.metadata.create_all(bind=engine)
    
    # Save original seed pointers
    original_engine = seed_module.engine
    original_SessionLocal = seed_module.SessionLocal
    
    seed_module.engine = engine
    seed_module.SessionLocal = TestingSessionLocal
    
    seed_module.seed_data()
    
    yield
    
    seed_module.engine = original_engine
    seed_module.SessionLocal = original_SessionLocal
    
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_login_all_seeded_roles():
    seeded_users = [
        ("admin@servicehub.com", "ADMIN"),
        ("manager@servicehub.com", "MANAGER"),
        ("agent@servicehub.com", "SUPPORT_AGENT"),
        ("employee@servicehub.com", "EMPLOYEE"),
    ]
    for email, expected_role in seeded_users:
        response = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": "password123"}
        )
        assert response.status_code == 200, f"Login failed for {email}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == email
        assert data["user"]["role"]["name"] == expected_role

def test_login_json_endpoint():
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "employee@servicehub.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "employee@servicehub.com"

def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@servicehub.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_register_employee():
    register_payload = {
        "email": "newemployee@servicehub.com",
        "full_name": "Jane Employee",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newemployee@servicehub.com"
    assert data["role"]["name"] == "EMPLOYEE"

    # Verify logging in with newly registered user
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "newemployee@servicehub.com", "password": "securepassword123"}
    )
    assert login_resp.status_code == 200

def test_get_me_unauthorized():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_authenticated():
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "agent@servicehub.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "agent@servicehub.com"

def test_role_authorization_restrictions():
    # 1. Admin accessing users endpoint -> OK (200)
    admin_login = client.post("/api/v1/auth/login", data={"username": "admin@servicehub.com", "password": "password123"})
    admin_token = admin_login.json()["access_token"]
    admin_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_resp.status_code == 200

    # 2. Manager accessing users endpoint -> OK (200)
    mgr_login = client.post("/api/v1/auth/login", data={"username": "manager@servicehub.com", "password": "password123"})
    mgr_token = mgr_login.json()["access_token"]
    mgr_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {mgr_token}"})
    assert mgr_resp.status_code == 200

    # 3. Employee attempting users endpoint -> REJECTED (403 Forbidden)
    emp_login = client.post("/api/v1/auth/login", data={"username": "employee@servicehub.com", "password": "password123"})
    emp_token = emp_login.json()["access_token"]
    emp_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {emp_token}"})
    assert emp_resp.status_code == 403
    assert "Operation not permitted" in emp_resp.json()["detail"]

    # 4. Support Agent attempting users endpoint -> REJECTED (403 Forbidden)
    agent_login = client.post("/api/v1/auth/login", data={"username": "agent@servicehub.com", "password": "password123"})
    agent_token = agent_login.json()["access_token"]
    agent_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {agent_token}"})
    assert agent_resp.status_code == 403
