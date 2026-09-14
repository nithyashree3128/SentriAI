import BackendStatus from './BackendStatus'
import type { HealthStatus } from '../types'

interface HeaderProps {
  status: HealthStatus
}

export default function Header({ status }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <svg className="header__mark" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M14 2L4 6.2v7.1c0 6.4 4.3 11.9 10 13.5 5.7-1.6 10-7.1 10-13.5V6.2L14 2z"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="1.6"
          />
          <path d="M9.5 14.2l3 3 6-6.4" fill="none" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="header__name">SentriAI</div>
          <div className="header__tagline">AI-Powered RAG Security Scanner</div>
        </div>
      </div>
      <BackendStatus status={status} />
    </header>
  )
}
