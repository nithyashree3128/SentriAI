"""
AI-Based SQL Injection Detection and Prevention
------------------------------------------------
A simple Streamlit demo GUI for a college cybersecurity project.

IMPORTANT SAFETY NOTES:
- This app never executes the SQL text the user types. It only converts
  the text into numeric features (TF-IDF) and asks the already-trained
  Logistic Regression model to classify it.
- No database connection is made anywhere in this file.
- The model is NOT retrained here. We only load the .pkl files that were
  produced during training (logistic_model.pkl, tfidf_vectorizer.pkl).

Run with:
    streamlit run app.py
"""

import streamlit as st
import joblib
import os

# ---------------------------------------------------------------------------
# Page configuration (must be the first Streamlit command in the script)
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="AI-Based SQL Injection Detection and Prevention",
    page_icon=None,          # keeping this plain/professional, no emoji icon
    layout="centered",
)

# ---------------------------------------------------------------------------
# Minimal styling — just enough to make the result box readable at a glance.
# Kept deliberately light: no animations, no decorative elements.
# ---------------------------------------------------------------------------
st.markdown(
    """
    <style>
    .result-box {
        padding: 1.2rem 1.5rem;
        border-radius: 8px;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .result-safe {
        background-color: #eafaf0;
        border: 1px solid #2e7d32;
    }
    .result-danger {
        background-color: #fdecea;
        border: 1px solid #c62828;
    }
    .result-title-safe {
        color: #2e7d32;
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0;
    }
    .result-title-danger {
        color: #c62828;
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0;
    }
    .subtitle {
        color: #555555;
        font-size: 1.05rem;
        margin-top: -0.6rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Load the trained model and vectorizer once, and cache them so the app
# doesn't reload the .pkl files from disk on every button click.
# ---------------------------------------------------------------------------
MODEL_PATH = "logistic_model.pkl"
VECTORIZER_PATH = "tfidf_vectorizer.pkl"


@st.cache_resource
def load_artifacts():
    """Load the pre-trained model and vectorizer from disk. Raises a
    friendly error if the .pkl files are missing, instead of crashing
    with a raw traceback in front of an audience."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        return None, None
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    return model, vectorizer


model, vectorizer = load_artifacts()

# ---------------------------------------------------------------------------
# 1. HEADER
# ---------------------------------------------------------------------------
st.markdown("## AI-Based SQL Injection Detection and Prevention")
st.markdown(
    '<p class="subtitle">Machine Learning Based SQL Query Analysis</p>',
    unsafe_allow_html=True,
)
st.divider()

# Stop early with a clear message if the model files aren't found, rather
# than letting the rest of the app fail confusingly.
if model is None or vectorizer is None:
    st.error(
        "Could not find 'logistic_model.pkl' and/or 'tfidf_vectorizer.pkl' "
        "in this folder. Place this app.py file in the same folder as "
        "those two files, then restart the app."
    )
    st.stop()

# ---------------------------------------------------------------------------
# 2. QUERY INPUT SECTION
# ---------------------------------------------------------------------------
st.markdown("### Enter SQL Query")
query_text = st.text_area(
    label="SQL query input",
    label_visibility="collapsed",
    height=140,
    placeholder=(
        "Type or paste a SQL query here.\n\n"
        "Note: this query is analyzed as TEXT only. It is never sent to, "
        "or executed on, any database."
    ),
)

# ---------------------------------------------------------------------------
# 3. ANALYZE BUTTON
# ---------------------------------------------------------------------------
analyze_clicked = st.button("Analyze Query", type="primary")

# ---------------------------------------------------------------------------
# 4 & 5. RESULT + EXPLANATION SECTIONS
# ---------------------------------------------------------------------------
if analyze_clicked:
    # Error handling for empty input
    if not query_text or not query_text.strip():
        st.warning("Please enter a SQL query before clicking Analyze Query.")
    else:
        # Convert the raw query text into the same TF-IDF feature space
        # used during training, then classify it. No SQL is executed here.
        features = vectorizer.transform([query_text])
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = max(probabilities) * 100

        if prediction == 1:
            st.markdown(
                f"""
                <div class="result-box result-danger">
                    <p class="result-title-danger">SQL INJECTION DETECTED</p>
                    <p>Model confidence: {confidence:.2f}%</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown(
                "**Explanation:** The machine learning model identified "
                "patterns associated with SQL injection in this query. "
                "This is a statistical prediction, not a certainty — always "
                "review flagged queries manually in a real system."
            )
        else:
            st.markdown(
                f"""
                <div class="result-box result-safe">
                    <p class="result-title-safe">LEGITIMATE QUERY</p>
                    <p>Model confidence: {confidence:.2f}%</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown(
                "**Explanation:** The machine learning model did not "
                "identify the input as a SQL injection query. This is a "
                "statistical prediction, not a certainty — it does not "
                "guarantee the query is safe in every context."
            )

st.divider()

# ---------------------------------------------------------------------------
# 6. PREVENTION SECTION
# ---------------------------------------------------------------------------
st.markdown("### How to Prevent SQL Injection")
st.markdown(
    """
- **Use parameterized queries / prepared statements** instead of building
  SQL strings manually — this is the single most effective defense.
- **Validate user input** (expected type, length, and format) before it
  ever reaches a query.
- **Use least-privilege database accounts** so that even a successful
  injection can't read or modify more than it strictly needs to.
- **Never construct SQL queries by directly concatenating user input**
  into the query string.
"""
)

st.divider()

# ---------------------------------------------------------------------------
# 7. ABOUT THE MODEL
# ---------------------------------------------------------------------------
st.markdown("### About the Model")
st.markdown(
    """
- **Feature extraction:** Character-level TF-IDF (captures overlapping
  2–5 character patterns in the query text).
- **Classifier:** Logistic Regression.
- **Class 0** = Legitimate Query.
- **Class 1** = SQL Injection.
"""
)

st.divider()

# ---------------------------------------------------------------------------
# 8. PROJECT RESULTS
# ---------------------------------------------------------------------------
st.markdown("### Project Results")

col1, col2 = st.columns(2)

with col1:
    st.markdown("**ML Model**")
    st.metric("Accuracy", "99.40%")
    st.metric("Precision", "99.95%")
    st.metric("Recall", "98.40%")
    st.metric("F1-score", "99.17%")

with col2:
    st.markdown("**Rule-Based Baseline**")
    st.metric("Accuracy", "79.17%")
    st.metric("Precision", "83.22%")
    st.metric("Recall", "54.05%")
    st.metric("F1-score", "65.54%")

st.markdown("**BCCC Independent Evaluation (unseen dataset)**")
col3, col4 = st.columns(2)
with col3:
    st.metric("ML Detection Rate", "99.86%")
with col4:
    st.metric("Rule-Based Detection Rate", "32.18%")

st.divider()
st.caption(
    "College project demonstration. All processing happens locally in this "
    "app; no query is executed and no external database is contacted."
)
