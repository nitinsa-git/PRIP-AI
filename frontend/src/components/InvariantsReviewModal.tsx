import React, { useState } from 'react';
import { 
  BookMarked, Copy, Check, ShieldCheck, 
  Terminal, Search, Sparkles, X, ExternalLink 
} from 'lucide-react';
import { InvariantProof } from '../types';

interface InvariantsReviewModalProps {
  invariants: InvariantProof[];
  isOpen: boolean;
  onClose: () => void;
}

export const InvariantsReviewModal: React.FC<InvariantsReviewModalProps> = ({
  invariants,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNum, setCopiedNum] = useState<number | null>(null);

  if (!isOpen) return null;

  const filtered = invariants.filter(
    (inv) =>
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.number.toString() === searchTerm.trim()
  );

  const handleCopyQuote = (inv: InvariantProof) => {
    const markdownQuote = `> **${inv.number}. ${inv.title}**\n> ${inv.quote}`;
    navigator.clipboard.writeText(markdownQuote);
    setCopiedNum(inv.number);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] glass-card rounded-2xl border border-cyan-500/30 shadow-glow-cyan/20 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0a0f1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                The 12 Architecture Invariants
                <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Review & Quote Index
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Short on purpose so they can be quoted in pull request reviews and architecture deliberations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-white/5 bg-[#090d17]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search invariants by number, quote, or principle (e.g., 'serialize', 'evidence', 'undo')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0e1424] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Invariants Cards List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
          {filtered.map((inv) => (
            <div
              key={inv.number}
              className="p-4 rounded-xl bg-[#0e1424]/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 border border-cyan-500/30">
                    {inv.number}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {inv.title}
                  </h4>
                </div>

                <button
                  onClick={() => handleCopyQuote(inv)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    copiedNum === inv.number
                      ? 'bg-emerald-500 text-black shadow-glow-neon'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                  title="Copy markdown quote to paste into Git/PR review"
                >
                  {copiedNum === inv.number ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Quote!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Quote in Review</span>
                    </>
                  )}
                </button>
              </div>

              {/* Exact Quote Block */}
              <div className="p-3 rounded-lg bg-[#07090e] border-l-2 border-cyan-400 text-cyan-200 text-xs leading-relaxed italic">
                "{inv.quote}"
              </div>

              {/* Rationale & Enforcement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                <div>
                  <span className="text-slate-300 font-semibold">Architectural Rationale: </span>
                  {inv.rationale}
                </div>
                <div>
                  <span className="text-emerald-400 font-semibold">Live Enforcement: </span>
                  {inv.enforcement_layer}
                </div>
              </div>

              {/* Live Telemetry Proof */}
              <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><span className="font-bold">Empirical Proof:</span> {inv.live_telemetry_proof}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#070a12] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>12 Core Principles Enforced by PRIP-AI Reasoning Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
