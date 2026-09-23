import React, { useState, useEffect } from 'react';
import {
  MessageEnvelope,
  CommunicationChannelsData,
  MemoryModelStatus,
  EpisodicMemoryRun
} from '../types';
import {
  Radio,
  Send,
  ShieldAlert,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Terminal,
  Database,
  Trash2,
  ExternalLink,
  Zap,
  Network,
  Share2,
  FileCode2,
  Info
} from 'lucide-react';

export const InterAgentCommHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'envelopes' | 'channels' | 'memory'>('envelopes');
  const [messages, setMessages] = useState<MessageEnvelope[]>([]);
  const [channelsData, setChannelsData] = useState<CommunicationChannelsData | null>(null);
  const [memoryStatus, setMemoryStatus] = useState<MemoryModelStatus | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Envelope Dispatch Form State
  const [workIdInput, setWorkIdInput] = useState('WO-2026-014872');
  const [recipientInput, setRecipientInput] = useState('capability:findings.reconcile');
  const [intentInput, setIntentInput] = useState('finding.emit');
  const [senderAgentInput, setSenderAgentInput] = useState('arch-conformance');
  const [confidenceInput, setConfidenceInput] = useState(0.92);
  const [payloadJsonInput, setPayloadJsonInput] = useState(
    JSON.stringify({ finding_id: "fnd-eval-99", rule: "ARC-DATABASE-ISOLATION-01", status: "VIOLATION" }, null, 2)
  );

  // Blackboard Simulator State
  const [blackboardWorkId, setBlackboardWorkId] = useState('WO-2026-014872');
  const [blackboardField, setBlackboardField] = useState('state');
  const [blackboardValue, setBlackboardValue] = useState('in_challenge_protocol');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [msgRes, chanRes, memRes] = await Promise.all([
        fetch('http://localhost:6090/api/comm/messages'),
        fetch('http://localhost:6090/api/comm/channels'),
        fetch('http://localhost:6090/api/comm/memory-model')
      ]);

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData);
        if (msgData.length > 0 && !selectedMessage) {
          setSelectedMessage(msgData[0]);
        }
      }
      if (chanRes.ok) {
        const cData = await chanRes.json();
        setChannelsData(cData);
      }
      if (memRes.ok) {
        const mData = await memRes.json();
        setMemoryStatus(mData);
      }
    } catch (err) {
      console.error('Failed to fetch Section 7 data:', err);
      showToast('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatchEnvelope = async (forceInvalidRecipient: boolean = false) => {
    const targetRecipient = forceInvalidRecipient ? 'agent:dependency-impact-agent' : recipientInput;
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payloadJsonInput);
    } catch (e) {
      showToast('Invalid JSON in payload field', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:6090/api/comm/messages/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: workIdInput,
          recipient: targetRecipient,
          intent: intentInput,
          sender: { agent_id: senderAgentInput, version: '2.1.0' },
          payload: parsedPayload,
          confidence: confidenceInput,
          evidence_refs: ['ev-cicd-1209']
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || 'Dispatch rejected', 'error');
        return;
      }

      showToast(`Envelope dispatched! Routed to: ${data.routed_subscribers?.join(', ') || 'No direct listeners'}`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleBlackboardWrite = async (forceStaleVersion: boolean = false) => {
    if (!channelsData) return;
    const currentToken = channelsData.blackboard_status.optimistic_version_tokens[blackboardWorkId] || 1;
    const versionLockToSend = forceStaleVersion ? Math.max(0, currentToken - 1) : currentToken;

    try {
      const res = await fetch('http://localhost:6090/api/comm/blackboard/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_id: blackboardWorkId,
          version_lock: versionLockToSend,
          field: blackboardField,
          value: blackboardValue,
          actor: 'operator:ui-test'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Write Conflict [HTTP ${res.status}]: ${data.detail}`, 'error');
        return;
      }

      showToast(`Optimistic write committed! New version lock: ${data.new_version_lock}`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePurgeEpisodicRun = async (workId: string) => {
    try {
      const res = await fetch('http://localhost:6090/api/comm/memory/purge-episodic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_id: workId })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || 'Purge failed', 'error');
        return;
      }

      showToast(data.message, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const isRecipientValid = recipientInput.startsWith('capability:');

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & INVARIANTS */}
      <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/40 rounded">
                Section 7 Architecture Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono">Chant #7 & Chant #11 Compliance</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Radio className="w-7 h-7 text-cyan-400 animate-pulse" />
              Inter-Agent Communication & Memory Model
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Strict capability-based message envelopes (preventing the N×(N-1) hairball), three non-overlapping channels (Sync, Pub/Sub, Blackboard with optimistic locking), and partitioned memory tiers.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-sm font-semibold transition-all shadow"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Bus
          </button>
        </div>

        {/* THREE CORE INVARIANTS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
              <Share2 className="w-3.5 h-3.5" />
              §7.1 Capability Addressing
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Recipient is strictly <code className="text-cyan-300">capability:uri</code>, never an agent name. Agents subscribe to capabilities, preventing topology rot.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-1">
              <Lock className="w-3.5 h-3.5" />
              §7.2 Blackboard Optimistic Lock
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Concurrent reads are shared. Writes serialize via Write Arbiter with version locks; stale tokens trigger immediate 409 conflict.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-1">
              <Database className="w-3.5 h-3.5" />
              §7.3 Reset-Safe Partitioning
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Episodic memory dies with Work Object (reset-safe). Semantic and procedural memory are permanent; killing a run never lobotomizes the system.
            </p>
          </div>
        </div>
      </div>

      {/* TOAST ALERTS */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMsg.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMsg.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs opacity-70 hover:opacity-100 uppercase font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* NAVIGATION SUB-TABS */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('envelopes')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'envelopes'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          Message Envelopes & Capability Bus (§7.1)
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
            {messages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('channels')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'channels'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          The Three Channels (§7.2)
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
            Sync · Pub/Sub · Blackboard
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('memory')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'memory'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Three-Tier Memory Matrix (§7.3)
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            Reset Safe: YES
          </span>
        </button>
      </div>

      {/* TAB 1: MESSAGE ENVELOPES & CAPABILITY BUS */}
      {activeSubTab === 'envelopes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: LIVE ENVELOPE STREAM & FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* DISPATCH NEW ENVELOPE HARNESS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                    Dispatch Envelope to Capability Bus
                  </h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                  isRecipientValid ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}>
                  {isRecipientValid ? 'VALID CAPABILITY URI' : 'INVALID (MUST BE capability:...)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Target Capability URI (Strictly capability:...)</label>
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-cyan-300 focus:border-cyan-500 focus:outline-none"
                    placeholder="capability:findings.reconcile"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Sender Agent</label>
                  <select
                    value={senderAgentInput}
                    onChange={(e) => setSenderAgentInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="arch-conformance">Architecture Conformance Agent</option>
                    <option value="dep-impact">Dependency & Impact Agent</option>
                    <option value="flow-analyst">Flow Analyst Agent</option>
                    <option value="code-review">Code Review Agent</option>
                    <option value="reliability-sentinel">Reliability Sentinel Agent</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Work ID</label>
                  <input
                    type="text"
                    value={workIdInput}
                    onChange={(e) => setWorkIdInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Intent</label>
                  <input
                    type="text"
                    value={intentInput}
                    onChange={(e) => setIntentInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="finding.emit"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-slate-400 text-xs font-mono block mb-1">JSON Payload</label>
                <textarea
                  rows={3}
                  value={payloadJsonInput}
                  onChange={(e) => setPayloadJsonInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-emerald-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDispatchEnvelope(true)}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded text-xs font-mono transition-all flex items-center gap-1.5"
                  title="Tests Section 7.1 invariant rejection of agent-directed addressing"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Test Direct Agent Addressing (Throws 400 Invariant Error)
                </button>
                <button
                  onClick={() => handleDispatchEnvelope(false)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center gap-2 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Envelope
                </button>
              </div>
            </div>

            {/* ENVELOPES STREAM */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Active Envelope Stream ({messages.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">Sorted by recency</span>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const isSelected = selectedMessage?.msg_id === msg.msg_id;
                  return (
                    <div
                      key={msg.msg_id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {msg.msg_id}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {msg.work_id}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {msg.issued_at?.slice(11, 19)} UTC
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400">{msg.sender.agent_id}</span>
                        <span className="text-cyan-400">➔</span>
                        <span className="text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {msg.recipient}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-slate-300">Intent: <code className="text-amber-300">{msg.intent}</code></span>
                        <span>Confidence: <strong className="text-emerald-400">{Math.round(msg.confidence * 100)}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: RFC ENVELOPE INSPECTOR */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg sticky top-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                    Envelope Schema Inspector (§7.1)
                  </h3>
                </div>
                {selectedMessage && (
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {selectedMessage.msg_id}
                  </span>
                )}
              </div>

              {selectedMessage ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Envelope ID:</span>
                      <span className="text-cyan-400 font-bold">{selectedMessage.msg_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Correlation ID:</span>
                      <span className="text-slate-300">{selectedMessage.correlation_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trace ID:</span>
                      <span className="text-slate-300">{selectedMessage.trace_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">TTL (seconds):</span>
                      <span className="text-amber-400">{selectedMessage.ttl_s}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sender:</span>
                      <span className="text-slate-200">{selectedMessage.sender.agent_id} (v{selectedMessage.sender.version})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Recipient (Capability):</span>
                      <span className="text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                        {selectedMessage.recipient}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Evidence Refs:</span>
                      <span className="text-emerald-400">{selectedMessage.evidence_refs?.join(', ') || 'none'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-slate-400 block mb-1">Verbatim JSON Envelope:</span>
                    <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
                      {JSON.stringify(selectedMessage, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 font-mono text-xs">
                  Select an envelope from the stream to view RFC schema inspection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE THREE CHANNELS */}
      {activeSubTab === 'channels' && channelsData && (
        <div className="space-y-6">
          {/* TOP GRID: CHANNEL OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CHANNEL A: SYNCHRONOUS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm font-mono uppercase">Channel 1: Synchronous</h3>
                    <span className="text-[11px] text-amber-400 font-mono">Strictly bounded RPC catalog</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  {channelsData.synchronous_catalog.length} Endpoints
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only where an agent genuinely blocks on another's answer. Kept strictly small and documented to prevent distributed deadlocks.
              </p>

              <div className="space-y-2.5">
                {channelsData.synchronous_catalog.map((ch, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300">{ch.capability_uri}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/20">
                        max {ch.max_timeout_ms}ms
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{ch.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span>Caller: <strong className="text-slate-300">{ch.caller_agent}</strong></span>
                      <span>Target: <strong className="text-slate-300">{ch.target_provider}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHANNEL B: ASYNC PUB/SUB */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm font-mono uppercase">Channel 2: Async Pub/Sub</h3>
                    <span className="text-[11px] text-cyan-400 font-mono">Default choice over Event Bus</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                  {channelsData.capability_subscriptions.length} Capabilities
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asynchronous event distribution over the Substrate Event Bus. Decoupled producer/consumer topology.
              </p>

              <div className="space-y-2.5">
                {channelsData.capability_subscriptions.map((sub, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">{sub.capability_uri}</span>
                      <span className="text-[10px] font-mono text-slate-400">{sub.event_count_24h} ev/24h</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{sub.description}</p>
                    <div className="pt-1 border-t border-slate-900">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">Subscribed Agents:</span>
                      <div className="flex flex-wrap gap-1">
                        {sub.subscribers.map((agentName, sIdx) => (
                          <span key={sIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                            {agentName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHANNEL C: BLACKBOARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm font-mono uppercase">Channel 3: Blackboard</h3>
                    <span className="text-[11px] text-emerald-400 font-mono">The Work Object Itself</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  {channelsData.blackboard_status.active_work_objects_count} Objects
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Shared mutable state via the canonical Work Object. Read concurrently by all agents in a run; written only through Write Arbiter with optimistic locking.
              </p>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Read Access:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Unlock className="w-3.5 h-3.5" /> Concurrent Shared
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Write Arbiter:</span>
                  <span className="text-cyan-400 flex items-center gap-1 font-bold">
                    <Lock className="w-3.5 h-3.5" /> Serialized
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-400 block mb-2 font-bold uppercase tracking-wider">
                  Active Optimistic Version Tokens:
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  {Object.entries(channelsData.blackboard_status.optimistic_version_tokens).map(([wid, ver]) => (
                    <div key={wid} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-slate-300">{wid}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                        v{ver}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM INTERACTIVE HARNESS: BLACKBOARD OPTIMISTIC LOCK SIMULATOR */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base font-mono">
                Interactive Blackboard Optimistic Concurrency Simulator
              </h3>
            </div>
            <p className="text-slate-400 text-xs mb-4">
              Demonstrates optimistic concurrency control over the Blackboard. When two agents attempt simultaneous writes to the same Work Object, the agent with the outdated version token receives a 409 conflict and must re-read.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Work Object</label>
                <select
                  value={blackboardWorkId}
                  onChange={(e) => setBlackboardWorkId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-cyan-300 focus:border-cyan-500 focus:outline-none"
                >
                  {Object.keys(channelsData.blackboard_status.optimistic_version_tokens).map((wid) => (
                    <option key={wid} value={wid}>{wid} (Token v{channelsData.blackboard_status.optimistic_version_tokens[wid]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Field to Mutate</label>
                <input
                  type="text"
                  value={blackboardField}
                  onChange={(e) => setBlackboardField(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">New Value</label>
                <input
                  type="text"
                  value={blackboardValue}
                  onChange={(e) => setBlackboardValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={() => handleBlackboardWrite(false)}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Submit Write (Current Token)
                </button>
                <button
                  onClick={() => handleBlackboardWrite(true)}
                  className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded text-xs font-mono transition-all flex items-center justify-center gap-1.5"
                  title="Simulates an agent submitting a stale version lock token"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Simulate Stale Write (Triggers 409)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THREE-TIER MEMORY MATRIX */}
      {activeSubTab === 'memory' && memoryStatus && (
        <div className="space-y-6">
          {/* THREE PILLARS MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TIER 1: EPISODIC */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Tier 1</span>
                  <h3 className="font-bold text-white text-base font-mono">Episodic Memory</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                  RESET SAFE: YES
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Lifecycle:</strong> Dies with the Work Object. Holds scratchpad tokens, transient hypothesis evaluations, and intermediate agent reasoning traces.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Runs:</span>
                    <span className="text-emerald-400 font-bold">{memoryStatus.episodic_runs_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Purge Impact:</span>
                    <span className="text-emerald-300">Zero durable data lost</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  "Episodic memory must never be the only home of a durable fact."
                </p>
              </div>
            </div>

            {/* TIER 2: SEMANTIC */}
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Tier 2</span>
                  <h3 className="font-bold text-white text-base font-mono">Semantic Memory</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                  RESET SAFE: NO
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Lifecycle:</strong> Permanent Organizational Knowledge. Retains the standards catalog, ADR register, service topology, and active waivers with expiration timelines.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standards Catalog:</span>
                    <span className="text-cyan-400 font-bold">{memoryStatus.semantic_standards_count} rules</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active ADRs:</span>
                    <span className="text-cyan-400 font-bold">{memoryStatus.semantic_adrs_count} records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Waivers (WVR):</span>
                    <span className="text-amber-400 font-bold">{memoryStatus.semantic_waivers_count} active</span>
                  </div>
                </div>
                <p className="text-[11px] text-rose-300/80 font-mono">
                  Purging semantic memory lobotomizes the organization's architecture posture.
                </p>
              </div>
            </div>

            {/* TIER 3: PROCEDURAL */}
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">Tier 3</span>
                  <h3 className="font-bold text-white text-base font-mono">Procedural Memory</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                  RESET SAFE: NO
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Lifecycle:</strong> Learned Heuristics & Plays. Encodes DAG routing rules, scatter/gather execution plans, and autonomy promotion history.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Executable Plays:</span>
                    <span className="text-purple-400 font-bold">{memoryStatus.procedural_plays_count} plays</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Routing Policy Rules:</span>
                    <span className="text-purple-400 font-bold">{memoryStatus.procedural_rules_count} rules</span>
                  </div>
                </div>
                <p className="text-[11px] text-purple-300/80 font-mono">
                  Procedural memory preserves how the organization executes and handles escalations.
                </p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE STUCK RUN PURGE SIMULATOR */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-emerald-400" />
                  Episodic Run Purge Simulator (Safely Kill Stuck Runs)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proves §7.3: you can cleanly kill a stuck or hung execution run without lobotomizing semantic knowledge or procedural plays.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {memoryStatus.recent_episodic_runs.map((run: EpisodicMemoryRun) => (
                <div key={run.work_id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-cyan-400">{run.work_id}</span>
                      <span className="text-xs font-mono text-slate-400">({run.active_run_id})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                        run.status === 'ACTIVE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : run.status === 'KILLED_AND_PURGED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {run.status}
                      </span>
                      {run.status !== 'KILLED_AND_PURGED' && (
                        <button
                          onClick={() => handlePurgeEpisodicRun(run.work_id)}
                          className="px-3 py-1 bg-rose-900/40 hover:bg-rose-800 text-rose-200 border border-rose-500/40 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Kill & Purge Episodic Memory
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-slate-400 block mb-1">Intermediate Reasoning Trace:</span>
                    {run.intermediate_reasoning.length > 0 ? (
                      <ul className="space-y-1 text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-850">
                        {run.intermediate_reasoning.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-cyan-500">›</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-mono text-slate-500 italic p-2 bg-slate-900/40 rounded">
                        Intermediate reasoning wiped clean on purge.
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-mono text-slate-400 block mb-1">Transient Context Variables:</span>
                    <pre className="p-2 bg-slate-900/60 rounded text-[11px] font-mono text-emerald-400 overflow-x-auto">
                      {JSON.stringify(run.transient_context, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
