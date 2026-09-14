import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

# Load dataset
file = "dataset/SQLiV3_final.csv"
df = pd.read_csv(file)

# Separate input and labels
X = df["Sentence"]
y = df["Label"]

# TF-IDF using character n-grams
vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    min_df=2
)

# Convert SQL queries into numerical features
X_tfidf = vectorizer.fit_transform(X)

print("Original queries:", len(X))
print("TF-IDF matrix shape:", X_tfidf.shape)
print("Number of features:", len(vectorizer.get_feature_names_out()))