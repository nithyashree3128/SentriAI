import { useEffect, useState } from 'react';
import { apiService } from './services/api';
import type { DetectionResult } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';
import DetailModal from './components/DetailModal';
import Dashboard from './pages/Dashboard';
import AnalyzeQuery from './pages/AnalyzeQuery';
import BatchAnalysis from './pages/BatchAnalysis';
import HistoryPage from './pages/HistoryPage';
import Prevention from './pages/Prevention';
import About from './pages/About';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<DetectionResult | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const verifyHealth = async () => {
    try {
      const health = await apiService.checkHealth();
      const online = health.status === 'online';
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  };

  useEffect(() => {
    void verifyHealth();
    const interval = setInterval(() => {
      void verifyHealth();
    }, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col md:flex-row antialiased overflow-x-hidden">
      <ToastContainer toast={toast} />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isOnline={isOnline}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          showToast={showToast}
          onSync={verifyHealth}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard setActiveTab={setActiveTab} setSelectedDetection={setSelectedDetection} />
          )}
          {activeTab === 'analyze' && <AnalyzeQuery showToast={showToast} />}
          {activeTab === 'batch' && (
            <BatchAnalysis showToast={showToast} setSelectedDetection={setSelectedDetection} />
          )}
          {activeTab === 'history' && (
            <HistoryPage setSelectedDetection={setSelectedDetection} showToast={showToast} />
          )}
          {activeTab === 'prevention' && <Prevention />}
          {activeTab === 'about' && <About />}
        </main>
      </div>

      <DetailModal detection={selectedDetection} onClose={() => setSelectedDetection(null)} />
    </div>
  );
}
