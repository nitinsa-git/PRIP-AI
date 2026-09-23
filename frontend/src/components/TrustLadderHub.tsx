import React, { useState, useEffect } from 'react';
import {
  TrustLadderOverview,
  PlayTrustLadderItem,
  TrustRung
} from '../types';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Sliders,
  ChevronRight,
  Terminal,
  FileCheck,
  AlertOctagon,
  RotateCcw,
  Check,
  X,
  Play
} from 'lucide-react';

export const TrustLadderHub: React.FC = () => {
  const [overview, setOverview] = useState<TrustLadderOverview | null>(null);
  const [selectedPlay, setSelectedPlay] = useState<PlayTrustLadderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:6090/api/trust-ladder/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
        if (data.plays && data.plays.length > 0) {
          if (!selectedPlay) {
            setSelectedPlay(data.plays[0]);
          } else {
            const updated = data.plays.find((p: PlayTrustLadderItem) => p.play_id === selectedPlay.play_id);
            if (updated) setSelectedPlay(updated);
          }
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Error loading Trust Ladder data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleEvaluatePlay = async (playId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/trust-ladder/plays/${playId}/evaluate`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Evaluated 5 clean runs on '${updated.play_name}'. Criteria progress updated!`, 'success');
        fetchOverview();
      }
    } catch (e) {
      console.error(e);
      showToast('Evaluation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromotePlay = async (playId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/trust-ladder/plays/${playId}/promote`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`PROMOTED: '${updated.play_name}' advanced to [${updated.current_rung}]!`, 'success');
        fetchOverview();
      } else {
        const err = await res.json();
        showToast(err.detail || 'Promotion failed', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Promotion network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTripDemotion = async (playId: string, triggerType: string = 'FALSE_POSITIVE_SPIKE') => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/trust-ladder/plays/${playId}/trip-demotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_type: triggerType,
          reason: `Simulated ${triggerType} trigger exceeding threshold. Demoted automatically without a meeting.`
        })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`AUTOMATIC DEMOTION: '${updated.play_name}' demoted to [${updated.current_rung}]. No meeting required!`, 'error');
        fetchOverview();
      }
    } catch (e) {
      console.error(e);
      showToast('Demotion trigger error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPlay = async (playId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/trust-ladder/plays/${playId}/reset`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast(`Demotion alert cleared for '${playId}'. Baseline telemetry restored.`, 'info');
        fetchOverview();
      }
    } catch (e) {
      console.error(e);
      showToast('Reset error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getRungBadge = (rung: TrustRung) => {
    switch (rung) {
      case 'AUTONOMOUS':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-glow-purple';
      case 'APPROVAL_REQUIRED':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      case 'ADVISORY':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      case 'SHADOW':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center space-x-3 text-sm backdrop-blur-md transition-all duration-300 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMsg.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950/20 to-indigo-950/40 p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                §12 The Trust Ladder
              </span>
              <span className="flex items-center text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1.5" />
                CHANT #8 INVARIANT ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Award className="w-7 h-7 text-purple-400" />
              Per-Play Autonomy & Progressive Trust
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              <strong className="text-white">Autonomy is earned per Play, not per agent and never globally (Chant #8)</strong>.
              Every rung has a pre-defined demotion trigger. Demotion is automatic and does not require a meeting.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOverview}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Trust Ladder</span>
            </button>
          </div>
        </div>

        {/* Global Rung Counter Strip */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Total Governed Plays</div>
              <div className="text-xl font-bold text-white mt-1">{overview.total_plays}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scored by YAML Play DAG</div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400">1. Shadow Rung</div>
              <div className="text-xl font-bold text-slate-300 mt-1">{overview.plays_by_rung.SHADOW || 0}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Output invisible to requester</div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400">2. Advisory Rung</div>
              <div className="text-xl font-bold text-cyan-300 mt-1">{overview.plays_by_rung.ADVISORY || 0}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Shown as suggestions</div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400">3. Approval-Required</div>
              <div className="text-xl font-bold text-amber-300 mt-1">{overview.plays_by_rung.APPROVAL_REQUIRED || 0}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Proposes, human clicks go</div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-slate-400">4. Autonomous Rung</div>
              <div className="text-xl font-bold text-purple-300 mt-1">{overview.plays_by_rung.AUTONOMOUS || 0}</div>
              <div className="text-[11px] text-purple-400/90 mt-0.5 font-mono">Declared write scope</div>
            </div>
          </div>
        )}
      </div>

      {/* The 4 Rungs Reference Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">The Four Progressive Trust Rungs (§12 Blueprint)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-200">1. Shadow</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">Rung 1</span>
            </div>
            <div className="text-slate-400 text-[11px] mb-2 leading-relaxed">
              Runs, scores itself, takes no action, output invisible to requester.
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400 font-mono">
              Promotion: Accuracy vs golden set over N runs
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-cyan-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-cyan-300">2. Advisory</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono">Rung 2</span>
            </div>
            <div className="text-slate-400 text-[11px] mb-2 leading-relaxed">
              Output shown to humans as suggestion.
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400 font-mono">
              Promotion: Acceptance rate above threshold, sustained
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-amber-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-300">3. Approval-required</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[10px] font-mono">Rung 3</span>
            </div>
            <div className="text-slate-400 text-[11px] mb-2 leading-relaxed">
              Proposes concrete action, human clicks go.
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-400 font-mono">
              Promotion: Low override rate, zero severity incidents
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-purple-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-purple-300">4. Autonomous</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 text-[10px] font-mono">Rung 4</span>
            </div>
            <div className="text-slate-400 text-[11px] mb-2 leading-relaxed">
              Acts within declared write scope.
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-purple-400 font-mono">
              Promotion: Explicit sign-off, recorded, with demotion trigger
            </div>
          </div>
        </div>
      </div>

      {/* Suggested v1 Sequencing Roadmap */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Suggested Sequencing for v1 Deployment Roadmap</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Low-risk &rarr; Immediate ROI &rarr; Write Scope Last
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
          {[
            { step: '1', name: 'Change & Comms', desc: 'Low risk, hours returned', rung: 'AUTONOMOUS', color: 'border-purple-500/40 text-purple-300' },
            { step: '2', name: 'Flow Analyst', desc: 'Reviewer idle detection', rung: 'ADVISORY', color: 'border-cyan-500/40 text-cyan-300' },
            { step: '3', name: 'Arch Conformance', desc: 'Standards suggestions', rung: 'ADVISORY', color: 'border-cyan-500/40 text-cyan-300' },
            { step: '4', name: 'Build & Release', desc: 'Runner spot allocation', rung: 'APPROVAL_REQUIRED', color: 'border-amber-500/40 text-amber-300' },
            { step: '5', name: 'Reliability Sentinel', desc: 'Pool shedding benchmark', rung: 'SHADOW', color: 'border-slate-600 text-slate-400' },
            { step: '6', name: 'Write Arbiter Scope', desc: 'Direct mutation (Last)', rung: 'APPROVAL_REQUIRED', color: 'border-rose-500/40 text-rose-300' }
          ].map((s) => (
            <div key={s.step} className={`p-3 rounded-lg bg-slate-950/70 border ${s.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-slate-400 text-[10px]">Seq #{s.step}</span>
                <span className="font-mono text-[9px] px-1 rounded bg-slate-900">{s.rung}</span>
              </div>
              <div className="font-bold text-white text-[11px] truncate">{s.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plays Management Matrix & Simulation Station */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plays List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Per-Play Trust Rungs & Criteria Progress
            </h3>
            <span className="text-xs text-slate-400">Click a play to inspect or simulate</span>
          </div>

          <div className="space-y-3">
            {overview?.plays.map((play) => {
              const isSelected = selectedPlay?.play_id === play.play_id;
              const hasTripped = play.demotion_trigger.is_tripped;

              return (
                <div
                  key={play.play_id}
                  onClick={() => setSelectedPlay(play)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border-purple-500/60 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                        #{play.v1_sequence_order}
                      </span>
                      <h4 className="text-sm font-bold text-white">{play.play_name}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRungBadge(play.current_rung)}`}>
                        {play.current_rung}
                      </span>
                      {hasTripped && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> DEMOTION TRIPPED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mb-3">
                    Agent: <code className="text-cyan-300">{play.owning_agent_id}</code> • Play ID: <code className="text-slate-300">{play.play_id}</code>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded border border-slate-800/80 mb-3">
                    <span className="text-slate-400 font-semibold">Active Behaviour:</span> {play.behaviour}
                  </div>

                  {/* Promotion Progress Bar */}
                  {play.current_rung !== 'AUTONOMOUS' ? (
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span className="text-slate-400">Promotion Criterion: {play.promotion_progress.metric_name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-300 font-bold">{play.promotion_progress.display_current}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">{play.promotion_progress.display_target}</span>
                          <span className="text-purple-300 font-bold">({play.promotion_progress.pct_complete}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${play.promotion_progress.pct_complete}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-purple-300 font-mono flex items-center justify-between pt-1">
                      <span>Maximum Trust Rung Achieved (Autonomous Write Scope)</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sign-off Active
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Play Interactive Simulation Station (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            {selectedPlay ? (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">Autonomy Simulation Station</h3>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2 mb-4">
                  <div className="text-white font-bold">{selectedPlay.play_name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Current Rung: <strong className="text-purple-300">{selectedPlay.current_rung}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Clean Runs: <strong className="text-white">{selectedPlay.consecutive_clean_runs}</strong> (Total: {selectedPlay.total_runs})
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 block mb-0.5">Demotion Trigger:</span>
                    <span className="text-amber-300 font-mono">{selectedPlay.demotion_trigger.threshold}</span>
                  </div>
                </div>

                {/* Simulation Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleEvaluatePlay(selectedPlay.play_id)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Simulate 5 Clean Runs (+Progress)</span>
                  </button>

                  <button
                    onClick={() => handlePromotePlay(selectedPlay.play_id)}
                    disabled={actionLoading || !selectedPlay.promotion_progress.eligible_for_promotion || selectedPlay.current_rung === 'AUTONOMOUS'}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-white transition-all flex items-center justify-center space-x-2 ${
                      selectedPlay.promotion_progress.eligible_for_promotion && selectedPlay.current_rung !== 'AUTONOMOUS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>
                      {selectedPlay.current_rung === 'AUTONOMOUS'
                        ? 'Highest Rung Reached'
                        : selectedPlay.promotion_progress.eligible_for_promotion
                        ? 'Promote to Next Rung'
                        : 'Criteria Not Yet Met'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleTripDemotion(selectedPlay.play_id, selectedPlay.demotion_trigger.trigger_type)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-200 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Test Automatic Demotion (No Meeting)</span>
                  </button>

                  {selectedPlay.demotion_trigger.is_tripped && (
                    <button
                      onClick={() => handleResetPlay(selectedPlay.play_id)}
                      disabled={actionLoading}
                      className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Clear Demotion Alert</span>
                    </button>
                  )}
                </div>

                {/* Audit & Sentinel Statement */}
                <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <span className="text-purple-400 font-semibold">Chant #8 Standard:</span> Demotion happens in sub-second time
                  without convening a council meeting.
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Select a play from the list to test promotion and automatic demotion
              </div>
            )}
          </div>

          {/* Play History Card */}
          {selectedPlay && selectedPlay.history && selectedPlay.history.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-white">Trust Ladder Audit History</h4>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {selectedPlay.history.map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-bold ${
                          h.event_type === 'PROMOTION'
                            ? 'text-emerald-400'
                            : h.event_type === 'AUTOMATIC_DEMOTION'
                            ? 'text-rose-400'
                            : 'text-cyan-300'
                        }`}
                      >
                        {h.event_type}: {h.previous_rung} &rarr; {h.new_rung}
                      </span>
                      <span className="text-slate-500 text-[10px]">{h.timestamp.split('T')[0]}</span>
                    </div>
                    <div className="text-slate-300 text-[10px]">{h.reason}</div>
                    <div className="text-slate-500 text-[9px] mt-1">Triggered by: {h.triggered_by}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
