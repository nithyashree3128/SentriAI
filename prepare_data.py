import pandas as pd

input_file = "dataset/SQLiV3_cleaned.csv"
output_file = "dataset/SQLiV3_final.csv"

df = pd.read_csv(input_file)

print("Before removing missing Sentence:", len(df))

# Remove rows with missing SQL/query text
df = df.dropna(subset=["Sentence"]).copy()

# Make sure text is string
df["Sentence"] = df["Sentence"].astype(str).str.strip()

# Remove any rows that became empty
df = df[df["Sentence"] != ""]

# Save final dataset
df.to_csv(output_file, index=False)

print("After cleaning:", len(df))

print("\nLabel distribution:")
print(df["Label"].value_counts())

print("\nMissing values:")
print(df.isnull().sum())

print("\nSaved to:")
print(output_file)