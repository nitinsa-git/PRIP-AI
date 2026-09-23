import React, { useState } from 'react';
import { 
  Sliders, ShieldCheck, CheckCircle2, Play, Terminal, 
  AlertTriangle, History, ArrowUpRight, Lock, Key 
} from 'lucide-react';
import { ControlledAction, AuditLogEntry } from '../types';

interface ControlledToolLayerProps {
  actions: ControlledAction[];
  auditLog: AuditLogEntry[];
  onExecuteAction: (actionId: string, operator: string) => void;
  executingId: string | null;
}

export const ControlledToolLayer: React.FC<ControlledToolLayerProps> = ({
  actions,
  auditLog,
  onExecuteAction,
  executingId,
}) => {
  const [operatorName, setOperatorName] = useState('Staff Platform Lead');
  const [activeTab, setActiveTab] = useState<'pending' | 'audit'>('pending');

  const pendingActions = actions.filter((a) => a.status === 'PENDING_APPROVAL');
  const executedActions = actions.filter((a) => a.status === 'EXECUTED');

  return (
    <div className="space-y-6">
      {/* Blueprint 1.1 & 1.2 Introduction Banner */}
      <div className="bg-gradient-to-r from-[#121c24] to-[#122b2b] p-5 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
            Controlled Tool Layer
          </span>
          <span className="text-xs font-mono text-slate-400">
            Bidirectional Actuation with Human Governance (§1.2)
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Governed Actuation Console
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Zero Rogue Actions
          </span>
        </h3>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Acts back into Git, CI/CD, and Jira through safe, audited tool interfaces.
          In adherence to Blueprint §1.2, PRIP-AI does not replace human sovereignty — all high-impact actions require explicit operator review.
        </p>
      </div>

      {/* Operator Status & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0f1c] p-4 rounded-xl border border-white/5 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Authorized Human Operator:</span>
          <input
            type="text"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            className="bg-[#111726] border border-white/10 rounded px-2.5 py-1 text-emerald-300 font-bold outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Pending Interventions ({pendingActions.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Audit Trail ({auditLog.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Pending Interventions */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {actions.map((act) => {
            const isExecuted = act.status === 'EXECUTED';
            return (
              <div
                key={act.id}
                className={`glass-card p-5 rounded-2xl border transition-all ${
                  isExecuted
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : act.risk_level === 'HIGH'
                    ? 'border-rose-500/30 hover:border-rose-500/60'
                    : 'border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {act.target_system}
                    </span>
                    <span className="font-mono text-xs text-cyan-300 font-bold">
                      {act.action_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      by {act.agent_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      act.risk_level === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : act.risk_level === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      Risk: {act.risk_level}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isExecuted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-200 mb-3">
                  {act.description}
                </p>

                {/* Parameters Preview */}
                <div className="p-3 rounded-xl bg-[#090d16] border border-white/5 font-mono text-xs text-slate-300 mb-4">
                  <span className="text-slate-400">Target Parameters: </span>
                  <span className="text-cyan-300">{JSON.stringify(act.parameters)}</span>
                </div>

                {/* Action Trigger or Result */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-mono text-slate-400">
                    Created: {act.created_at}
                  </span>

                  {!isExecuted ? (
                    <button
                      onClick={() => onExecuteAction(act.id, operatorName)}
                      disabled={executingId === act.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shadow-glow-neon transition-all disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{executingId === act.id ? 'Executing...' : 'Authorize & Dispatch to System'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dispatched • {act.result_message}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-3 font-mono text-xs">
          {auditLog.length === 0 ? (
            <div className="p-8 text-center text-slate-400 glass-card rounded-2xl border border-white/10">
              No tool executions logged yet. Dispatch an action from the Pending list to inspect the immutable audit stream.
            </div>
          ) : (
            auditLog.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#080d17] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-emerald-400">[{log.target_system}]</span>
                    <span>{log.action_type}</span>
                    <span className="text-xs text-slate-400 font-normal">by {log.agent}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{log.description}</div>
                  <div className="text-emerald-300 text-[11px]">
                    Authorized by: <span className="font-semibold text-white">{log.operator}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
