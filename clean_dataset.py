import pandas as pd

input_file = "DATASET/SQLiV3.csv"
output_file = "DATASET/SQLiV3_cleaned.csv"

# Read everything as text
df = pd.read_csv(input_file, dtype=str)

# Remove leading/trailing spaces
for col in df.columns:
    df[col] = df[col].str.strip()

# Start with the original Label column
df["Clean_Label"] = df["Label"]

# Recover labels that shifted into Unnamed: 2
missing_label = df["Clean_Label"].isna()

shifted_label = df["Unnamed: 2"].isin(["0", "1"])

df.loc[missing_label & shifted_label, "Clean_Label"] = (
    df.loc[missing_label & shifted_label, "Unnamed: 2"]
)

# Keep only valid binary labels
clean = df[
    df["Sentence"].notna() &
    df["Clean_Label"].isin(["0", "1"])
].copy()

# Keep only the columns we need
clean = clean[["Sentence", "Clean_Label"]]

# Rename label
clean = clean.rename(columns={"Clean_Label": "Label"})

# Convert label to integer
clean["Label"] = clean["Label"].astype(int)

# Remove duplicate SQL queries
before_duplicates = len(clean)
clean = clean.drop_duplicates(subset=["Sentence"])

# Save
clean.to_csv(output_file, index=False)

print("Original rows:", len(df))
print("Rows before duplicate removal:", before_duplicates)
print("Final cleaned rows:", len(clean))

print("\nFinal label distribution:")
print(clean["Label"].value_counts())

print("\nSaved to:")
print(output_file)