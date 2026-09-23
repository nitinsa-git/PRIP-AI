import React, { useState } from 'react';
import { 
  Flame, ShieldAlert, Sparkles, Scale, AlertTriangle, 
  Clock, Plus, CheckCircle2, ChevronRight, FileCode 
} from 'lucide-react';
import { DebtChallenge, ArchitectureWaiver } from '../types';

interface TechDebtArenaProps {
  challenges: DebtChallenge[];
  waivers: ArchitectureWaiver[];
  onCreateWaiver: (w: { rule_code: string; service: string; requester: string; justification: string; ttl_days: number; risk_level: string }) => Promise<void>;
  creatingWaiver: boolean;
}

export const TechDebtArena: React.FC<TechDebtArenaProps> = ({
  challenges,
  waivers,
  onCreateWaiver,
  creatingWaiver,
}) => {
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [ruleCode, setRuleCode] = useState('ARC-COUPLING-01');
  const [service, setService] = useState('legacy-reporting-service');
  const [requester, setRequester] = useState('@sprint-lead');
  const [justification, setJustification] = useState('Emergency direct SQL read until Kafka CDC migration completes in Q2');
  const [ttlDays, setTtlDays] = useState(45);
  const [riskLevel, setRiskLevel] = useState('MEDIUM');

  const handleSubmitWaiver = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateWaiver({
      rule_code: ruleCode,
      service,
      requester,
      justification,
      ttl_days: ttlDays,
      risk_level: riskLevel,
    });
    setShowWaiverModal(false);
  };

  const activeWaivers = waivers.filter((w) => w.status !== 'RESOLVED');
  const meanAge = activeWaivers.length > 0 
    ? Math.round(activeWaivers.reduce((acc, curr) => acc + curr.age_days, 0) / activeWaivers.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Blueprint Pillar 3 Introduction Banner */}
      <div className="bg-gradient-to-r from-[#24141d] to-[#1a1226] p-5 rounded-2xl border border-pink-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase tracking-wider">
            Reasoning Pillar 3
          </span>
          <span className="text-xs font-mono text-slate-400">
            Delivery Governor & Architecture Authority
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Technical Debt Challenger & Waiver Governance
          <span className="text-xs font-mono font-normal text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
            Challenge Before Hardening
          </span>
        </h3>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Challenges shortcuts and architectural trade-offs while choices are still fluid.
          Governs temporary waivers with strict time-to-live (TTL) limits to eliminate perennial technical debt rot.
        </p>
      </div>

      {/* Grid: Challenges vs Active Waivers Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Proactive Debt Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-pink-500" />
              Proactive Debt Challenges ({challenges.length})
            </h4>
            <span className="text-xs font-mono text-slate-400">
              Counter-Proposals Active
            </span>
          </div>

          <div className="space-y-4">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-pink-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    {c.target_ref} • {c.component}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
                      Risk Score: {c.debt_impact_score}/100
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d0912] border border-pink-500/20 text-xs font-mono space-y-1">
                  <div className="text-rose-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Shortcut Detected:
                  </div>
                  <div className="text-slate-300">
                    {c.shortcut_detected}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#09121a] border border-cyan-500/20 text-xs font-mono space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Agent Counter-Proposal:
                  </div>
                  <div className="text-slate-200">
                    {c.counter_proposal}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
                  <span>Advocated by: <span className="text-slate-200">{c.owning_agent}</span></span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    c.status === 'OPEN' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Architecture Waivers Register */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              Active Waivers & Governance Health
            </h4>
            <button
              onClick={() => setShowWaiverModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Propose Waiver</span>
            </button>
          </div>

          {/* Governance Health KPI Pill */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#14122e] to-[#1a143b] border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
            <div>
              <div className="text-slate-400">Mean Waiver Age</div>
              <div className="text-2xl font-extrabold text-indigo-300">{meanAge} Days</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400">Governance Velocity</div>
              <div className="text-xs text-emerald-400 font-bold">Auto-Expirations Active</div>
            </div>
          </div>

          <div className="space-y-3">
            {waivers.map((w) => (
              <div
                key={w.id}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all space-y-2.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {w.id}
                    </span>
                    <span className="text-indigo-400 font-semibold">{w.rule_code}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    w.status === 'EXPIRED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : w.status === 'REVIEW_NEEDED'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div className="text-slate-300 text-[11px]">
                  Service: <span className="text-white font-semibold">{w.service}</span> • Named Owner: <span className="text-cyan-300 font-semibold">{w.named_owner || w.requester}</span>
                </div>

                <div className="p-2 rounded bg-black/40 text-slate-300 text-[11px] border border-white/5">
                  "{w.justification}"
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    Age: <span className="text-white font-bold">{w.age_days}d</span> / TTL: {w.ttl_days}d
                  </span>
                  <span className={`font-bold ${w.risk_level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                    Risk: {w.risk_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Propose Waiver Modal */}
      {showWaiverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSubmitWaiver} 
            className="w-full max-w-lg glass-card p-6 rounded-2xl border border-indigo-500/40 shadow-glow-violet space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                Propose Controlled Architecture Waiver
              </h4>
              <button
                type="button"
                onClick={() => setShowWaiverModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Architecture Rule Code</label>
              <select
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 outline-none"
              >
                <option value="ARC-COUPLING-01">ARC-COUPLING-01 (Decoupled Cross-Domain RPC)</option>
                <option value="ARC-DB-02">ARC-DB-02 (No Direct Foreign Schema Join)</option>
                <option value="ARC-OBS-04">ARC-OBS-04 (Mandatory Trace Propagation)</option>
                <option value="ARC-SEC-07">ARC-SEC-07 (Zero Hardcoded Secrets)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Service / Workload</label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Requester Handle</label>
                <input
                  type="text"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Technical Justification</label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Hard TTL Expiry (Days)</label>
                <input
                  type="number"
                  value={ttlDays}
                  onChange={(e) => setTtlDays(Number(e.target.value))}
                  className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Risk Classification</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-slate-200 outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH (Requires Arch Council)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowWaiverModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingWaiver}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-glow-violet disabled:opacity-50"
              >
                {creatingWaiver ? 'Logging...' : 'Register Temporary Waiver'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
