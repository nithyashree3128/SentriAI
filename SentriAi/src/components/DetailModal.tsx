import { Shield, X } from 'lucide-react';
import type { DetectionResult } from '../types';
import StatusIndicator from './StatusIndicator';

export function DetailModal({
  detection,
  onClose,
}: {
  detection: DetectionResult | null;
  onClose: () => void;
}) {
  if (!detection) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#12141c] border border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Detection Details ({detection.id})</h4>
              <p className="text-xs text-slate-400">Inspected at {detection.date} {detection.time}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#181b26] border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Classification</span>
              <p className="mt-1"><StatusIndicator status={detection.status} text={detection.result} /></p>
            </div>
            <div className="p-4 rounded-xl bg-[#181b26] border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Confidence Score</span>
              <p className="text-lg font-bold text-white mt-1">{detection.confidence}%</p>
            </div>
            <div className="p-4 rounded-xl bg-[#181b26] border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Threat Level</span>
              <p className={`text-lg font-bold mt-1 ${detection.status === 'malicious' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {detection.threatLevel}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyzed Query</span>
            <div className="p-4 rounded-xl bg-[#0a0c12] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap break-words">
              <code>{detection.query}</code>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explanation</span>
            <div className="p-4 rounded-xl bg-[#181b26] border border-slate-800 text-sm text-slate-300 leading-relaxed">
              {detection.explanation}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommendation</span>
            <div className="p-4 rounded-xl bg-[#181b26] border border-slate-800 text-sm text-slate-300 leading-relaxed border-l-4 border-l-cyan-500">
              {detection.recommendation}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-[#161922] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
