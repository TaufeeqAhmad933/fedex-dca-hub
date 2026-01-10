import pandas as pd
from faker import Faker
import random

fake = Faker()

def get_dummy_cases(n=50):
    cases = []
    for i in range(n):
        # Force first 5 cases to have very high PPS (extreme values)
        if i < 5:
            account_age = random.randint(1, 5)  # Very low age
            payment_history = 1.0  # Perfect history
            amount_owed = random.randint(10, 100)  # Low amount
            shipment_frequency = random.randint(40, 50)  # High frequency
        else:
            account_age = random.randint(1, 365)
            payment_history = round(random.uniform(0, 1), 2)
            amount_owed = round(random.uniform(100, 10000), 2)
            shipment_frequency = random.randint(1, 50)
        
        case = {
            "id": i + 1,
            "name": fake.name(),  # Add customer name
            "account_age": account_age,
            "amount_owed": amount_owed,
            "payment_history": payment_history,
            "location": random.choice(["US", "EU", "Asia"]),
            "shipment_frequency": shipment_frequency,
            "pps": None,  # Calculated later
            "tier": None
        }
        cases.append(case)
    return cases

def get_dummy_dcas(n=10):
    dcas = []
    for i in range(n):
        # Force variety in DPS for tier mix
        if i < 3:  # First 3: High DPS for Tier 1
            recovery_rate = round(random.uniform(0.8, 1), 2)
            sla_compliance = round(random.uniform(0.8, 1), 2)
            closure_time = random.randint(1, 10)  # Low time
            feedback_score = round(random.uniform(0.8, 1), 2)
        elif i < 7:  # Next 4: Mid DPS for Tier 2
            recovery_rate = round(random.uniform(0.4, 0.7), 2)
            sla_compliance = round(random.uniform(0.5, 0.7), 2)
            closure_time = random.randint(20, 40)
            feedback_score = round(random.uniform(0.5, 0.7), 2)
        else:  # Last 3: Low DPS for Tier 3
            recovery_rate = round(random.uniform(0.1, 0.3), 2)
            sla_compliance = round(random.uniform(0.3, 0.5), 2)
            closure_time = random.randint(50, 60)  # High time
            feedback_score = round(random.uniform(0.1, 0.4), 2)
        
        dca = {
            "id": i + 1,
            "name": fake.company(),
            "recovery_rate": recovery_rate,
            "sla_compliance": sla_compliance,
            "closure_time": closure_time,
            "feedback_score": feedback_score,
            "dps": None,
            "tier": None
        }
        dcas.append(dca)
    return dcas