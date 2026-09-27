import { Eye } from 'lucide-react';
import type { DetectionResult } from '../types';
import StatusIndicator from './StatusIndicator';

export function DetectionTable({
  items,
  onViewDetail,
}: {
  items: DetectionResult[];
  onViewDetail: (item: DetectionResult) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 bg-[#161922] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-3.5 px-6">Query</th>
            <th className="py-3.5 px-6">Classification</th>
            <th className="py-3.5 px-6">Confidence</th>
            <th className="py-3.5 px-6">Timestamp</th>
            <th className="py-3.5 px-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onViewDetail(item)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
            >
              <td className="py-4 px-6 font-mono text-xs text-slate-300 max-w-xs truncate">
                {item.query}
              </td>
              <td className="py-4 px-6">
                <StatusIndicator status={item.status} text={item.result} />
              </td>
              <td className="py-4 px-6 font-semibold text-slate-200">
                {item.confidence}%
              </td>
              <td className="py-4 px-6 text-slate-400 text-xs">
                {item.time || item.date}
              </td>
              <td className="py-4 px-6 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(item);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#181b26] hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-300 text-xs font-medium border border-slate-700/80 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                No detections yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DetectionTable;
