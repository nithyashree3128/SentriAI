import csv
import io
import json
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from detect_sql import detect_sql_injection

HISTORY_FILE = Path(__file__).resolve().parent / "scan_history.json"

app = FastAPI(title="SQL Injection Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: Optional[str] = Field(default=None, min_length=1, max_length=10000, description="SQL query text to analyze")
    query_str: Optional[str] = Field(default=None, min_length=1, max_length=10000, description="SQL query text to analyze")


class QueryResponse(BaseModel):
    prediction: str
    confidence: float


class BatchRequest(BaseModel):
    queries: list[str] = Field(min_length=1, max_length=1000, description="List of SQL queries to analyze")


class BatchResultItem(BaseModel):
    query: str
    prediction: str
    confidence: float


class BatchResponse(BaseModel):
    total_queries: int
    injections_detected: int
    legitimate_queries: int
    results: list[BatchResultItem]


class HistoryItem(BaseModel):
    id: int
    query: str = Field(min_length=1, max_length=10000)
    prediction: str
    confidence: float
    timestamp: str


class HistoryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=10000)
    prediction: str
    confidence: float
    timestamp: Optional[str] = None


def load_history() -> list[HistoryItem]:
    if not HISTORY_FILE.exists():
        return []

    try:
        raw = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []

    if not isinstance(raw, list):
        return []

    items: list[HistoryItem] = []
    for item in raw:
        try:
            items.append(HistoryItem.model_validate(item))
        except Exception:
            continue

    return items


def save_history(items: list[HistoryItem]) -> None:
    serialized = json.dumps([item.model_dump() for item in items], ensure_ascii=False, indent=2)
    HISTORY_FILE.write_text(serialized, encoding="utf-8")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/history", response_model=list[HistoryItem])
def get_history():
    return load_history()


@app.post("/history", response_model=HistoryItem)
def add_history_item(payload: HistoryRequest):
    items = load_history()
    item = HistoryItem(
        id=int(time.time() * 1000),
        query=payload.query,
        prediction=payload.prediction,
        confidence=round(float(payload.confidence), 2),
        timestamp=payload.timestamp or time.strftime("%Y-%m-%d %H:%M:%S"),
    )
    items.insert(0, item)
    save_history(items[:8])
    return item


@app.post("/detect", response_model=QueryResponse)
def detect_query(payload: QueryRequest):
    query_text = payload.query_str or payload.query

    if query_text is None:
        raise HTTPException(
            status_code=400,
            detail="A SQL query must be provided in either 'query_str' or 'query'.",
        )

    try:
        result, confidence = detect_sql_injection(query_text)
        return QueryResponse(prediction=result, confidence=round(float(confidence), 2))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/detect/batch", response_model=BatchResponse)
def detect_batch(payload: BatchRequest):
    """Analyze multiple SQL queries provided as a JSON list."""
    results: list[BatchResultItem] = []
    injections = 0
    legitimate = 0

    for raw_q in payload.queries:
        q_str = str(raw_q).strip()
        if not q_str:
            continue
        try:
            verdict, conf = detect_sql_injection(q_str)
        except Exception:
            verdict, conf = "ERROR", 0.0

        if verdict == "SQL INJECTION DETECTED":
            injections += 1
        elif verdict == "LEGITIMATE QUERY":
            legitimate += 1

        results.append(BatchResultItem(
            query=q_str,
            prediction=verdict,
            confidence=round(float(conf), 2)
        ))

    return BatchResponse(
        total_queries=len(results),
        injections_detected=injections,
        legitimate_queries=legitimate,
        results=results
    )


@app.post("/detect/file", response_model=BatchResponse)
async def detect_file(file: UploadFile = File(...)):
    """
    Analyze queries from an uploaded file (.txt, .sql, or .csv).
    - .txt / .sql: one query per non-empty line
    - .csv: searches for a column named 'query', 'sql_query', 'Sentence', or 'data'
    """
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()

    if suffix not in (".txt", ".sql", ".csv"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a .txt, .sql, or .csv file."
        )

    content_bytes = await file.read()
    try:
        text_content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text_content = content_bytes.decode("latin-1")
        except UnicodeDecodeError as exc:
            raise HTTPException(status_code=400, detail="Could not decode file content as text.") from exc

    extracted_queries: list[str] = []

    if suffix in (".txt", ".sql"):
        for line in text_content.splitlines():
            line_str = line.strip()
            if line_str and not line_str.startswith("--"):
                extracted_queries.append(line_str)
    elif suffix == ".csv":
        reader = csv.DictReader(io.StringIO(text_content))
        if not reader.fieldnames:
            raise HTTPException(status_code=400, detail="CSV file appears to be empty or malformed.")

        # Find target column
        candidate_cols = ["query", "sql_query", "sentence", "data"]
        target_col = None
        for col in reader.fieldnames:
            if col.strip().lower() in candidate_cols:
                target_col = col
                break

        if not target_col:
            # Fall back to first column
            target_col = reader.fieldnames[0]

        for row in reader:
            val = row.get(target_col, "")
            if val and val.strip():
                extracted_queries.append(val.strip())

    if not extracted_queries:
        raise HTTPException(status_code=400, detail="No SQL queries found in uploaded file.")

    return detect_batch(BatchRequest(queries=extracted_queries[:1000]))
