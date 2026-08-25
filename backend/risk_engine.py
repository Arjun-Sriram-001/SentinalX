def calculate_risk(failed_attempts, new_ip, location_unknown,abuse_score):

    risk = 0
    factors = []

    if failed_attempts >= 3:
        risk += 30
        factors.append({
            "reason": "Multiple failed login attempts",
            "score": 30
        })

    if failed_attempts >= 5:
        risk += 25
        factors.append({
            "reason": "High frequency login attempts",
            "score": 25
        })
    
    risk = 0
    factors = []

    if abuse_score > 50:
        risk += 40
        factors.append({
            "reason": "Malicious IP detected from AbuseIPDB",
            "score": 40
        })

    if location_unknown:
        risk += 5
        factors.append({
            "reason": "Location could not be verified",
            "score": 5
        })

    return risk, factors