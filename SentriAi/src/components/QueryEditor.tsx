import { Play, RefreshCw } from 'lucide-react';

export function QueryEditor({
  query,
  setQuery,
  onAnalyze,
  isLoading,
  onClear,
  onLoadSample,
}: {
  query: string;
  setQuery: (q: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
  onLoadSample: (type: 'malicious' | 'safe') => void;
}) {
  return (
    <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 shadow-xl overflow-hidden">
      <div className="bg-[#161922] px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 font-mono text-xs text-slate-400">query_inspector.sql</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLoadSample('malicious')}
            className="text-[11px] px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors"
          >
            Sample Malicious
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('safe')}
            className="text-[11px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            Sample Safe
          </button>
        </div>
      </div>
      <div className="p-6">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM users WHERE username = 'admin';"
          rows={6}
          className="w-full bg-[#0a0c12] text-cyan-300 font-mono text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60 transition-colors resize-y leading-relaxed"
          spellCheck={false}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2.5 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isLoading ? 'Analyzing Query...' : 'Analyze Query'}</span>
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={isLoading || !query}
              className="px-4 py-3 rounded-xl bg-[#181b26] hover:bg-[#252b3b] text-slate-300 font-semibold text-sm border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
          <span className="text-xs text-slate-500 font-mono">Random Forest + TF-IDF Model</span>
        </div>
      </div>
    </div>
  );
}

export default QueryEditor;
