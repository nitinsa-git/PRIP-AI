import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Swords,
  Layers,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  UserCheck,
  Calendar,
  Lock,
  MessageSquare,
  Flame,
  FileText
} from 'lucide-react';
import {
  SuperAuthorityProfile,
  ChallengeProtocolSession,
  EscalationPacket,
  WaiverRecord6
} from '../types';

export const SuperAgentsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'authorities' | 'protocol' | 'escalation' | 'waivers'>('protocol');
  const [authorities, setAuthorities] = useState<SuperAuthorityProfile[]>([]);
  const [sessions, setSessions] = useState<ChallengeProtocolSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('CP-2026-092');
  const [waivers, setWaivers] = useState<WaiverRecord6[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stepper action loading
  const [stepping, setStepping] = useState<boolean>(false);

  // New Proposal Modal
  const [isProposeModalOpen, setIsProposeModalOpen] = useState<boolean>(false);
  const [propTitle, setPropTitle] = useState<string>('Bypass Kafka Queue via Direct REST Ingress');
  const [propService, setPropService] = useState<string>('checkout-service');
  const [propRisk, setPropRisk] = useState<string>('T1');
  const [propAgent, setPropAgent] = useState<string>('Dependency & Impact Agent');
  const [propRec, setPropRec] = useState<string>('Direct REST call from checkout to inventory to bypass 200ms Kafka lag during flash sale.');
  const [propConf, setPropConf] = useState<number>(0.79);

  // New Waiver Modal
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState<boolean>(false);
  const [wvrRule, setWvrRule] = useState<string>('std.data.encryption_at_rest.v3');
  const [wvrService, setWvrService] = useState<string>('payments-api');
  const [wvrReason, setWvrReason] = useState<string>('Vendor KMS integration blocked until Q1; compensating control in place.');
  const [wvrControl, setWvrControl] = useState<string>('Network isolation + short-lived credentials, reviewed weekly.');
  const [wvrOwner, setWvrOwner] = useState<string>('Head of Payments Engineering');
  const [wvrExpires, setWvrExpires] = useState<string>('2027-01-31');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [authRes, sessRes, wvrRes] = await Promise.all([
        fetch('/api/super-agents/authorities').then(r => r.json()),
        fetch('/api/challenge-protocol/sessions').then(r => r.json()),
        fetch('/api/waivers-v6').then(r => r.json())
      ]);
      setAuthorities(authRes);
      setSessions(sessRes);
      setWaivers(wvrRes);
    } catch (err) {
      console.error('Failed to load Section 6 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedSession = sessions.find(s => s.session_id === selectedSessionId) || sessions[0];

  const handleAdvanceStep = async (action: string, payload: any = {}) => {
    if (!selectedSession) return;
    setStepping(true);
    try {
      const res = await fetch(`/api/challenge-protocol/sessions/${selectedSession.session_id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Challenge step executed: Phase is now ${data.current_phase}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStepping(false);
    }
  };

  const handleProposeNew = async () => {
    try {
      const res = await fetch('/api/challenge-protocol/sessions/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: propTitle,
          target_service: propService,
          risk_tier: propRisk,
          proposed_by: propAgent,
          recommendation: propRec,
          confidence: parseFloat(propConf.toString())
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`New Challenge Protocol session initiated: ${data.session_id}`);
        setSelectedSessionId(data.session_id);
        setIsProposeModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckExpirations = async () => {
    try {
      const res = await fetch('/api/waivers-v6/check-expirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Expiry Sentinel scanned: ${data.expired_waivers_count} expired waiver(s). Active findings auto-raised!`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWaiverV6 = async () => {
    try {
      const res = await fetch('/api/waivers-v6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule: wvrRule,
          granted_to: wvrService,
          reason: wvrReason,
          compensating_control: wvrControl,
          risk_accepted_by: wvrOwner,
          expires: wvrExpires,
          review_cadence: 'monthly'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Section 6.3 Waiver created: ${data.waiver_id}`);
        setIsWaiverModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-10 h-10 text-rose-400 animate-spin" />
        <p className="text-gray-400 font-mono text-sm">Synchronizing Super Agents & Challenge Protocol (§6)...</p>
      </div>
    );
  }

  const phaseOrder = ['PROPOSE', 'CHALLENGE', 'DEFEND', 'DECIDE', 'RECORD'];
  const currentPhaseIndex = selectedSession
    ? selectedSession.current_phase === 'ESCALATED_TO_HUMAN'
      ? 3
      : phaseOrder.indexOf(selectedSession.current_phase)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-rose-950 to-indigo-950 border border-rose-400 text-rose-200 px-5 py-3 rounded-xl shadow-2xl shadow-rose-950/80 flex items-center space-x-3 text-sm animate-bounce font-medium">
          <Sparkles className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-rose-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                PLANE 3 · SECTION 6
              </span>
              <span className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>The Tension Between Two Authorities is a Feature</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Super Agents & The Challenge Protocol
              <Swords className="w-7 h-7 text-rose-400" />
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
              <strong className="text-rose-300">Architecture Authority</strong> (adversarial by design) attacks specialist recommendations with 10x stress tests. <strong className="text-cyan-300">Delivery Governor</strong> arbitrates speed versus safety. The 5-Phase Challenge Protocol logs every step and preserves verbatim dissent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsProposeModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600/30 to-indigo-600/30 hover:from-rose-600/40 hover:to-indigo-600/40 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-rose-950/40"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Propose New Challenge</span>
            </button>
            <button
              onClick={handleCheckExpirations}
              className="px-3.5 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Scan Expiry Sentinel</span>
            </button>
          </div>
        </div>

        {/* Invariant Highlights Bar */}
        <div className="mt-6 pt-5 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Section 6.1 Principle:</span>
            <span className="text-rose-400 font-semibold">Never merge AA & DG into one agent</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Section 6.2 Escalation:</span>
            <span className="text-amber-400 font-semibold">Mandatory on deadlock / T1 low conf</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Chant #11 Enforcement:</span>
            <span className="text-cyan-400 font-semibold">Dissent recorded verbatim (never blurred)</span>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 block text-[11px]">Section 6.3 Waivers:</span>
            <span className="text-emerald-400 font-semibold">Expired waivers auto-raise findings</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-800/80 space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'protocol', label: '5-Phase Challenge Protocol (§6.2)', icon: Swords },
          { key: 'authorities', label: 'The Two Authorities Arena (§6.1)', icon: Scale },
          { key: 'escalation', label: 'Side-by-Side Escalations (Chant #11)', icon: AlertTriangle },
          { key: 'waivers', label: 'Section 6.3 Waiver Registry & Expiry', icon: FileCode }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-950/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 5-PHASE CHALLENGE PROTOCOL (§6.2) */}
      {activeTab === 'protocol' && selectedSession && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Session Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300">
                Protocol Sessions ({sessions.length})
              </h3>
              <button
                onClick={() => setIsProposeModalOpen(true)}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300"
              >
                + Propose New
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map(sess => {
                const isSelected = sess.session_id === selectedSession.session_id;
                const isEscalated = sess.current_phase === 'ESCALATED_TO_HUMAN';

                return (
                  <div
                    key={sess.session_id}
                    onClick={() => setSelectedSessionId(sess.session_id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-gray-900 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30'
                        : 'border-gray-800 bg-gray-950 hover:border-gray-700 hover:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {sess.session_id}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isEscalated
                          ? 'border-rose-500/50 bg-rose-950/40 text-rose-300 animate-pulse font-bold'
                          : 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300'
                      }`}>
                        {sess.current_phase}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-200 line-clamp-1 mb-2">
                      {sess.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>Service: <span className="text-cyan-300 font-bold">{sess.target_service}</span></span>
                      <span>Tier: <span className="text-amber-300 font-bold">{sess.risk_tier}</span></span>
                      <span>Conf: <span className="text-emerald-300">{(sess.confidence * 100).toFixed(0)}%</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Protocol Stepper Cockpit (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-2xl space-y-6">
              {/* Session Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedSession.session_id}</h2>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/30">
                      Tier {selectedSession.risk_tier}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      Target: {selectedSession.target_service}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-300">{selectedSession.title}</h3>
                </div>

                <div className="text-xs font-mono text-gray-400">
                  Proposed by: <span className="text-cyan-400 font-bold">{selectedSession.proposed_by}</span> (Conf: {(selectedSession.confidence * 100).toFixed(0)}%)
                </div>
              </div>

              {/* 5-Phase Interactive Visual Stepper */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Protocol Phases (Section 6.2 Lifecycle)
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {phaseOrder.map((ph, idx) => {
                    const isDone = currentPhaseIndex > idx;
                    const isCurrent = currentPhaseIndex === idx;
                    const isEscalated = selectedSession.current_phase === 'ESCALATED_TO_HUMAN' && ph === 'DECIDE';

                    return (
                      <div
                        key={ph}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isEscalated
                            ? 'border-rose-500 bg-rose-950/40 text-rose-200 animate-pulse'
                            : isCurrent
                            ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 shadow-lg shadow-cyan-950/40'
                            : isDone
                            ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                            : 'border-gray-800 bg-gray-950/60 text-gray-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold mb-1">
                          PHASE {idx + 1}
                        </div>
                        <div className="text-xs font-bold font-mono">
                          {isEscalated ? 'ESCALATED' : ph}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Steps Timeline (All Logged) */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300">
                  Logged Argumentation Trail ({selectedSession.steps.length} Steps)
                </h4>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedSession.steps.map((st, i) => {
                    const isAA = st.actor.includes('Architecture Authority');
                    const isDG = st.actor.includes('Delivery Governor');

                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border space-y-1.5 ${
                          isAA
                            ? 'border-rose-500/40 bg-rose-950/20'
                            : isDG
                            ? 'border-cyan-500/40 bg-cyan-950/20'
                            : 'border-gray-800 bg-gray-950'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAA ? 'bg-rose-500/30 text-rose-300' : isDG ? 'bg-cyan-500/30 text-cyan-300' : 'bg-gray-800 text-gray-300'
                            }`}>
                              {st.phase}
                            </span>
                            <span className="font-bold text-white">{st.actor}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">{st.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-sans">{st.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons to Advance Challenge Steps */}
              <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono text-gray-400">
                  Current Status: <span className="text-cyan-300 font-bold">{selectedSession.current_phase}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedSession.current_phase === 'PROPOSE' && (
                    <button
                      disabled={stepping}
                      onClick={() => handleAdvanceStep('TRIGGER_CHALLENGE')}
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-lg"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Launch Dual Attack (AA & DG)</span>
                    </button>
                  )}

                  {selectedSession.current_phase === 'DEFEND' && (
                    <button
                      disabled={stepping}
                      onClick={() => handleAdvanceStep('SUBMIT_DEFENSE')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-lg"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Specialist Submits Amended Defense</span>
                    </button>
                  )}

                  {selectedSession.current_phase === 'DECIDE' && (
                    <>
                      <button
                        disabled={stepping}
                        onClick={() => handleAdvanceStep('DECIDE_CONVERGE')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Converge Consensus</span>
                      </button>
                      <button
                        disabled={stepping}
                        onClick={() => handleAdvanceStep('TRIGGER_ESCALATION')}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Deadlock: Escalate to Human</span>
                      </button>
                    </>
                  )}

                  {selectedSession.current_phase === 'ESCALATED_TO_HUMAN' && (
                    <button
                      onClick={() => setActiveTab('escalation')}
                      className="px-4 py-2 bg-rose-950 text-rose-300 border border-rose-500/50 hover:bg-rose-900 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5"
                    >
                      <Scale className="w-3.5 h-3.5 text-rose-400" />
                      <span>View Side-by-Side Escalation Packet</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE TWO AUTHORITIES ARENA (§6.1) */}
      {activeTab === 'authorities' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-gray-800">
            <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
              <Scale className="w-5 h-5 text-rose-400" />
              <span>Section 6.1: The Two Authorities</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              <span className="text-rose-300 font-bold">Architecture Authority</span> is adversarial by design: attacks assumptions, enforces 10x scale test, and owns waivers. <span className="text-cyan-300 font-bold">Delivery Governor</span> arbitrates speed versus safety and holds release gates.
              <strong className="text-amber-300 block mt-1">"The tension between these two is a feature. Do not merge them into one governance agent."</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Architecture Authority Card */}
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-rose-500/40 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ADVERSARIAL CHALLENGER
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Architecture Authority</h3>
                </div>
                <Swords className="w-8 h-8 text-rose-400" />
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                When a specialist recommends something, this agent attacks it: surfaces the unstated assumption, forces the trade-off to be named, and asks what happens at 10x load or when vendor terms rupture. Owns ADR finalization and waivers.
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  Mandated Core Responsibilities:
                </span>
                <ul className="text-xs font-mono text-gray-300 space-y-1.5">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Adversarial 10x Traffic & Vendor Stress Testing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>ADR Finalization & Standards Catalog Ownership</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Waiver Registry Ownership (Every exception carries named owner & expiry)</span>
                  </li>
                </ul>
              </div>

              {/* Recent Quotes */}
              <div className="p-4 bg-black/60 rounded-xl border border-gray-800 space-y-2">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
                  Adversarial Quotes in Review:
                </span>
                <blockquote className="text-xs italic text-gray-300 border-l-2 border-rose-500 pl-3">
                  "What happens to the ledger service connection pool when Black Friday traffic surges by 10x?"
                </blockquote>
              </div>
            </div>

            {/* Delivery Governor Card */}
            <div className="p-6 rounded-2xl bg-gray-900/90 border border-cyan-500/40 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PRAGMATIC SPEED ARBITER
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Delivery Governor</h3>
                </div>
                <Scale className="w-8 h-8 text-cyan-400" />
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Arbitrates speed versus safety. Holds release gates. Decides whether shipping now with a known gap is acceptable at the given risk tier. Deliberate counterweight to the Architecture Authority.
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  Mandated Core Responsibilities:
                </span>
                <ul className="text-xs font-mono text-gray-300 space-y-1.5">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Release Gate Holds & Shipping Risk Arbitration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Attacks the Cost of the Architectural Attack</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Contextual Risk-Tier Gating (Fast T3 vs Heavy T1)</span>
                  </li>
                </ul>
              </div>

              {/* Recent Quotes */}
              <div className="p-4 bg-black/60 rounded-xl border border-gray-800 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Speed vs Safety Quotes in Review:
                </span>
                <blockquote className="text-xs italic text-gray-300 border-l-2 border-cyan-500 pl-3">
                  "The business cost of stalling payments release exceeds the estimated blast radius. We approve release with 30-day bounded waiver WVR-2026-0143."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIDE-BY-SIDE ESCALATION PACKETS (CHANT #11) */}
      {activeTab === 'escalation' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-gray-800">
            <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Mandatory Human Escalation Packets (Chant #11)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              When authorities deadlock or risk exceeds budget, an Escalation Packet is generated.
              <strong className="text-amber-300 block mt-1">
                "Escalation packets present both positions side by side. Never a synthesized 'on balance' recommendation that hides the disagreement."
              </strong>
            </p>
          </div>

          {/* Active Escalated Session (e.g. CP-2026-093) */}
          {(() => {
            const escalatedSession = sessions.find(s => s.escalation_packet) || sessions[1];
            const packet = escalatedSession?.escalation_packet;

            if (!packet) {
              return (
                <div className="p-12 text-center text-gray-500 font-mono text-xs border border-dashed border-gray-800 rounded-2xl">
                  No active escalation packet requiring human adjudication.
                </div>
              );
            }

            return (
              <div className="p-6 rounded-2xl bg-gray-900/90 border border-rose-500/40 shadow-2xl space-y-6">
                {/* Escalation Triggers Header */}
                <div className="pb-4 border-b border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-300 uppercase">
                      Mandatory Human Adjudication Packet · {packet.session_id}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
                      Tier {packet.risk_tier} · {packet.target_service}
                    </span>
                  </div>

                  <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-500/30 text-xs font-mono space-y-1">
                    <span className="text-rose-400 font-bold block">Trigger Conditions Tripped:</span>
                    {packet.trigger_reasons.map((trig, i) => (
                      <div key={i} className="flex items-center space-x-2 text-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{trig}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side-by-Side Dual Stance Comparison (NEVER SYNTHESIZED) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Architecture Authority Position */}
                  <div className="p-5 rounded-xl bg-gray-950 border border-rose-500/30 space-y-4">
                    <div className="flex items-center space-x-2 text-rose-300 text-xs font-mono font-bold">
                      <Swords className="w-4 h-4 text-rose-400" />
                      <span>Architecture Authority Stance</span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      "{packet.architecture_authority_stance}"
                    </p>

                    <div className="p-3 bg-rose-950/20 rounded-lg border border-rose-500/20">
                      <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                        Chant #11 Verbatim Dissent:
                      </span>
                      <p className="text-xs italic text-rose-200">
                        "{packet.architecture_authority_dissent}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Delivery Governor Position */}
                  <div className="p-5 rounded-xl bg-gray-950 border border-cyan-500/30 space-y-4">
                    <div className="flex items-center space-x-2 text-cyan-300 text-xs font-mono font-bold">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      <span>Delivery Governor Stance</span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      "{packet.delivery_governor_stance}"
                    </p>

                    <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/20">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                        Chant #11 Verbatim Dissent:
                      </span>
                      <p className="text-xs italic text-cyan-200">
                        "{packet.delivery_governor_dissent}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejected Alternatives */}
                <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2 text-xs font-mono">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[11px]">
                    Explicitly Rejected Alternatives:
                  </span>
                  <ul className="space-y-1 text-gray-300">
                    {packet.rejected_alternatives.map((alt, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="text-rose-400">✕</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Operator Signoff Trigger */}
                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">
                    Awaiting Human Platform Architect Final Determination
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => showToast('Human Operator ruled in favor of Delivery Governor: Bounded release approved.')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold"
                    >
                      Rule with Delivery Governor
                    </button>
                    <button
                      onClick={() => showToast('Human Operator ruled in favor of Architecture Authority: Release held for refactor.')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold"
                    >
                      Rule with Architecture Authority
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: SECTION 6.3 WAIVER REGISTRY & EXPIRY */}
      {activeTab === 'waivers' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <span>Section 6.3 Standardized Waiver Record</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                Every exception carries an expiry date and named owner.
                <strong className="text-emerald-300 block mt-1">
                  "Expired waivers auto-raise a finding. No silent perpetual exceptions."
                </strong>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCheckExpirations}
                className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Scan for Expired Waivers</span>
              </button>
              <button
                onClick={() => setIsWaiverModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Section 6.3 Waiver</span>
              </button>
            </div>
          </div>

          {/* Waivers Table */}
          <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
            <div className="space-y-3">
              {waivers.map(w => {
                const isExpired = w.status === 'EXPIRED';

                return (
                  <div
                    key={w.waiver_id}
                    className={`p-4 rounded-xl border space-y-3 transition-all ${
                      isExpired
                        ? 'border-rose-500/50 bg-rose-950/20'
                        : 'border-gray-800 bg-gray-950'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm font-bold text-white">{w.waiver_id}</span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                          {w.granted_to}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isExpired
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {w.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
                        <span>Expires: <strong className={isExpired ? 'text-rose-400' : 'text-amber-300'}>{w.expires}</strong></span>
                        <span>Owner: <strong className="text-cyan-300">{w.risk_accepted_by}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-gray-900">
                      <div>
                        <span className="text-gray-500 block mb-0.5">Rule Waived:</span>
                        <span className="text-indigo-300">{w.rule}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Compensating Control:</span>
                        <span className="text-emerald-300">{w.compensating_control}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 font-sans">{w.reason}</p>

                    {isExpired && (
                      <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <span>AUTO-RAISED FINDING: Waiver has expired. Must remediate or re-adjudicate immediately.</span>
                        </span>
                        <span className="text-[10px] text-rose-400 font-bold">No Perpetual Exceptions</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PROPOSE CHALLENGE MODAL */}
      {isProposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-gray-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Swords className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white font-mono">Propose Challenge Protocol Session</h3>
              </div>
              <button
                onClick={() => setIsProposeModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={propTitle}
                  onChange={e => setPropTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Target Service</label>
                  <input
                    type="text"
                    value={propService}
                    onChange={e => setPropService(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Risk Tier</label>
                  <select
                    value={propRisk}
                    onChange={e => setPropRisk(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="T1">T1 (High / Regulated)</option>
                    <option value="T2">T2 (Standard)</option>
                    <option value="T3">T3 (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Recommendation Content</label>
                <textarea
                  rows={3}
                  value={propRec}
                  onChange={e => setPropRec(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsProposeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleProposeNew}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white shadow-lg"
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SECTION 6.3 WAIVER MODAL */}
      {isWaiverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-gray-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">Create Section 6.3 Waiver</h3>
              </div>
              <button
                onClick={() => setIsWaiverModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Standard / Rule</label>
                  <input
                    type="text"
                    value={wvrRule}
                    onChange={e => setWvrRule(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Granted To Service</label>
                  <input
                    type="text"
                    value={wvrService}
                    onChange={e => setWvrService(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Named Owner (risk_accepted_by)</label>
                <input
                  type="text"
                  value={wvrOwner}
                  onChange={e => setWvrOwner(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Compensating Control</label>
                <input
                  type="text"
                  value={wvrControl}
                  onChange={e => setWvrControl(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Expires Date</label>
                  <input
                    type="date"
                    value={wvrExpires}
                    onChange={e => setWvrExpires(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Review Cadence</label>
                  <input
                    type="text"
                    value="monthly"
                    readOnly
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Reason / Justification</label>
                <textarea
                  rows={2}
                  value={wvrReason}
                  onChange={e => setWvrReason(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsWaiverModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWaiverV6}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg"
              >
                Create Waiver Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
