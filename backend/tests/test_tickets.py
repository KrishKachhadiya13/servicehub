import pytest
from fastapi.testclient import TestClient

def get_auth_header(client: TestClient, email: str) -> dict:
    resp = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_ticket(client: TestClient):
    emp_headers = get_auth_header(client, "employee@servicehub.com")
    payload = {
        "title": "Printer jammed on 3rd floor",
        "description": "Paper jam error code E-402 on HP LaserJet",
        "department_id": 1,
        "category_id": 1,
        "priority": "HIGH"
    }
    response = client.post("/api/v1/tickets", json=payload, headers=emp_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "OPEN"
    assert data["priority"] == "HIGH"
    assert "sla_deadline" in data
    assert data["sla_status"] == "SAFE"

def test_list_tickets_role_scoping(client: TestClient):
    emp_headers = get_auth_header(client, "employee@servicehub.com")
    admin_headers = get_auth_header(client, "admin@servicehub.com")

    # Employee view
    emp_resp = client.get("/api/v1/tickets", headers=emp_headers)
    assert emp_resp.status_code == 200
    emp_items = emp_resp.json()["items"]
    for t in emp_items:
        assert t["creator"]["email"] == "employee@servicehub.com"

    # Admin view
    admin_resp = client.get("/api/v1/tickets", headers=admin_headers)
    assert admin_resp.status_code == 200
    assert admin_resp.json()["total"] >= len(emp_items)

def test_ticket_status_transitions(client: TestClient):
    agent_headers = get_auth_header(client, "agent@servicehub.com")
    emp_headers = get_auth_header(client, "employee@servicehub.com")

    # Create ticket as employee
    create_resp = client.post(
        "/api/v1/tickets",
        json={"title": "Software Bug in CRM", "description": "Crash on save button", "department_id": 1, "category_id": 2, "priority": "MEDIUM"},
        headers=emp_headers
    )
    ticket_id = create_resp.json()["id"]

    # Valid transition: OPEN -> ASSIGNED
    assign_resp = client.patch(
        f"/api/v1/tickets/{ticket_id}/status",
        json={"status": "ASSIGNED"},
        headers=agent_headers
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["status"] == "ASSIGNED"

    # Valid transition: ASSIGNED -> IN_PROGRESS
    prog_resp = client.patch(
        f"/api/v1/tickets/{ticket_id}/status",
        json={"status": "IN_PROGRESS"},
        headers=agent_headers
    )
    assert prog_resp.status_code == 200
    assert prog_resp.json()["status"] == "IN_PROGRESS"

    # Invalid transition: IN_PROGRESS -> OPEN (Rejected with 422)
    invalid_resp = client.patch(
        f"/api/v1/tickets/{ticket_id}/status",
        json={"status": "OPEN"},
        headers=agent_headers
    )
    assert invalid_resp.status_code == 422
    assert "Invalid ticket status transition" in invalid_resp.json()["detail"]

def test_assign_ticket_to_agent(client: TestClient):
    agent_headers = get_auth_header(client, "agent@servicehub.com")
    emp_headers = get_auth_header(client, "employee@servicehub.com")

    # Create ticket
    create_resp = client.post(
        "/api/v1/tickets",
        json={"title": "Wi-Fi credential reset", "description": "Forgot WPA2 Enterprise password", "department_id": 1, "category_id": 3, "priority": "LOW"},
        headers=emp_headers
    )
    ticket_id = create_resp.json()["id"]

    # Assign to agent
    assign_resp = client.patch(
        f"/api/v1/tickets/{ticket_id}/assign",
        json={"assigned_agent_id": 3},
        headers=agent_headers
    )
    assert assign_resp.status_code == 200
    data = assign_resp.json()
    assert data["assigned_agent"]["id"] == 3
    assert data["status"] == "ASSIGNED"

def test_update_ticket_priority_sla_recalculation(client: TestClient):
    admin_headers = get_auth_header(client, "admin@servicehub.com")
    emp_headers = get_auth_header(client, "employee@servicehub.com")

    create_resp = client.post(
        "/api/v1/tickets",
        json={"title": "Server Overheating", "description": "Rack B server temperature warning", "department_id": 1, "category_id": 1, "priority": "LOW"},
        headers=emp_headers
    )
    ticket_id = create_resp.json()["id"]
    old_deadline = create_resp.json()["sla_deadline"]

    # Escalated to CRITICAL priority
    prio_resp = client.patch(
        f"/api/v1/tickets/{ticket_id}/priority",
        json={"priority": "CRITICAL"},
        headers=admin_headers
    )
    assert prio_resp.status_code == 200
    new_data = prio_resp.json()
    assert new_data["priority"] == "CRITICAL"
    assert new_data["sla_deadline"] != old_deadline
