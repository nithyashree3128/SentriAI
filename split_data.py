import pandas as pd
from sklearn.model_selection import train_test_split

# Load final dataset
file = "dataset/SQLiV3_final.csv"
df = pd.read_csv(file)

# Input and target
X = df["Sentence"]
y = df["Label"]

# Split: 80% training, 20% testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Total samples:", len(df))
print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

print("\nTraining label distribution:")
print(y_train.value_counts())

print("\nTesting label distribution:")
print(y_test.value_counts())