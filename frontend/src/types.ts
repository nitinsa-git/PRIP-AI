// ==============================================================================
// SECTION 4.2: EVIDENCE SERVICE (Shared Retrieval Layer)
// ==============================================================================
export interface EvidenceItem {
  evidence_id: string;
  source_type: 'LOGS' | 'METRICS' | 'REPOS' | 'TICKETS' | 'DOCUMENTS';
  system: string;
  uri: string;
  summary: string;
  raw_payload: string;
  captured_at: string;
  verified: boolean;
}

export interface EvidencePointer {
  pointer_type: string;
  uri: string;
  artifact_ref: string;
  log_snippet?: string;
  captured_at: string;
}

// ==============================================================================
// SECTION 4.3: AGENT MANIFEST SPECIFICATION
// ==============================================================================
export interface CostProfile {
  tier: 'low' | 'medium' | 'high';
  p50_tokens: number;
  p95_latency_ms: number;
}

export interface AgentQualityMetric {
  metric_name: string;
  current_value: string;
  target_sla: string;
  status: 'HEALTHY' | 'WARNING';
  trend: 'IMPROVING' | 'STABLE';
}

export interface AgentManifest {
  agent_id: string;
  version: string;
  name: string;
  mission: string;
  hard_rule: string;
  capabilities: string[];
  inputs_schema: string;
  outputs_schema: string;
  required_tools: string[];
  evidence_sources: string[];
  cost_profile: CostProfile;
  write_scope: 'none' | 'proposals_only' | 'gated' | 'autonomous';
  trust_level: 'shadow' | 'advisory' | 'approval_required' | 'autonomous';
  degraded_mode: string;
  owner: string;
  quality_metric: AgentQualityMetric;
}

// ==============================================================================
// SECTION 4.1.1 & 4.1.7 SPECIALIZED OPERATIONS
// ==============================================================================
export interface IntakeEvaluationResponse {
  work_object_id?: string;
  intent_class: string;
  risk_tier: string;
  affected_services: string[];
  confidence_score: number;
  requires_clarification: boolean;
  clarification_question?: string;
  clarification_options?: string[];
  reclassification_rate_pct: number;
}

export interface RCALearningLoopProposal {
  incident_id: string;
  service: string;
  root_cause_summary: string;
  failure_pattern_recurrence_count: number;
  proposed_new_rule_code: string;
  proposed_new_rule_title: string;
  proposed_rule_category: string;
  proposed_rule_description: string;
  golden_path_ref: string;
  status: string;
}

// ==============================================================================
// THREE PLANES & SUBSTRATE INTERFACES
// ==============================================================================
export interface EventBusMessage {
  message_id: string;
  topic: string;
  source_plane: string;
  payload_summary: string;
  timestamp: string;
}

export interface ModelGatewayStats {
  total_calls: number;
  deterministic_rule_bypasses: number;
  model_reasoning_calls: number;
  tokens_consumed: number;
  latency_saved_sec: number;
  estimated_cost_saved_usd: number;
  circuit_breaker_status: string;
}

export interface SubstrateData {
  telemetry: {
    event_bus_status: string;
    event_bus_msg_count: number;
    work_object_store_items: number;
    evidence_store_pointers: number;
    memory_cache_hit_rate: number;
    tool_layer_status: string;
    model_gateway: ModelGatewayStats;
    audit_log_entries_count: number;
  };
  recent_event_bus_messages: EventBusMessage[];
  evidence_store_items?: EvidenceItem[];
}

export interface DAGNode {
  node_id: string;
  name: string;
  assigned_specialist: string;
  dependencies: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  duration_ms?: number;
  cost_usd: number;
  evidence_generated?: string;
}

export interface DAGExecutionPlan {
  plan_id: string;
  trigger_event: string;
  target_work_item: string;
  status: string;
  nodes: DAGNode[];
  budget_allocated_usd: number;
  budget_used_usd: number;
  latency_budget_ms: number;
  latency_used_ms: number;
  created_at: string;
}

export interface ReleaseGateDecision {
  gate_id: string;
  service_name: string;
  release_version: string;
  scheduled_window: string;
  architecture_authority_vote: 'APPROVE' | 'CHALLENGE_BLOCK' | 'ABSTAIN';
  architecture_authority_rationale: string;
  delivery_governor_vote: 'APPROVE' | 'CHALLENGE_BLOCK' | 'ABSTAIN';
  delivery_governor_rationale: string;
  final_verdict: 'PENDING_DELIBERATION' | 'GATE_OPENED_PROD' | 'GATE_LOCKED_BLOCKED';
  verdict_operator?: string;
  decided_at?: string;
  waiver_attached?: string;
}

export interface AdjudicationData {
  release_gates: ReleaseGateDecision[];
  specialist_conflicts: SpecialistConflict[];
  debt_challenges: DebtChallenge[];
  active_waivers: ArchitectureWaiver[];
}

export interface PlanesOverview {
  substrate: {
    status: string;
    summary: string;
    event_bus_messages: number;
    evidence_pointers_verified: number;
    work_objects_tracked: number;
    model_gateway_cost_saved: number;
  };
  plane_1_execution: {
    status: string;
    summary: string;
    specialist_count: number;
    active_specialists: string[];
    declared_capabilities: number;
  };
  plane_2_orchestration: {
    status: string;
    summary: string;
    active_dag_plans: number;
    policy_first_ratio: string;
    serialized_writes_committed: number;
    unsourced_claims_discarded: number;
  };
  plane_3_adjudication: {
    status: string;
    summary: string;
    peers: string[];
    active_release_gates: number;
    open_disputes: number;
    active_waivers: number;
  };
}

// ==============================================================================
// BASE REASONING & INVARIANT INTERFACES
// ==============================================================================
export interface CompensatingAction {
  undo_action_type: string;
  undo_target: string;
  parameters: Record<string, any>;
  description: string;
  timeout_seconds: number;
}

export interface SystemStatus {
  status: string;
  last_sync: string;
  [key: string]: any;
}

export interface SystemsOfRecord {
  git: SystemStatus;
  cicd: SystemStatus;
  itsm: SystemStatus;
  cmdb: SystemStatus;
  observability: SystemStatus;
  knowledge_base: SystemStatus;
}

export interface RoutingTelemetry {
  deterministic_checks_count: number;
  model_fallback_count: number;
  deterministic_ratio_pct: number;
  latency_saved_ms: number;
  cost_saved_usd: number;
}

export interface OutcomeMetrics {
  period_name: string;
  is_baseline: boolean;
  lead_time_median_hours: number;
  lead_time_p90_hours: number;
  deployment_frequency_per_week: number;
  change_failure_rate_percent: number;
  mttr_hours: number;
  queue_time_percent: number;
  standards_conformance_rate_percent: number;
  rework_percentage: number;
  waiver_count: number;
  mean_waiver_age_days: number;
}

export interface MetricsResponse {
  baseline: OutcomeMetrics;
  active: OutcomeMetrics;
  improvements: {
    lead_time_median_reduction_pct: number;
    lead_time_p90_reduction_pct: number;
    deployment_frequency_multiplier: number;
    change_failure_rate_reduction_pct: number;
    mttr_reduction_pct: number;
    queue_time_pct_reduction: number;
    standards_conformance_gain_pct: number;
    rework_reduction_pct: number;
    mean_waiver_age_reduction_pct: number;
  };
  routing_telemetry?: RoutingTelemetry;
}

export interface StuckWorkItem {
  id: string;
  project_id?: string;
  entity_type: 'PR' | 'TICKET' | 'PIPELINE' | 'INCIDENT' | 'CRON_JOB' | 'JIRA';
  entity_key: string;
  title: string;
  team_or_service: string;
  queue_time_hours: number;
  total_cycle_hours: number;
  queue_time_percent: number;
  handoffs: number;
  blocker_reason: string;
  owning_agent: string;
  mathematical_proof: string;
  recommended_action: string;
  action_id?: string;
  evidence_pointers: EvidencePointer[];
}

export interface ConformanceViolation {
  rule_code: string;
  rule_title: string;
  severity: string;
  location: string;
  detail: string;
  remediation: string;
  evidence_pointer?: EvidencePointer;
}

export interface ConformanceEvaluation {
  pr_id: string;
  project_id?: string;
  repo: string;
  title: string;
  author: string;
  conforms: boolean;
  violations: ConformanceViolation[];
  recommended_fix: string;
  checked_at: string;
  routing_type?: string;
  evidence_pointer?: EvidencePointer;
}

export interface ArchitectureStandard {
  id: string;
  code: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  golden_path_ref: string;
}

export interface DebtChallenge {
  id: string;
  project_id?: string;
  target_ref: string;
  component: string;
  shortcut_detected: string;
  counter_proposal: string;
  debt_impact_score: number;
  waiver_eligible: boolean;
  status: 'OPEN' | 'WAIVED' | 'RESOLVED' | 'ESCALATED_TO_SUPER_AGENT';
  owning_agent: string;
  evidence_pointer?: EvidencePointer;
}

export interface ArchitectureWaiver {
  id: string;
  project_id?: string;
  rule_code: string;
  service: string;
  named_owner: string;
  requester?: string;
  justification: string;
  mitigation_conditions: string[];
  age_days: number;
  ttl_days: number;
  status: 'ACTIVE' | 'EXPIRED' | 'REVIEW_NEEDED' | 'RESOLVED' | 'APPROVED';
  risk_level: string;
  created_at: string;
}

export interface AgentContract {
  strictly_owned_sla: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
}

export interface AgentProfile {
  id: string;
  name: string;
  role_description: string;
  plane?: string;
  focus_area: string;
  business_driver_objective: string;
  status: 'ANALYZING' | 'MONITORING' | 'CHALLENGING' | 'IDLE';
  confidence: number;
  current_thought: string;
  recent_insights: string[];
  contract?: AgentContract;
  manifest?: AgentManifest;
}

export interface ControlledAction {
  id: string;
  sequence_number?: number;
  idempotency_key: string;
  agent_name: string;
  target_system: string;
  action_type: string;
  description: string;
  parameters: Record<string, any>;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  requires_approval: boolean;
  status: 'QUEUED' | 'PENDING_APPROVAL' | 'EXECUTED' | 'ROLLED_BACK';
  compensating_action: CompensatingAction;
  created_at: string;
  executed_at?: string;
  result_message?: string;
  evidence_pointer?: EvidencePointer;
}

export interface AuditLogEntry {
  timestamp: string;
  sequence_number?: number;
  action_id: string;
  agent: string;
  target_system: string;
  action_type: string;
  operator: string;
  description: string;
  undo_registered?: string;
  status: string;
}

export interface InvariantProof {
  number: number;
  title: string;
  quote: string;
  rationale: string;
  enforcement_layer: string;
  live_telemetry_proof: string;
  compliant: boolean;
}

export interface ArbiterStatus {
  arbiter_mode: string;
  current_sequence: number;
  committed_writes_count: number;
  idempotency_keys_cached: number;
  recent_sequence_log: Array<{
    sequence_number: number;
    action_id: string;
    target_system: string;
    action_type: string;
    idempotency_key: string;
    committed_at: string;
  }>;
  parallel_read_threads_active: number;
}

export interface SpecialistConflict {
  id: string;
  topic: string;
  context_ref: string;
  agent_a_name: string;
  agent_a_stance: string;
  agent_a_evidence: EvidencePointer;
  agent_b_name: string;
  agent_b_stance: string;
  agent_b_evidence: EvidencePointer;
  verbatim_dissent: string;
  status: string;
  escalated_at: string;
}

export interface PlayAutonomyRecord {
  play_id: string;
  play_name: string;
  current_level: number;
  level_name: string;
  consecutive_clean_plays: number;
  threshold_for_promotion: number;
  total_executions: number;
  rollbacks_count: number;
  reversible: boolean;
  last_evaluated: string;
}

export interface DeclaredCapability {
  id: string;
  name: string;
  owning_agent_id: string;
  owning_agent_name: string;
  description: string;
  deterministic_supported: boolean;
}

// ==============================================================================
// SECTION 5: ORCHESTRATION AND ROUTING INTERFACES
// ==============================================================================

export interface WorkSource {
  system: string;
  ref: string;
}

export interface BlastRadius {
  services: string[];
  score: number;
}

export interface WorkRequester {
  id: string;
  team: string;
}

export interface WorkSLA {
  due: string;
}

export interface WorkPlayRef {
  id: string;
  version: string;
}

export interface WorkBudget {
  tokens_used: number;
  tokens_cap: number;
  wall_clock_used_s: number;
  wall_clock_cap_s: number;
  cost_used_usd: number;
  cost_cap_usd: number;
}

export interface WorkFinding {
  finding_id: string;
  source_agent: string;
  finding_type: string;
  title: string;
  details: string;
  confidence: number;
  is_partial: boolean;
  budget_exhausted?: string;
  evidence_pointer?: EvidencePointer;
  created_at: string;
}

export interface WorkDecision {
  decision_id: string;
  plane: string;
  verdict: string;
  rationale: string;
  decided_by: string;
  decided_at: string;
}

export interface WorkObject {
  work_id: string;
  created_at: string;
  source: WorkSource;
  intent_class: string;
  risk_tier: string;
  blast_radius: BlastRadius;
  time_pressure: string;
  requester: WorkRequester;
  sla: WorkSLA;
  play: WorkPlayRef;
  lane: 'FAST' | 'STANDARD' | 'HEAVY';
  state: 'draft' | 'in_analysis' | 'reconciled' | 'in_adjudication' | 'committed' | 'degraded' | 'rolled_back';
  findings: WorkFinding[];
  decisions: WorkDecision[];
  evidence_refs: string[];
  budget: WorkBudget;
  audit: Array<{
    timestamp: string;
    actor: string;
    event: string;
    details?: Record<string, any>;
  }>;
}

export interface PlayDAGNode {
  node_id: string;
  name: string;
  type: string;
  agents: string[];
  dependencies: string[];
  on_conflict?: string;
  status: string;
}

export interface PlayDefinition {
  id: string;
  version: string;
  name: string;
  lane: 'FAST' | 'STANDARD' | 'HEAVY';
  trust_level: number;
  budget: WorkBudget;
  nodes: PlayDAGNode[];
  degraded_mode_play_ref?: string;
  description: string;
  yaml_raw: string;
}

export interface RoutingRule {
  rule_id: string;
  intent_class: string;
  risk_tier: string;
  blast_radius_threshold: number;
  time_pressure: string;
  assigned_play_id: string;
  assigned_lane: 'FAST' | 'STANDARD' | 'HEAVY';
  rationale: string;
}

export interface RuleCandidateHarvestRecord {
  id: string;
  timestamp: string;
  work_id: string;
  input_keys: {
    intent_class: string;
    risk_tier: string;
    blast_radius_score: number;
    time_pressure: string;
  };
  fallback_reason: string;
  model_suggested_play: string;
  model_suggested_lane: 'FAST' | 'STANDARD' | 'HEAVY';
  model_confidence: number;
  occurrences_count: number;
  graduated_to_rule: boolean;
}

// ==============================================================================
// SECTION 6: SUPER AGENTS & CHALLENGE PROTOCOL INTERFACES
// ==============================================================================

export interface WaiverRecord6 {
  waiver_id: string;
  rule: string;
  granted_to: string;
  reason: string;
  compensating_control: string;
  risk_accepted_by: string;
  expires: string;
  review_cadence: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  created_at: string;
  yaml_raw?: string;
}

export interface SuperAuthorityProfile {
  id: string;
  name: string;
  title: string;
  stance: string;
  adversarial_focus: string;
  responsibilities: string[];
  challenge_metric: string;
  status: string;
  recent_quotes: string[];
}

export interface ChallengeProtocolStep {
  phase: 'PROPOSE' | 'CHALLENGE' | 'DEFEND' | 'DECIDE' | 'RECORD';
  timestamp: string;
  actor: string;
  content: string;
  evidence_pointer?: EvidencePointer;
  status: string;
}

export interface EscalationPacket {
  session_id: string;
  target_service: string;
  risk_tier: string;
  trigger_reasons: string[];
  architecture_authority_stance: string;
  architecture_authority_dissent: string;
  delivery_governor_stance: string;
  delivery_governor_dissent: string;
  rejected_alternatives: string[];
  created_at: string;
}

export interface ChallengeProtocolSession {
  session_id: string;
  work_id?: string;
  title: string;
  target_service: string;
  risk_tier: string;
  current_phase: 'PROPOSE' | 'CHALLENGE' | 'DEFEND' | 'DECIDE' | 'RECORD' | 'ESCALATED_TO_HUMAN';
  proposed_by: string;
  confidence: number;
  steps: ChallengeProtocolStep[];
  verbatim_dissent?: string;
  final_decision?: string;
  escalation_packet?: EscalationPacket;
  created_at: string;
  updated_at: string;
}

// ==============================================================================
// SECTION 7: INTER-AGENT COMMUNICATION & THREE-TIER MEMORY MODEL
// ==============================================================================

export interface MessageSender {
  agent_id: string;
  version: string;
  instance_id?: string;
}

export interface MessageEnvelope {
  msg_id: string;
  work_id: string;
  correlation_id: string;
  sender: MessageSender;
  recipient: string; // capability:<domain>.<action>
  intent: string;
  payload: Record<string, any>;
  evidence_refs: string[];
  confidence: number;
  issued_at: string;
  ttl_s: number;
  trace_id: string;
}

export interface CapabilitySubscription {
  capability_uri: string;
  description: string;
  subscribers: string[];
  event_count_24h: number;
  sample_payload_schema: Record<string, any>;
}

export interface SynchronousChannelSpec {
  capability_uri: string;
  description: string;
  caller_agent: string;
  target_provider: string;
  max_timeout_ms: number;
  is_blocking: boolean;
}

export interface BlackboardStatus {
  active_work_objects_count: number;
  concurrent_read_lock: string;
  serialized_write_lock: string;
  optimistic_version_tokens: Record<string, number>;
}

export interface CommunicationChannelsData {
  synchronous_catalog: SynchronousChannelSpec[];
  capability_subscriptions: CapabilitySubscription[];
  blackboard_status: BlackboardStatus;
}

export interface EpisodicMemoryRun {
  work_id: string;
  active_run_id: string;
  intermediate_reasoning: string[];
  transient_context: Record<string, any>;
  started_at: string;
  status: string;
}

export interface MemoryModelStatus {
  episodic_runs_count: number;
  semantic_standards_count: number;
  semantic_adrs_count: number;
  semantic_waivers_count: number;
  procedural_plays_count: number;
  procedural_rules_count: number;
  episodic_reset_safe: boolean;
  semantic_reset_safe: boolean;
  procedural_reset_safe: boolean;
  recent_episodic_runs: EpisodicMemoryRun[];
}

// ==============================================================================
// SECTION 8: PARALLEL EXECUTION, RECONCILIATION & SPECULATIVE SUBSYSTEM
// ==============================================================================

export interface ScatterGatherBranch {
  branch_id: string;
  agent_id: string;
  capability_invoked: string;
  status: string;
  wall_clock_ms: number;
  tokens_used: number;
  findings_count: number;
}

export interface ScatterGatherExecutionRun {
  run_id: string;
  work_id: string;
  play_node: string;
  branches: ScatterGatherBranch[];
  total_wall_clock_ms: number;
  serial_equivalent_ms: number;
  latency_saved_ms: number;
  concurrency_factor: number;
  total_tokens_used: number;
  initiated_at: string;
  status: string;
}

export interface DroppedFindingEvidenceAudit {
  finding_id: string;
  agent_id: string;
  unresolvable_evidence_ref: string;
  drop_reason: string;
  dropped_at: string;
}

export interface DeduplicatedFindingCluster {
  cluster_id: string;
  root_cause_summary: string;
  contributing_findings: string[];
  participating_agents: string[];
  severity: string;
  evidence_refs: string[];
}

export interface ReconciliationConflictSignal {
  conflict_id: string;
  rule_or_topic: string;
  agent_a: string;
  claim_a: string;
  confidence_a: number;
  agent_b: string;
  claim_b: string;
  confidence_b: number;
  verdict_action: string;
  escalation_rationale: string;
}

export interface ReconciliationResult {
  reconciliation_id: string;
  work_id: string;
  raw_findings_count: number;
  step1_dropped_unbacked: DroppedFindingEvidenceAudit[];
  step2_deduplicated_clusters: DeduplicatedFindingCluster[];
  step3_conflicts_escalated: ReconciliationConflictSignal[];
  surviving_clean_findings_count: number;
  reconciled_at: string;
}

export interface WritePathSubmission {
  action_id: string;
  work_id: string;
  idempotency_key: string;
  version_lock: number;
  sequence_number?: number;
  status: string;
  mutated_target: string;
  actor: string;
  timestamp: string;
}

export interface SpeculativeBranch {
  branch_id: string;
  approach_name: string;
  strategy_type: string;
  tokens_spent: number;
  latency_ms: number;
  confidence: number;
  outcome: string;
  discard_rationale?: string;
}

export interface SpeculativeExecutionRun {
  speculative_run_id: string;
  work_id: string;
  lane: string;
  policy_allowed: boolean;
  policy_message: string;
  competing_branches: SpeculativeBranch[];
  winning_branch_id?: string;
  speculative_investment_tokens: number;
  latency_bought_ms: number;
  executed_at: string;
}

// ==============================================================================
// SECTION 9: FAULT TOLERANCE, REDUNDANCY & REPLAY INTERFACES
// ==============================================================================

export interface CircuitBreakerItem {
  target_id: string;
  target_type: string;
  state: string; // CLOSED, OPEN, HALF_OPEN
  failure_count: number;
  failure_threshold: number;
  recovery_timeout_s: number;
  last_failure_at?: string;
  last_state_change: string;
}

export interface BulkheadPool {
  pool_id: string;
  target_system: string;
  max_concurrency: number;
  active_slots: number;
  queued_requests: number;
  rejected_requests: number;
}

export interface ResilienceStatus {
  circuit_breakers: CircuitBreakerItem[];
  bulkheads: BulkheadPool[];
  backoff_config: Record<string, any>;
}

export interface ModelLadderStep {
  tier_level: number;
  tier_name: string;
  model_id: string;
  max_confidence: number;
  cost_per_1k_tokens: number;
  status: string;
}

export interface ModelLadderExecution {
  execution_id: string;
  work_id: string;
  steps: ModelLadderStep[];
  winning_tier: number;
  final_model_used: string;
  recorded_confidence: number;
  is_degraded: boolean;
  confidence_discount_percent: number;
  reasoning_output: string;
  executed_at: string;
}

export interface DegradedModeChecklist {
  item_id: string;
  task: string;
  status: string;
  detail: string;
}

export interface DegradedRunExecution {
  run_id: string;
  work_id: string;
  play_id: string;
  pipeline_blocked: boolean;
  checklist: DegradedModeChecklist[];
  facts_collected: Record<string, any>;
  human_notified: string;
  executed_at: string;
}

export interface DeadLetterQueueItem {
  dlq_id: string;
  work_id: string;
  intent_class: string;
  risk_tier: string;
  failure_step: string;
  retry_count: number;
  max_retries: number;
  error_trace: string;
  snapshot_state: Record<string, any>;
  enqueued_at: string;
  status: string;
}

export interface DualPathBranch {
  path_id: string;
  agent_name: string;
  model_used: string;
  evidence_framing: string;
  verdict: string;
  confidence: number;
  rationale: string;
}

export interface DualPathRedundancyRun {
  run_id: string;
  work_id: string;
  risk_tier: string;
  path_a: DualPathBranch;
  path_b: DualPathBranch;
  consensus_status: string;
  final_confidence: number;
  routed_to: string;
  created_at: string;
}

export interface RunReplayStep {
  step_index: number;
  timestamp: string;
  event: string;
  source_plane: string;
  actor: string;
  state_delta: Record<string, any>;
  payload_summary: string;
}

export interface RunReplaySession {
  work_id: string;
  total_events: number;
  steps: RunReplayStep[];
  initial_state: Record<string, any>;
  final_state: Record<string, any>;
}

// ==============================================================================
// SECTION 10: SECURITY AND AUDIT TYPES
// ==============================================================================

export interface AgentSecurityScope {
  agent_id: string;
  version: string;
  write_scope: 'read_only' | 'proposals_only' | 'autonomous';
  allowed_mutations: string[];
  is_autonomous_approved: boolean;
  sign_off_ref: string | null;
}

export interface AutonomousSignOffRecord {
  signoff_id: string;
  agent_id: string;
  granted_by: string;
  justification: string;
  scope_permitted: string;
  effective_date: string;
  review_cadence: string;
}

export interface RedactedSecretAudit {
  secret_id: string;
  pattern_type: string;
  redacted_placeholder: string;
  source_uri: string;
  redacted_at: string;
}

export interface SecurityPosture {
  status: string;
  scopes_breakdown: {
    read_only: number;
    proposals_only: number;
    autonomous: number;
    total_agents: number;
    least_privilege_ratio_pct: number;
  };
  agent_scopes: AgentSecurityScope[];
  autonomous_signoffs: AutonomousSignOffRecord[];
  secrets_redacted_stats: {
    total_secrets_redacted: number;
    pattern_breakdown: Record<string, number>;
    pre_retrieval_enforcement: string;
  };
  prompt_injection_stats: {
    total_provenance_tagged: number;
    injection_attempts_neutralized: number;
    severity_1_defects_incurred: number;
    enclosure_rule: string;
  };
  audit_trail_stats: {
    total_audit_events: number;
    tuple_conformance: string;
    recent_records: FullAuditRecord[];
  };
}

export interface ToolScopeCheckResult {
  allowed: boolean;
  status: string;
  agent_id?: string;
  write_scope?: string;
  action_type?: string;
  target?: string;
  message?: string;
  error_code?: string;
  reason?: string;
  sign_off_ref?: string;
}

export interface EvidenceSanitizationResult {
  evidence_id: string;
  original_length: number;
  sanitized_content: string;
  secrets_redacted_count: number;
  redactions: RedactedSecretAudit[];
}

export interface DataProvenance {
  source_system: string;
  source_ref: string;
  is_untrusted_data: boolean;
  tagged_at: string;
  quarantined_enclosure: string;
}

export interface ProvenanceTaggedContent {
  content_id: string;
  raw_content: string;
  sanitized_content: string;
  provenance: DataProvenance;
  injection_detected: boolean;
  injection_markers: string[];
  posture_statement: string;
}

export interface FullAuditRecord {
  audit_id: string;
  who_agent: string;
  what_action: string;
  when_timestamp: string;
  play_version: string;
  evidence_refs: string[];
  approved_by: string;
  status: string;
  details?: Record<string, any>;
}

// ==============================================================================
// SECTION 11: OBSERVABILITY TYPES (THREE LAYERS & DISTRIBUTED TRACING)
// ==============================================================================

export interface QueueDepthMetric {
  queue_name: string;
  depth: number;
  max_capacity: number;
  status: 'HEALTHY' | 'ELEVATED' | 'CRITICAL';
}

export interface AgentLatencyMetric {
  agent_id: string;
  p50_ms: number;
  p95_ms: number;
  call_count: number;
}

export interface ToolErrorMetric {
  tool_id: string;
  calls_count: number;
  errors_count: number;
  error_rate_pct: number;
  status: string;
}

export interface SystemHealthMetrics {
  status: string;
  queue_depths: QueueDepthMetric[];
  agent_latencies: AgentLatencyMetric[];
  tool_error_rates: ToolErrorMetric[];
  circuit_breakers_summary: Record<string, number>;
  dlq_depth: number;
  budget_exhaustion_frequency_pct: number;
  budget_exhaustion_runs_count: number;
  total_runs_evaluated: number;
}

export interface AgentQualityStat {
  agent_id: string;
  agent_name: string;
  total_findings: number;
  accepted_findings: number;
  acceptance_rate_pct: number;
  false_positive_rate_pct: number;
  quality_sla_status: string;
}

export interface ConfidenceCalibrationBin {
  bin_range: string;
  predicted_confidence_midpoint: number;
  empirical_accuracy_pct: number;
  sample_count: number;
  calibration_gap_pct: number;
}

export interface QualityMetrics {
  status: string;
  agent_stats: AgentQualityStat[];
  aggregate_false_positive_rate_pct: number;
  escalation_rate_pct: number;
  human_override_rate_pct: number;
  brier_score: number;
  expected_calibration_error: number;
  calibration_bins: ConfidenceCalibrationBin[];
}

export interface LeadershipOutcomeComparison {
  metric_key: string;
  label: string;
  baseline_val: string;
  active_val: string;
  delta_pct: number;
  status: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface LeadershipOutcomeDashboard {
  title: string;
  subtitle: string;
  baseline: Record<string, any>;
  active: Record<string, any>;
  comparisons: LeadershipOutcomeComparison[];
}

export interface TraceSpan {
  span_id: string;
  parent_span_id?: string | null;
  name: string;
  span_type: 'AGENT' | 'TOOL' | 'MODEL' | 'ORCHESTRATION';
  actor: string;
  start_time_offset_ms: number;
  duration_ms: number;
  tokens_spent: number;
  status: 'OK' | 'ERROR' | 'DEGRADED';
  details?: Record<string, any>;
}

export interface DistributedTrace {
  trace_id: string;
  work_id: string;
  play_id: string;
  start_time: string;
  total_duration_ms: number;
  total_tokens: number;
  total_cost_usd: number;
  root_status: string;
  spans: TraceSpan[];
}

export interface TraceSummary {
  trace_id: string;
  work_id: string;
  play_id: string;
  start_time: string;
  total_duration_ms: number;
  total_tokens: number;
  total_cost_usd: number;
  root_status: string;
  span_count: number;
}

export interface ObservabilityOverview {
  health: SystemHealthMetrics;
  quality: QualityMetrics;
  outcomes: LeadershipOutcomeDashboard;
  active_traces_count: number;
  recent_traces: TraceSummary[];
}

// ==============================================================================
// SECTION 12: THE TRUST LADDER TYPES (CHANT #8)
// ==============================================================================

export type TrustRung = 'SHADOW' | 'ADVISORY' | 'APPROVAL_REQUIRED' | 'AUTONOMOUS';

export interface DemotionTrigger {
  trigger_type: 'FALSE_POSITIVE_SPIKE' | 'SEVERITY_INCIDENT' | 'CALIBRATION_DROP' | string;
  threshold: string;
  active_metric_val: string;
  is_tripped: boolean;
  rule_statement: string;
}

export interface PromotionProgress {
  metric_name: string;
  current_val: number;
  target_val: number;
  display_current: string;
  display_target: string;
  pct_complete: number;
  eligible_for_promotion: boolean;
}

export interface TrustLadderHistory {
  timestamp: string;
  previous_rung: TrustRung | string;
  new_rung: TrustRung | string;
  event_type: 'PROMOTION' | 'AUTOMATIC_DEMOTION' | 'RESET';
  reason: string;
  triggered_by: string;
}

export interface PlayTrustLadderItem {
  play_id: string;
  play_name: string;
  owning_agent_id: string;
  v1_sequence_order: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  current_rung: TrustRung;
  behaviour: string;
  promotion_criterion: string;
  promotion_progress: PromotionProgress;
  demotion_trigger: DemotionTrigger;
  consecutive_clean_runs: number;
  total_runs: number;
  last_evaluated_at: string;
  history: TrustLadderHistory[];
}

export interface TrustLadderOverview {
  plays_by_rung: Record<TrustRung, number>;
  total_plays: number;
  chant_8_statement: string;
  v1_sequencing_status: string;
  plays: PlayTrustLadderItem[];
}

// ==============================================================================
// SECTION 13: REFERENCE TECHNOLOGY POSTURE (POSITIONS, NOT PRODUCTS)
// ==============================================================================

export interface ModelGatewayRoute {
  route_id: string;
  tier_name: 'PRIMARY' | 'SECONDARY' | 'UTILITY' | 'DETERMINISTIC_FALLBACK' | string;
  purpose: string;
  active_vendor: string;
  active_model_id: string;
  fallback_vendor: string;
  fallback_model_id: string;
  latency_p95_ms: number;
  cost_per_million_tokens_usd: number;
  context_window_tokens: number;
  swappable: boolean;
  status: 'HEALTHY' | 'DEGRADED' | 'CIRCUIT_OPEN' | string;
}

export interface MCPToolRegistration {
  tool_id: string;
  system_of_record: string;
  mcp_server_url: string;
  protocol_version: string;
  capability: string;
  methods_exposed: string[];
  input_schema: Record<string, any>;
  registered_at: string;
  is_active: boolean;
  health_status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | string;
}

export interface DurableEventSubscriber {
  consumer_group: string;
  subscribed_topic: string;
  committed_offset: number;
  latest_bus_offset: number;
  lag: number;
  durable_retention_days: number;
  last_acked_at: string;
  replay_in_progress: boolean;
}

export interface WorkObjectVersionSnapshot {
  version: number;
  timestamp: string;
  author: string;
  change_summary: string;
  state_hash: string;
  fields_modified: string[];
}

export interface OptimisticMutationResult {
  status: 'COMMITTED' | 'CONFLICT_REJECTED';
  work_id: string;
  committed_version: number;
  expected_version: number;
  current_version: number;
  message: string;
  conflict_detected: boolean;
}

export interface GitOpsArtifact {
  artifact_id: string;
  artifact_type: 'PLAY' | 'MANIFEST' | 'POLICY' | string;
  relative_path: string;
  repo_url: string;
  commit_sha: string;
  pr_number?: number;
  review_status: 'APPROVED' | 'MERGED' | 'PENDING_REVIEW' | string;
  policy_lint_status: 'PASS' | 'WARNING' | 'FAIL' | string;
  deployed_version: string;
  last_synced_at: string;
}

export interface PromptTestCase {
  case_id: string;
  scenario_name: string;
  input_fixture: string;
  expected_behavior: string;
  actual_output_summary: string;
  pass_assertion: boolean;
  eval_score: number;
  latency_ms: number;
}

export interface PromptEvalSuite {
  suite_id: string;
  target_play_id: string;
  prompt_file: string;
  prompt_version: string;
  golden_dataset_size: number;
  test_cases: PromptTestCase[];
  overall_accuracy_pct: number;
  all_passed: boolean;
  last_run_at: string;
}

export interface TechPostureOverview {
  positions_statement: string;
  model_gateway: {
    active_routes_count: number;
    hot_swappable: boolean;
    vendors_represented: string[];
    avg_latency_p95_ms: number;
    status: string;
  };
  mcp_protocol_layer: {
    registered_systems_count: number;
    standard_protocol: string;
    systems: string[];
    active_tools_count: number;
  };
  event_bus_durable: {
    consumer_groups_count: number;
    total_lag: number;
    retention_policy: string;
    replay_capable: boolean;
  };
  work_object_store: {
    tracked_objects_count: number;
    concurrency_model: string;
    versioned_lineage_available: boolean;
  };
  gitops_config: {
    tracked_artifacts_count: number;
    posture: string;
    all_lint_passed: boolean;
  };
  prompt_eval_harness: {
    suites_count: number;
    total_golden_cases: number;
    avg_golden_accuracy_pct: number;
    rule: string;
  };
}

// ==============================================================================
// SECTION 15: PROJECT-BASED MULTI-TENANCY & TARGETED PIPELINE EXECUTION
// ==============================================================================

export interface ProjectExecutionRecord {
  run_id: string;
  timestamp: string;
  operator: string;
  trigger_reason?: string;
  lane: 'FAST_LANE' | 'STANDARD_DAG';
  result: 'SUCCESS' | 'WARNING' | 'QUARANTINED' | 'INITIALIZED';
  work_object_id: string;
  conformance_passed: boolean;
  autonomy_rung?: string;
  summary: string;
}

export interface Project {
  project_id: string;
  name: string;
  repo_url: string;
  tier: string;
  tech_stack: string[];
  autonomy_rung: 'Shadow' | 'Advisory' | 'Approval-required' | 'Autonomous';
  conformance_score: number;
  active_prs: number;
  stuck_items_count: number;
  write_scope: string;
  golden_set_path: string;
  specialists_assigned: string[];
  description: string;
  health_status: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  execution_history?: ProjectExecutionRecord[];
}

export interface CreateProjectPayload {
  project_id: string;
  name: string;
  repo_url: string;
  tier?: string;
  tech_stack?: string[];
  autonomy_rung?: string;
  write_scope?: string;
  golden_set_path?: string;
  description?: string;
}

export interface ExecuteProjectResponse {
  status: string;
  project_id: string;
  execution: ProjectExecutionRecord;
  project: Project;
}




