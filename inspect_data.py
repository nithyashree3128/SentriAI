import pandas as pd

file = "DATASET/SQLiV3.csv"

df = pd.read_csv(file, dtype=str)

for col in ["Label", "Unnamed: 2", "Unnamed: 3"]:
    print("\n==============================")
    print("COLUMN:", col)
    print("Data type:", df[col].dtype)

    values = df[col].dropna().str.strip()

    print("0:", (values == "0").sum())
    print("1:", (values == "1").sum())
    print("Other:", (~values.isin(["0", "1"])).sum())

    print("\nFirst 15 OTHER values:")
    print(values[~values.isin(["0", "1"])].head(15).to_list())