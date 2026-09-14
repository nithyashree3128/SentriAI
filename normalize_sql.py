from urllib.parse import unquote


def normalize_sql(query):
    query = str(query)

    # URL decode
    query = unquote(query)

    # Convert multiple spaces into one space
    query = " ".join(query.split())

    return query
