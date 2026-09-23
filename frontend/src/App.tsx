import React, { useEffect, useState } from 'react';
import { 
  Radar, AlertOctagon, ShieldCheck, Flame, 
  Bot, Sliders, Volume2, VolumeX, Sparkles, Terminal, 
  Activity, Wifi, BookMarked, ShieldAlert, Zap, Layers, Database, Compass, Swords, Radio, GitBranch, Lock, Award, Cpu, Home,
  ChevronLeft, ChevronRight, ArrowRight, FolderGit2, Plus, Rocket, CheckCircle2, Filter, FlaskConical
} from 'lucide-react';
import { ToolchainBar } from './components/ToolchainBar';
import { CommandRadar } from './components/CommandRadar';
import { StuckWorkDetector } from './components/StuckWorkDetector';
import { ArchitectureGate } from './components/ArchitectureGate';
import { TechDebtArena } from './components/TechDebtArena';
import { ExecutionAgentsRoster } from './components/ExecutionAgentsRoster';
import { ControlledToolLayer } from './components/ControlledToolLayer';
import { InvariantsHub } from './components/InvariantsHub';
import { InvariantsReviewModal } from './components/InvariantsReviewModal';
import { ThreePlanesView } from './components/ThreePlanesView';
import { OrchestrationHub } from './components/OrchestrationHub';
import { SuperAgentsHub } from './components/SuperAgentsHub';
import { InterAgentCommHub } from './components/InterAgentCommHub';
import { ParallelExecutionHub } from './components/ParallelExecutionHub';
import { FaultToleranceHub } from './components/FaultToleranceHub';
import { SecurityAuditHub } from './components/SecurityAuditHub';
import { ObservabilityHub } from './components/ObservabilityHub';
import { TrustLadderHub } from './components/TrustLadderHub';
import { TechPostureHub } from './components/TechPostureHub';
import { HomeDashboard } from './components/HomeDashboard';
import { PortalLandingDashboard } from './components/PortalLandingDashboard';
import { ProjectOnboardingModal } from './components/ProjectOnboardingModal';
import { GoldenTestRunnerModal } from './components/GoldenTestRunnerModal';
import { EdgeCaseSimulatorModal } from './components/EdgeCaseSimulatorModal';

import { 
  SystemsOfRecord, MetricsResponse, StuckWorkItem, 
  ConformanceEvaluation, ArchitectureStandard, DebtChallenge, 
  ArchitectureWaiver, AgentProfile, ControlledAction, AuditLogEntry,
  InvariantProof, ArbiterStatus, SpecialistConflict, 
  PlayAutonomyRecord, DeclaredCapability, PlanesOverview, 
  SubstrateData, DAGExecutionPlan, AdjudicationData, EvidenceItem,
  IntakeEvaluationResponse, RCALearningLoopProposal,
  Project, ProjectExecutionRecord
} from './types';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [degradedModeActive, setDegradedModeActive] = useState(false);

  // Data states
  const [systems, setSystems] = useState<SystemsOfRecord | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [stuckWork, setStuckWork] = useState<StuckWorkItem[]>([]);
  const [conformance, setConformance] = useState<ConformanceEvaluation[]>([]);
  const [standards, setStandards] = useState<ArchitectureStandard[]>([]);
  const [challenges, setChallenges] = useState<DebtChallenge[]>([]);
  const [waivers, setWaivers] = useState<ArchitectureWaiver[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [actions, setActions] = useState<ControlledAction[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // 12 Invariants states
  const [invariants, setInvariants] = useState<InvariantProof[]>([]);
  const [arbiterStatus, setArbiterStatus] = useState<ArbiterStatus | null>(null);
  const [conflicts, setConflicts] = useState<SpecialistConflict[]>([]);
  const [trustLadder, setTrustLadder] = useState<PlayAutonomyRecord[]>([]);
  const [capabilities, setCapabilities] = useState<DeclaredCapability[]>([]);

  // Three Planes & Substrate states
  const [planesOverview, setPlanesOverview] = useState<PlanesOverview | null>(null);
  const [substrateData, setSubstrateData] = useState<SubstrateData | null>(null);
  const [dagPlans, setDagPlans] = useState<DAGExecutionPlan[]>([]);
  const [adjudicationData, setAdjudicationData] = useState<AdjudicationData | null>(null);
  const [evidenceStore, setEvidenceStore] = useState<EvidenceItem[]>([]);

  // Section 15: Projects Multi-Tenancy & Targeted Execution
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('checkout-service');
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [executingProject, setExecutingProject] = useState(false);
  const [projectExecutionToast, setProjectExecutionToast] = useState<ProjectExecutionRecord | null>(null);
  const [filterByProject, setFilterByProject] = useState<boolean>(true);
  const [goldenModalOpen, setGoldenModalOpen] = useState<boolean>(false);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState<boolean>(false);

  // Loading/Trigger states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [evaluatingPR, setEvaluatingPR] = useState(false);
  const [creatingWaiver, setCreatingWaiver] = useState(false);
  const [simulatingDAG, setSimulatingDAG] = useState(false);
  const [decidingGateId, setDecidingGateId] = useState<string | null>(null);

  // Play subtle sound effect
  const playBeep = (freq = 600, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext not allowed
    }
  };

  const fetchAllData = async () => {
    try {
      const [
        sysRes, metRes, stuckRes, confRes, stdRes, chalRes, 
        waivRes, agentRes, actRes, auditRes, invRes, arbRes, 
        conflRes, ladRes, capRes, planeRes, subRes, dagRes, adjRes, evRes, projRes
      ] = await Promise.all([
        fetch('/api/toolchain/status').then(r => r.json()),
        fetch('/api/metrics/outcomes').then(r => r.json()),
        fetch('/api/reasoning/stuck-work').then(r => r.json()),
        fetch('/api/reasoning/conformance').then(r => r.json()),
        fetch('/api/reasoning/standards').then(r => r.json()),
        fetch('/api/reasoning/debt-challenges').then(r => r.json()),
        fetch('/api/reasoning/waivers').then(r => r.json()),
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/actions').then(r => r.json()),
        fetch('/api/actions/audit-log').then(r => r.json()),
        fetch('/api/invariants').then(r => r.json()),
        fetch('/api/invariants/arbiter').then(r => r.json()),
        fetch('/api/invariants/conflicts').then(r => r.json()),
        fetch('/api/invariants/trust-ladder').then(r => r.json()),
        fetch('/api/invariants/capabilities').then(r => r.json()),
        fetch('/api/planes/overview').then(r => r.json()),
        fetch('/api/planes/substrate').then(r => r.json()),
        fetch('/api/planes/dag-planner').then(r => r.json()),
        fetch('/api/planes/adjudication').then(r => r.json()),
        fetch('/api/evidence/query').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()).catch(() => []),
      ]);

      setSystems(sysRes);
      setMetrics(metRes);
      setStuckWork(stuckRes);
      setConformance(confRes);
      setStandards(stdRes);
      setChallenges(chalRes);
      setWaivers(waivRes);
      setAgents(agentRes);
      setActions(actRes);
      setAuditLog(auditRes);
      setInvariants(invRes);
      setArbiterStatus(arbRes);
      setConflicts(conflRes);
      setTrustLadder(ladRes);
      setCapabilities(capRes);
      setPlanesOverview(planeRes);
      setSubstrateData(subRes);
      setDagPlans(dagRes);
      setAdjudicationData(adjRes);
      setEvidenceStore(evRes);
      if (Array.isArray(projRes) && projRes.length > 0) {
        setProjects(projRes);
        if (!activeProjectId || !projRes.some((p: any) => p.project_id === activeProjectId)) {
          setActiveProjectId(projRes[0].project_id);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data from backend:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSyncMesh = async () => {
    playBeep(880, 0.1);
    setSyncing(true);
    try {
      await fetch('/api/toolchain/sync', { method: 'POST' });
      await fetchAllData();
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleDegradedMode = async () => {
    const nextState = !degradedModeActive;
    playBeep(nextState ? 400 : 750, 0.15);
    setDegradedModeActive(nextState);
    try {
      await fetch('/api/invariants/degraded-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateDAG = async () => {
    playBeep(720, 0.12);
    setSimulatingDAG(true);
    try {
      await fetch('/api/planes/dag-planner/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_work_item: 'checkout-service:PR-502' })
      });
      await fetchAllData();
    } finally {
      setSimulatingDAG(false);
    }
  };

  const handleDecideGate = async (gateId: string, verdict: 'GATE_OPENED_PROD' | 'GATE_LOCKED_BLOCKED') => {
    playBeep(verdict === 'GATE_OPENED_PROD' ? 880 : 380, 0.2);
    setDecidingGateId(gateId);
    try {
      await fetch(`/api/planes/adjudication/gate/${gateId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict, operator: 'Staff Platform Architect' })
      });
      await fetchAllData();
    } finally {
      setDecidingGateId(null);
    }
  };

  const handleEvaluateIntake = async (rawSignal: string): Promise<IntakeEvaluationResponse> => {
    playBeep(680, 0.1);
    const res = await fetch('/api/agents/intake/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_signal: rawSignal })
    });
    return await res.json();
  };

  const handleCloseLearningLoop = async (): Promise<{ status: string; proposal: RCALearningLoopProposal }> => {
    playBeep(840, 0.2);
    const res = await fetch('/api/agents/reliability/close-loop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: 'INC-4412' })
    });
    const data = await res.json();
    await fetchAllData();
    return data;
  };

  const handleExecuteAction = async (actionId: string, operator = 'Staff Platform Lead') => {
    playBeep(520, 0.15);
    setExecutingActionId(actionId);
    try {
      await fetch(`/api/actions/${actionId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_approved_by: operator })
      });
      await fetchAllData();
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleRollbackAction = async (actionId: string) => {
    playBeep(440, 0.2);
    setRollingBackId(actionId);
    try {
      await fetch(`/api/actions/${actionId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_approved_by: 'Lead Rollback Arbiter' })
      });
      await fetchAllData();
    } finally {
      setRollingBackId(null);
    }
  };

  const handleEvaluateCustomPR = async (prData: any) => {
    playBeep(700, 0.12);
    setEvaluatingPR(true);
    try {
      await fetch('/api/reasoning/conformance/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prData)
      });
      await fetchAllData();
    } finally {
      setEvaluatingPR(false);
    }
  };

  const handleCreateWaiver = async (waiverData: any) => {
    playBeep(640, 0.12);
    setCreatingWaiver(true);
    try {
      await fetch('/api/reasoning/waivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waiverData)
      });
      await fetchAllData();
    } finally {
      setCreatingWaiver(false);
    }
  };

  // Primary 2-Selection Mode
  const [primarySelection, setPrimarySelection] = useState<'flowchart' | 'application'>('flowchart');

  // Application Pipeline Flow State
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [activeModule, setActiveModule] = useState<string>('stuck');

  // Active Project & Dynamic Multi-Tenant Sub-Module Filtering
  const currentProject = projects.find(p => p.project_id === activeProjectId) || (projects.length > 0 ? projects[0] : null);

  const filteredStuckWork = filterByProject && currentProject
    ? stuckWork.filter(item => {
        const pid = currentProject.project_id.toLowerCase();
        return (item.project_id && item.project_id.toLowerCase() === pid) ||
               (item.entity_key && item.entity_key.toLowerCase().includes(pid)) ||
               (item.title && item.title.toLowerCase().includes(pid));
      })
    : stuckWork;

  const filteredConformance = filterByProject && currentProject
    ? conformance.filter(item => {
        const pid = currentProject.project_id.toLowerCase();
        return (item.project_id && item.project_id.toLowerCase() === pid) ||
               (item.repo && item.repo.toLowerCase().includes(pid));
      })
    : conformance;

  const filteredChallenges = filterByProject && currentProject
    ? challenges.filter(item => {
        const pid = currentProject.project_id.toLowerCase();
        return (item.project_id && item.project_id.toLowerCase() === pid) ||
               (item.target_ref && item.target_ref.toLowerCase().includes(pid));
      })
    : challenges;

  const filteredWaivers = filterByProject && currentProject
    ? waivers.filter(item => {
        const pid = currentProject.project_id.toLowerCase();
        return (item.project_id && item.project_id.toLowerCase() === pid) ||
               (item.service && item.service.toLowerCase().includes(pid));
      })
    : waivers;

  const filteredActions = filterByProject && currentProject
    ? actions.filter(item => {
        const pid = currentProject.project_id.toLowerCase();
        return (item.description && item.description.toLowerCase().includes(pid)) ||
               (item.idempotency_key && item.idempotency_key.toLowerCase().includes(pid));
      })
    : actions;

  const filteredConflicts = filterByProject && currentProject
    ? conflicts.filter(item => {
        const pid = currentProject.project_id.toLowerCase();
        return (item.context_ref && item.context_ref.toLowerCase().includes(pid)) ||
               (item.topic && item.topic.toLowerCase().includes(pid));
      })
    : conflicts;

  const appStages = [
    {
      id: 'stage1',
      num: 1,
      title: 'Stage 1: Intake & Forensics',
      plane: 'PLANE 1: RADAR',
      description: 'Stuck work forensics, stall taxonomy and engineering outcome radar',
      submodules: [
        { id: 'stuck', label: 'Stuck Work Forensics (P1)', icon: AlertOctagon, count: filteredStuckWork.length },
        { id: 'radar', label: 'Outcome Radar (§1.4)', icon: Radar, count: null },
      ]
    },
    {
      id: 'stage2',
      num: 2,
      title: 'Stage 2: Multi-Agent Execution',
      plane: 'PLANE 2: EXECUTION',
      description: '3 Planes architecture, 8 execution agents, parallel DAG & inter-agent communication',
      submodules: [
        { id: 'planes', label: 'Three Planes Architecture', icon: Layers, count: 3 },
        { id: 'agents', label: 'Execution Agents (§4.1)', icon: Bot, count: 8 },
        { id: 'parallel', label: 'Parallel Scatter-Gather DAG (§8)', icon: GitBranch, count: 'P2' },
        { id: 'comm', label: 'Inter-Agent Comm & Memory (§7)', icon: Radio, count: 'P2' },
        { id: 'orchestration', label: 'Routing & Work Objects (§5)', icon: Compass, count: 'P2' },
      ]
    },
    {
      id: 'stage3',
      num: 3,
      title: 'Stage 3: Governance & Adjudication',
      plane: 'PLANE 3: SUPER AGENTS',
      description: 'Super agents 5-phase challenge protocol, architecture gate & tech debt arena',
      submodules: [
        { id: 'super_agents', label: 'Super Agents & Protocol (§6)', icon: Swords, count: 'P3' },
        { id: 'arch', label: 'Architecture Gate (P2)', icon: ShieldCheck, count: filteredConformance.length },
        { id: 'debt', label: 'Debt Arena & Waivers (P3)', icon: Flame, count: filteredChallenges.length + filteredWaivers.length },
      ]
    },
    {
      id: 'stage4',
      num: 4,
      title: 'Stage 4: Invariants, Arbiter & Safety',
      plane: 'SAFETY & CONTROL',
      description: 'The 12 Invariants proofs, serialized write arbiter, controlled tools & fault tolerance',
      submodules: [
        { id: 'invariants', label: 'The 12 Invariants', icon: BookMarked, count: 12 },
        { id: 'tools', label: 'Controlled Tool Console', icon: Sliders, count: filteredActions.filter(a => a.status === 'PENDING_APPROVAL').length },
        { id: 'security_audit', label: 'Security & Audit (§10)', icon: Lock, count: '6-Tuple' },
        { id: 'fault_tolerance', label: 'Fault Tolerance & Fallback (§9)', icon: ShieldAlert, count: 'P1-P3' },
      ]
    },
    {
      id: 'stage5',
      num: 5,
      title: 'Stage 5: Trust Ladder & Production Posture',
      plane: 'TELEMETRY & PRODUCTION',
      description: 'Trust Ladder Chant #8 autonomy rungs, 3-layer observability & reference tech posture',
      submodules: [
        { id: 'trust_ladder', label: 'Trust Ladder (§12)', icon: Award, count: 'Chant #8' },
        { id: 'observability', label: '3-Layer Observability (§11)', icon: Activity, count: 'ECE: 0.016' },
        { id: 'tech_posture', label: 'Reference Posture (§13)', icon: Cpu, count: '6 Positions' },
      ]
    }
  ];

  const handleNavigateToModule = (moduleId: string) => {
    playBeep(620, 0.08);
    for (let i = 0; i < appStages.length; i++) {
      if (appStages[i].submodules.some(s => s.id === moduleId)) {
        setCurrentStageIndex(i);
        break;
      }
    }
    setActiveModule(moduleId);
    setPrimarySelection('application');
  };

  const handleNextStage = () => {
    playBeep(640, 0.08);
    if (currentStageIndex < appStages.length - 1) {
      const nextIdx = currentStageIndex + 1;
      setCurrentStageIndex(nextIdx);
      setActiveModule(appStages[nextIdx].submodules[0].id);
    }
  };

  const handlePrevStage = () => {
    playBeep(520, 0.08);
    if (currentStageIndex > 0) {
      const prevIdx = currentStageIndex - 1;
      setCurrentStageIndex(prevIdx);
      setActiveModule(appStages[prevIdx].submodules[0].id);
    }
  };
  const handleExecuteProject = async (projectId: string) => {
    playBeep(680, 0.12);
    setExecutingProject(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator: 'Staff Platform Architect',
          trigger_reason: 'Manual Targeted Execution via Step 2 Console'
        })
      });
      const data = await res.json();
      if (data.execution) {
        setProjectExecutionToast(data.execution);
      }
      await fetchAllData();
    } catch (e) {
      console.error('Failed to execute project pipeline:', e);
    } finally {
      setExecutingProject(false);
    }
  };

  const handleLaunchProjectFromStep1 = async (projectId: string) => {
    setActiveProjectId(projectId);
    setPrimarySelection('application');
    await handleExecuteProject(projectId);
  };

  const handleProjectCreated = (newProject: Project) => {
    playBeep(740, 0.15);
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.project_id);
    setPrimarySelection('application');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0e17]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[1.5px] shadow-glow-cyan">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                  PRIP-AI
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase tracking-wider">
                  Platform Overview • 3 Planes & 12 Invariants
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Interactive Animated Flowchart • Sequential Application Flow
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={handleToggleDegradedMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                degradedModeActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber animate-pulse'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Invariant §6: Degraded mode toggle"
            >
              <Zap className={`w-3.5 h-3.5 ${degradedModeActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{degradedModeActive ? 'DEGRADED: ON' : 'Degraded Fallback'}</span>
            </button>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all"
              title="Open short quotes for PR review"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Quote Invariants</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1424] border border-cyan-500/20 text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Engine :6090</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
              className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Systems of Record Mesh Status Bar */}
      <ToolchainBar systems={systems} onSync={handleSyncMesh} syncing={syncing} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-16 space-y-6">
        
        {/* ONLY 2 PRIMARY SELECTIONS IN BUTTONS */}
        <div className="pt-2">
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#090d18] border border-cyan-500/30 max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
            <button
              onClick={() => {
                playBeep(520, 0.08);
                setPrimarySelection('flowchart');
              }}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-mono text-xs md:text-sm font-bold transition-all ${
                primarySelection === 'flowchart'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-glow-cyan scale-[1.01]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitBranch className={`w-4 h-4 ${primarySelection === 'flowchart' ? 'text-black' : 'text-cyan-400'}`} />
              <span>1. Interactive Animated Flowchart</span>
            </button>

            <button
              onClick={() => {
                playBeep(640, 0.08);
                setPrimarySelection('application');
              }}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-mono text-xs md:text-sm font-bold transition-all ${
                primarySelection === 'application'
                  ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 text-black shadow-glow-emerald scale-[1.01]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className={`w-4 h-4 ${primarySelection === 'application' ? 'text-black' : 'text-emerald-400'}`} />
              <span>2. Running Application</span>
            </button>
          </div>
        </div>

        {/* APPLICATION PIPELINE FLOW CONTROLLER (Visible when Running Application is selected) */}
        {primarySelection === 'application' && (
          <div className="space-y-4">
            {/* PROJECT SCOPE & EXECUTION CONTROL BAR (Step 2 Project-to-Project Basis) */}
            <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-500/30 shadow-2xl space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        ACTIVE PROJECT CONTEXT:
                      </span>
                      {currentProject && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                          {currentProject.tier}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        value={activeProjectId}
                        onChange={(e) => {
                          playBeep(540, 0.05);
                          setActiveProjectId(e.target.value);
                        }}
                        className="bg-[#050811] border border-cyan-500/40 rounded-lg px-2.5 py-1 text-white font-bold text-sm focus:outline-none focus:border-cyan-300 font-mono"
                      >
                        {projects.map((p) => (
                          <option key={p.project_id} value={p.project_id}>
                            {p.name} ({p.project_id})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setOnboardingModalOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs transition-all"
                        title="Onboard a new project repository"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Specs Strip & Action Trigger */}
                {currentProject && (
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-[#050811] border border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500">AUTONOMY RUNG</div>
                      <div className="text-emerald-400 font-bold">{currentProject.autonomy_rung}</div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-[#050811] border border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500">CONFORMANCE</div>
                      <div className="text-cyan-400 font-bold">{currentProject.conformance_score}%</div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-[#050811] border border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500">ACTIVE PRS</div>
                      <div className="text-purple-400 font-bold">{currentProject.active_prs} PRs</div>
                    </div>

                    <button
                      onClick={() => {
                        playBeep(520, 0.05);
                        setFilterByProject(!filterByProject);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all border ${
                        filterByProject
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-glow-cyan'
                          : 'bg-[#050811] text-slate-400 border-white/5 hover:text-white'
                      }`}
                      title="Toggle between Active Project Filter and Mesh-wide All Projects View"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{filterByProject ? `Filter: ${currentProject.name.split(' ')[0]}` : 'All Projects'}</span>
                    </button>

                    <button
                      onClick={() => {
                        playBeep(580, 0.06);
                        setGoldenModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold transition-all hover:scale-105"
                      title="Run Golden Set Evaluation Harness (§13.6 & Chant #8)"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                      <span>Golden Tests (§13.6)</span>
                    </button>

                    <button
                      onClick={() => {
                        playBeep(500, 0.08);
                        setSimulatorModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-all hover:scale-105"
                      title="Simulate edge cases: Chant #8 auto-demotion, arbiter collisions, circuit breakers"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Chaos Simulator</span>
                    </button>

                    <button
                      disabled={executingProject}
                      onClick={() => handleExecuteProject(activeProjectId)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-glow-emerald ${
                        executingProject
                          ? 'opacity-60 bg-slate-800 text-slate-400 border border-white/10'
                          : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-black hover:scale-105 active:scale-95'
                      }`}
                    >
                      <Zap className={`w-4 h-4 ${executingProject ? 'animate-spin text-cyan-400' : 'text-black'}`} />
                      <span>{executingProject ? 'Executing Pipeline...' : `Execute Pipeline for ${currentProject.name.split(' ')[0]}`}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Project Execution Toast Banner */}
              {projectExecutionToast && (
                <div className="mt-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-400/60 shadow-glow-emerald flex items-center justify-between gap-3 animate-fade-in text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="text-emerald-300 font-bold">PIPELINE EXECUTION COMMITTED:</span>{' '}
                      <span className="text-white">{projectExecutionToast.summary}</span>
                      <span className="text-slate-400 ml-2">[{projectExecutionToast.lane} • Work ID: {projectExecutionToast.work_object_id}]</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setProjectExecutionToast(null)}
                    className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-black/40"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Stage Stepper Controller */}
            <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-emerald-500/30 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                      APPLICATION FLOW: STAGE {currentStageIndex + 1} OF {appStages.length}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">• {appStages[currentStageIndex].plane}</span>
                    {currentProject && (
                      <span className="text-cyan-400 text-xs font-mono font-bold">• Project: {currentProject.name}</span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    {appStages[currentStageIndex].title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {appStages[currentStageIndex].description}
                  </p>
                </div>

                {/* Flow Next / Prev Controls */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentStageIndex === 0}
                    onClick={handlePrevStage}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl font-mono text-xs border transition-all ${
                      currentStageIndex === 0
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-white/5 text-slate-600'
                        : 'bg-slate-900 border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Stage</span>
                  </button>

                  <button
                    disabled={currentStageIndex === appStages.length - 1}
                    onClick={handleNextStage}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                      currentStageIndex === appStages.length - 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-white/5 text-slate-600'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-transparent shadow-glow-emerald hover:scale-105'
                    }`}
                  >
                    <span>Next Stage</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>

              {/* Stages Stepper Indicator Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {appStages.map((stage, idx) => {
                  const isCurrent = idx === currentStageIndex;
                  const isPast = idx < currentStageIndex;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => {
                        playBeep(560 + idx * 30, 0.06);
                        setCurrentStageIndex(idx);
                        setActiveModule(stage.submodules[0].id);
                      }}
                      className={`text-left p-2.5 rounded-xl border transition-all font-mono text-xs ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-glow-emerald'
                          : isPast
                          ? 'bg-[#060a14] border-emerald-500/30 text-emerald-400/80 hover:border-emerald-400/60'
                          : 'bg-[#060a14] border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>STEP 0{idx + 1}</span>
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                      </div>
                      <div className="font-bold truncate text-[11px]">{stage.title.replace(`Stage ${idx + 1}: `, '')}</div>
                    </button>
                  );
                })}
              </div>

              {/* Contextual Sub-Modules for Current Stage */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none font-mono text-xs border-t border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider px-1">Stage Views:</span>
                {appStages[currentStageIndex].submodules.map((sub) => {
                  const Icon = sub.icon;
                  const isSubActive = activeModule === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        playBeep(580, 0.05);
                        setActiveModule(sub.id);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all font-medium ${
                        isSubActive
                          ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-extrabold shadow-glow-emerald'
                          : 'text-slate-400 hover:text-white bg-[#0e1322] hover:bg-[#151c30] border border-white/5'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSubActive ? 'text-black' : 'text-emerald-400'}`} />
                      <span>{sub.label}</span>
                      {sub.count !== null && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isSubActive ? 'bg-black text-emerald-300' : 'bg-slate-800 text-slate-300 border border-white/10'
                        }`}>
                          {sub.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Views */}
        {loading ? (
          <div className="py-24 text-center space-y-3 font-mono">
            <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <div className="text-slate-400 text-sm">Synchronizing Execution Agents & Evidence Service...</div>
          </div>
        ) : (
          <div>
            {/* SELECTION 1: INTERACTIVE ANIMATED FLOWCHART */}
            {primarySelection === 'flowchart' && (
              <PortalLandingDashboard 
                onNavigateTab={handleNavigateToModule}
                projects={projects}
                activeProject={currentProject}
                onSelectProject={(p) => setActiveProjectId(p.project_id)}
                onExecuteProjectInStep2={handleLaunchProjectFromStep1}
                onOpenOnboardingModal={() => setOnboardingModalOpen(true)}
              />
            )}

            {/* SELECTION 2: RUNNING APPLICATION (FLOWING THROUGH MODULES) */}
            {primarySelection === 'application' && (
              <div className="space-y-6">
                {/* Active Project Filter Notice Banner */}
                {filterByProject && currentProject && (
                  <div className="p-3.5 rounded-xl bg-[#091122] border border-cyan-500/30 flex items-center justify-between gap-3 text-xs font-mono shadow-md">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Filter className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>
                        <strong>FILTER ACTIVE:</strong> Sub-modules contextualized to <strong>{currentProject.name}</strong> ({currentProject.project_id}).
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        playBeep(520, 0.05);
                        setFilterByProject(false);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-white px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex-shrink-0"
                    >
                      Show All Projects (Mesh-Wide)
                    </button>
                  </div>
                )}

                {activeModule === 'stuck' && (
                  <StuckWorkDetector 
                    items={filteredStuckWork} 
                    onExecuteAction={(id) => handleExecuteAction(id)}
                    executingId={executingActionId}
                  />
                )}
                {activeModule === 'radar' && <CommandRadar metrics={metrics} />}
                {activeModule === 'planes' && (
                  <ThreePlanesView
                    overview={planesOverview}
                    substrate={substrateData}
                    dagPlans={dagPlans}
                    adjudication={adjudicationData}
                    agents={agents}
                    onSimulateDAG={handleSimulateDAG}
                    simulatingDAG={simulatingDAG}
                    onDecideGate={handleDecideGate}
                    decidingGateId={decidingGateId}
                  />
                )}
                {activeModule === 'agents' && (
                  <ExecutionAgentsRoster
                    agents={agents}
                    evidenceStore={evidenceStore}
                    onEvaluateIntake={handleEvaluateIntake}
                    onCloseLearningLoop={handleCloseLearningLoop}
                  />
                )}
                {activeModule === 'parallel' && <ParallelExecutionHub />}
                {activeModule === 'comm' && <InterAgentCommHub />}
                {activeModule === 'orchestration' && <OrchestrationHub />}
                {activeModule === 'super_agents' && <SuperAgentsHub />}
                {activeModule === 'arch' && (
                  <ArchitectureGate
                    evaluations={filteredConformance}
                    standards={standards}
                    onEvaluateCustomPR={handleEvaluateCustomPR}
                    evaluating={evaluatingPR}
                  />
                )}
                {activeModule === 'debt' && (
                  <TechDebtArena
                    challenges={filteredChallenges}
                    waivers={filteredWaivers}
                    onCreateWaiver={handleCreateWaiver}
                    creatingWaiver={creatingWaiver}
                  />
                )}
                {activeModule === 'invariants' && (
                  <InvariantsHub
                    invariants={invariants}
                    arbiterStatus={arbiterStatus}
                    conflicts={filteredConflicts}
                    trustLadder={trustLadder}
                    capabilities={capabilities}
                    actions={filteredActions}
                    onRollbackAction={handleRollbackAction}
                    rollingBackId={rollingBackId}
                    onOpenReviewModal={() => setReviewModalOpen(true)}
                  />
                )}
                {activeModule === 'tools' && (
                  <ControlledToolLayer
                    actions={filteredActions}
                    auditLog={auditLog}
                    onExecuteAction={handleExecuteAction}
                    executingId={executingActionId}
                  />
                )}
                {activeModule === 'security_audit' && <SecurityAuditHub />}
                {activeModule === 'fault_tolerance' && <FaultToleranceHub />}
                {activeModule === 'trust_ladder' && <TrustLadderHub />}
                {activeModule === 'observability' && <ObservabilityHub />}
                {activeModule === 'tech_posture' && <TechPostureHub />}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 12 Invariants Review Quotes Modal */}
      <InvariantsReviewModal
        invariants={invariants}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

      {/* Project Onboarding Modal */}
      <ProjectOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Golden Set Test Runner Modal (§13.6 & Chant #8) */}
      <GoldenTestRunnerModal
        project={currentProject}
        isOpen={goldenModalOpen}
        onClose={() => setGoldenModalOpen(false)}
        onRunComplete={fetchAllData}
      />

      {/* Resilience & Chaos Simulator Modal */}
      <EdgeCaseSimulatorModal
        project={currentProject}
        isOpen={simulatorModalOpen}
        onClose={() => setSimulatorModalOpen(false)}
        onFailureSimulated={fetchAllData}
        onHealthRestored={fetchAllData}
      />


      {/* Cyber Footer */}
      <footer className="border-t border-white/5 py-4 px-4 bg-[#05070a] text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            PRIP-AI Engine • Section 4 Execution Agents, Evidence Service & Manifests
          </div>
          <div className="text-slate-400">
            Frontend: <span className="text-cyan-400 font-bold">localhost:6080</span> | Backend: <span className="text-emerald-400 font-bold">localhost:6090</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
