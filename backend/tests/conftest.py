import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
import app.seed as seed_module

TEST_DB_FILE = "./test_shared.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_FILE}"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_suite_db():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

    Base.metadata.create_all(bind=test_engine)
    
    orig_engine = seed_module.engine
    orig_session = seed_module.SessionLocal
    seed_module.engine = test_engine
    seed_module.SessionLocal = TestingSessionLocal
    
    seed_module.seed_data()

    def override_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_db

    yield

    app.dependency_overrides.clear()
    seed_module.engine = orig_engine
    seed_module.SessionLocal = orig_session

    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)
