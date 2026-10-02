import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("devnova.db")
logging.basicConfig(level=logging.INFO)

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = None

# If database url is postgresql and contains placeholder credentials or if connection fails
if "xxxx" in db_url or "localhost:5432" in db_url:
    try:
        # Try connecting with short timeout
        test_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        with test_engine.connect():
            pass
        engine = test_engine
        logger.info(f"Connected to PostgreSQL database: {db_url.split('@')[-1]}")
    except Exception as e:
        logger.warning(
            f"Could not connect to PostgreSQL at {db_url} (e.g. server not running or credentials are 'xxxx'). "
            "Falling back to local SQLite database 'devnova.db' for seamless development experience."
        )
        sqlite_url = "sqlite:///./devnova.db"
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
else:
    try:
        engine = create_engine(db_url)
    except Exception as e:
        logger.warning(f"Error creating engine for {db_url}: {e}. Falling back to SQLite.")
        engine = create_engine("sqlite:///./devnova.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
