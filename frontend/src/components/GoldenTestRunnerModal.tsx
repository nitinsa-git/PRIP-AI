import React, { useState, useEffect } from 'react';
import { 
  X, Play, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Clock, Cpu, Sparkles, RefreshCw, FileText, Award, Layers
} from 'lucide-react';

interface GoldenTestCase {
  test_id: string;
  name: string;
  category: string;
  input_trigger: string;
  expected_invariant: string;
  target_agent: string;
  status: string;
  latency_ms: number;
  token_usage: number;
  assertion_details: string;
}

interface GoldenTestSuite {
  project_id: string;
  suite_id: string;
  suite_path: string;
  play_version: string;
  baseline_pass_rate_pct: number;
  last_evaluated_at?: string;
  sla_threshold_pct: number;
  total_test_cases: number;
  test_cases: GoldenTestCase[];
}

interface GoldenTestRunResponse {
  run_id: string;
  project_id: string;
  timestamp: string;
  operator: string;
  prompt_version: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  pass_rate_pct: number;
  regression_detected: boolean;
  regression_delta_pct: number;
  autonomy_action: string;
  test_results: GoldenTestCase[];
  summary: string;
}

interface GoldenTestRunnerModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onRunComplete?: () => void;
}

export const GoldenTestRunnerModal: React.FC<GoldenTestRunnerModalProps> = ({
  project,
  isOpen,
  onClose,
  onRunComplete
}) => {
  const [suite, setSuite] = useState<GoldenTestSuite | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [promptVersion, setPromptVersion] = useState('v2.4-strict');
  const [injectDrift, setInjectDrift] = useState(false);
  const [lastResult, setLastResult] = useState<GoldenTestRunResponse | null>(null);

  useEffect(() => {
    if (isOpen && project?.project_id) {
      fetchSuite();
    }
  }, [isOpen, project?.project_id]);

  const fetchSuite = async () => {
    if (!project?.project_id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.project_id}/golden-tests`);
      if (res.ok) {
        const data = await res.json();
        setSuite(data);
      }
    } catch (err) {
      console.error('Failed to load golden test suite:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    if (!project?.project_id) return;
    setRunning(true);
    try {
      const res = await fetch(`/api/projects/${project.project_id}/golden-tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_version: promptVersion,
          inject_drift: injectDrift,
          operator: 'Lead Platform Architect'
        })
      });
      if (res.ok) {
        const data: GoldenTestRunResponse = await res.json();
        setLastResult(data);
        if (suite) {
          setSuite({
            ...suite,
            last_evaluated_at: data.timestamp,
            test_cases: data.test_results
          });
        }
        if (onRunComplete) {
          onRunComplete();
        }
      }
    } catch (err) {
      console.error('Failed to run golden evaluation:', err);
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#070b16] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0a1124] to-[#080d1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  §13.6 GOLDEN SET EVALUATION HARNESS
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Chant #8 Continuous Gate
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{project.name}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({project.project_id})</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0b1222] border border-white/5 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase">Service Tier</div>
              <div className="text-white font-bold mt-0.5 truncate">{project.tier}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1222] border border-white/5 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase">Current Autonomy</div>
              <div className="text-cyan-300 font-bold mt-0.5">{project.autonomy_rung}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1222] border border-white/5 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase">Suite Path</div>
              <div className="text-purple-300 font-bold mt-0.5 truncate" title={suite?.suite_path || project.golden_set_path}>
                {suite?.suite_path || project.golden_set_path}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1222] border border-white/5 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase">SLA Target</div>
              <div className="text-emerald-400 font-bold mt-0.5">&ge; {suite?.sla_threshold_pct || 95.0}% Pass</div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-[#0b1328] border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1 font-mono text-xs">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Prompt / Play Spec:</label>
                <select
                  value={promptVersion}
                  onChange={(e) => setPromptVersion(e.target.value)}
                  className="bg-[#050811] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs block focus:outline-none focus:border-cyan-400"
                >
                  <option value="v2.4-strict">v2.4-strict (Production Baseline)</option>
                  <option value="v2.5-experimental">v2.5-experimental (Candidate)</option>
                  <option value="v1.9-legacy">v1.9-legacy (Unconstrained)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs pt-4 md:pt-0">
                <input
                  type="checkbox"
                  checked={injectDrift}
                  onChange={(e) => setInjectDrift(e.target.checked)}
                  className="rounded border-white/20 text-rose-500 focus:ring-0 w-4 h-4 bg-black"
                />
                <span className="text-rose-300 font-medium">Inject Prompt Drift / Fault (Simulate Regression)</span>
              </label>
            </div>

            <button
              disabled={running || loading}
              onClick={handleRunEvaluation}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                running
                  ? 'bg-cyan-500/50 text-black cursor-wait animate-pulse'
                  : 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-glow-cyan hover:scale-[1.02]'
              }`}
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Golden Suite...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Execute Golden Harness</span>
                </>
              )}
            </button>
          </div>

          {/* Last Run Outcome Banner */}
          {lastResult && (
            <div className={`p-4 rounded-xl border ${
              lastResult.regression_detected
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            } font-mono text-xs space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {lastResult.regression_detected ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <span>
                    {lastResult.regression_detected
                      ? 'REGRESSION DETECTED: CHANT #8 AUTONOMY GATING TRIGGERED'
                      : 'ALL GOLDEN ASSERTIONS PASSED WITH ZERO REGRESSION'}
                  </span>
                </div>
                <div className="text-[11px] opacity-80">{lastResult.timestamp.slice(11, 19)} UTC</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
                <div>
                  <div className="text-[10px] opacity-70">Pass Rate:</div>
                  <div className="font-bold text-base">{lastResult.pass_rate_pct}% ({lastResult.passed_cases}/{lastResult.total_cases})</div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70">Delta vs Baseline:</div>
                  <div className={`font-bold text-base ${lastResult.regression_delta_pct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lastResult.regression_delta_pct > 0 ? `-${lastResult.regression_delta_pct}%` : '0.0%'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70">Chant #8 Action:</div>
                  <div className="font-bold text-base text-amber-300">{lastResult.autonomy_action}</div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70">Evaluator:</div>
                  <div className="font-bold text-base truncate">{lastResult.operator}</div>
                </div>
              </div>

              <div className="text-xs pt-1 opacity-90">{lastResult.summary}</div>
            </div>
          )}

          {/* Test Cases List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-slate-400">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Golden Invariant Test Cases ({suite?.test_cases?.length || 0})</span>
              </span>
              <span>Baseline: {suite?.baseline_pass_rate_pct || 100}%</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading Golden Test Suite...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {suite?.test_cases?.map((tc) => {
                  const isPass = tc.status === 'PASSED';
                  const isRegr = tc.status === 'REGRESSION';
                  return (
                    <div
                      key={tc.test_id}
                      className={`p-4 rounded-xl border transition-all ${
                        isPass
                          ? 'bg-[#0a1220] border-white/5 hover:border-emerald-500/30'
                          : isRegr
                          ? 'bg-rose-950/20 border-rose-500/40 shadow-glow-rose'
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isPass
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isRegr
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {tc.status}
                          </span>
                          <span className="font-bold text-white text-sm">{tc.name}</span>
                          <span className="text-slate-500 text-[10px]">[{tc.test_id}]</span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-cyan-400" />
                            <span>{tc.target_agent}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{tc.latency_ms}ms</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2.5 space-y-1.5 font-mono text-xs">
                        <div className="text-slate-300">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Input Trigger: </span>
                          <span>{tc.input_trigger}</span>
                        </div>
                        <div className="text-purple-300">
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Expected Invariant: </span>
                          <span>{tc.expected_invariant}</span>
                        </div>
                        <div className={`p-2 rounded bg-black/40 text-[11px] ${
                          isPass ? 'text-emerald-300' : 'text-rose-300 font-bold'
                        }`}>
                          <span className="text-slate-500 text-[10px] uppercase">Assertion Result: </span>
                          {tc.assertion_details}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#060a14] flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Chant #8: Treat prompts as code with tests. Regressions gate autonomy.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
