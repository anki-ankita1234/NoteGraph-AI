
import sqlite3
from pathlib import Path

DATABASE_NAME = Path(__file__).with_name("notegraph.db")


def get_connection():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_table():
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Analysis history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            notes TEXT NOT NULL,
            concepts TEXT,
            relationships TEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Safely add user_id to an existing database
    cursor.execute("PRAGMA table_info(analysis_history)")
    columns = [row["name"] for row in cursor.fetchall()]

    if "user_id" not in columns:
        cursor.execute(
            "ALTER TABLE analysis_history ADD COLUMN user_id INTEGER"
        )

    conn.commit()
    conn.close()


def save_analysis(title, notes, concepts, relationships, summary, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO analysis_history
        (user_id, title, notes, concepts, relationships, summary)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        title,
        notes,
        concepts,
        relationships,
        summary
    ))

    conn.commit()
    conn.close()


def get_all_history(user_id=None):
    conn = get_connection()
    cursor = conn.cursor()

    if user_id is None:
        cursor.execute("""
            SELECT * FROM analysis_history
            ORDER BY created_at DESC
        """)
    else:
        cursor.execute("""
            SELECT * FROM analysis_history
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))

    records = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return records
