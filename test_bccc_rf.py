import pandas as pd
import joblib
from normalize_sql import normalize_sql

# Load trained model and vectorizer
model = joblib.load("random_forest_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer_rf.pkl")

# Load BCCC dataset
file = "DATASET/BCCC-SFU-SQLInj-2023.csv"
df = pd.read_csv(file)

# Normalize SQL queries
queries = df["Data"].fillna("").astype(str).apply(normalize_sql)

# Convert queries into TF-IDF features
X_bccc = vectorizer.transform(queries)

# Predict
predictions = model.predict(X_bccc)

# Calculate detection rate
detected = (predictions == 1).sum()
total = len(queries)

detection_rate = detected / total * 100

print("=" * 50)
print("INDEPENDENT BCCC EVALUATION - RANDOM FOREST")
print("=" * 50)

print("Total BCCC queries:", total)
print("Detected as SQL Injection:", detected)
print("Not detected:", total - detected)

print(f"Detection Rate: {detection_rate:.2f}%")
