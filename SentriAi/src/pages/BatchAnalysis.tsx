import { useState } from 'react';
import { Download, Search, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import type { BatchResult, DetectionResult } from '../types';
import BatchUploader from '../components/BatchUploader';
import DetectionTable from '../components/DetectionTable';

export function BatchAnalysis({
  showToast,
  setSelectedDetection,
}: {
  showToast: (m: string, t?: string) => void;
  setSelectedDetection: (d: DetectionResult) => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const handleFileUpload = async (file: File) => {
    setIsRunning(true);
    setError(null);
    showToast(`Uploading and analyzing ${file.name}...`, 'success');
    try {
      const res = await apiService.uploadFile(file);
      setBatchResult(res);
      showToast('Batch file analyzed successfully.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'File analysis failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handlePasteAnalyze = async (queries: string[]) => {
    setIsRunning(true);
    setError(null);
    showToast(`Sending ${queries.length} queries to backend...`, 'success');
    try {
      const res = await apiService.analyzeBatch(queries);
      setBatchResult(res);
      showToast(`Analyzed ${queries.length} queries successfully.`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Batch analysis failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults =
    batchResult?.results.filter((item: DetectionResult) => {
      const matchesSearch = item.query.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesSearch && matchesFilter;
    }) || [];

  const handleExportCSV = () => {
    if (!batchResult || batchResult.results.length === 0) return;
    const headers = 'Query,Prediction,Confidence,ThreatLevel\n';
    const rows = batchResult.results
      .map((r) => `"${r.query.replace(/"/g, '""')}","${r.result}",${r.confidence},"${r.threatLevel}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_detection_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Results exported to CSV', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Batch Analysis</h3>
        <p className="text-sm text-slate-400 mt-1">
          Upload SQL/TXT/CSV files or paste multiple queries for bulk ML inspection.
        </p>
      </div>

      <BatchUploader
        onFileUpload={handleFileUpload}
        onPasteAnalyze={handlePasteAnalyze}
        isRunning={isRunning}
      />

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-6 flex items-start gap-4 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Analysis Failed</h4>
            <p className="text-sm text-slate-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {batchResult && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[#12141c] border border-slate-800/80 p-5">
              <span className="text-xs font-medium text-slate-400">Total Analyzed</span>
              <p className="text-2xl font-bold text-white mt-1">{batchResult.totalAnalyzed}</p>
            </div>
            <div className="rounded-xl bg-[#12141c] border border-slate-800/80 p-5">
              <span className="text-xs font-medium text-slate-400">Legitimate</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{batchResult.legitimateCount}</p>
            </div>
            <div className="rounded-xl bg-[#12141c] border border-slate-800/80 p-5">
              <span className="text-xs font-medium text-slate-400">Malicious Threats</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{batchResult.maliciousCount}</p>
            </div>
            <div className="rounded-xl bg-[#12141c] border border-slate-800/80 p-5">
              <span className="text-xs font-medium text-slate-400">Threat Rate</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{batchResult.threatRate}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">Batch Results</h4>
                <p className="text-xs text-slate-400 mt-0.5">Showing scan results from backend</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search query..."
                    className="bg-[#0a0c12] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 w-48 sm:w-64"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-[#0a0c12] text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="malicious">Malicious</option>
                  <option value="legitimate">Legitimate</option>
                </select>
              </div>
            </div>

            <DetectionTable items={filteredResults} onViewDetail={setSelectedDetection} />

            <div className="p-4 border-t border-slate-800/80 bg-[#161922] flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredResults.length} queries</span>
              <button
                type="button"
                onClick={handleExportCSV}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchAnalysis;
