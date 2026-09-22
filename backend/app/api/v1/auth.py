from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Role, UserRoleEnum, AuditLog
from app.schemas import UserCreate, UserResponse, Token, LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_active_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a new employee account")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Fetch EMPLOYEE role
    employee_role = db.query(Role).filter(Role.name == UserRoleEnum.EMPLOYEE).first()
    if not employee_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default Employee role configuration missing."
        )

    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role_id=employee_role.id,
        department_id=user_in.department_id,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Log audit entry
    audit = AuditLog(
        actor_id=new_user.id,
        action="USER_REGISTERED",
        entity="USER",
        entity_id=str(new_user.id),
        details=f"User self-registered as {new_user.email}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=Token, summary="Authenticate user & return JWT token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    access_token = create_access_token(subject=user.id)

    # Log login audit
    audit = AuditLog(
        actor_id=user.id,
        action="USER_LOGIN",
        entity="USER",
        entity_id=str(user.id),
        details=f"User logged in: {user.email}"
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login/json", response_model=Token, summary="JSON format login endpoint")
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    access_token = create_access_token(subject=user.id)

    audit = AuditLog(
        actor_id=user.id,
        action="USER_LOGIN_JSON",
        entity="USER",
        entity_id=str(user.id),
        details=f"User logged in via JSON: {user.email}"
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
