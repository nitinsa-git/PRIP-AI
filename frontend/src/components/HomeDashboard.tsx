import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Server,
  Activity,
  ShieldAlert,
  Layers,
  GitBranch,
  Lock,
  Award,
  Radar,
  Flame,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  RefreshCw,
  Bot,
  Compass,
  Radio,
  FileCode,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronRight,
  Cpu,
  Database,
  Sliders,
  Swords
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

interface PipelineStage {
  id: number;
  key: string;
  name: string;
  plane: string;
  badge: string;
  icon: any;
  accentColor: string;
  gradient: string;
  summary: string;
  chants: string[];
  agents: string[];
  mechanisms: string[];
  samplePayload: Record<string, any>;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigateTab }) => {
  // Animation state for Section 1 Flowchart
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [simulatingLiveRun, setSimulatingLiveRun] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  // Telemetry states for Section 2
  const [metrics, setMetrics] = useState<any>(null);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [postureOverview, setPostureOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 5 Pipeline Stages
  const stages: PipelineStage[] = [
    {
      id: 0,
      key: 'intake',
      name: '1. Intake & Mesh Layer',
      plane: 'SYSTEMS OF RECORD',
      badge: 'MCP Standard 2024-11-05',
      icon: Layers,
      accentColor: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40',
      summary: 'Webhooks arrive from GitHub PRs, Jira tickets, Datadog traces, and CI/CD pipelines. Tool layer strictly sanitizes data before model context.',
      chants: [
        'Chant #10: Prompt-injection posture — retrieved content is data, never instruction.',
        'Chant #11: Secrets never enter model context (pre-retrieval regex redaction).'
      ],
      agents: ['Evidence Service', 'MCP Tool Registry', 'Secrets Masker'],
      mechanisms: [
        'Tool-Layer Capability Enforcement (least privilege by default)',
        'Pre-retrieval regex masking of API tokens and DB credentials',
        'Automatic provenance tagging (<untrusted_data> XML sandbox enclosure)'
      ],
      samplePayload: {
        event_id: 'evt-gh-9942',
        source: 'GitHub / pull_request.opened',
        pr_number: 894,
        author: '@developer-dev',
        provenance: 'VERIFIED_SIGNATURE',
        secrets_scrubbed: ['ghp_token', 'db_password'],
        status: 'ENCLOSED_IN_DATA_TAGS'
      }
    },
    {
      id: 1,
      key: 'forensics',
      name: '2. Plane 1: Stuck Work Forensics',
      plane: 'PLANE 1: RADAR & FORENSICS',
      badge: 'Silent Queue Killer',
      icon: Radar,
      accentColor: 'text-amber-400',
      gradient: 'from-amber-500/20 to-orange-600/10 border-amber-500/40',
      summary: 'Monitors the flow of work for silent stalls. Classifies PRs into Fast Lane vs Standard Lane using 4 forensic tests.',
      chants: [
        'Chant #7: Routing is a specialist agent task (determines lane and DAG shape).',
        'Chant #6: Every play declares a deterministic degraded mode fallback.'
      ],
      agents: ['Flow Analyst', 'Dependency Impact Specialist', 'Route Classifier'],
      mechanisms: [
        '4 Forensic Tests: Idle reviewer stall, missing approval, flaky test loop, shadow queue',
        'Dual-lane dispatch: Fast Lane (<3 files, low risk) vs Standard Lane (full DAG)',
        'Degraded fallback script attachment if model endpoints are saturated'
      ],
      samplePayload: {
        work_id: 'WO-2026-014872',
        risk_tier: 'TIER-2 MEDIUM',
        assigned_lane: 'STANDARD_LANE',
        stuck_probability: '0.12 (HEALTHY)',
        dag_plan: 'dag.standard_conformance.v2',
        degraded_script_ready: true
      }
    },
    {
      id: 2,
      key: 'execution',
      name: '3. Plane 2: Parallel Specialist Execution',
      plane: 'PLANE 2: EXECUTION',
      badge: 'Scatter-Gather & Write Arbiter',
      icon: GitBranch,
      accentColor: 'text-indigo-400',
      gradient: 'from-indigo-500/20 to-purple-600/10 border-indigo-500/40',
      summary: 'Scatter-gather runs independent specialists concurrently. Reconciler joins findings, drops unreferenced claims, and Write Arbiter serializes mutations.',
      chants: [
        'Chant #1: One Write Arbiter. Serialized. Idempotency key on every mutating call.',
        'Chant #2: Findings without evidence references are dropped by the reconciler.',
        'Chant #5: Specialist conflict is not averaged; it escalates to Plane 3 as first-class signal.'
      ],
      agents: ['Arch Conformance', 'Dep Impact', 'Review Analyst', 'Security Sentinel', 'Write Arbiter'],
      mechanisms: [
        'Scatter-Gather concurrent fanout with token budget and timeout bulkheads',
        '3-Step Reconciler: Drop unresolvable refs -> Deduplicate -> Detect contradictions',
        'Single serialized Write Arbiter with optimistic version locking and compensating sagas'
      ],
      samplePayload: {
        scatter_branches: 5,
        execution_wall_clock: '1,420ms',
        findings_emitted: 3,
        contradiction_detected: true,
        conflicting_agents: ['arch-conformance', 'delivery-governor'],
        escalated_to_plane_3: true
      }
    },
    {
      id: 3,
      key: 'adjudication',
      name: '4. Plane 3: Adjudication & Challenge Protocol',
      plane: 'PLANE 3: ADJUDICATION',
      badge: 'Two Super Authorities',
      icon: Swords,
      accentColor: 'text-rose-400',
      gradient: 'from-rose-500/20 to-pink-600/10 border-rose-500/40',
      summary: 'Adjudicates irreconcilable specialist disagreements using a structured 5-phase adversarial Challenge Protocol and closes learning loops.',
      chants: [
        'Chant #3: Two Super Agents: Architecture Authority & Delivery Governor.',
        'Chant #4: Challenge Protocol: Propose -> Challenge -> Defend -> Decide -> Record.',
        'Chant #12: Every write step defines its compensating action up front.'
      ],
      agents: ['Architecture Authority', 'Delivery Governor', 'Adjudication Council'],
      mechanisms: [
        'Adversarial tension: Architecture purity vs Delivery shipping velocity',
        'Time-bounded 5-phase convergence or formal Side-by-Side Escalation Packet',
        'Closed Learning Loop: RCA on repeated challenges updates semantic ADRs and procedural plays'
      ],
      samplePayload: {
        session_id: 'chal-sess-8941',
        protocol_phase: 'DECIDE',
        outcome: 'APPROVED_WITH_CONDITIONS',
        condition: 'Wrap RPC in 50ms circuit breaker with compensating rollback registered',
        waiver_granted: 'WAIVER-2026-0042 (14 days)'
      }
    },
    {
      id: 4,
      key: 'outcome',
      name: '5. Trust Ladder & Leadership Outcomes',
      plane: 'OUTCOME & GOVERNANCE',
      badge: 'Chant #8: Autonomy Earned Per-Play',
      icon: Award,
      accentColor: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40',
      summary: 'Autonomy is earned per Play across 4 rungs. Tripped demotion triggers drop autonomy automatically with zero meetings, returning leadership hours.',
      chants: [
        'Chant #8: Autonomy is earned per Play, not per agent and never globally.',
        'Chant #9: Demotion is automatic on tripped triggers and does not require a meeting.'
      ],
      agents: ['Sentinel Demotion Engine', 'Trust Ladder Authority', 'Audit Ledger'],
      mechanisms: [
        '4 Rungs: Shadow -> Advisory -> Approval-Required -> Autonomous',
        'Zero-Meeting Demotion on FP spikes, severity incidents, or calibration drops',
        '6-Tuple Audit Ledger commit (who, what, when, play_version, evidence, approved_by)',
        'Strategic Leadership Dashboard reporting median lead time reduction and quality'
      ],
      samplePayload: {
        play_id: 'play.arch.standards_conformance.v4',
        current_rung: 'ADVISORY',
        acceptance_rate: '94.2% sustained',
        demotion_trigger: 'ARMED (FP > 8%)',
        lead_time_impact: '-69.7% reduction',
        audit_trail_recorded: true
      }
    }
  ];

  // Auto-play animation timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % stages.length);
    }, 4500 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Fetch live backend data for Section 2
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [metRes, ovRes, subRes] = await Promise.all([
        fetch('http://localhost:6090/api/observability/outcomes').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/overview').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/event-bus/subscribers').then((r) => r.json())
      ]);
      setMetrics(metRes);
      setPostureOverview(ovRes);
      setEventLogs([
        { id: 1, topic: 'pr.lifecycle.intake', sender: 'GitHub-Webhook', plane: 'MESH', time: 'Just now', msg: 'PR #894 received & secrets redacted' },
        { id: 2, topic: 'routing.lane_assigned', sender: 'Flow-Analyst', plane: 'PLANE 1', time: '1s ago', msg: 'Standard Lane DAG dispatched' },
        { id: 3, topic: 'specialists.scatter_gather', sender: 'ScatterArbiter', plane: 'PLANE 2', time: '3s ago', msg: '5 specialist analyses finished in 1,420ms' },
        { id: 4, topic: 'super_agents.challenge', sender: 'ArchitectureAuthority', plane: 'PLANE 3', time: '5s ago', msg: 'Adjudication converged: Approved with conditions' },
        { id: 5, topic: 'trust_ladder.calibrated', sender: 'TrustLadder', plane: 'OUTCOME', time: '8s ago', msg: 'Chant #8 audit 6-tuple committed to immutable store' }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Simulate end-to-end flow run
  const handleSimulateEndToEndRun = async () => {
    setSimulatingLiveRun(true);
    setIsPlaying(false);
    setActiveStageIndex(0);
    setSimulationLog(['[00:00] Ingesting PR #894 from GitHub Webhook... Secrets scrubbed.']);

    // Step 0 -> Step 1
    await new Promise((r) => setTimeout(r, 900));
    setActiveStageIndex(1);
    setSimulationLog((prev) => ['[00:01] Plane 1: Flow Analyst evaluated 4 forensic tests. Standard Lane chosen.', ...prev]);

    // Step 1 -> Step 2
    await new Promise((r) => setTimeout(r, 900));
    setActiveStageIndex(2);
    setSimulationLog((prev) => ['[00:02] Plane 2: Scatter-Gather executed across 8 specialists. Conflict detected on ARC-COUPLING-01.', ...prev]);

    // Step 2 -> Step 3
    await new Promise((r) => setTimeout(r, 900));
    setActiveStageIndex(3);
    setSimulationLog((prev) => ['[00:03] Plane 3: Architecture Authority vs Delivery Governor Challenge Protocol converged.', ...prev]);

    // Step 3 -> Step 4
    await new Promise((r) => setTimeout(r, 900));
    setActiveStageIndex(4);
    setSimulationLog((prev) => ['[00:04] Outcome: Autonomy verified on Trust Ladder (Chant #8). 6-tuple audit ledger committed!', ...prev]);

    await new Promise((r) => setTimeout(r, 800));
    setSimulatingLiveRun(false);
    setIsPlaying(true);
    fetchTelemetry();
  };

  const currentStage = stages[activeStageIndex];

  return (
    <div className="space-y-12">
      {/* SECTION 1: HOW THIS APPLICATION WORKS (ANIMATED FLOWCHART) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#090d18] via-[#0b1222] to-[#07090e] border border-cyan-500/30 p-6 md:p-8 shadow-2xl space-y-8">
        {/* Animated ambient background particles glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Section Header with Controls */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Section 1: Architecture In Motion</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
              How This Application Works <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">End-to-End</span>
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-mono mt-1 max-w-3xl">
              Watch a Work Object traverse the 3 Planes, 8 Specialist Agents, Two Super Authorities, and the Trust Ladder.
            </p>
          </div>

          {/* Interactive Animation Controls */}
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900/90 border border-white/10 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500 text-black shadow-glow-emerald'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => setActiveStageIndex((prev) => (prev + 1) % stages.length)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Next Stage"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveStageIndex(0)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Restart from Stage 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
              className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-cyan-300 font-bold hover:bg-slate-700 transition-all"
              title="Speed multiplier"
            >
              {playbackSpeed}x Speed
            </button>

            <button
              onClick={handleSimulateEndToEndRun}
              disabled={simulatingLiveRun}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all ml-1"
            >
              <Zap className={`w-3.5 h-3.5 ${simulatingLiveRun ? 'animate-bounce' : ''}`} />
              <span>{simulatingLiveRun ? 'Simulating...' : 'Simulate Run'}</span>
            </button>
          </div>
        </div>

        {/* Animated Interactive Flowchart Nodes */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStageIndex === idx;
            const isCompleted = activeStageIndex > idx;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  setActiveStageIndex(idx);
                  setIsPlaying(false);
                }}
                className={`relative cursor-pointer rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between ${
                  isActive
                    ? `bg-gradient-to-b ${stage.gradient} shadow-2xl scale-[1.03] z-20 border-white/40 ring-2 ring-cyan-400/40`
                    : isCompleted
                    ? 'bg-[#0b101e]/90 border-emerald-500/30 opacity-90 hover:opacity-100 hover:border-emerald-500/60'
                    : 'bg-[#080c16]/80 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                {/* Active Indicator Beacon */}
                {isActive && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                )}

                {/* Card Top: Step number and Plane badge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">STAGE 0{idx + 1}</span>
                    </div>

                    {isCompleted ? (
                      <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500">{stage.plane.split(':')[0]}</span>
                    )}
                  </div>

                  <h3 className={`font-extrabold text-sm tracking-tight mb-1 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {stage.name.split('. ')[1]}
                  </h3>
                  <div className="text-[10px] font-mono text-cyan-300 mb-2 truncate">
                    {stage.badge}
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="mt-3 pt-2 border-t border-white/5">
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-400 to-pink-500 w-full animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-400 w-full'
                          : 'bg-transparent w-0'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Deep-Dive Inspection Panel */}
        <div className="relative z-10 p-6 rounded-2xl bg-[#080d1a] border border-cyan-500/20 grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Left 2 Cols: Architectural Narrative & Mechanisms */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-extrabold text-xs">
                  {currentStage.name}
                </span>
                <span className="text-slate-400 text-xs">• {currentStage.plane}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Click any stage card above to inspect mechanisms
              </span>
            </div>

            <p className="text-slate-200 text-sm font-sans leading-relaxed">
              {currentStage.summary}
            </p>

            {/* Invariants Chants Box */}
            <div className="p-3.5 rounded-xl bg-[#0e1628] border border-cyan-500/30 space-y-1.5">
              <div className="text-cyan-400 font-bold text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GOVERNING INVARIANTS (CHANTS):</span>
              </div>
              {currentStage.chants.map((chant, i) => (
                <div key={i} className="text-slate-300 text-[11px] pl-2 border-l-2 border-cyan-500/50">
                  {chant}
                </div>
              ))}
            </div>

            {/* Specialists and Mechanisms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Participating Specialists:</div>
                <div className="flex flex-wrap gap-1">
                  {currentStage.agents.map((agent, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px]">
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Enforced Mechanisms:</div>
                <ul className="text-slate-300 text-[10px] space-y-1 list-disc pl-3">
                  {currentStage.mechanisms.map((mech, i) => (
                    <li key={i}>{mech}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Col: Live Data Packet Inspector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 text-pink-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>LIVE PACKET INSPECTOR</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">STAGE STATE: OK</span>
            </div>

            <div className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto h-[260px] scrollbar-thin">
              <pre>{JSON.stringify(currentStage.samplePayload, null, 2)}</pre>
            </div>

            {simulationLog.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-[10px] text-slate-300 space-y-1 max-h-24 overflow-y-auto">
                <div className="text-cyan-400 font-bold">Latest Simulation Events:</div>
                {simulationLog.map((log, i) => (
                  <div key={i} className="text-slate-400 truncate">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: THE RUNNING APPLICATION (LIVE CONTROL CENTER) */}
      <section className="space-y-6">
        {/* Section 2 Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0c1424] via-[#101b33] to-[#0c1424] border border-white/10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Server className="w-4 h-4" />
              <span>Section 2: Live Operations</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              The Running Application <span className="text-emerald-400">(Port :6090 Engine Live)</span>
            </h2>
            <p className="text-slate-400 text-xs font-mono mt-0.5">
              Real-time operational mesh status, strategic outcome dials (§1.4), event stream, and direct jump-pads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Mesh Status: 100% OPERATIONAL</span>
            </div>

            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Strategic Leadership Outcome Dials (§1.4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-2xl bg-[#090d18] border border-cyan-500/20 space-y-2">
            <div className="text-slate-400 text-xs flex items-center justify-between">
              <span>MEDIAN LEAD TIME</span>
              <span className="text-emerald-400 font-bold">-69.7%</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              28.5<span className="text-sm font-normal text-slate-400">h</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Down from 94.2h baseline (Q0) • Hours returned to engineering
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-indigo-500/20 space-y-2">
            <div className="text-slate-400 text-xs flex items-center justify-between">
              <span>DEPLOY FREQUENCY</span>
              <span className="text-cyan-400 font-bold">+335%</span>
            </div>
            <div className="text-3xl font-extrabold text-cyan-300">
              14.8<span className="text-sm font-normal text-slate-400">/wk</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Up from 3.4/wk baseline • Enabled by Fast Lane automated routing
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-emerald-500/20 space-y-2">
            <div className="text-slate-400 text-xs flex items-center justify-between">
              <span>STANDARDS CONFORMANCE</span>
              <span className="text-emerald-400 font-bold">+118%</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-300">
              96.2<span className="text-sm font-normal text-slate-400">%</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Up from 44.0% baseline • Measured via ADR Conformance Gate (P2)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-rose-500/20 space-y-2">
            <div className="text-slate-400 text-xs flex items-center justify-between">
              <span>CHANGE FAILURE RATE</span>
              <span className="text-emerald-400 font-bold">-77.3%</span>
            </div>
            <div className="text-3xl font-extrabold text-rose-400">
              4.2<span className="text-sm font-normal text-slate-400">%</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Reduced from 18.5% • Verified by Challenge Protocol & Write Arbiter
            </div>
          </div>
        </div>

        {/* Live Substrate Stream & Subsystem Jump-Pads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Direct Subsystem Jump-Pads (2 Cols) */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-1">
              <span>OPERATIONAL SUBSYSTEM JUMP-PADS (CLICK TO ENTER)</span>
              <span className="text-cyan-400 text-[10px]">13 Subsystems Online</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => onNavigateTab('trust_ladder')}
                className="cursor-pointer p-4 rounded-xl bg-[#090d18] border border-white/5 hover:border-cyan-500/40 hover:bg-[#0d1424] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Award className="w-4 h-4" />
                    <span>The Trust Ladder (§12)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                    Chant #8
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Per-Play autonomy (Shadow &rarr; Advisory &rarr; Approval-Required &rarr; Autonomous) with zero-meeting automatic demotion.
                </p>
                <div className="text-cyan-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Trust Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('tech_posture')}
                className="cursor-pointer p-4 rounded-xl bg-[#090d18] border border-white/5 hover:border-indigo-500/40 hover:bg-[#0d1424] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>Reference Posture (§13)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                    6 Positions
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Model Gateway hot-swapping, dynamic MCP tool registration, durable event replay, and optimistic concurrency store.
                </p>
                <div className="text-indigo-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Tech Posture Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('observability')}
                className="cursor-pointer p-4 rounded-xl bg-[#090d18] border border-white/5 hover:border-emerald-500/40 hover:bg-[#0d1424] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Activity className="w-4 h-4" />
                    <span>3-Layer Observability (§11)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    ECE: 0.016
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  System health queues, confidence calibration bins, leadership outcomes dashboard, and distributed tracing.
                </p>
                <div className="text-emerald-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Observability Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('security_audit')}
                className="cursor-pointer p-4 rounded-xl bg-[#090d18] border border-white/5 hover:border-rose-500/40 hover:bg-[#0d1424] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Security & Audit (§10)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                    6-Tuple Audit
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Tool-layer write scope enforcement, pre-retrieval secrets redaction, and immutable 6-tuple audit ledger.
                </p>
                <div className="text-rose-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Security Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('super_agents')}
                className="cursor-pointer p-4 rounded-xl bg-[#090d18] border border-white/5 hover:border-purple-500/40 hover:bg-[#0d1424] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Swords className="w-4 h-4" />
                    <span>Super Agents & Protocol (§6)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                    Plane 3
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Architecture Authority vs Delivery Governor adversarial 5-phase challenge sessions and side-by-side escalation.
                </p>
                <div className="text-purple-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Challenge Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('parallel')}
                className="cursor-pointer p-4 rounded-xl bg-[#090d18] border border-white/5 hover:border-amber-500/40 hover:bg-[#0d1424] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <GitBranch className="w-4 h-4" />
                    <span>Parallel Execution (§8)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                    Write Arbiter
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Scatter-Gather concurrent analysis, 3-step reconciler, serialized write arbiter, and speculative branch race.
                </p>
                <div className="text-amber-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Parallel Engine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Substrate Event Feed (1 Col) */}
          <div className="p-5 rounded-2xl bg-[#090d18] border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>SUBSTRATE EVENT STREAM</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto scrollbar-thin">
              {eventLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-300 font-bold truncate max-w-[140px]">{log.topic}</span>
                    <span className="text-slate-500">{log.time}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] font-sans">{log.msg}</div>
                  <div className="text-[9px] text-slate-500 flex items-center justify-between">
                    <span>Source: {log.sender}</span>
                    <span className="text-indigo-400">{log.plane}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => onNavigateTab('observability')}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View Full Distributed Traces</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
