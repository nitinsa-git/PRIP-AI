import React from 'react';
import { GitBranch, Terminal, Layers, Server, Activity, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SystemsOfRecord } from '../types';

interface ToolchainBarProps {
  systems: SystemsOfRecord | null;
  onSync: () => void;
  syncing: boolean;
}

export const ToolchainBar: React.FC<ToolchainBarProps> = ({ systems, onSync, syncing }) => {
  if (!systems) return null;

  const items = [
    {
      id: 'git',
      name: 'Source Control',
      sub: `${systems.git.active_prs} PRs In-Flight`,
      icon: GitBranch,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      lastSync: systems.git.last_sync,
    },
    {
      id: 'cicd',
      name: 'CI/CD Pipelines',
      sub: `${systems.cicd.active_pipelines} Runs | ${systems.cicd.avg_duration_min}m avg`,
      icon: Terminal,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      lastSync: systems.cicd.last_sync,
    },
    {
      id: 'itsm',
      name: 'ITSM / Jira',
      sub: `${systems.itsm.in_flight_cards} Cards | ${systems.itsm.blocked_tickets} Blocked`,
      icon: Layers,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      lastSync: systems.itsm.last_sync,
    },
    {
      id: 'cmdb',
      name: 'CMDB Topology',
      sub: `${systems.cmdb.registered_services} Svcs | ${systems.cmdb.contention_nodes} Contention`,
      icon: Server,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
      lastSync: systems.cmdb.last_sync,
    },
    {
      id: 'observability',
      name: 'Observability',
      sub: `MTTR ${systems.observability.mttr_trend} | ${systems.observability.p99_latency_ms}ms`,
      icon: Activity,
      color: 'text-pink-400',
      border: 'border-pink-500/20',
      lastSync: systems.observability.last_sync,
    },
    {
      id: 'kb',
      name: 'ADR Knowledge Base',
      sub: `${systems.knowledge_base.adr_rules_active} Rules | ${systems.knowledge_base.golden_paths_indexed} Paths`,
      icon: BookOpen,
      color: 'text-indigo-400',
      border: 'border-indigo-500/20',
      lastSync: systems.knowledge_base.last_sync,
    },
  ];

  return (
    <div className="bg-[#0b101b] border-y border-white/5 py-2.5 px-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            Toolchain Mesh
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.id}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#111726]/80 border ${it.border} text-xs font-mono transition-all hover:bg-[#162035]`}
              >
                <Icon className={`w-3.5 h-3.5 ${it.color}`} />
                <div>
                  <div className="text-[11px] font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                    {it.name}
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">{it.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Scanning...' : 'Sync Mesh'}</span>
        </button>
      </div>
    </div>
  );
};
