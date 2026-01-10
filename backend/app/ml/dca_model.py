import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import joblib
import os

# Dummy DCA data
def generate_dca_data(n=100):
    import numpy as np
    np.random.seed(42)
    data = {
        'recovery_rate': np.random.uniform(0.1, 1, n),
        'sla_compliance': np.random.uniform(0.5, 1, n),
        'closure_time': np.random.uniform(1, 60, n),
        'feedback_score': np.random.uniform(0.1, 1, n),
        'dps': np.random.uniform(0, 100, n)  # Target DPS
    }
    return pd.DataFrame(data)

# Train DCA model
def train_dca_model():
    df = generate_dca_data()
    X = df.drop('dps', axis=1)
    y = df['dps']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f"Model R2: {r2_score(y_test, y_pred):.2f}")
    
    joblib.dump(model, 'dca_model.pkl')
    return model

# Predict DPS
def predict_dps(dca_data):
    if not os.path.exists('dca_model.pkl'):
        train_dca_model()
    model = joblib.load('dca_model.pkl')
    df = pd.DataFrame([dca_data])
    return round(model.predict(df)[0], 2)

# Example
if __name__ == "__main__":
    train_dca_model()
    sample_dca = {'recovery_rate': 0.8, 'sla_compliance': 0.9, 'closure_time': 15, 'feedback_score': 0.85}
    print(f"DPS: {predict_dps(sample_dca)}")