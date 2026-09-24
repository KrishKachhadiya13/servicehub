import pytest
from fastapi.testclient import TestClient

def get_auth_header(client: TestClient, email: str) -> dict:
    resp = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_audit_log_access(client: TestClient):
    admin_headers = get_auth_header(client, "admin@servicehub.com")
    emp_headers = get_auth_header(client, "employee@servicehub.com")

    # Admin can access audit logs
    admin_resp = client.get("/api/v1/audit", headers=admin_headers)
    assert admin_resp.status_code == 200
    assert isinstance(admin_resp.json(), list)

    # Employee cannot access audit logs
    emp_resp = client.get("/api/v1/audit", headers=emp_headers)
    assert emp_resp.status_code == 403

def test_department_crud(client: TestClient):
    admin_headers = get_auth_header(client, "admin@servicehub.com")

    # Create department
    create_resp = client.post(
        "/api/v1/departments",
        json={"name": "Test Department", "description": "For testing"},
        headers=admin_headers
    )
    assert create_resp.status_code == 201
    dept_id = create_resp.json()["id"]

    # Update department
    update_resp = client.put(
        f"/api/v1/departments/{dept_id}",
        json={"name": "Updated Test Department", "description": "Updated"},
        headers=admin_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Test Department"

def test_category_crud(client: TestClient):
    admin_headers = get_auth_header(client, "admin@servicehub.com")

    # Create category
    create_resp = client.post(
        "/api/v1/categories",
        json={"name": "Test Category", "description": "For testing", "department_id": 1},
        headers=admin_headers
    )
    assert create_resp.status_code == 201
    cat_id = create_resp.json()["id"]

    # Update category
    update_resp = client.put(
        f"/api/v1/categories/{cat_id}",
        json={"name": "Updated Test Category", "description": "Updated", "department_id": 1},
        headers=admin_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Test Category"

def test_sla_update(client: TestClient):
    admin_headers = get_auth_header(client, "admin@servicehub.com")

    # First, list SLAs to get an ID
    list_resp = client.get("/api/v1/sla", headers=admin_headers)
    assert list_resp.status_code == 200
    slas = list_resp.json()
    assert len(slas) > 0
    sla_id = slas[0]["id"]
    old_hours = slas[0]["resolution_time_hours"]

    # Update SLA
    new_hours = old_hours + 1
    update_resp = client.put(
        f"/api/v1/sla/{sla_id}",
        json={"resolution_time_hours": new_hours, "description": "Updated SLA"},
        headers=admin_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["resolution_time_hours"] == new_hours

    # Restore SLA so we don't pollute seed data permanently (though test DB rolls back if configured so)
    client.put(
        f"/api/v1/sla/{sla_id}",
        json={"resolution_time_hours": old_hours, "description": slas[0]["description"]},
        headers=admin_headers
    )
