"""
Prevention Demo — Parameterized Queries vs. String Concatenation
------------------------------------------------------------------
This script demonstrates the DIFFERENCE between detection and prevention.

- detect_sql.py / hybrid_detect.py CLASSIFY a query as suspicious or not.
- This script PREVENTS the attack from working in the first place, by
  changing how the query is built — regardless of whether it "looks"
  suspicious.

Everything here runs against a small, temporary, local SQLite database
created only for this demo (an in-memory database that disappears when the
script ends). No real, external, or persistent database is touched.
"""

import sqlite3

# ---------------------------------------------------------------------------
# Set up a tiny demo database: one 'users' table with a secret column, to
# make it obvious if an attack manages to read data it shouldn't.
# ---------------------------------------------------------------------------
connection = sqlite3.connect(":memory:")  # in-memory only, never saved to disk
cursor = connection.cursor()

cursor.execute(
    """
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT
    )
    """
)
cursor.executemany(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [
        ("alice", "alice_password"),
        ("bob", "bob_password"),
        ("admin", "super_secret_admin_password"),
    ],
)
connection.commit()

# A classic login-bypass payload: closes the string early with a quote,
# uses OR '1'='1' so the condition is always true, then uses -- to comment
# out the rest of the original query (the AND password = '...' part).
# Without the trailing comment, SQL's operator precedence (AND binds
# tighter than OR) would make "OR '1'='1' AND password = 'anything'"
# evaluate to false for every row, and the "attack" would silently fail —
# a good example of why exact syntax matters in both attacking AND
# defending against SQL injection.
attacker_input_username = "' OR '1'='1' -- "
attacker_input_password = "anything"


# ---------------------------------------------------------------------------
# VULNERABLE VERSION — builds the query by directly concatenating user
# input into the SQL string. This is the pattern the problem statement
# calls out explicitly as something to avoid.
# ---------------------------------------------------------------------------
def vulnerable_login(username: str, password: str):
    query = (
        "SELECT * FROM users WHERE username = '"
        + username
        + "' AND password = '"
        + password
        + "'"
    )
    print("  Query actually sent to the database:")
    print(" ", query)
    cursor.execute(query)  # the attacker's input changes the query's LOGIC
    return cursor.fetchall()


# ---------------------------------------------------------------------------
# SAFE VERSION — uses a parameterized query. The username and password are
# passed as separate arguments, never inserted into the SQL string itself.
# The database driver treats them strictly as DATA, never as SQL syntax.
# ---------------------------------------------------------------------------
def safe_login(username: str, password: str):
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    print("  Query actually sent to the database:")
    print(" ", query, "   [parameters passed separately, not shown above]")
    cursor.execute(query, (username, password))  # input can never change the query's structure
    return cursor.fetchall()


# ---------------------------------------------------------------------------
# Run the same malicious input through both versions and compare results.
# ---------------------------------------------------------------------------
print("=" * 70)
print("PREVENTION DEMO: SAME MALICIOUS INPUT, TWO DIFFERENT QUERY METHODS")
print("=" * 70)
print(f"\nAttacker-supplied username: {attacker_input_username!r}")
print(f"Attacker-supplied password: {attacker_input_password!r}\n")

print("-" * 70)
print("1) VULNERABLE — string concatenation")
print("-" * 70)
vulnerable_results = vulnerable_login(attacker_input_username, attacker_input_password)
print(f"  Rows returned: {len(vulnerable_results)}")
for row in vulnerable_results:
    print("   ", row)
if len(vulnerable_results) > 1:
    print(
        "  --> LOGIN BYPASSED / DATA LEAKED: the malicious input turned the "
        "WHERE clause into something that matches EVERY row, dumping every "
        "user's password without knowing any real credentials."
    )

print()
print("-" * 70)
print("2) SAFE — parameterized query")
print("-" * 70)
safe_results = safe_login(attacker_input_username, attacker_input_password)
print(f"  Rows returned: {len(safe_results)}")
for row in safe_results:
    print("   ", row)
if len(safe_results) == 0:
    print(
        "  --> ATTACK PREVENTED: the database treated the entire attacker "
        "string as a literal username to search for (which doesn't exist), "
        "instead of as part of the SQL logic. No rows match, no data leaks."
    )

connection.close()

print()
print("=" * 70)
print("CONCLUSION")
print("=" * 70)
print(
    "Detection (hybrid_detect.py) can FLAG a suspicious-looking query.\n"
    "Prevention (parameterized queries) makes the attack structurally\n"
    "IMPOSSIBLE regardless of what the input looks like — this is why both\n"
    "layers matter, and why real systems should never rely on detection\n"
    "alone."
)