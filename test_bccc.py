import pandas as pd
import joblib

# Load the trained model and TF-IDF vectorizer
model = joblib.load("logistic_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

# Load BCCC dataset
file = "dataset/BCCC-SFU-SQLInj-2023.csv"
df = pd.read_csv(file)

# SQL queries
queries = df["Data"].fillna("").astype(str)

# Convert using the ALREADY trained vectorizer
X_bccc = vectorizer.transform(queries)

# Predict
predictions = model.predict(X_bccc)

# Count detections
detected = (predictions == 1).sum()
total = len(queries)

detection_rate = detected / total * 100

print("=" * 50)
print("INDEPENDENT BCCC EVALUATION")
print("=" * 50)

print("Total BCCC queries:", total)
print("Detected as SQL Injection:", detected)
print("Not detected:", total - detected)
print(f"Detection Rate: {detection_rate:.2f}%")
