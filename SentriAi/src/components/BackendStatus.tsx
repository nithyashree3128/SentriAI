import type { HealthStatus } from '../types'

interface BackendStatusProps {
  status: HealthStatus
}

const copy: Record<HealthStatus, string> = {
  checking: 'Checking backend…',
  online: 'Backend connected',
  offline: 'Backend offline',
}

export default function BackendStatus({ status }: BackendStatusProps) {
  return (
    <div className={`status-pill status-pill--${status}`} role="status">
      <span className="status-pill__dot" />
      {copy[status]}
    </div>
  )
}
