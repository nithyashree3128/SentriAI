import { useState } from 'react';
import { FileCode, Play, RefreshCw, Upload } from 'lucide-react';

export function BatchUploader({
  onFileUpload,
  onPasteAnalyze,
  isRunning,
}: {
  onFileUpload: (file: File) => void;
  onPasteAnalyze: (queries: string[]) => void;
  isRunning: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handlePasteSubmit = () => {
    const lines = pastedText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      onPasteAnalyze(lines);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl bg-[#12141c] border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 p-8 flex flex-col items-center justify-center text-center transition-all relative group cursor-pointer">
        <input
          type="file"
          accept=".txt,.sql,.csv"
          onChange={handleFileChange}
          disabled={isRunning}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
        />

        {isRunning && selectedFile ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Analyzing {selectedFile.name}...</h4>
            <p className="text-xs text-slate-400">Uploading and inspecting queries with backend ML...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <FileCode className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">{selectedFile.name}</h4>
            <p className="text-xs text-slate-400 mb-3">
              {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another file to replace
            </p>
            <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Selected File
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Drop your SQL, TXT or CSV file here</h4>
            <p className="text-xs text-slate-400 mb-4">Supports up to 1,000 queries per batch (.txt, .sql, .csv)</p>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-[#181b26] hover:bg-slate-800 text-slate-200 font-medium text-xs border border-slate-700/80 transition-all shadow-sm pointer-events-none"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 p-6 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Paste Multiple Queries</h4>
          <p className="text-xs text-slate-400 mb-4">Enter one query per line (Max 1,000).</p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="SELECT * FROM users WHERE id = 1;&#10;SELECT * FROM accounts WHERE name = 'admin';"
            rows={5}
            className="w-full bg-[#0a0c12] text-cyan-300 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60 transition-colors resize-none leading-relaxed"
          />
        </div>
        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">Newline delimited</span>
          <button
            type="button"
            onClick={handlePasteSubmit}
            disabled={isRunning || !pastedText.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>Analyze Batch</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchUploader;
