import React, { useState } from 'react';
import { 
  Bot, Cpu, Sparkles, Activity, ShieldCheck, 
  Workflow, GitMerge, CheckCircle2, Eye, Terminal 
} from 'lucide-react';
import { AgentProfile } from '../types';

interface AgentOrchestratorProps {
  agents: AgentProfile[];
}

export const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ agents }) => {
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('all');

  const focusAreaFilters = [
    { id: 'all', label: 'All 6 Owning Agents' },
    { id: '1', label: 'Focus 1: Optimizing Workflows' },
    { id: '2', label: 'Focus 2: Eliminating Bottlenecks' },
    { id: '3', label: 'Focus 3: Architecture Conformance' },
    { id: '4', label: 'Focus 4: Speedy Delivery & Reliability' },
  ];

  const filteredAgents = agents.filter((ag) => {
    if (selectedFocusArea === 'all') return true;
    return ag.focus_area.includes(selectedFocusArea);
  });

  return (
    <div className="space-y-6">
      {/* Blueprint 1.3 Introduction Banner */}
      <div className="bg-gradient-to-r from-[#0d1627] to-[#1e1333] p-5 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
            Blueprint §1.3 Focus Areas
          </span>
          <span className="text-xs font-mono text-slate-400">
            Coordinated Multi-Agent Topology
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Autonomous Owning Agents
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Judgment Over Systems of Record
          </span>
        </h3>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Six specialized agents mapped directly to the four blueprint business drivers.
          They do not replace IT tools or act as a chatbot — they maintain continuous reasoning over the delivery lifecycle.
        </p>
      </div>

      {/* Focus Area Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {focusAreaFilters.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFocusArea(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              selectedFocusArea === tab.id
                ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((ag) => (
          <div
            key={ag.id}
            className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Agent Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {ag.name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      {ag.role_description}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  ag.status === 'CHALLENGING'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : ag.status === 'ANALYZING'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {ag.status}
                </span>
              </div>

              {/* Focus Area Pill */}
              <div className="px-2.5 py-1 rounded-lg bg-[#090e1a] border border-white/5 text-[11px] font-mono text-violet-300">
                Focus: <span className="text-slate-200">{ag.focus_area}</span>
              </div>

              {/* Business Driver Objective */}
              <div className="text-xs text-slate-300 font-mono leading-relaxed">
                <span className="text-emerald-400 font-bold">Objective: </span>
                {ag.business_driver_objective}
              </div>

              {/* Current Active Thought Stream */}
              <div className="p-3 rounded-xl bg-[#080d16] border border-cyan-500/20 text-xs font-mono space-y-1">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Terminal className="w-3 h-3 animate-pulse" />
                  Current Reasoning Trace:
                </div>
                <div className="text-slate-200 text-[11px] leading-relaxed">
                  "{ag.current_thought}"
                </div>
              </div>

              {/* Recent Insights */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Recent Correlated Insights:
                </div>
                {ag.recent_insights.map((ins, iIdx) => (
                  <div
                    key={iIdx}
                    className="text-[11px] font-mono text-slate-300 flex items-start gap-1.5"
                  >
                    <span className="text-cyan-400 shrink-0">•</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence & Telemetry Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Inference Confidence</span>
              <span className="text-cyan-300 font-bold font-mono">
                {Math.round(ag.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
