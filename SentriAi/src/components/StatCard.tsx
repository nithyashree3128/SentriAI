export function StatCard({ title, value, desc, trend, icon: Icon, color }: { title: string; value: string | number; desc: string; trend: string; icon: any; color: 'cyan' | 'rose' | 'emerald' | 'amber' }) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/30',
    rose: 'from-rose-500/25 to-red-600/20 text-rose-400 border-rose-500/30',
    emerald: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-yellow-600/20 text-amber-400 border-amber-500/30'
  };

  return (
    <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">{desc}</span>
          <span className="text-[11px] font-semibold text-cyan-400">{trend}</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
