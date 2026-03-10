import sqlite3

conn = sqlite3.connect("events.db")

conn.execute("""

CREATE TABLE participants(

id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
email TEXT,
phone TEXT,
event TEXT

)

""")

conn.close()

print("Database Created Successfully")