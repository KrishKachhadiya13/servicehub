import sys
import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models import (
    Role, Department, User, Category, SLAPolicy, Ticket, Comment,
    TicketHistory, Notification, AuditLog,
    UserRoleEnum, TicketPriorityEnum, TicketStatusEnum
)
from app.core.security import get_password_hash

def seed_data():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Starting ServiceHub Database Seeding...")

        # 1. Seed Roles
        roles_data = [
            (UserRoleEnum.ADMIN, "System Administrator with full permissions"),
            (UserRoleEnum.MANAGER, "Team manager overseeing department tickets & SLAs"),
            (UserRoleEnum.SUPPORT_AGENT, "Support agent handling and resolving tickets"),
            (UserRoleEnum.EMPLOYEE, "Standard employee user creating service requests"),
        ]
        roles_map = {}
        for role_name, description in roles_data:
            role = db.query(Role).filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name, description=description)
                db.add(role)
                db.flush()
            roles_map[role_name] = role
        print("[OK] Roles seeded.")

        # 2. Seed Departments
        departments_data = [
            ("IT Infrastructure", "Core servers, network, hardware and systems administration"),
            ("Customer Support", "External and internal client service desktop assistance"),
            ("HR Operations", "Human resources onboarding, payroll, and benefits services"),
        ]
        depts_map = {}
        for dept_name, description in departments_data:
            dept = db.query(Department).filter_by(name=dept_name).first()
            if not dept:
                dept = Department(name=dept_name, description=description)
                db.add(dept)
                db.flush()
            depts_map[dept_name] = dept
        print("[OK] Departments seeded.")

        # 3. Seed Demo Users
        users_data = [
            ("admin@servicehub.com", "System Admin", UserRoleEnum.ADMIN, "IT Infrastructure"),
            ("manager@servicehub.com", "IT Manager Sarah", UserRoleEnum.MANAGER, "IT Infrastructure"),
            ("agent@servicehub.com", "Agent Alex Rivera", UserRoleEnum.SUPPORT_AGENT, "IT Infrastructure"),
            ("employee@servicehub.com", "Employee John Doe", UserRoleEnum.EMPLOYEE, "HR Operations"),
        ]
        default_password_hash = get_password_hash("password123")
        users_map = {}

        for email, full_name, role_enum, dept_name in users_data:
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(
                    email=email,
                    full_name=full_name,
                    hashed_password=default_password_hash,
                    role_id=roles_map[role_enum].id,
                    department_id=depts_map[dept_name].id if dept_name in depts_map else None,
                    is_active=True
                )
                db.add(user)
                db.flush()
            users_map[email] = user
        print("[OK] Demo users seeded.")

        # 4. Seed Categories
        categories_data = [
            ("Hardware Support", "Laptops, monitors, peripherals, and workstation repair", "IT Infrastructure"),
            ("Software Licensing", "IDE, OS, Productivity software requests", "IT Infrastructure"),
            ("Network & VPN Access", "Wi-Fi, VPN credentials, firewall access", "IT Infrastructure"),
            ("HR Onboarding", "New hire badge, workspace, and setup", "HR Operations"),
            ("Payroll & Benefits", "Salary inquiry, insurance, tax form assistance", "HR Operations"),
            ("Customer Service Inquiry", "Escalated client account issue", "Customer Support"),
        ]
        categories_map = {}
        for cat_name, description, dept_name in categories_data:
            cat = db.query(Category).filter_by(name=cat_name).first()
            if not cat:
                cat = Category(
                    name=cat_name,
                    description=description,
                    department_id=depts_map[dept_name].id if dept_name in depts_map else None
                )
                db.add(cat)
                db.flush()
            categories_map[cat_name] = cat
        print("[OK] Categories seeded.")

        # 5. Seed SLA Policies
        sla_data = [
            (TicketPriorityEnum.LOW, 72, "Low priority issues: 72-hour SLA resolution target"),
            (TicketPriorityEnum.MEDIUM, 48, "Standard medium issues: 48-hour SLA resolution target"),
            (TicketPriorityEnum.HIGH, 24, "High priority issues: 24-hour SLA resolution target"),
            (TicketPriorityEnum.CRITICAL, 4, "Critical outages: 4-hour SLA resolution target"),
        ]
        for priority, hours, description in sla_data:
            policy = db.query(SLAPolicy).filter_by(priority=priority).first()
            if not policy:
                policy = SLAPolicy(priority=priority, resolution_time_hours=hours, description=description)
                db.add(policy)
        print("[OK] SLA Policies seeded.")

        db.commit()

        # 6. Seed Sample Realistic Tickets (Idempotent check by title)
        sample_tickets = [
            {
                "title": "VPN connection drops every 30 minutes on macOS",
                "description": "Whenever I connect to the corporate VPN from home, the connection terminates precisely after 30 minutes with a timeout error.",
                "creator": "employee@servicehub.com",
                "assigned": "agent@servicehub.com",
                "department": "IT Infrastructure",
                "category": "Network & VPN Access",
                "priority": TicketPriorityEnum.HIGH,
                "status": TicketStatusEnum.IN_PROGRESS,
                "created_hours_ago": 10,
                "sla_hours": 24
            },
            {
                "title": "Request for JetBrains All Products License Renewal",
                "description": "My developer JetBrains license expired yesterday. Need renewal for active Q4 project sprint.",
                "creator": "employee@servicehub.com",
                "assigned": "agent@servicehub.com",
                "department": "IT Infrastructure",
                "category": "Software Licensing",
                "priority": TicketPriorityEnum.MEDIUM,
                "status": TicketStatusEnum.ASSIGNED,
                "created_hours_ago": 5,
                "sla_hours": 48
            },
            {
                "title": "CRITICAL: Primary Database Replica Latency High",
                "description": "Production database read-replica lag exceeded 45 seconds. High read workload impacting client dashboard API.",
                "creator": "manager@servicehub.com",
                "assigned": "agent@servicehub.com",
                "department": "IT Infrastructure",
                "category": "Hardware Support",
                "priority": TicketPriorityEnum.CRITICAL,
                "status": TicketStatusEnum.OPEN,
                "created_hours_ago": 1,
                "sla_hours": 4
            },
            {
                "title": "Dual Monitor setup request for workstation 4B",
                "description": "Requesting a secondary 27-inch 4K monitor for data visualization tasks.",
                "creator": "employee@servicehub.com",
                "assigned": None,
                "department": "IT Infrastructure",
                "category": "Hardware Support",
                "priority": TicketPriorityEnum.LOW,
                "status": TicketStatusEnum.OPEN,
                "created_hours_ago": 20,
                "sla_hours": 72
            },
            {
                "title": "W2 Tax Form Correction Request",
                "description": "Need an updated copy of my previous year tax summary with updated address details.",
                "creator": "employee@servicehub.com",
                "assigned": None,
                "department": "HR Operations",
                "category": "Payroll & Benefits",
                "priority": TicketPriorityEnum.MEDIUM,
                "status": TicketStatusEnum.RESOLVED,
                "created_hours_ago": 50,
                "sla_hours": 48
            }
        ]

        now = datetime.now(timezone.utc)

        for item in sample_tickets:
            ticket = db.query(Ticket).filter_by(title=item["title"]).first()
            if not ticket:
                created_at = now - timedelta(hours=item["created_hours_ago"])
                sla_deadline = created_at + timedelta(hours=item["sla_hours"])
                
                ticket = Ticket(
                    title=item["title"],
                    description=item["description"],
                    creator_id=users_map[item["creator"]].id,
                    assigned_agent_id=users_map[item["assigned"]].id if item["assigned"] else None,
                    department_id=depts_map[item["department"]].id,
                    category_id=categories_map[item["category"]].id,
                    priority=item["priority"],
                    status=item["status"],
                    created_at=created_at,
                    sla_deadline=sla_deadline,
                    updated_at=created_at
                )
                db.add(ticket)
                db.flush()

                # Add sample initial history
                history = TicketHistory(
                    ticket_id=ticket.id,
                    actor_id=users_map[item["creator"]].id,
                    action="TICKET_CREATED",
                    new_value=item["status"].value,
                    timestamp=created_at
                )
                db.add(history)

                # Add sample comment for assigned ticket
                if item["assigned"]:
                    comment = Comment(
                        ticket_id=ticket.id,
                        author_id=users_map[item["assigned"]].id,
                        content=f"Ticket assigned to {item['assigned']}. Investigating issue now.",
                        is_internal=False,
                        created_at=created_at + timedelta(minutes=15)
                    )
                    db.add(comment)

                    notification = Notification(
                        user_id=users_map[item["assigned"]].id,
                        title=f"Ticket #{ticket.id} Assigned",
                        message=f"You have been assigned to ticket: {ticket.title}",
                        ticket_id=ticket.id,
                        is_read=False,
                        created_at=created_at + timedelta(minutes=15)
                    )
                    db.add(notification)

        # Audit log entry for seeding
        audit = db.query(AuditLog).filter_by(action="SYSTEM_SEED").first()
        if not audit:
            audit = AuditLog(
                actor_id=users_map["admin@servicehub.com"].id,
                action="SYSTEM_SEED",
                entity="SYSTEM",
                entity_id="0",
                details="Initial system seed script executed successfully.",
                ip_address="127.0.0.1"
            )
            db.add(audit)

        db.commit()
        print("[OK] Sample tickets, history, comments, and notifications seeded.")
        print("\n==================================================")
        print("ServiceHub Seed Completed Successfully!")
        print("==================================================")
        print("Demo User Credentials (LOCAL DEVELOPMENT ONLY):")
        print("  - ADMIN:          admin@servicehub.com / password123")
        print("  - MANAGER:        manager@servicehub.com / password123")
        print("  - SUPPORT_AGENT:  agent@servicehub.com / password123")
        print("  - EMPLOYEE:       employee@servicehub.com / password123")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
