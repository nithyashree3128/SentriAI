import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Database,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { DashboardStats, DetectionResult } from '../types';
import DetectionTable from '../components/DetectionTable';
import StatCard from '../components/StatCard';

export function Dashboard({
  setActiveTab,
  setSelectedDetection,
}: {
  setActiveTab: (t: string) => void;
  setSelectedDetection: (d: DetectionResult) => void;
}) {
  const [stats, setStats] = useState<DashboardStats>({
    queriesAnalyzed: 0,
    threatsDetected: 0,
    legitimateQueries: 0,
    accuracy: 'N/A',
    trendQueries: 'Live Telemetry',
    trendThreats: '0 flagged',
    trendLegitimate: '0 verified',
    trendAccuracy: 'Avg Confidence',
  });
  const [recentDetections, setRecentDetections] = useState<DetectionResult[]>([]);

  useEffect(() => {
    void apiService.getStats().then(setStats);
    void apiService.getHistory().then((data) => setRecentDetections(data.slice(0, 5)));
  }, []);

  const total = stats.queriesAnalyzed;
  const threats = stats.threatsDetected;
  const legit = stats.legitimateQueries;

  const threatPct = total > 0 ? Math.round((threats / total) * 100) : 0;
  const legitPct = total > 0 ? Math.round((legit / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181b26] via-[#121520] to-[#181b26] border border-slate-800/80 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Random Forest + TF-IDF Detection</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Good day, Security Analyst
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Monitor, analyze, and identify potential SQL injection threats with machine learning and context-aware rule analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('analyze')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <span>Analyze SQL Query</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Queries Analyzed"
          value={stats.queriesAnalyzed.toLocaleString()}
          desc="Total inspected payloads"
          trend={stats.trendQueries}
          icon={Database}
          color="cyan"
        />
        <StatCard
          title="Threats Detected"
          value={stats.threatsDetected.toLocaleString()}
          desc="Malicious SQLi flagged"
          trend={stats.trendThreats}
          icon={Shield}
          color="rose"
        />
        <StatCard
          title="Legitimate Queries"
          value={stats.legitimateQueries.toLocaleString()}
          desc="Passed security checks"
          trend={stats.trendLegitimate}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Average Confidence"
          value={stats.accuracy}
          desc="Model confidence metric"
          trend={stats.trendAccuracy}
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Attack Vectors & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#12141c] border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-white">Detection Telemetry Breakdown</h4>
              <p className="text-xs text-slate-400 mt-0.5">Real-time classification split from backend scan history</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Legitimate ({legit})
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> SQL Injection ({threats})
              </span>
            </div>
          </div>

          {total === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs my-auto">
              No detection telemetry recorded yet. Inspect queries to populate real-time distribution.
            </div>
          ) : (
            <div className="space-y-6 my-auto py-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Legitimate Query Ratio</span>
                  <span className="text-emerald-400 font-mono">{legitPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${legitPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">SQL Injection Threat Ratio</span>
                  <span className="text-rose-400 font-mono">{threatPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${threatPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#181b26]/70 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">Engine: Character TF-IDF (1-4 grams) + Random Forest</span>
            <span className="text-cyan-400 font-bold">FastAPI Telemetry</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white">Security Inspection Pipeline</h4>
            <p className="text-xs text-slate-400 mt-0.5">Execution flow per analyzed query</p>
          </div>
          <div className="space-y-3 my-auto py-4 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-lg bg-[#0a0c12] border border-slate-800 flex items-center justify-between">
              <span>1. Input Validation</span>
              <span className="text-emerald-400">≤ 10k chars</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0a0c12] border border-slate-800 flex items-center justify-between">
              <span>2. SQL Normalization</span>
              <span className="text-cyan-400">Whitespace/URL</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0a0c12] border border-slate-800 flex items-center justify-between">
              <span>3. Context Rules</span>
              <span className="text-amber-400">Fast-Path</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0a0c12] border border-slate-800 flex items-center justify-between">
              <span>4. Random Forest</span>
              <span className="text-purple-400">TF-IDF Vector</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#181b26]/70 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Deterministic Fast-Path</span>
            <span className="text-cyan-400 font-bold">Enabled</span>
          </div>
        </div>
      </div>

      {/* Recent Detections */}
      <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-white">Recent Detections</h4>
            <p className="text-xs text-slate-400 mt-0.5">Real-time log stream from backend history</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All History</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <DetectionTable items={recentDetections} onViewDetail={setSelectedDetection} />
      </div>
    </div>
  );
}

export default Dashboard;
