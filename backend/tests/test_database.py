import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import (
    Role, Department, User, Category, SLAPolicy, Ticket, Comment,
    UserRoleEnum, TicketPriorityEnum, TicketStatusEnum
)
from app.core.security import get_password_hash, verify_password

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_role_and_department_creation(test_db):
    role = Role(name=UserRoleEnum.ADMIN, description="Administrator")
    dept = Department(name="DevOps", description="Development Operations")
    test_db.add(role)
    test_db.add(dept)
    test_db.commit()

    saved_role = test_db.query(Role).filter_by(name=UserRoleEnum.ADMIN).first()
    saved_dept = test_db.query(Department).filter_by(name="DevOps").first()
    assert saved_role is not None
    assert saved_dept is not None
    assert saved_dept.name == "DevOps"

def test_user_password_hashing(test_db):
    role = Role(name=UserRoleEnum.EMPLOYEE, description="Employee")
    test_db.add(role)
    test_db.commit()

    hashed = get_password_hash("secret123")
    user = User(
        email="test@servicehub.com",
        full_name="Test User",
        hashed_password=hashed,
        role_id=role.id
    )
    test_db.add(user)
    test_db.commit()

    fetched_user = test_db.query(User).filter_by(email="test@servicehub.com").first()
    assert fetched_user is not None
    assert verify_password("secret123", fetched_user.hashed_password) is True
    assert verify_password("wrongpassword", fetched_user.hashed_password) is False

def test_ticket_relationships(test_db):
    role_emp = Role(name=UserRoleEnum.EMPLOYEE)
    role_agent = Role(name=UserRoleEnum.SUPPORT_AGENT)
    dept = Department(name="IT")
    cat = Category(name="Hardware")
    test_db.add_all([role_emp, role_agent, dept, cat])
    test_db.commit()

    emp = User(email="emp@test.com", full_name="Emp", hashed_password="pw", role_id=role_emp.id, department_id=dept.id)
    agent = User(email="agent@test.com", full_name="Agent", hashed_password="pw", role_id=role_agent.id, department_id=dept.id)
    test_db.add_all([emp, agent])
    test_db.commit()

    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    ticket = Ticket(
        title="Monitor flickering",
        description="Screen flickers randomly",
        creator_id=emp.id,
        assigned_agent_id=agent.id,
        department_id=dept.id,
        category_id=cat.id,
        priority=TicketPriorityEnum.HIGH,
        status=TicketStatusEnum.OPEN,
        sla_deadline=now + timedelta(hours=24)
    )
    test_db.add(ticket)
    test_db.commit()

    fetched_ticket = test_db.query(Ticket).filter_by(title="Monitor flickering").first()
    assert fetched_ticket is not None
    assert fetched_ticket.creator.email == "emp@test.com"
    assert fetched_ticket.assigned_agent.email == "agent@test.com"
    assert fetched_ticket.department.name == "IT"
    assert fetched_ticket.category.name == "Hardware"
