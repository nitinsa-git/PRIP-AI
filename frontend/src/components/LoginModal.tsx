import React, { useState } from 'react';
import { 
  Lock, KeyRound, Shield, AlertCircle, CheckCircle2, 
  X, Sparkles, Building2, UserCheck, ArrowRight, ShieldCheck,
  ChevronRight, BadgeCheck
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  currentUser: UserAccount | null;
}

interface PersonaQuickPick {
  name: string;
  email: string;
  title: string;
  dept: string;
  appRoleBadge: string;
  badgeColor: string;
  avatar: string;
  description: string;
}

const QUICK_PERSONAS: PersonaQuickPick[] = [
  {
    name: 'Sarah Chen',
    email: 'sarah.admin@corp.internal',
    title: 'Platform Systems Administrator',
    dept: 'Platform Operations',
    appRoleBadge: 'SUPER_ADMIN',
    badgeColor: 'border-red-500/50 bg-red-950/40 text-red-300',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    description: 'Full sovereign mesh access: RBAC mapping, user directory, write arbiter overrides.'
  },
  {
    name: 'Elena Rostova',
    email: 'elena.ciso@corp.internal',
    title: 'Chief Information Security Officer (CISO)',
    dept: 'SecOps & Compliance',
    appRoleBadge: 'SECURITY_LEAD',
    badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    description: 'Enclosure boundaries, cryptographic key vaults, and immutable audit forensics.'
  },
  {
    name: 'David Ross',
    email: 'david.arch@corp.internal',
    title: 'Principal Enterprise Architect',
    dept: 'Architecture Office',
    appRoleBadge: 'ARCH_GOVERNOR',
    badgeColor: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'ADR-001 decoupling rules, architectural waivers, and project onboarding.'
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.sre@corp.internal',
    title: 'Lead Site Reliability Engineer (SRE)',
    dept: 'Reliability & Infra',
    appRoleBadge: 'SRE_OPERATOR',
    badgeColor: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    description: 'Pipeline execution, chaos failure simulation, circuit breaker trips & health restoration.'
  },
  {
    name: 'Jordan Taylor',
    email: 'jordan.delivery@corp.internal',
    title: 'Release & Delivery Governor',
    dept: 'Delivery Office',
    appRoleBadge: 'RELEASE_MANAGER',
    badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    description: 'Stage 3 production gate verdicts, release promotion approvals, and golden tests.'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.dev@corp.internal',
    title: 'Senior Full-Stack Developer',
    dept: 'Product Engineering',
    appRoleBadge: 'SQUAD_DEV',
    badgeColor: 'border-blue-500/50 bg-blue-950/40 text-blue-300',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    description: 'PR conformance evaluations, golden regression test suite execution.'
  },
  {
    name: 'Arthur Pendelton',
    email: 'arthur.auditor@corp.internal',
    title: 'Compliance & PCI Auditor',
    dept: 'Internal Audit',
    appRoleBadge: 'AUDIT_COMPLIANCE',
    badgeColor: 'border-purple-500/50 bg-purple-950/40 text-purple-300',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    description: 'Read-only immutable 6-tuple audit ledger, evidence cryptohash verification.'
  }
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) => {
  const [email, setEmail] = useState('sarah.admin@corp.internal');
  const [password, setPassword] = useState('PripAi2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personas' | 'credentials'>('personas');

  if (!isOpen) return null;

  const handleLogin = async (loginEmail: string, loginPass: string = 'PripAi2026!') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Authentication failed. Please verify credentials.');
      }
      const data = await res.json();
      localStorage.setItem('prip_auth_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Enterprise RBAC Authentication</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Zero Trust FedRAMP-High
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Role-Based Access Control mapped directly to IT Company Executive & Engineering Org Structures
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('personas')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'personas'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Quick Corporate Personas ({QUICK_PERSONAS.length})
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Corporate SSO / Password Sign-In
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl flex items-center gap-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'personas' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="flex items-center gap-2 text-indigo-300 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instant Persona Switching
                </span>
                <span>Select any corporate IT role below to experience live RBAC permission scoping:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_PERSONAS.map(p => {
                  const isCurrent = currentUser?.email.toLowerCase() === p.email.toLowerCase();
                  return (
                    <div
                      key={p.email}
                      onClick={() => !loading && handleLogin(p.email)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                              {p.name}
                            </h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold shrink-0 ${p.badgeColor}`}>
                              {p.appRoleBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium truncate">{p.title}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {p.dept}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Session
                          </span>
                        ) : (
                          <span className="text-slate-400 group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                            Switch Persona <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">{p.email}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form 
              onSubmit={e => {
                e.preventDefault();
                handleLogin(email, password);
              }}
              className="max-w-md mx-auto space-y-5 py-4"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">IT Enterprise Directory Login</h3>
                <p className="text-xs text-slate-400 mt-1">Authenticate using your corporate Okta/Azure AD credentials</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name.role@corp.internal"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Directory Password
                  </label>
                  <span className="text-[11px] text-slate-400">Default: PripAi2026!</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Mesh</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Role Architectural Invariant #10 (Authentication & Token Attestation) active.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
