import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, BookOpen, GitPullRequest, 
  CheckCircle2, XCircle, AlertTriangle, Code2, Play, Sparkles, ExternalLink 
} from 'lucide-react';
import { ConformanceEvaluation, ArchitectureStandard } from '../types';

interface ArchitectureGateProps {
  evaluations: ConformanceEvaluation[];
  standards: ArchitectureStandard[];
  onEvaluateCustomPR: (pr: { pr_id: string; repo: string; title: string; author: string; filename: string; diff: string }) => Promise<void>;
  evaluating: boolean;
}

export const ArchitectureGate: React.FC<ArchitectureGateProps> = ({
  evaluations,
  standards,
  onEvaluateCustomPR,
  evaluating,
}) => {
  const [activeTab, setActiveTab] = useState<'evaluations' | 'standards' | 'sandbox'>('evaluations');
  const [testRepo, setTestRepo] = useState('payment-checkout-api');
  const [testTitle, setTestTitle] = useState('Add quick sync REST client for tax invoice');
  const [testFilename, setTestFilename] = useState('src/clients/tax.py');
  const [testDiff, setTestDiff] = useState(
`import httpx

async def get_tax_rate(postal_code: str):
    # Direct cross-domain call without circuit breaker or fallback
    response = httpx.get(f"https://tax-service.internal/v1/rates?code={postal_code}")
    return response.json()`
  );

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEvaluateCustomPR({
      pr_id: `PR #${Math.floor(Math.random() * 500) + 500}`,
      repo: testRepo,
      title: testTitle,
      author: '@youth-dev',
      filename: testFilename,
      diff: testDiff,
    });
    setActiveTab('evaluations');
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Pillar 2 Introduction Banner */}
      <div className="bg-gradient-to-r from-[#0d1824] to-[#122424] p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
            Reasoning Pillar 2
          </span>
          <span className="text-xs font-mono text-slate-400">
            Architecture Conformance Agent (Focus Area #3)
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Merge-Time Architecture Gatekeeper
          <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
            Conformance Measured at Merge, Not at Audit
          </span>
        </h3>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Remembers enterprise architecture standards and evaluates code at the exact moment of decision — the Pull Request merge.
          Eliminates monolithic drift and high-blast-radius coupling before bits reach production.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'evaluations'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Merge Gate Evaluations ({evaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('standards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'standards'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>ADR Standards Catalog ({standards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'sandbox'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Live PR Diff Simulator</span>
        </button>
      </div>

      {/* Tab 1: Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          {evaluations.map((ev, idx) => (
            <div
              key={idx}
              className={`glass-card p-5 rounded-2xl border transition-all ${
                ev.conforms
                  ? 'border-emerald-500/30 hover:border-emerald-500/60'
                  : 'border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {ev.conforms ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {ev.pr_id} ({ev.repo})
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        ev.conforms
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {ev.conforms ? 'Passed Merge Gate' : 'Merge Blocked'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      By {ev.author} • {ev.checked_at}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-300">
                  {ev.violations.length} Standard Violation{ev.violations.length !== 1 ? 's' : ''}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-200 mb-3">
                {ev.title}
              </h4>

              {/* Violations Details */}
              {ev.violations.length > 0 && (
                <div className="space-y-2.5 mt-3 pt-3 border-t border-white/5">
                  {ev.violations.map((violation, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-3 rounded-xl bg-[#0a0f1c] border border-rose-500/20 space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-rose-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          [{violation.rule_code}] {violation.rule_title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold uppercase">
                          {violation.severity}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Target: <span className="text-cyan-300">{violation.location}</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        {violation.detail}
                      </div>
                      <div className="text-emerald-400 text-[11px] pt-1 border-t border-white/5">
                        <span className="font-bold">Required Fix: </span>
                        {violation.remediation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Fix / Golden Path guidance */}
              <div className="mt-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-cyan-200 flex items-center justify-between">
                <span><span className="text-cyan-400 font-bold">Architecture Guidance: </span>{ev.recommended_fix}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Standards Catalog */}
      {activeTab === 'standards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standards.map((std) => (
            <div
              key={std.id}
              className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {std.code}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  std.severity === 'BLOCKING'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {std.severity}
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">
                {std.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {std.description}
              </p>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Category: {std.category}</span>
                <a
                  href={std.golden_path_ref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Golden Path Spec</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: PR Diff Simulator */}
      {activeTab === 'sandbox' && (
        <form onSubmit={handleTestSubmit} className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Live PR Diff Simulation Sandbox
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Submit a mock Pull Request diff to witness the real-time Architecture Conformance agent analyze and enforce policies at merge time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">Repository</label>
              <input
                type="text"
                value={testRepo}
                onChange={(e) => setTestRepo(e.target.value)}
                className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">PR Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Modified File</label>
              <input
                type="text"
                value={testFilename}
                onChange={(e) => setTestFilename(e.target.value)}
                className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 mb-1 block">
              Pull Request Code Diff (Try adding direct foreign joins or synchronous RPC calls)
            </label>
            <textarea
              rows={6}
              value={testDiff}
              onChange={(e) => setTestDiff(e.target.value)}
              className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:border-cyan-500 outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={evaluating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{evaluating ? 'Analyzing Diff...' : 'Execute Merge-Time Conformance Check'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
