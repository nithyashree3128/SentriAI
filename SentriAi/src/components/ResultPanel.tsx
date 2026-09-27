import { AlertTriangle } from 'lucide-react';
import type { DetectionResult } from '../types';

export function ResultPanel({ result }: { result: DetectionResult }) {
  const isMalicious = result.status === 'malicious';
  return (
    <div className={`rounded-2xl border p-6 sm:p-8 shadow-2xl animate-slide-up ${isMalicious ? 'bg-rose-950/10 border-rose-500/40' : 'bg-emerald-950/10 border-emerald-500/40'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isMalicious ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {isMalicious ? '🔴' : '🟢'}
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{result.result || (isMalicious ? 'SQL INJECTION DETECTED' : 'LEGITIMATE QUERY')}</h4>
            <p className="text-sm text-slate-400 mt-0.5">Confidence: <strong className="text-white">{result.confidence}%</strong></p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${isMalicious ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
          Risk Level: {result.threatLevel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detected Indicators</span>
          <div className="space-y-2">
            {result.indicators?.map((ind, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-200 bg-[#12141c] p-2.5 rounded-lg border border-slate-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{ind}</span>
              </div>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block pt-2">Analyzed Query Structure</span>
          <div className="p-3 rounded-lg bg-[#0a0c12] font-mono text-xs text-cyan-300 border border-slate-800 break-words whitespace-pre-wrap">
            {result.normalizedQuery || result.query}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analysis Explanation</span>
            <p className="text-sm text-slate-300 bg-[#12141c] p-4 rounded-xl border border-slate-800 mt-1 leading-relaxed">
              {result.explanation}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remediation Recommendation</span>
            <p className="text-sm text-slate-300 bg-[#12141c] p-4 rounded-xl border border-slate-800 mt-1 leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;
