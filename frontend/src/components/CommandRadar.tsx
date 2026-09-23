import React, { useState } from 'react';
import { 
  TrendingDown, TrendingUp, Clock, Zap, AlertTriangle, ShieldCheck, 
  RotateCcw, Scale, CheckCircle, HelpCircle, Activity, ArrowRight
} from 'lucide-react';
import { MetricsResponse } from '../types';

interface CommandRadarProps {
  metrics: MetricsResponse | null;
}

export const CommandRadar: React.FC<CommandRadarProps> = ({ metrics }) => {
  const [viewMode, setViewMode] = useState<'compare' | 'active' | 'baseline'>('compare');

  if (!metrics) return null;

  const { baseline, active, improvements } = metrics;

  return (
    <div className="space-y-6">
      {/* Header and Baseline Integrity Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1424] to-[#121b2d] p-5 rounded-2xl border border-cyan-500/20 shadow-glow-cyan/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
              Blueprint §1.4 Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Falsifiability Protocol Active
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight flex items-center gap-2">
            Engineering Outcome Radar
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              Outcome Metrics Only
            </span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Measures empirical business outcomes across the IT lifecycle. Agent activity is omitted as a success metric.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#07090e] p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'compare'
                ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Delta Comparison
          </button>
          <button
            onClick={() => setViewMode('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'active'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Q1 Active (Agent)
          </button>
          <button
            onClick={() => setViewMode('baseline')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'baseline'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Q0 Baseline (Pre-Agent)
          </button>
        </div>
      </div>

      {/* Unfalsifiable Baseline Notice Box */}
      <div className="bg-[#111726]/90 border-l-4 border-cyan-400 p-4 rounded-r-xl border border-white/5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-mono">
          <span className="text-cyan-300 font-bold">Baseline Requirement Verified: </span>
          Baseline data was systematically captured for 1 full calendar quarter before any agent initiated an action.
          As stipulated in Blueprint 1.4, this pre-intervention capture guarantees every performance claim is mathematically falsifiable and verifiable against raw IT toolchain logs.
        </div>
      </div>

      {/* 8 Primary Outcome Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Lead Time for Change (Median & p90) */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Lead Time for Change
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              -{improvements.lead_time_median_reduction_pct}% Median
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {viewMode === 'baseline' ? `${baseline.lead_time_median_hours}h` : `${active.lead_time_median_hours}h`}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (p90: {viewMode === 'baseline' ? `${baseline.lead_time_p90_hours}h` : `${active.lead_time_p90_hours}h`})
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Baseline Q0: {baseline.lead_time_median_hours}h</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">Active Q1: {active.lead_time_median_hours}h</span>
          </div>
        </div>

        {/* Metric 2: Deployment Frequency */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Deployment Frequency
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              +{improvements.deployment_frequency_multiplier}x Surge
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 font-mono">
              {viewMode === 'baseline' ? baseline.deployment_frequency_per_week : active.deployment_frequency_per_week}
            </span>
            <span className="text-xs text-slate-400 font-mono">deploys / week</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Baseline: {baseline.deployment_frequency_per_week}/wk</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">Active: {active.deployment_frequency_per_week}/wk</span>
          </div>
        </div>

        {/* Metric 3: Change Failure Rate */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-pink-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-pink-400" />
              Change Failure Rate
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              -{improvements.change_failure_rate_reduction_pct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {viewMode === 'baseline' ? `${baseline.change_failure_rate_percent}%` : `${active.change_failure_rate_percent}%`}
            </span>
            <span className="text-xs text-slate-400 font-mono">incidents / release</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-rose-400">Q0: {baseline.change_failure_rate_percent}%</span>
            <ArrowRight className="w-3 h-3 text-pink-400" />
            <span className="text-emerald-300 font-semibold">Q1: {active.change_failure_rate_percent}%</span>
          </div>
        </div>

        {/* Metric 4: MTTR */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Mean Time to Restore
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              -{improvements.mttr_reduction_pct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {viewMode === 'baseline' ? `${baseline.mttr_hours}h` : `${active.mttr_hours}h`}
            </span>
            <span className="text-xs text-slate-400 font-mono">recovery latency</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Q0: {baseline.mttr_hours}h</span>
            <ArrowRight className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300 font-semibold">Q1: {active.mttr_hours}h</span>
          </div>
        </div>

        {/* Metric 5: Queue Time % of Cycle */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Queue Time % of Cycle
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              -{improvements.queue_time_pct_reduction} pts
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">
              {viewMode === 'baseline' ? `${baseline.queue_time_percent}%` : `${active.queue_time_percent}%`}
            </span>
            <span className="text-xs text-slate-400 font-mono">idle in queue</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-amber-400/80">Q0: {baseline.queue_time_percent}%</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
            <span className="text-emerald-300 font-semibold">Q1: {active.queue_time_percent}%</span>
          </div>
        </div>

        {/* Metric 6: Standards Conformance at Merge */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Conformance at Merge
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              +{improvements.standards_conformance_gain_pct} pts
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-300 font-mono">
              {viewMode === 'baseline' ? `${baseline.standards_conformance_rate_percent}%` : `${active.standards_conformance_rate_percent}%`}
            </span>
            <span className="text-xs text-slate-400 font-mono">gate compliance</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-rose-400">Audit: {baseline.standards_conformance_rate_percent}%</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">Merge: {active.standards_conformance_rate_percent}%</span>
          </div>
        </div>

        {/* Metric 7: Rework Percentage */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              Rework % (Reopened)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              -{improvements.rework_reduction_pct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {viewMode === 'baseline' ? `${baseline.rework_percentage}%` : `${active.rework_percentage}%`}
            </span>
            <span className="text-xs text-slate-400 font-mono">reopened work</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-rose-400">Q0: {baseline.rework_percentage}%</span>
            <ArrowRight className="w-3 h-3 text-rose-400" />
            <span className="text-emerald-300 font-semibold">Q1: {active.rework_percentage}%</span>
          </div>
        </div>

        {/* Metric 8: Mean Waiver Age (Governance Health) */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              Mean Waiver Age
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              -{improvements.mean_waiver_age_reduction_pct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-300 font-mono">
              {viewMode === 'baseline' ? `${baseline.mean_waiver_age_days}d` : `${active.mean_waiver_age_days}d`}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({viewMode === 'baseline' ? baseline.waiver_count : active.waiver_count} active)
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-rose-400">Q0: {baseline.mean_waiver_age_days}d</span>
            <ArrowRight className="w-3 h-3 text-indigo-400" />
            <span className="text-indigo-300 font-semibold">Q1: {active.mean_waiver_age_days}d</span>
          </div>
        </div>
      </div>
    </div>
  );
};
