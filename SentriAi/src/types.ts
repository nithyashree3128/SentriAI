// Mirrors the existing FastAPI backend's contract exactly.
// Do not add fields here that the backend does not actually return —
// the UI is built to degrade gracefully if it does.

export interface DetectRequest {
  query_str: string
}

// The backend's confidence may arrive as 0-1 or 0-100; we normalize at
// the point of display rather than assuming a shape here.
export interface DetectResponse {
  prediction: string
  confidence: number
  // Allow additional fields the backend may add later without breaking types.
  [key: string]: unknown
}

export interface ScanHistoryItem {
  id: number
  query: string
  prediction: string
  confidence: number
  timestamp: string
}

export interface ApiErrorBody {
  detail?: string
  [key: string]: unknown
}

export type HealthStatus = 'checking' | 'online' | 'offline'

// Normalized verdict tiers used purely for visual treatment.
// The raw string from the backend is always shown as-is alongside this.
export type VerdictTier = 'safe' | 'suspicious' | 'malicious' | 'unknown'

export interface ExampleQuery {
  label: string
  query: string
}
