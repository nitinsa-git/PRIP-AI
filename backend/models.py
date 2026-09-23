from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ==============================================================================
# SECTION 4.2: EVIDENCE SERVICE (Shared, not an agent)
# ==============================================================================

class EvidenceItem(BaseModel):
    evidence_id: str  # e.g., 'ev-git-402', 'ev-dd-trace-991'
    source_type: str  # 'LOGS', 'METRICS', 'REPOS', 'TICKETS', 'DOCUMENTS'
    system: str  # 'GitHub', 'Datadog', 'Prometheus', 'Jira', 'Confluence'
    uri: str
    summary: str
    raw_payload: str
    captured_at: str
    verified: bool = True

class EvidencePointer(BaseModel):
    pointer_type: str
    uri: str
    artifact_ref: str
    log_snippet: Optional[str] = None
    captured_at: str

# ==============================================================================
# SECTION 4.3: AGENT MANIFEST SPECIFICATION
# ==============================================================================

class CostProfile(BaseModel):
    tier: str  # 'low' | 'medium' | 'high'
    p50_tokens: int
    p95_latency_ms: int

class AgentQualityMetric(BaseModel):
    metric_name: str
    current_value: str
    target_sla: str
    status: str  # 'HEALTHY', 'WARNING'
    trend: str  # 'IMPROVING', 'STABLE'

class AgentManifest(BaseModel):
    agent_id: str
    version: str
    name: str
    mission: str
    hard_rule: str
    capabilities: List[str]
    inputs_schema: str
    outputs_schema: str
    required_tools: List[str]
    evidence_sources: List[str]
    cost_profile: CostProfile
    write_scope: str  # 'none' | 'proposals_only' | 'gated' | 'autonomous'
    trust_level: str  # 'shadow' | 'advisory' | 'approval_required' | 'autonomous'
    degraded_mode: str
    owner: str
    quality_metric: AgentQualityMetric

# ==============================================================================
# SECTION 4.1.1: INTAKE & INTENT CLARIFICATION
# ==============================================================================

class IntakeEvaluationRequest(BaseModel):
    raw_signal: str
    source_channel: str = "Slack"

class IntakeEvaluationResponse(BaseModel):
    work_object_id: Optional[str] = None
    intent_class: str
    risk_tier: str
    affected_services: List[str]
    confidence_score: float
    requires_clarification: bool  # Rule: if confidence < threshold, it asks. Never guesses.
    clarification_question: Optional[str] = None
    clarification_options: Optional[List[str]] = None
    reclassification_rate_pct: float

# ==============================================================================
# SECTION 4.1.7: RELIABILITY LEARNING LOOP
# ==============================================================================

class RCALearningLoopProposal(BaseModel):
    incident_id: str
    service: str
    root_cause_summary: str
    failure_pattern_recurrence_count: int
    proposed_new_rule_code: str
    proposed_new_rule_title: str
    proposed_rule_category: str
    proposed_rule_description: str
    golden_path_ref: str
    status: str  # 'PROPOSED_TO_CATALOG', 'ADOPTED_INTO_ADR'

# ==============================================================================
# SUBSTRATE & ORCHESTRATION MODELS
# ==============================================================================

class EventBusMessage(BaseModel):
    message_id: str
    topic: str
    source_plane: str
    payload_summary: str
    timestamp: str

class ModelGatewayStats(BaseModel):
    total_calls: int
    deterministic_rule_bypasses: int
    model_reasoning_calls: int
    tokens_consumed: int
    latency_saved_sec: float
    estimated_cost_saved_usd: float
    circuit_breaker_status: str

class SubstrateStatus(BaseModel):
    event_bus_status: str
    event_bus_msg_count: int
    work_object_store_items: int
    evidence_store_pointers: int
    memory_cache_hit_rate: float
    tool_layer_status: str
    model_gateway: ModelGatewayStats
    audit_log_entries_count: int

class AgentContract(BaseModel):
    strictly_owned_sla: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]

class AgentProfile(BaseModel):
    id: str
    name: str
    role_description: str
    plane: str = "PLANE_1_EXECUTION"
    focus_area: str
    business_driver_objective: str
    status: str
    confidence: float
    current_thought: str
    recent_insights: List[str]
    contract: Optional[AgentContract] = None
    manifest: Optional[AgentManifest] = None

class DAGNode(BaseModel):
    node_id: str
    name: str
    assigned_specialist: str
    dependencies: List[str] = []
    status: str
    duration_ms: Optional[int] = None
    cost_usd: float = 0.0
    evidence_generated: Optional[str] = None

class DAGExecutionPlan(BaseModel):
    plan_id: str
    trigger_event: str
    target_work_item: str
    status: str
    nodes: List[DAGNode]
    budget_allocated_usd: float
    budget_used_usd: float
    latency_budget_ms: int
    latency_used_ms: int
    created_at: str

class ReleaseGateDecision(BaseModel):
    gate_id: str
    service_name: str
    release_version: str
    scheduled_window: str
    architecture_authority_vote: str
    architecture_authority_rationale: str
    delivery_governor_vote: str
    delivery_governor_rationale: str
    final_verdict: str
    verdict_operator: Optional[str] = None
    decided_at: Optional[str] = None
    waiver_attached: Optional[str] = None

class AdjudicationOverview(BaseModel):
    release_gates: List[ReleaseGateDecision]
    specialist_conflicts: List[Any]
    debt_challenges: List[Any]
    active_waivers: List[Any]

class CompensatingAction(BaseModel):
    undo_action_type: str
    undo_target: str
    parameters: Dict[str, Any]
    description: str
    timeout_seconds: int = 300

class ControlledAction(BaseModel):
    id: str
    sequence_number: Optional[int] = None
    idempotency_key: str
    agent_name: str
    target_system: str
    action_type: str
    description: str
    parameters: Dict[str, Any]
    risk_level: str
    requires_approval: bool
    status: str
    compensating_action: CompensatingAction
    created_at: str
    executed_at: Optional[str] = None
    result_message: Optional[str] = None
    evidence_pointer: Optional[EvidencePointer] = None

class ArchitectureStandard(BaseModel):
    id: str
    code: str
    title: str
    category: str
    severity: str
    description: str
    golden_path_ref: str

class ArchitectureWaiver(BaseModel):
    id: str
    rule_code: str
    service: str
    named_owner: str
    requester: Optional[str] = None
    justification: str
    mitigation_conditions: List[str]
    age_days: int
    ttl_days: int
    status: str
    risk_level: str
    created_at: str

class StuckWorkAnalysis(BaseModel):
    id: str
    entity_type: str
    entity_key: str
    title: str
    team_or_service: str
    queue_time_hours: float
    total_cycle_hours: float
    queue_time_percent: float
    handoffs: int
    blocker_reason: str
    owning_agent: str
    mathematical_proof: str
    recommended_action: str
    action_id: Optional[str] = None
    evidence_pointers: List[EvidencePointer] = []

class ConformanceViolation(BaseModel):
    rule_code: str
    rule_title: str
    severity: str
    location: str
    detail: str
    remediation: str
    evidence_pointer: Optional[EvidencePointer] = None

class ConformanceEvaluation(BaseModel):
    pr_id: str
    repo: str
    title: str
    author: str
    conforms: bool
    violations: List[ConformanceViolation] = []
    recommended_fix: str
    checked_at: str
    routing_type: str = "DETERMINISTIC_POLICY"
    evidence_pointer: Optional[EvidencePointer] = None

class DebtChallenge(BaseModel):
    id: str
    target_ref: str
    component: str
    shortcut_detected: str
    counter_proposal: str
    debt_impact_score: int
    waiver_eligible: bool
    status: str
    owning_agent: str
    evidence_pointer: Optional[EvidencePointer] = None

class SpecialistConflict(BaseModel):
    id: str
    topic: str
    context_ref: str
    agent_a_name: str
    agent_a_stance: str
    agent_a_evidence: EvidencePointer
    agent_b_name: str
    agent_b_stance: str
    agent_b_evidence: EvidencePointer
    verbatim_dissent: str
    status: str
    escalated_at: str

class PlayAutonomyRecord(BaseModel):
    play_id: str
    play_name: str
    current_level: int
    level_name: str
    consecutive_clean_plays: int
    threshold_for_promotion: int = 20
    total_executions: int
    rollbacks_count: int
    reversible: bool = True
    last_evaluated: str

class DeclaredCapability(BaseModel):
    id: str
    name: str
    owning_agent_id: str
    owning_agent_name: str
    description: str
    deterministic_supported: bool

class OutcomeMetrics(BaseModel):
    period_name: str
    is_baseline: bool
    lead_time_median_hours: float
    lead_time_p90_hours: float
    deployment_frequency_per_week: float
    change_failure_rate_percent: float
    mttr_hours: float
    queue_time_percent: float
    standards_conformance_rate_percent: float
    rework_percentage: float
    waiver_count: int
    mean_waiver_age_days: float

class InvariantProof(BaseModel):
    number: int
    title: str
    quote: str
    rationale: str
    enforcement_layer: str
    live_telemetry_proof: str
    compliant: bool = True

# --- Section 5: Orchestration and Routing Models ---

class WorkSource(BaseModel):
    system: str
    ref: str

class BlastRadius(BaseModel):
    services: List[str]
    score: float

class WorkRequester(BaseModel):
    id: str
    team: str

class WorkSLA(BaseModel):
    due: str

class WorkPlayRef(BaseModel):
    id: str
    version: str

class WorkBudget(BaseModel):
    tokens_used: int = 0
    tokens_cap: int = 150000
    wall_clock_used_s: float = 0.0
    wall_clock_cap_s: float = 300.0
    cost_used_usd: float = 0.0
    cost_cap_usd: float = 2.50

class AuditLogItem(BaseModel):
    timestamp: str
    actor: str
    event: str
    details: Optional[Dict[str, Any]] = None

class WorkFinding(BaseModel):
    finding_id: str
    source_agent: str
    finding_type: str
    title: str
    details: str
    confidence: float = 1.0
    is_partial: bool = False
    budget_exhausted: Optional[str] = None
    evidence_pointer: Optional[EvidencePointer] = None
    created_at: str

class WorkDecision(BaseModel):
    decision_id: str
    plane: str = "PLANE_3_ADJUDICATION"
    verdict: str
    rationale: str
    decided_by: str
    decided_at: str

class WorkObject(BaseModel):
    work_id: str
    created_at: str
    source: WorkSource
    intent_class: str
    risk_tier: str
    blast_radius: BlastRadius
    time_pressure: str = "standard"
    requester: WorkRequester
    sla: WorkSLA
    play: WorkPlayRef
    lane: str = "STANDARD"  # FAST, STANDARD, HEAVY
    state: str = "in_analysis"  # draft, in_analysis, reconciled, in_adjudication, committed, degraded, rolled_back
    findings: List[WorkFinding] = []
    decisions: List[WorkDecision] = []
    evidence_refs: List[str] = []
    budget: WorkBudget
    audit: List[AuditLogItem] = []

class LaneUpgradeRequest(BaseModel):
    work_id: str
    requested_lane: str  # FAST, STANDARD, HEAVY
    reason: str
    agent_id: str
    evidence_pointer: Optional[EvidencePointer] = None

class PlayDAGNode(BaseModel):
    node_id: str
    name: str
    type: str  # intake, parallel_scatter, gather_reconcile, plan, gate, execute
    agents: List[str] = []
    dependencies: List[str] = []
    on_conflict: Optional[str] = None  # escalate_to_plane3, retry, fail
    status: str = "pending"

class PlayDefinition(BaseModel):
    id: str
    version: str
    name: str
    lane: str  # FAST, STANDARD, HEAVY
    trust_level: int = 1
    budget: WorkBudget
    nodes: List[PlayDAGNode]
    degraded_mode_play_ref: Optional[str] = None
    description: str
    yaml_raw: str

class RoutingRule(BaseModel):
    rule_id: str
    intent_class: str
    risk_tier: str
    blast_radius_threshold: float
    time_pressure: str
    assigned_play_id: str
    assigned_lane: str
    rationale: str

class RuleCandidateHarvestRecord(BaseModel):
    id: str
    timestamp: str
    work_id: str
    input_keys: Dict[str, Any]
    fallback_reason: str
    model_suggested_play: str
    model_suggested_lane: str
    model_confidence: float
    occurrences_count: int = 1
    graduated_to_rule: bool = False

# ==============================================================================
# SECTION 6: SUPER AGENTS & THE CHALLENGE PROTOCOL MODELS
# ==============================================================================

class WaiverRecord6(BaseModel):
    waiver_id: str
    rule: str
    granted_to: str
    reason: str
    compensating_control: str
    risk_accepted_by: str
    expires: str
    review_cadence: str = "monthly"
    status: str = "ACTIVE"  # ACTIVE, EXPIRED, REVOKED
    created_at: str
    yaml_raw: Optional[str] = None

class SuperAuthorityProfile(BaseModel):
    id: str
    name: str
    title: str
    stance: str
    adversarial_focus: str
    responsibilities: List[str]
    challenge_metric: str
    status: str = "DELIBERATING"
    recent_quotes: List[str] = []

class ChallengeProtocolStep(BaseModel):
    phase: str  # PROPOSE, CHALLENGE, DEFEND, DECIDE, RECORD
    timestamp: str
    actor: str
    content: str
    evidence_pointer: Optional[EvidencePointer] = None
    status: str = "COMPLETED"

class EscalationPacket(BaseModel):
    session_id: str
    target_service: str
    risk_tier: str
    trigger_reasons: List[str]
    architecture_authority_stance: str
    architecture_authority_dissent: str
    delivery_governor_stance: str
    delivery_governor_dissent: str
    rejected_alternatives: List[str]
    created_at: str

class ChallengeProtocolSession(BaseModel):
    session_id: str
    work_id: Optional[str] = None
    title: str
    target_service: str
    risk_tier: str
    current_phase: str  # PROPOSE, CHALLENGE, DEFEND, DECIDE, RECORD, ESCALATED_TO_HUMAN
    proposed_by: str
    confidence: float
    steps: List[ChallengeProtocolStep] = []
    verbatim_dissent: Optional[str] = None
    final_decision: Optional[str] = None
    escalation_packet: Optional[EscalationPacket] = None
    created_at: str
    updated_at: str

# ==============================================================================
# SECTION 7: INTER-AGENT COMMUNICATION & MEMORY MODEL
# ==============================================================================

class MessageSender(BaseModel):
    agent_id: str
    version: str

class MessageEnvelope(BaseModel):
    msg_id: str
    work_id: str
    correlation_id: str
    sender: MessageSender
    recipient: str  # MUST be a capability URI, e.g. "capability:findings.reconcile"
    intent: str
    payload: Dict[str, Any] = {}
    evidence_refs: List[str] = []
    confidence: float = 1.0
    issued_at: str
    ttl_s: int = 120
    trace_id: str

class BlackboardWriteRequest(BaseModel):
    work_id: str
    version_lock: int
    field: str
    value: Any
    actor: str

class SynchronousChannelSpec(BaseModel):
    capability_uri: str
    description: str
    caller_agent: str
    target_provider: str
    max_timeout_ms: int = 2000
    is_blocking: bool = True

class EpisodicMemoryRun(BaseModel):
    work_id: str
    active_run_id: str
    intermediate_reasoning: List[str]
    transient_context: Dict[str, Any]
    started_at: str
    status: str = "ACTIVE"  # ACTIVE, KILLED, PURGED, COMPLETED

class MemoryModelStatus(BaseModel):
    episodic_runs_count: int
    semantic_standards_count: int
    semantic_adrs_count: int
    semantic_waivers_count: int
    procedural_plays_count: int
    procedural_rules_count: int
    episodic_reset_safe: bool = True
    semantic_reset_safe: bool = False
    procedural_reset_safe: bool = False
    recent_episodic_runs: List[EpisodicMemoryRun] = []

# ==============================================================================
# SECTION 8: PARALLEL EXECUTION, RECONCILIATION & SPECULATIVE SUBSYSTEM
# ==============================================================================

class ScatterGatherBranch(BaseModel):
    branch_id: str
    agent_id: str
    capability_invoked: str
    status: str = "COMPLETED"  # COMPLETED, RUNNING, FAILED
    wall_clock_ms: int
    tokens_used: int
    findings_count: int

class ScatterGatherExecutionRun(BaseModel):
    run_id: str
    work_id: str
    play_node: str = "analyze"
    branches: List[ScatterGatherBranch] = []
    total_wall_clock_ms: int
    serial_equivalent_ms: int
    latency_saved_ms: int
    concurrency_factor: float
    total_tokens_used: int
    initiated_at: str
    status: str = "COMPLETED"

class DroppedFindingEvidenceAudit(BaseModel):
    finding_id: str
    agent_id: str
    unresolvable_evidence_ref: str
    drop_reason: str = "Chant #2: Dropped finding with unresolvable evidence reference"
    dropped_at: str

class DeduplicatedFindingCluster(BaseModel):
    cluster_id: str
    root_cause_summary: str
    contributing_findings: List[str]
    participating_agents: List[str]
    severity: str
    evidence_refs: List[str]

class ReconciliationConflictSignal(BaseModel):
    conflict_id: str
    rule_or_topic: str
    agent_a: str
    claim_a: str
    confidence_a: float
    agent_b: str
    claim_b: str
    confidence_b: float
    verdict_action: str = "ESCALATE_TO_PLANE_3"
    escalation_rationale: str = "Chant #5: Contradictory findings are not averaged and not resolved by reconciler. Specialist disagreement is a first-class signal."

class ReconciliationResult(BaseModel):
    reconciliation_id: str
    work_id: str
    raw_findings_count: int
    step1_dropped_unbacked: List[DroppedFindingEvidenceAudit] = []
    step2_deduplicated_clusters: List[DeduplicatedFindingCluster] = []
    step3_conflicts_escalated: List[ReconciliationConflictSignal] = []
    surviving_clean_findings_count: int
    reconciled_at: str

class WritePathSubmission(BaseModel):
    action_id: str
    work_id: str
    idempotency_key: str
    version_lock: int
    sequence_number: Optional[int] = None
    status: str = "COMMITTED"
    mutated_target: str
    actor: str
    timestamp: str

class SpeculativeBranch(BaseModel):
    branch_id: str
    approach_name: str
    strategy_type: str
    tokens_spent: int
    latency_ms: int
    confidence: float
    outcome: str  # WINNER_COMMITTED, DISCARDED_LOSER
    discard_rationale: Optional[str] = None

class SpeculativeExecutionRun(BaseModel):
    speculative_run_id: str
    work_id: str
    lane: str  # FAST, STANDARD, HEAVY
    policy_allowed: bool
    policy_message: str
    competing_branches: List[SpeculativeBranch] = []
    winning_branch_id: Optional[str] = None
    speculative_investment_tokens: int
    latency_bought_ms: int
    executed_at: str

# ==============================================================================
# SECTION 9: FAULT TOLERANCE, REDUNDANCY & REPLAY MODELS
# ==============================================================================

class CircuitBreakerItem(BaseModel):
    target_id: str
    target_type: str  # TOOL or MODEL
    state: str = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    failure_count: int = 0
    failure_threshold: int = 5
    recovery_timeout_s: int = 30
    last_failure_at: Optional[str] = None
    last_state_change: str

class BulkheadPool(BaseModel):
    pool_id: str
    target_system: str
    max_concurrency: int
    active_slots: int
    queued_requests: int
    rejected_requests: int

class ResilienceStatus(BaseModel):
    circuit_breakers: List[CircuitBreakerItem]
    bulkheads: List[BulkheadPool]
    backoff_config: Dict[str, Any]

class ModelLadderStep(BaseModel):
    tier_level: int
    tier_name: str
    model_id: str
    max_confidence: float
    cost_per_1k_tokens: float
    status: str = "SUCCESS"  # SUCCESS, FAILED_OVER, SKIPPED

class ModelLadderExecution(BaseModel):
    execution_id: str
    work_id: str
    steps: List[ModelLadderStep]
    winning_tier: int
    final_model_used: str
    recorded_confidence: float
    is_degraded: bool
    confidence_discount_percent: float
    reasoning_output: str
    executed_at: str

class DegradedModeChecklist(BaseModel):
    item_id: str
    task: str
    status: str = "COLLECTED"
    detail: str

class DegradedRunExecution(BaseModel):
    run_id: str
    work_id: str
    play_id: str
    pipeline_blocked: bool = False  # Chant #6: minimum safe action, blocks nothing
    checklist: List[DegradedModeChecklist]
    facts_collected: Dict[str, Any]
    human_notified: str
    executed_at: str

class DeadLetterQueueItem(BaseModel):
    dlq_id: str
    work_id: str
    intent_class: str
    risk_tier: str
    failure_step: str
    retry_count: int = 3
    max_retries: int = 3
    error_trace: str
    snapshot_state: Dict[str, Any]
    enqueued_at: str
    status: str = "UNTRIAGED"  # UNTRIAGED, RETRIED, PURGED, RESOLVED

class DualPathBranch(BaseModel):
    path_id: str
    agent_name: str
    model_used: str
    evidence_framing: str
    verdict: str
    confidence: float
    rationale: str

class DualPathRedundancyRun(BaseModel):
    run_id: str
    work_id: str
    risk_tier: str = "T1"
    path_a: DualPathBranch
    path_b: DualPathBranch
    consensus_status: str  # AGREEMENT_HIGH_CONFIDENCE or DISAGREEMENT_HUMAN_ROUTED
    final_confidence: float
    routed_to: str
    created_at: str

class RunReplayStep(BaseModel):
    step_index: int
    timestamp: str
    event: str
    source_plane: str
    actor: str
    state_delta: Dict[str, Any]
    payload_summary: str

class RunReplaySession(BaseModel):
    work_id: str
    total_events: int
    steps: List[RunReplayStep]
    initial_state: Dict[str, Any]
    final_state: Dict[str, Any]

# ==============================================================================
# SECTION 10: SECURITY AND AUDIT MODELS
# ==============================================================================

class AgentSecurityScope(BaseModel):
    agent_id: str
    version: str
    write_scope: str  # read_only, proposals_only, autonomous
    allowed_mutations: List[str] = []
    is_autonomous_approved: bool = False
    sign_off_ref: Optional[str] = None

class AutonomousSignOffRecord(BaseModel):
    signoff_id: str
    agent_id: str
    granted_by: str
    justification: str
    scope_permitted: str
    effective_date: str
    review_cadence: str = "quarterly"

class DataProvenance(BaseModel):
    source_system: str
    source_ref: str
    is_untrusted_data: bool = True
    tagged_at: str
    quarantined_enclosure: str = "<untrusted_data>"

class ProvenanceTaggedContent(BaseModel):
    content_id: str
    raw_content: str
    sanitized_content: str
    provenance: DataProvenance
    injection_detected: bool = False
    injection_markers: List[str] = []

class RedactedSecretAudit(BaseModel):
    secret_id: str
    pattern_type: str  # AWS_KEY, JWT, API_TOKEN, DB_CREDENTIAL
    redacted_placeholder: str
    source_uri: str
    redacted_at: str

class EvidenceSanitizationResult(BaseModel):
    evidence_id: str
    original_length: int
    sanitized_content: str
    secrets_redacted_count: int
    redactions: List[RedactedSecretAudit] = []

class FullAuditRecord(BaseModel):
    audit_id: str
    who_agent: str
    what_action: str
    when_timestamp: str
    play_version: str
    evidence_refs: List[str] = []
    approved_by: str
    status: str = "COMMITTED"
    details: Dict[str, Any] = {}

# ==============================================================================
# SECTION 11: OBSERVABILITY (THREE LAYERS & DISTRIBUTED TRACING)
# ==============================================================================

class QueueDepthMetric(BaseModel):
    queue_name: str
    depth: int
    max_capacity: int
    status: str = "HEALTHY"  # HEALTHY, ELEVATED, CRITICAL

class AgentLatencyMetric(BaseModel):
    agent_id: str
    p50_ms: int
    p95_ms: int
    call_count: int

class ToolErrorMetric(BaseModel):
    tool_id: str
    calls_count: int
    errors_count: int
    error_rate_pct: float
    status: str = "HEALTHY"

class SystemHealthMetrics(BaseModel):
    status: str = "HEALTHY"
    queue_depths: List[QueueDepthMetric]
    agent_latencies: List[AgentLatencyMetric]
    tool_error_rates: List[ToolErrorMetric]
    circuit_breakers_summary: Dict[str, int]
    dlq_depth: int
    budget_exhaustion_frequency_pct: float
    budget_exhaustion_runs_count: int
    total_runs_evaluated: int

class AgentQualityStat(BaseModel):
    agent_id: str
    agent_name: str
    total_findings: int
    accepted_findings: int
    acceptance_rate_pct: float
    false_positive_rate_pct: float
    quality_sla_status: str = "MEETS_SLA"

class ConfidenceCalibrationBin(BaseModel):
    bin_range: str  # e.g. "0.50 - 0.60"
    predicted_confidence_midpoint: float  # e.g. 0.55
    empirical_accuracy_pct: float  # e.g. 54.2
    sample_count: int
    calibration_gap_pct: float  # e.g. 0.8

class QualityMetrics(BaseModel):
    status: str = "OPTIMAL"
    agent_stats: List[AgentQualityStat]
    aggregate_false_positive_rate_pct: float
    escalation_rate_pct: float
    human_override_rate_pct: float
    brier_score: float
    expected_calibration_error: float
    calibration_bins: List[ConfidenceCalibrationBin]

class TraceSpan(BaseModel):
    span_id: str
    parent_span_id: Optional[str] = None
    name: str
    span_type: str  # AGENT, TOOL, MODEL, ORCHESTRATION
    actor: str
    start_time_offset_ms: int
    duration_ms: int
    tokens_spent: int = 0
    status: str = "OK"  # OK, ERROR, DEGRADED
    details: Dict[str, Any] = {}

class DistributedTrace(BaseModel):
    trace_id: str
    work_id: str
    play_id: str
    start_time: str
    total_duration_ms: int
    total_tokens: int
    total_cost_usd: float
    root_status: str = "SUCCESS"
    spans: List[TraceSpan] = []

class ObservabilitySummary(BaseModel):
    health: SystemHealthMetrics
    quality: QualityMetrics
    outcomes: Dict[str, Any]
    active_traces_count: int

# ==============================================================================
# SECTION 12: THE TRUST LADDER (PER-PLAY AUTONOMY - CHANT #8)
# ==============================================================================

class DemotionTrigger(BaseModel):
    trigger_type: str  # FALSE_POSITIVE_SPIKE, SEVERITY_INCIDENT, CALIBRATION_DROP
    threshold: str
    active_metric_val: str
    is_tripped: bool = False
    rule_statement: str = "Demotion is automatic and does not require a meeting."

class PromotionProgress(BaseModel):
    metric_name: str
    current_val: float
    target_val: float
    display_current: str
    display_target: str
    pct_complete: float
    eligible_for_promotion: bool = False

class TrustLadderHistory(BaseModel):
    timestamp: str
    previous_rung: str
    new_rung: str
    event_type: str  # PROMOTION, AUTOMATIC_DEMOTION, RESET
    reason: str
    triggered_by: str  # AUTOMATIC_SENTINEL, OPERATOR_EVAL

class PlayTrustLadderItem(BaseModel):
    play_id: str
    play_name: str
    owning_agent_id: str
    v1_sequence_order: int
    risk_tier: str  # LOW, MEDIUM, HIGH, CRITICAL
    current_rung: str  # SHADOW, ADVISORY, APPROVAL_REQUIRED, AUTONOMOUS
    behaviour: str
    promotion_criterion: str
    promotion_progress: PromotionProgress
    demotion_trigger: DemotionTrigger
    consecutive_clean_runs: int = 0
    total_runs: int = 0
    last_evaluated_at: str
    history: List[TrustLadderHistory] = []

class TrustLadderOverview(BaseModel):
    plays_by_rung: Dict[str, int]
    total_plays: int
    chant_8_statement: str = "Autonomy is earned per Play, not per agent and never globally (Chant #8)."
    v1_sequencing_status: str
    plays: List[PlayTrustLadderItem]

# ==============================================================================
# SECTION 13: REFERENCE TECHNOLOGY POSTURE (POSITIONS, NOT PRODUCTS)
# ==============================================================================

class ModelGatewayRoute(BaseModel):
    route_id: str
    tier_name: str  # PRIMARY, SECONDARY, UTILITY, DETERMINISTIC
    purpose: str
    active_vendor: str  # Anthropic, OpenAI, Google, Local-Ollama
    active_model_id: str
    fallback_vendor: str
    fallback_model_id: str
    latency_p95_ms: int
    cost_per_million_tokens_usd: float
    context_window_tokens: int
    swappable: bool = True
    status: str = "HEALTHY"

class MCPToolRegistration(BaseModel):
    tool_id: str
    system_of_record: str  # Jira, GitHub, Datadog, ServiceNow, Kubernetes, Jenkins
    mcp_server_url: str
    protocol_version: str = "2024-11-05"
    capability: str
    methods_exposed: List[str]
    input_schema: Dict[str, Any]
    registered_at: str
    is_active: bool = True
    health_status: str = "ONLINE"

class DurableEventSubscriber(BaseModel):
    consumer_group: str
    subscribed_topic: str
    committed_offset: int
    latest_bus_offset: int
    lag: int
    durable_retention_days: int = 30
    last_acked_at: str
    replay_in_progress: bool = False

class WorkObjectVersionSnapshot(BaseModel):
    version: int
    timestamp: str
    author: str
    change_summary: str
    state_hash: str
    fields_modified: List[str]

class OptimisticMutationRequest(BaseModel):
    work_id: str
    expected_version: int
    author: str
    mutation_type: str
    field_updates: Dict[str, Any]

class OptimisticMutationResult(BaseModel):
    status: str  # COMMITTED, CONFLICT_REJECTED
    work_id: str
    committed_version: int
    expected_version: int
    current_version: int
    message: str
    conflict_detected: bool = False

class GitOpsArtifact(BaseModel):
    artifact_id: str
    artifact_type: str  # PLAY, MANIFEST, POLICY
    relative_path: str
    repo_url: str
    commit_sha: str
    pr_number: Optional[int] = None
    review_status: str  # APPROVED, MERGED, PENDING_REVIEW
    policy_lint_status: str  # PASS, WARNING, FAIL
    deployed_version: str
    last_synced_at: str

class PromptTestCase(BaseModel):
    case_id: str
    scenario_name: str
    input_fixture: str
    expected_behavior: str
    actual_output_summary: str
    pass_assertion: bool
    eval_score: float
    latency_ms: int

class PromptEvalSuite(BaseModel):
    suite_id: str
    target_play_id: str
    prompt_file: str
    prompt_version: str
    golden_dataset_size: int
    test_cases: List[PromptTestCase]
    overall_accuracy_pct: float
    all_passed: bool
    last_run_at: str

class TechPostureOverview(BaseModel):
    positions_statement: str = "Deliberately non-prescriptive on vendors. Positions, not products."
    model_gateway: Dict[str, Any]
    mcp_protocol_layer: Dict[str, Any]
    event_bus_durable: Dict[str, Any]
    work_object_store: Dict[str, Any]
    gitops_config: Dict[str, Any]
    prompt_eval_harness: Dict[str, Any]

# ==============================================================================
# SECTION 15: PROJECT-BASED MULTI-TENANCY & TARGETED EXECUTION
# ==============================================================================

class Project(BaseModel):
    project_id: str
    name: str
    repo_url: str
    tier: str
    tech_stack: List[str]
    autonomy_rung: str
    conformance_score: float
    active_prs: int
    stuck_items_count: int
    write_scope: str
    golden_set_path: str
    specialists_assigned: List[str]
    description: str
    health_status: str
    execution_history: Optional[List[Dict[str, Any]]] = None

class CreateProjectRequest(BaseModel):
    project_id: str
    name: str
    repo_url: str
    tier: Optional[str] = "Tier-2 Platform"
    tech_stack: Optional[List[str]] = ["Python", "FastAPI"]
    autonomy_rung: Optional[str] = "Shadow"
    write_scope: Optional[str] = "proposals_only"
    golden_set_path: Optional[str] = "evals/golden/suite.json"
    description: Optional[str] = "Service onboarded to PRIP-AI Reasoning Layer"

class ExecuteProjectRequest(BaseModel):
    operator: Optional[str] = "Staff Platform Architect"
    trigger_reason: Optional[str] = "Manual Pipeline Trigger via Console"
    lane_override: Optional[str] = None  # None (auto), 'FAST_LANE', 'STANDARD_DAG'

# ==============================================================================
# SECTION 15.2: GOLDEN SET TEST HARNESS & FAILURE SIMULATION
# ==============================================================================

class GoldenTestCase(BaseModel):
    test_id: str
    name: str
    category: str  # 'INVARIANT_CHECK', 'SECURITY_BOUNDARY', 'PERFORMANCE_BUDGET', 'SCHEMA_COMPAT'
    input_trigger: str
    expected_invariant: str
    target_agent: str
    status: str = "PENDING"  # 'PASSED', 'FAILED', 'REGRESSION', 'PENDING'
    latency_ms: int = 0
    token_usage: int = 0
    assertion_details: str

class GoldenTestSuite(BaseModel):
    project_id: str
    suite_id: str
    suite_path: str
    play_version: str
    baseline_pass_rate_pct: float
    last_evaluated_at: Optional[str] = None
    sla_threshold_pct: float = 95.0
    total_test_cases: int
    test_cases: List[GoldenTestCase]

class GoldenTestRunRequest(BaseModel):
    operator: Optional[str] = "CI/CD Harness Runner"
    prompt_version: Optional[str] = "v2.4-strict"
    inject_drift: Optional[bool] = False

class GoldenTestRunResponse(BaseModel):
    run_id: str
    project_id: str
    timestamp: str
    operator: str
    prompt_version: str
    total_cases: int
    passed_cases: int
    failed_cases: int
    pass_rate_pct: float
    regression_detected: bool
    regression_delta_pct: float
    autonomy_action: str  # 'MAINTAINED', 'AUTO_DEMOTED', 'FLAGGED_FOR_REVIEW'
    test_results: List[Dict[str, Any]]
    summary: str

class FailureSimulationRequest(BaseModel):
    failure_type: str  # 'demotion' | 'arbiter_conflict' | 'circuit_breaker' | 'debt_veto'
    operator: Optional[str] = "Chaos Engineering Lead"
    details: Optional[Dict[str, Any]] = None

class FailureSimulationResponse(BaseModel):
    simulation_id: str
    project_id: str
    failure_type: str
    timestamp: str
    impact_level: str
    project_health_before: str
    project_health_after: str
    autonomy_rung_before: str
    autonomy_rung_after: str
    circuit_breaker_status: str
    events_emitted: List[str]
    audit_log_id: str
    summary: str
    remediation_recommendation: str






