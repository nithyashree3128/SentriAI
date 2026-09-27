export function StatusIndicator({ status, text }: { status: 'malicious' | 'legitimate' | 'suspicious'; text: string }) {
  const styles = {
    malicious: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    legitimate: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    suspicious: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };
  const icons = { malicious: '🔴', legitimate: '🟢', suspicious: '🟡' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${styles[status]}`}>
      <span>{icons[status]}</span>
      <span>{text}</span>
    </span>
  );
}

export default StatusIndicator;
