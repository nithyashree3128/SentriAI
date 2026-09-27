import { useEffect, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import { apiService } from '../services/api';
import type { DetectionResult } from '../types';
import DetectionTable from '../components/DetectionTable';

export function HistoryPage({
  setSelectedDetection,
  showToast,
}: {
  setSelectedDetection: (d: DetectionResult) => void;
  showToast: (m: string, t?: string) => void;
}) {
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = async () => {
    setIsRefreshing(true);
    try {
      const data = await apiService.getHistory();
      setHistory(data);
    } catch {
      showToast('Unable to connect to detection server to load history.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.query.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = 'ID,Query,Prediction,Confidence,ThreatLevel,Timestamp\n';
    const rows = history
      .map(
        (r) =>
          `"${r.id}","${r.query.replace(/"/g, '""')}","${r.result}",${r.confidence},"${r.threatLevel}","${r.time}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detection_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Audit logs exported.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Detection History</h3>
          <p className="text-sm text-slate-400 mt-1">
            Review historical SQL inspection logs, confidence metrics, and classifications from backend.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl bg-[#181b26] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search query string or ID..."
            className="bg-[#0a0c12] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0a0c12] text-xs text-slate-300 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="malicious">SQL Injection</option>
            <option value="legitimate">Legitimate</option>
            <option value="suspicious">Suspicious</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#181b26] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 shadow-xl overflow-hidden">
        <DetectionTable items={filteredHistory} onViewDetail={setSelectedDetection} />
      </div>
    </div>
  );
}

export default HistoryPage;
