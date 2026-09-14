import pandas as pd
import re

patterns = [
    r"\bunion\s+(all\s+)?select\b",
    r"\bor\s+1\s*=\s*1\b",
    r"\band\s+1\s*=\s*1\b",
    r"'\s*or\s*'",
    r"'\s*and\s*'",
    r"--",
    r"/\*",
    r"\*/",
    r"\bxp_cmdshell\b",
    r"\bwaitfor\s+delay\b",
    r"\bpg_sleep\s*\(",
    r"\bsleep\s*\(",
    r"\bbenchmark\s*\(",
    r"\bdrop\s+table\b",
    r"\binsert\s+into\b",
    r"\bdelete\s+from\b",
    r"\bexec(ute)?\s+",
]

compiled_patterns = [re.compile(p, re.IGNORECASE) for p in patterns]


def rule_based_detector(query):
    query = str(query)

    for pattern in compiled_patterns:
        if pattern.search(query):
            return 1

    return 0


# Load BCCC dataset
df = pd.read_csv("dataset/BCCC-SFU-SQLInj-2023.csv")

queries = df["Data"].fillna("").astype(str)

predictions = queries.apply(rule_based_detector)

detected = (predictions == 1).sum()
total = len(queries)
missed = total - detected

detection_rate = detected / total * 100

print("=" * 55)
print("CONVENTIONAL RULE-BASED BCCC EVALUATION")
print("=" * 55)

print("Total SQL injection queries:", total)
print("Detected:", detected)
print("Not detected:", missed)
print(f"Detection Rate: {detection_rate:.2f}%")
print(f"Miss Rate: {missed / total * 100:.2f}%")

print("=" * 55)