# SentriAI — AI-Based SQL Injection Detection and Prevention

SentriAI is an intelligent, high-throughput security pipeline designed to detect and prevent SQL injection (SQLi) attacks. It pairs context-aware deterministic syntax inspection with character n-gram machine learning to analyze incoming SQL queries in real time.

---

## 1. Detection Architecture & Flow

Incoming queries are processed through a two-stage hybrid pipeline:

```text
               Raw User Input / SQL Query
                          │
                          ▼
            Input Validation & Length Gate
                          │
                          ▼
        Normalization (normalize_sql.py)
        - URL decoding (unquote)
        - Whitespace / newline collapsing
                          │
                          ▼
      Context-Aware Deterministic Rules (detect_sql.py)
      - Scans outside string literals only
      - Overt comment terminations (-- , #, /* ... */)
      - Tautology & function execution injection
            │                           │
    [Attack Match]               [No Rule Match]
            │                           │
            ▼                           ▼
  Immediate Alert             Machine Learning Inference
 (Confidence: 99.99%)         - Character TF-IDF (2-5 char n-grams)
                              - Random Forest Classifier (200 trees)
                                        │
                                        ▼
                              Final Prediction Verdict
```

### Context-Aware Rules vs. Naive Substring Matching
Unlike conventional signature engines that trigger false alarms on legitimate text literals (e.g. `SELECT 'UNION SELECT' AS example;` or `SELECT '--' AS marker;`), SentriAI parses SQL quoting state and only matches structural injection signatures that occur **outside** string literals.

---

## 2. Production Models & Artifacts

The production runtime uses frozen, validated model artifacts located in the workspace root:

- `random_forest_model.pkl`: Pre-trained Random Forest ensemble (200 estimators).
- `tfidf_vectorizer_rf.pkl`: Pre-trained character n-gram TF-IDF vectorizer (2 to 5-character n-grams, min_df=2).

### Runtime Dataset Independence
**The runtime detection API does NOT require any training datasets.** Inference runs strictly from the serialized `.pkl` artifacts and executes in milliseconds (~85 microseconds per query). Training datasets are only required if retraining the model.

---

## 3. Installation & Quick Start

### Prerequisites
- Python 3.10+
- Node.js & npm (for frontend UI)

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Start Application (Backend + Frontend)
```powershell
powershell -ExecutionPolicy Bypass -File .\start_all.ps1
```
- **Backend API**: `http://localhost:8000` (FastAPI with interactive Swagger docs at `http://localhost:8000/docs`)
- **Frontend UI**: `http://localhost:5173` (React / Vite dashboard)

### Standalone CLI Execution
To test queries interactively in the terminal without starting the server:
```powershell
python detect_sql.py
```

---

## 4. Retraining Pipeline (Optional)

If retraining the machine learning model from source datasets:

1. Download external datasets (e.g., using `python scripts\download_datasets.py`).
2. Run the unified training script:
```powershell
python train_model.py --dataset-dir C:\Users\nithy\Downloads\DATASET --rbsqli-rows 500000 --seed 42
```

The script trains on a combined corpus (500,000 RBSQLI rows + 111 extra samples), performs stratified train/test evaluation, and serializes `random_forest_model.pkl` and `tfidf_vectorizer_rf.pkl`.

---

## 5. Evaluation & Realistic Generalization Metrics

Model performance was evaluated under a strict **source-held-out** methodology across 46,053 completely unseen queries from independent external sources (`SQLiV3_final`, `sqli`, `sqliv2`):

- **In-Distribution Random Split** (RBSQLI 80/20 train-test): ~99.9% accuracy.
- **Source-Held-Out Generalization** (46,053 queries from independent sources):
  - **Accuracy**: 42.97%
  - **Precision**: 30.23%
  - **Recall**: 98.54% (FNR: 1.46%)
  - **F1-Score**: 46.27%
  - **ROC-AUC**: 0.8986
  - **False Positive Rate (FPR)**: 75.47%

### Scientific Insight & Research Ablations
Ablation studies revealed that character n-gram text representations overfit to token fragments on single-token benign inputs. Appending selective surface/length features (**Group 1: Surface**) and syntactic quote/parenthesis depth (**Group 4: Quotes/Parentheses**) reduced FPR to **30.22%** while maintaining **97.44% Recall** and raising ROC-AUC to **0.9678** under regularized margin classifiers. The production pipeline implements this protective layer via context-aware unquoted syntax filtering.

---

## 6. Prevention Demonstration

To understand the difference between **detection** (classifying SQL text) and **prevention** (parameterized queries that make SQL injection structurally impossible in the database driver):

```powershell
python prevention_demo.py
```

