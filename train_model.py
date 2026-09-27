"""
SentriAI — Model Training Pipeline
-----------------------------------
Trains the production Character TF-IDF + Random Forest model.

Datasets:
- RBSQLI/rbsqli_dataset.csv (default: first 500,000 samples)
- extra_sqli_dataset.csv (default: 111 samples)

Outputs:
- random_forest_model.pkl
- tfidf_vectorizer_rf.pkl
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split

from normalize_sql import normalize_sql

BASE_DIR = Path(__file__).resolve().parent
ENV_DATASET_DIR = os.environ.get("SENTRIAI_DATASET_DIR")


def parse_args():
    parser = argparse.ArgumentParser(description="Train SentriAI SQL Injection Detection Model.")
    parser.add_argument(
        "--dataset-dir",
        type=Path,
        default=Path(ENV_DATASET_DIR) if ENV_DATASET_DIR else None,
        required=ENV_DATASET_DIR is None,
        help="Path to external directory containing RBSQLI and extra_sqli_dataset.csv (or set SENTRIAI_DATASET_DIR env var)",
    )
    parser.add_argument(
        "--rbsqli-rows",
        type=int,
        default=500000,
        help="Number of rows to load from RBSQLI (default: 500000)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=BASE_DIR,
        help="Directory to save model artifacts (default: workspace root)",
    )
    parser.add_argument(
        "--overwrite-production",
        action="store_true",
        help="Explicitly allow overwriting production random_forest_model.pkl and tfidf_vectorizer_rf.pkl",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)",
    )
    return parser.parse_args()


def load_training_data(dataset_dir: Path, rbsqli_rows: int) -> tuple[pd.Series, pd.Series]:
    rb_path = dataset_dir / "RBSQLI" / "rbsqli_dataset.csv"
    if not rb_path.exists():
        # Fallback to local RBSQLI if present
        rb_path = dataset_dir / "rbsqli_dataset.csv"

    extra_path = dataset_dir / "extra_sqli_dataset.csv"

    if not rb_path.exists():
        raise FileNotFoundError(f"RBSQLI dataset not found at: {rb_path}")
    if not extra_path.exists():
        raise FileNotFoundError(f"Extra SQLi dataset not found at: {extra_path}")

    print(f"Loading RBSQLI from {rb_path} (nrows={rbsqli_rows})...")
    rb_df = pd.read_csv(
        rb_path,
        usecols=["sql_query", "vulnerability_status"],
        nrows=rbsqli_rows,
    )
    rb_df = rb_df.dropna(subset=["sql_query", "vulnerability_status"]).copy()
    rb_df["sql_query"] = rb_df["sql_query"].astype(str).apply(normalize_sql)
    rb_df["vulnerability_status"] = (
        rb_df["vulnerability_status"].astype(str).str.strip().str.lower()
    )
    rb_df = rb_df[rb_df["vulnerability_status"].isin(["yes", "no"])]
    rb_df["Label"] = (rb_df["vulnerability_status"] == "yes").astype(int)

    print(f"Loading extra dataset from {extra_path}...")
    extra_df = pd.read_csv(extra_path)
    extra_df = extra_df.dropna(subset=["sql_query", "Label"]).copy()
    extra_df["sql_query"] = extra_df["sql_query"].astype(str).apply(normalize_sql)
    extra_df["Label"] = extra_df["Label"].astype(int)

    combined_df = pd.concat(
        [rb_df[["sql_query", "Label"]], extra_df[["sql_query", "Label"]]],
        ignore_index=True,
    )

    print(f"Total combined training rows: {len(combined_df)}")
    print(f"  Class 0 (Legitimate): {(combined_df['Label'] == 0).sum()}")
    print(f"  Class 1 (Attack)    : {(combined_df['Label'] == 1).sum()}")

    return combined_df["sql_query"], combined_df["Label"]


def main():
    args = parse_args()

    X, y = load_training_data(args.dataset_dir, args.rbsqli_rows)

    print("\nSplitting data (80% train / 20% test split, stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=args.seed,
        stratify=y,
    )

    print("Fitting Character TF-IDF Vectorizer (ngram_range=(2,5), min_df=2)...")
    vectorizer = TfidfVectorizer(
        analyzer="char",
        ngram_range=(2, 5),
        min_df=2,
        lowercase=True,
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    print(f"TF-IDF vocabulary size: {len(vectorizer.get_feature_names_out())}")

    print("Training Random Forest Classifier (200 estimators, n_jobs=-1)...")
    model = RandomForestClassifier(
        n_estimators=200,
        random_state=args.seed,
        n_jobs=-1,
    )
    model.fit(X_train_tfidf, y_train)

    print("Evaluating on test split...")
    y_pred = model.predict(X_test_tfidf)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    print("\n" + "=" * 50)
    print("RANDOM FOREST TRAINING EVALUATION")
    print("=" * 50)
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1-score : {f1:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    model_filename = "random_forest_model.pkl"
    vec_filename = "tfidf_vectorizer_rf.pkl"

    if (args.output_dir / model_filename).exists() and not args.overwrite_production:
        print("\n[SAFETY NOTICE] Production artifacts already exist in output directory.")
        print("To overwrite production models, pass '--overwrite-production'.")
        print("Saving retrained artifacts as '_retrained.pkl' to prevent accidental replacement.")
        model_filename = "random_forest_model_retrained.pkl"
        vec_filename = "tfidf_vectorizer_rf_retrained.pkl"

    model_path = args.output_dir / model_filename
    vec_path = args.output_dir / vec_filename

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)
    print(f"\nModel saved to: {model_path}")
    print(f"Vectorizer saved to: {vec_path}")


if __name__ == "__main__":
    main()
