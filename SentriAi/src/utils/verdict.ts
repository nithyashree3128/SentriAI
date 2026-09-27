import type { VerdictTier } from '../types'

/**
 * Maps the backend's raw prediction string to a visual tier.
 * This only controls color/icon treatment — the original string from
 * the backend is always displayed verbatim alongside it.
 */
export function normalizeVerdict(prediction: string): VerdictTier {
  if (!prediction) return 'unknown'
  const value = prediction.trim().toLowerCase()

  if (
    value.includes('injection') ||
    value.includes('malicious') ||
    value.includes('sqli') ||
    value.includes('attack') ||
    value.includes('threat') ||
    value.includes('unsafe')
  ) {
    return 'malicious'
  }

  if (
    value.includes('legitimate') ||
    value.includes('safe') ||
    value.includes('clean') ||
    value.includes('benign') ||
    value.includes('normal') ||
    value.includes('clear')
  ) {
    return 'safe'
  }

  if (
    value.includes('suspicious') ||
    value.includes('warning') ||
    value.includes('possible') ||
    value.includes('anomalous')
  ) {
    return 'suspicious'
  }

  return 'unknown'
}

/**
 * The backend may return confidence as a 0-1 fraction or a 0-100 value.
 * We display it as a percentage either way, without altering the
 * underlying figure it represents.
 */
export function normalizeConfidencePercent(confidence: number): number {
  if (typeof confidence !== 'number' || isNaN(confidence)) return 0
  const raw = confidence <= 1 && confidence > 0 ? confidence * 100 : confidence
  return Math.max(0, Math.min(100, raw))
}

export const verdictLabels: Record<VerdictTier, string> = {
  safe: 'Legitimate',
  suspicious: 'Suspicious',
  malicious: 'Malicious',
  unknown: 'Unclassified',
}
