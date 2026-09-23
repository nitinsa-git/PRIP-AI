import React, { useState } from 'react';
import { 
  X, AlertTriangle, ShieldAlert, Zap, Flame, RefreshCcw, 
  CheckCircle2, ArrowRight, Activity, GitPullRequest, Lock, Radio
} from 'lucide-react';

interface FailureSimulationResponse {
  simulation_id: string;
  project_id: string;
  failure_type: string;
  timestamp: string;
  impact_level: string;
  project_health_before: string;
  project_health_after: string;
  autonomy_rung_before: string;
  autonomy_rung_after: string;
  circuit_breaker_status: string;
  events_emitted: string[];
  audit_log_id: string;
  summary: string;
  remediation_recommendation: string;
}

interface EdgeCaseSimulatorModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onFailureSimulated?: () => void;
  onHealthRestored?: () => void;
}

export const EdgeCaseSimulatorModal: React.FC<EdgeCaseSimulatorModalProps> = ({
  project,
  isOpen,
  onClose,
  onFailureSimulated,
  onHealthRestored
}) => {
  const [simulating, setSimulating] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [lastSimulation, setLastSimulation] = useState<FailureSimulationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'triggers' | 'details'>('triggers');

  const failureScenarios = [
    {
      id: 'demotion',
      title: 'Chant #8 Auto-Demotion on Golden Set Drift',
      category: 'AUTONOMY DRIFT & QUARANTINE',
      icon: AlertTriangle,
      color: 'amber',
      impact: 'HIGH (Write Quarantined)',
      description: 'Simulates prompt drift or agent quality regression dropping test pass rate below SLA threshold. The engine immediately demotes the autonomy rung down the trust ladder and halts autonomous merges.',
      invariantsViolated: 'Chant #8 & Invariant #7 (Observability Anchor)'
    },
    {
      id: 'arbiter_conflict',
      title: 'Write Arbiter AST Collision & Contention',
      category: 'SERIALIZED WRITE ARBITER',
      icon: Lock,
      color: 'cyan',
      impact: 'MEDIUM (Lock Lease Rejection)',
      description: 'Two parallel specialist agents attempt concurrent modifications on overlapping AST paths in the same file. The Write Arbiter denies the second lease, generates conflict telemetry, and invokes the 3-step reconciler.',
      invariantsViolated: 'Invariant #2 (Non-Overlapping Authority) & Invariant #8 (Serialized Arbiter)'
    },
    {
      id: 'circuit_breaker',
      title: 'Blast Radius Breach & Circuit Breaker P1 Trip',
      category: 'FAULT TOLERANCE & FALLBACK',
      icon: ShieldAlert,
      color: 'rose',
      impact: 'CRITICAL (Hard Human-in-the-Loop Fallback)',
      description: 'An agent proposes a mutation spanning >5 cross-domain services without an approved Architectural Waiver. The Circuit Breaker trips to OPEN, cancels pipeline execution, and mandates human-in-the-loop sign-off.',
      invariantsViolated: 'Invariant #9 (Fault Isolation & Fallback) & ADR-001 Coupling Standard'
    },
    {
      id: 'debt_veto',
      title: 'Super Agent Architecture Council Veto',
      category: 'GOVERNANCE & ADJUDICATION',
      icon: Flame,
      color: 'purple',
      impact: 'HIGH (Release Gate Blocked)',
      description: 'A squad attempts to merge an un-waived architectural shortcut on a high-risk transactional boundary. Super Agent Architecture Council detects the violation and issues a blocking veto, stopping the pipeline at Gate 2.',
      invariantsViolated: 'Invariant #11 (Adjudication Proof) & Invariant #3 (Debt Register)'
    }
  ];

  const handleTriggerScenario = async (type: string) => {
    if (!project?.project_id) return;
    setSimulating(type);
    try {
      const res = await fetch(`/api/projects/${project.project_id}/simulate-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failure_type: type,
          operator: 'Staff Platform Chaos Engineer'
        })
      });
      if (res.ok) {
        const data: FailureSimulationResponse = await res.json();
        setLastSimulation(data);
        setActiveTab('details');
        if (onFailureSimulated) {
          onFailureSimulated();
        }
      }
    } catch (err) {
      console.error('Failed to trigger failure simulation:', err);
    } finally {
      setSimulating(null);
    }
  };

  const handleRestoreHealth = async () => {
    if (!project?.project_id) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/projects/${project.project_id}/reset-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setLastSimulation(null);
        if (onHealthRestored) {
          onHealthRestored();
        }
      }
    } catch (err) {
      console.error('Failed to reset project health:', err);
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#070b16] border border-rose-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#180d15] via-[#0f0e1c] to-[#080d1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-glow-rose">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                  RESILIENCE & CHAOS SIMULATOR
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Production Invariant Stress Testing
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Target Microservice: {project.name}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({project.project_id})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project.health_status !== 'HEALTHY' && (
              <button
                disabled={restoring}
                onClick={handleRestoreHealth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold transition-all"
                title="Restore project health and baseline autonomy rung"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${restoring ? 'animate-spin' : ''}`} />
                <span>Restore Baseline</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2.5 bg-[#0a0f1d] border-b border-white/5 flex flex-wrap items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Current Health:</span>
              <span className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                project.health_status === 'HEALTHY'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : project.health_status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {project.health_status}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Autonomy Rung:</span>
              <span className="text-cyan-300 font-bold">{project.autonomy_rung}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Write Scope: <strong className="text-slate-200">{project.write_scope}</strong></span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Active Simulation Result Banner if present */}
          {lastSimulation && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#0c1220] border border-rose-500/50 space-y-3 font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                  <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span>CHAOS INJECTION ACTIVE: [{lastSimulation.failure_type.toUpperCase()}]</span>
                </div>
                <div className="text-[10px] text-slate-400">Sim ID: {lastSimulation.simulation_id}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Autonomy Rung</div>
                  <div className="flex items-center gap-1.5 font-bold text-white mt-1">
                    <span className="text-slate-400">{lastSimulation.autonomy_rung_before}</span>
                    <ArrowRight className="w-3 h-3 text-rose-400" />
                    <span className="text-rose-400">{lastSimulation.autonomy_rung_after}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Service Health</div>
                  <div className="flex items-center gap-1.5 font-bold text-white mt-1">
                    <span className="text-slate-400">{lastSimulation.project_health_before}</span>
                    <ArrowRight className="w-3 h-3 text-rose-400" />
                    <span className={lastSimulation.project_health_after === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}>
                      {lastSimulation.project_health_after}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Circuit Breaker</div>
                  <div className={`font-bold mt-1 ${lastSimulation.circuit_breaker_status === 'TRIPPED_OPEN' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {lastSimulation.circuit_breaker_status}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Audit Reference</div>
                  <div className="font-bold text-cyan-300 mt-1 truncate">{lastSimulation.audit_log_id}</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/50 text-slate-200">
                <strong className="text-rose-300 font-bold">Summary: </strong>
                {lastSimulation.summary}
              </div>

              <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-[11px]">
                <strong className="font-bold">Recommended Remediation: </strong>
                {lastSimulation.remediation_recommendation}
              </div>
            </div>
          )}

          {/* Scenario Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Select Failure / Edge Case Scenario to Simulate:</span>
              </span>
              <span className="text-slate-400">Non-destructive test harness</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {failureScenarios.map((sc) => {
                const Icon = sc.icon;
                const isCurrentSimulating = simulating === sc.id;
                return (
                  <div
                    key={sc.id}
                    className="p-5 rounded-xl bg-[#090e1c] border border-white/10 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-3 font-mono text-xs group shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {sc.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
                          {sc.impact}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:text-rose-300 transition-colors">
                        <Icon className="w-4 h-4 text-rose-400" />
                        <span>{sc.title}</span>
                      </div>

                      <p className="text-slate-400 text-xs font-sans leading-relaxed">
                        {sc.description}
                      </p>

                      <div className="text-[11px] text-purple-300/90 pt-1">
                        <span className="text-slate-500">Invariants Enforced: </span>
                        {sc.invariantsViolated}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                      <button
                        disabled={simulating !== null}
                        onClick={() => handleTriggerScenario(sc.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                          isCurrentSimulating
                            ? 'bg-rose-500/50 text-white cursor-wait animate-pulse'
                            : 'bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 hover:text-white hover:scale-105'
                        }`}
                      >
                        {isCurrentSimulating ? (
                          <>
                            <Activity className="w-3.5 h-3.5 animate-spin" />
                            <span>Injecting Chaos...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Simulate Scenario</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#060a14] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Simulations demonstrate real-time quarantine and human-in-the-loop protection without affecting live code.</span>
          </div>

          <div className="flex items-center gap-2">
            {project.health_status !== 'HEALTHY' && (
              <button
                disabled={restoring}
                onClick={handleRestoreHealth}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-colors"
              >
                Restore Baseline Health
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
