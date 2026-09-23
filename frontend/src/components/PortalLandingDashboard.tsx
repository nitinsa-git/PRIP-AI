import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Server,
  Layers,
  Award,
  Lock,
  Swords,
  Radio,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Cpu,
  Database,
  Radar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Sliders,
  Flame,
  Bot,
  FolderGit2,
  Plus,
  Rocket,
  Compass,
  BookOpen
} from 'lucide-react';
import { Project } from '../types';

interface PortalLandingDashboardProps {
  onNavigateTab: (tabId: string) => void;
  projects?: Project[];
  activeProject?: Project | null;
  onSelectProject?: (project: Project) => void;
  onExecuteProjectInStep2?: (projectId: string) => void;
  onOpenOnboardingModal?: () => void;
}

type FlowPathMode = 'ALL' | 'FAST_LANE' | 'STANDARD_LANE' | 'CONFLICT_ESCALATION' | 'TRUST_LADDER';

interface FlowNode {
  id: string;
  label: string;
  sublabel: string;
  plane: string;
  chant: string;
  x: number; // percentage in svg
  y: number;
  color: string;
  borderColor: string;
  iconName: string;
  specialists: string[];
  mechanisms: string[];
  sampleJson: Record<string, any>;
}

export const PortalLandingDashboard: React.FC<PortalLandingDashboardProps> = ({ 
  onNavigateTab,
  projects = [],
  activeProject = null,
  onSelectProject,
  onExecuteProjectInStep2,
  onOpenOnboardingModal
}) => {
  const [activeMode, setActiveMode] = useState<FlowPathMode>('ALL');
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [engineOnline, setEngineOnline] = useState(true);
  const [backendOverview, setBackendOverview] = useState<any>(null);
  const [selectedTargetProjectId, setSelectedTargetProjectId] = useState<string>(
    activeProject?.project_id || (projects.length > 0 ? projects[0].project_id : 'checkout-service')
  );

  useEffect(() => {
    if (activeProject) {
      setSelectedTargetProjectId(activeProject.project_id);
    } else if (projects.length > 0 && !selectedTargetProjectId) {
      setSelectedTargetProjectId(projects[0].project_id);
    }
  }, [activeProject, projects]);

  const currentTargetProject = projects.find(p => p.project_id === selectedTargetProjectId) || (projects.length > 0 ? projects[0] : null);

  // Nodes for the visual flowchart
  const nodes: Record<string, FlowNode> = {
    intake: {
      id: 'intake',
      label: '1. Event Intake & Redaction',
      sublabel: 'GitHub / Jira / Datadog Webhooks',
      plane: 'MESH & SYSTEMS OF RECORD',
      chant: 'Chants #10 & #11: Untrusted data enclosure & pre-retrieval secrets redaction',
      x: 10,
      y: 20,
      color: '#06b6d4',
      borderColor: 'border-cyan-500',
      iconName: 'Layers',
      specialists: ['Evidence Service', 'Secrets Masker', 'MCP Gateway'],
      mechanisms: [
        'Tool-layer capability enforcement (least privilege by default)',
        'Regex secrets redaction before LLM context entry',
        'Provenance tagging: Enclosed in <untrusted_data> XML sandbox'
      ],
      sampleJson: {
        event_id: 'evt-gh-894',
        type: 'pull_request.synchronize',
        repo: 'payments-api',
        secrets_masked: 2,
        provenance: 'VERIFIED_SIGNATURE'
      }
    },
    forensics: {
      id: 'forensics',
      label: '2. Plane 1: Forensics & Lane Router',
      sublabel: '4 Tests: Stalls, SLAs & Lane Decision',
      plane: 'PLANE 1: RADAR & FORENSICS',
      chant: 'Chant #7: Routing is an agent task & Chant #6: Degraded mode ready',
      x: 32,
      y: 20,
      color: '#f59e0b',
      borderColor: 'border-amber-500',
      iconName: 'Radar',
      specialists: ['Flow Analyst', 'Route Classifier'],
      mechanisms: [
        '4 Forensic Tests: Idle reviewer stall, missing approval, flaky test loop, shadow queue',
        'Lane Classification: Fast Lane (<3 files, low risk) vs Standard Lane (full DAG)',
        'Deterministic degraded fallback script attached if model is down'
      ],
      sampleJson: {
        work_id: 'WO-2026-014872',
        stuck_risk: 'LOW (0.08)',
        lane_decision: 'STANDARD_LANE',
        degraded_script_ready: true
      }
    },
    fast_bypass: {
      id: 'fast_bypass',
      label: 'Fast Lane Automated Path',
      sublabel: 'Low Risk • Instant Review Bypass',
      plane: 'PLANE 1 & 2 BYPASS',
      chant: 'Chant #7: Fast Lane bypasses heavy adjudication for low-risk micro PRs',
      x: 55,
      y: 5,
      color: '#10b981',
      borderColor: 'border-emerald-500',
      iconName: 'Zap',
      specialists: ['Flow Analyst'],
      mechanisms: [
        'Under 3 files and 50 LOC changed',
        'Zero schema mutations or dependency graph shifts',
        'Bypasses multi-specialist scatter-gather'
      ],
      sampleJson: {
        lane: 'FAST_LANE',
        files_changed: 2,
        loc: 28,
        action: 'DIRECT_DISPATCH_TO_ARBITER'
      }
    },
    scatter_gather: {
      id: 'scatter_gather',
      label: '3. Plane 2: Scatter-Gather',
      sublabel: 'Concurrent Analysis (8 Specialists)',
      plane: 'PLANE 2: EXECUTION',
      chant: 'Chant #1: Parallel read execution, isolated token budgets & timeouts',
      x: 55,
      y: 35,
      color: '#6366f1',
      borderColor: 'border-indigo-500',
      iconName: 'GitBranch',
      specialists: ['Arch Conformance', 'Dep Impact', 'Review Analyst', 'Security Sentinel'],
      mechanisms: [
        'Independent analysis runs concurrently across specialists',
        'Per-tool circuit breakers and isolated bulkheads',
        'Model tier ladder: primary -> secondary -> fallback'
      ],
      sampleJson: {
        branches_launched: 5,
        latency_p95: '480ms',
        findings_count: 3
      }
    },
    reconciler: {
      id: 'reconciler',
      label: '4. Join & Reconcile Engine',
      sublabel: 'Drop Unresolvable • Detect Conflict',
      plane: 'PLANE 2: RECONCILER',
      chant: 'Chant #2: Drop unreferenced findings & Chant #5: Specialist conflict escalates',
      x: 75,
      y: 35,
      color: '#8b5cf6',
      borderColor: 'border-purple-500',
      iconName: 'Sliders',
      specialists: ['Reconciler Arbiter'],
      mechanisms: [
        '1. Drop findings with unresolvable evidence references',
        '2. Deduplicate findings pointing at the same root cause',
        '3. Detect conflict: Contradictions are NOT averaged; they escalate as first-class signal'
      ],
      sampleJson: {
        evidence_validated: 3,
        dropped_claims: 0,
        conflict_detected: true,
        contradiction: 'ARC-COUPLING-01 vs Delivery deadline'
      }
    },
    challenge_protocol: {
      id: 'challenge_protocol',
      label: '5. Plane 3: Super Agents Challenge',
      sublabel: 'Architecture Authority vs Delivery Governor',
      plane: 'PLANE 3: ADJUDICATION',
      chant: 'Chants #3 & #4: Two Authorities & 5-Phase Adversarial Protocol',
      x: 75,
      y: 65,
      color: '#f43f5e',
      borderColor: 'border-rose-500',
      iconName: 'Swords',
      specialists: ['Architecture Authority', 'Delivery Governor'],
      mechanisms: [
        'Adversarial tension: Architecture purity vs Shipping velocity',
        '5-Phase Challenge Protocol: Propose -> Challenge -> Defend -> Decide -> Record',
        'Bounded convergence with conditional temporary waiver & compensating rollback'
      ],
      sampleJson: {
        session: 'chal-8941',
        phase: 'DECIDE',
        outcome: 'APPROVED_WITH_CONDITIONS',
        waiver_id: 'WAIVER-2026-0042'
      }
    },
    write_arbiter: {
      id: 'write_arbiter',
      label: '6. Serialized Write Arbiter',
      sublabel: 'Idempotency Key & Optimistic Lock',
      plane: 'PLANE 2: WRITE SUBSYSTEM',
      chant: 'Chants #1 & #12: One Write Arbiter. Serialized. Sagas & compensating actions.',
      x: 88,
      y: 15,
      color: '#ec4899',
      borderColor: 'border-pink-500',
      iconName: 'Lock',
      specialists: ['Write Arbiter'],
      mechanisms: [
        'Writes are the only place where concurrency is deliberately surrendered',
        'Idempotency key check prevents replay race conditions',
        'Optimistic version check on Work Object (stale versions reject with 409)'
      ],
      sampleJson: {
        idempotency_key: 'idemp-mut-894-01',
        work_id: 'WO-2026-014872',
        expected_version: 2,
        committed_version: 3,
        status: 'COMMITTED'
      }
    },
    trust_ladder: {
      id: 'trust_ladder',
      label: '7. Trust Ladder & Leadership Outcomes',
      plane: 'GOVERNANCE & OUTCOMES',
      sublabel: '4 Rungs • Zero-Meeting Demotion • §1.4 Metrics',
      chant: 'Chant #8: Autonomy earned per-play & Chant #9: Automatic zero-meeting demotion',
      x: 90,
      y: 50,
      color: '#10b981',
      borderColor: 'border-emerald-500',
      iconName: 'Award',
      specialists: ['Sentinel Demotion Engine', 'Trust Ladder Authority'],
      mechanisms: [
        'Autonomy earned per Play (Shadow -> Advisory -> Approval-Required -> Autonomous)',
        'Pre-declared demotion triggers trip automatically without a meeting',
        '6-Tuple Audit Ledger commit & §1.4 Leadership Outcome telemetry'
      ],
      sampleJson: {
        play_id: 'play.arch.standards_conformance.v4',
        rung: 'ADVISORY',
        demotion_tripped: false,
        lead_time_reduction: '-69.7%',
        audit_tuple_logged: true
      }
    }
  };

  // Fetch telemetry
  const fetchPulse = async () => {
    try {
      const ovRes = await fetch('http://localhost:6090/api/tech-posture/overview').then((r) => r.json());
      setBackendOverview(ovRes);
      setEngineOnline(true);
    } catch {
      setEngineOnline(false);
    }
  };

  useEffect(() => {
    fetchPulse();
    setSelectedNode(nodes['intake']);
  }, []);

  // Live simulation routine
  const runSimulation = async (pathMode: FlowPathMode) => {
    setIsSimulating(true);
    setActiveMode(pathMode);
    setSimLogs([`[00:00] Simulation initialized on path [${pathMode}]...`]);

    const steps =
      pathMode === 'FAST_LANE'
        ? ['intake', 'forensics', 'fast_bypass', 'write_arbiter', 'trust_ladder']
        : pathMode === 'CONFLICT_ESCALATION'
        ? ['intake', 'forensics', 'scatter_gather', 'reconciler', 'challenge_protocol', 'write_arbiter', 'trust_ladder']
        : ['intake', 'forensics', 'scatter_gather', 'reconciler', 'write_arbiter', 'trust_ladder'];

    for (let i = 0; i < steps.length; i++) {
      const nodeId = steps[i];
      setSimStep(i);
      setSelectedNode(nodes[nodeId]);
      setSimLogs((prev) => [
        `[00:0${i + 1}] Transited -> ${nodes[nodeId].label} (${nodes[nodeId].plane})`,
        ...prev
      ]);
      await new Promise((r) => setTimeout(r, 850));
    }

    setSimLogs((prev) => ['[SUCCESS] End-to-end traversal complete! 6-tuple audit logged.', ...prev]);
    setIsSimulating(false);
  };

  // Determine path visibility
  const isFastLaneActive = activeMode === 'ALL' || activeMode === 'FAST_LANE';
  const isStandardActive = activeMode === 'ALL' || activeMode === 'STANDARD_LANE' || activeMode === 'CONFLICT_ESCALATION';
  const isConflictActive = activeMode === 'ALL' || activeMode === 'CONFLICT_ESCALATION';

  return (
    <div className="space-y-8">
      {/* Top Welcome Notification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0a0f1d] via-[#10172c] to-[#0a0f1d] border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              PRIP-AI <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Architecture & Operational Control</span>
            </h1>
            <p className="text-slate-400 text-xs font-mono">
              Two-block overview: Visual Flowchart with branching decision paths & live application launcher.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${engineOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span>Engine :6090 {engineOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={() => onNavigateTab('observability')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold transition-all"
          >
            <span>Live Observability</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOX 1: INTERACTIVE ANIMATED FLOWCHART & BRANCHING PATH EXPLORER */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#080d19] border border-cyan-500/30 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Box 1 Header with Path Switchers */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40">BLOCK 1</span>
              <span>Visual System Flowchart & Multi-Path Routing</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Interactive Flowchart: <span className="text-cyan-400">How This Application Works</span>
            </h2>
            <p className="text-slate-400 text-xs font-mono mt-0.5">
              Select a path to trace how Work Objects flow through Fast-Lane bypasses, Parallel Scatter-Gather, and Plane 3 Escalations.
            </p>
          </div>

          {/* Interactive Path Mode Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveMode('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeMode === 'ALL'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              All Paths (Full Mesh)
            </button>

            <button
              onClick={() => runSimulation('FAST_LANE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'FAST_LANE'
                  ? 'bg-emerald-500 text-black shadow-glow-emerald'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trace Fast Lane</span>
            </button>

            <button
              onClick={() => runSimulation('STANDARD_LANE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'STANDARD_LANE'
                  ? 'bg-indigo-500 text-black shadow-glow-indigo'
                  : 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/40'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Trace Standard DAG</span>
            </button>

            <button
              onClick={() => runSimulation('CONFLICT_ESCALATION')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'CONFLICT_ESCALATION'
                  ? 'bg-rose-500 text-black shadow-glow-rose'
                  : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-500/40'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Trace Plane 3 Conflict</span>
            </button>
          </div>
        </div>

        {/* Visual SVG Flowchart Canvas with Dynamic Branching Lines */}
        <div className="relative z-10 p-5 rounded-2xl bg-[#050811] border border-white/10 min-h-[380px] flex flex-col justify-center">
          <svg className="w-full h-[340px] overflow-visible">
            <defs>
              <linearGradient id="gradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="gradIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="gradRose" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Path 1 -> 2: Intake to Forensics */}
            <path
              d="M 190 70 L 320 70"
              stroke="#06b6d4"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="4 4"
              className="animate-pulse"
            />

            {/* Path 2 -> Fast Bypass (Branch Top) */}
            {isFastLaneActive && (
              <path
                d="M 440 60 C 480 30, 520 20, 570 20"
                stroke="#10b981"
                strokeWidth={activeMode === 'FAST_LANE' ? 3.5 : 2}
                fill="none"
                strokeDasharray={activeMode === 'FAST_LANE' ? 'none' : '4 4'}
              />
            )}

            {/* Fast Bypass -> Write Arbiter */}
            {isFastLaneActive && (
              <path
                d="M 720 20 C 780 20, 820 40, 870 50"
                stroke="#10b981"
                strokeWidth={activeMode === 'FAST_LANE' ? 3.5 : 2}
                fill="none"
              />
            )}

            {/* Path 2 -> Standard Scatter-Gather (Branch Down) */}
            {isStandardActive && (
              <path
                d="M 440 80 C 480 110, 520 120, 570 120"
                stroke="#6366f1"
                strokeWidth={activeMode === 'STANDARD_LANE' ? 3.5 : 2}
                fill="none"
                strokeDasharray="4 4"
              />
            )}

            {/* Scatter-Gather -> Reconciler */}
            {isStandardActive && (
              <path
                d="M 720 120 L 760 120"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                fill="none"
              />
            )}

            {/* Reconciler -> Write Arbiter (Clean Path) */}
            {isStandardActive && (
              <path
                d="M 880 110 C 890 90, 890 80, 890 65"
                stroke="#ec4899"
                strokeWidth="2"
                fill="none"
              />
            )}

            {/* Reconciler -> Plane 3 Conflict Escalation */}
            {isConflictActive && (
              <path
                d="M 820 145 C 820 190, 820 210, 820 220"
                stroke="#f43f5e"
                strokeWidth={activeMode === 'CONFLICT_ESCALATION' ? 3.5 : 2}
                fill="none"
                strokeDasharray="4 4"
              />
            )}

            {/* Plane 3 Challenge Protocol -> Write Arbiter */}
            {isConflictActive && (
              <path
                d="M 880 230 C 940 210, 940 100, 910 65"
                stroke="#f43f5e"
                strokeWidth={activeMode === 'CONFLICT_ESCALATION' ? 3 : 1.5}
                fill="none"
              />
            )}

            {/* Write Arbiter -> Trust Ladder */}
            <path
              d="M 910 70 C 930 110, 930 140, 930 170"
              stroke="#10b981"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Flow Nodes Rendered with Absolute CSS Placement */}
          <div className="absolute inset-0 p-4 pointer-events-none">
            {/* 1. Intake */}
            <div
              onClick={() => setSelectedNode(nodes['intake'])}
              className={`pointer-events-auto absolute left-[4%] top-[12%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'intake'
                  ? 'bg-cyan-950 border-cyan-400 shadow-glow-cyan scale-105 z-20'
                  : 'bg-[#0a0f1d] border-cyan-500/40 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                <Layers className="w-3.5 h-3.5" />
                <span>1. Intake & Secrets Redaction</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Webhooks • Redaction • Sandboxing</div>
            </div>

            {/* 2. Forensics */}
            <div
              onClick={() => setSelectedNode(nodes['forensics'])}
              className={`pointer-events-auto absolute left-[27%] top-[12%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'forensics'
                  ? 'bg-amber-950 border-amber-400 shadow-glow-amber scale-105 z-20'
                  : 'bg-[#0a0f1d] border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Radar className="w-3.5 h-3.5" />
                <span>2. Forensics & Lane Router</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Fast Lane vs Standard DAG Decision</div>
            </div>

            {/* Fast Bypass Node */}
            <div
              onClick={() => setSelectedNode(nodes['fast_bypass'])}
              className={`pointer-events-auto absolute left-[52%] top-[2%] p-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'fast_bypass'
                  ? 'bg-emerald-950 border-emerald-400 shadow-glow-emerald scale-105 z-20'
                  : 'bg-[#0a0f1d] border-emerald-500/40 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Fast Lane Bypass</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">&lt; 3 Files • Auto-Dispatched</div>
            </div>

            {/* 3. Scatter-Gather */}
            <div
              onClick={() => setSelectedNode(nodes['scatter_gather'])}
              className={`pointer-events-auto absolute left-[50%] top-[30%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'scatter_gather'
                  ? 'bg-indigo-950 border-indigo-400 shadow-glow-indigo scale-105 z-20'
                  : 'bg-[#0a0f1d] border-indigo-500/40 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                <GitBranch className="w-3.5 h-3.5" />
                <span>3. Scatter-Gather (8 Specialists)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Parallel Analysis • Concurrency</div>
            </div>

            {/* 4. Reconciler */}
            <div
              onClick={() => setSelectedNode(nodes['reconciler'])}
              className={`pointer-events-auto absolute left-[74%] top-[30%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'reconciler'
                  ? 'bg-purple-950 border-purple-400 shadow-glow-purple scale-105 z-20'
                  : 'bg-[#0a0f1d] border-purple-500/40 hover:border-purple-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <Sliders className="w-3.5 h-3.5" />
                <span>4. 3-Step Reconciler</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Validate Refs • Conflict Detection</div>
            </div>

            {/* 5. Challenge Protocol (Plane 3) */}
            <div
              onClick={() => setSelectedNode(nodes['challenge_protocol'])}
              className={`pointer-events-auto absolute left-[68%] top-[62%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'challenge_protocol'
                  ? 'bg-rose-950 border-rose-400 shadow-glow-rose scale-105 z-20'
                  : 'bg-[#0a0f1d] border-rose-500/40 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                <Swords className="w-3.5 h-3.5" />
                <span>5. Super Agents Challenge</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">AA vs DG 5-Phase Adversarial Protocol</div>
            </div>

            {/* 6. Write Arbiter */}
            <div
              onClick={() => setSelectedNode(nodes['write_arbiter'])}
              className={`pointer-events-auto absolute right-[2%] top-[6%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'write_arbiter'
                  ? 'bg-pink-950 border-pink-400 shadow-glow-pink scale-105 z-20'
                  : 'bg-[#0a0f1d] border-pink-500/40 hover:border-pink-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-pink-400 font-bold text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>6. Write Arbiter</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Serialized • Optimistic Lock</div>
            </div>

            {/* 7. Trust Ladder */}
            <div
              onClick={() => setSelectedNode(nodes['trust_ladder'])}
              className={`pointer-events-auto absolute right-[2%] top-[50%] p-3 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === 'trust_ladder'
                  ? 'bg-emerald-950 border-emerald-400 shadow-glow-emerald scale-105 z-20'
                  : 'bg-[#0a0f1d] border-emerald-500/40 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Award className="w-3.5 h-3.5" />
                <span>7. Trust Ladder & Outcomes</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Autonomy per Play • §1.4 Metrics</div>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="p-5 rounded-2xl bg-[#060a15] border border-cyan-500/20 grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    {selectedNode.label}
                  </span>
                  <span className="text-slate-400">• {selectedNode.plane}</span>
                </div>
                <span className="text-slate-500 text-[10px]">Click any node above to inspect mechanisms</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                <div className="text-cyan-400 font-bold text-[11px]">GOVERNING INVARIANT:</div>
                <div className="text-slate-200 text-xs font-sans">{selectedNode.chant}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-slate-400 font-bold text-[10px]">SPECIALISTS INVOLVED:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.specialists.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="text-slate-400 font-bold text-[10px]">ENFORCED MECHANISMS:</div>
                  <ul className="text-slate-300 text-[10px] list-disc pl-3 space-y-0.5">
                    {selectedNode.mechanisms.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side: Sample JSON Schema */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>PAYLOAD SAMPLE & STATE CONTRACT</span>
                </span>
                <span className="text-emerald-400">STATUS: VALID</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/90 border border-white/10 text-emerald-400 text-[10px] font-mono overflow-x-auto h-[120px] scrollbar-thin">
                {JSON.stringify(selectedNode.sampleJson, null, 2)}
              </pre>
              <button
                onClick={() => {
                  const mapping: Record<string, string> = {
                    intake: 'invariants',
                    forensics: 'stuck',
                    fast_bypass: 'parallel',
                    scatter_gather: 'parallel',
                    reconciler: 'planes',
                    conflict_challenge: 'super_agents',
                    arbiter: 'invariants',
                    trust_ladder: 'trust_ladder',
                    audit_store: 'security_audit'
                  };
                  onNavigateTab(mapping[selectedNode.id] || 'stuck');
                }}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/40 hover:to-indigo-500/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-glow-cyan"
              >
                <span>Flow to this Node in Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1 GUIDE: HOW TO ADD A PROJECT & EXECUTE STEP 2 FOR SPECIFIC PROJECTS */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-b from-[#080d1a] via-[#060a14] to-[#050811] border border-cyan-500/40 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40">STEP 1 GUIDE</span>
              <span>Multi-Tenant Architecture & Targeted Operations Manual</span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>How to Add a Project & Execute in Step 2</span>
            </h3>
            <p className="text-slate-400 text-xs md:text-sm font-sans max-w-2xl">
              PRIP-AI operates strictly on a project-by-project basis (Chant #8). Each microservice or monolith declares its own boundaries, write scopes, and autonomy rungs.
            </p>
          </div>

          <button
            onClick={() => {
              if (onOpenOnboardingModal) {
                onOpenOnboardingModal();
              }
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-extrabold text-xs shadow-glow-cyan hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>+ Onboard New Project</span>
          </button>
        </div>

        {/* Two-Column Explainer Grid: Part 1 & Part 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Part 1: How to Add & Onboard a Project */}
          <div className="p-5 rounded-2xl bg-[#090d18] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>PART 1: HOW TO ADD A PROJECT TO PRIP-AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Follow these three standardized steps to onboard any repository into the PRIP-AI reasoning mesh:
            </p>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Register Git Repo via MCP Protocol Layer (§13.2)</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Add the repository URI to the Model Context Protocol layer. The MCP toolchain dynamically provides read capabilities (diff, tree, blame) without requiring engine refactoring.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Declare Boundaries & Manifests (Chants #1 & #10)</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Specify the service tier (Tier-1 Core, Tier-2 Platform), webhook ingress sandboxes, and regex secrets masks before payloads reach LLM reasoning context.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Set Autonomy Rung & Golden Test Set (Chant #8 & §13.6)</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Autonomy is earned per project. Start in <code>Shadow</code> or <code>Advisory</code> rung with a golden benchmark suite. Promotion requires sustained empirical accuracy.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Part 2: Targeted Step 2 Execution Runner */}
          <div className="p-5 rounded-2xl bg-[#090d18] border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between text-emerald-300 font-bold text-sm">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>PART 2: TARGETED STEP 2 EXECUTION RUNNER</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                Live Dispatch
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Select any onboarded project to execute its complete end-to-end pipeline in Step 2 (Forensics &rarr; Parallel DAG &rarr; Write Arbiter):
            </p>

            {/* Project Selector & Live Details Card */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase">SELECT TARGET PROJECT:</label>
                <select
                  value={selectedTargetProjectId}
                  onChange={(e) => setSelectedTargetProjectId(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#060a15] border border-emerald-500/40 text-emerald-300 font-bold focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.name} ({p.project_id}) • {p.autonomy_rung}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Project Specs Badge Box */}
              {currentTargetProject && (
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Service Tier:</span>
                    <span className="text-white font-bold">{currentTargetProject.tier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Autonomy Rung:</span>
                    <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {currentTargetProject.autonomy_rung}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Conformance Score:</span>
                    <span className="text-cyan-400 font-bold">{currentTargetProject.conformance_score}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Specialists:</span>
                    <span className="text-slate-300 font-bold">{currentTargetProject.specialists_assigned.length} Agents</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-500">
                    <span>Repo:</span>
                    <span className="truncate max-w-[240px] text-slate-400">{currentTargetProject.repo_url}</span>
                  </div>
                </div>
              )}

              {/* Direct Targeted Run Button */}
              <button
                onClick={() => {
                  if (onExecuteProjectInStep2) {
                    onExecuteProjectInStep2(selectedTargetProjectId);
                  } else {
                    onNavigateTab('stuck');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-black font-extrabold text-xs shadow-glow-emerald flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>Launch Step 2 Execution for {currentTargetProject?.name || selectedTargetProjectId}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOX 2: TAKE YOU TO THE APPLICATION (LAUNCHPAD & LIVE CONTROL CENTER) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0b1222] via-[#090d18] to-[#070a12] border border-emerald-500/30 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Box 2 Header Banner & Direct Launcher Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-indigo-950/40 border border-emerald-500/40 shadow-inner">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">BLOCK 2</span>
              <span>Live Application Launchpad</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Take You to the Application
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl font-sans">
              Experience the live operations engine running across all 3 Planes. Click below to launch directly into the sequential application workflow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onNavigateTab('stuck')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-emerald hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Zap className="w-5 h-5 text-black" />
              <span>ENTER APPLICATION CONSOLE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Systems Mesh Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-[#060a15] border border-white/5 space-y-1">
            <div className="text-slate-400 text-[10px]">EXECUTION AGENTS</div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>8 Specialists Online</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#060a15] border border-white/5 space-y-1">
            <div className="text-slate-400 text-[10px]">MCP TOOL LAYER</div>
            <div className="text-cyan-300 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>6 Systems Connected</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#060a15] border border-white/5 space-y-1">
            <div className="text-slate-400 text-[10px]">DURABLE EVENT BUS</div>
            <div className="text-purple-300 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>4 Consumer Groups</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#060a15] border border-white/5 space-y-1">
            <div className="text-slate-400 text-[10px]">INCIDENT POSTURE</div>
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>0 Sev-1 Defects</span>
            </div>
          </div>
        </div>

        {/* Subsystem Direct Jump-Pads Grid */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-1">
            <span>DIRECT SUBSYSTEM JUMP-PADS (CLICK ANY TO ENTER)</span>
            <span className="text-emerald-400 text-[10px]">13 Core Hubs Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Trust Ladder */}
            <div
              onClick={() => onNavigateTab('trust_ladder')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-emerald-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>Trust Ladder (§12)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  Chant #8
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                4 Rungs & automatic zero-meeting demotion on tripped thresholds.
              </p>
              <div className="text-emerald-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Reference Posture */}
            <div
              onClick={() => onNavigateTab('tech_posture')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-indigo-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>Tech Posture (§13)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                  6 Positions
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Model Gateway hot-swapping, MCP dynamic tools & durable replay.
              </p>
              <div className="text-indigo-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Observability */}
            <div
              onClick={() => onNavigateTab('observability')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-cyan-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Activity className="w-4 h-4" />
                  <span>Observability (§11)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                  ECE: 0.016
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                3-Layer telemetry, confidence calibration & distributed tracing.
              </p>
              <div className="text-cyan-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Security & Audit */}
            <div
              onClick={() => onNavigateTab('security_audit')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-rose-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Security & Audit (§10)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                  6-Tuple
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Tool scope enforcement, prompt sandbox & secrets redaction.
              </p>
              <div className="text-rose-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Super Agents */}
            <div
              onClick={() => onNavigateTab('super_agents')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-purple-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Swords className="w-4 h-4" />
                  <span>Super Agents (§6)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                  Plane 3
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                AA vs DG adversarial 5-phase challenge sessions & escalations.
              </p>
              <div className="text-purple-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Parallel Execution */}
            <div
              onClick={() => onNavigateTab('parallel')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-amber-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <GitBranch className="w-4 h-4" />
                  <span>Parallel Engine (§8)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                  P2
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Scatter-Gather fanout, reconciler & serialized Write Arbiter.
              </p>
              <div className="text-amber-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Architecture Gate */}
            <div
              onClick={() => onNavigateTab('arch')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-cyan-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Architecture Gate (P2)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                  96.2%
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                ADR conformance verification & conforming code diff drafting.
              </p>
              <div className="text-cyan-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>

            {/* Outcome Radar */}
            <div
              onClick={() => onNavigateTab('radar')}
              className="cursor-pointer p-4 rounded-2xl bg-[#060a15] border border-white/5 hover:border-emerald-500/50 hover:bg-[#0c1426] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Radar className="w-4 h-4" />
                  <span>Outcome Radar (§1.4)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  -69.7% Lead Time
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                DORA outcome metrics comparing Q0 baseline vs Q1 active run.
              </p>
              <div className="text-emerald-400 text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Hub &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
