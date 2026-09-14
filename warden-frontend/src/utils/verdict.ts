import type { VerdictTier } from '../types'

/**
 * Maps the backend's raw prediction string to a visual tier.
 * This only controls color/icon treatment — the original string from
 * the backend is always displayed verbatim alongside it.
 */
export function normalizeVerdict(prediction: string): VerdictTier {
  const value = prediction.trim().toLowerCase()

  if (['safe', 'benign', 'clean', 'legitimate', 'normal', 'clear'].includes(value)) {
    return 'safe'
  }
  if (['suspicious', 'warning', 'possible', 'anomalous'].includes(value)) {
    return 'suspicious'
  }
  if (['malicious', 'injection', 'sqli', 'attack', 'unsafe'].includes(value)) {
    return 'malicious'
  }
  return 'unknown'
}

/**
 * The backend may return confidence as a 0-1 fraction or a 0-100 value.
 * We display it as a percentage either way, without altering the
 * underlying figure it represents.
 */
export function normalizeConfidencePercent(confidence: number): number {
  const raw = confidence <= 1 ? confidence * 100 : confidence
  return Math.max(0, Math.min(100, raw))
}

export const verdictLabels: Record<VerdictTier, string> = {
  safe: 'Clear',
  suspicious: 'Suspicious',
  malicious: 'Malicious',
  unknown: 'Unclassified',
}
