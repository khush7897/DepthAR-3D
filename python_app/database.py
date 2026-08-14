import sqlite3
import os
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_name="depthar_mobile.db"):
        self.db_name = db_name
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_name)

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS models (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    image_path TEXT NOT NULL,
                    depth_scale REAL DEFAULT 1.0,
                    wireframe INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()

    def save_model(self, title, image_path, depth_scale=1.0, wireframe=0):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO models (title, image_path, depth_scale, wireframe, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (title, image_path, depth_scale, wireframe, datetime.now().isoformat()))
            conn.commit()
            return cursor.lastrowid

    def get_all_models(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, title, image_path, depth_scale, wireframe, created_at FROM models ORDER BY id DESC')
            rows = cursor.fetchall()
            return [
                {
                    'id': r[0],
                    'title': r[1],
                    'image_path': r[2],
                    'depth_scale': r[3],
                    'wireframe': bool(r[4]),
                    'created_at': r[5]
                }
                for r in rows
            ]

    def delete_model(self, model_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM models WHERE id = ?', (model_id,))
            conn.commit()
