# Warden — SQL Injection Detection Frontend

A frontend-only client for an existing FastAPI SQL-injection-detection backend.
This project contains **no detection logic** — every prediction and confidence
value shown in the UI comes directly from your backend's `/detect` response.

## Requirements

- Your existing FastAPI backend running and reachable (default expected at `http://localhost:8000`)
- Node.js 18+

## Setup

```bash
npm install
cp .env.example .env
# edit .env if your backend isn't at http://localhost:8000
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Backend contract this frontend expects

```
GET  /health          -> { "status": "ok" }
POST /detect           body: { "query_str": "<SQL>" }
                        -> { "prediction": "<string>", "confidence": <number> }
```

Confidence is accepted as either a 0–1 fraction or a 0–100 value; the UI
normalizes it for display without altering the number itself.

If `/detect` ever returns extra fields beyond `prediction` and `confidence`,
the result panel will display them automatically under "Additional details"
— no frontend changes needed.

## Project structure

```
src/
├── components/     UI components (editor, result panel, gauge, status, etc.)
├── services/api.ts All communication with the backend lives here
├── utils/verdict.ts Display-only normalization of prediction/confidence
├── types.ts        Shared TypeScript types matching the API contract
├── App.tsx         Top-level state and layout
└── App.css         Styling
```

## Notes

- CORS: if the browser blocks requests to your backend, enable CORS for
  `http://localhost:5173` in your FastAPI app (e.g. via `CORSMiddleware`).
- This project does not touch, wrap, or reimplement any backend or model code.
