type HealthState = 'checking' | 'online' | 'offline'

interface BackendStatusProps {
  status: HealthState
}

const copy: Record<HealthState, string> = {
  checking: 'Checking Backend…',
  online: 'Backend Online',
  offline: 'Backend Offline',
}

export default function BackendStatus({ status }: BackendStatusProps) {
  return (
    <div className={`status-pill status-pill--${status}`} role="status">
      <span className="status-pill__dot" />
      {copy[status]}
    </div>
  )
}
