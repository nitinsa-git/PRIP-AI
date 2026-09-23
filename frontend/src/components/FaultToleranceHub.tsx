import React, { useState, useEffect } from 'react';
import {
  ResilienceStatus,
  ModelLadderExecution,
  DegradedRunExecution,
  DeadLetterQueueItem,
  DualPathRedundancyRun,
  RunReplaySession
} from '../types';
import {
  ShieldAlert,
  Flame,
  Zap,
  Activity,
  Layers,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RotateCcw,
  Sparkles,
  Sliders,
  TrendingDown,
  Clock,
  History,
  GitCommit,
  CheckSquare,
  Users,
  Terminal,
  HelpCircle,
  Inbox
} from 'lucide-react';

export const FaultToleranceHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'resilience' | 'ladder' | 'dlq' | 'redundancy' | 'replay'>('resilience');
  const [resilience, setResilience] = useState<ResilienceStatus | null>(null);
  const [ladderResult, setLadderResult] = useState<ModelLadderExecution | null>(null);
  const [degradedResult, setDegradedResult] = useState<DegradedRunExecution | null>(null);
  const [dlqItems, setDlqItems] = useState<DeadLetterQueueItem[]>([]);
  const [dualPathResult, setDualPathResult] = useState<DualPathRedundancyRun | null>(null);
  const [replaySession, setReplaySession] = useState<RunReplaySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Ladder Simulation State
  const [failTier1, setFailTier1] = useState(true);
  const [failTier2, setFailTier2] = useState(true);

  // Redundancy Simulation State
  const [simulateDisagreement, setSimulateDisagreement] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, dlqRes, repRes] = await Promise.all([
        fetch('http://localhost:6090/api/fault-tolerance/resilience'),
        fetch('http://localhost:6090/api/fault-tolerance/dlq'),
        fetch('http://localhost:6090/api/fault-tolerance/replay/WO-2026-014872')
      ]);

      if (resRes.ok) setResilience(await resRes.json());
      if (dlqRes.ok) setDlqItems(await dlqRes.json());
      if (repRes.ok) setReplaySession(await repRes.json());
    } catch (err) {
      console.error('Failed to fetch Section 9 data:', err);
      showToast('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBreaker = async (targetId: string, currentState: string) => {
    const nextState = currentState === 'CLOSED' ? 'OPEN' : 'CLOSED';
    try {
      const res = await fetch('http://localhost:6090/api/fault-tolerance/circuit-breaker/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_id: targetId, new_state: nextState })
      });
      if (res.ok) {
        showToast(`Circuit breaker for ${targetId} switched to ${nextState}`, 'success');
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExecuteModelLadder = async () => {
    const failTiers: number[] = [];
    if (failTier1) failTiers.push(1);
    if (failTier2) failTiers.push(2);

    try {
      const res = await fetch('http://localhost:6090/api/fault-tolerance/model-ladder/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: 'WO-2026-014872',
          simulate_fail_tiers: failTiers
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLadderResult(data);
        showToast(`Model ladder resolved at Tier ${data.winning_tier} (${data.final_model_used}). Confidence: ${data.recorded_confidence}`, 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTriggerDegradedMode = async () => {
    try {
      const res = await fetch('http://localhost:6090/api/fault-tolerance/degraded-mode/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: 'WO-2026-014872',
          play_id: 'play.service_change.standard.v4'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDegradedResult(data);
        showToast(`Chant #6 Degraded mode executed! Minimum safe checklist produced. Pipeline BLOCKED: FALSE.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleActionDLQ = async (dlqId: string, action: string) => {
    try {
      const res = await fetch(`http://localhost:6090/api/fault-tolerance/dlq/${dlqId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message, 'success');
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExecuteT1DualPath = async () => {
    try {
      const res = await fetch('http://localhost:6090/api/fault-tolerance/redundancy/t1-dual-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: 'WO-2026-014872',
          simulate_disagreement: simulateDisagreement
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDualPathResult(data);
        showToast(`T1 Dual-Run resolved: ${data.consensus_status}. Confidence: ${data.final_confidence}`, 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 9 HEADER & INVARIANTS */}
      <div className="bg-slate-900/80 backdrop-blur border border-rose-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase bg-rose-950 text-rose-400 border border-rose-500/40 rounded">
                Section 9 Architecture Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono">Chant #6 & Chant #12 Enforced</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
              Fault Tolerance, Redundancy & Run Replay
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Circuit breakers, bulkheads, four-tier model ladder with confidence decay, Chant #6 non-blocking degraded mode, Chant #12 saga compensation, DLQ triage, T1 dual-path consensus, and deterministic run replay.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 rounded-lg text-sm font-semibold transition-all shadow"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Health
          </button>
        </div>

        {/* FOUR CORE INVARIANTS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
              <Activity className="w-3.5 h-3.5" />
              §9.1 Breakers & Bulkheads
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Circuit breakers isolate failing tools. Bulkheads prevent one saturated tool from starving unrelated plays.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              §9.2 Confidence Decay
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Model ladder down-tiers reduce confidence. A degraded answer is never presented as full confidence.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-1">
              <CheckSquare className="w-3.5 h-3.5" />
              §9.3 Degraded Mode (Chant #6)
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Minimum safe action: "collect facts, checklist, block nothing, notify human." Pipeline does not wait for models.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5" />
              §9.6 T1 Redundancy
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Two independent model paths for T1 items. Agreement raises confidence; disagreement routes to human.
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
              : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMsg.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMsg.type === 'info' && <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />}
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
          onClick={() => setActiveSubTab('resilience')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'resilience'
              ? 'border-rose-400 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Per-Call Resilience & Bulkheads (§9.1)
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
            {resilience?.circuit_breakers.length || 5} Breakers
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ladder')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'ladder'
              ? 'border-rose-400 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Model Ladder & Degraded Mode (§9.2, §9.3)
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
            Chant #6
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('dlq')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'dlq'
              ? 'border-rose-400 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Dead-Letter Queue (§9.5)
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
            {dlqItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('redundancy')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'redundancy'
              ? 'border-rose-400 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          T1 Redundant Dual-Run (§9.6)
          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
            T1 Gated
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('replay')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'replay'
              ? 'border-rose-400 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Run Replay Engine (§9.7)
          <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Audit Scrubber
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: PER-CALL RESILIENCE */}
      {activeSubTab === 'resilience' && resilience && (
        <div className="space-y-6">
          {/* CIRCUIT BREAKERS MATRIX */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-white text-sm font-mono uppercase">
                    Circuit Breakers State Machine
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Per-tool and per-model endpoint isolation
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Threshold: <strong>5 failures</strong></span>
                <span>•</span>
                <span>Reset Timeout: <strong>30s</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {resilience.circuit_breakers.map((cb) => (
                <div key={cb.target_id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{cb.target_id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {cb.target_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">State:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      cb.state === 'CLOSED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : cb.state === 'OPEN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}>
                      {cb.state}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Failures:</span>
                    <span className={cb.failure_count > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {cb.failure_count} / {cb.failure_threshold}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleBreaker(cb.target_id, cb.state)}
                    className="w-full mt-1 py-1 px-2 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-1"
                  >
                    {cb.state === 'CLOSED' ? 'Simulate Trip (OPEN)' : 'Reset Breaker (CLOSED)'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BULKHEAD POOLS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resilience.bulkheads.map((bh) => {
              const utilPct = Math.round((bh.active_slots / bh.max_concurrency) * 100);
              return (
                <div key={bh.pool_id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-sm">{bh.target_system}</span>
                    <span className="text-xs text-cyan-400 font-bold">{bh.pool_id}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Concurrency Saturation:</span>
                    <span className="font-bold text-white">{bh.active_slots} / {bh.max_concurrency} slots ({utilPct}%)</span>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        utilPct > 75 ? 'bg-rose-500' : utilPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${utilPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Queued: <strong className="text-slate-200">{bh.queued_requests}</strong></span>
                    <span>Rejected: <strong className="text-rose-400">{bh.rejected_requests}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EXPONENTIAL BACKOFF WITH JITTER STRIP */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="font-bold text-white block">Exponential Backoff & Full Jitter Engine</span>
                <span className="text-slate-400 text-[11px]">Prevents thundering herd retries against substrate tools</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span>Base: <strong className="text-cyan-400">{resilience.backoff_config.base_delay_ms}ms</strong></span>
              <span>Max: <strong className="text-cyan-400">{resilience.backoff_config.max_delay_ms}ms</strong></span>
              <span>Factor: <strong className="text-cyan-400">{resilience.backoff_config.backoff_factor}x</strong></span>
              <span>Jitter: <strong className="text-emerald-400">±{Math.round(resilience.backoff_config.jitter_range_pct * 100)}%</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MODEL LADDER & DEGRADED MODE */}
      {activeSubTab === 'ladder' && (
        <div className="space-y-6">
          {/* TOP CONTROLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: 4-TIER WATERFALL LADDER */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm font-mono uppercase">
                      The Model Tier Ladder (§9.2)
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Strict confidence decay on downgrade
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteModelLadder}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  Execute Ladder Fallback
                </button>
              </div>

              {/* SIMULATION TOGGLES */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Simulate Outages:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={failTier1}
                      onChange={(e) => setFailTier1(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    Fail Tier 1 (Primary)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={failTier2}
                      onChange={(e) => setFailTier2(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    Fail Tier 2 (Secondary)
                  </label>
                </div>
              </div>

              {/* 4 TIERS DISPLAY */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className={`p-3 rounded-lg border space-y-1 transition-all ${
                  failTier1 ? 'bg-rose-950/20 border-rose-500/30 opacity-70' : 'bg-slate-950 border-emerald-500/40'
                }`}>
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Tier 1: Primary Model (gemini-1.5-pro / claude-3-5-sonnet)</span>
                    <span className="text-emerald-400">Max Conf: 0.95</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Deep multi-turn reasoning</span>
                    <span className={failTier1 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {failTier1 ? 'FAILED OVER' : 'ACTIVE / HEALTHY'}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border space-y-1 transition-all ${
                  failTier2 ? 'bg-rose-950/20 border-rose-500/30 opacity-70' : 'bg-slate-950 border-amber-500/40'
                }`}>
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Tier 2: Secondary Model (gpt-4o)</span>
                    <span className="text-amber-400">Max Conf: 0.82 (-13.7%)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Alternative provider fallback</span>
                    <span className={failTier2 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                      {failTier2 ? 'FAILED OVER' : 'STANDBY READY'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-slate-950 border-indigo-500/40 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Tier 3: Smaller/Cheaper Model (gemini-1.5-flash / haiku)</span>
                    <span className="text-indigo-400">Max Conf: 0.68 (-28.4%)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Fast bounded token analysis</span>
                    <span className="text-indigo-400 font-bold">STANDBY READY</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-slate-950 border-slate-700 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Tier 4: Deterministic Path (rules-catalog.v4)</span>
                    <span className="text-slate-400">Max Conf: 0.50 (-47.4%)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Zero token expenditure guarantee</span>
                    <span className="text-slate-400 font-bold">PERMANENT ANCHOR</span>
                  </div>
                </div>
              </div>

              {/* LADDER EXECUTION OUTCOME */}
              {ladderResult && (
                <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-lg space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Resolved at Tier {ladderResult.winning_tier}: {ladderResult.final_model_used}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-200 border border-amber-500/30">
                      Recorded Conf: {ladderResult.recorded_confidence}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    "{ladderResult.reasoning_output}"
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    Confidence discount applied: <strong className="text-rose-400">-{ladderResult.confidence_discount_percent}%</strong> (A degraded answer is never presented as full confidence).
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: CHANT #6 DEGRADED MODE */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-emerald-500/30 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm font-mono uppercase">
                      Degraded Mode (§9.3 Chant #6)
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono">
                      Minimum Safe Action • Block Nothing
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleTriggerDegradedMode}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Trigger Chant #6
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                "The deployment pipeline does not wait for a model to come back. Performs the minimum safe action: collect facts, produce checklist, block nothing, notify human."
              </p>

              {degradedResult ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pipeline Blocked:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                        FALSE (UNBLOCKED)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Human Notified:</span>
                      <span className="text-slate-200">{degradedResult.human_notified}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1.5">
                      Deterministic Facts Checklist:
                    </span>
                    <div className="space-y-1.5">
                      {degradedResult.checklist.map((chk) => (
                        <div key={chk.item_id} className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-bold">{chk.task}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">
                              {chk.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{chk.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 font-mono text-xs">
                  Click "Trigger Chant #6" to execute the deterministic degraded mode checklist.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEAD-LETTER QUEUE */}
      {activeSubTab === 'dlq' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-4 font-mono">
            <div>
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                <Inbox className="w-4 h-4 text-rose-400" />
                Dead-Letter Queue Monitor (§9.5)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Work Objects that exhausted retries land in DLQ with full state snapshot and error trace.
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-bold">
              DLQ Depth: {dlqItems.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {dlqItems.map((item) => (
              <div key={item.dlq_id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400 text-sm">{item.dlq_id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{item.work_id}</span>
                    <span className="text-slate-400">Failed at: <code className="text-amber-400">{item.failure_step}</code></span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    item.status === 'UNTRIAGED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.status} ({item.retry_count}/{item.max_retries} retries exhausted)
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-rose-500/30 text-rose-300 text-[11px]">
                  <strong>Error Trace:</strong> {item.error_trace}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px]">Enqueued: {item.enqueued_at}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleActionDLQ(item.dlq_id, 'RETRY')}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-bold text-xs"
                    >
                      Retry Run
                    </button>
                    <button
                      onClick={() => handleActionDLQ(item.dlq_id, 'FORCE_COMPLETE_DEGRADED')}
                      className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 rounded font-bold text-xs"
                    >
                      Force Complete Degraded
                    </button>
                    <button
                      onClick={() => handleActionDLQ(item.dlq_id, 'PURGE_DISCARD')}
                      className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded font-bold text-xs"
                    >
                      Purge / Discard
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: T1 REDUNDANT DUAL-RUN */}
      {activeSubTab === 'redundancy' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800 font-mono">
              <div>
                <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Redundancy for High-Consequence Decisions (§9.6)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  "For T1 decisions, run two independent agent paths. Agreement raises confidence; disagreement routes to human."
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={simulateDisagreement}
                    onChange={(e) => setSimulateDisagreement(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0"
                  />
                  Simulate Specialist Disagreement
                </label>
                <button
                  onClick={handleExecuteT1DualPath}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow"
                >
                  <Users className="w-3.5 h-3.5" />
                  Run T1 Dual Verification
                </button>
              </div>
            </div>

            {dualPathResult ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{dualPathResult.work_id}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">
                      {dualPathResult.risk_tier} RISK TIER
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded font-bold ${
                      dualPathResult.consensus_status === 'AGREEMENT_HIGH_CONFIDENCE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}>
                      {dualPathResult.consensus_status}
                    </span>
                    <span className="text-slate-300">
                      Final Conf: <strong className="text-emerald-400">{dualPathResult.final_confidence}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PATH A */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 text-sm">Path A: {dualPathResult.path_a.agent_name}</span>
                      <span className="text-[10px] text-slate-400">Model: {dualPathResult.path_a.model_used}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Framing: <strong className="text-slate-200">{dualPathResult.path_a.evidence_framing}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 pt-1">
                      <span>Verdict: <code className="text-amber-400 font-bold">{dualPathResult.path_a.verdict}</code></span>
                      <span>Confidence: <strong className="text-emerald-400">{Math.round(dualPathResult.path_a.confidence * 100)}%</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-900">
                      "{dualPathResult.path_a.rationale}"
                    </p>
                  </div>

                  {/* PATH B */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 text-sm">Path B: {dualPathResult.path_b.agent_name}</span>
                      <span className="text-[10px] text-slate-400">Model: {dualPathResult.path_b.model_used}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Framing: <strong className="text-slate-200">{dualPathResult.path_b.evidence_framing}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 pt-1">
                      <span>Verdict: <code className="text-amber-400 font-bold">{dualPathResult.path_b.verdict}</code></span>
                      <span>Confidence: <strong className="text-emerald-400">{Math.round(dualPathResult.path_b.confidence * 100)}%</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-900">
                      "{dualPathResult.path_b.rationale}"
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300">
                  Routing Action: <strong className="text-cyan-400">{dualPathResult.routed_to}</strong>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 font-mono text-xs">
                Click "Run T1 Dual Verification" to execute independent dual-model analysis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: RUN REPLAY ENGINE */}
      {activeSubTab === 'replay' && replaySession && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-4 font-mono">
            <div>
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Run Replay Engine (§9.7)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                "The full event log makes any run reconstructable. Simultaneously the debugging tool, audit trail, and regression corpus."
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-bold">
              Target: {replaySession.work_id} ({replaySession.total_events} events)
            </span>
          </div>

          {/* CHRONOLOGICAL EVENT SCRUBBER */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 font-mono text-xs">
            <span className="font-bold text-white block uppercase tracking-wider text-xs pb-2 border-b border-slate-800">
              Reconstructed Event Trace
            </span>

            <div className="space-y-3">
              {replaySession.steps.map((st) => (
                <div key={st.step_index} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[10px]">
                        Step #{st.step_index}
                      </span>
                      <span className="font-bold text-white">{st.event}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{st.timestamp} UTC</span>
                  </div>

                  <p className="text-slate-300 text-[11px]">
                    {st.payload_summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>Actor: <strong className="text-slate-200">{st.actor}</strong></span>
                    <span>Plane: <strong className="text-cyan-400">{st.source_plane}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
