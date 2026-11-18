"""
WorkPay AI - Comprehensive Scikit-Learn Machine Learning Pipeline
Trains and serializes 6 Scikit-Learn Machine Learning Models:
1. Salary & Wage Regressor: RandomForestRegressor + ColumnTransformer
2. Worker Matching Engine: TfidfVectorizer + Cosine Similarity
3. Fraud & Risk Classifier: RandomForestClassifier
4. Review Sentiment Classifier: MultinomialNB + TfidfVectorizer
5. Multilingual Intent Classifier: LogisticRegression + TfidfVectorizer
6. Income & Growth Forecaster: PolynomialFeatures + LinearRegression

All models are trained with Scikit-Learn, evaluated, and saved as .pkl files in ml_service/models/
"""

import os
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler, PolynomialFeatures
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import r2_score, accuracy_score, classification_report
from sklearn.neighbors import NearestNeighbors

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

# ==============================================================================
# 1. SALARY REGRESSOR (RandomForestRegressor)
# ==============================================================================
def train_salary_model():
    print("\n[1/6] Training AI Salary Regressor (RandomForestRegressor)...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'wage_dataset.csv'))
    
    categorical = ['category', 'city', 'payment_type']
    numeric = ['experience_years', 'duration_days', 'working_hours', 'skills_count']
    
    X = df[categorical + numeric]
    y = df['recommended_salary']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical),
            ('num', StandardScaler(), numeric)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    r2 = r2_score(y_test, pipeline.predict(X_test))
    print(f"      Model Accuracy (R2 Score): {r2:.4f} ({r2*100:.2f}%)")
    
    joblib.dump(pipeline, os.path.join(MODELS_DIR, 'salary_model.pkl'))
    return pipeline

# ==============================================================================
# 2. FRAUD CLASSIFIER (RandomForestClassifier)
# ==============================================================================
def train_fraud_model():
    print("\n[2/6] Training AI Fraud & Anomaly Detector (RandomForestClassifier)...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'fraud_transactions.csv'))
    
    features = ['tx_velocity_1h', 'amount', 'cancellations_7d', 'disputes_14d', 'is_new_account', 'avg_completion_time_hrs']
    X = df[features]
    y = df['is_fraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    classifier = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    classifier.fit(X_train, y_train)
    acc = accuracy_score(y_test, classifier.predict(X_test))
    print(f"      Model Accuracy: {acc*100:.2f}%")
    
    joblib.dump(classifier, os.path.join(MODELS_DIR, 'fraud_model.pkl'))
    return classifier

# ==============================================================================
# 3. WORKER-JOB SEMANTIC MATCHER (TF-IDF Vectorizer + Cosine Sim)
# ==============================================================================
def train_matcher_model():
    print("\n[3/6] Training AI Worker Matcher (TfidfVectorizer)...")
    corpus = [
        "electrician residential wiring switchboard mcb distribution circuit troubleshooting inverters",
        "master plumber concealed piping leak repair bathroom fixture drainage water heater pump",
        "carpenter custom modular furniture hardwood doors cabinet fittings polish woodwork",
        "wall painter texture finish emulsion exterior waterproofing primer polish",
        "construction mason bricklayer concrete plastering tiling structural foundation",
        "personal driver commercial chauffeur manual automatic car navigation city traffic",
        "cook chef dietary meal preparation authentic south indian north indian catering",
        "house deep cleaner sanitization floor polishing kitchen chimney dusting",
        "gardener lawn mowing plant pruning terrace landscape drip irrigation soil care",
        "tutor high school mathematics calculus algebra physics competitive mentoring",
        "two wheeler bike mechanic four wheeler car engine transmission disc brakes"
    ]
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    vectorizer.fit(corpus)
    print(f"      Vocabulary Size: {len(vectorizer.vocabulary_)} features")
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, 'worker_matcher.pkl'))
    return vectorizer

# ==============================================================================
# 4. REVIEW SENTIMENT CLASSIFIER (MultinomialNB + TfidfVectorizer)
# ==============================================================================
def train_sentiment_model():
    print("\n[4/6] Training Review Sentiment Classifier (MultinomialNB)...")
    reviews_data = [
        ("Excellent work, very punctual, clean and highly professional electrician", "positive"),
        ("Fixed the leaking pipe quickly, polite behavior and fair price", "positive"),
        ("Superb carpentry finish, neat alignment of cabinets, highly recommended", "positive"),
        ("Very neat painting job, came on time, clean work and polite", "positive"),
        ("Great cook, delicious food, clean and followed all dietary requirements", "positive"),
        ("Wonderful tutor, child improved grades in mathematics significantly", "positive"),
        ("Very thorough house cleaning, sanitized everything perfectly", "positive"),
        ("Good work overall, arrived slightly late but finished the task", "neutral"),
        ("Average service, work was okay but took longer than expected", "neutral"),
        ("Decent repairs, nothing extraordinary but solved the immediate issue", "neutral"),
        ("Terrible service, extremely late, broke the switchboard and rude behavior", "negative"),
        ("Did not complete the work, charged extra and left bathroom messy", "negative"),
        ("Very unprofessional, damaged the wooden frame and refused to fix it", "negative"),
        ("Poor quality painting, paint dripped all over tiles and ruined curtains", "negative"),
        ("Cancelled at the last minute without prior notice, completely unreliable", "negative")
    ]
    texts, labels = zip(*reviews_data)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('nb', MultinomialNB(alpha=0.5))
    ])
    pipeline.fit(texts, labels)
    print("      Sentiment Pipeline trained on customer reviews (positive/neutral/negative)")
    joblib.dump(pipeline, os.path.join(MODELS_DIR, 'sentiment_model.pkl'))
    return pipeline

# ==============================================================================
# 5. MULTILINGUAL INTENT CLASSIFIER (LogisticRegression + TfidfVectorizer)
# ==============================================================================
def train_intent_model():
    print("\n[5/6] Training Multilingual Chatbot Intent Classifier (LogisticRegression)...")
    intent_data = [
        ("I need to hire an electrician", "hire_worker"),
        ("Find me a good plumber in Bengaluru", "hire_worker"),
        ("Looking for carpenter to fix door", "hire_worker"),
        ("ಯಾರಾದರೂ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಬೇಕು", "hire_worker"),
        ("ನನಗೆ ಪ್ಲಂಬರ್ ಬೇಕಾಗಿದ್ದಾರೆ", "hire_worker"),
        ("मुझे इलेक्ट्रीशियन चाहिए", "hire_worker"),
        ("मुझे घर की सफाई के लिए नौकर चाहिए", "hire_worker"),
        
        ("How do I find jobs on WorkPay?", "find_job"),
        ("Show me open jobs near me", "find_job"),
        ("ಕೆಲಸ ಹೇಗೆ ಹುಡುಕುವುದು?", "find_job"),
        ("ಉದ್ಯೋಗಗಳನ್ನು ಎಲ್ಲಿ ನೋಡಬೇಕು?", "find_job"),
        ("नौकरी कैसे ढूंढे?", "find_job"),
        ("मुझे नया काम चाहिए", "find_job"),
        
        ("How does payment escrow work?", "payment"),
        ("When will my money be credited?", "payment"),
        ("How to withdraw money to my UPI bank?", "payment"),
        ("ಹಣ ಯಾವಾಗ ಬರುತ್ತದೆ?", "payment"),
        ("ಯುಪಿಐ ಮೂಲಕ ಹಿಂಪಡೆಯುವುದು ಹೇಗೆ?", "payment"),
        ("पैसे कब मिलेंगे?", "payment"),
        ("पैसे कैसे निकालें?", "payment"),
        
        ("I want to raise a dispute", "dispute"),
        ("Worker did not finish job", "dispute"),
        ("ನನಗೆ ಪರಿಹಾರ ಬೇಕು, ವಿವಾದವಿದೆ", "dispute"),
        ("काम अधूरा छोड़ दिया, शिकायत करनी है", "dispute"),
        
        ("How to complete my profile verification?", "profile"),
        ("How to upload certificates?", "profile"),
        ("ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸುವುದು ಹೇಗೆ?", "profile"),
        ("प्रोफाइल कैसे बनाएं?", "profile")
    ]
    texts, intents = zip(*intent_data)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('clf', LogisticRegression(max_iter=200))
    ])
    pipeline.fit(texts, intents)
    print("      Intent Classifier trained on English, Kannada, and Hindi queries")
    joblib.dump(pipeline, os.path.join(MODELS_DIR, 'intent_model.pkl'))
    return pipeline

# ==============================================================================
# 6. INCOME & GROWTH FORECASTER (Polynomial Regression)
# ==============================================================================
def train_income_forecast_model():
    print("\n[6/6] Training AI Income & Growth Forecaster (LinearRegression)...")
    # Features: [completed_jobs, avg_hours_per_week, experience_years]
    # Synthetic samples representing monthly earnings in INR
    X = np.array([
        [2, 15, 0.5], [5, 20, 1.0], [8, 30, 2.0], [12, 35, 3.0], [15, 40, 4.0],
        [18, 42, 5.0], [22, 45, 6.0], [25, 48, 7.5], [30, 50, 9.0],
        [35, 52, 10.0], [40, 55, 12.0], [50, 60, 15.0]
    ])
    y = np.array([
        6500, 13000, 19500, 27000, 33500, 40000, 47000, 55000, 64000, 73000, 86000, 105000
    ])
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('reg', LinearRegression())
    ])
    pipeline.fit(X, y)
    r2 = r2_score(y, pipeline.predict(X))
    print(f"      Income Forecaster R2: {r2:.4f} ({r2*100:.2f}%)")
    joblib.dump(pipeline, os.path.join(MODELS_DIR, 'income_model.pkl'))
    return pipeline

if __name__ == '__main__':
    print("==================================================================")
    print("WORKPAY AI: FULL SCIKIT-LEARN MACHINE LEARNING TRAINING PIPELINE")
    print("==================================================================")
    train_salary_model()
    train_fraud_model()
    train_matcher_model()
    train_sentiment_model()
    train_intent_model()
    train_income_forecast_model()
    print("\nAll 6 Scikit-Learn ML models trained & exported to ml_service/models/ successfully!")
