import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Dummy data generation (if not using external)
def generate_dummy_data(n=1000):
    import numpy as np
    np.random.seed(42)
    data = {
        'account_age': np.random.randint(1, 365, n),
        'amount_owed': np.random.uniform(100, 10000, n),
        'payment_history': np.random.uniform(0, 1, n),  # 0-1 score
        'location': np.random.choice(['US', 'EU', 'Asia'], n),
        'shipment_frequency': np.random.randint(1, 50, n),
        'recovered': np.random.choice([0, 1], n)  # Target: 1 if recovered
    }
    return pd.DataFrame(data)

# Train PPS model
def train_pps_model():
    df = generate_dummy_data()
    X = df.drop('recovered', axis=1)
    X = pd.get_dummies(X, columns=['location'])  # Encode categorical
    y = df['recovered']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    
    joblib.dump(model, 'pps_model.pkl')
    return model

# Predict PPS for new case
def predict_pps(case_data):
    if not os.path.exists('pps_model.pkl'):
        train_pps_model()
    model = joblib.load('pps_model.pkl')
    # Preprocess case_data similarly
    df = pd.DataFrame([case_data])
    df = pd.get_dummies(df, columns=['location'])
    # Ensure columns match training data
    trained_cols = model.feature_names_in_
    for col in trained_cols:
        if col not in df.columns:
            df[col] = 0
    df = df[trained_cols]
    prob = model.predict_proba(df)[0][1] * 100  # Probability of recovery
    return round(prob, 2)

# Example usage
if __name__ == "__main__":
    train_pps_model()
    sample_case = {'account_age': 30, 'amount_owed': 500, 'payment_history': 0.8, 'location': 'US', 'shipment_frequency': 10}
    print(f"PPS: {predict_pps(sample_case)}%")