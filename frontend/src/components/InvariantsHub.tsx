import React, { useState } from 'react';
import { 
  Lock, GitFork, ShieldAlert, Cpu, Sparkles, Scale, 
  RotateCcw, CheckCircle2, AlertTriangle, ArrowRight, 
  Terminal, Activity, BookMarked, Copy, Check, Layers, Undo2 
} from 'lucide-react';
import { 
  InvariantProof, ArbiterStatus, SpecialistConflict, 
  PlayAutonomyRecord, DeclaredCapability, ControlledAction 
} from '../types';

interface InvariantsHubProps {
  invariants: InvariantProof[];
  arbiterStatus: ArbiterStatus | null;
  conflicts: SpecialistConflict[];
  trustLadder: PlayAutonomyRecord[];
  capabilities: DeclaredCapability[];
  actions: ControlledAction[];
  onRollbackAction: (actionId: string) => Promise<void>;
  rollingBackId: string | null;
  onOpenReviewModal: () => void;
}

export const InvariantsHub: React.FC<InvariantsHubProps> = ({
  invariants,
  arbiterStatus,
  conflicts,
  trustLadder,
  capabilities,
  actions,
  onRollbackAction,
  rollingBackId,
  onOpenReviewModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'arbiter' | 'conflicts' | 'ladder' | 'capabilities' | 'undo'>('arbiter');
  const [copiedNum, setCopiedNum] = useState<number | null>(null);

  const executedActionsWithUndo = actions.filter((a) => a.status === 'EXECUTED');

  const handleCopyQuote = (inv: InvariantProof) => {
    const md = `> **${inv.number}. ${inv.title}**\n> ${inv.quote}`;
    navigator.clipboard.writeText(md);
    setCopiedNum(inv.number);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 12 Invariants Cockpit Hero Banner */}
      <div className="bg-gradient-to-r from-[#0d1627] via-[#16122d] to-[#12222a] p-5 rounded-2xl border border-cyan-500/30 shadow-glow-cyan/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                System Invariants Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                12 Non-Negotiable Core Rules
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Architecture Invariants Cockpit
              <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                100% Enforced in Code
              </span>
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Short on purpose so they can be quoted in review. Live software guards enforce parallel read fan-outs, serialized write arbiters, evidence pointers, verbatim dissent, and compensating rollbacks.
            </p>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-extrabold text-xs shadow-glow-cyan transition-all shrink-0"
          >
            <BookMarked className="w-4 h-4" />
            <span>Review Quotes Index</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('arbiter')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'arbiter'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>§1: WriteArbiter & Fan-Out</span>
        </button>

        <button
          onClick={() => setActiveSubTab('conflicts')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'conflicts'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>§5 & §11: Conflict Escrow ({conflicts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ladder')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'ladder'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>§8: Autonomy Trust Ladder ({trustLadder.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('capabilities')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'capabilities'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>§10: Capability Discovery ({capabilities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('undo')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'undo'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>§12: Compensating Rollback Deck</span>
        </button>
      </div>

      {/* Sub-Tab 1: WriteArbiter & Fan-out Reads (Invariant 1) */}
      {activeSubTab === 'arbiter' && arbiterStatus && (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400">Arbiter Mode</span>
              <div className="text-lg font-extrabold text-cyan-300">{arbiterStatus.arbiter_mode}</div>
              <div className="text-[11px] text-slate-500">Strict FIFO Mutex</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400">Monotonic Sequence</span>
              <div className="text-lg font-extrabold text-white">#{arbiterStatus.current_sequence}</div>
              <div className="text-[11px] text-emerald-400">0 Sequence Skips</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400">Idempotency Keys Cached</span>
              <div className="text-lg font-extrabold text-amber-300">{arbiterStatus.idempotency_keys_cached} Keys</div>
              <div className="text-[11px] text-slate-500">Zero duplicate replays</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400">Parallel Read Fan-Out</span>
              <div className="text-lg font-extrabold text-emerald-400">{arbiterStatus.parallel_read_threads_active} Workers</div>
              <div className="text-[11px] text-slate-500">Reads parallel without limit</div>
            </div>
          </div>

          {/* Sequential Commit Stream */}
          <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              WriteArbiter Monotonic Serialization Queue
            </h4>
            <p className="text-slate-400 text-xs">
              Every state change across Git, Jira, or CI/CD is stamped with an incrementing sequence number and evaluated for idempotency before touching real infrastructure.
            </p>

            <div className="space-y-2 mt-3">
              {arbiterStatus.recent_sequence_log.map((entry) => (
                <div
                  key={entry.sequence_number}
                  className="p-3 rounded-xl bg-[#090d16] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      Seq #{entry.sequence_number}
                    </span>
                    <span className="font-bold text-white">[{entry.target_system}] {entry.action_type}</span>
                    <span className="text-slate-500 text-[11px]">{entry.action_id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Key: <code className="text-amber-300">{entry.idempotency_key}</code></span>
                    <span>{entry.committed_at.slice(11, 19)} UTC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Conflict Escrow & Verbatim Dissent (Invariants 5 & 11) */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#140e24] border border-violet-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="text-violet-300 font-bold">Invariants §5 & §11 Enforced: </span>
              When two specialists disagree, the reasoning engine refuses to average scores or quietly pick a winner. Dissent is recorded verbatim and escalated to human engineers with dual evidence pointers.
            </div>
          </div>

          <div className="space-y-4">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className="glass-card p-5 rounded-2xl border border-rose-500/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{conf.topic}</span>
                    <span className="text-slate-400">({conf.context_ref})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase">
                    {conf.status}
                  </span>
                </div>

                {/* Opposing Stances Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Specialist A */}
                  <div className="p-3.5 rounded-xl bg-[#0d1222] border border-cyan-500/20 space-y-2">
                    <div className="text-cyan-300 font-bold flex items-center justify-between">
                      <span>{conf.agent_a_name}</span>
                      <span className="text-[10px] text-slate-400">Position A</span>
                    </div>
                    <div className="text-slate-200 text-xs leading-relaxed">{conf.agent_a_stance}</div>
                    <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span className="text-cyan-400 font-semibold">Evidence: </span>
                      <code className="text-slate-300">{conf.agent_a_evidence.uri}</code>
                    </div>
                  </div>

                  {/* Specialist B */}
                  <div className="p-3.5 rounded-xl bg-[#1c0d18] border border-rose-500/20 space-y-2">
                    <div className="text-rose-300 font-bold flex items-center justify-between">
                      <span>{conf.agent_b_name}</span>
                      <span className="text-[10px] text-slate-400">Position B</span>
                    </div>
                    <div className="text-slate-200 text-xs leading-relaxed">{conf.agent_b_stance}</div>
                    <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span className="text-rose-400 font-semibold">Evidence: </span>
                      <code className="text-slate-300">{conf.agent_b_evidence.uri}</code>
                    </div>
                  </div>
                </div>

                {/* Verbatim Dissent (§11) */}
                <div className="p-3.5 rounded-xl bg-[#090b14] border-l-4 border-rose-500 text-xs text-rose-200 space-y-1">
                  <div className="text-rose-400 font-bold text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Invariant §11 Verbatim Dissent Log (Preserved in Decision Record):
                  </div>
                  <div className="italic leading-relaxed">
                    {conf.verbatim_dissent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Autonomy Trust Ladder (Invariant 8) */}
      {activeSubTab === 'ladder' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#0d1624] border border-cyan-500/20 flex items-start gap-3">
            <Scale className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="text-cyan-300 font-bold">Invariant §8 Enforced: </span>
              Autonomy is earned per play, measured, and reversible. Every play starts at Suggest-Only (L0) and requires 20 consecutive clean executions without human reversal to earn autonomous dispatch. Any rollback instantly triggers demotion.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trustLadder.map((play) => (
              <div
                key={play.play_id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{play.play_name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    play.current_level === 3
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : play.current_level === 2
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    Level {play.current_level}: {play.level_name}
                  </span>
                </div>

                {/* Progress to Next Promotion */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Promotion Evidence Progress</span>
                    <span className="text-cyan-300 font-bold">
                      {play.consecutive_clean_plays} / {play.threshold_for_promotion} Clean Plays
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                      style={{ width: `${Math.min(100, (play.consecutive_clean_plays / play.threshold_for_promotion) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Total Plays: <span className="text-white font-bold">{play.total_executions}</span></span>
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-rose-400" />
                    Rollbacks: <span className="text-rose-400 font-bold">{play.rollbacks_count}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">Reversible: YES</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Dynamic Capability Discovery (Invariant 10) */}
      {activeSubTab === 'capabilities' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#101428] border border-indigo-500/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="text-indigo-300 font-bold">Invariant §10 Enforced: </span>
              Capability is discovered, never hard-coded. The orchestrator planner discovers advertised capabilities through dynamic capability descriptors rather than coupling to hardcoded agent identities.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.id}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                    {cap.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    cap.deterministic_supported
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {cap.deterministic_supported ? 'Deterministic 0ms' : 'Model Fallback'}
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {cap.description}
                </p>

                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  Advertised by: <span className="text-cyan-300 font-semibold">{cap.owning_agent_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Compensating Rollback Deck (Invariant 12) */}
      {activeSubTab === 'undo' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#1c1214] border border-rose-500/30 flex items-start gap-3">
            <Undo2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="text-rose-300 font-bold">Invariant §12 Enforced: </span>
              Every state change ships with its undo. Compensating actions are defined before execution, not after failure. You can trigger an idempotent rollback on any executed mutation below.
            </div>
          </div>

          <div className="space-y-3">
            {executedActionsWithUndo.length === 0 ? (
              <div className="p-8 text-center glass-card rounded-2xl border border-white/10 text-slate-400">
                No executed mutations in the WriteArbiter. Execute an action from the Controlled Tool Console to inspect active compensating undo controls.
              </div>
            ) : (
              executedActionsWithUndo.map((act) => (
                <div
                  key={act.id}
                  className="glass-card p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold">
                          Seq #{act.sequence_number}
                        </span>
                        <span className="font-bold text-white text-sm">{act.description}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Target: {act.target_system} • Idempotency Key: <code className="text-cyan-300">{act.idempotency_key}</code>
                      </div>
                    </div>

                    <button
                      onClick={() => onRollbackAction(act.id)}
                      disabled={rollingBackId === act.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-glow-violet transition-all disabled:opacity-50 shrink-0"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>{rollingBackId === act.id ? 'Rolling Back...' : 'Execute Compensating Undo'}</span>
                    </button>
                  </div>

                  {/* Pre-flight Compensating Action Payload */}
                  <div className="p-3 rounded-xl bg-[#090b14] border border-rose-500/20 text-[11px] space-y-1">
                    <div className="text-rose-400 font-bold flex items-center gap-1.5">
                      <Undo2 className="w-3 h-3" />
                      Pre-Defined Compensating Payload:
                    </div>
                    <div className="text-slate-300">
                      {act.compensating_action.description}
                    </div>
                    <div className="text-slate-500">
                      Undo Action: <code className="text-rose-300">{act.compensating_action.undo_action_type}</code> • Reversion Target: {act.compensating_action.undo_target}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
