import React, { useState } from 'react';
import { X, Plus, FolderGit2, Shield, Award, Terminal, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { CreateProjectPayload, Project } from '../types';

interface ProjectOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const ProjectOnboardingModal: React.FC<ProjectOnboardingModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tier, setTier] = useState('Tier-2 Platform');
  const [techStack, setTechStack] = useState('Python, FastAPI, PostgreSQL, Redis');
  const [autonomyRung, setAutonomyRung] = useState<'Shadow' | 'Advisory' | 'Approval-required' | 'Autonomous'>('Shadow');
  const [writeScope, setWriteScope] = useState('proposals_only');
  const [goldenSetPath, setGoldenSetPath] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId.trim() || !name.trim()) {
      setError('Project ID and Project Name are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateProjectPayload = {
      project_id: projectId.trim().toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      repo_url: repoUrl.trim() || `git@github.internal:fintech/${projectId.trim().toLowerCase()}.git`,
      tier,
      tech_stack: techStack.split(',').map(s => s.trim()).filter(Boolean),
      autonomy_rung: autonomyRung,
      write_scope: writeScope,
      golden_set_path: goldenSetPath.trim() || `evals/golden/${projectId.trim().toLowerCase()}_suite.json`,
      description: description.trim() || `Service ${name.trim()} onboarded to PRIP-AI reasoning layer.`
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to register project');
      }

      const newProject: Project = await res.json();
      onProjectCreated(newProject);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090d18] border border-cyan-500/40 p-6 md:p-8 shadow-glow-cyan text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Onboard New Project</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Multi-Tenant
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Register Git repository, declare autonomy rung, and bind execution specialists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">
                PROJECT IDENTIFIER (SLUG) <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. payments-v2"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                DISPLAY NAME <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Payments Settlement Engine"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">GIT REPOSITORY URL (MCP TARGET)</label>
            <input
              type="text"
              placeholder="e.g. git@github.internal:fintech/payments-v2.git"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">SERVICE TIER / RISK BOUNDARY</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all"
              >
                <option value="Tier-1 Core (PCI-DSS)">Tier-1 Core (PCI-DSS Scoped)</option>
                <option value="Tier-1 Perimeter">Tier-1 Perimeter (SecOps Scoped)</option>
                <option value="Tier-2 Platform">Tier-2 Platform Service</option>
                <option value="Tier-3 Internal">Tier-3 Internal Tooling</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">AUTONOMY RUNG (CHANT #8)</label>
              <select
                value={autonomyRung}
                onChange={(e) => setAutonomyRung(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all"
              >
                <option value="Shadow">Shadow (Scores itself, zero write action)</option>
                <option value="Advisory">Advisory (Shown to humans as suggestions)</option>
                <option value="Approval-required">Approval-required (Proposes actions, human sign-off)</option>
                <option value="Autonomous">Autonomous (Declared write scope action)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">TECH STACK (COMMA-SEPARATED)</label>
              <input
                type="text"
                placeholder="Python, FastAPI, Kafka, Redis"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">WRITE SCOPE PERMISSION</label>
              <select
                value={writeScope}
                onChange={(e) => setWriteScope(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all"
              >
                <option value="proposals_only">Proposals Only (Read-Only)</option>
                <option value="branch_protection_gated">Branch Protection Gated</option>
                <option value="strict_dual_signoff">Strict Dual-Signoff</option>
                <option value="autonomous_play_scoped">Autonomous Play-Scoped</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">GOLDEN TEST HARNESS PATH (§13.6)</label>
            <input
              type="text"
              placeholder="e.g. evals/golden/payments_suite.json"
              value={goldenSetPath}
              onChange={(e) => setGoldenSetPath(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">PROJECT DESCRIPTION & MISSION</label>
            <textarea
              rows={2}
              placeholder="Core transactional settlement engine handling checkout events..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>{submitting ? 'Registering...' : 'Register Project into Mesh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
