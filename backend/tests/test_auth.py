import pytest
from fastapi.testclient import TestClient

def test_login_all_seeded_roles(client: TestClient):
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

def test_login_json_endpoint(client: TestClient):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "employee@servicehub.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "employee@servicehub.com"

def test_login_invalid_credentials(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@servicehub.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_register_employee(client: TestClient):
    register_payload = {
        "email": "newemployee2@servicehub.com",
        "full_name": "Jane Employee",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newemployee2@servicehub.com"
    assert data["role"]["name"] == "EMPLOYEE"

    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "newemployee2@servicehub.com", "password": "securepassword123"}
    )
    assert login_resp.status_code == 200

def test_get_me_unauthorized(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_authenticated(client: TestClient):
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

def test_role_authorization_restrictions(client: TestClient):
    # Admin -> 200
    admin_login = client.post("/api/v1/auth/login", data={"username": "admin@servicehub.com", "password": "password123"})
    admin_token = admin_login.json()["access_token"]
    admin_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_resp.status_code == 200

    # Manager -> 200
    mgr_login = client.post("/api/v1/auth/login", data={"username": "manager@servicehub.com", "password": "password123"})
    mgr_token = mgr_login.json()["access_token"]
    mgr_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {mgr_token}"})
    assert mgr_resp.status_code == 200

    # Employee -> 403 Forbidden
    emp_login = client.post("/api/v1/auth/login", data={"username": "employee@servicehub.com", "password": "password123"})
    emp_token = emp_login.json()["access_token"]
    emp_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {emp_token}"})
    assert emp_resp.status_code == 403

    # Agent -> 403 Forbidden
    agent_login = client.post("/api/v1/auth/login", data={"username": "agent@servicehub.com", "password": "password123"})
    agent_token = agent_login.json()["access_token"]
    agent_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {agent_token}"})
    assert agent_resp.status_code == 403
