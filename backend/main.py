from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn

from backend.engine import engine
from backend.models import (
    CreateProjectRequest, 
    ExecuteProjectRequest, 
    GoldenTestRunRequest, 
    FailureSimulationRequest
)

app = FastAPI(
    title="PRIP-AI Engine API",
    description="Execution Agents Specialization, Evidence Service, and Manifest System",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluatePRRequest(BaseModel):
    pr_id: Optional[str] = "PR #424"
    repo: str = "checkout-service"
    title: str = "Add payment provider fallback"
    author: str = "@sprint-dev"
    filename: str = "src/services/billing.py"
    diff: str = ""

class CreateWaiverRequest(BaseModel):
    rule_code: str
    service: str
    named_owner: str
    justification: str
    mitigation_conditions: Optional[List[str]] = None
    ttl_days: int = 30
    risk_level: str = "MEDIUM"

class ExecuteActionRequest(BaseModel):
    operator_approved_by: Optional[str] = "Lead Platform Architect"

class DegradedModeToggleRequest(BaseModel):
    active: bool

class ReleaseGateVerdictRequest(BaseModel):
    verdict: str  # 'GATE_OPENED_PROD' or 'GATE_LOCKED_BLOCKED'
    operator: Optional[str] = "Staff Platform Architect"

class SimulateDAGRequest(BaseModel):
    target_work_item: Optional[str] = "checkout-service:PR-492"

class IntakeSignalRequest(BaseModel):
    raw_signal: str
    source_channel: Optional[str] = "Slack #eng-support"

class CloseLearningLoopRequest(BaseModel):
    incident_id: Optional[str] = "INC-4412"

@app.get("/api/health")
def health_check():
    return {
        "status": "UP",
        "service": "PRIP-AI Engine",
        "port": 6090,
        "execution_agents": 8,
        "evidence_service": "ONLINE",
        "invariants_enforced": 12
    }

# ==============================================================================
# SECTION 4.2: EVIDENCE SERVICE (Shared Retrieval Layer)
# ==============================================================================
@app.get("/api/evidence/query")
def query_evidence(
    q: Optional[str] = Query(default=""),
    source_type: Optional[str] = Query(default="ALL")
):
    return engine.query_evidence(query=q or "", source_type=source_type or "ALL")

@app.get("/api/evidence/resolve/{evidence_id}")
def resolve_evidence(evidence_id: str):
    res = engine.resolve_evidence_id(evidence_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Evidence ID {evidence_id} not found")
    return res

# ==============================================================================
# SECTION 4.3: AGENT MANIFESTS
# ==============================================================================
@app.get("/api/agents/manifests")
def get_manifests():
    return engine.get_agent_manifests()

@app.get("/api/agents/manifests/{agent_id}")
def get_manifest(agent_id: str):
    res = engine.get_agent_manifest(agent_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Manifest for agent {agent_id} not found")
    return res

# ==============================================================================
# SECTION 4.1.1: INTAKE & INTENT ("Asks, Never Guesses")
# ==============================================================================
@app.post("/api/agents/intake/evaluate")
def evaluate_intake_signal(payload: IntakeSignalRequest):
    return engine.evaluate_intake_signal(payload.raw_signal)

# ==============================================================================
# SECTION 4.1.7: RELIABILITY LEARNING LOOP
# ==============================================================================
@app.post("/api/agents/reliability/close-loop")
def close_reliability_learning_loop(payload: CloseLearningLoopRequest):
    return engine.close_reliability_learning_loop(payload.incident_id or "INC-4412")

# ==============================================================================
# THREE PLANES & SUBSTRATE
# ==============================================================================
@app.get("/api/planes/overview")
def get_planes_overview():
    return engine.get_planes_overview()

@app.get("/api/planes/substrate")
def get_substrate_status():
    return engine.get_substrate_status()

@app.get("/api/planes/dag-planner")
def get_dag_plans():
    return engine.get_dag_plans()

@app.post("/api/planes/dag-planner/simulate")
def simulate_dag(payload: SimulateDAGRequest):
    return engine.simulate_dag_execution(payload.target_work_item or "checkout-service:PR-492")

@app.get("/api/planes/adjudication")
def get_adjudication():
    return engine.get_adjudication_overview()

@app.post("/api/planes/adjudication/gate/{gate_id}/decide")
def decide_release_gate(gate_id: str, payload: ReleaseGateVerdictRequest):
    result = engine.decide_release_gate(gate_id, payload.verdict, payload.operator or "Staff Platform Architect")
    if result["status"] == "ERROR":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

# ==============================================================================
# INVARIANTS ENDPOINTS
# ==============================================================================
@app.get("/api/invariants")
def get_invariants():
    return engine.get_invariants()

@app.get("/api/invariants/arbiter")
def get_arbiter_status():
    return engine.get_arbiter_status()

@app.get("/api/invariants/conflicts")
def get_conflicts():
    return engine.get_specialist_conflicts()

@app.get("/api/invariants/trust-ladder")
def get_trust_ladder():
    return engine.get_autonomy_ladder()

@app.get("/api/invariants/capabilities")
def get_capabilities():
    return engine.get_capabilities()

@app.post("/api/invariants/degraded-mode")
def toggle_degraded_mode(payload: DegradedModeToggleRequest):
    return engine.toggle_degraded_mode(payload.active)

# ==============================================================================
# TOOLCHAIN & REASONING PILLARS
# ==============================================================================
@app.get("/api/toolchain/status")
def get_toolchain_status():
    return engine.get_toolchain_status()

@app.post("/api/toolchain/sync")
def sync_toolchain():
    return engine.sync_toolchain()

@app.get("/api/reasoning/stuck-work")
def get_stuck_work():
    return engine.get_stuck_work()

@app.get("/api/reasoning/conformance")
def get_conformance_evaluations():
    return engine.get_conformance_evaluations()

@app.get("/api/reasoning/standards")
def get_standards():
    return engine.get_standards_catalog()

@app.post("/api/reasoning/conformance/evaluate")
def evaluate_conformance(payload: EvaluatePRRequest):
    return engine.evaluate_pull_request(payload.model_dump())

@app.get("/api/reasoning/debt-challenges")
def get_debt_challenges():
    return engine.get_debt_challenges()

@app.get("/api/reasoning/waivers")
def get_waivers():
    return engine.get_waivers()

@app.post("/api/reasoning/waivers")
def create_waiver(payload: CreateWaiverRequest):
    try:
        return engine.create_waiver(payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/agents")
def get_agents():
    return engine.get_agents()

@app.get("/api/metrics/outcomes")
def get_outcome_metrics():
    return engine.get_outcome_metrics()

@app.get("/api/actions")
def get_actions():
    return engine.get_actions()

@app.get("/api/actions/audit-log")
def get_audit_log():
    return engine.get_audit_log()

@app.post("/api/actions/{action_id}/execute")
def execute_action(action_id: str, payload: ExecuteActionRequest):
    result = engine.execute_action(action_id, payload.operator_approved_by or "Lead Platform Architect")
    if result["status"] == "ERROR":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@app.post("/api/actions/{action_id}/rollback")
def rollback_action(action_id: str, payload: ExecuteActionRequest):
    result = engine.rollback_action(action_id, payload.operator_approved_by or "Lead Platform Architect")
    if result["status"] == "ERROR":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# ==============================================================================
# SECTION 5: ORCHESTRATION, ROUTING, LANES & 3-BUDGET MANAGER ENDPOINTS
# ==============================================================================

class OverrideLaneRequest(BaseModel):
    requested_lane: str
    reason: str
    agent_id: Optional[str] = "Lead Platform Architect"

class ExecutePlayRequest(BaseModel):
    play_id: str
    work_id: str
    simulate_exhaustion: Optional[str] = None  # None, "WALL_CLOCK", "TOKENS", "USD"

class RouteIntentRequest(BaseModel):
    intent_class: str
    risk_tier: str
    blast_radius_score: float
    time_pressure: Optional[str] = "standard"

class GraduateCandidateRequest(BaseModel):
    candidate_id: str

@app.get("/api/work-objects")
def get_work_objects():
    return engine.get_work_objects()

@app.get("/api/work-objects/{work_id}")
def get_work_object(work_id: str):
    wo = engine.get_work_object(work_id)
    if not wo:
        raise HTTPException(status_code=404, detail=f"Work Object {work_id} not found.")
    return wo

@app.post("/api/work-objects/{work_id}/override-lane")
def override_work_object_lane(work_id: str, payload: OverrideLaneRequest):
    try:
        return engine.override_work_object_lane(
            work_id=work_id,
            requested_lane=payload.requested_lane,
            reason=payload.reason,
            agent_id=payload.agent_id or "Operator"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/plays")
def get_plays():
    return engine.get_plays()

@app.get("/api/plays/{play_id}")
def get_play(play_id: str):
    p = engine.get_play(play_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Play {play_id} not found.")
    return p

@app.post("/api/plays/execute")
def execute_play(payload: ExecutePlayRequest):
    try:
        return engine.execute_play_dag(
            play_id=payload.play_id,
            work_id=payload.work_id,
            simulate_exhaustion=payload.simulate_exhaustion
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/routing/rules")
def get_routing_rules():
    return engine.get_routing_rules()

@app.get("/api/routing/harvested-candidates")
def get_harvested_candidates():
    return engine.get_harvested_candidates()

@app.post("/api/routing/evaluate")
def evaluate_routing(payload: RouteIntentRequest):
    return engine.route_work_intent(
        intent_class=payload.intent_class,
        risk_tier=payload.risk_tier,
        blast_radius_score=payload.blast_radius_score,
        time_pressure=payload.time_pressure or "standard"
    )

@app.post("/api/routing/graduate-candidate")
def graduate_candidate(payload: GraduateCandidateRequest):
    try:
        return engine.graduate_candidate_to_rule(payload.candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# SECTION 6: SUPER AGENTS, CHALLENGE PROTOCOL & WAIVER V6 ENDPOINTS
# ==============================================================================

class ProposeChallengeRequest(BaseModel):
    title: str
    target_service: str
    risk_tier: Optional[str] = "T2"
    proposed_by: Optional[str] = "Dependency & Impact Agent"
    recommendation: str
    confidence: Optional[float] = 0.90
    work_id: Optional[str] = "WO-2026-014872"

class AdvanceChallengeRequest(BaseModel):
    action: str  # TRIGGER_CHALLENGE, SUBMIT_DEFENSE, DECIDE_CONVERGE, TRIGGER_ESCALATION, RECORD_AND_CLOSE
    payload: Optional[Dict[str, Any]] = {}

class CreateWaiver6Request(BaseModel):
    rule: str
    granted_to: str
    reason: str
    compensating_control: str
    risk_accepted_by: str
    expires: str
    review_cadence: Optional[str] = "monthly"

@app.get("/api/super-agents/authorities")
def get_super_authorities():
    return engine.get_super_authorities()

@app.get("/api/challenge-protocol/sessions")
def get_challenge_sessions():
    return engine.get_challenge_sessions()

@app.get("/api/challenge-protocol/sessions/{session_id}")
def get_challenge_session(session_id: str):
    sess = engine.get_challenge_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Challenge session {session_id} not found.")
    return sess

@app.post("/api/challenge-protocol/sessions/propose")
def propose_challenge(payload: ProposeChallengeRequest):
    return engine.propose_challenge_session(payload.model_dump())

@app.post("/api/challenge-protocol/sessions/{session_id}/step")
def advance_challenge_step(session_id: str, payload: AdvanceChallengeRequest):
    try:
        return engine.advance_challenge_step(session_id, payload.action, payload.payload or {})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/challenge-protocol/sessions/{session_id}/escalation-packet")
def get_escalation_packet(session_id: str):
    packet = engine.get_escalation_packet(session_id)
    if not packet:
        raise HTTPException(status_code=404, detail=f"No escalation packet for session {session_id}.")
    return packet

@app.get("/api/waivers-v6")
def get_waivers_v6():
    return engine.get_waivers_v6()

@app.post("/api/waivers-v6")
def create_waiver_v6(payload: CreateWaiver6Request):
    try:
        return engine.create_waiver_v6(payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/waivers-v6/check-expirations")
def check_expired_waivers():
    return engine.check_expired_waivers_and_raise_findings()

# ==============================================================================
# SECTION 7: INTER-AGENT COMMUNICATION & THREE-TIER MEMORY MODEL ENDPOINTS
# ==============================================================================

class DispatchEnvelopeRequest(BaseModel):
    work_id: str
    recipient: str  # Capability URI: capability:<domain>.<action>
    intent: str
    sender: Optional[Dict[str, Any]] = None
    payload: Optional[Dict[str, Any]] = {}
    evidence_refs: Optional[List[str]] = []
    confidence: Optional[float] = 0.85
    ttl_s: Optional[int] = 120
    correlation_id: Optional[str] = None
    trace_id: Optional[str] = None

class BlackboardWriteAPIRequest(BaseModel):
    work_id: str
    version_lock: int
    field: str
    value: Any
    actor: Optional[str] = "operator:arch-authority"

class PurgeEpisodicRequest(BaseModel):
    work_id: str

@app.get("/api/comm/messages")
def get_messages(work_id: Optional[str] = None, limit: int = 50):
    return engine.get_messages(work_id=work_id, limit=limit)

@app.post("/api/comm/messages/dispatch")
def dispatch_envelope(payload: DispatchEnvelopeRequest):
    try:
        return engine.dispatch_message_envelope(payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/comm/channels")
def get_communication_channels():
    return engine.get_communication_channels()

@app.post("/api/comm/blackboard/write")
def write_blackboard(payload: BlackboardWriteAPIRequest):
    try:
        return engine.write_blackboard(
            work_id=payload.work_id,
            version_lock=payload.version_lock,
            field=payload.field,
            value=payload.value,
            actor=payload.actor or "operator"
        )
    except ValueError as e:
        err_msg = str(e)
        if "BLACKBOARD_VERSION_CONFLICT" in err_msg:
            raise HTTPException(status_code=409, detail=err_msg)
        raise HTTPException(status_code=400, detail=err_msg)

@app.get("/api/comm/memory-model")
def get_memory_model():
    return engine.get_memory_model_status()

@app.post("/api/comm/memory/purge-episodic")
def purge_episodic_run(payload: PurgeEpisodicRequest):
    try:
        return engine.purge_episodic_run(payload.work_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==============================================================================
# SECTION 8: PARALLEL EXECUTION, RECONCILIATION & SPECULATIVE SUBSYSTEM ENDPOINTS
# ==============================================================================

class ExecuteScatterGatherRequest(BaseModel):
    work_id: Optional[str] = "WO-2026-014872"
    agents: Optional[List[str]] = None

class ReconcileFindingsRequest(BaseModel):
    work_id: Optional[str] = "WO-2026-014872"
    raw_findings: Optional[List[Dict[str, Any]]] = None

class SubmitWritePathRequest(BaseModel):
    work_id: str
    idempotency_key: str
    version_lock: int
    mutated_target: Optional[str] = "service.config"
    actor: Optional[str] = "operator:write-arbiter"

class ExecuteSpeculativeRequest(BaseModel):
    work_id: Optional[str] = "WO-2026-015091"
    lane: Optional[str] = None

@app.get("/api/parallel/scatter-gather")
def get_scatter_gather(work_id: Optional[str] = None):
    return engine.get_scatter_gather_runs(work_id=work_id)

@app.post("/api/parallel/scatter-gather")
def execute_scatter_gather(payload: ExecuteScatterGatherRequest):
    return engine.execute_scatter_gather(payload.model_dump())

@app.get("/api/parallel/reconcile")
def get_reconciliation_results(work_id: Optional[str] = None):
    return engine.get_reconciliation_results(work_id=work_id)

@app.post("/api/parallel/reconcile")
def reconcile_findings(payload: ReconcileFindingsRequest):
    return engine.reconcile_findings(payload.model_dump())

@app.post("/api/parallel/write-arbiter/submit")
def submit_write_path(payload: SubmitWritePathRequest):
    try:
        return engine.submit_write_path(payload.model_dump())
    except ValueError as e:
        err_msg = str(e)
        if "BLACKBOARD_VERSION_CONFLICT" in err_msg:
            raise HTTPException(status_code=409, detail=err_msg)
        raise HTTPException(status_code=400, detail=err_msg)

@app.get("/api/parallel/speculative/runs")
def get_speculative_runs(work_id: Optional[str] = None):
    return engine.get_speculative_runs(work_id=work_id)

@app.post("/api/parallel/speculative/run")
def execute_speculative_run(payload: ExecuteSpeculativeRequest):
    try:
        return engine.execute_speculative_run(payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# SECTION 9: FAULT TOLERANCE, REDUNDANCY & REPLAY ENDPOINTS
# ==============================================================================

class ToggleCircuitBreakerRequest(BaseModel):
    target_id: str
    new_state: str  # CLOSED, OPEN, HALF_OPEN

class ExecuteModelLadderRequest(BaseModel):
    work_id: Optional[str] = "WO-2026-014872"
    simulate_fail_tiers: Optional[List[int]] = []

class TriggerDegradedModeRequest(BaseModel):
    work_id: Optional[str] = "WO-2026-014872"
    play_id: Optional[str] = "play.service_change.standard.v4"

class ActionDLQItemRequest(BaseModel):
    action: str  # RETRY, PURGE_DISCARD, FORCE_COMPLETE_DEGRADED

class ExecuteT1DualPathRequest(BaseModel):
    work_id: Optional[str] = "WO-2026-014872"
    simulate_disagreement: Optional[bool] = False

@app.get("/api/fault-tolerance/resilience")
def get_resilience():
    return engine.get_resilience_status()

@app.post("/api/fault-tolerance/circuit-breaker/toggle")
def toggle_circuit_breaker(payload: ToggleCircuitBreakerRequest):
    try:
        return engine.toggle_circuit_breaker(payload.target_id, payload.new_state)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/fault-tolerance/model-ladder/execute")
def execute_model_ladder(payload: ExecuteModelLadderRequest):
    return engine.execute_model_ladder(payload.model_dump())

@app.post("/api/fault-tolerance/degraded-mode/trigger")
def trigger_degraded_mode(payload: TriggerDegradedModeRequest):
    return engine.trigger_degraded_mode_play(payload.model_dump())

@app.get("/api/fault-tolerance/dlq")
def get_dlq_items():
    return engine.get_dlq_items()

@app.post("/api/fault-tolerance/dlq/{dlq_id}/action")
def action_dlq_item(dlq_id: str, payload: ActionDLQItemRequest):
    try:
        return engine.reprocess_dlq_item(dlq_id, payload.action)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/fault-tolerance/redundancy/t1-dual-run")
def execute_t1_dual_path(payload: ExecuteT1DualPathRequest):
    return engine.execute_t1_dual_path(payload.model_dump())

@app.get("/api/fault-tolerance/replay/{work_id}")
def get_run_replay(work_id: str):
    return engine.get_replay_session(work_id)

# ==============================================================================
# SECTION 10: SECURITY AND AUDIT ENDPOINTS
# ==============================================================================

class CheckScopeRequest(BaseModel):
    agent_id: str
    action_type: str
    target: Optional[str] = ""

class SanitizeEvidenceRequest(BaseModel):
    raw_text: str
    source_uri: Optional[str] = "jira://raw-input"

class TestInjectionRequest(BaseModel):
    content: str
    source_system: Optional[str] = "JIRA"
    source_ref: Optional[str] = "PLAT-4821"

class AutonomousSignOffRequest(BaseModel):
    agent_id: str
    granted_by: str
    justification: str
    scope_permitted: str

class RecordAuditRequest(BaseModel):
    who_agent: str
    what_action: str
    play_version: str
    evidence_refs: List[str] = []
    approved_by: str
    details: Optional[Dict[str, Any]] = {}

@app.get("/api/security/posture")
def get_security_posture():
    return engine.get_security_posture()

@app.post("/api/security/check-scope")
def check_tool_scope(payload: CheckScopeRequest):
    return engine.verify_tool_scope(
        agent_id=payload.agent_id,
        action_type=payload.action_type,
        target=payload.target or ""
    )

@app.post("/api/security/sanitize-evidence")
def sanitize_evidence(payload: SanitizeEvidenceRequest):
    return engine.sanitize_evidence_content(
        raw_text=payload.raw_text,
        source_uri=payload.source_uri or "jira://raw-input"
    )

@app.post("/api/security/test-injection")
def test_prompt_injection(payload: TestInjectionRequest):
    return engine.evaluate_prompt_injection(
        content=payload.content,
        source_system=payload.source_system or "JIRA",
        source_ref=payload.source_ref or "PLAT-4821"
    )

@app.get("/api/security/audit-trail")
def get_full_audit_trail():
    return engine.full_audit_log

@app.post("/api/security/audit-trail")
def create_audit_record(payload: RecordAuditRequest):
    return engine.record_full_audit(
        who_agent=payload.who_agent,
        what_action=payload.what_action,
        play_version=payload.play_version,
        evidence_refs=payload.evidence_refs,
        approved_by=payload.approved_by,
        details=payload.details or {}
    )

@app.post("/api/security/autonomous-signoff")
def create_autonomous_signoff(payload: AutonomousSignOffRequest):
    return engine.create_autonomous_signoff(
        agent_id=payload.agent_id,
        granted_by=payload.granted_by,
        justification=payload.justification,
        scope_permitted=payload.scope_permitted
    )

# ==============================================================================
# SECTION 11: OBSERVABILITY ENDPOINTS
# ==============================================================================

@app.get("/api/observability/overview")
def get_observability_overview():
    return engine.get_observability_overview()

@app.get("/api/observability/health")
def get_system_health():
    return engine.get_system_health()

@app.get("/api/observability/quality")
def get_quality_and_calibration():
    return engine.get_quality_and_calibration()

@app.get("/api/observability/outcomes")
def get_outcome_leadership_metrics():
    return engine.get_outcome_leadership_metrics()

@app.get("/api/observability/traces")
def get_traces_list():
    return engine.get_traces_list()

@app.get("/api/observability/traces/{trace_id}")
def get_trace(trace_id: str):
    trace = engine.get_trace(trace_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Trace '{trace_id}' not found.")
    return trace

# ==============================================================================
# SECTION 12: THE TRUST LADDER ENDPOINTS (CHANT #8)
# ==============================================================================

class TripDemotionRequest(BaseModel):
    trigger_type: Optional[str] = "FALSE_POSITIVE_SPIKE"
    reason: Optional[str] = ""

@app.get("/api/trust-ladder/overview")
def get_trust_ladder_overview():
    return engine.get_trust_ladder_overview()

@app.get("/api/trust-ladder/plays")
def get_trust_ladder_plays():
    return engine.get_trust_ladder_plays()

@app.post("/api/trust-ladder/plays/{play_id}/evaluate")
def evaluate_play_trust(play_id: str):
    try:
        return engine.evaluate_play_trust(play_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/trust-ladder/plays/{play_id}/promote")
def promote_play_trust(play_id: str):
    try:
        return engine.promote_play(play_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/trust-ladder/plays/{play_id}/trip-demotion")
def trip_play_demotion(play_id: str, payload: TripDemotionRequest):
    try:
        return engine.trigger_automatic_demotion(
            play_id=play_id,
            trigger_type=payload.trigger_type or "FALSE_POSITIVE_SPIKE",
            reason=payload.reason or ""
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/trust-ladder/plays/{play_id}/reset")
def reset_play_trust(play_id: str):
    try:
        return engine.reset_play_metrics(play_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/trust-ladder/reset-all")
def reset_all_trust_ladder_plays():
    return engine.reset_all_trust_ladder_plays()

# ==============================================================================
# SECTION 13: REFERENCE TECHNOLOGY POSTURE ENDPOINTS (POSITIONS, NOT PRODUCTS)
# ==============================================================================

class SwapModelRouteRequest(BaseModel):
    new_vendor: str
    new_model_id: str

class ReplayEventBusRequest(BaseModel):
    consumer_group: str
    from_offset: int

class OptimisticMutationApiRequest(BaseModel):
    expected_version: int
    author: Optional[str] = "WriteArbiter"
    mutation_type: Optional[str] = "STATE_UPDATE"
    field_updates: Dict[str, Any] = {}

@app.get("/api/tech-posture/overview")
def get_tech_posture_overview():
    return engine.get_tech_posture_overview()

@app.get("/api/tech-posture/models")
def get_model_gateway_routes():
    return engine.get_model_gateway_routes()

@app.post("/api/tech-posture/models/{route_id}/swap")
def swap_model_gateway_route(route_id: str, payload: SwapModelRouteRequest):
    try:
        return engine.swap_model_gateway_route(
            route_id=route_id,
            new_vendor=payload.new_vendor,
            new_model_id=payload.new_model_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/tech-posture/mcp-tools")
def get_mcp_registrations():
    return engine.get_mcp_registrations()

@app.post("/api/tech-posture/mcp-tools/register")
def register_mcp_tool(payload: Dict[str, Any]):
    try:
        return engine.register_mcp_tool(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/tech-posture/event-bus/subscribers")
def get_durable_subscribers():
    return engine.get_durable_subscribers()

@app.post("/api/tech-posture/event-bus/replay")
def replay_durable_events(payload: ReplayEventBusRequest):
    try:
        return engine.replay_durable_events(
            consumer_group=payload.consumer_group,
            from_offset=payload.from_offset
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/tech-posture/work-objects")
def get_tech_posture_work_objects():
    return engine.work_objects

@app.get("/api/tech-posture/work-objects/{work_id}/versions")
def get_work_object_versions(work_id: str):
    return engine.get_work_object_versions(work_id)

@app.post("/api/tech-posture/work-objects/{work_id}/mutate-optimistic")
def mutate_work_object_optimistic(work_id: str, payload: OptimisticMutationApiRequest):
    try:
        res = engine.mutate_work_object_optimistic(
            work_id=work_id,
            expected_version=payload.expected_version,
            author=payload.author or "WriteArbiter",
            mutation_type=payload.mutation_type or "STATE_UPDATE",
            field_updates=payload.field_updates
        )
        if res.get("conflict_detected"):
            raise HTTPException(status_code=409, detail=res)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/tech-posture/gitops/artifacts")
def get_gitops_artifacts():
    return engine.get_gitops_artifacts()

@app.post("/api/tech-posture/gitops/{artifact_id}/sync")
def sync_gitops_artifact(artifact_id: str):
    try:
        return engine.sync_gitops_artifact(artifact_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/tech-posture/eval-harness/suites")
def get_prompt_eval_suites():
    return engine.get_prompt_eval_suites()

@app.post("/api/tech-posture/eval-harness/{suite_id}/run")
def run_prompt_eval_suite(suite_id: str):
    try:
        return engine.run_prompt_eval_suite(suite_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==============================================================================
# SECTION 15: PROJECT-BASED MULTI-TENANCY & TARGETED PIPELINE EXECUTION
# ==============================================================================

@app.get("/api/projects")
def get_projects():
    return engine.get_projects()

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    proj = engine.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    return proj

@app.post("/api/projects")
def create_project(payload: CreateProjectRequest):
    try:
        return engine.create_project(payload.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/projects/{project_id}/execute")
def execute_project_pipeline(project_id: str, payload: Optional[ExecuteProjectRequest] = None):
    try:
        operator = payload.operator if payload else "Staff Platform Architect"
        trigger_reason = payload.trigger_reason if payload else "Manual Pipeline Trigger via Console"
        lane_override = payload.lane_override if payload else None
        return engine.execute_project_pipeline(
            project_id=project_id,
            operator=operator,
            trigger_reason=trigger_reason,
            lane_override=lane_override
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/projects/{project_id}/golden-tests")
def get_project_golden_tests(project_id: str):
    try:
        return engine.get_project_golden_tests(project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/projects/{project_id}/golden-tests/run")
def run_project_golden_tests(project_id: str, payload: Optional[GoldenTestRunRequest] = None):
    try:
        prompt_ver = payload.prompt_version if payload else "v2.4-strict"
        inject_drift = payload.inject_drift if payload else False
        operator = payload.operator if payload else "CI/CD Harness Runner"
        return engine.run_project_golden_tests(
            project_id=project_id,
            prompt_version=prompt_ver,
            inject_drift=inject_drift,
            operator=operator
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/projects/{project_id}/simulate-failure")
def simulate_project_failure(project_id: str, payload: FailureSimulationRequest):
    try:
        return engine.simulate_project_failure(
            project_id=project_id,
            failure_type=payload.failure_type,
            operator=payload.operator or "Chaos Engineering Lead",
            details=payload.details
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/projects/{project_id}/reset-health")
def reset_project_health(project_id: str):
    try:
        return engine.reset_project_health(project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=6090, reload=True)

