import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Load SQLiV3
df = pd.read_csv("dataset/SQLiV3_final.csv")

X = df["Sentence"]
y = df["Label"]

# Same split used previously
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# TF-IDF
vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    min_df=2
)

X_train_tfidf = vectorizer.fit_transform(X_train)

# Train model
model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

model.fit(X_train_tfidf, y_train)

# Save model and vectorizer
joblib.dump(model, "logistic_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("Model saved as: logistic_model.pkl")
print("Vectorizer saved as: tfidf_vectorizer.pkl")