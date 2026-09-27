import { Shield, Cpu, Server } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export function About() {
  const tech = ['Python', 'FastAPI', 'Random Forest', 'Character TF-IDF', 'SQL Normalization', 'React 18', 'Vite', 'Tailwind CSS'];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">About SentriAI</h3>
        <p className="text-sm text-slate-400 mt-1">
          Next-generation security intelligence for SQL injection detection and education.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-[#181b26] via-[#121520] to-[#181b26] border border-slate-800 p-8 shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Shield className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold text-white">Machine Learning Powered Defense</h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          SentriAI utilizes a robust Random Forest classifier combined with character-level TF-IDF feature extraction and context-aware rule analysis to accurately detect SQL injection attempts across database queries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#12141c] border border-slate-800 p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Detection Pipeline</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every submitted query undergoes input length verification, SQL whitespace and URL normalization, unquoted SQL token extraction for high-precision signature checks, followed by Random Forest character n-gram inference.
          </p>
        </div>

        <div className="rounded-2xl bg-[#12141c] border border-slate-800 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Server className="w-4 h-4" />
            <span>FastAPI Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Connected live to <code>{API_BASE_URL}</code> providing high-throughput single detection (<code>/detect</code>), bulk analysis (<code>/detect/batch</code>), file processing (<code>/detect/file</code>), and history tracking (<code>/history</code>).
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-slate-800 p-6 sm:p-8 space-y-4">
        <h4 className="text-base font-bold text-white">Technology Stack</h4>
        <div className="flex flex-wrap gap-2 pt-2">
          {tech.map((t, i) => (
            <span
              key={i}
              className="px-3.5 py-1.5 rounded-xl bg-[#181b26] border border-slate-700/80 text-cyan-300 text-xs font-mono font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
