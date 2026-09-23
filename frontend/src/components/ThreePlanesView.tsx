import React, { useState } from 'react';
import { 
  Layers, ShieldAlert, Cpu, GitFork, ArrowUp, ArrowDown, 
  Sparkles, CheckCircle2, XCircle, Play, DollarSign, Clock, 
  Terminal, ShieldCheck, Database, Radio, Scale, Activity, Lock 
} from 'lucide-react';
import { 
  PlanesOverview, SubstrateData, DAGExecutionPlan, 
  AdjudicationData, AgentProfile 
} from '../types';

interface ThreePlanesViewProps {
  overview: PlanesOverview | null;
  substrate: SubstrateData | null;
  dagPlans: DAGExecutionPlan[];
  adjudication: AdjudicationData | null;
  agents: AgentProfile[];
  onSimulateDAG: () => Promise<void>;
  simulatingDAG: boolean;
  onDecideGate: (gateId: string, verdict: 'GATE_OPENED_PROD' | 'GATE_LOCKED_BLOCKED') => Promise<void>;
  decidingGateId: string | null;
}

export const ThreePlanesView: React.FC<ThreePlanesViewProps> = ({
  overview,
  substrate,
  dagPlans,
  adjudication,
  agents,
  onSimulateDAG,
  simulatingDAG,
  onDecideGate,
  decidingGateId,
}) => {
  const [selectedPlane, setSelectedPlane] = useState<'all' | 'plane3' | 'plane2' | 'plane1' | 'substrate'>('all');
  const [operatorHandle, setOperatorHandle] = useState('Staff Platform Architect');

  if (!overview || !substrate || !adjudication) return null;

  return (
    <div className="space-y-6">
      {/* Blueprint Header Banner */}
      <div className="bg-gradient-to-r from-[#11192e] via-[#1a1233] to-[#0f2229] p-5 rounded-2xl border border-cyan-500/30 shadow-glow-cyan/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                System Topology Blueprint
              </span>
              <span className="text-xs font-mono text-slate-400">
                Core Architectural Layering
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Three Planes Over One Shared Substrate
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl font-mono text-xs leading-relaxed">
              <span className="text-cyan-300 font-bold">Plane 1</span> does the work. <span className="text-violet-300 font-bold">Plane 2</span> decides who does what, when, and how much it may cost. <span className="text-rose-300 font-bold">Plane 3</span> challenges the result and owns the final call on anything consequential. The <span className="text-emerald-300 font-bold">Substrate</span> is shared and boring by design.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={onSimulateDAG}
              disabled={simulatingDAG}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold shadow-glow-violet transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulatingDAG ? 'Executing DAG...' : 'Simulate Plane 2 DAG Run'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 3-Planes Visual Diagram */}
      <div className="space-y-3 font-mono">
        {/* PLANE 3: ADJUDICATION */}
        <div
          onClick={() => setSelectedPlane(selectedPlane === 'plane3' ? 'all' : 'plane3')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedPlane === 'plane3' || selectedPlane === 'all'
              ? 'border-rose-500/50 bg-gradient-to-r from-[#201018] to-[#2a1324] shadow-glow-violet/20'
              : 'border-white/5 bg-[#0e121d] opacity-50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold text-sm">
                P3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    PLANE 3 — ADJUDICATION
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                    Architecture Authority ⇄ Delivery Governor
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Challenge Protocol • ADR Finalization • Waivers • Release Gates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-rose-300">
                {overview.plane_3_adjudication.active_release_gates} Release Gates
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-amber-300">
                {overview.plane_3_adjudication.open_disputes} Escalated Conflicts
              </span>
            </div>
          </div>
        </div>

        {/* Signal Pipe: Plane 3 <-> Plane 2 */}
        <div className="flex items-center justify-center gap-8 text-[11px] text-slate-400 py-1">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            <span>escalation / conflict</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>decision / verdict</span>
          </div>
        </div>

        {/* PLANE 2: ORCHESTRATION */}
        <div
          onClick={() => setSelectedPlane(selectedPlane === 'plane2' ? 'all' : 'plane2')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedPlane === 'plane2' || selectedPlane === 'all'
              ? 'border-violet-500/50 bg-gradient-to-r from-[#17112c] to-[#141d33] shadow-glow-violet/20'
              : 'border-white/5 bg-[#0e121d] opacity-50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center justify-center font-bold text-sm">
                P2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    PLANE 2 — ORCHESTRATION
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold">
                    Supervisory DAG Planner & Arbiter
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Intake Normalizer • Router (policy-first) • Planner (DAG) • Budget Manager • Join & Reconcile • Write Arbiter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-cyan-300">
                {overview.plane_2_orchestration.policy_first_ratio} Policy-First
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-violet-300">
                {dagPlans.length} Active Plans
              </span>
            </div>
          </div>
        </div>

        {/* Signal Pipe: Plane 2 <-> Plane 1 */}
        <div className="flex items-center justify-center gap-8 text-[11px] text-slate-400 py-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            <span>findings & evidence</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-1.5 text-violet-400 font-bold">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>tasks & budget caps</span>
          </div>
        </div>

        {/* PLANE 1: EXECUTION */}
        <div
          onClick={() => setSelectedPlane(selectedPlane === 'plane1' ? 'all' : 'plane1')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedPlane === 'plane1' || selectedPlane === 'all'
              ? 'border-cyan-500/50 bg-gradient-to-r from-[#0d1c2a] to-[#12232b] shadow-glow-cyan/20'
              : 'border-white/5 bg-[#0e121d] opacity-50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
                P1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    PLANE 1 — EXECUTION (Specialist Agents)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                    8 Narrow Domain Workers
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Intake&Intent • ArchConformance • FlowAnalyst • Dependency • Build&Release • CodeReview • Reliability • Change&Comms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-cyan-300">
                8 Registered Specialists
              </span>
            </div>
          </div>
        </div>

        {/* Signal Pipe: Plane 1 <-> Substrate */}
        <div className="flex items-center justify-center gap-8 text-[11px] text-slate-400 py-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            <span>events / memory reads</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>mcp tool calls / evidence logs</span>
          </div>
        </div>

        {/* SUBSTRATE */}
        <div
          onClick={() => setSelectedPlane(selectedPlane === 'substrate' ? 'all' : 'substrate')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedPlane === 'substrate' || selectedPlane === 'all'
              ? 'border-emerald-500/50 bg-gradient-to-r from-[#0d211a] to-[#122920] shadow-glow-neon/20'
              : 'border-white/5 bg-[#0e121d] opacity-50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
                SUB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    SHARED SUBSTRATE
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Shared and Boring by Design
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Event Bus • Work Object Store • Evidence Service • Memory • Tool/MCP Layer • Model Gateway • Identity • Audit Log
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-emerald-300">
                {overview.substrate.event_bus_messages} Bus Msgs
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-cyan-300">
                {overview.substrate.evidence_pointers_verified} Verified Pointers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Interactive Section Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Left Column: Plane 3 Release Gate Adjudication Board */}
        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-400" />
              Plane 3: Release Gates Adjudication
            </h4>
            <span className="text-[11px] text-slate-400">
              Authority ⇄ Governor
            </span>
          </div>

          <p className="text-slate-300 text-xs">
            Plane 3 owns the final call on consequential releases. Inspect peer votes between the Architecture Authority and Delivery Governor, and commit the official verdict.
          </p>

          <div className="space-y-4">
            {adjudication.release_gates.map((gate) => {
              const isDecided = gate.final_verdict !== 'PENDING_DELIBERATION';
              return (
                <div
                  key={gate.gate_id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    gate.final_verdict === 'GATE_OPENED_PROD'
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : gate.final_verdict === 'GATE_LOCKED_BLOCKED'
                      ? 'border-rose-500/30 bg-rose-950/10'
                      : 'border-amber-500/30 bg-[#0e1424]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">
                        {gate.service_name} ({gate.release_version})
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Window: {gate.scheduled_window}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      gate.final_verdict === 'GATE_OPENED_PROD'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : gate.final_verdict === 'GATE_LOCKED_BLOCKED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {gate.final_verdict}
                    </span>
                  </div>

                  {/* Dual Peer Votes */}
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-300 font-semibold">Arch Authority</span>
                        <span className={`font-bold ${gate.architecture_authority_vote === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gate.architecture_authority_vote}
                        </span>
                      </div>
                      <div className="text-slate-400 leading-tight">
                        {gate.architecture_authority_rationale}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-semibold">Delivery Governor</span>
                        <span className={`font-bold ${gate.delivery_governor_vote === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gate.delivery_governor_vote}
                        </span>
                      </div>
                      <div className="text-slate-400 leading-tight">
                        {gate.delivery_governor_rationale}
                      </div>
                    </div>
                  </div>

                  {/* Action or Decision Stamp */}
                  {!isDecided ? (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-slate-400 text-[11px]">Human Sovereign Adjudication:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDecideGate(gate.gate_id, 'GATE_LOCKED_BLOCKED')}
                          disabled={decidingGateId === gate.gate_id}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-50"
                        >
                          Lock & Block
                        </button>
                        <button
                          onClick={() => onDecideGate(gate.gate_id, 'GATE_OPENED_PROD')}
                          disabled={decidingGateId === gate.gate_id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                        >
                          Approve Release
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Adjudicated by: <span className="text-white font-bold">{gate.verdict_operator}</span></span>
                      <span className="text-emerald-400 font-semibold">Audit Stamp Committed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Plane 2 DAG Execution Planner */}
        <div className="glass-card p-5 rounded-2xl border border-violet-500/30 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GitFork className="w-4 h-4 text-violet-400" />
              Plane 2: DAG Task Planner & Budget Manager
            </h4>
            <span className="text-[11px] text-slate-400">
              Who does what & Cost
            </span>
          </div>

          <p className="text-slate-300 text-xs">
            Plane 2 constructs directed acyclic task graphs, enforces latency and cost budgets, executes parallel fan-outs to Plane 1 specialists, and reconciles at the Join.
          </p>

          <div className="space-y-4">
            {dagPlans.map((plan) => (
              <div
                key={plan.plan_id}
                className="p-4 rounded-xl bg-[#0d1222] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{plan.plan_id}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      Budget: ${plan.budget_used_usd.toFixed(2)} / ${plan.budget_allocated_usd.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                      {plan.latency_used_ms}ms / {plan.latency_budget_ms}ms
                    </span>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px]">
                  Trigger: <span className="text-cyan-300">{plan.trigger_event}</span>
                </div>

                {/* Node Graph Step-by-Step */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {plan.nodes.map((node, nIdx) => (
                    <div
                      key={node.node_id}
                      className="p-2.5 rounded-lg bg-[#070a14] border border-white/5 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-[10px]">
                          {nIdx + 1}
                        </span>
                        <div>
                          <div className="text-white font-semibold">{node.name}</div>
                          <div className="text-slate-500 text-[10px]">
                            Assigned: <span className="text-cyan-400">{node.assigned_specialist}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono text-[10px]">{node.duration_ms}ms</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Substrate Deep Dive Drawer / Grid */}
      <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Shared Substrate Services (Event Bus, Evidence Store, Model Gateway)
          </h4>
          <span className="text-[11px] text-emerald-400 font-bold">
            100% Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#091511] border border-emerald-500/20 space-y-1.5">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Event Bus Router
            </div>
            <div className="text-slate-300 text-[11px]">
              Active Topics: <code className="text-cyan-300">work.intake</code>, <code className="text-cyan-300">findings</code>, <code className="text-cyan-300">conflicts</code>
            </div>
            <div className="text-slate-400 text-[10px]">
              Total Messages Processed: <span className="text-white font-bold">{substrate.telemetry.event_bus_msg_count}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#091511] border border-emerald-500/20 space-y-1.5">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Evidence Service (Invariant §2)
            </div>
            <div className="text-slate-300 text-[11px]">
              Validated Pointers: <span className="text-white font-bold">{substrate.telemetry.evidence_store_pointers} URIs</span>
            </div>
            <div className="text-slate-400 text-[10px]">
              Unsourced Claims Discarded: <span className="text-rose-400 font-bold">{overview.plane_2_orchestration.unsourced_claims_discarded}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#091511] border border-emerald-500/20 space-y-1.5">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Model Gateway (Invariant §4)
            </div>
            <div className="text-slate-300 text-[11px]">
              Policy Bypasses: <span className="text-emerald-400 font-bold">{substrate.telemetry.model_gateway.deterministic_rule_bypasses} (0ms, $0)</span>
            </div>
            <div className="text-slate-400 text-[10px]">
              Inference Cost Saved: <span className="text-cyan-300 font-bold">${substrate.telemetry.model_gateway.estimated_cost_saved_usd.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Live Event Bus Stream */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Live Substrate Event Bus Messages:
          </div>
          <div className="space-y-1.5">
            {substrate.recent_event_bus_messages.map((msg) => (
              <div
                key={msg.message_id}
                className="p-2.5 rounded bg-[#070b12] border border-white/5 flex items-center justify-between text-[11px] text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                    {msg.source_plane}
                  </span>
                  <span className="text-amber-400 font-semibold">{msg.topic}</span>
                  <span className="text-slate-300">• {msg.payload_summary}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
