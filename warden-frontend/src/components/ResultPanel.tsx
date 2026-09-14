import type { DetectResponse } from '../types'
import { normalizeConfidencePercent, normalizeVerdict, verdictLabels } from '../utils/verdict'
import ConfidenceGauge from './ConfidenceGauge'

interface ResultPanelProps {
  result: DetectResponse
}

const KNOWN_KEYS = new Set(['prediction', 'confidence'])

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const tier = normalizeVerdict(result.prediction)
  const percent = normalizeConfidencePercent(result.confidence)

  // Anything beyond prediction/confidence is rendered generically, so the
  // UI can pick up new backend fields later without a rebuild — but it
  // never invents fields the response doesn't actually contain.
  const extraFields = Object.entries(result).filter(([key]) => !KNOWN_KEYS.has(key))

  return (
    <div className={`result result--${tier}`}>
      <div className="result__verdict">
        <span className="result__eyebrow">Verdict</span>
        <div className="result__prediction">
          <span className={`result__dot result__dot--${tier}`} />
          {result.prediction}
        </div>
        <span className="result__tier-label">{verdictLabels[tier]} classification</span>
      </div>

      <div className="result__gauge">
        <ConfidenceGauge percent={percent} tier={tier} />
      </div>

      {extraFields.length > 0 && (
        <div className="result__extra">
          <span className="result__eyebrow">Additional details</span>
          <dl className="result__extra-list">
            {extraFields.map(([key, value]) => (
              <div key={key} className="result__extra-row">
                <dt>{formatKey(key)}</dt>
                <dd>{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
