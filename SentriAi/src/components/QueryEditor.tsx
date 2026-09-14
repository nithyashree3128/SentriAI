import { useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, UIEvent } from 'react'

export const MAX_QUERY_LENGTH = 10_000

interface QueryEditorProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: () => void
  onClear: () => void
  isScanning: boolean
}

export default function QueryEditor({ value, onChange, onAnalyze, onClear, isScanning }: QueryEditorProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  const lineCount = Math.max(1, value.split('\n').length)
  const overLimit = value.length > MAX_QUERY_LENGTH
  const isEmpty = value.trim().length === 0
  const canAnalyze = !isScanning && !overLimit && !isEmpty

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
  }

  function handleScroll(e: UIEvent<HTMLTextAreaElement>) {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canAnalyze) {
      onAnalyze()
    }
  }

  return (
    <div className="editor-card">
      <div className="editor-card__head">
        <span className="editor-card__label">SQL query</span>
        <span className={`editor-card__count ${overLimit ? 'editor-card__count--over' : ''}`}>
          {value.length.toLocaleString()} / {MAX_QUERY_LENGTH.toLocaleString()}
        </span>
      </div>

      <div className={`editor-card__body ${focused ? 'editor-card__body--focused' : ''}`}>
        <div className="editor-card__gutter" ref={lineNumbersRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="editor-card__gutter-line">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          className="editor-card__textarea"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="SELECT * FROM users WHERE username = 'alice';"
          aria-label="SQL query to analyze"
        />
      </div>

      {overLimit && (
        <div className="editor-card__warning">
          This query is {(value.length - MAX_QUERY_LENGTH).toLocaleString()} characters over the {MAX_QUERY_LENGTH.toLocaleString()}-character limit the backend accepts.
        </div>
      )}

      <div className="editor-card__actions">
        <button type="button" className="btn btn--ghost" onClick={onClear} disabled={isScanning || value.length === 0}>
          Clear
        </button>
        <button type="button" className="btn btn--primary" onClick={onAnalyze} disabled={!canAnalyze}>
          {isScanning ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Scanning…
            </>
          ) : (
            'Scan query'
          )}
        </button>
      </div>
    </div>
  )
}
