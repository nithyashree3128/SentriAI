import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# 1. Load dataset
df = pd.read_csv("dataset/SQLiV3_final.csv")

X = df["Sentence"]
y = df["Label"]

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

# 5. Train Logistic Regression
model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

print("\nTraining Logistic Regression model...")
model.fit(X_train_tfidf, y_train)

# 6. Make predictions
y_pred = model.predict(X_test_tfidf)

# 7. Evaluate
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\n" + "=" * 50)
print("MODEL PERFORMANCE")
print("=" * 50)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1-score : {f1:.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))