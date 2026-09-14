import pandas as pd
from normalize_sql import normalize_sql
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# 1. Load both datasets and map them to the same training format
# RBSQLI dataset: uses sql_query + vulnerability_status
rb_df = pd.read_csv(
    "RBSQLI/rbsqli_dataset.csv",
    usecols=["sql_query", "vulnerability_status"],
    nrows=500000
)

rb_df = rb_df.dropna(subset=["sql_query", "vulnerability_status"]).copy()
rb_df["sql_query"] = rb_df["sql_query"].fillna("").astype(str).apply(normalize_sql)
rb_df["vulnerability_status"] = rb_df["vulnerability_status"].astype(str).str.strip().str.lower()
rb_df = rb_df[rb_df["vulnerability_status"].isin(["yes", "no"])]
rb_df["Label"] = (rb_df["vulnerability_status"] == "yes").astype(int)

# Extra JSON-derived dataset: uses sql_query + Label
extra_df = pd.read_csv("extra_sqli_dataset.csv")
extra_df = extra_df.dropna(subset=["sql_query", "Label"]).copy()
extra_df["sql_query"] = extra_df["sql_query"].fillna("").astype(str).apply(normalize_sql)
extra_df["Label"] = extra_df["Label"].astype(int)

# Combine both datasets
combined_df = pd.concat([rb_df[["sql_query", "Label"]], extra_df[["sql_query", "Label"]]], ignore_index=True)

X = combined_df["sql_query"]
y = combined_df["Label"]

# 2. Split data BEFORE feature extraction
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

# 3. Create TF-IDF vectorizer
vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    min_df=2
)

# 4. Fit ONLY on training data
X_train_tfidf = vectorizer.fit_transform(X_train)

# Transform test data using the trained vectorizer
X_test_tfidf = vectorizer.transform(X_test)

print("\nNumber of TF-IDF features:",
      len(vectorizer.get_feature_names_out()))

# 5. Train Random Forest
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

print("\nTraining Random Forest model...")
model.fit(X_train_tfidf, y_train)

# 6. Make predictions
y_pred = model.predict(X_test_tfidf)

# 7. Evaluate
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\n" + "=" * 50)
print("RANDOM FOREST PERFORMANCE")
print("=" * 50)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1-score : {f1:.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# 8. Save model and vectorizer
import joblib

joblib.dump(model, "random_forest_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer_rf.pkl")

print("\nRandom Forest model saved to: random_forest_model.pkl")
print("TF-IDF vectorizer saved to: tfidf_vectorizer_rf.pkl")
