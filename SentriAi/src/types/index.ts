export interface QueryRequest {
  query?: string;
  query_str?: string;
}

export interface BatchRequest {
  queries: string[];
}

export interface HistoryRequest {
  query: string;
  prediction: string;
  confidence: number;
  timestamp?: string;
}

// Backend API schemas directly matching FastAPI models
export interface BackendQueryResponse {
  prediction: string;
  confidence: number;
}

export interface BackendBatchResultItem {
  query: string;
  prediction: string;
  confidence: number;
}

export interface BackendBatchResponse {
  total_queries: number;
  injections_detected: number;
  legitimate_queries: number;
  results: BackendBatchResultItem[];
}

export interface BackendHistoryItem {
  id: number;
  query: string;
  prediction: string;
  confidence: number;
  timestamp: string;
}

export interface BackendHealthResponse {
  status: string;
}

export interface DetectionResult {
  id: string;
  query: string;
  normalizedQuery?: string;
  result: string;
  prediction?: string;
  confidence: number;
  threatLevel: 'Critical' | 'High' | 'Medium' | 'None';
  time: string;
  date: string;
  status: 'malicious' | 'legitimate' | 'suspicious';
  explanation: string;
  recommendation: string;
  indicators?: string[];
}

export interface HistoryItem extends DetectionResult {}

export interface BatchResult {
  totalAnalyzed: number;
  legitimateCount: number;
  maliciousCount: number;
  threatRate: string;
  results: DetectionResult[];
}

export interface DashboardStats {
  queriesAnalyzed: number;
  threatsDetected: number;
  legitimateQueries: number;
  accuracy: string;
  trendQueries: string;
  trendThreats: string;
  trendLegitimate: string;
  trendAccuracy: string;
}

export interface HealthStatus {
  status: 'online' | 'degraded' | 'offline';
  model: string;
  version: string;
  latencyMs: number;
}

export type VerdictTier = 'safe' | 'suspicious' | 'malicious' | 'unknown';

export interface ExampleQuery {
  label: string;
  query: string;
}

export type QueryResponse = BackendQueryResponse;
export type BatchResponse = BackendBatchResponse;
export type DetectResponse = BackendQueryResponse;
export type ScanHistoryItem = BackendHistoryItem;

