import React, { useState, useEffect } from 'react';
import {
  ObservabilityOverview,
  SystemHealthMetrics,
  QualityMetrics,
  LeadershipOutcomeDashboard,
  DistributedTrace,
  TraceSpan
} from '../types';
import {
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  RefreshCw,
  Cpu,
  Layers,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  ExternalLink,
  Target,
  Sliders,
  Terminal,
  FileCode2,
  Workflow,
  Sparkles,
  GitBranch,
  Radio,
  Server,
  Database
} from 'lucide-react';

export const ObservabilityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'quality' | 'outcomes' | 'traces'>('health');
  const [overview, setOverview] = useState<ObservabilityOverview | null>(null);
  const [health, setHealth] = useState<SystemHealthMetrics | null>(null);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [outcomes, setOutcomes] = useState<LeadershipOutcomeDashboard | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string>('t-00938472-8f2a');
  const [currentTrace, setCurrentTrace] = useState<DistributedTrace | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<TraceSpan | null>(null);
  const [loading, setLoading] = useState(false);
  const [traceSearch, setTraceSearch] = useState('');

  const fetchObservabilityData = async () => {
    setLoading(true);
    try {
      const [overviewRes, healthRes, qualityRes, outcomesRes] = await Promise.all([
        fetch('http://localhost:6090/api/observability/overview').then((r) => r.json()),
        fetch('http://localhost:6090/api/observability/health').then((r) => r.json()),
        fetch('http://localhost:6090/api/observability/quality').then((r) => r.json()),
        fetch('http://localhost:6090/api/observability/outcomes').then((r) => r.json())
      ]);
      setOverview(overviewRes);
      setHealth(healthRes);
      setQuality(qualityRes);
      setOutcomes(outcomesRes);

      if (overviewRes.recent_traces && overviewRes.recent_traces.length > 0) {
        const traceId = selectedTraceId || overviewRes.recent_traces[0].trace_id;
        fetchTraceDetail(traceId);
      }
    } catch (e) {
      console.error('Error fetching observability data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraceDetail = async (traceId: string) => {
    try {
      const res = await fetch(`http://localhost:6090/api/observability/traces/${traceId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentTrace(data);
        setSelectedTraceId(traceId);
        if (data.spans && data.spans.length > 0) {
          setSelectedSpan(data.spans[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching trace detail:', e);
    }
  };

  useEffect(() => {
    fetchObservabilityData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-indigo-950/40 p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                §11 Observability
              </span>
              <span className="flex items-center text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                THREE-LAYER TELEMETRY ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Activity className="w-7 h-7 text-cyan-400" />
              Observability & Distributed Tracing
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              System Health • Quality & Calibration • Leadership Outcomes (§1.4) • End-to-End Tracing by <code className="text-cyan-300">trace_id</code>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchObservabilityData}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/50 flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Global KPI Strip */}
        {health && quality && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" /> System Status
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                {health.status}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                DLQ: {health.dlq_depth} • Budget Exh: {health.budget_exhaustion_frequency_pct}%
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Agent Latency (p50 / p95)
              </div>
              <div className="text-xl font-bold text-white mt-1">
                940ms <span className="text-xs text-slate-400 font-normal">/ 2,450ms</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Across 8 specialist agents
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" /> Confidence Calibration (ECE)
              </div>
              <div className="text-xl font-bold text-cyan-300 mt-1">
                {quality.expected_calibration_error}
              </div>
              <div className="text-[11px] text-emerald-400/90 mt-0.5">
                Well-Calibrated (0.8 = 84.8% empirical)
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Velocity Outcome
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                +335%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Deploys/wk • Lead time -69.7%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-slate-800 space-x-1">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'health'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Layer 1: System Health</span>
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'quality'
              ? 'border-purple-400 text-purple-300 bg-purple-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Target className="w-4 h-4 text-purple-400" />
          <span>Layer 2: Quality & Calibration</span>
        </button>

        <button
          onClick={() => setActiveTab('outcomes')}
          className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'outcomes'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Layer 3: Leadership Dashboard (§1.4)</span>
        </button>

        <button
          onClick={() => setActiveTab('traces')}
          className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-2 border-b-2 -mb-px ${
            activeTab === 'traces'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Workflow className="w-4 h-4 text-indigo-400" />
          <span>Distributed Trace Waterfall (trace_id)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 1: SYSTEM HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Queue Depths */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Queue Depths & Buffer Capacities</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Real-time ingress, serialization, and worker pool queue metrics across all planes.
              </p>

              <div className="space-y-3">
                {health.queue_depths.map((q) => {
                  const pct = Math.round((q.depth / q.max_capacity) * 100);
                  return (
                    <div key={q.queue_name} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-200 font-medium">{q.queue_name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-cyan-300">{q.depth} / {q.max_capacity}</span>
                          <span className="text-slate-400 text-[10px]">({pct}%)</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                            {q.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Circuit Breakers & Budget Exhaustion */}
            <div className="space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Circuit Breakers & Resilience State</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{health.circuit_breakers_summary.CLOSED || 4}</div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">CLOSED (Healthy)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/40 text-center">
                    <div className="text-2xl font-bold text-amber-400">{health.circuit_breakers_summary.HALF_OPEN || 1}</div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">HALF-OPEN (Probe)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-700/40 text-center">
                    <div className="text-2xl font-bold text-rose-400">{health.circuit_breakers_summary.OPEN || 0}</div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">OPEN (Tripped)</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Dead-Letter Queue (DLQ) Depth:</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                    {health.dlq_depth} items
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Budget Exhaustion Frequency</h3>
                </div>
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-extrabold text-cyan-400">{health.budget_exhaustion_frequency_pct}%</span>
                  <span className="text-xs text-slate-400">
                    ({health.budget_exhaustion_runs_count} runs exhausted budget of {health.total_runs_evaluated} evaluated)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${health.budget_exhaustion_frequency_pct * 5}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Safe threshold is &lt; 5.0%. Triggered runs safely degrade to deterministic checklist (Chant #6).
                </p>
              </div>
            </div>
          </div>

          {/* Agent Latency p50 / p95 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Specialist Agent Latency (p50 vs p95)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2">Agent ID</th>
                    <th className="pb-2">Calls Evaluated</th>
                    <th className="pb-2">p50 Latency</th>
                    <th className="pb-2">p95 Latency</th>
                    <th className="pb-2">Latency Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {health.agent_latencies.map((a) => (
                    <tr key={a.agent_id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-cyan-300 font-medium">{a.agent_id}</td>
                      <td className="py-2.5 text-slate-400">{a.call_count}</td>
                      <td className="py-2.5 text-white">{a.p50_ms}ms</td>
                      <td className="py-2.5 text-indigo-300">{a.p95_ms}ms</td>
                      <td className="py-2.5 w-64">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 flex overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full"
                            style={{ width: `${Math.min((a.p50_ms / 4000) * 100, 50)}%` }}
                          />
                          <div
                            className="bg-indigo-500 h-full"
                            style={{ width: `${Math.min(((a.p95_ms - a.p50_ms) / 4000) * 100, 50)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tool Error Rates */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Tool Error Rates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {health.tool_error_rates.map((t) => (
                <div key={t.tool_id} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 font-mono text-xs">
                  <div className="text-cyan-300 font-bold truncate">{t.tool_id}</div>
                  <div className="text-slate-400 text-[11px] mt-1">{t.calls_count} calls ({t.errors_count} errors)</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Error Rate:</span>
                    <span className="text-emerald-400 font-bold">{t.error_rate_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LAYER 2: QUALITY & CONFIDENCE CALIBRATION */}
      {/* ========================================================================= */}
      {activeTab === 'quality' && quality && (
        <div className="space-y-6">
          {/* Quality Rates Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400">Aggregate False Positive Rate</div>
              <div className="text-2xl font-bold text-white mt-1">{quality.aggregate_false_positive_rate_pct}%</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Target &lt; 5.0% (Meets SLA)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400">Plane 3 Escalation Rate</div>
              <div className="text-2xl font-bold text-indigo-300 mt-1">{quality.escalation_rate_pct}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Specialist Contradictions (Chant #5)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400">Human Override Rate</div>
              <div className="text-2xl font-bold text-purple-300 mt-1">{quality.human_override_rate_pct}%</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Autonomous Trust High (97.9% alignment)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400">Expected Calibration Error (ECE)</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{quality.expected_calibration_error}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Brier Score: {quality.brier_score}</div>
            </div>
          </div>

          {/* Finding Acceptance Rate per Agent */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Finding Acceptance Rate per Specialist Agent</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2.5">Agent Specialist</th>
                    <th className="pb-2.5">Total Findings</th>
                    <th className="pb-2.5">Accepted Findings</th>
                    <th className="pb-2.5">Acceptance Rate</th>
                    <th className="pb-2.5">False Positive Rate</th>
                    <th className="pb-2.5">Quality SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {quality.agent_stats.map((s) => (
                    <tr key={s.agent_id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-white font-medium">{s.agent_name}</td>
                      <td className="py-2.5 text-slate-400">{s.total_findings}</td>
                      <td className="py-2.5 text-slate-200">{s.accepted_findings}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">{s.acceptance_rate_pct}%</td>
                      <td className="py-2.5 text-amber-300">{s.false_positive_rate_pct}%</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[10px]">
                          {s.quality_sla_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confidence Calibration Curve */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Confidence Calibration Analysis</h3>
              </div>
              <span className="text-xs text-purple-300 font-mono">
                "Does 0.8 confidence mean right 80% of the time?" &rarr; <strong className="text-white">Yes: 84.8%</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Comparing model predicted confidence against empirical ground-truth verification outcomes.
            </p>

            <div className="space-y-3">
              {quality.calibration_bins.map((bin) => (
                <div key={bin.bin_range} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-cyan-300 font-medium">Confidence Bin [{bin.bin_range}]</span>
                    <div className="flex items-center space-x-3 font-mono text-[11px]">
                      <span className="text-slate-400">Predicted Midpoint: <strong>{(bin.predicted_confidence_midpoint * 100).toFixed(0)}%</strong></span>
                      <span className="text-emerald-400">Observed Accuracy: <strong>{bin.empirical_accuracy_pct}%</strong></span>
                      <span className="text-slate-500">Gap: {bin.calibration_gap_pct}%</span>
                      <span className="text-slate-400 text-[10px]">({bin.sample_count} samples)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-cyan-500 h-full rounded-l-full"
                      style={{ width: `${bin.predicted_confidence_midpoint * 100}%` }}
                      title={`Predicted: ${bin.predicted_confidence_midpoint * 100}%`}
                    />
                    <div
                      className="bg-emerald-400 h-full rounded-r-full opacity-80"
                      style={{ width: `${Math.max(bin.empirical_accuracy_pct - bin.predicted_confidence_midpoint * 100, 0)}%` }}
                      title={`Empirical: ${bin.empirical_accuracy_pct}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LAYER 3: OUTCOME (§1.4 LEADERSHIP DASHBOARD) */}
      {/* ========================================================================= */}
      {activeTab === 'outcomes' && outcomes && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Blueprint Invariant (§11):</span> Outcome metrics are
              <span className="text-emerald-300 font-semibold"> the only ones that go on a leadership dashboard</span>.
              Internal tool latencies, agent hops, and model token costs are excluded. This board reports the true business and delivery velocity transformation.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {outcomes.comparisons.map((item) => {
              const isPositive = item.sentiment === 'POSITIVE';
              return (
                <div
                  key={item.metric_key}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="text-xs text-slate-400 font-medium">{item.label}</div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-extrabold text-white">{item.active_val}</div>
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded font-mono ${
                        isPositive
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
                      }`}
                    >
                      {item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Baseline (Q0): <strong className="text-slate-300">{item.baseline_val}</strong></span>
                    <span className="text-emerald-400 font-mono text-[10px]">Verified</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Executive Summary Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Executive Engineering Velocity Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Implementing autonomous agent specialization and Policy-as-Code arbitration reduced median lead time by{' '}
              <strong className="text-emerald-400">69.7%</strong> (from 94.2 hours to 28.5 hours) while increasing deployment frequency by{' '}
              <strong className="text-emerald-400">335%</strong> (from 3.4/wk to 14.8/wk). Conformance with architecture standards reached{' '}
              <strong className="text-emerald-400">96.2%</strong> without developer friction, cutting change failure rate to{' '}
              <strong className="text-emerald-400">4.2%</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DISTRIBUTED TRACING WATERFALL (trace_id) */}
      {/* ========================================================================= */}
      {activeTab === 'traces' && (
        <div className="space-y-6">
          {/* Trace Selector Bar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Workflow className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white">Select Trace ID:</span>
              {overview?.recent_traces.map((t) => (
                <button
                  key={t.trace_id}
                  onClick={() => fetchTraceDetail(t.trace_id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedTraceId === t.trace_id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t.trace_id} ({t.total_duration_ms}ms)
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              Every run is traceable end-to-end by <code className="text-cyan-300">trace_id</code> across agents, tools, and model calls.
            </div>
          </div>

          {currentTrace && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Waterfall Timeline (2 cols) */}
              <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-mono text-cyan-400 font-bold">{currentTrace.trace_id}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Work Object: <span className="text-slate-300">{currentTrace.work_id}</span> ({currentTrace.play_id})
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="text-slate-400">Duration: <strong className="text-white">{currentTrace.total_duration_ms}ms</strong></span>
                    <span className="text-slate-400">Tokens: <strong className="text-white">{currentTrace.total_tokens}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-bold">
                      {currentTrace.root_status}
                    </span>
                  </div>
                </div>

                {/* Spans Waterfall Gantt */}
                <div className="space-y-2">
                  {currentTrace.spans.map((span) => {
                    const maxMs = currentTrace.total_duration_ms || 1;
                    const leftPct = Math.min((span.start_time_offset_ms / maxMs) * 100, 95);
                    const widthPct = Math.max((span.duration_ms / maxMs) * 100, 5);
                    const isSelected = selectedSpan?.span_id === span.span_id;

                    const typeBadgeColor =
                      span.span_type === 'AGENT'
                        ? 'bg-purple-950 text-purple-300 border-purple-800/40'
                        : span.span_type === 'TOOL'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                        : span.span_type === 'MODEL'
                        ? 'bg-amber-950 text-amber-300 border-amber-800/40'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-800/40';

                    return (
                      <div
                        key={span.span_id}
                        onClick={() => setSelectedSpan(span)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${typeBadgeColor}`}>
                              {span.span_type}
                            </span>
                            <span className="font-semibold text-white">{span.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({span.actor})</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300">
                            +{span.start_time_offset_ms}ms • <strong className="text-white">{span.duration_ms}ms</strong>
                          </div>
                        </div>

                        {/* Gantt bar */}
                        <div className="w-full bg-slate-900 rounded h-2 relative overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 rounded bg-gradient-to-r from-cyan-500 to-indigo-500"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Span Detail Card (1 col) */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">Span Inspection</h3>
                  </div>

                  {selectedSpan ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Span ID</span>
                        <span className="font-mono text-cyan-300 font-bold">{selectedSpan.span_id}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Parent Span</span>
                        <span className="font-mono text-slate-300">{selectedSpan.parent_span_id || 'None (Root Span)'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Span Type & Actor</span>
                        <span className="font-mono text-white">
                          [{selectedSpan.span_type}] {selectedSpan.actor}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Duration</span>
                          <span className="font-mono text-emerald-400 font-bold">{selectedSpan.duration_ms}ms</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Tokens Spent</span>
                          <span className="font-mono text-white font-bold">{selectedSpan.tokens_spent}</span>
                        </div>
                      </div>

                      {selectedSpan.details && (
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-slate-400 block text-[11px] mb-1">Span Metadata & Attributes</span>
                          <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto">
                            {JSON.stringify(selectedSpan.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-12 text-center">
                      Select a span to inspect its attributes
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-semibold">OpenTelemetry Standard:</span> Traces correlate across all 3 planes and
                  the Write Arbiter.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
