import pandas as pd
import re

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

# Load dataset
df = pd.read_csv("dataset/SQLiV3_final.csv")

X = df["Sentence"]
y = df["Label"]

# Use the exact same test split as the ML model
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Conventional SQL injection signatures
patterns = [
    r"\bunion\s+(all\s+)?select\b",
    r"\bor\s+1\s*=\s*1\b",
    r"\band\s+1\s*=\s*1\b",
    r"'\s*or\s*'",
    r"'\s*and\s*'",
    r"--",
    r"/\*",
    r"\*/",
    r"\bxp_cmdshell\b",
    r"\bwaitfor\s+delay\b",
    r"\bpg_sleep\s*\(",
    r"\bsleep\s*\(",
    r"\bbenchmark\s*\(",
    r"\bdrop\s+table\b",
    r"\binsert\s+into\b",
    r"\bdelete\s+from\b",
    r"\bexec(ute)?\s+",
]

compiled_patterns = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in patterns
]


def detect_sqli(query):
    query = str(query)

    for pattern in compiled_patterns:
        if pattern.search(query):
            return 1

    return 0


# Apply rules to test queries
y_pred = X_test.apply(detect_sqli)

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred, zero_division=0)
f1 = f1_score(y_test, y_pred, zero_division=0)

cm = confusion_matrix(y_test, y_pred)

print("=" * 50)
print("RULE-BASED SQL INJECTION DETECTOR")
print("=" * 50)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1-score : {f1:.4f}")

print("\nConfusion Matrix:")
print(cm)

tn, fp, fn, tp = cm.ravel()

fpr = fp / (fp + tn)
fnr = fn / (fn + tp)

print(f"\nFalse Positive Rate: {fpr:.4f}")
print(f"False Negative Rate: {fnr:.4f}")