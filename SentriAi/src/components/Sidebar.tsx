import {
  BookOpen,
  History,
  Info,
  Layers,
  LayoutDashboard,
  Server,
  Shield,
  Terminal,
  X,
} from 'lucide-react';

export function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  isOnline = true,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  isOnline?: boolean;
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Query', icon: Terminal },
    { id: 'batch', label: 'Batch Analysis', icon: Layers },
    { id: 'history', label: 'Detection History', icon: History },
    { id: 'prevention', label: 'Prevention Guide', icon: BookOpen },
    { id: 'about', label: 'About SentriAI', icon: Info },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#12141c] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                SentriAI
              </h1>
              <p className="text-[11px] text-cyan-400/80 font-medium tracking-wider uppercase">
                Security Intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800/60 bg-[#0e1017]">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="text-xs font-medium text-slate-300">
                {isOnline ? 'Backend Online' : 'Backend Offline'}
              </span>
            </div>
            <Server className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
