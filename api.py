import json
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
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
