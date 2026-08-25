from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import requests
import json
import time
import bcrypt
from .database import *
from .risk_engine import calculate_risk
from .ml_engine import ml_anomaly_score
import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- USERS ----------------

default_users = [
("admin","admin123"),
("alice","alice123"),
("bob","bob123"),
("charlie","charlie123"),
("david","david123"),
("emma","emma123"),
("frank","frank123"),
("grace","grace123"),
("henry","henry123"),
("ivy","ivy123"),
("jack","jack123")
]

for u,p in default_users:
    if not get_user(u):
        hashed = bcrypt.hashpw(
            p.encode(),
            bcrypt.gensalt()
        ).decode()
        add_user(u, hashed)

# ---------------- SECURITY VARIABLES ----------------

failed_attempt_counter = {}

login_attempt_times = {}
blocked_users = {}

BLOCK_TIME = 300      # 5 minutes
BURST_WINDOW = 10     # seconds
MAX_BURST = 5


# ---------------- GEO LOCATION ----------------

def get_location(ip):
    try:
        res = requests.get(f"https://ipinfo.io/{ip}/json", timeout=2)
        data = res.json()

        city = data.get("city","Unknown")
        country = data.get("country","Unknown")

        return f"{city}, {country}"

    except:
        return "Unknown"


# ---------------- IP REPUTATION ----------------

def check_ip_reputation(ip):

    try:

        headers = {
            "Key": os.getenv("ABUSEIPDB_KEY"),
            "Accept": "application/json"
        }

        url = "https://api.abuseipdb.com/api/v2/check"

        params = {
            "ipAddress": ip,
            "maxAgeInDays": 90
        }

        res = requests.get(url, headers=headers, params=params, timeout=3)

        data = res.json()

        return data["data"]["abuseConfidenceScore"]

    except:
        return 0

def send_alert_email(username, message):

    admin_email = "ashwinsiva.2k6@gmail.com"

    user_emails = {
        "admin": "24pd11@psgtech.ac.in",
        "alice": "24pd04@psgtech.ac.in",
        "bob": "24pd04@psgtech.ac.in",
        "charlie": "24pd04@psgtech.ac.in",
        "david": "24pd04@psgtech.ac.in",
        "emma": "24pd11@psgtech.ac.in",
        "frank": "24pd04@psgtech.ac.in",
        "grace": "24pd04@psgtech.ac.in",
        "henry": "24pd04@psgtech.ac.in",
        "ivy": "24pd04@psgtech.ac.in",
        "jack": "24pd04@psgtech.ac.in"
    }

    user_email = user_emails.get(username)

    from_email = "24pd11@psgtech.ac.in"

    app_password = os.getenv("EMAIL_PASS")

    subject = "🚨 SentinelX Security Alert"

    body = f"""
SentinelX Security Alert

User: {username}

{message}

Please verify this activity immediately.
"""

    msg = MIMEText(body)

    msg["Subject"] = subject
    msg["From"] = from_email

    try:

        server = smtplib.SMTP("smtp.gmail.com", 587)

        server.starttls()

        server.login(from_email, app_password)

        # send to user
        if user_email:

            msg["To"] = user_email

            server.sendmail(
                from_email,
                user_email,
                msg.as_string()
            )

        # send copy to admin
        if username != "admin":

            admin_msg = MIMEText(body)

            admin_msg["Subject"] = "[ADMIN COPY] SentinelX Security Alert"
            admin_msg["From"] = from_email
            admin_msg["To"] = admin_email

            server.sendmail(
                from_email,
                admin_email,
                admin_msg.as_string()
            )

        server.quit()

        print("Email alert sent")

    except Exception as e:
        print("Email failed:", e)
        
@app.post("/login")
async def login(request: Request):

    data = await request.json()
    username = data["username"]
    password = data["password"]

    ip = request.client.host
    location = get_location(ip)
    abuse_score = check_ip_reputation(ip)

    now = time.time()

    user = get_user(username)

    # ---------- UNKNOWN USER ----------

    if not user:

        risk = 20
        factors = [{"reason":"Unknown username attempt","score":20}]

        log_attempt(username, ip, location, "failed", risk, factors)

        return {
            "status":"failed",
            "message":"Username does not exist",
            "risk":risk,
            "factors":factors
        }

    # ---------- BLOCK CHECK ----------

    if username in blocked_users:

        if now < blocked_users[username]:

            remaining = int(blocked_users[username] - now)

            return {
                "status":"blocked",
                "message":f"Account locked for {remaining} seconds"
            }

        else:
            del blocked_users[username]

    # ---------- BURST ATTEMPT TRACKING ----------

    if username not in login_attempt_times:
        login_attempt_times[username] = []

    login_attempt_times[username].append(now)

    # keep only attempts in window
    login_attempt_times[username] = [
        t for t in login_attempt_times[username]
        if now - t <= BURST_WINDOW
    ]

    # ---------- BRUTE FORCE DETECTION ----------

    if len(login_attempt_times[username]) >= MAX_BURST:

        blocked_users[username] = now + BLOCK_TIME

        risk = 95
        factors = [{
            "reason":"Rapid login attempts detected (possible brute force)",
            "score":95
        }]
        send_alert_email(
    username,
    "Your account was temporarily locked due to rapid login attempts (possible brute force attack)."
)
        log_attempt(username, ip, location, "blocked", risk, factors)

        return {
            "status":"blocked",
            "message":"Account locked due to rapid login attempts",
            "risk":risk,
            "factors":factors
        }

    # ---------- PASSWORD SUCCESS ----------

    if bcrypt.checkpw(
    password.encode(),
    user[2].encode()
):

        risk = 0
        factors = []

        log_attempt(username, ip, location, "success", risk, factors)

        failed_attempt_counter[username] = 0

        role = "admin" if username == "admin" else "user"

        return {
            "status":"success",
            "role":role,
            "risk":risk,
            "factors":factors
        }

    # ---------- PASSWORD FAILED ----------

    failed_attempt_counter[username] = failed_attempt_counter.get(username,0) + 1

    risk, factors = calculate_risk(
        failed_attempt_counter[username],
        False,
        True,
        abuse_score
    )

    current_hour = datetime.now().hour

    ml_risk = 0
    ml_factor = None

    # run ML only for suspicious behaviour
    if failed_attempt_counter[username] >= 3:

        ml_risk, ml_factor = ml_anomaly_score(
            failed_attempt_counter[username],
            current_hour
        )

    risk += ml_risk

    if ml_factor:
        factors.append(ml_factor)

    log_attempt(username, ip, location, "failed", risk, factors)
    if risk >= 80:

        send_alert_email(
            username,
            f"""
    High risk login attempt detected.

    IP Address: {ip}
    Location: {location}
    Risk Score: {risk}
    Time: {datetime.now()}
    """
        )

    return {
        "status":"failed",
        "risk":risk,
        "factors":factors
    }


# ---------------- ADMIN LOGS ----------------

@app.get("/logs")
def logs():

    rows = get_logs()

    logs = []

    for r in rows:
        logs.append({
            "user": r[1],
            "ip": r[2],
            "location": r[3],
            "status": r[4],
            "risk": r[5],
            "factors": json.loads(r[6]),
            "time": r[7]
        })

    return logs


# ---------------- USER LOGS ----------------

@app.get("/user_logs/{username}")
def user_logs(username: str):

    rows = get_user_logs(username)

    logs = []

    for r in rows:
        logs.append({
            "user": r[1],
            "ip": r[2],
            "location": r[3],
            "status": r[4],
            "risk": r[5],
            "factors": json.loads(r[6]),
            "time": r[7]
        })

    return logs