import sqlite3

conn = sqlite3.connect("students.db")

conn.execute("""
CREATE TABLE students(
name TEXT,
roll TEXT PRIMARY KEY,
scores TEXT,
total INTEGER,
percentage REAL,
grade TEXT
)
""")

conn.close()

print("Database created successfully")