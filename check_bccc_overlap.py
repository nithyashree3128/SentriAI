import pandas as pd

# Load training dataset
sqli = pd.read_csv("DATASET/SQLiV3_final.csv")

# Load independent dataset
bccc = pd.read_csv("DATASET/BCCC-SFU-SQLInj-2023.csv")

# Convert queries to strings and normalize whitespace
train_queries = (
    sqli["Sentence"]
    .fillna("")
    .astype(str)
    .str.strip()
)

bccc_queries = (
    bccc["Data"]
    .fillna("")
    .astype(str)
    .str.strip()
)

# Remove empty queries
train_queries = train_queries[train_queries != ""]
bccc_queries = bccc_queries[bccc_queries != ""]

# Exact overlap
train_set = set(train_queries)

overlap = bccc_queries[bccc_queries.isin(train_set)]

print("=" * 55)
print("BCCC / SQLiV3 OVERLAP CHECK")
print("=" * 55)

print("SQLiV3 queries:", len(train_queries))
print("BCCC queries:", len(bccc_queries))
print("Exact overlapping queries:", len(overlap))

if len(bccc_queries) > 0:
    print(f"Overlap percentage: {len(overlap) / len(bccc_queries) * 100:.2f}%")

print("=" * 55)

if len(overlap) > 0:
    print("\nSome overlapping examples:")
    for query in overlap.drop_duplicates().head(10):
        print("-", query)
else:
    print("\nNo exact duplicate queries were found.")