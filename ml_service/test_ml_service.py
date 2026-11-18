"""
Unit Test Script for WorkPay AI Python ML Service
Uses FastAPI TestClient to verify all 6 Scikit-Learn model inferences.
"""

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    print("1. Health Check:", data["status"])
    print("   Models loaded:", data["models_loaded"])
    assert all(data["models_loaded"].values()) is True

def test_salary_prediction():
    payload = {
        "category": "electrician",
        "experience_years": 5.0,
        "city": "bengaluru",
        "payment_type": "per_job",
        "duration_days": 1,
        "working_hours": 8,
        "skills_count": 3
    }
    res = client.post("/predict-salary", json=payload)
    assert res.status_code == 200
    data = res.json()
    print("2. Salary Regressor (RandomForestRegressor):", data["prediction"]["recommendedSalary"], "INR")
    assert data["prediction"]["recommendedSalary"] > 500

def test_worker_matching():
    payload = {
        "job_title": "Emergency MCB distribution box repair",
        "job_description": "Need an experienced electrician for residential short circuit fixing",
        "required_skills": "wiring, mcb, circuit",
        "location": "Bengaluru",
        "budget": 1200.0,
        "workers": [
            {
                "id": 1,
                "full_name": "Ramesh Kumar",
                "skills_text": "licensed electrician residential wiring mcb circuit troubleshooting inverters",
                "experience_years": 7.5,
                "rating_avg": 4.9,
                "preferred_location": "Bengaluru",
                "expected_salary": 650.0
            },
            {
                "id": 2,
                "full_name": "Suresh Gowda",
                "skills_text": "master plumber pipe repairs water leakage drainage",
                "experience_years": 6.0,
                "rating_avg": 4.8,
                "preferred_location": "Bengaluru",
                "expected_salary": 600.0
            }
        ]
    }
    res = client.post("/match-workers", json=payload)
    assert res.status_code == 200
    data = res.json()
    print("3. Worker Matcher (TF-IDF + Cosine): Top match =", data["matches"][0]["full_name"], f"({data['matches'][0]['match_score']}%)")
    assert data["matches"][0]["full_name"] == "Ramesh Kumar"

def test_fraud_detection():
    payload = {
        "tx_velocity_1h": 6,
        "amount": 25000.0,
        "cancellations_7d": 4,
        "disputes_14d": 3,
        "is_new_account": 1,
        "avg_completion_time_hrs": 0.2
    }
    res = client.post("/detect-fraud", json=payload)
    assert res.status_code == 200
    data = res.json()
    print("4. Fraud Classifier (RandomForestClassifier): Risk Score =", data["evaluation"]["risk_score"])
    assert data["evaluation"]["is_suspicious"] is True

def test_sentiment_analysis():
    payload = {
        "review_text": "Ramesh did an outstanding job, fixed the circuit quickly and cleanly. Highly recommended!"
    }
    res = client.post("/analyze-sentiment", json=payload)
    assert res.status_code == 200
    data = res.json()
    print("5. Sentiment Classifier (MultinomialNB):", data["sentiment"], f"(confidence: {data['confidence']})")
    assert data["sentiment"].lower() == "positive"

def test_intent_classification():
    payload = {
        "query": "ಯಾರಾದರೂ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಬೇಕು (Need an electrician)"
    }
    res = client.post("/classify-intent", json=payload)
    assert res.status_code == 200
    data = res.json()
    print("6. Intent Classifier (LogisticRegression):", data["intent"], f"(confidence: {data['confidence']})")
    assert data["intent"] == "hire_worker"

def test_income_forecast():
    payload = {
        "completed_jobs": 25,
        "avg_hours_per_week": 45.0,
        "experience_years": 6.0,
        "current_wallet_balance": 8500.0
    }
    res = client.post("/forecast-income", json=payload)
    assert res.status_code == 200
    data = res.json()
    print("7. Income Forecaster (Polynomial Regression):", data["forecast"]["predicted_monthly_earnings"], "INR / month")
    assert data["forecast"]["predicted_monthly_earnings"] > 20000

if __name__ == '__main__':
    print("==========================================================")
    print("RUNNING ALL 6 SCIKIT-LEARN ML SERVICE INFERENCE TESTS")
    print("==========================================================")
    test_health()
    test_salary_prediction()
    test_worker_matching()
    test_fraud_detection()
    test_sentiment_analysis()
    test_intent_classification()
    test_income_forecast()
    print("\nALL 6 Scikit-Learn models passed 100%!")
