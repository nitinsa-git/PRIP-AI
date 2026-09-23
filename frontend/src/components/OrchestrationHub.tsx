import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Cpu,
  Layers,
  Zap,
  ShieldAlert,
  Clock,
  Coins,
  Hourglass,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Terminal,
  Activity,
  Maximize2,
  Sliders,
  Compass
} from 'lucide-react';
import {
  WorkObject,
  PlayDefinition,
  RoutingRule,
  RuleCandidateHarvestRecord
} from '../types';

export const OrchestrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'work_objects' | 'lanes' | 'plays' | 'budget' | 'router'>('work_objects');
  const [workObjects, setWorkObjects] = useState<WorkObject[]>([]);
  const [selectedWoId, setSelectedWoId] = useState<string>('WO-2026-014872');
  const [plays, setPlays] = useState<PlayDefinition[]>([]);
  const [selectedPlayId, setSelectedPlayId] = useState<string>('play.service_change.standard');
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [ruleCandidates, setRuleCandidates] = useState<RuleCandidateHarvestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upward Lane Override Modal State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);
  const [overrideWoId, setOverrideWoId] = useState<string>('WO-2026-014872');
  const [requestedLane, setRequestedLane] = useState<'FAST' | 'STANDARD' | 'HEAVY'>('HEAVY');
  const [overrideReason, setOverrideReason] = useState<string>('Mid-flight cascade risk detected by Dependency Agent: shared core blast radius exceeds threshold.');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Interactive Router Simulator State
  const [routerIntent, setRouterIntent] = useState<string>('database.schema_migration');
  const [routerRisk, setRouterRisk] = useState<string>('T2');
  const [routerBlast, setRouterBlast] = useState<number>(0.45);
  const [routerPressure, setRouterPressure] = useState<string>('standard');
  const [routerResult, setRouterResult] = useState<any | null>(null);
  const [routingLoading, setRoutingLoading] = useState<boolean>(false);

  // Play Execution / Partial Degradation Simulator State
  const [executingPlay, setExecutingPlay] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [woRes, playsRes, rulesRes, candRes] = await Promise.all([
        fetch('/api/work-objects').then(r => r.json()),
        fetch('/api/plays').then(r => r.json()),
        fetch('/api/routing/rules').then(r => r.json()),
        fetch('/api/routing/harvested-candidates').then(r => r.json())
      ]);
      setWorkObjects(woRes);
      setPlays(playsRes);
      setRoutingRules(rulesRes);
      setRuleCandidates(candRes);
    } catch (err) {
      console.error('Failed to fetch Section 5 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedWorkObject = workObjects.find(w => w.work_id === selectedWoId) || workObjects[0];
  const selectedPlay = plays.find(p => p.id === selectedPlayId) || plays[0];

  const handleOverrideLane = async () => {
    setOverrideError(null);
    try {
      const res = await fetch(`/api/work-objects/${overrideWoId}/override-lane`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requested_lane: requestedLane,
          reason: overrideReason,
          agent_id: 'Dependency & Impact Agent'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setOverrideError(data.detail || 'Downward lane downgrade is forbidden by Section 5.3 architecture invariants!');
        return;
      }
      showToast(`Success: Work item escalated upward to ${requestedLane} Lane.`);
      setIsOverrideModalOpen(false);
      fetchData();
    } catch (err: any) {
      setOverrideError(err.message);
    }
  };

  const handleExecutePlay = async (simulateExhaustion?: 'WALL_CLOCK' | 'TOKENS' | 'USD') => {
    setExecutingPlay(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/plays/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          play_id: selectedPlayId,
          work_id: selectedWoId,
          simulate_exhaustion: simulateExhaustion || null
        })
      });
      const data = await res.json();
      setExecutionResult(data);
      if (data.is_partial) {
        showToast(`Graceful Partial Degradation: Halted at cap (${simulateExhaustion}). Partial findings returned!`);
      } else {
        showToast('Play completed successfully across all scatter/gather nodes!');
      }
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingPlay(false);
    }
  };

  const handleRouteEvaluate = async () => {
    setRoutingLoading(true);
    setRouterResult(null);
    try {
      const res = await fetch('/api/routing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent_class: routerIntent,
          risk_tier: routerRisk,
          blast_radius_score: parseFloat(routerBlast.toString()),
          time_pressure: routerPressure
        })
      });
      const data = await res.json();
      setRouterResult(data);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setRoutingLoading(false);
    }
  };

  const handleGraduateCandidate = async (candId: string) => {
    try {
      const res = await fetch('/api/routing/graduate-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Candidate graduated to Policy-as-Code Rule ${data.new_rule.rule_id}!`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && workObjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400 font-mono text-sm">Loading Orchestration & Routing Subsystem (§5)...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-400 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl shadow-cyan-950/80 flex items-center space-x-3 text-sm animate-bounce font-medium">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-cyan-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PLANE 2 · SECTION 5
              </span>
              <span className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Deterministic First · Upward Only · 3-Budget Controlled</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Orchestration & Routing Engine
              <Compass className="w-7 h-7 text-cyan-400" />
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
              The unit of currency is the <span className="text-cyan-300 font-mono">Work Object</span>. Policy-as-code routes the predictable majority into Fast, Standard, or Heavy lanes. Upward-only mid-flight overrides protect architecture invariants, while the 3-Budget Manager prevents runaway tokens, cost, and latency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setOverrideWoId(selectedWorkObject?.work_id || 'WO-2026-014872');
                setIsOverrideModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-amber-950/40"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              <span>Override Lane Upward</span>
            </button>
            <button
              onClick={fetchData}
              className="px-3.5 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Section 5 Architecture Invariant Bar */}
        <div className="mt-6 pt-5 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Chant #3 Boundary:</span>
            <span className="text-cyan-400 font-semibold">Orchestrator never does domain work</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Routing Invariant:</span>
            <span className="text-emerald-400 font-semibold">Policy-as-code 1st, Model fallback</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Lane Escalation Rule:</span>
            <span className="text-amber-400 font-semibold">Upward overrides only; downgrades 400</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Budget Exhaustion:</span>
            <span className="text-rose-400 font-semibold">Partial findings labeled explicitly</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-800/80 space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'work_objects', label: 'Canonical Work Objects (§5.1)', icon: Layers },
          { key: 'lanes', label: 'The Three Lanes (§5.3)', icon: Sliders },
          { key: 'plays', label: 'Play DAGs (Scatter/Gather §5.4)', icon: GitFork },
          { key: 'budget', label: '3-Budget Manager & Degradation (§5.5)', icon: Hourglass },
          { key: 'router', label: 'Policy Router & Fallback Harvester (§5.2)', icon: Cpu }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CANONICAL WORK OBJECTS (§5.1) */}
      {activeTab === 'work_objects' && selectedWorkObject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Work Object Selector List (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200 font-mono uppercase tracking-wider">
                Work Objects ({workObjects.length})
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">Canonical Schema v1</span>
            </div>

            <div className="space-y-3">
              {workObjects.map(wo => {
                const isSelected = wo.work_id === selectedWorkObject.work_id;
                const laneColor =
                  wo.lane === 'FAST'
                    ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
                    : wo.lane === 'HEAVY'
                    ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                    : 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300';

                return (
                  <div
                    key={wo.work_id}
                    onClick={() => setSelectedWoId(wo.work_id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-gray-900 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                        : 'border-gray-800 bg-gray-950 hover:border-gray-700 hover:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {wo.work_id}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${laneColor}`}>
                        {wo.lane} LANE
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 font-medium truncate mb-2">
                      {wo.source.system.toUpperCase()}: {wo.source.ref} · {wo.intent_class}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>Tier: <span className="text-amber-300 font-bold">{wo.risk_tier}</span></span>
                      <span>Blast: <span className="text-cyan-300 font-bold">{wo.blast_radius.score}</span></span>
                      <span className="capitalize text-emerald-400">{wo.state.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Work Object Cockpit (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-xl font-bold text-white font-mono">{selectedWorkObject.work_id}</h2>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full font-semibold border ${
                      selectedWorkObject.lane === 'FAST'
                        ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                        : selectedWorkObject.lane === 'HEAVY'
                        ? 'border-rose-500 bg-rose-950/50 text-rose-300'
                        : 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                    }`}>
                      {selectedWorkObject.lane} LANE
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                      State: {selectedWorkObject.state}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    Created: {selectedWorkObject.created_at} · SLA Due: {selectedWorkObject.sla.due}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setOverrideWoId(selectedWorkObject.work_id);
                      setIsOverrideModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Override Upward</span>
                  </button>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800/80">
                  <span className="text-[11px] font-mono text-gray-400 block mb-1">Source Record</span>
                  <span className="text-xs font-mono font-semibold text-cyan-300">
                    {selectedWorkObject.source.system.toUpperCase()} : {selectedWorkObject.source.ref}
                  </span>
                </div>
                <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800/80">
                  <span className="text-[11px] font-mono text-gray-400 block mb-1">Intent Class</span>
                  <span className="text-xs font-mono font-semibold text-emerald-300">
                    {selectedWorkObject.intent_class}
                  </span>
                </div>
                <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800/80">
                  <span className="text-[11px] font-mono text-gray-400 block mb-1">Risk Tier & Pressure</span>
                  <span className="text-xs font-mono font-semibold text-amber-300">
                    {selectedWorkObject.risk_tier} · {selectedWorkObject.time_pressure}
                  </span>
                </div>
                <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800/80">
                  <span className="text-[11px] font-mono text-gray-400 block mb-1">Play Assigned</span>
                  <span className="text-xs font-mono font-semibold text-indigo-300 truncate block">
                    {selectedWorkObject.play.id} (v{selectedWorkObject.play.version})
                  </span>
                </div>
              </div>

              {/* Blast Radius Section */}
              <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-semibold flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Blast Radius Severity: {selectedWorkObject.blast_radius.score}</span>
                  </span>
                  <span className="text-gray-400">Affected Services ({selectedWorkObject.blast_radius.services.length})</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedWorkObject.blast_radius.score > 0.7
                        ? 'bg-rose-500'
                        : selectedWorkObject.blast_radius.score > 0.4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedWorkObject.blast_radius.score * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedWorkObject.blast_radius.services.map(srv => (
                    <span key={srv} className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-700 text-xs font-mono text-gray-200">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Findings Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                  <span>Attached Specialist Findings ({selectedWorkObject.findings.length})</span>
                  <span className="text-[11px] text-gray-500">Invariant 2: Evidence Pointer Mandated</span>
                </h3>
                {selectedWorkObject.findings.length === 0 ? (
                  <p className="text-xs font-mono text-gray-500 p-4 border border-dashed border-gray-800 rounded-xl text-center">
                    No specialist findings attached yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedWorkObject.findings.map(fnd => (
                      <div key={fnd.finding_id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              fnd.is_partial
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {fnd.finding_type}
                            </span>
                            <span className="text-xs font-bold text-white font-mono">{fnd.title}</span>
                          </div>
                          <span className="text-xs font-mono text-emerald-400">
                            Confidence: {(fnd.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{fnd.details}</p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1 border-t border-gray-900">
                          <span>Agent: <span className="text-cyan-400">{fnd.source_agent}</span></span>
                          {fnd.evidence_pointer && (
                            <span className="text-indigo-400">
                              Pointer: {fnd.evidence_pointer.artifact_ref} ({fnd.evidence_pointer.pointer_type})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300">
                  Audit History ({selectedWorkObject.audit.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedWorkObject.audit.map((aud, idx) => (
                    <div key={idx} className="p-3 bg-gray-950/70 border border-gray-800/80 rounded-lg flex items-start justify-between text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-300 font-bold">{aud.event}</span>
                          <span className="text-gray-500">by {aud.actor}</span>
                        </div>
                        {aud.details && (
                          <div className="text-[11px] text-gray-400">
                            {JSON.stringify(aud.details)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">{aud.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON Canonical Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Canonical Work Object JSON (Section 5.1 Format)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedWorkObject, null, 2));
                      showToast('Copied Canonical Work Object JSON to clipboard!');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-black border border-gray-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-60 leading-tight">
                  {JSON.stringify(selectedWorkObject, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE THREE LANES (§5.3) */}
      {activeTab === 'lanes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>The Three Lanes Policy</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                Lane assignment is a property of the Play, not the agent. Any specialist detecting risk may override lane <strong className="text-amber-300">upward only</strong> (Fast &rarr; Standard &rarr; Heavy). Downward downgrades are rejected at the gate.
              </p>
            </div>
            <button
              onClick={() => {
                setOverrideWoId(selectedWorkObject?.work_id || 'WO-2026-014872');
                setIsOverrideModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-lg"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              <span>Simulate Mid-Flight Upward Override</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FAST LANE */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-cyan-500/30 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  FAST LANE
                </span>
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">System Acts & Logs</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Low risk, bounded blast radius, high confidence. System executes mutation via serialized Write Arbiter and queues for post-hoc human review.
                </p>
              </div>

              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono space-y-1.5 text-gray-300">
                <div className="flex justify-between"><span>Criteria:</span> <span className="text-cyan-300">Risk Tier T3, Blast &le; 0.20</span></div>
                <div className="flex justify-between"><span>Approval:</span> <span className="text-cyan-300">Post-hoc notification</span></div>
                <div className="flex justify-between"><span>Play Default:</span> <span className="text-cyan-300">play.emergency_hotfix.fast</span></div>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <h4 className="text-[11px] font-mono text-gray-400 mb-2 uppercase">Active Work Items:</h4>
                {workObjects.filter(w => w.lane === 'FAST').map(w => (
                  <div key={w.work_id} className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 text-xs font-mono flex items-center justify-between mb-2">
                    <span className="text-cyan-300 font-bold">{w.work_id}</span>
                    <span className="text-gray-400">{w.intent_class}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STANDARD LANE */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-indigo-500/30 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STANDARD LANE
                </span>
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Plan + Recommendation</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Normal change work. Produces full scatter-gather analysis, plan, and recommended fix. Requires human approval before mutation execution.
                </p>
              </div>

              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono space-y-1.5 text-gray-300">
                <div className="flex justify-between"><span>Criteria:</span> <span className="text-indigo-300">Risk Tier T2, Blast &le; 0.70</span></div>
                <div className="flex justify-between"><span>Approval:</span> <span className="text-indigo-300">Human signoff required</span></div>
                <div className="flex justify-between"><span>Play Default:</span> <span className="text-indigo-300">play.service_change.standard</span></div>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <h4 className="text-[11px] font-mono text-gray-400 mb-2 uppercase">Active Work Items:</h4>
                {workObjects.filter(w => w.lane === 'STANDARD').map(w => (
                  <div key={w.work_id} className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 text-xs font-mono flex items-center justify-between mb-2">
                    <span className="text-indigo-300 font-bold">{w.work_id}</span>
                    <span className="text-gray-400">{w.intent_class}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HEAVY LANE */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-rose-500/30 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HEAVY LANE
                </span>
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Challenge Protocol</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Shared architecture, Tier-1 critical paths, regulated systems, or blast radius &gt; 0.70. Enforces Plane 3 Adjudication with Architecture Authority.
                </p>
              </div>

              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono space-y-1.5 text-gray-300">
                <div className="flex justify-between"><span>Criteria:</span> <span className="text-rose-300">Risk Tier T1, Blast &gt; 0.70</span></div>
                <div className="flex justify-between"><span>Approval:</span> <span className="text-rose-300">Plane 3 Dual Signoff</span></div>
                <div className="flex justify-between"><span>Play Default:</span> <span className="text-rose-300">play.tier1_architecture.heavy</span></div>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <h4 className="text-[11px] font-mono text-gray-400 mb-2 uppercase">Active Work Items:</h4>
                {workObjects.filter(w => w.lane === 'HEAVY').map(w => (
                  <div key={w.work_id} className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 text-xs font-mono flex items-center justify-between mb-2">
                    <span className="text-rose-300 font-bold">{w.work_id}</span>
                    <span className="text-gray-400">{w.intent_class}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLAY DAGS (SCATTER/GATHER §5.4) */}
      {activeTab === 'plays' && selectedPlay && (
        <div className="space-y-6">
          {/* Play Selection Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-900 border border-gray-800">
            <div>
              <span className="text-xs font-mono text-gray-400 block mb-1">Active Play Selection</span>
              <div className="flex flex-wrap gap-2">
                {plays.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayId(p.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      p.id === selectedPlay.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-950/40'
                        : 'bg-gray-950 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    {p.id} (v{p.version})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                disabled={executingPlay}
                onClick={() => handleExecutePlay()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-lg shadow-cyan-900/40"
              >
                {executingPlay ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Execute Play DAG</span>
              </button>
            </div>
          </div>

          {/* DAG Nodes Flow Visualization */}
          <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedPlay.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedPlay.description}</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                Lane: {selectedPlay.lane} · Trust L{selectedPlay.trust_level}
              </span>
            </div>

            {/* Visual Node Graph */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Scatter / Gather DAG Graph Structure
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {selectedPlay.nodes.map((node, i) => {
                  const isScatter = node.type === 'parallel_scatter';
                  const isGather = node.type === 'gather_reconcile';
                  const isGate = node.type === 'gate';

                  return (
                    <div
                      key={node.node_id}
                      className={`p-4 rounded-xl border relative transition-all ${
                        isScatter
                          ? 'border-indigo-500/40 bg-indigo-950/20'
                          : isGather
                          ? 'border-cyan-500/40 bg-cyan-950/20'
                          : isGate
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : 'border-gray-800 bg-gray-950'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-black/50 border border-gray-800 text-gray-300">
                          {node.type.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          node.status === 'completed' ? 'text-emerald-400 bg-emerald-950/50' : 'text-amber-400 bg-amber-950/50'
                        }`}>
                          {node.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white font-mono mb-2">{node.name}</h4>

                      <div className="text-[11px] font-mono text-gray-400 space-y-1">
                        <div>Agents: <span className="text-cyan-300">{node.agents.join(', ')}</span></div>
                        {node.on_conflict && (
                          <div className="text-rose-400 font-bold">
                            On Conflict: {node.on_conflict}
                          </div>
                        )}
                        {node.dependencies.length > 0 && (
                          <div className="text-gray-500">
                            Depends: {node.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Degraded Mode Fallback Box */}
            {selectedPlay.degraded_mode_play_ref && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-3 text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Invariant 6 Degraded Mode Fallback: </span>
                    <span>If reasoning or model APIs trip circuit breakers, falls back to deterministic checklist </span>
                    <span className="text-white font-bold underline">{selectedPlay.degraded_mode_play_ref}</span>.
                  </div>
                </div>
              </div>
            )}

            {/* Raw YAML Configuration View */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                YAML Play Definition (Config, Not Code §5.4)
              </span>
              <pre className="p-4 rounded-xl bg-black border border-gray-800 text-xs font-mono text-indigo-300 max-h-64 overflow-y-auto leading-relaxed">
                {selectedPlay.yaml_raw}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 3-BUDGET MANAGER & DEGRADATION (§5.5) */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Budget Overview Hero */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-gray-800">
            <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
              <Hourglass className="w-5 h-5 text-cyan-400" />
              <span>The 3-Budget Manager (§5.5)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Every Play enforces 3 hard budget caps: <strong className="text-cyan-300">Wall Clock Seconds</strong>, <strong className="text-indigo-300">Tokens</strong>, and <strong className="text-emerald-300">USD Cost</strong>. When a budget is exhausted, the orchestrator does not crash or silently truncate — it emits partial findings explicitly labeled <code className="text-amber-300 font-mono">is_partial: true</code> with reduced confidence (0.65).
            </p>
          </div>

          {/* 3 Budget Live Meters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wall Clock Meter */}
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>1. Wall Clock Budget</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  {selectedWorkObject?.budget.wall_clock_used_s.toFixed(1)}s / {selectedWorkObject?.budget.wall_clock_cap_s}s
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((selectedWorkObject?.budget.wall_clock_used_s || 0) / (selectedWorkObject?.budget.wall_clock_cap_s || 300)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>Cap: {selectedWorkObject?.budget.wall_clock_cap_s} seconds</span>
                <button
                  onClick={() => handleExecutePlay('WALL_CLOCK')}
                  className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-[10px]"
                >
                  Simulate Timeout
                </button>
              </div>
            </div>

            {/* Tokens Meter */}
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>2. Token Ceiling</span>
                </span>
                <span className="text-indigo-300 font-bold">
                  {selectedWorkObject?.budget.tokens_used.toLocaleString()} / {selectedWorkObject?.budget.tokens_cap.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((selectedWorkObject?.budget.tokens_used || 0) / (selectedWorkObject?.budget.tokens_cap || 150000)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>Cap: {selectedWorkObject?.budget.tokens_cap.toLocaleString()} tokens</span>
                <button
                  onClick={() => handleExecutePlay('TOKENS')}
                  className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded text-[10px]"
                >
                  Simulate Token Cap
                </button>
              </div>
            </div>

            {/* Cost (USD) Meter */}
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>3. Cost Cap (USD)</span>
                </span>
                <span className="text-emerald-300 font-bold">
                  ${selectedWorkObject?.budget.cost_used_usd.toFixed(2)} / ${selectedWorkObject?.budget.cost_cap_usd.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((selectedWorkObject?.budget.cost_used_usd || 0) / (selectedWorkObject?.budget.cost_cap_usd || 2.5)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>Cap: ${selectedWorkObject?.budget.cost_cap_usd.toFixed(2)} USD</span>
                <button
                  onClick={() => handleExecutePlay('USD')}
                  className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-[10px]"
                >
                  Simulate Cost Cap
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Degradation Simulation Result Box */}
          {executionResult && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              executionResult.is_partial
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {executionResult.is_partial ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <h3 className="font-bold font-mono text-sm">
                    {executionResult.status}: {executionResult.message}
                  </h3>
                </div>
                {executionResult.is_partial && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                    is_partial: true · Reduced Confidence (0.65)
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {executionResult.is_partial
                  ? 'Architecture Invariant Verified: When budget cap is exhausted, partial findings are returned with reduced confidence without silent drop or pipeline hangs.'
                  : 'Play completed successfully with full scatter/gather reconciliation and within all 3 budget boundaries.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: POLICY ROUTER & FALLBACK HARVESTER (§5.2) */}
      {activeTab === 'router' && (
        <div className="space-y-8">
          {/* Interactive Routing Test Box */}
          <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Deterministic Policy-First Router Simulator (§5.2)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Policy-as-code handles the predictable majority at <strong className="text-emerald-300">0ms latency and $0 cost</strong>. When inputs fall outside the deterministic rule catalog, model routing is engaged as a fallback, and the pattern is queued for rule graduation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Intent Class</label>
                <select
                  value={routerIntent}
                  onChange={e => setRouterIntent(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="service.change">service.change</option>
                  <option value="dependency.patch">dependency.patch</option>
                  <option value="architecture.core_refactor">architecture.core_refactor</option>
                  <option value="incident.mitigation">incident.mitigation</option>
                  <option value="database.schema_migration">database.schema_migration (Fallback candidate)</option>
                  <option value="infra.terraform_drift">infra.terraform_drift (Fallback candidate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Risk Tier</label>
                <select
                  value={routerRisk}
                  onChange={e => setRouterRisk(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="T3">T3 (Low Risk)</option>
                  <option value="T2">T2 (Standard Risk)</option>
                  <option value="T1">T1 (High / Tier-1 Risk)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">
                  Blast Radius: {routerBlast}
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={routerBlast}
                  onChange={e => setRouterBlast(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Time Pressure</label>
                <select
                  value={routerPressure}
                  onChange={e => setRouterPressure(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="standard">standard</option>
                  <option value="urgent">urgent</option>
                  <option value="relaxed">relaxed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={routingLoading}
                onClick={handleRouteEvaluate}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-lg shadow-cyan-900/40"
              >
                {routingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                <span>Evaluate Routing</span>
              </button>
            </div>

            {/* Routing Result Display */}
            {routerResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                routerResult.routing_type === 'DETERMINISTIC_POLICY_AS_CODE'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-2">
                    {routerResult.routing_type === 'DETERMINISTIC_POLICY_AS_CODE' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    )}
                    <span>{routerResult.routing_type}</span>
                  </span>
                  <span className="font-bold">
                    Assigned Lane: <span className="underline">{routerResult.lane}</span> · Play: {routerResult.play_id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] opacity-80 pt-1 border-t border-gray-800">
                  <span>Latency: {routerResult.latency_ms}ms · Cost: ${routerResult.cost_usd}</span>
                  <span>{routerResult.note || 'Zero model tokens expended.'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Rule Candidate Harvester Telemetry Board */}
          <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span>Rule Candidate Harvester Queue ({ruleCandidates.length})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Every model-based fallback call is harvested here. When a recurring pattern emerges, 1-click graduate it into a zero-cost deterministic policy!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {ruleCandidates.map(cand => (
                <div
                  key={cand.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    cand.graduated_to_rule
                      ? 'bg-gray-950/50 border-gray-800 opacity-60'
                      : 'bg-gray-950 border-amber-500/30'
                  }`}
                >
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-300 font-bold">{cand.id}</span>
                      <span className="text-gray-400">· Occurrences: {cand.occurrences_count}</span>
                      <span className="text-cyan-400">· Intent: {cand.input_keys.intent_class}</span>
                    </div>
                    <p className="text-gray-300 text-[11px]">{cand.fallback_reason}</p>
                    <div className="text-[11px] text-gray-400">
                      Suggested: <span className="text-emerald-400">{cand.model_suggested_play}</span> ({cand.model_suggested_lane} Lane) · Conf: {(cand.model_confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div>
                    {cand.graduated_to_rule ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                        Graduated to Rule
                      </span>
                    ) : (
                      <button
                        onClick={() => handleGraduateCandidate(cand.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Graduate to Deterministic Rule</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UPWARD LANE OVERRIDE MODAL */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-gray-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono">Mid-Flight Upward Lane Override</h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Target Work Object</label>
                <select
                  value={overrideWoId}
                  onChange={e => setOverrideWoId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  {workObjects.map(wo => (
                    <option key={wo.work_id} value={wo.work_id}>
                      {wo.work_id} ({wo.lane} Lane · {wo.intent_class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Requested New Lane</label>
                <select
                  value={requestedLane}
                  onChange={e => setRequestedLane(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="FAST">FAST LANE</option>
                  <option value="STANDARD">STANDARD LANE</option>
                  <option value="HEAVY">HEAVY LANE (Plane 3 Adjudication)</option>
                </select>
                <span className="text-[11px] font-mono text-amber-300 mt-1 block">
                  Rule 5.3: Overrides must be upward only (Fast &rarr; Standard &rarr; Heavy).
                </span>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Justification Reason</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {overrideError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{overrideError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideLane}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black shadow-lg"
              >
                Execute Upward Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
