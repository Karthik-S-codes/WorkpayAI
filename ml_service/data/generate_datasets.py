"""
Dataset Generator for WorkPay AI
Generates realistic Indian gig-economy datasets for:
1. Wage & Salary Prediction (1,200 samples)
2. Worker Matching (Skills & Experience profiles)
3. Fraud & Risk Detection (Transactions & Behavior)
"""

import os
import csv
import random

os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

CATEGORIES = [
    'electrician', 'plumber', 'carpenter', 'painter',
    'construction-mason', 'driver', 'cook-chef', 'house-cleaner',
    'gardener', 'babysitter', 'security-guard', 'teacher-tutor',
    'mechanic', 'delivery-worker'
]

BASE_RATES = {
    'electrician': 850,
    'plumber': 800,
    'carpenter': 950,
    'painter': 750,
    'construction-mason': 850,
    'driver': 700,
    'cook-chef': 800,
    'house-cleaner': 600,
    'gardener': 650,
    'babysitter': 750,
    'security-guard': 600,
    'teacher-tutor': 1200,
    'mechanic': 850,
    'delivery-worker': 550
}

CITIES = {
    'bengaluru': 1.15,
    'mumbai': 1.25,
    'delhi': 1.20,
    'hyderabad': 1.10,
    'chennai': 1.10,
    'pune': 1.10,
    'mysuru': 0.90,
    'hubballi': 0.85
}

# 1. GENERATE WAGE DATASET
wage_file = os.path.join(os.path.dirname(__file__), 'wage_dataset.csv')
with open(wage_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'category', 'experience_years', 'city', 'payment_type',
        'duration_days', 'working_hours', 'skills_count', 'recommended_salary'
    ])
    
    random.seed(42)
    for _ in range(1500):
        cat = random.choice(CATEGORIES)
        exp = round(random.uniform(0.5, 20.0), 1)
        city = random.choice(list(CITIES.keys()))
        ptype = random.choice(['daily', 'per_job', 'hourly'])
        days = random.randint(1, 14) if ptype == 'per_job' else 1
        hours = random.choice([4, 6, 8, 10])
        skills_cnt = random.randint(1, 6)
        
        base = BASE_RATES[cat]
        city_weight = CITIES[city]
        
        # Experience curve (logarithmic diminishing return)
        exp_factor = 1.0 + (exp * 0.05)
        
        if ptype == 'daily':
            daily_wage = base * city_weight * exp_factor
            # Small random market noise
            final_wage = round(daily_wage + random.gauss(0, 30))
        elif ptype == 'hourly':
            hourly_wage = (base / 8.0) * city_weight * exp_factor
            final_wage = round(hourly_wage + random.gauss(0, 10))
        else: # per_job
            job_wage = base * city_weight * exp_factor * days * (hours / 8.0) * (1.0 + skills_cnt * 0.04)
            final_wage = round(job_wage + random.gauss(0, 75))
            
        writer.writerow([cat, exp, city, ptype, days, hours, skills_cnt, max(200, final_wage)])

print(f"Generated {wage_file} with 1500 records.")

# 2. GENERATE FRAUD TRANSACTIONS DATASET
fraud_file = os.path.join(os.path.dirname(__file__), 'fraud_transactions.csv')
with open(fraud_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'tx_velocity_1h', 'amount', 'cancellations_7d', 'disputes_14d',
        'is_new_account', 'avg_completion_time_hrs', 'is_fraud'
    ])
    
    for _ in range(1000):
        is_fraud = 1 if random.random() < 0.12 else 0
        if is_fraud:
            velocity = random.randint(4, 15)
            amount = round(random.uniform(5000, 45000), 2)
            cancellations = random.randint(3, 10)
            disputes = random.randint(2, 6)
            is_new = random.choice([1, 1, 0])
            comp_time = round(random.uniform(0.1, 0.5), 1)
        else:
            velocity = random.randint(0, 3)
            amount = round(random.uniform(300, 8000), 2)
            cancellations = random.randint(0, 2)
            disputes = random.randint(0, 1)
            is_new = random.choice([0, 0, 1])
            comp_time = round(random.uniform(2.0, 48.0), 1)
            
        writer.writerow([velocity, amount, cancellations, disputes, is_new, comp_time, is_fraud])

print(f"Generated {fraud_file} with 1000 records.")

