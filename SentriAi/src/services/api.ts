import type {
  BatchResult,
  DashboardStats,
  DetectionResult,
  HealthStatus,
  BackendBatchResponse,
  BackendHistoryItem,
  BackendQueryResponse,
} from '../types';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

/**
 * Health check against GET /health
 */
export async function checkHealth(): Promise<HealthStatus> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    const duration = Math.round(performance.now() - start);
    if (!res.ok) {
      return { status: 'offline', model: 'Offline', version: 'Offline', latencyMs: 0 };
    }
    const data = await res.json();
    if (data.status === 'ok') {
      return {
        status: 'online',
        model: 'Random Forest + TF-IDF',
        version: 'FastAPI Backend',
        latencyMs: duration,
      };
    }
    return { status: 'degraded', model: 'Unknown', version: 'N/A', latencyMs: duration };
  } catch {
    return { status: 'offline', model: 'Offline', version: 'Offline', latencyMs: 0 };
  }
}

/**
 * Fetches real detection history from GET /history
 */
export async function getHistory(): Promise<DetectionResult[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/history`, { method: 'GET' });
  } catch {
    throw new Error('Unable to connect to detection server. Backend is offline.');
  }

  if (!res.ok) {
    throw new Error(`Unable to fetch history (HTTP ${res.status})`);
  }

  const data = (await res.json()) as BackendHistoryItem[];
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    const pred = item.prediction.toUpperCase();
    const isMalicious = pred.includes('INJECTION') || pred.includes('MALICIOUS');
    const isLegit = pred.includes('LEGITIMATE') || pred.includes('SAFE') || pred.includes('CLEAN');

    return {
      id: `DET-${item.id}`,
      query: item.query,
      result: item.prediction,
      prediction: item.prediction,
      confidence: item.confidence,
      threatLevel: isMalicious ? 'Critical' : 'None',
      time: item.timestamp,
      date: item.timestamp,
      status: isMalicious ? 'malicious' : isLegit ? 'legitimate' : 'suspicious',
      explanation: isMalicious
        ? `Random Forest classifier flagged query payload as SQL injection (${item.confidence}% confidence).`
        : `Random Forest classifier verified legitimate query structure (${item.confidence}% confidence).`,
      recommendation: isMalicious
        ? 'Use parameterized queries (prepared statements) and strict parameter type validation.'
        : 'Query structure appears safe. Continue using parameterized database interfaces.',
      indicators: isMalicious
        ? ['Random Forest TF-IDF classification: Malicious', 'Structural SQL injection signature match']
        : ['Standard query structure', 'Random Forest TF-IDF classification: Legitimate'],
    };
  });
}

/**
 * Saves a detection entry to backend via POST /history
 */
export async function saveHistory(data: {
  query: string;
  prediction: string;
  confidence: number;
  timestamp?: string;
}): Promise<BackendHistoryItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: data.query,
        prediction: data.prediction,
        confidence: data.confidence,
        timestamp: data.timestamp || new Date().toLocaleString(),
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as BackendHistoryItem;
  } catch {
    return null;
  }
}

/**
 * Dashboard statistics derived strictly from real backend history data
 */
export async function getStats(): Promise<DashboardStats> {
  try {
    const history = await getHistory();
    const total = history.length;
    const threats = history.filter((h) => h.status === 'malicious').length;
    const legitimate = history.filter((h) => h.status === 'legitimate').length;
    const avgConfidence =
      total > 0
        ? (history.reduce((sum, h) => sum + h.confidence, 0) / total).toFixed(1) + '%'
        : 'N/A';

    return {
      queriesAnalyzed: total,
      threatsDetected: threats,
      legitimateQueries: legitimate,
      accuracy: avgConfidence,
      trendQueries: total > 0 ? 'Live Telemetry' : 'No data',
      trendThreats: total > 0 ? `${threats} flagged` : 'No data',
      trendLegitimate: total > 0 ? `${legitimate} verified` : 'No data',
      trendAccuracy: total > 0 ? 'Avg Confidence' : 'N/A',
    };
  } catch {
    return {
      queriesAnalyzed: 0,
      threatsDetected: 0,
      legitimateQueries: 0,
      accuracy: 'N/A',
      trendQueries: 'Backend Offline',
      trendThreats: 'Backend Offline',
      trendLegitimate: 'Backend Offline',
      trendAccuracy: 'Backend Offline',
    };
  }
}

/**
 * Single SQL Query detection via POST /detect
 * Flow: User enters SQL -> React -> api.ts -> POST /detect -> FastAPI -> ML -> Response
 * Automatically registers result in backend history via POST /history
 */
export async function analyzeQuery(query: string): Promise<DetectionResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a SQL query.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: trimmed }),
    });
  } catch {
    throw new Error('Unable to connect to detection server. Backend is offline.');
  }

  if (!res.ok) {
    let errorMsg = `Server error HTTP ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) errorMsg = errorJson.detail;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = (await res.json()) as BackendQueryResponse;
  const pred = data.prediction.toUpperCase();
  const isMalicious = pred.includes('INJECTION') || pred.includes('MALICIOUS');
  const isLegit = pred.includes('LEGITIMATE') || pred.includes('SAFE') || pred.includes('CLEAN');

  const resultItem: DetectionResult = {
    id: `DET-${Date.now().toString().slice(-4)}`,
    query: trimmed,
    result: data.prediction,
    prediction: data.prediction,
    confidence: data.confidence,
    threatLevel: isMalicious ? 'Critical' : 'None',
    time: new Date().toLocaleTimeString(),
    date: new Date().toISOString().split('T')[0],
    status: isMalicious ? 'malicious' : isLegit ? 'legitimate' : 'suspicious',
    explanation: isMalicious
      ? `Random Forest classifier flagged query payload as SQL injection (${data.confidence}% confidence).`
      : `Random Forest classifier verified legitimate query structure (${data.confidence}% confidence).`,
    recommendation: isMalicious
      ? 'Use parameterized queries (prepared statements) with strict parameter binding to eliminate syntax manipulation risks.'
      : 'Query structure appears safe. Ensure parameterized statements are maintained in application code.',
    indicators: isMalicious
      ? ['Random Forest TF-IDF classification: Malicious', 'Context-aware signature or model detection']
      : ['Standard query structure', 'Random Forest TF-IDF classification: Legitimate'],
  };

  // Persist to backend history
  await saveHistory({
    query: trimmed,
    prediction: data.prediction,
    confidence: data.confidence,
    timestamp: new Date().toLocaleString(),
  });

  return resultItem;
}

/**
 * Batch SQL Query detection via POST /detect/batch
 */
export async function analyzeBatch(queries: string[]): Promise<BatchResult> {
  const valid = queries.map((q) => q.trim()).filter((q) => q.length > 0);
  if (valid.length === 0) {
    throw new Error('Please provide at least one valid SQL query.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/detect/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries: valid }),
    });
  } catch {
    throw new Error('Unable to connect to detection server. Backend is offline.');
  }

  if (!res.ok) {
    let msg = `Batch analysis failed (HTTP ${res.status})`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) msg = errorJson.detail;
    } catch {}
    throw new Error(msg);
  }

  const data = (await res.json()) as BackendBatchResponse;

  const results: DetectionResult[] = data.results.map((r, i) => {
    const pred = r.prediction.toUpperCase();
    const isMalicious = pred.includes('INJECTION') || pred.includes('MALICIOUS');
    const isLegit = pred.includes('LEGITIMATE') || pred.includes('SAFE') || pred.includes('CLEAN');

    return {
      id: `BAT-${101 + i}`,
      query: r.query,
      result: r.prediction,
      prediction: r.prediction,
      confidence: r.confidence,
      threatLevel: isMalicious ? 'Critical' : 'None',
      time: 'Just now',
      date: new Date().toISOString().split('T')[0],
      status: isMalicious ? 'malicious' : isLegit ? 'legitimate' : 'suspicious',
      explanation: isMalicious
        ? `SQL Injection detected by Random Forest model (${r.confidence}% confidence).`
        : `Safe query structure verified by model (${r.confidence}% confidence).`,
      recommendation: isMalicious
        ? 'Refactor to parameterized query / prepared statement.'
        : 'Safe. Follow least privilege database access.',
      indicators: isMalicious ? ['Malicious classification'] : ['Legitimate query'],
    };
  });

  return {
    totalAnalyzed: data.total_queries,
    legitimateCount: data.legitimate_queries,
    maliciousCount: data.injections_detected,
    threatRate: `${data.total_queries > 0 ? ((data.injections_detected / data.total_queries) * 100).toFixed(1) : 0}%`,
    results,
  };
}

/**
 * File-based detection via POST /detect/file
 * Supports .txt, .sql, .csv
 */
export async function uploadFile(file: File): Promise<BatchResult> {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!['.txt', '.sql', '.csv'].includes(ext)) {
    throw new Error('Unsupported file format. Please upload a .txt, .sql, or .csv file.');
  }

  const formData = new FormData();
  formData.append('file', file);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/detect/file`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Unable to connect to detection server. Backend is offline.');
  }

  if (!res.ok) {
    let msg = `File upload failed (HTTP ${res.status})`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) msg = errorJson.detail;
    } catch {}
    throw new Error(msg);
  }

  const data = (await res.json()) as BackendBatchResponse;

  const results: DetectionResult[] = data.results.map((r, i) => {
    const pred = r.prediction.toUpperCase();
    const isMalicious = pred.includes('INJECTION') || pred.includes('MALICIOUS');
    const isLegit = pred.includes('LEGITIMATE') || pred.includes('SAFE') || pred.includes('CLEAN');

    return {
      id: `FIL-${101 + i}`,
      query: r.query,
      result: r.prediction,
      prediction: r.prediction,
      confidence: r.confidence,
      threatLevel: isMalicious ? 'Critical' : 'None',
      time: 'From file',
      date: new Date().toISOString().split('T')[0],
      status: isMalicious ? 'malicious' : isLegit ? 'legitimate' : 'suspicious',
      explanation: isMalicious
        ? `SQL Injection detected from uploaded file (${r.confidence}% confidence).`
        : `Safe query structure verified from uploaded file (${r.confidence}% confidence).`,
      recommendation: isMalicious
        ? 'Refactor to parameterized query / prepared statement.'
        : 'Safe. Follow least privilege database access.',
      indicators: isMalicious ? ['Malicious classification'] : ['Legitimate query'],
    };
  });

  return {
    totalAnalyzed: data.total_queries,
    legitimateCount: data.legitimate_queries,
    maliciousCount: data.injections_detected,
    threatRate: `${data.total_queries > 0 ? ((data.injections_detected / data.total_queries) * 100).toFixed(1) : 0}%`,
    results,
  };
}

export const apiService = {
  checkHealth,
  analyzeQuery,
  detectQuery: analyzeQuery,
  analyzeBatch,
  detectBatch: analyzeBatch,
  uploadFile,
  getHistory,
  saveHistory,
  getStats,
};

export default apiService;
