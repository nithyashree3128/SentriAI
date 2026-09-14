import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import QueryEditor, { MAX_QUERY_LENGTH } from './components/QueryEditor'
import ExampleQueries from './components/ExampleQueries'
import ResultPanel from './components/ResultPanel'
import QueryPreview from './components/QueryPreview'
import ErrorMessage from './components/ErrorMessage'
import { apiBaseUrl, checkHealth, detectQuery, fetchHistory, saveHistoryEntry } from './services/api'
import type { DetectResponse, HealthStatus, ScanHistoryItem } from './types'
import './App.css'

const HEALTH_POLL_MS = 30_000
const HISTORY_STORAGE_KEY = 'sentriai_scan_history'

type View = 'analysis' | 'history' | 'reports' | 'settings'

function loadStoredHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!storedHistory) {
      return []
    }

    const parsed = JSON.parse(storedHistory)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<DetectResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthStatus>('checking')
  const [activeView, setActiveView] = useState<View>('analysis')
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => loadStoredHistory())
  const lastQueryRef = useRef('')

  useEffect(() => {
    async function loadHistory() {
      try {
        const backendHistory = await fetchHistory()
        if (backendHistory.length > 0) {
          setHistory(backendHistory)
        }
      } catch {
        // Fall back to browser storage if the backend is unavailable.
      }
    }

    void loadHistory()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      const ok = await checkHealth()
      if (!cancelled) setHealth(ok ? 'online' : 'offline')
    }

    poll()
    const id = setInterval(poll, HEALTH_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    } catch {
      // Ignore storage errors so the UI still works if browser storage is unavailable.
    }
  }, [history])

  async function runAnalysis() {
    const trimmed = query
    if (trimmed.trim().length === 0 || trimmed.length > MAX_QUERY_LENGTH || isScanning) return

    lastQueryRef.current = trimmed
    setIsScanning(true)
    setError(null)

    try {
      const response = await detectQuery(trimmed)
      const entry: ScanHistoryItem = {
        id: Date.now(),
        query: trimmed,
        prediction: response.prediction,
        confidence: response.confidence,
        timestamp: new Date().toLocaleString(),
      }

      setResult(response)
      setSubmittedQuery(trimmed)
      setHistory((prev) => [entry, ...prev].slice(0, 8))

      try {
        await saveHistoryEntry(entry)
      } catch {
        // Ignore backend persistence failures and keep the UI responsive.
      }
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'An unknown error occurred while analyzing this query.')
    } finally {
      setIsScanning(false)
    }
  }

  function handleClear() {
    setQuery('')
    setResult(null)
    setError(null)
  }

  function handleSelectExample(example: string) {
    setQuery(example)
    setError(null)
  }

  function handleRetry() {
    if (lastQueryRef.current) {
      setQuery(lastQueryRef.current)
      void runAnalysis()
    }
  }

  const totalScans = history.length
  const maliciousScans = history.filter((item) => item.prediction.toLowerCase().includes('malicious')).length
  const clearScans = history.filter((item) => item.prediction.toLowerCase().includes('clear') || item.prediction.toLowerCase().includes('safe') || item.prediction.toLowerCase().includes('legitimate')).length
  const averageConfidence = totalScans
    ? Math.round(history.reduce((sum, item) => sum + item.confidence, 0) / totalScans)
    : 0
  const latestScan = history[0]

  return (
    <div className="app">
      <Header status={health} />

      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar__nav">
            <button
              type="button"
              className={`nav-button ${activeView === 'analysis' ? 'nav-button--active' : ''}`}
              onClick={() => setActiveView('analysis')}
            >
              New Analysis
            </button>
            <button
              type="button"
              className={`nav-button ${activeView === 'history' ? 'nav-button--active' : ''}`}
              onClick={() => setActiveView('history')}
            >
              History
            </button>
            <button
              type="button"
              className={`nav-button ${activeView === 'reports' ? 'nav-button--active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              Reports
            </button>
            <button
              type="button"
              className={`nav-button ${activeView === 'settings' ? 'nav-button--active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              Settings
            </button>
          </div>

          <div className="sidebar__meta">
            <div className="sidebar__meta-label">Clean queries</div>
            <div className="sidebar__meta-label sidebar__meta-label--muted">Build trust</div>
          </div>
        </aside>

        <main className="app__main">
          {activeView === 'analysis' && (
            <>
              <section className="panel panel--composer">
                <div className="panel__topline">
                  <span className="panel__eyebrow">Query to scan</span>
                </div>

                <QueryEditor
                  value={query}
                  onChange={setQuery}
                  onAnalyze={runAnalysis}
                  onClear={handleClear}
                  isScanning={isScanning}
                />
                <ExampleQueries onSelect={handleSelectExample} disabled={isScanning} />
              </section>

              {error && <ErrorMessage message={error} onRetry={handleRetry} />}

              {result && !error && (
                <section className="panel panel--result">
                  <ResultPanel result={result} />
                  <QueryPreview query={submittedQuery} />
                </section>
              )}
            </>
          )}

          {activeView === 'history' && (
            <section className="panel info-panel">
              <div className="panel__topline">
                <span className="panel__eyebrow">History</span>
              </div>

              {history.length === 0 ? (
                <div className="empty-state">
                  No scans yet. Run your first SQL analysis to build a history trail.
                </div>
              ) : (
                <div className="history-list">
                  {history.map((item) => (
                    <article key={item.id} className="history-item">
                      <div className="history-item__header">
                        <span className="history-item__timestamp">{item.timestamp}</span>
                        <span
                          className={`pill ${
                            item.prediction.toLowerCase().includes('malicious') ||
                            item.prediction.toLowerCase().includes('injection')
                              ? 'pill--malicious'
                              : 'pill--safe'
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </div>
                      <pre className="history-item__query">{item.query}</pre>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeView === 'reports' && (
            <section className="panel info-panel">
              <div className="panel__topline">
                <span className="panel__eyebrow">Reports</span>
              </div>

              <div className="report-grid">
                <div className="metric-card">
                  <span className="metric-card__label">Total scans</span>
                  <strong>{totalScans}</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-card__label">Threats flagged</span>
                  <strong>{maliciousScans}</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-card__label">Clean scans</span>
                  <strong>{clearScans}</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-card__label">Avg confidence</span>
                  <strong>{averageConfidence}%</strong>
                </div>
              </div>

              {latestScan ? (
                <div className="report-summary">
                  <div className="report-summary__header">Latest scan summary</div>
                  <div className="report-summary__body">
                    <div>
                      <span className="report-summary__label">Prediction</span>
                      <strong>{latestScan.prediction}</strong>
                    </div>
                    <div>
                      <span className="report-summary__label">Confidence</span>
                      <strong>{latestScan.confidence.toFixed(1)}%</strong>
                    </div>
                    <div>
                      <span className="report-summary__label">Timestamp</span>
                      <strong>{latestScan.timestamp}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  Reports will appear after your first scan.
                </div>
              )}
            </section>
          )}

          {activeView === 'settings' && (
            <section className="panel info-panel">
              <div className="panel__topline">
                <span className="panel__eyebrow">Settings</span>
              </div>

              <div className="settings-grid">
                <div className="setting-card">
                  <span className="setting-card__label">Backend endpoint</span>
                  <strong>{apiBaseUrl}</strong>
                </div>
                <div className="setting-card">
                  <span className="setting-card__label">Status</span>
                  <strong>{health === 'online' ? 'Connected' : health === 'offline' ? 'Offline' : 'Checking...'}</strong>
                </div>
                <div className="setting-card">
                  <span className="setting-card__label">Model profile</span>
                  <strong>Random Forest + TF-IDF</strong>
                </div>
                <div className="setting-card">
                  <span className="setting-card__label">History retention</span>
                  <strong>8 recent scans</strong>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <footer className="app__footer">
        <span>SentriAI</span>
        <span className="app__footer-sep">·</span>
        <span>Analysis is provided by an external detection model and may be imperfect.</span>
      </footer>
    </div>
  )
}
