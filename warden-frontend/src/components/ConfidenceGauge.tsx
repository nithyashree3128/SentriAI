import type { VerdictTier } from '../types'

interface ConfidenceGaugeProps {
  percent: number
  tier: VerdictTier
}

const tierColorVar: Record<VerdictTier, string> = {
  safe: 'var(--safe)',
  suspicious: 'var(--suspicious)',
  malicious: 'var(--malicious)',
  unknown: 'var(--unknown)',
}

export default function ConfidenceGauge({ percent, tier }: ConfidenceGaugeProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - clamped / 100)
  const color = tierColorVar[tier]

  return (
    <div className="gauge">
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Confidence ${clamped.toFixed(1)} percent`}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          className="gauge__arc"
        />
      </svg>
      <div className="gauge__value">
        <span className="gauge__number">{clamped.toFixed(1)}%</span>
        <span className="gauge__caption">confidence</span>
      </div>
    </div>
  )
}
