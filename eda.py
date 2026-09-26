import pandas as pd

file = "DATASET/SQLiV3_cleaned.csv"

df = pd.read_csv(file)

print("Dataset shape:", df.shape)

print("\n--- Columns ---")
print(df.columns.tolist())

print("\n--- Missing values ---")
print(df.isnull().sum())

print("\n--- Duplicate rows ---")
print(df.duplicated().sum())

print("\n--- Label distribution ---")
print(df["Label"].value_counts())

print("\n--- Label percentages ---")
print(df["Label"].value_counts(normalize=True) * 100)

# Query length
df["query_length"] = df["Sentence"].str.len()

print("\n--- Query length statistics ---")
print(df["query_length"].describe())

print("\n--- Example legitimate queries ---")
print(
    df[df["Label"] == 0]["Sentence"]
    .head(10)
    .to_string(index=False)
)

print("\n--- Example SQL injection queries ---")
print(
    df[df["Label"] == 1]["Sentence"]
    .head(10)
    .to_string(index=False)
)