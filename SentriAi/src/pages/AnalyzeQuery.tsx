import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import type { DetectionResult } from '../types';
import QueryEditor from '../components/QueryEditor';
import ResultPanel from '../components/ResultPanel';

export function AnalyzeQuery({ showToast }: { showToast: (m: string, t?: string) => void }) {
  const [query, setQuery] = useState("SELECT * FROM users WHERE username = 'admin' OR '1'='1';");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      showToast('Please enter a SQL query.', 'error');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await apiService.analyzeQuery(query);
      setResult(data);
      showToast(
        data.status === 'malicious' ? 'SQL Injection detected!' : 'Query is legitimate.',
        data.status === 'malicious' ? 'error' : 'success'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to detection server.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (type: 'malicious' | 'safe') => {
    if (type === 'malicious') {
      setQuery("SELECT * FROM accounts WHERE acc_id = 105 UNION SELECT username, password FROM credit_cards--");
    } else {
      setQuery("SELECT order_id, total FROM orders WHERE user_id = 4921 AND status = 'pending';");
    }
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Analyze SQL Query</h3>
        <p className="text-sm text-slate-400 mt-1">Enter or paste a SQL query below for ML security inspection.</p>
      </div>

      <QueryEditor
        query={query}
        setQuery={setQuery}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        onClear={() => {
          setQuery('');
          setResult(null);
          setError(null);
          showToast('Editor cleared', 'warning');
        }}
        onLoadSample={loadSample}
      />

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-6 flex items-start gap-4 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Backend Offline</h4>
            <p className="text-sm text-slate-300 mt-1">
              {error.includes('offline') || error.includes('connect')
                ? 'Unable to connect to detection server.'
                : error}
            </p>
          </div>
        </div>
      )}

      {result && <ResultPanel result={result} />}
    </div>
  );
}

export default AnalyzeQuery;
