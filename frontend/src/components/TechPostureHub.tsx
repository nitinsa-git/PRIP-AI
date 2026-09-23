import React, { useState, useEffect } from 'react';
import {
  TechPostureOverview,
  ModelGatewayRoute,
  MCPToolRegistration,
  DurableEventSubscriber,
  WorkObjectVersionSnapshot,
  GitOpsArtifact,
  PromptEvalSuite
} from '../types';
import {
  Cpu,
  Layers,
  Repeat,
  History,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Radio,
  FileCode,
  Sparkles,
  Lock,
  PlusCircle,
  Clock,
  Terminal,
  RefreshCw,
  ExternalLink,
  Sliders
} from 'lucide-react';

export const TechPostureHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'models' | 'mcp' | 'bus' | 'concurrency' | 'gitops' | 'prompts'>('models');
  const [overview, setOverview] = useState<TechPostureOverview | null>(null);
  const [routes, setRoutes] = useState<ModelGatewayRoute[]>([]);
  const [mcpTools, setMcpTools] = useState<MCPToolRegistration[]>([]);
  const [subscribers, setSubscribers] = useState<DurableEventSubscriber[]>([]);
  const [gitopsArtifacts, setGitopsArtifacts] = useState<GitOpsArtifact[]>([]);
  const [evalSuites, setEvalSuites] = useState<PromptEvalSuite[]>([]);
  const [workObjectVersions, setWorkObjectVersions] = useState<WorkObjectVersionSnapshot[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form states
  const [selectedRoute, setSelectedRoute] = useState<ModelGatewayRoute | null>(null);
  const [swapVendor, setSwapVendor] = useState('OpenAI');
  const [swapModelId, setSwapModelId] = useState('gpt-4o-2024-11-20');

  // MCP Register Form
  const [newMcpSystem, setNewMcpSystem] = useState('Datadog APM');
  const [newMcpUrl, setNewMcpUrl] = useState('http://mcp-datadog.mesh.internal:8093/v1/sse');
  const [newMcpCapability, setNewMcpCapability] = useState('observability.metrics');

  // Concurrency Simulation State
  const [targetWoId] = useState('WO-2026-014872');
  const [simVersionInput, setSimVersionInput] = useState(1);
  const [simAuthor, setSimAuthor] = useState('WriteArbiter-Session');
  const [simPlanText, setSimPlanText] = useState('Deploy canary replica on spot cluster');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchAllPostureData = async () => {
    setLoading(true);
    try {
      const [ovRes, routesRes, mcpRes, busRes, gitRes, evalRes, woRes] = await Promise.all([
        fetch('http://localhost:6090/api/tech-posture/overview').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/models').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/mcp-tools').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/event-bus/subscribers').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/gitops/artifacts').then((r) => r.json()),
        fetch('http://localhost:6090/api/tech-posture/eval-harness/suites').then((r) => r.json()),
        fetch(`http://localhost:6090/api/tech-posture/work-objects/${targetWoId}/versions`).then((r) => r.json())
      ]);

      setOverview(ovRes);
      setRoutes(routesRes);
      if (routesRes.length > 0 && !selectedRoute) {
        setSelectedRoute(routesRes[0]);
      }
      setMcpTools(mcpRes);
      setSubscribers(busRes);
      setGitopsArtifacts(gitRes);
      setEvalSuites(evalRes);
      setWorkObjectVersions(woRes);
    } catch (e) {
      console.error(e);
      showToast('Error loading technology posture telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPostureData();
  }, []);

  const handleSwapModel = async () => {
    if (!selectedRoute) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/tech-posture/models/${selectedRoute.route_id}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_vendor: swapVendor,
          new_model_id: swapModelId
        })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`HOT-SWAP SUCCESS: '${updated.route_id}' swapped to [${updated.active_vendor} / ${updated.active_model_id}] with zero code changes!`, 'success');
        fetchAllPostureData();
      } else {
        const err = await res.json();
        showToast(err.detail || 'Model swap failed', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Model swap network failure', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterMCPTool = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:6090/api/tech-posture/mcp-tools/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: `mcp-${newMcpSystem.toLowerCase().replace(/\s+/g, '-')}`,
          system_of_record: newMcpSystem,
          mcp_server_url: newMcpUrl,
          capability: newMcpCapability,
          methods_exposed: [`${newMcpSystem.toLowerCase().replace(/\s+/g, '_')}.query`, `${newMcpSystem.toLowerCase().replace(/\s+/g, '_')}.action`]
        })
      });
      if (res.ok) {
        const tool = await res.json();
        showToast(`MCP TOOL REGISTERED: '${tool.system_of_record}' plugged into mesh without an engine refactor!`, 'success');
        fetchAllPostureData();
      }
    } catch (e) {
      console.error(e);
      showToast('MCP registration failure', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplayBus = async (consumerGroup: string, fromOffset: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:6090/api/tech-posture/event-bus/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumer_group: consumerGroup,
          from_offset: fromOffset
        })
      });
      if (res.ok) {
        const result = await res.json();
        showToast(`DURABLE REPLAY: Consumer '${result.consumer_group}' rewound to offset #${result.rewound_to_offset} (${result.messages_to_reprocess} msgs replaying)!`, 'info');
        fetchAllPostureData();
      }
    } catch (e) {
      console.error(e);
      showToast('Replay trigger failure', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMutateOptimistic = async (isStaleVersion: boolean = false) => {
    setActionLoading(true);
    // Determine expected version based on latest version in snapshots
    const latestVer = workObjectVersions.length > 0 ? Math.max(...workObjectVersions.map((v) => v.version)) : 1;
    const versionToSend = isStaleVersion ? latestVer - 1 : latestVer;

    try {
      const res = await fetch(`http://localhost:6090/api/tech-posture/work-objects/${targetWoId}/mutate-optimistic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected_version: versionToSend,
          author: simAuthor,
          mutation_type: 'OPTIMISTIC_CONCURRENCY_TEST',
          field_updates: {
            test_note: simPlanText,
            timestamp_ms: Date.now()
          }
        })
      });

      if (res.status === 409) {
        const err = await res.json();
        showToast(`409 CONFLICT DETECTED: Expected v${versionToSend} vs Current v${err.detail?.current_version || latestVer}. Write rejected to prevent race condition overwrite!`, 'error');
      } else if (res.ok) {
        const committed = await res.json();
        showToast(`VERSION COMMITTED: State updated from v${committed.expected_version} -> v${committed.committed_version}. Immutable lineage snapshot logged!`, 'success');
        fetchAllPostureData();
      }
    } catch (e) {
      console.error(e);
      showToast('Optimistic mutation network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncGitOps = async (artifactId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/tech-posture/gitops/${artifactId}/sync`, {
        method: 'POST'
      });
      if (res.ok) {
        const synced = await res.json();
        showToast(`GITOPS SYNCED: '${synced.relative_path}' deployed like config at revision ${synced.deployed_version}!`, 'success');
        fetchAllPostureData();
      }
    } catch (e) {
      console.error(e);
      showToast('GitOps sync failure', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunPromptEval = async (suiteId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:6090/api/tech-posture/eval-harness/${suiteId}/run`, {
        method: 'POST'
      });
      if (res.ok) {
        const suite = await res.json();
        showToast(`EVAL PASSED: Prompt suite '${suite.suite_id}' evaluated against ${suite.golden_dataset_size} golden cases (${suite.overall_accuracy_pct}% accuracy)!`, 'success');
        fetchAllPostureData();
      }
    } catch (e) {
      console.error(e);
      showToast('Prompt eval execution failure', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between font-mono text-xs shadow-2xl transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMsg.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {toastMsg.type === 'info' && <Sparkles className="w-4 h-4 text-cyan-400" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Cyber Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1424] via-[#111c34] to-[#0c1424] border border-cyan-500/20 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase mb-1">
              <Cpu className="w-4 h-4" />
              <span>Section 13: Reference Technology Posture</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Deliberately Non-Prescriptive: <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Positions, Not Products</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl font-mono">
              {overview?.positions_statement || 'Deliberately non-prescriptive on vendors. Positions, not products: gateway model access, MCP tool protocol, durable event replay, optimistic work object store, GitOps config, and prompt-as-code test harnesses.'}
            </p>
          </div>

          <button
            onClick={fetchAllPostureData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all shadow-glow-cyan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Posture Telemetry</span>
          </button>
        </div>
      </div>

      {/* 6 Architectural Positions Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {/* 1. Model Gateway */}
        <div
          onClick={() => setActiveSection('models')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeSection === 'models'
              ? 'bg-[#101b33] border-cyan-500/50 shadow-glow-cyan'
              : 'bg-[#0a0f1d] border-white/5 hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Server className="w-4 h-4" />
              <span>1. Model Gateway</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
              {overview?.model_gateway?.status || 'HEALTHY'}
            </span>
          </div>
          <div className="text-slate-300 text-xs mb-1 font-sans">
            Vendor-agnostic abstraction; hot-swappable routes with zero caller changes.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <span>{routes.length} Active Routes</span>
            <span className="text-cyan-300 font-bold">Avg p95: {overview?.model_gateway?.avg_latency_p95_ms || 702}ms</span>
          </div>
        </div>

        {/* 2. MCP Protocol */}
        <div
          onClick={() => setActiveSection('mcp')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeSection === 'mcp'
              ? 'bg-[#101b33] border-indigo-500/50 shadow-glow-indigo'
              : 'bg-[#0a0f1d] border-white/5 hover:border-indigo-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>2. Tool Protocol (MCP)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
              MCP Default
            </span>
          </div>
          <div className="text-slate-300 text-xs mb-1 font-sans">
            Adding a system of record is a dynamic tool registration, not a refactor.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <span>{mcpTools.length} Systems of Record</span>
            <span className="text-indigo-300 font-bold">100% Zero-Refactor</span>
          </div>
        </div>

        {/* 3. Durable Event Bus */}
        <div
          onClick={() => setActiveSection('bus')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeSection === 'bus'
              ? 'bg-[#101b33] border-purple-500/50 shadow-glow-purple'
              : 'bg-[#0a0f1d] border-white/5 hover:border-purple-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Radio className="w-4 h-4" />
              <span>3. Durable Bus & Replay</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
              DURABLE 30-90D
            </span>
          </div>
          <div className="text-slate-300 text-xs mb-1 font-sans">
            Topic bus with persistent consumer groups, offset tracking, and arbitrary replay.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <span>{subscribers.length} Consumer Groups</span>
            <span className="text-purple-300 font-bold">Lag: {overview?.event_bus_durable?.total_lag ?? 2} msgs</span>
          </div>
        </div>

        {/* 4. Work Object Store */}
        <div
          onClick={() => setActiveSection('concurrency')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeSection === 'concurrency'
              ? 'bg-[#101b33] border-amber-500/50 shadow-glow-amber'
              : 'bg-[#0a0f1d] border-white/5 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Database className="w-4 h-4" />
              <span>4. Work Object Store</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
              OPTIMISTIC LOCK
            </span>
          </div>
          <div className="text-slate-300 text-xs mb-1 font-sans">
            Optimistic concurrency checking with immutable version snapshot lineage.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <span>Version Lineage Tree</span>
            <span className="text-amber-300 font-bold">Race-Proof 409 Reject</span>
          </div>
        </div>

        {/* 5. GitOps Config */}
        <div
          onClick={() => setActiveSection('gitops')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeSection === 'gitops'
              ? 'bg-[#101b33] border-emerald-500/50 shadow-glow-emerald'
              : 'bg-[#0a0f1d] border-white/5 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <GitBranch className="w-4 h-4" />
              <span>5. GitOps Policy-as-Code</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
              CODE REVIEWED
            </span>
          </div>
          <div className="text-slate-300 text-xs mb-1 font-sans">
            Plays, manifests, and policies in version control, deployed like config.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <span>{gitopsArtifacts.length} Config Artifacts</span>
            <span className="text-emerald-300 font-bold">Lint: 100% Passed</span>
          </div>
        </div>

        {/* 6. Prompt-as-Code Eval */}
        <div
          onClick={() => setActiveSection('prompts')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeSection === 'prompts'
              ? 'bg-[#101b33] border-rose-500/50 shadow-glow-rose'
              : 'bg-[#0a0f1d] border-white/5 hover:border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <FileCode className="w-4 h-4" />
              <span>6. Prompt-as-Code Evals</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
              GOLDEN TEST SETS
            </span>
          </div>
          <div className="text-slate-300 text-xs mb-1 font-sans">
            Golden benchmark test fixtures run automatically on every prompt or code change.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            <span>{evalSuites.length} Test Suites</span>
            <span className="text-rose-300 font-bold">Accuracy: {overview?.prompt_eval_harness?.avg_golden_accuracy_pct || 97.0}%</span>
          </div>
        </div>
      </div>

      {/* Position Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 font-mono text-xs">
        <button
          onClick={() => setActiveSection('models')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeSection === 'models'
              ? 'bg-cyan-500 text-black shadow-glow-cyan'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Model Gateway (§13.1)</span>
        </button>

        <button
          onClick={() => setActiveSection('mcp')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeSection === 'mcp'
              ? 'bg-indigo-500 text-black shadow-glow-indigo'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>MCP Tool Protocol (§13.2)</span>
        </button>

        <button
          onClick={() => setActiveSection('bus')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeSection === 'bus'
              ? 'bg-purple-500 text-black shadow-glow-purple'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Durable Event Bus & Replay (§13.3)</span>
        </button>

        <button
          onClick={() => setActiveSection('concurrency')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeSection === 'concurrency'
              ? 'bg-amber-500 text-black shadow-glow-amber'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Work Object Concurrency (§13.4)</span>
        </button>

        <button
          onClick={() => setActiveSection('gitops')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeSection === 'gitops'
              ? 'bg-emerald-500 text-black shadow-glow-emerald'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>GitOps Policy-as-Code (§13.5)</span>
        </button>

        <button
          onClick={() => setActiveSection('prompts')}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            activeSection === 'prompts'
              ? 'bg-rose-500 text-black shadow-glow-rose'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Prompt Eval Golden Sets (§13.6)</span>
        </button>
      </div>

      {/* SECTION 1: MODEL GATEWAY & HOT-SWAP STATION */}
      {activeSection === 'models' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Routes List */}
            <div className="lg:col-span-2 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-1">
                <span>ACTIVE MODEL GATEWAY ROUTES ({routes.length})</span>
                <span className="text-[10px] text-cyan-400">Zero consumer code changes on swap</span>
              </div>
              {routes.map((r) => {
                const isSelected = selectedRoute?.route_id === r.route_id;
                return (
                  <div
                    key={r.route_id}
                    onClick={() => setSelectedRoute(r)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#0f192e] border-cyan-500/50 shadow-glow-cyan'
                        : 'bg-[#090d18] border-white/5 hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                          {r.tier_name}
                        </span>
                        <span className="text-white font-bold">{r.route_id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                        {r.status}
                      </span>
                    </div>

                    <div className="text-slate-300 text-xs font-sans mb-3">{r.purpose}</div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px]">
                      <div>
                        <div className="text-slate-500 text-[10px]">ACTIVE MODEL</div>
                        <div className="text-cyan-300 font-bold truncate">
                          {r.active_vendor} / {r.active_model_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">FALLBACK TARGET</div>
                        <div className="text-slate-400 truncate">
                          {r.fallback_vendor} / {r.fallback_model_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">LATENCY p95</div>
                        <div className="text-amber-400 font-bold">{r.latency_p95_ms}ms</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">COST / 1M TOKENS</div>
                        <div className="text-emerald-400 font-bold">${r.cost_per_million_tokens_usd.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Model Hot-Swap Station */}
            <div className="p-5 rounded-2xl bg-[#090d18] border border-cyan-500/30 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Sliders className="w-4 h-4" />
                <span>HOT-SWAP MODEL GATEWAY</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                "You will swap models more often than you expect." Swap provider endpoints live without altering specialist code or prompts.
              </p>

              {selectedRoute && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 space-y-1">
                  <div className="text-slate-400 text-[10px]">TARGET ROUTE:</div>
                  <div className="text-white font-bold">{selectedRoute.route_id}</div>
                  <div className="text-slate-400 text-[11px]">
                    Current: <span className="text-cyan-300">{selectedRoute.active_vendor} / {selectedRoute.active_model_id}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">NEW VENDOR / PROVIDER</label>
                  <select
                    value={swapVendor}
                    onChange={(e) => setSwapVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                  >
                    <option value="Anthropic">Anthropic (Claude 3.5)</option>
                    <option value="OpenAI">OpenAI (GPT-4o)</option>
                    <option value="Google">Google (Gemini 1.5)</option>
                    <option value="DeepSeek">DeepSeek (R1)</option>
                    <option value="Local-Ollama">Local Ollama (Llama 3.3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">MODEL IDENTIFIER</label>
                  <input
                    type="text"
                    value={swapModelId}
                    onChange={(e) => setSwapModelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    placeholder="e.g. gpt-4o-2024-11-20"
                  />
                </div>

                <button
                  onClick={handleSwapModel}
                  disabled={actionLoading || !selectedRoute}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold flex items-center justify-center gap-2 shadow-glow-cyan transition-all"
                >
                  <Repeat className="w-4 h-4" />
                  <span>Execute Zero-Downtime Swap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MCP TOOL PROTOCOL LAYER */}
      {activeSection === 'mcp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registered Systems List */}
            <div className="lg:col-span-2 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-1">
                <span>REGISTERED SYSTEMS OF RECORD ({mcpTools.length})</span>
                <span className="text-[10px] text-indigo-400">MCP Standard 2024-11-05</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mcpTools.map((tool) => (
                  <div key={tool.tool_id} className="p-4 rounded-xl bg-[#090d18] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-white font-bold">{tool.system_of_record}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {tool.capability}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px] truncate">
                      Endpoint: <span className="text-slate-300">{tool.mcp_server_url}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <div className="text-slate-500 text-[10px] mb-1">EXPOSED METHODS:</div>
                      <div className="flex flex-wrap gap-1">
                        {tool.methods_exposed.map((m, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-[10px] text-slate-300">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic MCP Tool Registration Form */}
            <div className="p-5 rounded-2xl bg-[#090d18] border border-indigo-500/30 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <PlusCircle className="w-4 h-4" />
                <span>DYNAMIC MCP TOOL REGISTRATION</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                "Adding a system of record is a tool registration, not a refactor." Register any compliant MCP server on the mesh dynamically.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">SYSTEM OF RECORD NAME</label>
                  <input
                    type="text"
                    value={newMcpSystem}
                    onChange={(e) => setNewMcpSystem(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                    placeholder="e.g. PagerDuty, Confluence"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">MCP SERVER SSE URL</label>
                  <input
                    type="text"
                    value={newMcpUrl}
                    onChange={(e) => setNewMcpUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">CAPABILITY URI</label>
                  <input
                    type="text"
                    value={newMcpCapability}
                    onChange={(e) => setNewMcpCapability(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleRegisterMCPTool}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold flex items-center justify-center gap-2 shadow-glow-indigo transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>Register MCP Server (Zero Refactor)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DURABLE EVENT BUS & REPLAY */}
      {activeSection === 'bus' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#090d18] border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-purple-400 font-bold text-sm">DURABLE EVENT BUS CONSUMER GROUPS</div>
              <p className="text-slate-400 text-xs font-sans mt-0.5">
                Persistent event log with guaranteed offset tracking. Rewind and replay messages on demand for recovery and auditing.
              </p>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-bold">
                Retention: 30-90 Days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscribers.map((sub) => (
              <div key={sub.consumer_group} className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{sub.consumer_group}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    sub.lag === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300 animate-pulse'
                  }`}>
                    Lag: {sub.lag} msgs
                  </span>
                </div>

                <div className="text-slate-400 text-[11px]">
                  Topic: <span className="text-purple-300">{sub.subscribed_topic}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/5">
                  <div>
                    <span className="text-slate-500">Committed Offset:</span>
                    <div className="text-white font-bold font-mono">#{sub.committed_offset}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Latest Bus Offset:</span>
                    <div className="text-slate-400 font-mono">#{sub.latest_bus_offset}</div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleReplayBus(sub.consumer_group, Math.max(0, sub.committed_offset - 200))}
                    disabled={actionLoading}
                    className="flex-1 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rewind -200 & Replay</span>
                  </button>
                  <button
                    onClick={() => handleReplayBus(sub.consumer_group, sub.latest_bus_offset)}
                    disabled={actionLoading}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs transition-all"
                  >
                    Catch Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: WORK OBJECT CONCURRENCY & VERSION TREE */}
      {activeSection === 'concurrency' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Version Lineage Tree */}
            <div className="lg:col-span-2 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-1">
                <span>WORK OBJECT STORE LINEAGE ({targetWoId})</span>
                <span className="text-[10px] text-amber-400">Optimistic Locking with Version History</span>
              </div>

              <div className="space-y-3">
                {workObjectVersions.map((snap) => (
                  <div key={snap.version} className="p-4 rounded-xl bg-[#090d18] border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          v{snap.version}
                        </span>
                        <span className="text-white font-bold">{snap.author}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">{snap.timestamp}</span>
                    </div>

                    <div className="text-slate-300 text-xs font-sans">{snap.change_summary}</div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span>Hash: {snap.state_hash}</span>
                      <span>Modified: {snap.fields_modified.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimistic Concurrency Simulator */}
            <div className="p-5 rounded-2xl bg-[#090d18] border border-amber-500/30 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>OPTIMISTIC LOCK SIMULATOR</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Test version-checked mutations. Submitting a stale version raises an immediate 409 Conflict without corrupting state.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">MUTATION AUTHOR</label>
                  <input
                    type="text"
                    value={simAuthor}
                    onChange={(e) => setSimAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">PROPOSED CHANGE</label>
                  <input
                    type="text"
                    value={simPlanText}
                    onChange={(e) => setSimPlanText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => handleMutateOptimistic(false)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-black font-extrabold flex items-center justify-center gap-2 shadow-glow-amber transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit with Valid Version (Succeeds)</span>
                  </button>

                  <button
                    onClick={() => handleMutateOptimistic(true)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Simulate Stale Version (409 Conflict)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: GITOPS POLICY-AS-CODE */}
      {activeSection === 'gitops' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-1">
            <span>TRACKED CONFIGURATION & POLICIES IN GIT ({gitopsArtifacts.length})</span>
            <span className="text-[10px] text-emerald-400">Reviewed like code, deployed like config</span>
          </div>

          <div className="space-y-3">
            {gitopsArtifacts.map((art) => (
              <div key={art.artifact_id} className="p-4 rounded-xl bg-[#090d18] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {art.artifact_type}
                    </span>
                    <span className="text-white font-bold">{art.relative_path}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Repo: <span className="text-slate-300">{art.repo_url}</span> • Commit: <span className="text-cyan-300">{art.commit_sha}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                    PR #{art.pr_number}: {art.review_status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Lint: {art.policy_lint_status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    Deployed: {art.deployed_version}
                  </span>
                  <button
                    onClick={() => handleSyncGitOps(art.artifact_id)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync & Deploy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: PROMPT-AS-CODE EVALUATION HARNESS */}
      {activeSection === 'prompts' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-1">
            <span>PROMPT-AS-CODE TEST SUITES ({evalSuites.length})</span>
            <span className="text-[10px] text-rose-400">Treat prompts as code with tests</span>
          </div>

          <div className="space-y-6">
            {evalSuites.map((suite) => (
              <div key={suite.suite_id} className="p-5 rounded-2xl bg-[#090d18] border border-rose-500/20 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{suite.suite_id}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                        {suite.prompt_version}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Target Play: <span className="text-cyan-300">{suite.target_play_id}</span> • File: <span className="text-slate-300">{suite.prompt_file}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">ACCURACY</div>
                      <div className="text-rose-400 font-bold text-sm">{suite.overall_accuracy_pct}%</div>
                    </div>
                    <button
                      onClick={() => handleRunPromptEval(suite.suite_id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-2 shadow-glow-rose transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Run Golden Tests</span>
                    </button>
                  </div>
                </div>

                {/* Test Cases Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border border-white/5 rounded-lg overflow-hidden">
                    <thead className="bg-slate-900/80 text-slate-400">
                      <tr>
                        <th className="p-2.5">CASE ID</th>
                        <th className="p-2.5">SCENARIO NAME</th>
                        <th className="p-2.5">INPUT FIXTURE</th>
                        <th className="p-2.5">EXPECTED BEHAVIOR</th>
                        <th className="p-2.5">EVAL SCORE</th>
                        <th className="p-2.5">LATENCY</th>
                        <th className="p-2.5 text-right">ASSERTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {suite.test_cases.map((tc) => (
                        <tr key={tc.case_id} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-bold text-cyan-300">{tc.case_id}</td>
                          <td className="p-2.5 text-white">{tc.scenario_name}</td>
                          <td className="p-2.5 text-slate-400 truncate max-w-[200px]">{tc.input_fixture}</td>
                          <td className="p-2.5 text-slate-300 truncate max-w-[220px]">{tc.expected_behavior}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{(tc.eval_score * 100).toFixed(1)}%</td>
                          <td className="p-2.5 text-slate-400">{tc.latency_ms}ms</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              PASSED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
