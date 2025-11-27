import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from app.config import Config

# Try to import pgvector, but make it optional
try:
    from pgvector.psycopg2 import register_vector
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = psycopg2.connect(Config.DATABASE_URL)

    # Only register vector if pgvector is available and extension is installed
    if PGVECTOR_AVAILABLE:
        try:
            register_vector(conn)
        except psycopg2.ProgrammingError as e:
            # pgvector extension not installed in database - semantic search will be disabled
            if 'vector type not found' in str(e):
                print("WARNING: pgvector extension not found - semantic search disabled")
                # Rollback the failed transaction so connection can be used
                conn.rollback()
            else:
                raise

    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

@contextmanager
def get_db_cursor(commit=True):
    """Context manager for database cursor with automatic commit/rollback"""
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute a query and return results"""
    with get_db_cursor() as cursor:
        cursor.execute(query, params or ())
        
        if fetch_one:
            return cursor.fetchone()
        elif fetch_all:
            return cursor.fetchall()
        else:
            return cursor.rowcount

def execute_many(query, params_list):
    """Execute multiple queries with different parameters"""
    with get_db_cursor() as cursor:
        cursor.executemany(query, params_list)
        return cursor.rowcount
