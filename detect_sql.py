from functools import lru_cache
from pathlib import Path

import joblib

from normalize_sql import normalize_sql

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "random_forest_model.pkl"
VECTORIZER_PATH = BASE_DIR / "tfidf_vectorizer_rf.pkl"
MAX_QUERY_LENGTH = 10000


@lru_cache(maxsize=1)
def load_artifacts():
    """Load the trained model and vectorizer once and cache them."""
    if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
        raise FileNotFoundError(
            "Model artifacts not found. Expected 'random_forest_model.pkl' and "
            "'tfidf_vectorizer_rf.pkl' in the workspace root."
        )

    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    return model, vectorizer


def validate_query(query):
    """Validate and normalize the user-provided SQL string."""
    if query is None:
        raise ValueError("Query input is required.")

    if not isinstance(query, str):
        raise ValueError("Query must be a string.")

    query = query.strip()

    if not query:
        raise ValueError("Query input cannot be empty.")

    if len(query) > MAX_QUERY_LENGTH:
        raise ValueError(
            f"Query must be {MAX_QUERY_LENGTH} characters or fewer."
        )

    return query


def has_obvious_sql_injection(query):
    q = query.lower()

    obvious_patterns = [
        "or 1=1",
        "or '1'='1'",
        "or \"1\"=\"1\"",
        "union select",
        "--",
        "/*",
        "*/",
        "drop table",
        "sleep(",
        "benchmark(",
        "waitfor delay",
        "information_schema",
        "char(",
        "concat(",
    ]

    return any(pattern in q for pattern in obvious_patterns)


def detect_sql_injection(query):
    """Detect SQL injection using the trained random forest model."""
    query = validate_query(query)
    normalized_query = normalize_sql(query)

    if has_obvious_sql_injection(normalized_query):
        return "SQL INJECTION DETECTED", 99.99

    model, vectorizer = load_artifacts()

    features = vectorizer.transform([normalized_query])
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = max(probabilities) * 100

    if prediction == 1:
        return "SQL INJECTION DETECTED", confidence

    return "LEGITIMATE QUERY", confidence


def run_interactive_cli():
    print("=" * 60)
    print("AI-BASED SQL INJECTION DETECTION SYSTEM")
    print("=" * 60)
    print("Type a query to analyze it.")
    print("Type 'exit' to stop.")
    print()

    while True:
        query = input("Enter SQL query: ")

        if query is not None and query.lower() == "exit":
            print("System stopped.")
            break

        try:
            result, confidence = detect_sql_injection(query)
        except ValueError as exc:
            print(f"Invalid input: {exc}")
            print("-" * 60)
            continue
        except FileNotFoundError as exc:
            print(f"Backend error: {exc}")
            print("-" * 60)
            break

        print()
        print("Prediction :", result)
        print(f"Confidence : {confidence:.2f}%")
        print("-" * 60)


if __name__ == "__main__":
    run_interactive_cli()