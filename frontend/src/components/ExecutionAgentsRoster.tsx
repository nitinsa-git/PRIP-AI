import React, { useState } from 'react';
import { 
  Bot, ShieldCheck, AlertCircle, FileText, Code2, 
  Terminal, Search, Database, CheckCircle2, Copy, Check, 
  Sparkles, RefreshCw, Send, HelpCircle, Flame, ArrowRight, BookOpen 
} from 'lucide-react';
import { 
  AgentProfile, AgentManifest, EvidenceItem, 
  IntakeEvaluationResponse, RCALearningLoopProposal 
} from '../types';

interface ExecutionAgentsRosterProps {
  agents: AgentProfile[];
  evidenceStore: EvidenceItem[];
  onEvaluateIntake: (rawSignal: string) => Promise<IntakeEvaluationResponse>;
  onCloseLearningLoop: () => Promise<{ status: string; proposal: RCALearningLoopProposal }>;
}

export const ExecutionAgentsRoster: React.FC<ExecutionAgentsRosterProps> = ({
  agents,
  evidenceStore,
  onEvaluateIntake,
  onCloseLearningLoop,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'intake_sim' | 'learning_loop' | 'evidence_svc'>('roster');
  const [selectedAgentForManifest, setSelectedAgentForManifest] = useState<AgentManifest | null>(null);
  const [copiedManifestId, setCopiedManifestId] = useState<string | null>(null);

  // Intake Simulator State (4.1.1)
  const [intakeInput, setIntakeInput] = useState('help, strange checkout bug happening right now');
  const [intakeResult, setIntakeResult] = useState<IntakeEvaluationResponse | null>(null);
  const [evaluatingIntake, setEvaluatingIntake] = useState(false);

  // Learning Loop State (4.1.7)
  const [learningLoopResult, setLearningLoopResult] = useState<RCALearningLoopProposal | null>(null);
  const [closingLoop, setClosingLoop] = useState(false);

  // Evidence Explorer State (4.2)
  const [evidenceQuery, setEvidenceQuery] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('ALL');

  const filteredEvidence = evidenceStore.filter((ev) => {
    const matchesType = selectedSourceType === 'ALL' || ev.source_type === selectedSourceType;
    const matchesQuery =
      !evidenceQuery ||
      ev.evidence_id.toLowerCase().includes(evidenceQuery.toLowerCase()) ||
      ev.summary.toLowerCase().includes(evidenceQuery.toLowerCase()) ||
      ev.uri.toLowerCase().includes(evidenceQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const handleCopyManifest = (manifest: AgentManifest) => {
    const yaml = `agent_id: ${manifest.agent_id}
version: ${manifest.version}
capabilities:
${manifest.capabilities.map(c => `  - ${c}`).join('\n')}
inputs_schema: ${manifest.inputs_schema}
outputs_schema: ${manifest.outputs_schema}
required_tools: [${manifest.required_tools.join(', ')}]
evidence_sources: [${manifest.evidence_sources.join(', ')}]
cost_profile:
  tier: ${manifest.cost_profile.tier}
  p50_tokens: ${manifest.cost_profile.p50_tokens}
  p95_latency_ms: ${manifest.cost_profile.p95_latency_ms}
write_scope: ${manifest.write_scope}
trust_level: ${manifest.trust_level}
degraded_mode: ${manifest.degraded_mode}
owner: ${manifest.owner}`;

    navigator.clipboard.writeText(yaml);
    setCopiedManifestId(manifest.agent_id);
    setTimeout(() => setCopiedManifestId(null), 2000);
  };

  const handleTestIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluatingIntake(true);
    try {
      const res = await onEvaluateIntake(intakeInput);
      setIntakeResult(res);
    } finally {
      setEvaluatingIntake(false);
    }
  };

  const handleTriggerLearningLoop = async () => {
    setClosingLoop(true);
    try {
      const res = await onCloseLearningLoop();
      setLearningLoopResult(res.proposal);
    } finally {
      setClosingLoop(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner matching Section 4 prompt */}
      <div className="bg-gradient-to-r from-[#0d1627] via-[#1a1435] to-[#122227] p-5 rounded-2xl border border-cyan-500/30 shadow-glow-cyan/10 font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                Section 4 Blueprint
              </span>
              <span className="text-xs text-slate-400">
                Plane 1 Specialists
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-sans">
              Execution Agents (Role Specialization)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Each agent has a narrow mission, named evidence sources, a typed output contract, and its own quality metric. <span className="text-cyan-300 font-bold">Narrowness is the design, not a limitation.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'roster'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>4.1 The 8 Specialist Manifests ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('intake_sim')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'intake_sim'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>4.1.1 Intake Simulator ("Asks, Never Guesses")</span>
        </button>

        <button
          onClick={() => setActiveSubTab('learning_loop')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'learning_loop'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>4.1.7 Reliability Learning Loop</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evidence_svc')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'evidence_svc'
              ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>4.2 Evidence Service Explorer ({evidenceStore.length})</span>
        </button>
      </div>

      {/* Sub-Tab 1: The 8 Specialist Manifests */}
      {activeSubTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          {agents.map((ag) => {
            const m = ag.manifest;
            if (!m) return null;
            return (
              <div
                key={ag.id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-sans">
                          {m.name}
                        </h4>
                        <div className="text-[10px] text-slate-400">
                          ID: <code className="text-cyan-300">{m.agent_id}</code> • v{m.version}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.trust_level === 'autonomous'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {m.trust_level}
                    </span>
                  </div>

                  {/* Mission Statement */}
                  <div className="p-3 rounded-xl bg-[#090d18] border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mission:</span>
                    <p className="text-slate-200 text-xs leading-relaxed font-sans">{m.mission}</p>
                  </div>

                  {/* Hard Rule Badge */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1 text-amber-200">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Hard Rule:
                    </span>
                    <p className="text-[11px] leading-relaxed">{m.hard_rule}</p>
                  </div>

                  {/* Quality Metric KPI Box */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Quality Metric</div>
                      <div className="text-white font-bold">{m.quality_metric.metric_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-extrabold text-sm">{m.quality_metric.current_value}</div>
                      <div className="text-[10px] text-slate-400">Target: {m.quality_metric.target_sla}</div>
                    </div>
                  </div>

                  {/* Evidence Sources & Capabilities */}
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-300 font-semibold">Evidence Sources: </span>
                      {m.evidence_sources.map(s => <code key={s} className="text-cyan-300 mr-1.5">{s}</code>)}
                    </div>
                    <div>
                      <span className="text-slate-300 font-semibold">Degraded Mode: </span>
                      <code className="text-amber-300">{m.degraded_mode}</code>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Owner: {m.owner}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAgentForManifest(m)}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
                    >
                      View Manifest
                    </button>
                    <button
                      onClick={() => handleCopyManifest(m)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-all"
                    >
                      {copiedManifestId === m.agent_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedManifestId === m.agent_id ? 'Copied YAML' : 'Copy YAML'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 2: Intake & Intent Simulator (4.1.1) */}
      {activeSubTab === 'intake_sim' && (
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-5 font-mono text-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Section 4.1.1 Intake & Intent Simulator
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              <span className="text-cyan-300 font-bold">Hard Rule:</span> "If classification confidence is below threshold (&lt; 0.80), it asks. It never guesses. Bad intake is the number-one killer of these systems."
            </p>
          </div>

          <form onSubmit={handleTestIntake} className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Try preset signals:</span>
              <button
                type="button"
                onClick={() => setIntakeInput('help, broken bug in payment flow')}
                className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
              >
                Vague Signal (Will Ask)
              </button>
              <button
                type="button"
                onClick={() => setIntakeInput('payment-gateway throwing 504 on ApplePay token verification with 310ms latency')}
                className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 hover:bg-slate-700"
              >
                Specific Signal (Conf &gt; 90%)
              </button>
            </div>

            <textarea
              rows={3}
              value={intakeInput}
              onChange={(e) => setIntakeInput(e.target.value)}
              placeholder="Paste raw inbound signal from Slack, Jira, or alert..."
              className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 text-slate-200 focus:border-cyan-500 outline-none leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={evaluatingIntake}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-glow-cyan transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
                <span>{evaluatingIntake ? 'Evaluating...' : 'Test Intake Normalizer'}</span>
              </button>
            </div>
          </form>

          {/* Intake Evaluation Result */}
          {intakeResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              intakeResult.requires_clarification
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-emerald-500/40 bg-emerald-950/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">
                  {intakeResult.requires_clarification ? 'Confidence Below Threshold — Interrogation Initiated' : 'Work Object Normalized'}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  intakeResult.confidence_score >= 0.8 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  Confidence: {Math.round(intakeResult.confidence_score * 100)}%
                </span>
              </div>

              {intakeResult.requires_clarification ? (
                <div className="space-y-2 text-amber-200">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {intakeResult.clarification_question}
                  </div>
                  <div className="space-y-1 pl-4">
                    {intakeResult.clarification_options?.map((opt, oIdx) => (
                      <div key={oIdx} className="text-slate-300 text-[11px]">• {opt}</div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                    Downstream Reclassification Rate: <span className="text-white font-bold">{intakeResult.reclassification_rate_pct}%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-emerald-200 text-xs">
                  <div>Work Object ID: <code className="text-white font-bold">{intakeResult.work_object_id}</code></div>
                  <div>Intent Class: <span className="text-cyan-300">{intakeResult.intent_class}</span> • Risk Tier: <span className="text-white">{intakeResult.risk_tier}</span></div>
                  <div>Affected Services: <span className="text-white">{intakeResult.affected_services.join(', ')}</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Reliability Learning Loop (4.1.7) */}
      {activeSubTab === 'learning_loop' && (
        <div className="glass-card p-6 rounded-2xl border border-pink-500/30 space-y-5 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <RefreshCw className="w-4 h-4 text-pink-400" />
                Section 4.1.7 Reliability Sentinel: Closes the Learning Loop
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                <span className="text-pink-300 font-bold">Hard Rule:</span> "This agent closes the loop. Without it the system learns nothing from production. Proposed new rules pushed back into the standards catalog when a failure pattern recurs."
              </p>
            </div>

            <button
              onClick={handleTriggerLearningLoop}
              disabled={closingLoop}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold shadow-glow-violet transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${closingLoop ? 'animate-spin' : ''}`} />
              <span>{closingLoop ? 'Closing Loop...' : 'Trigger Learning Loop on Incident #4412'}</span>
            </button>
          </div>

          {learningLoopResult ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1c0d1e] to-[#121c27] border border-pink-500/40 space-y-3">
              <div className="flex items-center justify-between text-pink-300">
                <span className="font-bold text-sm">Learning Loop Closed: New Architecture Rule Adopted</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {learningLoopResult.status}
                </span>
              </div>

              <div className="text-slate-300 text-xs">
                Incident Ref: <span className="text-white font-bold">{learningLoopResult.incident_id}</span> ({learningLoopResult.service}) • Recurrence Count: <span className="text-amber-400 font-bold">{learningLoopResult.failure_pattern_recurrence_count} occurrences</span>
              </div>

              <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                <div className="text-cyan-300 font-bold">Adopted Rule: [{learningLoopResult.proposed_new_rule_code}] {learningLoopResult.proposed_new_rule_title}</div>
                <div className="text-slate-300">{learningLoopResult.proposed_rule_description}</div>
                <div className="text-slate-500 text-[10px]">Spec Ref: {learningLoopResult.golden_path_ref}</div>
              </div>

              <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Rule successfully merged into Standards Catalog. Future PRs and deployments will evaluate this check at merge.</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 glass-card rounded-xl border border-white/5">
              Click the button above to simulate how the Reliability Agent synthesizes a recurring incident pattern into an RCA and adopts an enforceable standard into the ADR catalog.
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Evidence Service Explorer (4.2) */}
      {activeSubTab === 'evidence_svc' && (
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-4 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Database className="w-4 h-4 text-emerald-400" />
                Section 4.2 Evidence Service (Shared Retrieval Layer)
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                A retrieval layer with scoped query access to logs, metrics, repos, tickets, and documents. Every agent claim references an evidence ID returned by this service.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Filter:</span>
              <select
                value={selectedSourceType}
                onChange={(e) => setSelectedSourceType(e.target.value)}
                className="bg-[#07090e] border border-white/10 rounded-lg px-2.5 py-1 text-slate-200 outline-none"
              >
                <option value="ALL">All Sources</option>
                <option value="REPOS">Repos (Git)</option>
                <option value="TICKETS">Tickets (Jira)</option>
                <option value="LOGS">Logs (Jenkins/CI)</option>
                <option value="METRICS">Metrics (Datadog)</option>
                <option value="DOCUMENTS">Documents (ADR)</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search evidence by ID, keyword, or URI (e.g. 'ev-git-402', 'pkce', 'starvation')..."
              value={evidenceQuery}
              onChange={(e) => setEvidenceQuery(e.target.value)}
              className="w-full bg-[#07090e] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Evidence Items List */}
          <div className="space-y-3">
            {filteredEvidence.map((ev) => (
              <div
                key={ev.evidence_id}
                className="p-4 rounded-xl bg-[#091216] border border-emerald-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {ev.evidence_id}
                    </span>
                    <span className="text-white font-semibold">{ev.system} ({ev.source_type})</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{ev.captured_at}</span>
                </div>

                <div className="text-slate-200 font-semibold">{ev.summary}</div>
                <div className="text-slate-400 text-[11px]">URI: <code className="text-cyan-300">{ev.uri}</code></div>

                {/* Raw Payload Preview */}
                <pre className="p-2.5 rounded bg-black/50 text-[10px] text-slate-300 overflow-x-auto border border-white/5 leading-relaxed">
                  {ev.raw_payload}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manifest Modal Viewer */}
      {selectedAgentForManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl glass-card rounded-2xl border border-cyan-500/30 p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans">{selectedAgentForManifest.name}</h3>
                <div className="text-slate-400 text-[11px]">Section 4.3 Registered Manifest Spec</div>
              </div>
              <button
                onClick={() => setSelectedAgentForManifest(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#07090e] border border-white/10 text-cyan-300 overflow-y-auto max-h-[60vh] leading-relaxed text-[11px]">
{`agent_id: ${selectedAgentForManifest.agent_id}
version: ${selectedAgentForManifest.version}
capabilities:
${selectedAgentForManifest.capabilities.map(c => `  - ${c}`).join('\n')}
inputs_schema: ${selectedAgentForManifest.inputs_schema}
outputs_schema: ${selectedAgentForManifest.outputs_schema}
required_tools: [${selectedAgentForManifest.required_tools.join(', ')}]
evidence_sources: [${selectedAgentForManifest.evidence_sources.join(', ')}]
cost_profile:
  tier: ${selectedAgentForManifest.cost_profile.tier}
  p50_tokens: ${selectedAgentForManifest.cost_profile.p50_tokens}
  p95_latency_ms: ${selectedAgentForManifest.cost_profile.p95_latency_ms}
write_scope: ${selectedAgentForManifest.write_scope}          # none | proposals_only | gated | autonomous
trust_level: ${selectedAgentForManifest.trust_level}      # shadow | advisory | approval_required | autonomous
degraded_mode: ${selectedAgentForManifest.degraded_mode}
owner: ${selectedAgentForManifest.owner}

quality_metric:
  name: "${selectedAgentForManifest.quality_metric.metric_name}"
  current: "${selectedAgentForManifest.quality_metric.current_value}"
  sla: "${selectedAgentForManifest.quality_metric.target_sla}"`}
            </pre>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => handleCopyManifest(selectedAgentForManifest)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy YAML Manifest</span>
              </button>
              <button
                onClick={() => setSelectedAgentForManifest(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
