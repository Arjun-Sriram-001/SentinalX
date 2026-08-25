from sklearn.ensemble import IsolationForest
import numpy as np

# simple anomaly detection model
model = IsolationForest(contamination=0.1, random_state=42)

# dummy training data (normal login behaviour)
training_data = np.array([
    [0,10],
    [1,11],
    [0,12],
    [1,13],
    [0,14],
    [2,10],
    [1,9],
    [0,15],
])

model.fit(training_data)


def ml_anomaly_score(failed_attempts, login_hour):

    X = np.array([[failed_attempts, login_hour]])

    prediction = model.predict(X)

    if prediction[0] == -1:
        return 25, {"reason":"Unusual login behaviour pattern detected","score":25}

    return 0, None