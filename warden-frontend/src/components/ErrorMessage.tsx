interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner__text">
        <span className="error-banner__title">Analysis could not complete</span>
        <span className="error-banner__body">{message}</span>
      </div>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
