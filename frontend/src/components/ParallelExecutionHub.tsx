import React, { useState, useEffect } from 'react';
import {
  ScatterGatherExecutionRun,
  ReconciliationResult,
  SpeculativeExecutionRun,
  WritePathSubmission
} from '../types';
import {
  Cpu,
  GitBranch,
  Network,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Zap,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  FileSearch,
  Scale,
  Clock,
  Sparkles,
  Ban,
  Activity
} from 'lucide-react';

export const ParallelExecutionHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'scatter' | 'reconcile' | 'write_path' | 'speculative'>('scatter');
  const [scatterRuns, setScatterRuns] = useState<ScatterGatherExecutionRun[]>([]);
  const [reconcileRuns, setReconcileRuns] = useState<ReconciliationResult[]>([]);
  const [speculativeRuns, setSpeculativeRuns] = useState<SpeculativeExecutionRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Write Arbiter Form State
  const [writeWorkId, setWriteWorkId] = useState('WO-2026-014872');
  const [writeIdempKey, setWriteIdempKey] = useState(`idemp-wp-${Date.now().toString().slice(-4)}`);
  const [writeVersionLock, setWriteVersionLock] = useState(1);
  const [writeTarget, setWriteTarget] = useState('payments-api.deployment_spec');

  // Speculative Simulator State
  const [specWorkId, setSpecWorkId] = useState('WO-2026-015091');
  const [specLane, setSpecLane] = useState<'FAST' | 'HEAVY'>('FAST');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sgRes, recRes, specRes, chRes] = await Promise.all([
        fetch('http://localhost:6090/api/parallel/scatter-gather'),
        fetch('http://localhost:6090/api/parallel/reconcile'),
        fetch('http://localhost:6090/api/parallel/speculative/runs'),
        fetch('http://localhost:6090/api/comm/channels')
      ]);

      if (sgRes.ok) setScatterRuns(await sgRes.json());
      if (recRes.ok) setReconcileRuns(await recRes.json());
      if (specRes.ok) setSpeculativeRuns(await specRes.json());
      if (chRes.ok) {
        const cData = await chRes.json();
        const currentToken = cData.blackboard_status.optimistic_version_tokens[writeWorkId] || 1;
        setWriteVersionLock(currentToken);
      }
    } catch (err) {
      console.error('Failed to fetch Section 8 data:', err);
      showToast('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [writeWorkId]);

  const handleTriggerScatterGather = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:6090/api/parallel/scatter-gather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: 'WO-2026-014872',
          agents: ['arch-conformance', 'dep-impact', 'flow-analyst', 'code-review', 'reliability-sentinel']
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Scatter-Gather executed! Saved ${data.latency_saved_ms}ms (${data.concurrency_factor}x speedup)`, 'success');
        fetchData();
      } else {
        showToast('Scatter-Gather run failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReconciliation = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:6090/api/parallel/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_id: 'WO-2026-014872' })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Reconciliation complete! Dropped ${data.step1_dropped_unbacked.length} unbacked, merged ${data.step2_deduplicated_clusters.length} clusters, escalated ${data.step3_conflicts_escalated.length} contradictions.`, 'success');
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWritePath = async (useReplayKey: boolean = false) => {
    try {
      const keyToSend = useReplayKey ? writeIdempKey : `idemp-wp-${Date.now().toString().slice(-5)}`;
      if (!useReplayKey) {
        setWriteIdempKey(keyToSend);
      }

      const res = await fetch('http://localhost:6090/api/parallel/write-arbiter/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: writeWorkId,
          idempotency_key: keyToSend,
          version_lock: writeVersionLock,
          mutated_target: writeTarget,
          actor: 'operator:lead-architect'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Write Conflict [HTTP ${res.status}]: ${data.detail}`, 'error');
        return;
      }

      if (data.status === 'CACHED_IDEMPOTENT_REPLAY') {
        showToast(`Idempotent Replay Cached: ${data.message}`, 'info');
      } else {
        showToast(`Write Committed at Seq #${data.sequence_number}! New Version Lock: ${data.new_version_lock}`, 'success');
        setWriteVersionLock(data.new_version_lock);
      }
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTriggerSpeculative = async () => {
    try {
      const res = await fetch('http://localhost:6090/api/parallel/speculative/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: specWorkId,
          lane: specLane
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Policy Gating Blocked [HTTP ${res.status}]: ${data.detail}`, 'error');
        fetchData();
        return;
      }

      showToast(`Speculative run completed! Bought ${data.latency_bought_ms}ms latency for ${data.speculative_investment_tokens} tokens.`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const currentScatterRun = scatterRuns[0];
  const currentReconcileRun = reconcileRuns[0];

  return (
    <div className="space-y-6">
      {/* SECTION 8 HEADER & INVARIANTS */}
      <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase bg-indigo-950 text-indigo-400 border border-indigo-500/40 rounded">
                Section 8 Architecture Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono">Chant #1, #2 & #5 Enforced</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <GitBranch className="w-7 h-7 text-indigo-400" />
              Parallel Execution, Reconciliation & Speculative Subsystem
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Concurrent scatter–gather analysis, strict three-step evidence and conflict reconciliation, serialized write path under the Write Arbiter, and lane-gated speculative execution.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-semibold transition-all shadow"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync State
          </button>
        </div>

        {/* FOUR INVARIANTS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              §8.1 Scatter–Gather
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Independent analysis runs concurrently. The <code className="text-cyan-300">analyze</code> node in §5.4 is the canonical fan-out shape.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-1">
              <Filter className="w-3.5 h-3.5" />
              §8.2 Reconciler Order
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              1. Drop unbacked (Chant #2) &rarr; 2. Deduplicate root causes &rarr; 3. Escalate contradictions without averaging (Chant #5).
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold mb-1">
              <Lock className="w-3.5 h-3.5" />
              §8.3 Serial Write Path
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              One Write Arbiter. Serialized. Idempotency key required. The only place where concurrency is deliberately surrendered (Chant #1).
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold mb-1">
              <Zap className="w-3.5 h-3.5" />
              §8.4 Speculative Gating
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Permitted in FAST lane (buys latency). Blocked in HEAVY lane where reasoning itself is the deliverable.
            </p>
          </div>
        </div>
      </div>

      {/* TOAST ALERTS */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMsg.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMsg.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs opacity-70 hover:opacity-100 uppercase font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* NAVIGATION SUB-TABS */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('scatter')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'scatter'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Scatter–Gather (§8.1)
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
            {currentScatterRun ? `${currentScatterRun.concurrency_factor}x Concurrency` : 'Ready'}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('reconcile')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'reconcile'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Three-Step Reconciler (§8.2)
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
            Chant #2 & #5
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('write_path')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'write_path'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          Serialized Write Path (§8.3)
          <span className="px-2 py-0.5 text-xs rounded-full bg-rose-950 text-rose-300 border border-rose-500/30">
            Chant #1 Lock
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('speculative')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'speculative'
              ? 'border-indigo-400 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Speculative Execution (§8.4)
          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
            Fast vs Heavy
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: SCATTER-GATHER */}
      {activeSubTab === 'scatter' && (
        <div className="space-y-6">
          {/* TOP METRICS STRIP */}
          {currentScatterRun && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Parallel Wall Clock</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black font-mono text-cyan-300 mt-2">
                  {currentScatterRun.total_wall_clock_ms} <span className="text-sm font-normal text-slate-400">ms</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Bounded by slowest branch
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Serial Equivalent</span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-300 mt-2">
                  {currentScatterRun.serial_equivalent_ms} <span className="text-sm font-normal text-slate-400">ms</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Sum of all specialist branches
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl bg-emerald-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Latency Saved</span>
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-2">
                  {currentScatterRun.latency_saved_ms} <span className="text-sm font-normal text-emerald-400">ms</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400/80 mt-1 font-bold">
                  {currentScatterRun.concurrency_factor}x Concurrency Speedup
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Total Tokens Used</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black font-mono text-purple-300 mt-2">
                  {currentScatterRun.total_tokens_used.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Across 5 parallel specialists
                </div>
              </div>
            </div>
          )}

          {/* PARALLEL BRANCHES DAG BOARD */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-sm font-mono uppercase">
                    Canonical Play Node: 'analyze' (Parallel Scatter Fan-out)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Work Object: {currentScatterRun?.work_id || 'WO-2026-014872'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleTriggerScatterGather}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center gap-2 shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Rerun Scatter–Gather
              </button>
            </div>

            {currentScatterRun ? (
              <div className="space-y-3">
                {currentScatterRun.branches.map((b) => {
                  const widthPct = Math.round((b.wall_clock_ms / currentScatterRun.total_wall_clock_ms) * 100);
                  return (
                    <div key={b.branch_id} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 font-bold">
                            {b.agent_id}
                          </span>
                          <span className="text-xs text-indigo-300 font-bold">
                            {b.capability_invoked}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{b.tokens_used.toLocaleString()} tokens</span>
                          <span>{b.findings_count} findings</span>
                          <span className="text-emerald-400 font-bold">{b.wall_clock_ms}ms</span>
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No scatter-gather execution run loaded. Click "Rerun Scatter–Gather" to initiate.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: THREE-STEP RECONCILER PIPELINE */}
      {activeSubTab === 'reconcile' && currentReconcileRun && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div>
              <h3 className="font-bold text-white text-sm font-mono uppercase flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                The Reconciler Pipeline (Strict 3-Step Sequence)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Work ID: {currentReconcileRun.work_id} • Raw Input Findings: {currentReconcileRun.raw_findings_count} • Surviving Clean Findings: {currentReconcileRun.surviving_clean_findings_count}
              </p>
            </div>
            <button
              onClick={handleTriggerReconciliation}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-run Reconciler
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* STEP 1: DROP UNBACKED (Chant #2) */}
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">Step 1 (Order 1)</span>
                  <h4 className="font-bold text-white text-sm font-mono">Evidence Validation</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                  Chant #2
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop findings with unresolvable evidence references. Prevents hallucinated or unsourced claims from reaching downstream planes.
              </p>

              <div className="space-y-2">
                {currentReconcileRun.step1_dropped_unbacked.map((d, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-rose-300 font-bold">
                      <span>DROPPED: {d.finding_id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200">
                        {d.agent_id}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Unresolvable Ref: <code className="text-rose-400">{d.unresolvable_evidence_ref}</code>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      "{d.drop_reason}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 2: DEDUPLICATION */}
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">Step 2 (Order 2)</span>
                  <h4 className="font-bold text-white text-sm font-mono">Root-Cause Deduplication</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                  Clustering
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deduplicate findings pointing at the same root cause from different specialist angles into unified composite clusters.
              </p>

              <div className="space-y-2">
                {currentReconcileRun.step2_deduplicated_clusters.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-indigo-500/30 rounded-lg space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-indigo-300 font-bold">
                      <span>{c.cluster_id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200">
                      {c.root_cause_summary}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900 space-y-1">
                      <div>Participating: <span className="text-slate-300">{c.participating_agents.join(', ')}</span></div>
                      <div>Evidence: <span className="text-emerald-400">{c.evidence_refs.join(', ')}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3: CONFLICT DETECTION & ESCALATION (Chant #5) */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">Step 3 (Order 3)</span>
                  <h4 className="font-bold text-white text-sm font-mono">Conflict Escalation</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  Chant #5
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contradictory findings are <strong>not averaged</strong> and not resolved by the reconciler. They escalate to Plane 3 as a first-class signal.
              </p>

              <div className="space-y-2">
                {currentReconcileRun.step3_conflicts_escalated.map((cf, idx) => (
                  <div key={idx} className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-lg space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>ESCALATED: {cf.rule_or_topic}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                        {cf.verdict_action}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] bg-slate-950/80 p-2 rounded border border-slate-800">
                      <div className="text-cyan-300">
                        <strong>{cf.agent_a}:</strong> "{cf.claim_a}"
                      </div>
                      <div className="text-rose-300">
                        <strong>{cf.agent_b}:</strong> "{cf.claim_b}"
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-400/90 italic pt-1">
                      "{cf.escalation_rationale}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SERIALIZED WRITE PATH */}
      {activeSubTab === 'write_path' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: SERIALIZED WRITE ARBITER HARNESS */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm font-mono uppercase">
                      Write Arbiter Submission Harness
                    </h3>
                    <span className="text-xs text-rose-400 font-mono">
                      Strict Serial Lock (Chant #1)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                  SERIALIZED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Writes are the only place in the system where we deliberately give up concurrency (Chant #1). Every mutating call requires a unique idempotency key and optimistic version lock token.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Work ID</label>
                  <input
                    type="text"
                    value={writeWorkId}
                    onChange={(e) => setWriteWorkId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-cyan-300 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Idempotency Key (Required on every mutating call)</label>
                  <input
                    type="text"
                    value={writeIdempKey}
                    onChange={(e) => setWriteIdempKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-amber-300 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Version Lock Token</label>
                    <input
                      type="number"
                      value={writeVersionLock}
                      onChange={(e) => setWriteVersionLock(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Mutated Target</label>
                    <input
                      type="text"
                      value={writeTarget}
                      onChange={(e) => setWriteTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleSubmitWritePath(false)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Submit Mutating Action (New Unique Key)
                  </button>

                  <button
                    onClick={() => handleSubmitWritePath(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
                    title="Tests idempotent replay with identical key to demonstrate zero double-mutation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Test Idempotent Replay (Re-send Same Key)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SERIALIZED SEQUENCE LOG */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm font-mono uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Write Arbiter Serialized Log
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Strictly monotonically increasing
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs max-h-96 overflow-y-auto pr-1">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span>#Seq 1006 (Committed)</span>
                    <span className="text-slate-400">payments-api</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Target: <code className="text-emerald-400">deployment_spec.replicas=4</code>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Idempotency Key: <code className="text-amber-400">idemp-wp-test-1</code>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span>#Seq 1005 (Committed)</span>
                    <span className="text-slate-400">worker-pool-node</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Target: <code className="text-emerald-400">worker_pool.limit=16</code>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Idempotency Key: <code className="text-amber-400">idemp-9912-auto</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SPECULATIVE EXECUTION */}
      {activeSubTab === 'speculative' && (
        <div className="space-y-6">
          {/* SIMULATOR CONTROLLER */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm font-mono uppercase flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Speculative Execution Lab (§8.4)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  "Costs tokens, buys latency. Reasonable in the fast lane; wasteful in the heavy lane where the reasoning itself is the deliverable."
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={specLane}
                  onChange={(e) => setSpecLane(e.target.value as any)}
                  className="bg-slate-950 border border-purple-500/40 rounded p-2 text-xs font-mono font-bold text-purple-300 focus:outline-none"
                >
                  <option value="FAST">FAST LANE (Permitted)</option>
                  <option value="HEAVY">HEAVY LANE (Policy Gated / Prohibited)</option>
                </select>

                <button
                  onClick={handleTriggerSpeculative}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center gap-2 shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Run Speculative Branches
                </button>
              </div>
            </div>

            {/* RESULTS VIEW */}
            <div className="space-y-3">
              {speculativeRuns.map((sr) => (
                <div
                  key={sr.speculative_run_id}
                  className={`p-4 rounded-xl border space-y-3 ${
                    sr.policy_allowed
                      ? 'bg-slate-950/80 border-purple-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white">{sr.work_id}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                        sr.lane === 'FAST'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}>
                        {sr.lane} LANE
                      </span>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                      sr.policy_allowed
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}>
                      {sr.policy_allowed ? 'PERMITTED' : 'POLICY PROHIBITED'}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-300">
                    {sr.policy_message}
                  </p>

                  {sr.policy_allowed && sr.competing_branches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {sr.competing_branches.map((b) => (
                        <div
                          key={b.branch_id}
                          className={`p-3 rounded-lg border font-mono text-xs space-y-1.5 ${
                            b.outcome === 'WINNER_COMMITTED'
                              ? 'bg-emerald-950/30 border-emerald-500/50'
                              : 'bg-slate-900 border-slate-800 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{b.approach_name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              b.outcome === 'WINNER_COMMITTED'
                                ? 'bg-emerald-900 text-emerald-200'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {b.outcome}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Latency: <strong className="text-cyan-300">{b.latency_ms}ms</strong></span>
                            <span>Tokens: <strong className="text-purple-300">{b.tokens_spent}</strong></span>
                            <span>Confidence: <strong className="text-emerald-400">{Math.round(b.confidence * 100)}%</strong></span>
                          </div>
                          {b.discard_rationale && (
                            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                              "{b.discard_rationale}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {sr.policy_allowed && (
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span>Latency Bought: <strong className="text-emerald-400">+{sr.latency_bought_ms}ms</strong></span>
                      <span>Speculative Investment: <strong className="text-purple-400">{sr.speculative_investment_tokens} tokens</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
