import sqlite3
import json
conn = sqlite3.connect("sentinelx.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS login_logs(
    id INTEGER PRIMARY KEY,
    username TEXT,
    ip TEXT,
    location TEXT,
    status TEXT,
    risk_score INTEGER,
        factors TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP    
)
""")

conn.commit()

def add_user(username, password):
    cursor.execute("INSERT INTO users(username,password) VALUES(?,?)",(username,password))
    conn.commit()

def get_user(username):
    cursor.execute("SELECT * FROM users WHERE username=?",(username,))
    return cursor.fetchone()


from datetime import datetime

def log_attempt(username, ip, location, status, risk_score, factors):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        "INSERT INTO login_logs(username,ip,location,status,risk_score,factors,timestamp) VALUES(?,?,?,?,?,?,?)",
        (username,ip,location,status,risk_score,json.dumps(factors),timestamp)
    )

    conn.commit()

    conn.commit()
def get_logs():
    cursor.execute("SELECT * FROM login_logs ORDER BY risk_score DESC, timestamp DESC")
    return cursor.fetchall()

def get_user_logs(username):
    cursor.execute(
        "SELECT * FROM login_logs WHERE username=? ORDER BY timestamp DESC",
        (username,)
    )
    return cursor.fetchall()