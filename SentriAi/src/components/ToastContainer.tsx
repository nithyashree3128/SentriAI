import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export function ToastContainer({ toast }: { toast: { message: string; type: string } | null }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#181b26] border border-slate-700/80 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-slide-up">
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
      <span className="text-sm font-medium text-slate-200">{toast.message}</span>
    </div>
  );
}

export default ToastContainer;
