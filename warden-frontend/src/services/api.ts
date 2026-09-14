import type { ApiErrorBody, DetectResponse, ScanHistoryItem } from '../types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? 'http://localhost:8000'

const DETECT_TIMEOUT_MS = 15_000
const HEALTH_TIMEOUT_MS = 4_000

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, cancel: () => clearTimeout(id) }
}

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    if (typeof body.detail === 'string' && body.detail.trim().length > 0) {
      return body.detail
    }
  } catch {
    // Response wasn't JSON, or had no body — fall through to a generic message.
  }
  if (response.status === 400) return 'The backend rejected this query as invalid.'
  if (response.status >= 500) return 'The backend encountered an internal error while analyzing this query.'
  return `The backend returned an unexpected response (HTTP ${response.status}).`
}

/**
 * Sends a SQL query to the existing detection backend.
 * Returns the response exactly as received — prediction and confidence
 * are never inferred or fabricated client-side.
 */
export async function detectQuery(queryStr: string): Promise<DetectResponse> {
  const { signal, cancel } = withTimeout(DETECT_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_str: queryStr }),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('The analysis request timed out. The backend may be slow to respond or unreachable.')
    }
    throw new ApiError('Could not reach the backend. Confirm it is running and reachable at the configured URL.')
  } finally {
    cancel()
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorBody(response), response.status)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new ApiError('The backend returned a response that could not be parsed.')
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !('prediction' in data) ||
    !('confidence' in data) ||
    typeof (data as Record<string, unknown>).prediction !== 'string' ||
    typeof (data as Record<string, unknown>).confidence !== 'number'
  ) {
    throw new ApiError('The backend response did not match the expected format (prediction, confidence).')
  }

  return data as DetectResponse
}

/**
 * Checks the existing backend's health endpoint.
 * Returns true only on an explicit 200 response.
 */
export async function checkHealth(): Promise<boolean> {
  const { signal, cancel } = withTimeout(HEALTH_TIMEOUT_MS)
  try {
    const response = await fetch(`${BASE_URL}/health`, { signal })
    return response.ok
  } catch {
    return false
  } finally {
    cancel()
  }
}

export async function fetchHistory(): Promise<ScanHistoryItem[]> {
  const { signal, cancel } = withTimeout(HEALTH_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}/history`, { signal })
    if (!response.ok) {
      throw new ApiError(await parseErrorBody(response), response.status)
    }

    const data = (await response.json()) as unknown
    if (!Array.isArray(data)) {
      return []
    }

    return data as ScanHistoryItem[]
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    throw new ApiError('Could not load scan history from the backend.')
  } finally {
    cancel()
  }
}

export async function saveHistoryEntry(entry: ScanHistoryItem): Promise<ScanHistoryItem> {
  const { signal, cancel } = withTimeout(DETECT_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal,
    })

    if (!response.ok) {
      throw new ApiError(await parseErrorBody(response), response.status)
    }

    const data = (await response.json()) as ScanHistoryItem
    return data
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    throw new ApiError('Could not save the scan history entry.')
  } finally {
    cancel()
  }
}

export const apiBaseUrl = BASE_URL
