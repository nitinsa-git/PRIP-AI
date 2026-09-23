import React, { useState } from 'react';
import { 
  AlertOctagon, Clock, Users, ArrowUpRight, CheckCircle2, 
  Terminal, ShieldAlert, Cpu, Sparkles, ChevronDown, ChevronUp 
} from 'lucide-react';
import { StuckWorkItem } from '../types';

interface StuckWorkDetectorProps {
  items: StuckWorkItem[];
  onExecuteAction: (actionId: string) => void;
  executingId: string | null;
}

export const StuckWorkDetector: React.FC<StuckWorkDetectorProps> = ({ 
  items, 
  onExecuteAction, 
  executingId 
}) => {
  const [expandedProofId, setExpandedProofId] = useState<string | null>(items[0]?.id || null);

  const toggleProof = (id: string) => {
    setExpandedProofId(expandedProofId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Pillar 1 Introduction Banner */}
      <div className="bg-gradient-to-r from-[#171424] to-[#12192e] p-5 rounded-2xl border border-violet-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 uppercase tracking-wider">
            Reasoning Pillar 1
          </span>
          <span className="text-xs font-mono text-slate-400">
            Flow Analyst & Build/Release Agents
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Stuck Work Forensics
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Numbers Behind Every Claim
          </span>
        </h3>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Dissects the software delivery pipeline across Git, CI/CD, and Jira to pinpoint where work is truly stalled.
          Every contention alert includes mathematical proof of queue time friction and handoff inflation.
        </p>
      </div>

      {/* Stuck Work Cards */}
      <div className="space-y-4">
        {items.map((item) => {
          const isExpanded = expandedProofId === item.id;
          const isResolved = item.blocker_reason.startsWith('[RESOLVED');

          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl border transition-all ${
                isResolved 
                  ? 'border-emerald-500/30 bg-emerald-950/10' 
                  : item.queue_time_percent > 75 
                    ? 'border-rose-500/30 hover:border-rose-500/60' 
                    : 'border-white/10 hover:border-violet-500/40'
              } p-5`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.entity_type === 'PR' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                        : item.entity_type === 'PIPELINE'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.entity_type}
                    </span>
                    <span className="text-sm font-mono font-bold text-white">
                      {item.entity_key}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {item.team_or_service}
                    </span>
                    <span className="text-xs font-mono text-violet-400 flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {item.owning_agent}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-slate-100">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                    <AlertOctagon className={`w-3.5 h-3.5 ${isResolved ? 'text-emerald-400' : 'text-amber-400'} shrink-0`} />
                    {item.blocker_reason}
                  </p>
                </div>

                {/* Queue Time Telemetry Pill & Active Ratio Bar */}
                <div className="lg:w-72 bg-[#0a0e17] p-3 rounded-xl border border-white/5 space-y-2 shrink-0">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Queue Idle
                    </span>
                    <span className={`font-bold ${item.queue_time_percent > 70 ? 'text-rose-400' : 'text-amber-300'}`}>
                      {item.queue_time_hours}h ({item.queue_time_percent}%)
                    </span>
                  </div>

                  {/* Progress Bar: Queue vs Active */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${item.queue_time_percent > 75 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${item.queue_time_percent}%` }}
                      title={`Queue time: ${item.queue_time_percent}%`}
                    />
                    <div 
                      className="h-full bg-emerald-500"
                      style={{ width: `${100 - item.queue_time_percent}%` }}
                      title={`Active working time: ${100 - item.queue_time_percent}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>Total: {item.total_cycle_hours}h</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3 text-cyan-400" />
                      {item.handoffs} handoffs
                    </span>
                  </div>
                </div>
              </div>

              {/* Mathematical Proof Accordion (1.1 "with numbers behind the claim") */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => toggleProof(item.id)}
                    className="flex items-center gap-1.5 text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Mathematical Proof Behind Claim</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {item.action_id && !isResolved && (
                    <button
                      onClick={() => onExecuteAction(item.action_id!)}
                      disabled={executingId === item.action_id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold shadow-glow-violet transition-all disabled:opacity-50"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{executingId === item.action_id ? 'Dispatching...' : 'Dispatch Agent Resolution'}</span>
                    </button>
                  )}

                  {isResolved && (
                    <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolution Applied
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#090d16] border border-violet-500/20 font-mono text-xs text-slate-300 space-y-2 animate-fadeIn">
                    <div className="text-violet-300 font-bold flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      Empirical Statistical Proof:
                    </div>
                    <div className="p-2.5 rounded bg-black/40 text-cyan-300 text-[11px] leading-relaxed border border-white/5">
                      {item.mathematical_proof}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-amber-400 font-semibold">Agent Remediation: </span>
                      {item.recommended_action}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
