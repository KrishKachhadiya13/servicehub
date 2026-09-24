import pytest
from fastapi.testclient import TestClient

def get_auth_header(client: TestClient, email: str) -> dict:
    resp = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_comment_creation_and_visibility(client: TestClient):
    emp_headers = get_auth_header(client, "employee@servicehub.com")
    agent_headers = get_auth_header(client, "agent@servicehub.com")

    # Employee creates a ticket
    create_resp = client.post(
        "/api/v1/tickets",
        json={"title": "Mouse broken", "description": "Left click not working", "department_id": 1, "category_id": 1, "priority": "LOW"},
        headers=emp_headers
    )
    ticket_id = create_resp.json()["id"]

    # Agent adds a public comment
    client.post(
        f"/api/v1/tickets/{ticket_id}/comments",
        json={"content": "We will order a new mouse for you.", "is_internal": False},
        headers=agent_headers
    )

    # Agent adds an internal comment
    client.post(
        f"/api/v1/tickets/{ticket_id}/comments",
        json={"content": "I ordered Logitech M190 from supplier.", "is_internal": True},
        headers=agent_headers
    )

    # Employee views comments - should only see 1 (public)
    emp_comments_resp = client.get(f"/api/v1/tickets/{ticket_id}/comments", headers=emp_headers)
    assert emp_comments_resp.status_code == 200
    emp_comments = emp_comments_resp.json()
    assert len(emp_comments) == 1
    assert emp_comments[0]["is_internal"] is False
    assert "Logitech" not in emp_comments[0]["content"]

    # Agent views comments - should see both
    agent_comments_resp = client.get(f"/api/v1/tickets/{ticket_id}/comments", headers=agent_headers)
    assert agent_comments_resp.status_code == 200
    agent_comments = agent_comments_resp.json()
    assert len(agent_comments) == 2

def test_ticket_history_logging(client: TestClient):
    emp_headers = get_auth_header(client, "employee@servicehub.com")
    agent_headers = get_auth_header(client, "agent@servicehub.com")

    # Create ticket
    create_resp = client.post(
        "/api/v1/tickets",
        json={"title": "History test", "description": "Testing history logs", "department_id": 1, "category_id": 1, "priority": "LOW"},
        headers=emp_headers
    )
    ticket_id = create_resp.json()["id"]

    # Update status
    client.patch(
        f"/api/v1/tickets/{ticket_id}/status",
        json={"status": "ASSIGNED"},
        headers=agent_headers
    )

    # Fetch history
    history_resp = client.get(f"/api/v1/tickets/{ticket_id}/history", headers=agent_headers)
    assert history_resp.status_code == 200
    history = history_resp.json()
    
    # Check that history exists and contains status update
    assert len(history) > 0
    status_updates = [h for h in history if h["action"] == "STATUS_CHANGED"]
    assert len(status_updates) == 1
    assert status_updates[0]["old_value"] == "OPEN"
    assert status_updates[0]["new_value"] == "ASSIGNED"
