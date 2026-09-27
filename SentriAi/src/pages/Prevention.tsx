import { BookOpen, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export function Prevention() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">SQL Injection Prevention Guide</h3>
        <p className="text-sm text-slate-400 mt-1">
          Understand the mechanics of SQL injection vulnerabilities and learn industry-standard remediation techniques.
        </p>
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-white">What is SQL Injection (SQLi)?</h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          SQL Injection is a code injection technique that exploits security vulnerabilities in an application's database query layer. It occurs when untrusted user input is directly concatenated or interpreted as SQL command syntax, allowing attackers to manipulate queries, bypass authentication checks, or exfiltrate sensitive data.
        </p>
      </div>

      {/* Advisory Note */}
      <div className="rounded-2xl bg-cyan-500/5 border border-cyan-500/20 p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-400">Detection vs Prevention:</strong> SentriAI provides advanced Machine Learning detection to monitor and flag potentially malicious queries. However, full prevention is achieved at the database driver layer using parameterized queries, making syntax manipulation structurally impossible.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#12141c] border border-rose-500/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400" /> Vulnerable Approach
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0c12] border border-slate-800 font-mono text-xs text-rose-300 mb-4 overflow-x-auto whitespace-pre-wrap">
            <code>{`// Insecure String Concatenation\n$query = "SELECT * FROM users WHERE username = '" . $_POST['user'] . "';";\n$db->query($query);`}</code>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Allows arbitrary command execution and boolean condition manipulation (e.g. <code>' OR '1'='1</code>).
          </p>
        </div>

        <div className="rounded-2xl bg-[#12141c] border border-emerald-500/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Safe Approach (Parameterized)
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0c12] border border-slate-800 font-mono text-xs text-emerald-300 mb-4 overflow-x-auto whitespace-pre-wrap">
            <code>{`// Safe Prepared Statement\n$stmt = $pdo->prepare('SELECT * FROM users WHERE username = :user');\n$stmt->execute(['user' => $userInput]);`}</code>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Separates query logic from user-supplied parameters completely in the database driver.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Prevention;
