import { Menu, RefreshCw } from 'lucide-react';

export function Header({
  activeTab,
  setSidebarOpen,
  showToast,
  onSync,
}: {
  activeTab: string;
  setSidebarOpen: (o: boolean) => void;
  showToast: (m: string, t?: string) => void;
  onSync?: () => Promise<boolean | void>;
}) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time security telemetry & SQL threat intelligence',
    },
    analyze: {
      title: 'Analyze SQL Query',
      subtitle: 'Deep ML inspection and pattern analysis for single SQL statements',
    },
    batch: {
      title: 'Batch Query Analysis',
      subtitle: 'Bulk scan audit logs and multi-statement SQL files (.txt, .sql, .csv)',
    },
    history: {
      title: 'Detection History',
      subtitle: 'Comprehensive audit trail of inspected database operations',
    },
    prevention: {
      title: 'SQL Injection Prevention',
      subtitle: 'Security handbook and remediation strategies',
    },
    about: {
      title: 'About SentriAI',
      subtitle: 'Platform architecture, machine learning models, and system info',
    },
  };
  const current = titles[activeTab] || titles.dashboard;

  const handleSync = async () => {
    if (onSync) {
      const online = await onSync();
      if (online === false) {
        showToast('Backend is offline. Unable to synchronize.', 'error');
        return;
      }
    }
    showToast('Backend connected and feeds synchronized.', 'success');
  };

  return (
    <header className="bg-[#12141c]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{current.title}</h2>
          <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">{current.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSync}
          className="p-2.5 rounded-xl bg-[#181b26] border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:border-cyan-500/40"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium hidden md:inline">Sync Feed</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
