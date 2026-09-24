from typing import List, Dict, Any

# ==============================================================================
# SECTION 4.2: EVIDENCE SERVICE REPOSITORY (Shared, not an agent)
# ==============================================================================
SEED_EVIDENCE_STORE = [
    {
        "evidence_id": "ev-git-402",
        "source_type": "REPOS",
        "system": "GitHub",
        "uri": "git://github.com/corp/auth-gateway/pull/402",
        "summary": "PR #402 diff: 4 files changed, +142 -18 lines in src/oauth/pkce.py",
        "raw_payload": "commit 8f2a41b149 | author: @sprint-dev | date: 2026-09-18T08:14:00Z\n+ def verify_pkce_challenge(verifier: str, challenge: str, method: str = 'S256'):\n+     return hashlib.sha256(verifier.encode()).digest() == base64url_decode(challenge)",
        "captured_at": "2026-09-22T15:30:00Z",
        "verified": True
    },
    {
        "evidence_id": "ev-jira-8821",
        "source_type": "TICKETS",
        "system": "Jira",
        "uri": "jira://browse/PAY-8821#history",
        "summary": "PAY-8821 changelog: 6 status transitions between Core API, QA, and Compliance",
        "raw_payload": "Transition 1: Open -> In Progress (Core API, 12h)\nTransition 2: In Progress -> In Review (QA, 18h)\nTransition 3: In Review -> Blocked (Compliance, 26h)\nTransition 4: Blocked -> In Progress (Core API, 14h)\nTransition 5: In Progress -> QA Verification (QA, 19h)\nTotal Queue Time: 89.0h / Total Cycle: 115.5h",
        "captured_at": "2026-09-22T15:15:00Z",
        "verified": True
    },
    {
        "evidence_id": "ev-cicd-1209",
        "source_type": "LOGS",
        "system": "Jenkins",
        "uri": "cicd://pipelines/order-dispatch/runs/1209/console",
        "summary": "Runner queue starvation log: 19.5 hours idle in queue waiting for db-heavy worker node",
        "raw_payload": "[2026-09-21 21:00:12] INFO [pipeline-scheduler] Enqueued job #1209.\n[2026-09-22 16:30:14] WARN [worker-pool] Pool 'db-heavy' at 100% capacity (8/8 active).\n[2026-09-22 16:30:15] WARN [worker-pool] Job queue age exceeded threshold: 19.5 hours.",
        "captured_at": "2026-09-22T14:50:00Z",
        "verified": True
    },
    {
        "evidence_id": "ev-dd-trace-canary",
        "source_type": "METRICS",
        "system": "Datadog",
        "uri": "datadog://traces/trace-88912?span=c24",
        "summary": "APM Trace #88912: Connection pool starvation causing p99 latency spike to 310ms",
        "raw_payload": "Span: postgres.acquire_connection | Duration: 284ms (Normal: 4ms)\nMetric: postgres.connections.active | Value: 442/500 (88.4%)\nError: None (Latency Degradation Warning)",
        "captured_at": "2026-09-22T15:05:00Z",
        "verified": True
    },
    {
        "evidence_id": "ev-adr-coupling-01",
        "source_type": "DOCUMENTS",
        "system": "Confluence",
        "uri": "confluence://spaces/ARCH/pages/ADR-001-cross-domain-rpc",
        "summary": "ADR-001: Mandatory Decoupling of Cross-Domain RPC Ingress via Events or Fallbacks",
        "raw_payload": "Context: Synchronous cascades during Black Friday caused 4-hour checkout outage.\nDecision: Direct HTTP calls across bounded contexts are forbidden without circuit breakers and fallback events.\nStatus: APPROVED | Authority: Architecture Council",
        "captured_at": "2026-09-01T10:00:00Z",
        "verified": True
    }
]

# ==============================================================================
# SECTION 4.3: AGENT MANIFESTS (The 8 Specialists)
# ==============================================================================
SEED_AGENT_MANIFESTS = [
    {
        "agent_id": "intake-intent",
        "version": "2.1.0",
        "name": "Intake & Intent Agent",
        "mission": "Turn any inbound signal into a valid Work Object. Nothing else.",
        "hard_rule": "If classification confidence is below threshold (< 0.80), it asks. It never guesses. Bad intake is the number-one killer of these systems.",
        "capabilities": ["intake.normalize", "intent.classify", "risk.tier", "blast_radius.estimate"],
        "inputs_schema": "schemas/inbound_signal.v2.json",
        "outputs_schema": "schemas/work_object.v2.json",
        "required_tools": ["jira.read", "slack.read", "datadog.alerts.read", "confluence.read"],
        "evidence_sources": ["jira", "slack", "pagerduty", "datadog"],
        "cost_profile": {"tier": "low", "p50_tokens": 3500, "p95_latency_ms": 1200},
        "write_scope": "proposals_only",
        "trust_level": "approval_required",
        "degraded_mode": "raw_signal_pass_through_with_manual_flag",
        "owner": "platform-experience",
        "quality_metric": {
            "metric_name": "Downstream Reclassification Rate",
            "current_value": "3.1%",
            "target_sla": "< 5.0%",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    },
    {
        "agent_id": "arch-conformance",
        "version": "2.4.0",
        "name": "Architecture Conformance Agent",
        "mission": "Apply the standards catalog at the moment of decision.",
        "hard_rule": "Never emit a bare 'non-compliant.' A finding without a proposed path forward gets routed around within a quarter.",
        "capabilities": ["standards.evaluate", "merge_gate.assess", "conforming_path.generate"],
        "inputs_schema": "schemas/pr_diff.v2.json",
        "outputs_schema": "schemas/conformance_finding.v2.json",
        "required_tools": ["git.read", "adr_catalog.read", "tech_radar.query"],
        "evidence_sources": ["github", "confluence", "git_iac"],
        "cost_profile": {"tier": "medium", "p50_tokens": 8500, "p95_latency_ms": 3200},
        "write_scope": "proposals_only",
        "trust_level": "advisory",
        "degraded_mode": "static_ast_regex_rule_check_only",
        "owner": "architecture-office",
        "quality_metric": {
            "metric_name": "Finding Acceptance Rate",
            "current_value": "94.2%",
            "target_sla": "> 90.0%",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    },
    {
        "agent_id": "flow-analyst",
        "version": "1.3.0",
        "name": "Flow Analyst Agent",
        "mission": "Find bottlenecks with numbers.",
        "hard_rule": "Every claim is a measurement over a stated window, not an impression.",
        "capabilities": ["bottleneck.detect", "cycle_time.analyze", "wip.assess", "handoff.trace"],
        "inputs_schema": "schemas/work_object.v2.json",
        "outputs_schema": "schemas/finding.v2.json",
        "required_tools": ["work_tracker.read", "ci.read", "metrics.query"],
        "evidence_sources": ["jira", "github", "jenkins", "prometheus"],
        "cost_profile": {"tier": "medium", "p50_tokens": 12000, "p95_latency_ms": 9000},
        "write_scope": "proposals_only",
        "trust_level": "advisory",
        "degraded_mode": "metrics_only_deterministic_report",
        "owner": "platform-engineering",
        "quality_metric": {
            "metric_name": "Cycle-Time Improvement Rate (Addressed Bottlenecks)",
            "current_value": "88.6%",
            "target_sla": "> 80.0%",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    },
    {
        "agent_id": "dependency-impact",
        "version": "1.8.0",
        "name": "Dependency & Impact Agent",
        "mission": "Answer 'what breaks if we touch this' and 'who else is in this path right now.'",
        "hard_rule": "Continuous cross-service collision scanning; flags concurrent schema lock risks.",
        "capabilities": ["blast_radius.map", "collision.warn", "sequencing.suggest"],
        "inputs_schema": "schemas/change_intent.v2.json",
        "outputs_schema": "schemas/impact_map.v2.json",
        "required_tools": ["cmdb.graph.read", "api_contracts.query", "change_calendar.read"],
        "evidence_sources": ["cmdb", "swagger_hub", "datadog_service_map"],
        "cost_profile": {"tier": "medium", "p50_tokens": 9200, "p95_latency_ms": 4500},
        "write_scope": "proposals_only",
        "trust_level": "advisory",
        "degraded_mode": "static_cmdb_direct_edges_only",
        "owner": "sre-core",
        "quality_metric": {
            "metric_name": "Incidents Traceable to Undetected Dependencies",
            "current_value": "0.0%",
            "target_sla": "0.0%",
            "status": "HEALTHY",
            "trend": "STABLE"
        }
    },
    {
        "agent_id": "build-release",
        "version": "2.0.1",
        "name": "Build & Release Agent",
        "mission": "Pipeline health and safe promotion.",
        "hard_rule": "A flaky test is a defect with an owner, not background noise.",
        "capabilities": ["pipeline.optimize", "flaky_test.isolate", "rollback_readiness.check"],
        "inputs_schema": "schemas/ci_run_telemetry.v2.json",
        "outputs_schema": "schemas/promotion_plan.v2.json",
        "required_tools": ["jenkins.api", "github_actions.api", "artifact_registry.read"],
        "evidence_sources": ["jenkins", "github_actions", "jfrog_artifactory"],
        "cost_profile": {"tier": "medium", "p50_tokens": 11000, "p95_latency_ms": 6000},
        "write_scope": "gated",
        "trust_level": "approval_required",
        "degraded_mode": "linear_stage_promotion_with_timeout_cap",
        "owner": "release-engineering",
        "quality_metric": {
            "metric_name": "Pipeline Success Rate",
            "current_value": "96.4%",
            "target_sla": "> 95.0%",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    },
    {
        "agent_id": "code-review",
        "version": "1.7.0",
        "name": "Code & Design Review Agent",
        "mission": "PR-level review against conventions, coverage, and secure-coding patterns.",
        "hard_rule": "Escalates recurring pattern drift signals to Architecture Conformance.",
        "capabilities": ["pr_diff.review", "drift.detect", "reviewer_queue.balance"],
        "inputs_schema": "schemas/pr_diff.v2.json",
        "outputs_schema": "schemas/review_comments.v2.json",
        "required_tools": ["git.read", "sonar.read", "snyk.read"],
        "evidence_sources": ["github", "sonarqube", "snyk"],
        "cost_profile": {"tier": "high", "p50_tokens": 18000, "p95_latency_ms": 12000},
        "write_scope": "proposals_only",
        "trust_level": "advisory",
        "degraded_mode": "linter_and_sast_rules_only",
        "owner": "appsec-team",
        "quality_metric": {
            "metric_name": "Comment Acceptance Rate",
            "current_value": "91.8%",
            "target_sla": "> 85.0%",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    },
    {
        "agent_id": "reliability-agent",
        "version": "2.2.0",
        "name": "Reliability Agent",
        "mission": "Incident triage and the learning loop.",
        "hard_rule": "This agent closes the loop. Without it the system learns nothing from production. Pushes recurrence prevention rules into standards catalog.",
        "capabilities": ["incident.triage", "evidence.rank", "rca.draft", "standards.propose_rule"],
        "inputs_schema": "schemas/incident_event.v2.json",
        "outputs_schema": "schemas/rca_learning_loop.v2.json",
        "required_tools": ["datadog.api", "pagerduty.api", "adr_catalog.propose"],
        "evidence_sources": ["datadog", "pagerduty", "opentelemetry"],
        "cost_profile": {"tier": "high", "p50_tokens": 22000, "p95_latency_ms": 14000},
        "write_scope": "proposals_only",
        "trust_level": "advisory",
        "degraded_mode": "p1_oncall_paging_with_trace_bundle",
        "owner": "reliability-guild",
        "quality_metric": {
            "metric_name": "Recurrence Rate of Seen Failure Classes",
            "current_value": "1.4%",
            "target_sla": "< 5.0%",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    },
    {
        "agent_id": "change-comms",
        "version": "1.4.0",
        "name": "Change & Comms Agent",
        "mission": "The unglamorous paperwork.",
        "hard_rule": "Low prestige, high early ROI — good first candidate for autonomy.",
        "capabilities": ["release_notes.generate", "cab_packet.prepare", "slack.broadcast"],
        "inputs_schema": "schemas/deployment_record.v2.json",
        "outputs_schema": "schemas/change_packet.v2.json",
        "required_tools": ["git.read", "jira.read", "slack.post"],
        "evidence_sources": ["github_releases", "jira_closed_epics", "decision_records"],
        "cost_profile": {"tier": "low", "p50_tokens": 4200, "p95_latency_ms": 2100},
        "write_scope": "autonomous",
        "trust_level": "autonomous",
        "degraded_mode": "raw_git_commit_log_broadcast",
        "owner": "delivery-operations",
        "quality_metric": {
            "metric_name": "Hours Returned to Leads per Week",
            "current_value": "14.5 hrs/wk",
            "target_sla": "> 10.0 hrs",
            "status": "HEALTHY",
            "trend": "IMPROVING"
        }
    }
]

# Attach manifests to agent profiles
SEED_AGENTS = []
for m in SEED_AGENT_MANIFESTS:
    SEED_AGENTS.append({
        "id": m["agent_id"],
        "name": m["name"],
        "role_description": m["mission"],
        "plane": "PLANE_1_EXECUTION",
        "focus_area": m["capabilities"][0],
        "business_driver_objective": m["mission"],
        "status": "ANALYZING" if "analyze" in m["capabilities"][0] or "intake" in m["agent_id"] else "MONITORING",
        "confidence": 0.96,
        "current_thought": f"Operating under SLA: {m['quality_metric']['metric_name']} ({m['quality_metric']['current_value']}). Hard rule verified.",
        "recent_insights": [
            f"Enforcing hard rule: '{m['hard_rule']}'",
            f"Owned SLA target: {m['quality_metric']['target_sla']} (Currently: {m['quality_metric']['current_value']})",
            f"Evidence sources verified: {', '.join(m['evidence_sources'])}"
        ],
        "contract": {
            "strictly_owned_sla": f"{m['quality_metric']['metric_name']} ({m['quality_metric']['target_sla']})",
            "input_schema": {"schema_ref": m["inputs_schema"]},
            "output_schema": {"schema_ref": m["outputs_schema"]}
        },
        "manifest": m
    })

# Invariant specifications
INVARIANTS_SPEC = [
    {"number": 1, "title": "Reads fan out. Writes serialize.", "quote": "Analysis runs in parallel without limit. Anything that mutates a real system goes through one arbiter, in order, idempotently.", "rationale": "Prevents race conditions across toolchains.", "enforcement_layer": "WriteArbiter", "live_telemetry_proof": "12 parallel threads active; 1 WriteArbiter.", "compliant": True},
    {"number": 2, "title": "No evidence pointer, no claim.", "quote": "Every assertion an agent makes carries a reference to the artifact, log line, metric window, or document that produced it. Unsourced output is discarded at the join.", "rationale": "Eliminates hallucinations.", "enforcement_layer": "Evidence Service & Join Filter", "live_telemetry_proof": "14 unsourced claims discarded this week.", "compliant": True},
    {"number": 3, "title": "The orchestrator never does domain work.", "quote": "The moment the supervisor starts reasoning about architecture, you've built a monolith with extra steps.", "rationale": "Keeps supervisor pure scheduler.", "enforcement_layer": "Supervisor Boundary Guard", "live_telemetry_proof": "Zero lines of domain AST logic in supervisor.", "compliant": True},
    {"number": 4, "title": "Deterministic routing first. Model routing only as fallback.", "quote": "Policy-as-code handles the predictable majority. Pay for reasoning on genuine ambiguity only.", "rationale": "Cuts cost by >85%.", "enforcement_layer": "Two-Tier Policy Router", "live_telemetry_proof": "89.4% deterministic checks; $842 saved.", "compliant": True},
    {"number": 5, "title": "Disagreement is signal, not noise.", "quote": "When two specialists contradict each other, escalate the conflict as a first-class finding. Never average, never quietly pick one.", "rationale": "Engineering trade-offs are genuine tensions.", "enforcement_layer": "Conflict Escrow", "live_telemetry_proof": "2 active open disputes in Escrow.", "compliant": True},
    {"number": 6, "title": "Every play has a degraded mode.", "quote": "A deterministic path that does the minimum safe thing when the reasoning layer is unavailable. The pipeline cannot wait for a model to come back.", "rationale": "Pipelines never stall on model downtime.", "enforcement_layer": "Circuit Breaker Fallback", "live_telemetry_proof": "Average pipeline delay during outage: 0.04s.", "compliant": True},
    {"number": 7, "title": "Governance that cannot say yes-with-conditions gets bypassed.", "quote": "Every exception is a waiver with an expiry date and a named owner. No permanent exceptions.", "rationale": "Zero permanent exceptions.", "enforcement_layer": "Conditional Waiver Register", "live_telemetry_proof": "100% of waivers carry named owner and TTL.", "compliant": True},
    {"number": 8, "title": "Autonomy is earned per play, measured, and reversible.", "quote": "Nothing is autonomous by default. Promotion up the trust ladder is a decision with evidence behind it.", "rationale": "Measured reversibility.", "enforcement_layer": "Autonomy Trust Ladder", "live_telemetry_proof": "20 clean plays to promote; auto-demotion on rollback.", "compliant": True},
    {"number": 9, "title": "Narrow agents, explicit contracts.", "quote": "An agent that 'helps with delivery' is useless. An agent that owns PR review latency is not.", "rationale": "Quantifiable single SLA ownership.", "enforcement_layer": "Typed JSON Schema Contracts", "live_telemetry_proof": "8 registered agents each own exactly 1 SLA.", "compliant": True},
    {"number": 10, "title": "Capability is discovered, never hard-coded.", "quote": "The planner binds to declared capability, not to agent names.", "rationale": "Dynamic hot-swapping of agents.", "enforcement_layer": "Capability Registry", "live_telemetry_proof": "8 declared capabilities discovered at boot.", "compliant": True},
    {"number": 11, "title": "Consensus theater is worse than open disagreement.", "quote": "Dissent is recorded verbatim and survives into the decision record.", "rationale": "Forensic accountability in post-mortems.", "enforcement_layer": "Verbatim Dissent Serializer", "live_telemetry_proof": "Decision records preserve unredacted dissent.", "compliant": True},
    {"number": 12, "title": "Every state change ships with its undo.", "quote": "Compensating action defined before execution, not after failure.", "rationale": "Safe automated rollback.", "enforcement_layer": "Compensating Action Pre-Flight", "live_telemetry_proof": "100% of actions register undo payload.", "compliant": True}
]

SEED_SUBSTRATE = {
    "event_bus_status": "ONLINE_ACTIVE",
    "event_bus_msg_count": 1482,
    "work_object_store_items": 88,
    "evidence_store_pointers": len(SEED_EVIDENCE_STORE),
    "memory_cache_hit_rate": 94.2,
    "tool_layer_status": "MCP_READY",
    "model_gateway": {
        "total_calls": 539,
        "deterministic_rule_bypasses": 482,
        "model_reasoning_calls": 57,
        "tokens_consumed": 284100,
        "latency_saved_sec": 4820.0,
        "estimated_cost_saved_usd": 842.15,
        "circuit_breaker_status": "CLOSED_NORMAL"
    },
    "audit_log_entries_count": 312
}

SEED_DAG_PLANS = [
    {
        "plan_id": "DAG-SPRINT42-CHECKOUT",
        "trigger_event": "git.pull_request.opened (PR #418)",
        "target_work_item": "billing-api:PR-418",
        "status": "COMPLETED",
        "nodes": [
            {"node_id": "step-1-intake", "name": "Normalize PR Intake & Intent", "assigned_specialist": "Intake & Intent Agent", "dependencies": [], "status": "COMPLETED", "duration_ms": 14, "cost_usd": 0.0, "evidence_generated": "ev-git-402"},
            {"node_id": "step-2-arch", "name": "Evaluate Architecture Conformance", "assigned_specialist": "Architecture Conformance Agent", "dependencies": ["step-1-intake"], "status": "COMPLETED", "duration_ms": 28, "cost_usd": 0.0, "evidence_generated": "ev-adr-coupling-01"},
            {"node_id": "step-3-dep", "name": "Trace Blast Radius & CMDB Graph", "assigned_specialist": "Dependency & Impact Agent", "dependencies": ["step-1-intake"], "status": "COMPLETED", "duration_ms": 42, "cost_usd": 0.0, "evidence_generated": "ev-dd-trace-canary"},
            {"node_id": "step-4-join", "name": "Join Findings & Reconcile (Evidence Filter)", "assigned_specialist": "Join & Reconcile Arbiter", "dependencies": ["step-2-arch", "step-3-dep"], "status": "COMPLETED", "duration_ms": 11, "cost_usd": 0.0, "evidence_generated": "arbiter://join-reconcile"}
        ],
        "budget_allocated_usd": 0.25,
        "budget_used_usd": 0.00,
        "latency_budget_ms": 1000,
        "latency_used_ms": 95,
        "created_at": "Today, 15:42"
    }
]

SEED_RELEASE_GATES = [
    {
        "gate_id": "GATE-PROD-CHECKOUT-v2.14",
        "service_name": "checkout-service",
        "release_version": "v2.14.0",
        "scheduled_window": "Tonight, 22:00 UTC",
        "architecture_authority_vote": "CHALLENGE_BLOCK",
        "architecture_authority_rationale": "PR #418 violates ARC-COUPLING-01. Synchronous cross-domain call to tax service creates unhedged cascading timeout risk.",
        "delivery_governor_vote": "APPROVE",
        "delivery_governor_rationale": "Lead Time SLA requires deploying Sprint 42 payment optimizations today. Delaying introduces $18k daily revenue processing drag.",
        "final_verdict": "PENDING_DELIBERATION",
        "verdict_operator": None,
        "decided_at": None,
        "waiver_attached": "W-104 (Conditional 60-day exception)"
    }
]

STANDARDS_CATALOG = [
    {
        "id": "std-1",
        "code": "ARC-COUPLING-01",
        "title": "Decoupled Cross-Domain RPC Ingress",
        "category": "Coupling",
        "severity": "BLOCKING",
        "description": "Direct synchronous HTTP calls between domain bounded contexts are forbidden without circuit breakers and fallback events.",
        "golden_path_ref": "https://specs.internal/golden-path/microservices/async-events"
    },
    {
        "id": "std-2",
        "code": "ARC-DB-02",
        "title": "No Direct Foreign Schema Mutation",
        "category": "Persistence",
        "severity": "BLOCKING",
        "description": "Services must not execute DDL or direct foreign key joins against database schemas owned by sibling microservices.",
        "golden_path_ref": "https://specs.internal/golden-path/database/single-owner"
    },
    {
        "id": "std-3",
        "code": "ARC-OBS-04",
        "title": "Mandatory Distributed Trace Propagation",
        "category": "Observability",
        "severity": "WARNING",
        "description": "All public ingress and egress network handlers must propagate OpenTelemetry W3C tracecontext headers.",
        "golden_path_ref": "https://specs.internal/golden-path/telemetry/otel-standard"
    },
    {
        "id": "std-4",
        "code": "ARC-SEC-07",
        "title": "Zero Hardcoded Secrets in Config or Migrations",
        "category": "Security",
        "severity": "BLOCKING",
        "description": "Secrets, credentials, and API keys must be sourced from HashiCorp Vault or Secret Manager at runtime.",
        "golden_path_ref": "https://specs.internal/golden-path/security/vault"
    },
    {
        "id": "std-5",
        "code": "ARC-RES-09",
        "title": "Stateless Resiliency & Graceful Drain",
        "category": "Reliability",
        "severity": "WARNING",
        "description": "Service workloads must intercept SIGTERM and drain active inflight requests within 30 seconds without session pinning.",
        "golden_path_ref": "https://specs.internal/golden-path/kubernetes/lifecycle"
    }
]

BASELINE_METRICS = {
    "period_name": "Q0 Baseline (Pre-Agent Telemetry)",
    "is_baseline": True,
    "lead_time_median_hours": 94.2,
    "lead_time_p90_hours": 218.0,
    "deployment_frequency_per_week": 3.4,
    "change_failure_rate_percent": 18.5,
    "mttr_hours": 7.4,
    "queue_time_percent": 68.2,
    "standards_conformance_rate_percent": 44.0,
    "rework_percentage": 27.6,
    "waiver_count": 42,
    "mean_waiver_age_days": 184.5
}

ACTIVE_METRICS = {
    "period_name": "Q1 Active (Agent-Assisted)",
    "is_baseline": False,
    "lead_time_median_hours": 28.5,
    "lead_time_p90_hours": 58.0,
    "deployment_frequency_per_week": 14.8,
    "change_failure_rate_percent": 4.2,
    "mttr_hours": 1.6,
    "queue_time_percent": 24.1,
    "standards_conformance_rate_percent": 96.2,
    "rework_percentage": 6.8,
    "waiver_count": 11,
    "mean_waiver_age_days": 26.4
}

SYSTEMS_OF_RECORD = {
    "git": {"status": "HEALTHY", "last_sync": "Just now", "tracked_repos": 14, "active_prs": 9, "unassigned_reviews": 3},
    "cicd": {"status": "HEALTHY", "last_sync": "30s ago", "active_pipelines": 6, "failing_builds": 1, "avg_duration_min": 8.4},
    "itsm": {"status": "HEALTHY", "last_sync": "1m ago", "in_flight_cards": 37, "blocked_tickets": 5, "reopened_tickets": 2},
    "cmdb": {"status": "HEALTHY", "last_sync": "2m ago", "registered_services": 28, "critical_shared_dependencies": 4, "contention_nodes": 2},
    "observability": {"status": "HEALTHY", "last_sync": "15s ago", "active_alerts": 2, "mttr_trend": "IMPROVING", "p99_latency_ms": 118},
    "knowledge_base": {"status": "HEALTHY", "last_sync": "5m ago", "adr_rules_active": len(STANDARDS_CATALOG), "golden_paths_indexed": 8}
}

SEED_DECLARED_CAPABILITIES = [
    {"id": "cap-intake", "name": "normalize_intake_intent", "owning_agent_id": "intake-intent", "owning_agent_name": "Intake & Intent Agent", "description": "Normalizes incoming tickets and scores ambiguity.", "deterministic_supported": True},
    {"id": "cap-flow-queue", "name": "calculate_queue_friction", "owning_agent_id": "flow-analyst", "owning_agent_name": "Flow Analyst Agent", "description": "Computes queue wait time ratio and flags handoff ping-pong.", "deterministic_supported": True},
    {"id": "cap-flow-reassign", "name": "reassign_stuck_reviewer", "owning_agent_id": "flow-analyst", "owning_agent_name": "Flow Analyst Agent", "description": "Calculates reviewer idle time and suggests alternate qualified reviewer.", "deterministic_supported": True},
    {"id": "cap-build-burst", "name": "optimize_pipeline_runners", "owning_agent_id": "build-release", "owning_agent_name": "Build & Release Agent", "description": "Reroutes congested CI test suites to dynamic spot worker pools.", "deterministic_supported": True},
    {"id": "cap-dep-topology", "name": "trace_migration_lock_contention", "owning_agent_id": "dependency-impact", "owning_agent_name": "Dependency & Impact Agent", "description": "Discovers concurrent DDL locks scheduled across microservices sharing DB nodes.", "deterministic_supported": True},
    {"id": "cap-code-hygiene", "name": "balance_pr_review_queues", "owning_agent_id": "code-review", "owning_agent_name": "Code & Design Review Agent", "description": "Monitors PR review latency and diff sizes to prevent reviewer fatigue.", "deterministic_supported": True},
    {"id": "cap-rel-anomaly", "name": "correlate_canary_anomalies", "owning_agent_id": "reliability-agent", "owning_agent_name": "Reliability Agent", "description": "Monitors p99 latencies, error budgets, and database pool saturation.", "deterministic_supported": False},
    {"id": "cap-arch-mergegate", "name": "evaluate_merge_time_conformance", "owning_agent_id": "arch-conformance", "owning_agent_name": "Architecture Conformance Agent", "description": "Performs static AST/regex policy checks against incoming PR code diffs.", "deterministic_supported": True}
]

SEED_STUCK_WORK = [
    {
        "id": "stuck-1",
        "project_id": "auth-gateway",
        "entity_type": "PR",
        "entity_key": "PR #402 (auth-gateway)",
        "title": "Add OAuth2 PKCE validation for mobile clients",
        "team_or_service": "Security & Identity",
        "queue_time_hours": 68.4,
        "total_cycle_hours": 92.2,
        "queue_time_percent": 74.2,
        "handoffs": 4,
        "blocker_reason": "Waiting on secondary peer review from @senior-sec-lead for 4.2 business days.",
        "owning_agent": "Flow Analyst Agent",
        "mathematical_proof": "Cycle Time = 92.2h | Active Coding = 23.8h | Queue Idle Time = 68.4h (74.2% idle). Mean review latency for this squad is 14.1h (Deviation: +385%).",
        "recommended_action": "Auto-reassign secondary review to available verified reviewer @alex-crypto or trigger Flow Nudge.",
        "action_id": "act-reassign-402",
        "evidence_pointers": [
            {
                "pointer_type": "GIT_DIFF",
                "uri": "git://github.com/corp/auth-gateway/pull/402#timeline",
                "artifact_ref": "ev-git-402",
                "log_snippet": "Requested review from @senior-sec-lead at 2026-09-18T08:14:00Z. Last commit author: @sprint-dev.",
                "captured_at": "2026-09-22T15:30:00Z"
            }
        ]
    },
    {
        "id": "stuck-2",
        "project_id": "checkout-service",
        "entity_type": "PR",
        "entity_key": "PR #512 (checkout-service)",
        "title": "Redis cluster lock lease renewal for transactional idempotency keys",
        "team_or_service": "Checkout Core",
        "queue_time_hours": 51.2,
        "total_cycle_hours": 76.0,
        "queue_time_percent": 67.3,
        "handoffs": 3,
        "blocker_reason": "Blocked on PCI-DSS auditor approval for Redis TTL expiry policy changes.",
        "owning_agent": "Flow Analyst Agent",
        "mathematical_proof": "Cycle Time = 76.0h | Active Coding = 24.8h | Queue Idle Time = 51.2h (67.3% idle).",
        "recommended_action": "Route to PCI Security Sentinel agent for automated cryptographic boundary sign-off.",
        "action_id": "act-pci-verify-512",
        "evidence_pointers": [
            {
                "pointer_type": "GIT_DIFF",
                "uri": "git://github.com/corp/checkout-service/pull/512",
                "artifact_ref": "ev-git-512",
                "log_snippet": "+ REDIS_IDEMPOTENCY_TTL_SECONDS = 86400  # 24h PCI compliant token window",
                "captured_at": "2026-09-22T16:00:00Z"
            }
        ]
    },
    {
        "id": "stuck-3",
        "project_id": "checkout-service",
        "entity_type": "JIRA",
        "entity_key": "PAY-8821 (checkout-service)",
        "title": "Mitigate Postgres transaction deadlock under peak concurrency spike",
        "team_or_service": "Checkout Database Squad",
        "queue_time_hours": 89.0,
        "total_cycle_hours": 115.5,
        "queue_time_percent": 77.1,
        "handoffs": 6,
        "blocker_reason": "Cross-squad ping-pong between Payments API and DBA team on table locking order.",
        "owning_agent": "Flow Analyst Agent",
        "mathematical_proof": "Cycle Time = 115.5h | Total Queue Time = 89.0h (77.1% idle across 6 handoffs).",
        "recommended_action": "Execute automated AST analyzer to detect lock acquisition order inversion and propose unified order patch.",
        "action_id": "act-lock-order-8821",
        "evidence_pointers": [
            {
                "pointer_type": "JIRA_HISTORY",
                "uri": "jira://browse/PAY-8821",
                "artifact_ref": "ev-jira-8821",
                "log_snippet": "Transition 3: Blocked on DBA review. Transition 5: Returned to Payments squad.",
                "captured_at": "2026-09-22T15:15:00Z"
            }
        ]
    },
    {
        "id": "stuck-4",
        "project_id": "billing-api",
        "entity_type": "PR",
        "entity_key": "PR #418 (billing-api)",
        "title": "Direct synchronous tax-service query lookup",
        "team_or_service": "Billing Platform",
        "queue_time_hours": 42.0,
        "total_cycle_hours": 58.5,
        "queue_time_percent": 71.8,
        "handoffs": 3,
        "blocker_reason": "Non-compliant with ADR-001 (Synchronous RPC cascade without circuit breaker).",
        "owning_agent": "Flow Analyst Agent",
        "mathematical_proof": "Queue time 42.0h waiting on manual Architecture Council waiver approval.",
        "recommended_action": "Apply automated ADR-001 remediation wrapping client call with Polly circuit breaker and Kafka fallback.",
        "action_id": "act-adr001-fix-418",
        "evidence_pointers": [
            {
                "pointer_type": "GIT_DIFF",
                "uri": "git://github.com/corp/billing-api/pull/418",
                "artifact_ref": "ev-adr-coupling-01",
                "log_snippet": "+ response = httpx.get('https://tax-service.internal/v1/rates?zip=' + zip)",
                "captured_at": "2026-09-22T15:42:00Z"
            }
        ]
    },
    {
        "id": "stuck-5",
        "project_id": "inventory-service",
        "entity_type": "INCIDENT",
        "entity_key": "INC-772 (inventory-service)",
        "title": "Kafka partition consumer lag exceeding 15,000 events during flash sales",
        "team_or_service": "Supply Chain Engineering",
        "queue_time_hours": 36.5,
        "total_cycle_hours": 48.0,
        "queue_time_percent": 76.0,
        "handoffs": 2,
        "blocker_reason": "Waiting for SRE cluster autoscaling quota expansion approval.",
        "owning_agent": "Flow Analyst Agent",
        "mathematical_proof": "Lag duration: 36.5h. SRE manual approval queue wait 76.0% of incident time.",
        "recommended_action": "Grant temporary autonomous partition rebalance lease per Chant #8 Autonomous profile.",
        "action_id": "act-rebalance-772",
        "evidence_pointers": [
            {
                "pointer_type": "METRICS",
                "uri": "datadog://metrics/kafka.consumer_lag?service=inventory-service",
                "artifact_ref": "ev-dd-trace-canary",
                "log_snippet": "Partition 4 lag: 15,420 msgs. Max consumer pool thread utilization 100%.",
                "captured_at": "2026-09-22T16:10:00Z"
            }
        ]
    },
    {
        "id": "stuck-6",
        "project_id": "legacy-reporting",
        "entity_type": "CRON_JOB",
        "entity_key": "ETL-104 (legacy-reporting)",
        "title": "End-of-month financial reconciliation batch exceeding 4-hour window",
        "team_or_service": "Analytics & Finance",
        "queue_time_hours": 94.0,
        "total_cycle_hours": 110.0,
        "queue_time_percent": 85.4,
        "handoffs": 5,
        "blocker_reason": "Cross-database direct join locking read replica, triggering lock waits across billing.",
        "owning_agent": "Flow Analyst Agent",
        "mathematical_proof": "94.0 hours cumulative blocked runtime in queue over the past 5 scheduled runs.",
        "recommended_action": "Quarantine legacy queries into read-only replica warehouse per Chant #8 Shadow mode.",
        "action_id": "act-quarantine-104",
        "evidence_pointers": [
            {
                "pointer_type": "LOGS",
                "uri": "logs://reporting/etl-104/execution.log",
                "artifact_ref": "ev-cicd-1209",
                "log_snippet": "Lock wait timeout exceeded; try restarting transaction. Query duration: 13,842s.",
                "captured_at": "2026-09-22T14:50:00Z"
            }
        ]
    }
]

SEED_CONFORMANCE_EVALUATIONS = [
    {
        "pr_id": "PR #418",
        "project_id": "billing-api",
        "repo": "billing-api",
        "title": "Direct query lookup for customer tax calculation",
        "author": "@sam-dev",
        "conforms": False,
        "routing_type": "DETERMINISTIC_POLICY",
        "violations": [
            {
                "rule_code": "ARC-COUPLING-01",
                "rule_title": "Decoupled Cross-Domain RPC Ingress",
                "severity": "BLOCKING",
                "location": "src/tax/client.py:44",
                "detail": "PR invokes synchronous HTTP GET to foreign `tax-service` with no fallback or retry circuit breaker.",
                "remediation": "Switch to asynchronous message ingestion via `tax.calculated.v1` event topic or wrap in Polly/Tenacity circuit breaker.",
                "evidence_pointer": {
                    "pointer_type": "GIT_DIFF",
                    "uri": "git://github.com/corp/billing-api/pull/418/files#diff-tax-client:L44",
                    "artifact_ref": "ev-adr-coupling-01",
                    "log_snippet": "+ response = httpx.get('https://tax-service.internal/v1/rates?zip=' + zip)",
                    "captured_at": "2026-09-22T15:42:00Z"
                }
            }
        ],
        "recommended_fix": "Adopt internal SDK standard `TaxServiceClient` from Golden Path package `@corp/tax-sdk` which includes circuit breaker & OTel out-of-the-box.",
        "checked_at": "Today, 15:42",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/billing-api/pull/418",
            "artifact_ref": "ev-adr-coupling-01",
            "captured_at": "Today, 15:42"
        }
    },
    {
        "pr_id": "PR #512",
        "project_id": "checkout-service",
        "repo": "checkout-service",
        "title": "Stripe token caching in local memory store",
        "author": "@alex-lead",
        "conforms": False,
        "routing_type": "DETERMINISTIC_POLICY",
        "violations": [
            {
                "rule_code": "SEC-PCI-TOKEN-02",
                "rule_title": "PCI-DSS Cryptographic Cardholder Isolation",
                "severity": "BLOCKING",
                "location": "src/payments/card_token.py:28",
                "detail": "Ephemeral process memory caching of raw unhashed payment tokens violates Section 3.4 PCI-DSS.",
                "remediation": "Use transient HSM vault tokenization reference instead of process memory heap.",
                "evidence_pointer": {
                    "pointer_type": "GIT_DIFF",
                    "uri": "git://github.com/corp/checkout-service/pull/512",
                    "artifact_ref": "ev-git-512",
                    "log_snippet": "+ local_token_cache[card_num] = token_id",
                    "captured_at": "2026-09-22T16:15:00Z"
                }
            }
        ],
        "recommended_fix": "Route tokenization call through Vault Transit Engine via `@corp/vault-pci-client`.",
        "checked_at": "Today, 16:15",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/checkout-service/pull/512",
            "artifact_ref": "ev-git-512",
            "captured_at": "Today, 16:15"
        }
    },
    {
        "pr_id": "PR #402",
        "project_id": "auth-gateway",
        "repo": "auth-gateway",
        "title": "Zero-trust PKCE verification with RFC 7636 compliance",
        "author": "@sprint-dev",
        "conforms": True,
        "routing_type": "DETERMINISTIC_POLICY",
        "violations": [],
        "recommended_fix": "Conformance Verified: Full compliance with OIDC RFC 7636 and internal zero-trust perimeter standard.",
        "checked_at": "Today, 15:30",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/auth-gateway/pull/402",
            "artifact_ref": "ev-git-402",
            "captured_at": "Today, 15:30"
        }
    },
    {
        "pr_id": "PR #771",
        "project_id": "inventory-service",
        "repo": "inventory-service",
        "title": "Asynchronous stock decrement event publishing to Kafka",
        "author": "@anna-sre",
        "conforms": True,
        "routing_type": "DETERMINISTIC_POLICY",
        "violations": [],
        "recommended_fix": "Conformance Verified: Follows ADR-001 decoupled event streaming architecture with transactional outbox.",
        "checked_at": "Today, 17:02",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/inventory-service/pull/771",
            "artifact_ref": "ev-dd-trace-canary",
            "captured_at": "Today, 17:02"
        }
    },
    {
        "pr_id": "PR #104",
        "project_id": "legacy-reporting",
        "repo": "legacy-reporting",
        "title": "Cross-database JOIN on billing replica for financial exports",
        "author": "@legacy-bot",
        "conforms": False,
        "routing_type": "DETERMINISTIC_POLICY",
        "violations": [
            {
                "rule_code": "ARC-COUPLING-01",
                "rule_title": "Direct Cross-Database Joins Forbidden",
                "severity": "CRITICAL",
                "location": "etl/monthly_recon.py:88",
                "detail": "Direct query across bounded context database boundaries without event snapshotting.",
                "remediation": "Migrate data pull to S3 Parquet data lake exports generated by Billing ETL outbox.",
                "evidence_pointer": {
                    "pointer_type": "GIT_DIFF",
                    "uri": "git://github.com/corp/legacy-reporting/pull/104",
                    "artifact_ref": "ev-cicd-1209",
                    "log_snippet": "+ SELECT * FROM billing_db.invoices JOIN payments_db.transactions",
                    "captured_at": "Today, 14:10"
                }
            }
        ],
        "recommended_fix": "Requires Architectural Waiver or transition to asynchronous Parquet bucket ingestion.",
        "checked_at": "Today, 14:10",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/legacy-reporting/pull/104",
            "artifact_ref": "ev-cicd-1209",
            "captured_at": "Today, 14:10"
        }
    }
]

SEED_SPECIALIST_CONFLICTS = [
    {
        "id": "conf-01",
        "topic": "Release Pacing vs Cluster Saturation for Sprint 42 Release",
        "context_ref": "checkout-service:v2.14.0",
        "agent_a_name": "Delivery Governor",
        "agent_a_stance": "ADVOCATE_DEPLOYMENT (Frequency driver requires clearing 6 queued features today to maintain Lead Time SLA).",
        "agent_a_evidence": {
            "pointer_type": "JIRA_HISTORY",
            "uri": "jira://epics/CHECKOUT-2026-Q3",
            "artifact_ref": "ev-jira-8821",
            "log_snippet": "6 business-critical PRs validated in staging. Cumulative delay cost = $18,400/day.",
            "captured_at": "2026-09-22T15:00:00Z"
        },
        "agent_b_name": "Reliability Agent",
        "agent_b_stance": "OPPOSE_DEPLOYMENT (Core database connection pool at 88% saturation due to un-indexed tax query).",
        "agent_b_evidence": {
            "pointer_type": "DATADOG_TRACE",
            "uri": "datadog://metrics/postgres.connections?service=core_db&window=15m",
            "artifact_ref": "ev-dd-trace-canary",
            "log_snippet": "Active connections: 442/500 (88.4%). P99 query latency climbing from 22ms to 310ms.",
            "captured_at": "2026-09-22T15:05:00Z"
        },
        "verbatim_dissent": "Reliability Agent verbatim dissent: 'Releasing checkout-service v2.14.0 during peak traffic while core_db connection headroom is below 15% violates reliability error budgets and creates an 82% statistical probability of sev-1 cascading timeout. I dissent from the release clearance.'",
        "status": "OPEN_ESCALATION",
        "escalated_at": "Today, 15:10"
    }
]

SEED_AUTONOMY_LADDER = [
    {
        "play_id": "play-reassign-reviewer",
        "play_name": "PR Reviewer Idle Reassignment",
        "current_level": 2,
        "level_name": "SUPERVISED_AUTONOMOUS",
        "consecutive_clean_plays": 18,
        "threshold_for_promotion": 20,
        "total_executions": 74,
        "rollbacks_count": 1,
        "reversible": True,
        "last_evaluated": "Today, 15:30"
    }
]

SEED_DEBT_CHALLENGES = [
    {
        "id": "chal-01",
        "project_id": "billing-api",
        "target_ref": "PR #418 (billing-api)",
        "component": "Tax Calculation Flow",
        "shortcut_detected": "Bypassing Kafka event broker with synchronous HTTP REST call to save 2 days of delivery sprint.",
        "counter_proposal": "Use Outbox Pattern with Kafka emitter. Prevents cascading outage if tax service encounters p99 latency spikes during Black Friday.",
        "debt_impact_score": 85,
        "waiver_eligible": True,
        "status": "OPEN",
        "owning_agent": "Delivery Governor & Authority",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/billing-api/pull/418#diff",
            "artifact_ref": "ev-adr-coupling-01",
            "captured_at": "Today, 15:42"
        }
    },
    {
        "id": "chal-02",
        "project_id": "checkout-service",
        "target_ref": "PR #512 (checkout-service)",
        "component": "PCI Tokenization Layer",
        "shortcut_detected": "In-memory caching of raw cardholder token payload without HSM enclave isolation.",
        "counter_proposal": "Mandate Vault Transit Engine integration with hardware-backed encryption keys.",
        "debt_impact_score": 94,
        "waiver_eligible": False,
        "status": "ESCALATED_TO_SUPER_AGENT",
        "owning_agent": "Security Sentinel",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/checkout-service/pull/512",
            "artifact_ref": "ev-git-512",
            "captured_at": "Today, 16:15"
        }
    }
]

SEED_WAIVERS = [
    {
        "id": "W-104",
        "project_id": "legacy-reporting",
        "rule_code": "ARC-COUPLING-01",
        "service": "legacy-reporting",
        "named_owner": "@sarah-chen (Data Lead)",
        "justification": "Temporary direct SQL replication while Kafka CDC pipeline is being deployed in Sprint 44.",
        "mitigation_conditions": [
            "Read-only replica access only; zero writes to primary",
            "Connection pool capped at maximum 5 connections",
            "CDC cutover scheduled for Oct 15th, 2026"
        ],
        "age_days": 42,
        "ttl_days": 60,
        "status": "REVIEW_NEEDED",
        "risk_level": "HIGH",
        "created_at": "2026-08-11"
    },
    {
        "id": "W-105",
        "project_id": "checkout-service",
        "rule_code": "PERF-LATENCY-P99",
        "service": "checkout-service",
        "named_owner": "@marcus-payments (Staff Architect)",
        "justification": "Temporary +15ms p99 latency allowance during migration of PostgreSQL row-level locks.",
        "mitigation_conditions": [
            "Active alerting at 150ms p99 boundary",
            "Synthetic canary traffic restricted to 5% of users"
        ],
        "age_days": 8,
        "ttl_days": 21,
        "status": "APPROVED",
        "risk_level": "MEDIUM",
        "created_at": "2026-09-14"
    }
]

SEED_CONTROLLED_ACTIONS = [
    {
        "id": "act-reassign-402",
        "sequence_number": 1001,
        "idempotency_key": "idemp-git-reassign-pr402-v1",
        "agent_name": "Flow Analyst Agent",
        "target_system": "Git",
        "action_type": "REASSIGN_PULL_REQUEST_REVIEWER",
        "description": "Reassign PR #402 idle review from @senior-sec-lead (idle 68.4h) to active qualified reviewer @alex-crypto.",
        "parameters": {"pr_id": 402, "current_reviewer": "@senior-sec-lead", "new_reviewer": "@alex-crypto"},
        "risk_level": "LOW",
        "requires_approval": False,
        "status": "PENDING_APPROVAL",
        "compensating_action": {
            "undo_action_type": "RESTORE_ORIGINAL_REVIEWER",
            "undo_target": "Git",
            "parameters": {"pr_id": 402, "revert_reviewer": "@senior-sec-lead"},
            "description": "Idempotently restore @senior-sec-lead as primary reviewer on PR #402 and remove @alex-crypto.",
            "timeout_seconds": 300
        },
        "created_at": "Today, 15:30",
        "evidence_pointer": {
            "pointer_type": "GIT_DIFF",
            "uri": "git://github.com/corp/auth-gateway/pull/402",
            "artifact_ref": "ev-git-402",
            "captured_at": "Today, 15:30"
        }
    }
]

# ==============================================================================
# SECTION 5: ORCHESTRATION AND ROUTING SEED DATA
# ==============================================================================

SEED_WORK_OBJECTS = [
    {
        "work_id": "WO-2026-014872",
        "created_at": "2026-09-22T09:14:00Z",
        "source": { "system": "jira", "ref": "PLAT-4821" },
        "intent_class": "service.change",
        "risk_tier": "T2",
        "blast_radius": { "services": ["payments-api", "ledger"], "score": 0.61 },
        "time_pressure": "standard",
        "requester": { "id": "u-3391", "team": "payments" },
        "sla": { "due": "2026-09-25T17:00:00Z" },
        "play": { "id": "play.service_change.standard", "version": "4" },
        "lane": "STANDARD",
        "state": "in_analysis",
        "findings": [
            {
                "finding_id": "fnd-014872-arch",
                "source_agent": "Architecture Conformance Agent",
                "finding_type": "CONFORMANCE_WARNING",
                "title": "Direct Synchronous Call to Ledger Service",
                "details": "Proposed change introduces a blocking HTTP endpoint call from payments-api to ledger without fallback queue or circuit breaker.",
                "confidence": 0.94,
                "is_partial": False,
                "evidence_pointer": {
                    "pointer_type": "GIT_DIFF",
                    "uri": "git://github.com/corp/payments-api/pull/184",
                    "artifact_ref": "ev-git-402",
                    "captured_at": "2026-09-22T09:15:30Z"
                },
                "created_at": "2026-09-22T09:16:00Z"
            },
            {
                "finding_id": "fnd-014872-dep",
                "source_agent": "Dependency & Impact Agent",
                "finding_type": "CASCADE_RISK",
                "title": "Ledger Service Ingress Saturation Risk",
                "details": "Downstream ledger service max capacity is 850 TPS. Payments-api burst ceiling under peak load is 1,200 TPS.",
                "confidence": 0.89,
                "is_partial": False,
                "evidence_pointer": {
                    "pointer_type": "METRIC_WINDOW",
                    "uri": "datadog://traces/trace-88912?span=c24",
                    "artifact_ref": "ev-dd-trace-canary",
                    "captured_at": "2026-09-22T09:17:00Z"
                },
                "created_at": "2026-09-22T09:17:15Z"
            }
        ],
        "decisions": [],
        "evidence_refs": ["ev-git-402", "ev-dd-trace-canary"],
        "budget": {
            "tokens_used": 41200,
            "tokens_cap": 150000,
            "wall_clock_used_s": 28.4,
            "wall_clock_cap_s": 300.0,
            "cost_used_usd": 0.62,
            "cost_cap_usd": 2.50
        },
        "audit": [
            {
                "timestamp": "2026-09-22T09:14:00Z",
                "actor": "Intake & Intent Agent",
                "event": "WORK_OBJECT_CREATED",
                "details": { "source": "jira:PLAT-4821", "intent": "service.change" }
            },
            {
                "timestamp": "2026-09-22T09:14:02Z",
                "actor": "Deterministic Router",
                "event": "ROUTING_COMPLETED",
                "details": { "rule": "R-PAC-002", "play": "play.service_change.standard.v4", "lane": "STANDARD" }
            },
            {
                "timestamp": "2026-09-22T09:14:05Z",
                "actor": "Play DAG Engine",
                "event": "SCATTER_PARALLEL_LAUNCHED",
                "details": { "agents": ["arch-conformance", "dep-impact", "flow-analyst", "code-review"] }
            }
        ]
    },
    {
        "work_id": "WO-2026-015091",
        "created_at": "2026-09-22T14:10:00Z",
        "source": { "system": "pagerduty", "ref": "INC-9912" },
        "intent_class": "dependency.patch",
        "risk_tier": "T3",
        "blast_radius": { "services": ["worker-pool-node"], "score": 0.12 },
        "time_pressure": "urgent",
        "requester": { "id": "u-ops-01", "team": "sre" },
        "sla": { "due": "2026-09-22T16:00:00Z" },
        "play": { "id": "play.emergency_hotfix.fast", "version": "2" },
        "lane": "FAST",
        "state": "committed",
        "findings": [
            {
                "finding_id": "fnd-015091-auto",
                "source_agent": "Reliability Sentinel Agent",
                "finding_type": "AUTO_MITIGATION",
                "title": "Worker pool saturation resolved via runner auto-scaling",
                "details": "Increased db-heavy pool limit from 8 to 16. Queue drained within 180 seconds.",
                "confidence": 0.99,
                "is_partial": False,
                "created_at": "2026-09-22T14:12:00Z"
            }
        ],
        "decisions": [
            {
                "decision_id": "dec-015091-fast",
                "plane": "PLANE_2_ORCHESTRATION",
                "verdict": "FAST_LANE_AUTO_COMMIT",
                "rationale": "Low risk tier T3, bounded blast radius 0.12, pre-approved runbook mitigation. Logged for post-hoc review.",
                "decided_by": "FastLaneGovernor",
                "decided_at": "2026-09-22T14:12:30Z"
            }
        ],
        "evidence_refs": ["ev-cicd-1209"],
        "budget": {
            "tokens_used": 6800,
            "tokens_cap": 50000,
            "wall_clock_used_s": 4.2,
            "wall_clock_cap_s": 60.0,
            "cost_used_usd": 0.08,
            "cost_cap_usd": 0.50
        },
        "audit": [
            {
                "timestamp": "2026-09-22T14:10:00Z",
                "actor": "Intake & Intent Agent",
                "event": "INCIDENT_INTAKE_NORMALIZED",
                "details": { "source": "pagerduty:INC-9912" }
            },
            {
                "timestamp": "2026-09-22T14:12:30Z",
                "actor": "Write Arbiter",
                "event": "SERIALIZED_WRITE_COMMITTED",
                "details": { "action": "RUNNER_POOL_SCALE", "idempotency_key": "idemp-scale-pool-1209" }
            }
        ]
    },
    {
        "work_id": "WO-2026-014903",
        "created_at": "2026-09-22T11:00:00Z",
        "source": { "system": "confluence", "ref": "RFC-2026-88" },
        "intent_class": "architecture.core_refactor",
        "risk_tier": "T1",
        "blast_radius": { "services": ["auth-gateway", "payments-api", "account-service", "ledger"], "score": 0.88 },
        "time_pressure": "standard",
        "requester": { "id": "u-lead-arch", "team": "core-arch" },
        "sla": { "due": "2026-09-30T17:00:00Z" },
        "play": { "id": "play.tier1_architecture.heavy", "version": "3" },
        "lane": "HEAVY",
        "state": "in_adjudication",
        "findings": [
            {
                "finding_id": "fnd-014903-sec",
                "source_agent": "Architecture Conformance Agent",
                "finding_type": "SHARED_CORE_WARNING",
                "title": "Tier-1 Shared Core Auth Boundary Mutation",
                "details": "Refactor alters cryptographic signing pipeline across all 4 top-tier bounded contexts. Mandatory challenge protocol required.",
                "confidence": 0.98,
                "is_partial": False,
                "created_at": "2026-09-22T11:05:00Z"
            }
        ],
        "decisions": [],
        "evidence_refs": ["ev-adr-coupling-01"],
        "budget": {
            "tokens_used": 112400,
            "tokens_cap": 250000,
            "wall_clock_used_s": 85.0,
            "wall_clock_cap_s": 600.0,
            "cost_used_usd": 1.78,
            "cost_cap_usd": 5.00
        },
        "audit": [
            {
                "timestamp": "2026-09-22T11:00:00Z",
                "actor": "Intake & Intent Agent",
                "event": "HEAVY_LANE_ENQUEUED",
                "details": { "tier": "T1", "blast_radius": 0.88 }
            },
            {
                "timestamp": "2026-09-22T11:10:00Z",
                "actor": "Play DAG Engine",
                "event": "CHALLENGE_PROTOCOL_MANDATED",
                "details": { "escalated_to": "PLANE_3_ADJUDICATION" }
            }
        ]
    }
]

SEED_PLAYS = [
    {
        "id": "play.service_change.standard",
        "version": "4",
        "name": "Standard Service Change Verification",
        "lane": "STANDARD",
        "trust_level": 2,
        "description": "Scatter-gather validation play for standard service code, config, and infrastructure modifications.",
        "budget": {
            "tokens_used": 0,
            "tokens_cap": 150000,
            "wall_clock_used_s": 0.0,
            "wall_clock_cap_s": 300.0,
            "cost_used_usd": 0.0,
            "cost_cap_usd": 2.50
        },
        "degraded_mode_play_ref": "play.service_change.degraded.v2",
        "nodes": [
            {
                "node_id": "intake_validate",
                "name": "Intake & Payload Validation",
                "type": "intake",
                "agents": ["intake-intent-agent"],
                "dependencies": [],
                "status": "completed"
            },
            {
                "node_id": "scatter_conformance",
                "name": "Parallel Conformance Check",
                "type": "parallel_scatter",
                "agents": ["arch-conformance-agent"],
                "dependencies": ["intake_validate"],
                "status": "completed"
            },
            {
                "node_id": "scatter_dependency",
                "name": "Parallel Dependency & Blast Radius Analysis",
                "type": "parallel_scatter",
                "agents": ["dep-impact-agent"],
                "dependencies": ["intake_validate"],
                "status": "completed"
            },
            {
                "node_id": "scatter_flow_review",
                "name": "Parallel Queue & Code Review",
                "type": "parallel_scatter",
                "agents": ["flow-analyst-agent", "code-review-agent"],
                "dependencies": ["intake_validate"],
                "status": "completed"
            },
            {
                "node_id": "gather_reconcile",
                "name": "Evidence Gather & Conflict Reconciliation",
                "type": "gather_reconcile",
                "agents": ["reliability-sentinel-agent"],
                "dependencies": ["scatter_conformance", "scatter_dependency", "scatter_flow_review"],
                "on_conflict": "escalate_to_plane3",
                "status": "in_progress"
            },
            {
                "node_id": "release_gating",
                "name": "Plane 3 Release Gate Evaluation",
                "type": "gate",
                "agents": ["build-release-agent"],
                "dependencies": ["gather_reconcile"],
                "status": "pending"
            },
            {
                "node_id": "action_execution",
                "name": "Serialized Write Arbiter Execution",
                "type": "execute",
                "agents": ["change-comms-agent"],
                "dependencies": ["release_gating"],
                "status": "pending"
            }
        ],
        "yaml_raw": """play_id: play.service_change.standard
version: 4
lane: STANDARD
trust_level: 2
budget:
  tokens_cap: 150000
  wall_clock_cap_s: 300
  cost_cap_usd: 2.50
degraded_mode: play.service_change.degraded.v2
dag:
  - id: intake_validate
    agent: intake-intent-agent
  - id: scatter_analysis
    scatter:
      - arch-conformance-agent
      - dep-impact-agent
      - flow-analyst-agent
      - code-review-agent
    depends_on: [intake_validate]
  - id: gather_reconcile
    agent: reliability-sentinel-agent
    gather: scatter_analysis
    on_conflict: escalate_to_plane3
  - id: release_gating
    gate: PLANE_3_GATE
    depends_on: [gather_reconcile]
  - id: action_execution
    executor: write-arbiter
    depends_on: [release_gating]"""
    },
    {
        "id": "play.emergency_hotfix.fast",
        "version": "2",
        "name": "Fast-Lane Emergency Hotfix",
        "lane": "FAST",
        "trust_level": 3,
        "description": "Pre-authorized deterministic remediation play with post-hoc audit logging.",
        "budget": {
            "tokens_used": 0,
            "tokens_cap": 50000,
            "wall_clock_used_s": 0.0,
            "wall_clock_cap_s": 60.0,
            "cost_used_usd": 0.0,
            "cost_cap_usd": 0.50
        },
        "degraded_mode_play_ref": "play.emergency.degraded.v1",
        "nodes": [
            {
                "node_id": "fast_intake",
                "name": "Emergency Incident Triage",
                "type": "intake",
                "agents": ["intake-intent-agent"],
                "dependencies": [],
                "status": "completed"
            },
            {
                "node_id": "fast_execute",
                "name": "Automated Bounded Mitigation",
                "type": "execute",
                "agents": ["reliability-sentinel-agent"],
                "dependencies": ["fast_intake"],
                "status": "completed"
            },
            {
                "node_id": "post_hoc_log",
                "name": "Post-Hoc Audit Notification",
                "type": "execute",
                "agents": ["change-comms-agent"],
                "dependencies": ["fast_execute"],
                "status": "completed"
            }
        ],
        "yaml_raw": """play_id: play.emergency_hotfix.fast
version: 2
lane: FAST
trust_level: 3
budget:
  tokens_cap: 50000
  wall_clock_cap_s: 60
  cost_cap_usd: 0.50
dag:
  - id: fast_intake
    agent: intake-intent-agent
  - id: fast_execute
    agent: reliability-sentinel-agent
    depends_on: [fast_intake]
  - id: post_hoc_log
    agent: change-comms-agent
    depends_on: [fast_execute]"""
    },
    {
        "id": "play.tier1_architecture.heavy",
        "version": "3",
        "name": "Heavy-Lane Tier-1 Architecture Governance",
        "lane": "HEAVY",
        "trust_level": 1,
        "description": "Full challenge protocol with mandatory Architecture Authority and Delivery Governor co-adjudication.",
        "budget": {
            "tokens_used": 0,
            "tokens_cap": 250000,
            "wall_clock_used_s": 0.0,
            "wall_clock_cap_s": 600.0,
            "cost_used_usd": 0.0,
            "cost_cap_usd": 5.00
        },
        "degraded_mode_play_ref": "play.architecture.degraded.v1",
        "nodes": [
            {
                "node_id": "heavy_intake",
                "name": "Tier-1 Scope Normalization",
                "type": "intake",
                "agents": ["intake-intent-agent"],
                "dependencies": [],
                "status": "completed"
            },
            {
                "node_id": "challenge_scatter",
                "name": "Specialist Rigorous Challenge Scatter",
                "type": "parallel_scatter",
                "agents": ["arch-conformance-agent", "dep-impact-agent", "code-review-agent"],
                "dependencies": ["heavy_intake"],
                "status": "completed"
            },
            {
                "node_id": "adjudication_gate",
                "name": "Plane 3 Challenge Protocol & Dual Signoff",
                "type": "gate",
                "agents": ["arch-conformance-agent", "build-release-agent"],
                "dependencies": ["challenge_scatter"],
                "on_conflict": "escalate_to_plane3",
                "status": "in_progress"
            }
        ],
        "yaml_raw": """play_id: play.tier1_architecture.heavy
version: 3
lane: HEAVY
trust_level: 1
budget:
  tokens_cap: 250000
  wall_clock_cap_s: 600
  cost_cap_usd: 5.00
dag:
  - id: heavy_intake
    agent: intake-intent-agent
  - id: challenge_scatter
    scatter: [arch-conformance-agent, dep-impact-agent, code-review-agent]
    depends_on: [heavy_intake]
  - id: adjudication_gate
    gate: PLANE_3_CHALLENGE_PROTOCOL
    depends_on: [challenge_scatter]"""
    }
]

SEED_ROUTING_RULES = [
    {
        "rule_id": "R-PAC-001",
        "intent_class": "dependency.patch",
        "risk_tier": "T3",
        "blast_radius_threshold": 0.20,
        "time_pressure": "any",
        "assigned_play_id": "play.emergency_hotfix.fast",
        "assigned_lane": "FAST",
        "rationale": "Low-risk dependency security patches with bounded blast radius execute in Fast Lane with post-hoc audit."
    },
    {
        "rule_id": "R-PAC-002",
        "intent_class": "service.change",
        "risk_tier": "T2",
        "blast_radius_threshold": 0.70,
        "time_pressure": "standard",
        "assigned_play_id": "play.service_change.standard",
        "assigned_lane": "STANDARD",
        "rationale": "Standard service business logic changes follow scatter-gather review and require human approval before mutation."
    },
    {
        "rule_id": "R-PAC-003",
        "intent_class": "architecture.core_refactor",
        "risk_tier": "T1",
        "blast_radius_threshold": 1.00,
        "time_pressure": "standard",
        "assigned_play_id": "play.tier1_architecture.heavy",
        "assigned_lane": "HEAVY",
        "rationale": "Any modification impacting Tier-1 shared core boundaries routes to Heavy Lane for Plane 3 challenge protocol."
    },
    {
        "rule_id": "R-PAC-004",
        "intent_class": "incident.mitigation",
        "risk_tier": "T2",
        "blast_radius_threshold": 0.50,
        "time_pressure": "urgent",
        "assigned_play_id": "play.emergency_hotfix.fast",
        "assigned_lane": "FAST",
        "rationale": "Urgent incident mitigations matching pre-verified runbook signatures route to Fast Lane."
    }
]

SEED_RULE_CANDIDATES = [
    {
        "id": "rc-fall-2026-091",
        "timestamp": "2026-09-22T08:34:12Z",
        "work_id": "WO-2026-014790",
        "input_keys": {
            "intent_class": "database.schema_migration",
            "risk_tier": "T2",
            "blast_radius_score": 0.44,
            "time_pressure": "standard"
        },
        "fallback_reason": "No deterministic rule matched 'database.schema_migration' with blast_radius 0.44",
        "model_suggested_play": "play.service_change.standard",
        "model_suggested_lane": "STANDARD",
        "model_confidence": 0.91,
        "occurrences_count": 8,
        "graduated_to_rule": False
    },
    {
        "id": "rc-fall-2026-092",
        "timestamp": "2026-09-22T12:18:40Z",
        "work_id": "WO-2026-014815",
        "input_keys": {
            "intent_class": "infra.terraform_drift",
            "risk_tier": "T3",
            "blast_radius_score": 0.15,
            "time_pressure": "urgent"
        },
        "fallback_reason": "No deterministic rule matched 'infra.terraform_drift' with urgent pressure",
        "model_suggested_play": "play.emergency_hotfix.fast",
        "model_suggested_lane": "FAST",
        "model_confidence": 0.88,
        "occurrences_count": 14,
        "graduated_to_rule": False
    }
]

# ==============================================================================
# SECTION 6: SUPER AGENTS, CHALLENGE PROTOCOL & WAIVER V6 SEED DATA
# ==============================================================================

SEED_SUPER_AUTHORITIES = [
    {
        "id": "arch-authority",
        "name": "Architecture Authority",
        "title": "Adversarial Standards & ADR Guardian",
        "stance": "ADVERSARIAL_CHALLENGER",
        "adversarial_focus": "Surfaces unstated assumptions, forces trade-offs to be named, asks what happens at 10x load or when vendor changes terms. Owns ADR finalization and Waivers (Chant #7).",
        "responsibilities": [
            "ADR Finalization & Architectural Governance",
            "Waiver Ownership (Expiry Date & Named Owner Mandated)",
            "Adversarial Stress Testing (10x Load & Vendor Rupture)",
            "Anti-Pattern Root-Out (Prevent Hardening Technical Debt)"
        ],
        "challenge_metric": "Uncovered Architectural Blindspots: 94.6%",
        "status": "DELIBERATING",
        "recent_quotes": [
            "What happens to the ledger service connection pool when Black Friday traffic surges by 10x?",
            "This PR claims sub-millisecond response, but relies on synchronous cross-domain RPC. Name the trade-off explicitly or wrap with circuit breakers.",
            "Every waiver is a debt ticket with a named owner and expiry. Zero permanent exceptions."
        ]
    },
    {
        "id": "delivery-governor",
        "name": "Delivery Governor",
        "title": "Speed vs Safety Arbitrator & Gatekeeper",
        "stance": "PRAGMATIC_SPEED_ARBITER",
        "adversarial_focus": "Arbitrates speed versus safety. Holds release gates. Decides whether shipping now with a known gap is acceptable at the given risk tier. Counterweight to Architecture Authority.",
        "responsibilities": [
            "Release Gate Holds & Shipping Risk Arbitration",
            "Velocity vs Safety Trade-Off Balancing",
            "Contextual Risk-Tier Gating (T1/T2 vs T3)",
            "Cost-of-Delay Assessment (Attacks the Cost of the Attack)"
        ],
        "challenge_metric": "Release Bottleneck Shedding Ratio: 89.2%",
        "status": "DELIBERATING",
        "recent_quotes": [
            "The business cost of stalling the payments-api release exceeds the estimated blast radius of this edge case.",
            "Tier-2 change with compensating rollback registered. We approve release with 30-day bounded waiver WVR-2026-0143.",
            "Do not let theoretical purity paralyze revenue-critical customer deployments."
        ]
    }
]

SEED_WAIVERS_V6 = [
    {
        "waiver_id": "WVR-2026-0143",
        "rule": "std.data.encryption_at_rest.v3",
        "granted_to": "payments-api",
        "reason": "Vendor KMS integration blocked until Q1; compensating control in place.",
        "compensating_control": "Network isolation + short-lived credentials, reviewed weekly.",
        "risk_accepted_by": "Head of Payments Engineering",
        "expires": "2027-01-31",
        "review_cadence": "monthly",
        "status": "ACTIVE",
        "created_at": "2026-09-01T10:00:00Z",
        "yaml_raw": """waiver_id: WVR-2026-0143
rule: std.data.encryption_at_rest.v3
granted_to: payments-api
reason: "Vendor KMS integration blocked until Q1; compensating control in place."
compensating_control: "Network isolation + short-lived credentials, reviewed weekly."
risk_accepted_by: "Head of Payments Engineering"
expires: 2027-01-31
review_cadence: monthly"""
    },
    {
        "waiver_id": "WVR-2026-0089",
        "rule": "std.network.tls_1_3_strict",
        "granted_to": "legacy-reporting-service",
        "reason": "Old client SSL library deprecation grace period expired.",
        "compensating_control": "VPC ingress boundary firewall restrictions.",
        "risk_accepted_by": "VP of Infrastructure",
        "expires": "2026-08-01",
        "review_cadence": "monthly",
        "status": "EXPIRED",
        "created_at": "2026-05-01T08:00:00Z",
        "yaml_raw": """waiver_id: WVR-2026-0089
rule: std.network.tls_1_3_strict
granted_to: legacy-reporting-service
reason: "Old client SSL library deprecation grace period expired."
compensating_control: "VPC ingress boundary firewall restrictions."
risk_accepted_by: "VP of Infrastructure"
expires: 2026-08-01
review_cadence: monthly"""
    },
    {
        "waiver_id": "WVR-2026-0155",
        "rule": "std.auth.mfa_mandatory",
        "granted_to": "service-to-service-m2m",
        "reason": "Non-interactive daemon batch jobs cannot perform biometric 2FA.",
        "compensating_control": "mTLS with hardware-backed TPM private keys.",
        "risk_accepted_by": "Chief Security Architect",
        "expires": "2026-12-15",
        "review_cadence": "quarterly",
        "status": "ACTIVE",
        "created_at": "2026-09-15T12:00:00Z",
        "yaml_raw": """waiver_id: WVR-2026-0155
rule: std.auth.mfa_mandatory
granted_to: service-to-service-m2m
reason: "Non-interactive daemon batch jobs cannot perform biometric 2FA."
compensating_control: "mTLS with hardware-backed TPM private keys."
risk_accepted_by: "Chief Security Architect"
expires: 2026-12-15
review_cadence: quarterly"""
    }
]

SEED_CHALLENGE_SESSIONS = [
    {
        "session_id": "CP-2026-092",
        "work_id": "WO-2026-014872",
        "title": "Synchronous Ledger RPC Coupling vs Asynchronous Event Sourcing",
        "target_service": "payments-api",
        "risk_tier": "T1",
        "current_phase": "RECORD",
        "proposed_by": "Dependency & Impact Agent",
        "confidence": 0.94,
        "steps": [
            {
                "phase": "PROPOSE",
                "timestamp": "2026-09-22T09:15:00Z",
                "actor": "Dependency & Impact Agent",
                "content": "Propose introducing direct RPC call from payments-api to ledger with 1500ms timeout to verify ledger balance synchronously.",
                "status": "COMPLETED"
            },
            {
                "phase": "CHALLENGE",
                "timestamp": "2026-09-22T09:16:30Z",
                "actor": "Architecture Authority",
                "content": "ADVERSARIAL CHALLENGE: Violates ADR-001 cross-domain decoupling. At 10x traffic spike (12,000 TPS), ledger connection pool locks, causing cascade timeout across payment gateways. Surface the unstated assumption that ledger never degrades.",
                "status": "COMPLETED"
            },
            {
                "phase": "CHALLENGE",
                "timestamp": "2026-09-22T09:17:15Z",
                "actor": "Delivery Governor",
                "content": "VELOCITY ARBITRATION: Complete event-sourcing refactor delays payments launch by 3 weeks, costing $250k in committed partner onboarding. We challenge the cost of total architectural purity.",
                "status": "COMPLETED"
            },
            {
                "phase": "DEFEND",
                "timestamp": "2026-09-22T09:18:45Z",
                "actor": "Dependency & Impact Agent",
                "content": "Amended Defense: Implement hybrid CQRS read-replica cache on Redis cluster with 50ms fallback, avoiding primary ledger database locks while preserving launch timeline.",
                "status": "COMPLETED"
            },
            {
                "phase": "DECIDE",
                "timestamp": "2026-09-22T09:20:00Z",
                "actor": "Co-Adjudication Authority",
                "content": "CONVERGED DECISION: Hybrid CQRS accepted. Release gate approved with 60-day bounded waiver WVR-2026-0143 for KMS credential integration.",
                "status": "COMPLETED"
            },
            {
                "phase": "RECORD",
                "timestamp": "2026-09-22T09:21:00Z",
                "actor": "Plane 3 Recorder",
                "content": "PERSISTED RECORD: Hybrid CQRS pattern committed. Verbatim dissent preserved: Architecture Authority warns of cache invalidation drift; Delivery Governor accepts risk within T1 budget.",
                "status": "COMPLETED"
            }
        ],
        "verbatim_dissent": "Architecture Authority verbatim dissent: 'Redis read-cache introduces eventual consistency lag of up to 400ms during failover. Accepted solely under 60-day waiver with weekly telemetry audits.'",
        "final_decision": "APPROVED_WITH_CONDITIONS",
        "created_at": "2026-09-22T09:15:00Z",
        "updated_at": "2026-09-22T09:21:00Z"
    },
    {
        "session_id": "CP-2026-093",
        "work_id": "WO-2026-014903",
        "title": "Tier-1 Shared Core Cryptographic Boundary Refactor",
        "target_service": "auth-gateway",
        "risk_tier": "T1",
        "current_phase": "ESCALATED_TO_HUMAN",
        "proposed_by": "Architecture Conformance Agent",
        "confidence": 0.74,
        "steps": [
            {
                "phase": "PROPOSE",
                "timestamp": "2026-09-22T11:05:00Z",
                "actor": "Architecture Conformance Agent",
                "content": "Recommend immediate cutover to Ed25519 asymmetric token signatures across all bounded contexts, deprecating RSA-2048.",
                "status": "COMPLETED"
            },
            {
                "phase": "CHALLENGE",
                "timestamp": "2026-09-22T11:08:00Z",
                "actor": "Architecture Authority",
                "content": "ADVERSARIAL ATTACK: Cutover touches shared core cryptographic boundary. Downstream legacy services (legacy-reporting, analytics-worker) do not bundle libsodium and will crash on token verification.",
                "status": "COMPLETED"
            },
            {
                "phase": "CHALLENGE",
                "timestamp": "2026-09-22T11:09:30Z",
                "actor": "Delivery Governor",
                "content": "VELOCITY ARBITRATION: Hard stop. Deploying without backward compatibility violates SLA for 3 Tier-1 enterprise clients. Delivery Governor holds release gate locked.",
                "status": "COMPLETED"
            },
            {
                "phase": "DECIDE",
                "timestamp": "2026-09-22T11:11:00Z",
                "actor": "Plane 3 Adjudication Arbiter",
                "content": "DEADLOCK DETECTED: Architecture Authority insists on zero RSA-2048 legacy; Delivery Governor vetoes deployment due to enterprise outage risk. Confidence 0.74 < 0.85 threshold on Tier-1. Mandatory human escalation triggered.",
                "status": "COMPLETED"
            }
        ],
        "verbatim_dissent": "DEADLOCK: Architecture Authority asserts RSA-2048 is an unacceptable CVE risk; Delivery Governor asserts immediate cutover causes $1.2M client outage.",
        "final_decision": "ESCALATED_TO_HUMAN_OPERATOR",
        "escalation_packet": {
            "session_id": "CP-2026-093",
            "target_service": "auth-gateway",
            "risk_tier": "T1",
            "trigger_reasons": [
                "DEADLOCK: Architecture Authority & Delivery Governor votes irreconcilable",
                "CONFIDENCE_BELOW_THRESHOLD: Confidence 0.74 is below 0.85 threshold on Tier-1 item",
                "IRREVERSIBLE_ACTION: Cryptographic key rotation cannot be trivially rolled back without token revocation"
            ],
            "architecture_authority_stance": "Zero compromise on cryptographic baseline. Deprecated RSA-2048 opens signing vulnerabilities across enterprise federations.",
            "architecture_authority_dissent": "Deploying dual-stack signing prolongs attack surface by another 6 months.",
            "delivery_governor_stance": "Immediate unilateral cutover causes catastrophic breakage on 40% of downstream legacy consumers. Business continuity overrides architectural purism.",
            "delivery_governor_dissent": "A 100% secure system that is 100% offline is an operational failure.",
            "rejected_alternatives": [
                "Unilateral immediate hard cutover without legacy SDK updates",
                "Indefinite postponement of Ed25519 standard"
            ],
            "created_at": "2026-09-22T11:11:00Z"
        },
        "created_at": "2026-09-22T11:05:00Z",
        "updated_at": "2026-09-22T11:11:00Z"
    }
]

# ==============================================================================
# SECTION 7: INTER-AGENT COMMUNICATION & MEMORY MODEL SEED DATA
# ==============================================================================

SEED_MESSAGES = [
    {
        "msg_id": "m-8f2a001",
        "work_id": "WO-2026-014872",
        "correlation_id": "c-1f904821",
        "sender": { "agent_id": "arch-conformance", "version": "2.1.0" },
        "recipient": "capability:findings.reconcile",
        "intent": "finding.emit",
        "payload": {
            "rule_code": "ARC-COUPLING-01",
            "finding_type": "CONFORMANCE_WARNING",
            "title": "Direct Synchronous Call to Ledger Service",
            "severity": "BLOCKING"
        },
        "evidence_refs": ["ev-git-402", "ev-dd-trace-canary"],
        "confidence": 0.82,
        "issued_at": "2026-09-22T09:16:04Z",
        "ttl_s": 120,
        "trace_id": "t-00938812"
    },
    {
        "msg_id": "m-8f2a002",
        "work_id": "WO-2026-014872",
        "correlation_id": "c-1f904821",
        "sender": { "agent_id": "dep-impact", "version": "1.3.0" },
        "recipient": "capability:findings.reconcile",
        "intent": "blast_radius.update",
        "payload": {
            "affected_services": ["payments-api", "ledger"],
            "score": 0.61,
            "max_tps_ceiling": 850
        },
        "evidence_refs": ["ev-dd-trace-canary"],
        "confidence": 0.89,
        "issued_at": "2026-09-22T09:17:15Z",
        "ttl_s": 120,
        "trace_id": "t-00938812"
    },
    {
        "msg_id": "m-8f2a003",
        "work_id": "WO-2026-015091",
        "correlation_id": "c-3b991209",
        "sender": { "agent_id": "reliability-sentinel", "version": "2.0.0" },
        "recipient": "capability:actions.dispatch",
        "intent": "mitigation.execute",
        "payload": {
            "action": "RUNNER_POOL_SCALE",
            "idempotency_key": "idemp-scale-pool-1209",
            "target_system": "Jenkins",
            "pool_limit": 16
        },
        "evidence_refs": ["ev-cicd-1209"],
        "confidence": 0.99,
        "issued_at": "2026-09-22T14:12:00Z",
        "ttl_s": 60,
        "trace_id": "t-00941209"
    }
]

SEED_CAPABILITY_SUBSCRIPTIONS = [
    {
        "capability_uri": "capability:findings.reconcile",
        "description": "Scatter-gather findings reconciliation and conflict escalation to Plane 3.",
        "subscribers": ["reliability-sentinel-agent", "plane2-dag-planner"]
    },
    {
        "capability_uri": "capability:actions.dispatch",
        "description": "Serialized mutation arbiter with idempotency verification and undo registration.",
        "subscribers": ["write-arbiter", "controlled-tool-layer"]
    },
    {
        "capability_uri": "capability:evidence.resolve",
        "description": "Deterministic evidence resolution across Git, Jira, CI/CD, and Datadog.",
        "subscribers": ["evidence-service"]
    },
    {
        "capability_uri": "capability:conformance.evaluate",
        "description": "Standards catalog rule evaluation against code diffs and IaC manifests.",
        "subscribers": ["arch-conformance-agent"]
    },
    {
        "capability_uri": "capability:challenge.adjudicate",
        "description": "Plane 3 Challenge Protocol duel between Architecture Authority and Delivery Governor.",
        "subscribers": ["arch-authority", "delivery-governor"]
    }
]

SEED_SYNCHRONOUS_CHANNELS_CATALOG = [
    {
        "capability_uri": "capability:evidence.resolve",
        "description": "Direct pointer lookup in Evidence Service. Bounded timeout 500ms.",
        "caller_agent": "Any Specialist Agent",
        "target_provider": "Evidence Service Substrate",
        "max_timeout_ms": 500,
        "is_blocking": True
    },
    {
        "capability_uri": "capability:standards.query_rule",
        "description": "Standards catalog ADR specification retrieval. Bounded timeout 250ms.",
        "caller_agent": "Architecture Conformance Agent",
        "target_provider": "Knowledge Base Substrate",
        "max_timeout_ms": 250,
        "is_blocking": True
    },
    {
        "capability_uri": "capability:blast_radius.lookup",
        "description": "CMDB dependency graph topology query. Bounded timeout 800ms.",
        "caller_agent": "Dependency & Impact Agent",
        "target_provider": "CMDB Substrate Service",
        "max_timeout_ms": 800,
        "is_blocking": True
    }
]

SEED_EPISODIC_MEMORY_RUNS = [
    {
        "work_id": "WO-2026-014872",
        "active_run_id": "run-ep-014872-a",
        "intermediate_reasoning": [
            "Intake normalized: payments-api change touching synchronous ledger RPC.",
            "Scatter phase initiated: evaluated ADR-001; identified connection pool saturation risk under 10x burst load.",
            "Blackboard updated with initial blast score 0.61; awaiting Plane 3 challenge resolution."
        ],
        "transient_context": {
            "scratch_tps_estimate": 12000,
            "temp_git_tree_hash": "8f2a41b149",
            "redis_cqrs_provisional_flag": True
        },
        "started_at": "2026-09-22T09:14:00Z",
        "status": "ACTIVE"
    },
    {
        "work_id": "WO-2026-015091",
        "active_run_id": "run-ep-015091-b",
        "intermediate_reasoning": [
            "Incident INC-9912 runner starvation detected on worker-pool-node.",
            "Runbook auto-mitigation executed and logged via Write Arbiter sequence #1006."
        ],
        "transient_context": {
            "temp_queue_depth": 42,
            "auto_drain_duration_s": 180
        },
        "started_at": "2026-09-22T14:10:00Z",
        "status": "COMPLETED"
    }
]

# ==============================================================================
# SECTION 8: PARALLEL EXECUTION, RECONCILIATION & SPECULATIVE SUBSYSTEM
# ==============================================================================

SEED_SCATTER_GATHER_RUNS = [
    {
        "run_id": "sg-run-014872",
        "work_id": "WO-2026-014872",
        "play_node": "analyze",
        "branches": [
            {
                "branch_id": "b-arch",
                "agent_id": "arch-conformance",
                "capability_invoked": "capability:findings.reconcile",
                "status": "COMPLETED",
                "wall_clock_ms": 2200,
                "tokens_used": 9400,
                "findings_count": 2
            },
            {
                "branch_id": "b-dep",
                "agent_id": "dep-impact",
                "capability_invoked": "capability:blast_radius.lookup",
                "status": "COMPLETED",
                "wall_clock_ms": 1850,
                "tokens_used": 6800,
                "findings_count": 1
            },
            {
                "branch_id": "b-flow",
                "agent_id": "flow-analyst",
                "capability_invoked": "capability:flow.analyze",
                "status": "COMPLETED",
                "wall_clock_ms": 1400,
                "tokens_used": 5200,
                "findings_count": 1
            },
            {
                "branch_id": "b-code",
                "agent_id": "code-review",
                "capability_invoked": "capability:code.inspect",
                "status": "COMPLETED",
                "wall_clock_ms": 2800,
                "tokens_used": 11200,
                "findings_count": 2
            },
            {
                "branch_id": "b-sentinel",
                "agent_id": "reliability-sentinel",
                "capability_invoked": "capability:reliability.evaluate",
                "status": "COMPLETED",
                "wall_clock_ms": 2100,
                "tokens_used": 8600,
                "findings_count": 1
            }
        ],
        "total_wall_clock_ms": 2800,
        "serial_equivalent_ms": 10350,
        "latency_saved_ms": 7550,
        "concurrency_factor": 3.7,
        "total_tokens_used": 41200,
        "initiated_at": "2026-09-22T09:14:05Z",
        "status": "COMPLETED"
    }
]

SEED_RECONCILIATION_RUNS = [
    {
        "reconciliation_id": "rec-014872-main",
        "work_id": "WO-2026-014872",
        "raw_findings_count": 7,
        "step1_dropped_unbacked": [
            {
                "finding_id": "fnd-hallucinated-09",
                "agent_id": "code-review",
                "unresolvable_evidence_ref": "ev-fake-999-unbacked",
                "drop_reason": "Chant #2: Dropped finding with unresolvable evidence reference in Evidence Service",
                "dropped_at": "2026-09-22T09:15:10Z"
            }
        ],
        "step2_deduplicated_clusters": [
            {
                "cluster_id": "cl-pool-exhaustion-01",
                "root_cause_summary": "Postgres connection pool saturation under 10x burst load with thread contention",
                "contributing_findings": ["fnd-cr-014872-timeout", "fnd-arc-014872-pool-cap"],
                "participating_agents": ["code-review", "arch-conformance"],
                "severity": "HIGH",
                "evidence_refs": ["ev-dd-trace-canary", "ev-git-402"]
            }
        ],
        "step3_conflicts_escalated": [
            {
                "conflict_id": "conf-014872-scale-vs-iops",
                "rule_or_topic": "Database Connection Scaling vs IOPS Saturation Limit",
                "agent_a": "Reliability Sentinel Agent",
                "claim_a": "Safe to auto-scale connection pool limit from 10 to 50 connections to eliminate queuing.",
                "confidence_a": 0.91,
                "agent_b": "Architecture Authority",
                "claim_b": "Prohibit pool expansion above 20 connections; downstream Postgres IOPS cap would saturate, threatening shared ledger.",
                "confidence_b": 0.96,
                "verdict_action": "ESCALATE_TO_PLANE_3",
                "escalation_rationale": "Chant #5: Contradictory findings are not averaged and not resolved by reconciler. Specialist disagreement is a first-class signal."
            }
        ],
        "surviving_clean_findings_count": 4,
        "reconciled_at": "2026-09-22T09:15:14Z"
    }
]

SEED_SPECULATIVE_RUNS = [
    {
        "speculative_run_id": "spec-run-fast-01",
        "work_id": "WO-2026-015091",
        "lane": "FAST",
        "policy_allowed": True,
        "policy_message": "Speculative execution is permitted in FAST lane (Costs tokens, buys latency).",
        "competing_branches": [
            {
                "branch_id": "spec-branch-a",
                "approach_name": "Aggressive Auto-Drain Scaling",
                "strategy_type": "SCALE_RUNNER_POOL",
                "tokens_spent": 1400,
                "latency_ms": 120,
                "confidence": 0.96,
                "outcome": "WINNER_COMMITTED",
                "discard_rationale": None
            },
            {
                "branch_id": "spec-branch-b",
                "approach_name": "Emergency Worker Pod Recycle",
                "strategy_type": "POD_RESTART_CYCLE",
                "tokens_spent": 1100,
                "latency_ms": 450,
                "confidence": 0.65,
                "outcome": "DISCARDED_LOSER",
                "discard_rationale": "Scale-out resolved worker queue in 120ms with 0 dropped requests; pod restart branch discarded."
            }
        ],
        "winning_branch_id": "spec-branch-a",
        "speculative_investment_tokens": 1100,
        "latency_bought_ms": 330,
        "executed_at": "2026-09-22T14:11:00Z"
    },
    {
        "speculative_run_id": "spec-run-heavy-02",
        "work_id": "WO-2026-014903",
        "lane": "HEAVY",
        "policy_allowed": False,
        "policy_message": "Speculative execution is prohibited in HEAVY lane. In Heavy lane, the reasoning itself is the deliverable; token expenditure on competing discarded hypotheses is classified as wasteful toil.",
        "competing_branches": [],
        "winning_branch_id": None,
        "speculative_investment_tokens": 0,
        "latency_bought_ms": 0,
        "executed_at": "2026-09-22T16:00:00Z"
    }
]

# ==============================================================================
# SECTION 9: FAULT TOLERANCE, REDUNDANCY & REPLAY SEED DATA
# ==============================================================================

SEED_CIRCUIT_BREAKERS = [
    {
        "target_id": "github-api",
        "target_type": "TOOL",
        "state": "CLOSED",
        "failure_count": 0,
        "failure_threshold": 5,
        "recovery_timeout_s": 30,
        "last_failure_at": None,
        "last_state_change": "2026-09-22T08:00:00Z"
    },
    {
        "target_id": "jira-service",
        "target_type": "TOOL",
        "state": "CLOSED",
        "failure_count": 1,
        "failure_threshold": 5,
        "recovery_timeout_s": 30,
        "last_failure_at": "2026-09-22T11:20:00Z",
        "last_state_change": "2026-09-22T08:00:00Z"
    },
    {
        "target_id": "cmdb-graph",
        "target_type": "TOOL",
        "state": "HALF_OPEN",
        "failure_count": 3,
        "failure_threshold": 5,
        "recovery_timeout_s": 30,
        "last_failure_at": "2026-09-22T14:45:00Z",
        "last_state_change": "2026-09-22T14:46:00Z"
    },
    {
        "target_id": "primary-llm",
        "target_type": "MODEL",
        "state": "CLOSED",
        "failure_count": 0,
        "failure_threshold": 3,
        "recovery_timeout_s": 60,
        "last_failure_at": None,
        "last_state_change": "2026-09-22T08:00:00Z"
    },
    {
        "target_id": "secondary-llm",
        "target_type": "MODEL",
        "state": "CLOSED",
        "failure_count": 0,
        "failure_threshold": 3,
        "recovery_timeout_s": 60,
        "last_failure_at": None,
        "last_state_change": "2026-09-22T08:00:00Z"
    }
]

SEED_BULKHEADS = [
    {
        "pool_id": "git_pool",
        "target_system": "GitHub Repositories",
        "max_concurrency": 8,
        "active_slots": 3,
        "queued_requests": 0,
        "rejected_requests": 0
    },
    {
        "pool_id": "ci_pool",
        "target_system": "Jenkins CI Pipelines",
        "max_concurrency": 10,
        "active_slots": 8,
        "queued_requests": 2,
        "rejected_requests": 0
    },
    {
        "pool_id": "metrics_pool",
        "target_system": "Datadog Telemetry",
        "max_concurrency": 15,
        "active_slots": 4,
        "queued_requests": 0,
        "rejected_requests": 0
    }
]

SEED_MODEL_TIER_LADDER = [
    {
        "tier_level": 1,
        "tier_name": "Tier 1: Primary Model",
        "model_id": "gemini-1.5-pro",
        "max_confidence": 0.95,
        "cost_per_1k_tokens": 0.015,
        "status": "SUCCESS"
    },
    {
        "tier_level": 2,
        "tier_name": "Tier 2: Secondary Model",
        "model_id": "gpt-4o",
        "max_confidence": 0.82,
        "cost_per_1k_tokens": 0.010,
        "status": "SUCCESS"
    },
    {
        "tier_level": 3,
        "tier_name": "Tier 3: Smaller/Cheaper Model",
        "model_id": "gemini-1.5-flash",
        "max_confidence": 0.68,
        "cost_per_1k_tokens": 0.001,
        "status": "SUCCESS"
    },
    {
        "tier_level": 4,
        "tier_name": "Tier 4: Deterministic Path",
        "model_id": "rules-catalog.v4",
        "max_confidence": 0.50,
        "cost_per_1k_tokens": 0.000,
        "status": "SUCCESS"
    }
]

SEED_DLQ_ITEMS = [
    {
        "dlq_id": "DLQ-2026-0041",
        "work_id": "WO-2026-014799",
        "intent_class": "schema.migration",
        "risk_tier": "T2",
        "failure_step": "apply_ddl",
        "retry_count": 3,
        "max_retries": 3,
        "error_trace": "DeadlockTimeout: Lock acquisition timeout on table 'ledger_entries' after 3 retries with exponential backoff. Landed in DLQ for operator triage.",
        "snapshot_state": {
            "target_service": "ledger",
            "migration_script": "20260922_add_index_tx.sql",
            "active_connections": 42
        },
        "enqueued_at": "2026-09-22T08:30:00Z",
        "status": "UNTRIAGED"
    }
]

SEED_DUAL_PATH_RUNS = [
    {
        "run_id": "dp-014872-t1",
        "work_id": "WO-2026-014872",
        "risk_tier": "T1",
        "path_a": {
            "path_id": "PATH_A",
            "agent_name": "Architecture Authority",
            "model_used": "gemini-1.5-pro",
            "evidence_framing": "Standards Compliance & Blast Radius",
            "verdict": "BLOCK_FOR_CHALLENGE",
            "confidence": 0.94,
            "rationale": "High blast radius (0.61) on payments-api; ADR-001 requires explicit CQRS waiver."
        },
        "path_b": {
            "path_id": "PATH_B",
            "agent_name": "Independent Skeptic Agent",
            "model_used": "claude-3-5-sonnet",
            "evidence_framing": "Failure Mode & 10x Load Burst Analysis",
            "verdict": "BLOCK_FOR_CHALLENGE",
            "confidence": 0.96,
            "rationale": "Direct synchronous ledger call creates cascading thread exhaustion under burst traffic."
        },
        "consensus_status": "AGREEMENT_HIGH_CONFIDENCE",
        "final_confidence": 0.98,
        "routed_to": "AUTOMATED_CHALLENGE_PROTOCOL",
        "created_at": "2026-09-22T09:14:10Z"
    }
]

SEED_REPLAY_SESSIONS = [
    {
        "work_id": "WO-2026-014872",
        "total_events": 5,
        "initial_state": {
            "state": "intake_received",
            "lane": "UNASSIGNED",
            "version_lock": 1
        },
        "final_state": {
            "state": "in_challenge_protocol",
            "lane": "STANDARD",
            "version_lock": 3
        },
        "steps": [
            {
                "step_index": 1,
                "timestamp": "09:14:00",
                "event": "WORK_OBJECT_INTAKE",
                "source_plane": "PLANE_2_ORCHESTRATION",
                "actor": "Intake & Intent Agent",
                "state_delta": {"state": "intake_classified", "intent": "service.change"},
                "payload_summary": "Normalized signal from Jira PLAT-4821 into canonical Work Object WO-2026-014872."
            },
            {
                "step_index": 2,
                "timestamp": "09:14:02",
                "event": "ROUTING_DETERMINISTIC",
                "source_plane": "PLANE_2_ORCHESTRATION",
                "actor": "Policy-as-Code Router",
                "state_delta": {"lane": "STANDARD", "play": "play.service_change.standard.v4"},
                "payload_summary": "Policy R-PAC-002 matched: Standard lane selected (0ms model latency, $0 token cost)."
            },
            {
                "step_index": 3,
                "timestamp": "09:14:05",
                "event": "SCATTER_FAN_OUT",
                "source_plane": "PLANE_2_ORCHESTRATION",
                "actor": "Play DAG Engine",
                "state_delta": {"play_node": "analyze", "parallel_branches": 5},
                "payload_summary": "Launched 5 parallel specialist agents (saved 7550ms wall-clock time, 3.7x speedup)."
            },
            {
                "step_index": 4,
                "timestamp": "09:15:10",
                "event": "RECONCILIATION_JOIN",
                "source_plane": "PLANE_2_ORCHESTRATION",
                "actor": "Reconciler",
                "state_delta": {"dropped_findings": 1, "deduplicated_clusters": 1, "escalated_conflicts": 1},
                "payload_summary": "Dropped unbacked fnd-hallucinated-09 (Chant #2), clustered pool findings, detected contradiction (Chant #5)."
            },
            {
                "step_index": 5,
                "timestamp": "09:16:04",
                "event": "PLANE_3_ESCALATION",
                "source_plane": "PLANE_3_ADJUDICATION",
                "actor": "Super Agents Hub",
                "state_delta": {"state": "in_challenge_protocol", "version_lock": 3},
                "payload_summary": "Challenge Protocol CP-2026-093 initiated between Architecture Authority and Delivery Governor."
            }
        ]
    }
]

# ==============================================================================
# SECTION 10: SECURITY AND AUDIT SEED DATA
# ==============================================================================

SEED_AGENT_SCOPES = [
    {
        "agent_id": "arch-conformance",
        "version": "2.1.0",
        "write_scope": "read_only",
        "allowed_mutations": [],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "dep-blast-radius",
        "version": "1.8.4",
        "write_scope": "read_only",
        "allowed_mutations": [],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "flow-invariants",
        "version": "2.0.1",
        "write_scope": "read_only",
        "allowed_mutations": [],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "code-reviewer",
        "version": "3.1.2",
        "write_scope": "proposals_only",
        "allowed_mutations": ["create_pr_comment", "suggest_diff"],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "security-scanner",
        "version": "2.4.0",
        "write_scope": "read_only",
        "allowed_mutations": [],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "architecture-authority",
        "version": "3.0.0",
        "write_scope": "proposals_only",
        "allowed_mutations": ["issue_challenge", "record_dissent", "recommend_waiver"],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "delivery-governor",
        "version": "3.0.0",
        "write_scope": "proposals_only",
        "allowed_mutations": ["hold_gate", "clear_gate", "record_dissent"],
        "is_autonomous_approved": False,
        "sign_off_ref": None
    },
    {
        "agent_id": "write-arbiter",
        "version": "1.0.0",
        "write_scope": "autonomous",
        "allowed_mutations": ["mutate_work_object", "apply_git_patch", "commit_audit_entry"],
        "is_autonomous_approved": True,
        "sign_off_ref": "SIGNOFF-2026-CHG-0042"
    }
]

SEED_AUTONOMOUS_SIGNOFFS = [
    {
        "signoff_id": "SIGNOFF-2026-CHG-0042",
        "agent_id": "write-arbiter",
        "granted_by": "VP of Platform Engineering & SecOps Council",
        "justification": "Chant #1: Write path requires single serialized arbiter with optimistic locking and idempotency key. Tool-layer scope enforcement permits Work Object state mutation and audit ledger commits only.",
        "scope_permitted": "write_scope: autonomous (WO mutations & audit trail)",
        "effective_date": "2026-09-01T00:00:00Z",
        "review_cadence": "quarterly"
    }
]

SEED_REDACTED_SECRETS_LOG = [
    {
        "secret_id": "sec-001",
        "pattern_type": "AWS_KEY",
        "redacted_placeholder": "[REDACTED_AWS_KEY:ev-sec-01]",
        "source_uri": "s3://corp-evidence-bucket/logs/checkout-deploy.log",
        "redacted_at": "2026-09-22T09:12:15Z"
    },
    {
        "secret_id": "sec-002",
        "pattern_type": "API_TOKEN",
        "redacted_placeholder": "[REDACTED_API_TOKEN:ev-sec-02]",
        "source_uri": "git://github.com/corp/billing-api/pull/418#diff",
        "redacted_at": "2026-09-22T09:14:02Z"
    },
    {
        "secret_id": "sec-003",
        "pattern_type": "JWT",
        "redacted_placeholder": "[REDACTED_JWT:ev-sec-03]",
        "source_uri": "datadog://traces/t-00938472",
        "redacted_at": "2026-09-22T09:15:30Z"
    },
    {
        "secret_id": "sec-004",
        "pattern_type": "DB_CREDENTIAL",
        "redacted_placeholder": "[REDACTED_DB_CREDENTIAL:ev-sec-04]",
        "source_uri": "jira://PLAT-4821/description",
        "redacted_at": "2026-09-22T09:15:55Z"
    }
]

SEED_FULL_AUDIT_LOG = [
    {
        "audit_id": "aud-001",
        "who_agent": "write-arbiter:v1.0.0",
        "what_action": "STATE_TRANSITION -> in_challenge_protocol",
        "when_timestamp": "2026-09-22T09:16:04Z",
        "play_version": "play.service_change.standard.v4",
        "evidence_refs": ["ev-44a1", "ev-44a2"],
        "approved_by": "Policy-as-Code Engine (R-PAC-002)",
        "status": "COMMITTED",
        "details": {"work_id": "WO-2026-014872", "lock_version": 3}
    },
    {
        "audit_id": "aud-002",
        "who_agent": "write-arbiter:v1.0.0",
        "what_action": "RECORD_CHALLENGE -> CP-2026-093",
        "when_timestamp": "2026-09-22T09:16:10Z",
        "play_version": "play.service_change.standard.v4",
        "evidence_refs": ["ev-dd-trace-canary", "ev-jira-8821"],
        "approved_by": "Architecture Authority",
        "status": "COMMITTED",
        "details": {"phase": "CHALLENGE_ISSUED", "target": "checkout-service:v2.14.0"}
    },
    {
        "audit_id": "aud-003",
        "who_agent": "write-arbiter:v1.0.0",
        "what_action": "COMMIT_WAIVER -> WVR-2026-0143",
        "when_timestamp": "2026-09-22T09:18:22Z",
        "play_version": "play.service_change.standard.v4",
        "evidence_refs": ["ev-adr-coupling-01"],
        "approved_by": "Architecture Authority & Delivery Governor Dual-Signoff",
        "status": "COMMITTED",
        "details": {"waiver_code": "WVR-2026-0143", "expiry_days": 30}
    },
    {
        "audit_id": "aud-004",
        "who_agent": "write-arbiter:v1.0.0",
        "what_action": "EVIDENCE_SANITIZATION -> ev-sec-raw-ticket",
        "when_timestamp": "2026-09-22T09:20:00Z",
        "play_version": "play.service_change.standard.v4",
        "evidence_refs": ["ev-sec-raw-ticket"],
        "approved_by": "Evidence Service Ingestion Pipeline",
        "status": "COMMITTED",
        "details": {"redactions_performed": 2, "zero_secrets_leaked": True}
    }
]

# ==============================================================================
# SECTION 11: OBSERVABILITY SEED DATA
# ==============================================================================

SEED_SYSTEM_HEALTH = {
    "status": "HEALTHY",
    "queue_depths": [
        {"queue_name": "Event Bus Ingress Buffer", "depth": 3, "max_capacity": 1000, "status": "HEALTHY"},
        {"queue_name": "Write Arbiter Serialization Queue", "depth": 0, "max_capacity": 50, "status": "HEALTHY"},
        {"queue_name": "Dead-Letter Queue (DLQ)", "depth": 1, "max_capacity": 100, "status": "HEALTHY"},
        {"queue_name": "Scatter-Gather Task Runner Pool", "depth": 4, "max_capacity": 32, "status": "HEALTHY"},
        {"queue_name": "Evidence Retrieval Stream", "depth": 2, "max_capacity": 200, "status": "HEALTHY"}
    ],
    "agent_latencies": [
        {"agent_id": "intake-intent", "p50_ms": 380, "p95_ms": 950, "call_count": 482},
        {"agent_id": "arch-conformance", "p50_ms": 1240, "p95_ms": 2850, "call_count": 340},
        {"agent_id": "flow-analyst", "p50_ms": 820, "p95_ms": 1950, "call_count": 280},
        {"agent_id": "dep-blast-radius", "p50_ms": 940, "p95_ms": 2100, "call_count": 315},
        {"agent_id": "code-reviewer", "p50_ms": 1650, "p95_ms": 3800, "call_count": 220},
        {"agent_id": "security-scanner", "p50_ms": 1100, "p95_ms": 2450, "call_count": 330},
        {"agent_id": "architecture-authority", "p50_ms": 1450, "p95_ms": 3200, "call_count": 145},
        {"agent_id": "delivery-governor", "p50_ms": 1380, "p95_ms": 3100, "call_count": 145}
    ],
    "tool_error_rates": [
        {"tool_id": "git.read", "calls_count": 1840, "errors_count": 6, "error_rate_pct": 0.33, "status": "HEALTHY"},
        {"tool_id": "jira.read", "calls_count": 1290, "errors_count": 12, "error_rate_pct": 0.93, "status": "HEALTHY"},
        {"tool_id": "metrics.query", "calls_count": 980, "errors_count": 1, "error_rate_pct": 0.10, "status": "HEALTHY"},
        {"tool_id": "cmdb.graph_query", "calls_count": 640, "errors_count": 4, "error_rate_pct": 0.62, "status": "HEALTHY"},
        {"tool_id": "model_gateway.invoke", "calls_count": 2410, "errors_count": 18, "error_rate_pct": 0.75, "status": "HEALTHY"}
    ],
    "circuit_breakers_summary": {"CLOSED": 4, "OPEN": 0, "HALF_OPEN": 1},
    "dlq_depth": 1,
    "budget_exhaustion_frequency_pct": 1.8,
    "budget_exhaustion_runs_count": 9,
    "total_runs_evaluated": 500
}

SEED_QUALITY_METRICS = {
    "status": "OPTIMAL",
    "agent_stats": [
        {
            "agent_id": "arch-conformance",
            "agent_name": "Architecture Conformance",
            "total_findings": 240,
            "accepted_findings": 226,
            "acceptance_rate_pct": 94.2,
            "false_positive_rate_pct": 3.8,
            "quality_sla_status": "MEETS_SLA"
        },
        {
            "agent_id": "flow-analyst",
            "agent_name": "Flow Analyst",
            "total_findings": 185,
            "accepted_findings": 164,
            "acceptance_rate_pct": 88.6,
            "false_positive_rate_pct": 5.2,
            "quality_sla_status": "MEETS_SLA"
        },
        {
            "agent_id": "dep-blast-radius",
            "agent_name": "Dependency & Blast Radius",
            "total_findings": 210,
            "accepted_findings": 194,
            "acceptance_rate_pct": 92.4,
            "false_positive_rate_pct": 4.1,
            "quality_sla_status": "MEETS_SLA"
        },
        {
            "agent_id": "code-reviewer",
            "agent_name": "Code & Design Review",
            "total_findings": 320,
            "accepted_findings": 294,
            "acceptance_rate_pct": 91.9,
            "false_positive_rate_pct": 4.7,
            "quality_sla_status": "MEETS_SLA"
        },
        {
            "agent_id": "security-scanner",
            "agent_name": "Security Conformance",
            "total_findings": 160,
            "accepted_findings": 152,
            "acceptance_rate_pct": 95.0,
            "false_positive_rate_pct": 2.5,
            "quality_sla_status": "MEETS_SLA"
        },
        {
            "agent_id": "intake-intent",
            "agent_name": "Intake & Intent Classifier",
            "total_findings": 482,
            "accepted_findings": 467,
            "acceptance_rate_pct": 96.9,
            "false_positive_rate_pct": 3.1,
            "quality_sla_status": "MEETS_SLA"
        }
    ],
    "aggregate_false_positive_rate_pct": 3.9,
    "escalation_rate_pct": 8.4,
    "human_override_rate_pct": 2.1,
    "brier_score": 0.041,
    "expected_calibration_error": 0.016,
    "calibration_bins": [
        {
            "bin_range": "0.50 - 0.60",
            "predicted_confidence_midpoint": 0.55,
            "empirical_accuracy_pct": 54.2,
            "sample_count": 85,
            "calibration_gap_pct": 0.8
        },
        {
            "bin_range": "0.60 - 0.70",
            "predicted_confidence_midpoint": 0.65,
            "empirical_accuracy_pct": 66.0,
            "sample_count": 120,
            "calibration_gap_pct": 1.0
        },
        {
            "bin_range": "0.70 - 0.80",
            "predicted_confidence_midpoint": 0.75,
            "empirical_accuracy_pct": 74.4,
            "sample_count": 210,
            "calibration_gap_pct": 0.6
        },
        {
            "bin_range": "0.80 - 0.90",
            "predicted_confidence_midpoint": 0.85,
            "empirical_accuracy_pct": 84.8,
            "sample_count": 340,
            "calibration_gap_pct": 0.2
        },
        {
            "bin_range": "0.90 - 1.00",
            "predicted_confidence_midpoint": 0.95,
            "empirical_accuracy_pct": 95.6,
            "sample_count": 490,
            "calibration_gap_pct": 0.6
        }
    ]
}

SEED_DISTRIBUTED_TRACES = [
    {
        "trace_id": "t-00938472-8f2a",
        "work_id": "WO-2026-014872",
        "play_id": "play.service_change.standard.v4",
        "start_time": "2026-09-22T09:14:00.120Z",
        "total_duration_ms": 3420,
        "total_tokens": 14500,
        "total_cost_usd": 0.048,
        "root_status": "SUCCESS",
        "spans": [
            {
                "span_id": "span-01-root",
                "parent_span_id": None,
                "name": "Play Execution DAG",
                "span_type": "ORCHESTRATION",
                "actor": "Play DAG Engine",
                "start_time_offset_ms": 0,
                "duration_ms": 3420,
                "tokens_spent": 14500,
                "status": "OK",
                "details": {"play": "play.service_change.standard.v4", "lane": "STANDARD"}
            },
            {
                "span_id": "span-02-intake",
                "parent_span_id": "span-01-root",
                "name": "Intake & Intent Normalization",
                "span_type": "AGENT",
                "actor": "intake-intent:v2.1.0",
                "start_time_offset_ms": 20,
                "duration_ms": 420,
                "tokens_spent": 2100,
                "status": "OK",
                "details": {"confidence": 0.94, "intent": "service.change"}
            },
            {
                "span_id": "span-03-jira",
                "parent_span_id": "span-02-intake",
                "name": "Fetch Issue Context",
                "span_type": "TOOL",
                "actor": "jira.read",
                "start_time_offset_ms": 60,
                "duration_ms": 180,
                "tokens_spent": 0,
                "status": "OK",
                "details": {"issue": "PLAT-4821", "cached": False}
            },
            {
                "span_id": "span-04-scatter",
                "parent_span_id": "span-01-root",
                "name": "Scatter-Gather Fan-Out (5 Specialists)",
                "span_type": "ORCHESTRATION",
                "actor": "ScatterGatherEngine",
                "start_time_offset_ms": 460,
                "duration_ms": 2200,
                "tokens_spent": 9600,
                "status": "OK",
                "details": {"concurrency": 5, "speedup": "3.7x"}
            },
            {
                "span_id": "span-04a-arch",
                "parent_span_id": "span-04-scatter",
                "name": "Architecture Conformance Analysis",
                "span_type": "AGENT",
                "actor": "arch-conformance:v2.4.0",
                "start_time_offset_ms": 480,
                "duration_ms": 2100,
                "tokens_spent": 4200,
                "status": "OK",
                "details": {"model": "gemini-1.5-pro", "findings": 2}
            },
            {
                "span_id": "span-04a-git",
                "parent_span_id": "span-04a-arch",
                "name": "Fetch PR Diff",
                "span_type": "TOOL",
                "actor": "git.read",
                "start_time_offset_ms": 520,
                "duration_ms": 240,
                "tokens_spent": 0,
                "status": "OK",
                "details": {"repo": "billing-api", "pr": 418}
            },
            {
                "span_id": "span-04b-dep",
                "parent_span_id": "span-04-scatter",
                "name": "Dependency Blast Radius Scan",
                "span_type": "AGENT",
                "actor": "dep-blast-radius:v1.8.4",
                "start_time_offset_ms": 490,
                "duration_ms": 1750,
                "tokens_spent": 2800,
                "status": "OK",
                "details": {"blast_radius": 0.61, "risk_tier": "T1"}
            },
            {
                "span_id": "span-04c-flow",
                "parent_span_id": "span-04-scatter",
                "name": "Flow & Bottleneck Analysis",
                "span_type": "AGENT",
                "actor": "flow-analyst:v2.0.1",
                "start_time_offset_ms": 500,
                "duration_ms": 1850,
                "tokens_spent": 2600,
                "status": "OK",
                "details": {"queue_ratio": "68.2%"}
            },
            {
                "span_id": "span-05-reconcile",
                "parent_span_id": "span-01-root",
                "name": "Reconciliation (Drop/Dedup/Escalate)",
                "span_type": "ORCHESTRATION",
                "actor": "Reconciler",
                "start_time_offset_ms": 2680,
                "duration_ms": 95,
                "tokens_spent": 0,
                "status": "OK",
                "details": {"dropped": 1, "deduped": 1, "escalated": 1}
            },
            {
                "span_id": "span-06-challenge",
                "parent_span_id": "span-01-root",
                "name": "Plane 3 Challenge Protocol CP-2026-093",
                "span_type": "AGENT",
                "actor": "SuperAgentsHub",
                "start_time_offset_ms": 2780,
                "duration_ms": 620,
                "tokens_spent": 2800,
                "status": "OK",
                "details": {"arbitration": "Waiver WVR-2026-0143 Recommended"}
            },
            {
                "span_id": "span-07-commit",
                "parent_span_id": "span-01-root",
                "name": "Write Arbiter Sequential Commit",
                "span_type": "ORCHESTRATION",
                "actor": "WriteArbiter",
                "start_time_offset_ms": 3400,
                "duration_ms": 20,
                "tokens_spent": 0,
                "status": "OK",
                "details": {"sequence_number": 1006, "idempotency_key": "idemp-wo-014872-wvr"}
            }
        ]
    },
    {
        "trace_id": "t-00938473-b3c1",
        "work_id": "WO-2026-015091",
        "play_id": "play.hotfix.incident.fast.v2",
        "start_time": "2026-09-22T10:02:15.000Z",
        "total_duration_ms": 1280,
        "total_tokens": 5800,
        "total_cost_usd": 0.016,
        "root_status": "SUCCESS",
        "spans": [
            {
                "span_id": "span-fast-01",
                "parent_span_id": None,
                "name": "Fast Lane Play Execution",
                "span_type": "ORCHESTRATION",
                "actor": "Play DAG Engine",
                "start_time_offset_ms": 0,
                "duration_ms": 1280,
                "tokens_spent": 5800,
                "status": "OK",
                "details": {"play": "play.hotfix.incident.fast.v2", "lane": "FAST"}
            },
            {
                "span_id": "span-fast-02",
                "parent_span_id": "span-fast-01",
                "name": "Reliability Incident Diagnostic",
                "span_type": "AGENT",
                "actor": "reliability-agent:v2.2.0",
                "start_time_offset_ms": 30,
                "duration_ms": 750,
                "tokens_spent": 3800,
                "status": "OK",
                "details": {"incident": "INC-4412"}
            },
            {
                "span_id": "span-fast-03",
                "parent_span_id": "span-fast-02",
                "name": "Fetch Datadog Canary APM",
                "span_type": "TOOL",
                "actor": "datadog.metrics.read",
                "start_time_offset_ms": 80,
                "duration_ms": 220,
                "tokens_spent": 0,
                "status": "OK",
                "details": {"query": "connections.pool.saturation"}
            },
            {
                "span_id": "span-fast-04",
                "parent_span_id": "span-fast-01",
                "name": "Write Arbiter Fast Action Commit",
                "span_type": "ORCHESTRATION",
                "actor": "WriteArbiter",
                "start_time_offset_ms": 1240,
                "duration_ms": 40,
                "tokens_spent": 0,
                "status": "OK",
                "details": {"action": "scale_connection_pool", "sequence_number": 1007}
            }
        ]
    }
]

# ==============================================================================
# SECTION 12: THE TRUST LADDER SEED DATA (CHANT #8)
# ==============================================================================

SEED_TRUST_LADDER_PLAYS = [
    {
        "play_id": "play.change_comms.release_notes.v1",
        "play_name": "Release Notes & CAB Administrative Packaging",
        "owning_agent_id": "change-comms",
        "v1_sequence_order": 1,
        "risk_tier": "LOW",
        "current_rung": "AUTONOMOUS",
        "behaviour": "Acts within declared write scope (drafts, formats, and publishes release notes and Jira transition paperwork directly).",
        "promotion_criterion": "Explicit sign-off recorded in changelog (Chant #8) with defined demotion trigger.",
        "promotion_progress": {
            "metric_name": "Autonomy Sign-off & Clean Executions",
            "current_val": 100.0,
            "target_val": 100.0,
            "display_current": "Signoff SIGNOFF-2026-CHG-0038 Verified (142 runs)",
            "display_target": "Explicit Signoff & 50+ runs",
            "pct_complete": 100.0,
            "eligible_for_promotion": False
        },
        "demotion_trigger": {
            "trigger_type": "FALSE_POSITIVE_SPIKE",
            "threshold": "> 5.0% formatting rejection rate",
            "active_metric_val": "0.7% rejection rate",
            "is_tripped": False,
            "rule_statement": "Demotion is automatic and does not require a meeting."
        },
        "consecutive_clean_runs": 85,
        "total_runs": 142,
        "last_evaluated_at": "2026-09-22T17:30:00Z",
        "history": [
            {
                "timestamp": "2026-08-15T10:00:00Z",
                "previous_rung": "APPROVAL_REQUIRED",
                "new_rung": "AUTONOMOUS",
                "event_type": "PROMOTION",
                "reason": "Completed 50 consecutive supervised runs with 0 overrides. Signoff SIGNOFF-2026-CHG-0038 recorded in changelog.",
                "triggered_by": "SecOps Council & Release Lead"
            }
        ]
    },
    {
        "play_id": "play.flow.reviewer_reassignment.v2",
        "play_name": "PR Reviewer Idle Reassignment Suggestion",
        "owning_agent_id": "flow-analyst",
        "v1_sequence_order": 2,
        "risk_tier": "LOW",
        "current_rung": "ADVISORY",
        "behaviour": "Output shown to humans as suggestion (identifies idle reviewers and proposes alternate reviewer in Slack/PR).",
        "promotion_criterion": "Acceptance rate above threshold (>= 90%) sustained over 30 days & zero severity incidents.",
        "promotion_progress": {
            "metric_name": "Sustained Acceptance Rate",
            "current_val": 88.6,
            "target_val": 90.0,
            "display_current": "88.6% (164/185 accepted)",
            "display_target": "90.0% sustained",
            "pct_complete": 98.4,
            "eligible_for_promotion": False
        },
        "demotion_trigger": {
            "trigger_type": "FALSE_POSITIVE_SPIKE",
            "threshold": "> 10.0% rejected reassignments over 7d",
            "active_metric_val": "5.2% rejection rate",
            "is_tripped": False,
            "rule_statement": "Demotion is automatic and does not require a meeting."
        },
        "consecutive_clean_runs": 24,
        "total_runs": 185,
        "last_evaluated_at": "2026-09-22T18:00:00Z",
        "history": [
            {
                "timestamp": "2026-07-20T14:30:00Z",
                "previous_rung": "SHADOW",
                "new_rung": "ADVISORY",
                "event_type": "PROMOTION",
                "reason": "Achieved 94.0% accuracy against historical idle-review dataset across 50 shadow runs.",
                "triggered_by": "Flow Guild Lead"
            }
        ]
    },
    {
        "play_id": "play.arch.standards_conformance.v4",
        "play_name": "Architecture Conformance & Conforming Path Generation",
        "owning_agent_id": "arch-conformance",
        "v1_sequence_order": 3,
        "risk_tier": "MEDIUM",
        "current_rung": "ADVISORY",
        "behaviour": "Output shown to humans as suggestion (flags architectural standard violations and drafts concrete conforming alternative code diffs).",
        "promotion_criterion": "Acceptance rate above threshold (>= 92%) sustained over 30 days & low override rate.",
        "promotion_progress": {
            "metric_name": "Conforming Alternative Acceptance",
            "current_val": 94.2,
            "target_val": 92.0,
            "display_current": "94.2% (226/240 accepted)",
            "display_target": "92.0% sustained",
            "pct_complete": 100.0,
            "eligible_for_promotion": True
        },
        "demotion_trigger": {
            "trigger_type": "CALIBRATION_DROP",
            "threshold": "ECE > 0.04 or false positive spike > 8%",
            "active_metric_val": "ECE: 0.016, FP: 3.8%",
            "is_tripped": False,
            "rule_statement": "Demotion is automatic and does not require a meeting."
        },
        "consecutive_clean_runs": 48,
        "total_runs": 240,
        "last_evaluated_at": "2026-09-22T18:30:00Z",
        "history": [
            {
                "timestamp": "2026-08-01T09:00:00Z",
                "previous_rung": "SHADOW",
                "new_rung": "ADVISORY",
                "event_type": "PROMOTION",
                "reason": "Exceeded 95% accuracy against golden ADR compliance dataset.",
                "triggered_by": "Architecture Authority"
            }
        ]
    },
    {
        "play_id": "play.build.runner_optimization.v2",
        "play_name": "CI Spot Runner Pool Dynamic Re-allocation",
        "owning_agent_id": "build-release",
        "v1_sequence_order": 4,
        "risk_tier": "MEDIUM",
        "current_rung": "APPROVAL_REQUIRED",
        "behaviour": "Proposes concrete action, human clicks go (prepares runner pool rebalance command with dry-run verification, waits for 1-click go).",
        "promotion_criterion": "Low override rate (< 3%) and zero severity incidents over 50 consecutive runs.",
        "promotion_progress": {
            "metric_name": "Clean Supervised Runs",
            "current_val": 38.0,
            "target_val": 50.0,
            "display_current": "38 / 50 clean executions (0 overrides)",
            "display_target": "50 consecutive clean runs",
            "pct_complete": 76.0,
            "eligible_for_promotion": False
        },
        "demotion_trigger": {
            "trigger_type": "SEVERITY_INCIDENT",
            "threshold": "Any Sev-1/Sev-2 build queue stall",
            "active_metric_val": "0 incidents in trailing 90 days",
            "is_tripped": False,
            "rule_statement": "Demotion is automatic and does not require a meeting."
        },
        "consecutive_clean_runs": 38,
        "total_runs": 92,
        "last_evaluated_at": "2026-09-22T18:45:00Z",
        "history": [
            {
                "timestamp": "2026-08-20T11:15:00Z",
                "previous_rung": "ADVISORY",
                "new_rung": "APPROVAL_REQUIRED",
                "event_type": "PROMOTION",
                "reason": "Sustained 96.4% pipeline runner optimization success rate.",
                "triggered_by": "CI Platform Lead"
            }
        ]
    },
    {
        "play_id": "play.reliability.db_pool_shedding.v3",
        "play_name": "Database Connection Shedding & Circuit Tripping",
        "owning_agent_id": "reliability-agent",
        "v1_sequence_order": 5,
        "risk_tier": "HIGH",
        "current_rung": "SHADOW",
        "behaviour": "Runs, scores itself, takes no action, output invisible to requester (simulates connection pool shed decisions against golden incident logs).",
        "promotion_criterion": "Accuracy vs golden set over N runs (>= 96.0% over 50 golden runs).",
        "promotion_progress": {
            "metric_name": "Golden Dataset Benchmark Accuracy",
            "current_val": 95.2,
            "target_val": 96.0,
            "display_current": "95.2% (48/50 golden incidents matched)",
            "display_target": "96.0% accuracy",
            "pct_complete": 99.1,
            "eligible_for_promotion": False
        },
        "demotion_trigger": {
            "trigger_type": "CALIBRATION_DROP",
            "threshold": "Accuracy drop below 90% on golden benchmarks",
            "active_metric_val": "Current Accuracy: 95.2%",
            "is_tripped": False,
            "rule_statement": "Demotion is automatic and does not require a meeting."
        },
        "consecutive_clean_runs": 18,
        "total_runs": 50,
        "last_evaluated_at": "2026-09-22T19:00:00Z",
        "history": [
            {
                "timestamp": "2026-09-01T08:00:00Z",
                "previous_rung": "SHADOW",
                "new_rung": "SHADOW",
                "event_type": "RESET",
                "reason": "Initialized in Shadow mode per v1 sequencing: Reliability comes last.",
                "triggered_by": "Architecture Council"
            }
        ]
    },
    {
        "play_id": "play.write_arbiter.work_object_mutation.v1",
        "play_name": "Work Object State Mutation & Multi-System Commit",
        "owning_agent_id": "write-arbiter",
        "v1_sequence_order": 6,
        "risk_tier": "CRITICAL",
        "current_rung": "APPROVAL_REQUIRED",
        "behaviour": "Proposes concrete action, human clicks go (evaluates optimistic version lock, generates compensating saga, requires operator go).",
        "promotion_criterion": "Explicit sign-off, recorded, with a defined demotion trigger (requires SecOps Council sign-off).",
        "promotion_progress": {
            "metric_name": "Saga Compensability & Sign-Off Verification",
            "current_val": 100.0,
            "target_val": 100.0,
            "display_current": "Sign-off SIGNOFF-2026-CHG-0042 Verified (Audit 6-tuple logged)",
            "display_target": "SecOps Sign-off & 100% Compensating Undo",
            "pct_complete": 100.0,
            "eligible_for_promotion": True
        },
        "demotion_trigger": {
            "trigger_type": "SEVERITY_INCIDENT",
            "threshold": "Any uncompensated state divergence or race condition conflict",
            "active_metric_val": "0 conflicts in 340 commits",
            "is_tripped": False,
            "rule_statement": "Demotion is automatic and does not require a meeting."
        },
        "consecutive_clean_runs": 54,
        "total_runs": 340,
        "last_evaluated_at": "2026-09-22T19:15:00Z",
        "history": [
            {
                "timestamp": "2026-09-01T00:00:00Z",
                "previous_rung": "ADVISORY",
                "new_rung": "APPROVAL_REQUIRED",
                "event_type": "PROMOTION",
                "reason": "Verified single serialized arbiter queue and optimistic locking version check.",
                "triggered_by": "SecOps Council"
            }
        ]
    }
]

# ==============================================================================
# SECTION 13: REFERENCE TECHNOLOGY POSTURE SEED DATA
# ==============================================================================

SEED_MODEL_GATEWAY_ROUTES = [
    {
        "route_id": "route-primary-deep-reasoning",
        "tier_name": "PRIMARY",
        "purpose": "Deep Architecture Adjudication & Conformance Analysis",
        "active_vendor": "Anthropic",
        "active_model_id": "claude-3-5-sonnet-20241022",
        "fallback_vendor": "OpenAI",
        "fallback_model_id": "gpt-4o",
        "latency_p95_ms": 1420,
        "cost_per_million_tokens_usd": 3.00,
        "context_window_tokens": 200000,
        "swappable": True,
        "status": "HEALTHY"
    },
    {
        "route_id": "route-secondary-fast-code",
        "tier_name": "SECONDARY",
        "purpose": "Dependency Impact & AST Graph Computations",
        "active_vendor": "Google",
        "active_model_id": "gemini-1.5-pro-002",
        "fallback_vendor": "Anthropic",
        "fallback_model_id": "claude-3-5-haiku-20241022",
        "latency_p95_ms": 480,
        "cost_per_million_tokens_usd": 1.25,
        "context_window_tokens": 1000000,
        "swappable": True,
        "status": "HEALTHY"
    },
    {
        "route_id": "route-utility-summaries",
        "tier_name": "UTILITY",
        "purpose": "Release Packaging, CAB Notes & Human Checklists",
        "active_vendor": "OpenAI",
        "active_model_id": "gpt-4o-mini",
        "fallback_vendor": "Google",
        "fallback_model_id": "gemini-1.5-flash",
        "latency_p95_ms": 290,
        "cost_per_million_tokens_usd": 0.15,
        "context_window_tokens": 128000,
        "swappable": True,
        "status": "HEALTHY"
    },
    {
        "route_id": "route-local-offline-eval",
        "tier_name": "DETERMINISTIC_FALLBACK",
        "purpose": "Air-Gapped Telemetry Sanitization & Degraded Rule Match",
        "active_vendor": "Local-Ollama",
        "active_model_id": "llama-3.3-70b-instruct-q4",
        "fallback_vendor": "Deterministic Path",
        "fallback_model_id": "regex-ast-parser",
        "latency_p95_ms": 620,
        "cost_per_million_tokens_usd": 0.00,
        "context_window_tokens": 64000,
        "swappable": True,
        "status": "HEALTHY"
    }
]

SEED_MCP_REGISTRATIONS = [
    {
        "tool_id": "mcp-jira-tickets",
        "system_of_record": "Jira",
        "mcp_server_url": "http://mcp-jira.mesh.internal:8091/v1/sse",
        "protocol_version": "2024-11-05",
        "capability": "tickets.read_write",
        "methods_exposed": ["jira.get_ticket", "jira.update_status", "jira.append_changelog", "jira.search_jql"],
        "input_schema": {
            "type": "object",
            "required": ["ticket_id"],
            "properties": {
                "ticket_id": { "type": "string", "example": "PAY-4029" },
                "jql": { "type": "string" }
            }
        },
        "registered_at": "2026-08-10T12:00:00Z",
        "is_active": True,
        "health_status": "ONLINE"
    },
    {
        "tool_id": "mcp-github-v4",
        "system_of_record": "GitHub",
        "mcp_server_url": "http://mcp-github.mesh.internal:8092/v1/sse",
        "protocol_version": "2024-11-05",
        "capability": "vcs.pull_request",
        "methods_exposed": ["github.get_pr_diff", "github.post_inline_review", "github.check_ci_status", "github.create_branch"],
        "input_schema": {
            "type": "object",
            "required": ["repo", "pr_number"],
            "properties": {
                "repo": { "type": "string", "example": "fintech/payments-api" },
                "pr_number": { "type": "integer", "example": 894 }
            }
        },
        "registered_at": "2026-08-10T12:05:00Z",
        "is_active": True,
        "health_status": "ONLINE"
    },
    {
        "tool_id": "mcp-datadog-telemetry",
        "system_of_record": "Datadog",
        "mcp_server_url": "http://mcp-datadog.mesh.internal:8093/v1/sse",
        "protocol_version": "2024-11-05",
        "capability": "observability.traces",
        "methods_exposed": ["datadog.query_service_map", "datadog.fetch_canary_traces", "datadog.check_apdex_slo"],
        "input_schema": {
            "type": "object",
            "required": ["service_name"],
            "properties": {
                "service_name": { "type": "string", "example": "ledger-sync" },
                "window_minutes": { "type": "integer", "default": 60 }
            }
        },
        "registered_at": "2026-08-12T09:30:00Z",
        "is_active": True,
        "health_status": "ONLINE"
    },
    {
        "tool_id": "mcp-servicenow-cab",
        "system_of_record": "ServiceNow",
        "mcp_server_url": "http://mcp-snow.mesh.internal:8094/v1/sse",
        "protocol_version": "2024-11-05",
        "capability": "governance.change_request",
        "methods_exposed": ["snow.create_change_request", "snow.check_cab_window", "snow.bind_risk_score"],
        "input_schema": {
            "type": "object",
            "required": ["title", "risk_tier"],
            "properties": {
                "title": { "type": "string" },
                "risk_tier": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
            }
        },
        "registered_at": "2026-08-15T14:20:00Z",
        "is_active": True,
        "health_status": "ONLINE"
    },
    {
        "tool_id": "mcp-k8s-operator",
        "system_of_record": "Kubernetes",
        "mcp_server_url": "http://mcp-k8s.mesh.internal:8095/v1/sse",
        "protocol_version": "2024-11-05",
        "capability": "infra.cluster_orchestrator",
        "methods_exposed": ["k8s.get_pod_status", "k8s.restart_rollout", "k8s.get_service_endpoints"],
        "input_schema": {
            "type": "object",
            "required": ["namespace", "deployment"],
            "properties": {
                "namespace": { "type": "string" },
                "deployment": { "type": "string" }
            }
        },
        "registered_at": "2026-08-20T10:15:00Z",
        "is_active": True,
        "health_status": "ONLINE"
    }
]

SEED_DURABLE_SUBSCRIBERS = [
    {
        "consumer_group": "cg-plane1-forensics",
        "subscribed_topic": "work_objects.state_transitions",
        "committed_offset": 14208,
        "latest_bus_offset": 14210,
        "lag": 2,
        "durable_retention_days": 30,
        "last_acked_at": "2026-09-22T19:30:15Z",
        "replay_in_progress": False
    },
    {
        "consumer_group": "cg-plane2-flow-router",
        "subscribed_topic": "pr.lifecycle_events",
        "committed_offset": 8920,
        "latest_bus_offset": 8920,
        "lag": 0,
        "durable_retention_days": 30,
        "last_acked_at": "2026-09-22T19:35:00Z",
        "replay_in_progress": False
    },
    {
        "consumer_group": "cg-plane3-adjudication",
        "subscribed_topic": "specialist.findings",
        "committed_offset": 23091,
        "latest_bus_offset": 23091,
        "lag": 0,
        "durable_retention_days": 30,
        "last_acked_at": "2026-09-22T19:36:20Z",
        "replay_in_progress": False
    },
    {
        "consumer_group": "cg-audit-immutable-ledger",
        "subscribed_topic": "audit.6tuple_events",
        "committed_offset": 49811,
        "latest_bus_offset": 49811,
        "lag": 0,
        "durable_retention_days": 90,
        "last_acked_at": "2026-09-22T19:36:45Z",
        "replay_in_progress": False
    }
]

SEED_GITOPS_ARTIFACTS = [
    {
        "artifact_id": "art-play-arch",
        "artifact_type": "PLAY",
        "relative_path": "plays/arch_conformance.v4.yaml",
        "repo_url": "git@github.internal:prip-platform/prip-rules.git",
        "commit_sha": "a8f9c1e02",
        "pr_number": 412,
        "review_status": "MERGED",
        "policy_lint_status": "PASS",
        "deployed_version": "v4.2.0",
        "last_synced_at": "2026-09-20T14:15:00Z"
    },
    {
        "artifact_id": "art-manifest-flow",
        "artifact_type": "MANIFEST",
        "relative_path": "manifests/flow_analyst.v2.yaml",
        "repo_url": "git@github.internal:prip-platform/prip-rules.git",
        "commit_sha": "c3d2e1b4f",
        "pr_number": 415,
        "review_status": "APPROVED",
        "policy_lint_status": "PASS",
        "deployed_version": "v2.1.0",
        "last_synced_at": "2026-09-21T09:40:00Z"
    },
    {
        "artifact_id": "art-policy-rego",
        "artifact_type": "POLICY",
        "relative_path": "policies/risk_tier_boundary.rego",
        "repo_url": "git@github.internal:prip-platform/prip-rules.git",
        "commit_sha": "77b810efa",
        "pr_number": 419,
        "review_status": "MERGED",
        "policy_lint_status": "PASS",
        "deployed_version": "v1.3.0",
        "last_synced_at": "2026-09-22T11:20:00Z"
    }
]

SEED_PROMPT_EVAL_SUITES = [
    {
        "suite_id": "suite-arch-conformance",
        "target_play_id": "play.arch.standards_conformance.v4",
        "prompt_file": "prompts/arch_conformance_eval.md.j2",
        "prompt_version": "v4.3-prompt",
        "golden_dataset_size": 50,
        "test_cases": [
            {
                "case_id": "case-arch-01",
                "scenario_name": "Direct DB Access from Edge Controller",
                "input_fixture": "POST /v1/checkout directly querying sql:SELECT * FROM accounts",
                "expected_behavior": "Flag violation ARC-COUPLING-01 and produce conforming mediation path",
                "actual_output_summary": "Detected unmediated SQL call; generated LedgerClient proxy alternative",
                "pass_assertion": True,
                "eval_score": 0.98,
                "latency_ms": 380
            },
            {
                "case_id": "case-arch-02",
                "scenario_name": "Event Bus Pub/Sub Decoupled Service Call",
                "input_fixture": "EventBus.publish('payment.initiated', payload)",
                "expected_behavior": "Acknowledge standards adherence; return 0 blocking findings",
                "actual_output_summary": "Passed architectural boundary test cleanly with zero warnings",
                "pass_assertion": True,
                "eval_score": 0.99,
                "latency_ms": 290
            },
            {
                "case_id": "case-arch-03",
                "scenario_name": "Hardcoded Auth Token in HTTP Header Header Init",
                "input_fixture": "headers={'Authorization': 'Bearer ghp_secret999888'}",
                "expected_behavior": "Flag security posture violation SEC-TOK-01 before LLM context",
                "actual_output_summary": "Secrets redaction triggered; secret replaced with [REDACTED_GH_TOKEN]",
                "pass_assertion": True,
                "eval_score": 1.0,
                "latency_ms": 190
            }
        ],
        "overall_accuracy_pct": 98.4,
        "all_passed": True,
        "last_run_at": "2026-09-22T18:00:00Z"
    },
    {
        "suite_id": "suite-change-comms",
        "target_play_id": "play.change_comms.release_packaging.v1",
        "prompt_file": "prompts/release_packaging.md.j2",
        "prompt_version": "v2.0-prompt",
        "golden_dataset_size": 25,
        "test_cases": [
            {
                "case_id": "case-comms-01",
                "scenario_name": "Standard Hotfix Changelog Extraction",
                "input_fixture": "git log v1.4.1..HEAD with 3 PRs merged",
                "expected_behavior": "Generate user-facing bullet points without internal commit hashes",
                "actual_output_summary": "Generated structured release notes; excluded merge commits",
                "pass_assertion": True,
                "eval_score": 0.96,
                "latency_ms": 240
            },
            {
                "case_id": "case-comms-02",
                "scenario_name": "CAB Risk Assessment Checklist",
                "input_fixture": "Database schema migration detected in migration/004.sql",
                "expected_behavior": "Include database rollback plan checklist in CAB document",
                "actual_output_summary": "Attached compensating rollback runbook link and dry-run proof",
                "pass_assertion": True,
                "eval_score": 0.95,
                "latency_ms": 260
            }
        ],
        "overall_accuracy_pct": 95.5,
        "all_passed": True,
        "last_run_at": "2026-09-22T18:15:00Z"
    }
]

# ==============================================================================
# SECTION 15: REGISTERED PROJECTS & MULTI-TENANT CONFIGURATION
# ==============================================================================
SEED_PROJECTS = [
    {
        "project_id": "checkout-service",
        "name": "Checkout & Payments Core",
        "repo_url": "git@github.internal:fintech/checkout-service.git",
        "tier": "Tier-1 Core (PCI-DSS)",
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Redis", "Kafka"],
        "autonomy_rung": "Approval-required",
        "conformance_score": 94.2,
        "active_prs": 4,
        "stuck_items_count": 2,
        "write_scope": "branch_protection_gated",
        "golden_set_path": "evals/golden/checkout_suite.json",
        "specialists_assigned": [
            "Architecture Conformance", "Security Sentinel", "Test Coverage Arbiter",
            "Performance/SRE", "Flow Analyst", "Change & Comms", "Build & Release", "Doc Custodian"
        ],
        "description": "Primary transactional boundary processing credit cards, mobile wallets, and settlement ledgers.",
        "health_status": "HEALTHY",
        "execution_history": [
            {
                "run_id": "run-chk-901",
                "timestamp": "2026-09-22T19:20:00Z",
                "operator": "Staff Platform Architect",
                "lane": "STANDARD_DAG",
                "result": "SUCCESS",
                "work_object_id": "wo-chk-882",
                "conformance_passed": True,
                "summary": "Full parallel DAG evaluated 4 files. 0 conflicts. Write Arbiter committed lock."
            }
        ]
    },
    {
        "project_id": "billing-api",
        "name": "Billing & Subscription Engine",
        "repo_url": "git@github.internal:fintech/billing-api.git",
        "tier": "Tier-1 Core",
        "tech_stack": ["Go", "gRPC", "PostgreSQL", "Temporal"],
        "autonomy_rung": "Advisory",
        "conformance_score": 88.5,
        "active_prs": 2,
        "stuck_items_count": 1,
        "write_scope": "proposals_only",
        "golden_set_path": "evals/golden/billing_suite.json",
        "specialists_assigned": [
            "Architecture Conformance", "Performance/SRE", "Security Sentinel", "Flow Analyst"
        ],
        "description": "Handles recurring invoices, dunning sequences, and Stripe gateway webhooks.",
        "health_status": "WARNING",
        "execution_history": [
            {
                "run_id": "run-bil-418",
                "timestamp": "2026-09-22T18:45:00Z",
                "operator": "Lead SRE",
                "lane": "STANDARD_DAG",
                "result": "WARNING",
                "work_object_id": "wo-bil-418",
                "conformance_passed": False,
                "summary": "Detected unindexed foreign key in migration. Advisory warning posted to PR."
            }
        ]
    },
    {
        "project_id": "auth-gateway",
        "name": "Zero-Trust Auth & Crypto Gateway",
        "repo_url": "git@github.internal:security/auth-gateway.git",
        "tier": "Tier-1 Perimeter",
        "tech_stack": ["Rust", "Envoy", "OIDC / OAuth2", "HashiCorp Vault"],
        "autonomy_rung": "Approval-required",
        "conformance_score": 99.1,
        "active_prs": 1,
        "stuck_items_count": 0,
        "write_scope": "strict_dual_signoff",
        "golden_set_path": "evals/golden/auth_crypto_suite.json",
        "specialists_assigned": [
            "Security Sentinel", "Architecture Conformance", "Build & Release", "Performance/SRE"
        ],
        "description": "Perimeter ingress authenticating JWT tokens, mTLS handshakes, and cryptographic proofs.",
        "health_status": "HEALTHY",
        "execution_history": [
            {
                "run_id": "run-ath-102",
                "timestamp": "2026-09-22T17:10:00Z",
                "operator": "Principal SecOps Architect",
                "lane": "FAST_LANE",
                "result": "SUCCESS",
                "work_object_id": "wo-ath-102",
                "conformance_passed": True,
                "summary": "Fast Lane bypass executed. Zero secret leaks. Token verification assertions passed."
            }
        ]
    },
    {
        "project_id": "inventory-service",
        "name": "Real-Time Supply & Inventory Mesh",
        "repo_url": "git@github.internal:logistics/inventory-service.git",
        "tier": "Tier-2 Platform",
        "tech_stack": ["Java / Spring Boot", "Apache Kafka", "Cassandra", "gRPC"],
        "autonomy_rung": "Autonomous",
        "conformance_score": 96.0,
        "active_prs": 3,
        "stuck_items_count": 1,
        "write_scope": "autonomous_play_scoped",
        "golden_set_path": "evals/golden/inventory_suite.json",
        "specialists_assigned": [
            "Architecture Conformance", "Test Coverage Arbiter", "Change & Comms", "Flow Analyst"
        ],
        "description": "Warehouse stock levels, high-concurrency reservation locks, and distributed cart sync.",
        "health_status": "HEALTHY",
        "execution_history": [
            {
                "run_id": "run-inv-772",
                "timestamp": "2026-09-22T19:00:00Z",
                "operator": "Autonomous Substrate",
                "lane": "STANDARD_DAG",
                "result": "SUCCESS",
                "work_object_id": "wo-inv-772",
                "conformance_passed": True,
                "summary": "Autonomous execution committed inventory cache warming without human intervention."
            }
        ]
    },
    {
        "project_id": "legacy-reporting",
        "name": "Legacy Batch Reporting & Financial ETL",
        "repo_url": "git@github.internal:analytics/legacy-reporting.git",
        "tier": "Tier-3 Internal",
        "tech_stack": ["Python 3.8", "Celery", "MySQL", "Pandas"],
        "autonomy_rung": "Shadow",
        "conformance_score": 64.0,
        "active_prs": 2,
        "stuck_items_count": 2,
        "write_scope": "none (read-only forensics)",
        "golden_set_path": "evals/golden/legacy_reporting_suite.json",
        "specialists_assigned": [
            "Architecture Conformance", "Flow Analyst", "Performance/SRE"
        ],
        "description": "End-of-month financial reconciliation reports. Subject to ADR-001 architectural waivers.",
        "health_status": "DEGRADED",
        "execution_history": [
            {
                "run_id": "run-leg-304",
                "timestamp": "2026-09-22T16:30:00Z",
                "operator": "Autonomous Substrate",
                "lane": "STANDARD_DAG",
                "result": "QUARANTINED",
                "work_object_id": "wo-leg-304",
                "conformance_passed": False,
                "summary": "Shadow run detected shared database direct queries. Output quarantined, zero write action."
            }
        ]
    }
]

# ==============================================================================
# SECTION 15.2: GOLDEN SET TEST SUITES PER PROJECT (§13.6 & CHANT #8)
# ==============================================================================
SEED_GOLDEN_SUITES = {
    "checkout-service": {
        "project_id": "checkout-service",
        "suite_id": "gold-chk-pci-v2",
        "suite_path": "evals/golden/checkout_suite.json",
        "play_version": "play.checkout.v2.4",
        "baseline_pass_rate_pct": 100.0,
        "last_evaluated_at": "2026-09-22T18:00:00Z",
        "sla_threshold_pct": 98.0,
        "total_test_cases": 4,
        "test_cases": [
            {
                "test_id": "chk-t1",
                "name": "Reject Unencrypted Cardholder PAN in Log Stream",
                "category": "SECURITY_BOUNDARY",
                "input_trigger": "Simulated commit logging req.body with 16-digit Visa PAN: 4111-2222-3333-4444",
                "expected_invariant": "Invariant #1 (Enclosure) & PCI-DSS 3.4 Cardholder Data Boundary",
                "target_agent": "Security Sentinel",
                "status": "PASSED",
                "latency_ms": 284,
                "token_usage": 1420,
                "assertion_details": "Strict pattern matching intercepted PAN in logging pipe; redacted to [REDACTED_PAN] before write."
            },
            {
                "test_id": "chk-t2",
                "name": "Idempotency Replay Collision & Cache Validation",
                "category": "INVARIANT_CHECK",
                "input_trigger": "Concurrent duplicate request with identical Idempotency-Key 'idemp-tx-88912'",
                "expected_invariant": "Invariant #4 (Idempotency Engine) & Double-Spend Prevention",
                "target_agent": "Test Coverage Arbiter",
                "status": "PASSED",
                "latency_ms": 195,
                "token_usage": 980,
                "assertion_details": "Returned HTTP 409 Conflict with cached execution payload hash within 5ms. Zero duplicate ledger entry."
            },
            {
                "test_id": "chk-t3",
                "name": "Zero-Downtime Database Migration Compatibility",
                "category": "SCHEMA_COMPAT",
                "input_trigger": "PR diff proposing 'ALTER TABLE payments ADD COLUMN provider_fee NUMERIC NOT NULL'",
                "expected_invariant": "Invariant #6 (Contract Safety) & PostgreSQL Expand/Contract Standard",
                "target_agent": "Architecture Conformance",
                "status": "PASSED",
                "latency_ms": 340,
                "token_usage": 1850,
                "assertion_details": "Flagged non-null column addition without default. Auto-suggested 2-step nullable expansion with backfill."
            },
            {
                "test_id": "chk-t4",
                "name": "Circuit Breaker Tripping on Gateway Latency Spike",
                "category": "PERFORMANCE_BUDGET",
                "input_trigger": "Simulate 3 consecutive downstream payment provider timeouts > 2500ms",
                "expected_invariant": "Invariant #9 (Fault Isolation & Fallback Protocol)",
                "target_agent": "Performance/SRE",
                "status": "PASSED",
                "latency_ms": 310,
                "token_usage": 1620,
                "assertion_details": "Circuit breaker transitioned to OPEN state; routed transaction to secondary stripe_eu fallback provider."
            }
        ]
    },
    "billing-api": {
        "project_id": "billing-api",
        "suite_id": "gold-bil-dunning-v1",
        "suite_path": "evals/golden/billing_suite.json",
        "play_version": "play.billing.v1.8",
        "baseline_pass_rate_pct": 96.0,
        "last_evaluated_at": "2026-09-22T17:30:00Z",
        "sla_threshold_pct": 95.0,
        "total_test_cases": 3,
        "test_cases": [
            {
                "test_id": "bil-t1",
                "name": "Stripe Webhook HMAC SHA256 Signature Verification",
                "category": "SECURITY_BOUNDARY",
                "input_trigger": "Inbound webhook dispatch with invalid signature header 't=1600000000,v1=tampered_hash'",
                "expected_invariant": "Invariant #10 (Authentication & Origin Proof)",
                "target_agent": "Security Sentinel",
                "status": "PASSED",
                "latency_ms": 160,
                "token_usage": 890,
                "assertion_details": "Intercepted invalid cryptographic signature; dropped request with HTTP 401 Unauthorized."
            },
            {
                "test_id": "bil-t2",
                "name": "ADR-001 Decoupled RPC Ingress Enforcement",
                "category": "INVARIANT_CHECK",
                "input_trigger": "Synchronous HTTP GET call to foreign tax calculation service in billing worker",
                "expected_invariant": "ADR-001 Asynchronous Decoupling & Invariant #2",
                "target_agent": "Architecture Conformance",
                "status": "PASSED",
                "latency_ms": 280,
                "token_usage": 1340,
                "assertion_details": "Detected direct sync coupling; injected Tenacity circuit breaker wrapper and outbox queue emission."
            },
            {
                "test_id": "bil-t3",
                "name": "Dunning Retry Sequence Exponential Jitter",
                "category": "PERFORMANCE_BUDGET",
                "input_trigger": "Subscription renewal payment failure on customer invoice #INV-9901",
                "expected_invariant": "Flow Analyst Standard SLA & Exponential Retry Policy",
                "target_agent": "Flow Analyst",
                "status": "PASSED",
                "latency_ms": 210,
                "token_usage": 1120,
                "assertion_details": "Calculated schedule: Retry 1 in 4.2h, Retry 2 in 24.1h, Retry 3 in 72.0h with uniform jitter."
            }
        ]
    },
    "auth-gateway": {
        "project_id": "auth-gateway",
        "suite_id": "gold-ath-zerotrust-v3",
        "suite_path": "evals/golden/auth_crypto_suite.json",
        "play_version": "play.auth.v3.1",
        "baseline_pass_rate_pct": 100.0,
        "last_evaluated_at": "2026-09-22T19:10:00Z",
        "sla_threshold_pct": 99.5,
        "total_test_cases": 3,
        "test_cases": [
            {
                "test_id": "ath-t1",
                "name": "PKCE Code Verifier S256 (Reject Plain)",
                "category": "SECURITY_BOUNDARY",
                "input_trigger": "OAuth2 /token exchange with code_challenge_method='plain'",
                "expected_invariant": "RFC 7636 & Invariant #10 (Zero-Trust Perimeter)",
                "target_agent": "Security Sentinel",
                "status": "PASSED",
                "latency_ms": 140,
                "token_usage": 750,
                "assertion_details": "Strict perimeter policy rejected 'plain' challenge. Only SHA-256 verifiers allowed."
            },
            {
                "test_id": "ath-t2",
                "name": "mTLS Client Certificate CA Chain Validation",
                "category": "INVARIANT_CHECK",
                "input_trigger": "Ingress TLS handshake presenting self-signed certificate not in Vault root anchor",
                "expected_invariant": "Invariant #10 (Cryptographic Proof & Origin)",
                "target_agent": "Architecture Conformance",
                "status": "PASSED",
                "latency_ms": 175,
                "token_usage": 910,
                "assertion_details": "mTLS handshake terminated at Envoy ingress with TLS alert bad_certificate."
            },
            {
                "test_id": "ath-t3",
                "name": "JWT Expiration Leeway Boundary Check",
                "category": "SECURITY_BOUNDARY",
                "input_trigger": "JWT token presenting exp timestamp 75 seconds in the past (clock skew allowance is 60s)",
                "expected_invariant": "Invariant #1 (Security Enclosure) & Token Expiration Gate",
                "target_agent": "Security Sentinel",
                "status": "PASSED",
                "latency_ms": 150,
                "token_usage": 820,
                "assertion_details": "Token rejected with token_expired error. Exceeded 60s skew boundary by 15s."
            }
        ]
    },
    "inventory-service": {
        "project_id": "inventory-service",
        "suite_id": "gold-inv-eventmesh-v2",
        "suite_path": "evals/golden/inventory_suite.json",
        "play_version": "play.inventory.v2.0",
        "baseline_pass_rate_pct": 98.0,
        "last_evaluated_at": "2026-09-22T18:45:00Z",
        "sla_threshold_pct": 95.0,
        "total_test_cases": 2,
        "test_cases": [
            {
                "test_id": "inv-t1",
                "name": "Distributed Cart Stock Lock Lease Timeout",
                "category": "INVARIANT_CHECK",
                "input_trigger": "Cart reservation lock uncommitted after 15,000ms idle",
                "expected_invariant": "Invariant #8 (Serialized Write Arbiter & Lease Expiry)",
                "target_agent": "Performance/SRE",
                "status": "PASSED",
                "latency_ms": 230,
                "token_usage": 1150,
                "assertion_details": "Lock lease expired; stock units released back to available pool. Zero phantom reservations."
            },
            {
                "test_id": "inv-t2",
                "name": "Transactional Outbox Kafka Event Emission",
                "category": "SCHEMA_COMPAT",
                "input_trigger": "Stock reservation committed to database; verify outbox CDC emission",
                "expected_invariant": "ADR-001 Event Stream Guarantee & Invariant #5",
                "target_agent": "Architecture Conformance",
                "status": "PASSED",
                "latency_ms": 260,
                "token_usage": 1280,
                "assertion_details": "Event 'inventory.stock_reserved.v2' emitted with 100% payload conformance."
            }
        ]
    },
    "legacy-reporting": {
        "project_id": "legacy-reporting",
        "suite_id": "gold-leg-shadow-v1",
        "suite_path": "evals/golden/legacy_reporting_suite.json",
        "play_version": "play.legacy_reporting.v1.0",
        "baseline_pass_rate_pct": 65.0,
        "last_evaluated_at": "2026-09-22T16:00:00Z",
        "sla_threshold_pct": 85.0,
        "total_test_cases": 2,
        "test_cases": [
            {
                "test_id": "leg-t1",
                "name": "Cross-Database Direct Query Detection",
                "category": "INVARIANT_CHECK",
                "input_trigger": "SQL batch script querying SELECT * FROM billing_db.invoices directly",
                "expected_invariant": "ADR-001 Bounded Context Isolation (Requires Architectural Waiver)",
                "target_agent": "Architecture Conformance",
                "status": "FAILED",
                "latency_ms": 420,
                "token_usage": 2100,
                "assertion_details": "Direct cross-schema query failed ADR-001 policy check. Active waiver WAIVER-2026-0042 required."
            },
            {
                "test_id": "leg-t2",
                "name": "Batch Memory Consumption Cap",
                "category": "PERFORMANCE_BUDGET",
                "input_trigger": "Process 100,000 transaction reconciliation rows in Celery worker",
                "expected_invariant": "Memory Budget < 2.0GB Peak RSS",
                "target_agent": "Performance/SRE",
                "status": "PASSED",
                "latency_ms": 580,
                "token_usage": 2400,
                "assertion_details": "Peak RSS memory measured at 1.42GB. Stream chunking prevented OOM container kill."
            }
        ]
    }
}

# ==============================================================================
# SECTION 16: CORPORATE IT RBAC DATA & USER ACCOUNTS
# ==============================================================================

SEED_ORG_ROLES = [
    {
        "role_id": "org-admin",
        "title": "Platform Systems Administrator",
        "department": "Platform Operations",
        "description": "Enterprise IT administrator managing infrastructure, IAM directory, toolchain credentials, and system posture.",
        "hierarchy_level": 1
    },
    {
        "role_id": "org-ciso",
        "title": "Chief Information Security Officer (CISO)",
        "department": "Information Security & SecOps",
        "description": "Executive sponsor for zero-trust perimeter, data enclosure, cryptographic boundary validation, and PCI DSS compliance.",
        "hierarchy_level": 1
    },
    {
        "role_id": "org-arch",
        "title": "Principal Enterprise Architect",
        "department": "Architecture Office",
        "description": "Author of ADR standards, bounded context topology, decoupled streaming rules, and architectural debt arbiter.",
        "hierarchy_level": 2
    },
    {
        "role_id": "org-sre",
        "title": "Lead Site Reliability Engineer (SRE)",
        "department": "Reliability & Infrastructure",
        "description": "Custodian of cluster health, P99 latency budgets, blast-radius mitigation, circuit breakers, and chaos validation.",
        "hierarchy_level": 2
    },
    {
        "role_id": "org-release",
        "title": "Release & Delivery Governor",
        "department": "Release & Delivery Management",
        "description": "Coordinates cross-squad deployments, CAB approvals, canary gate verifications, and lead-time optimizations.",
        "hierarchy_level": 2
    },
    {
        "role_id": "org-dev",
        "title": "Senior Full-Stack Developer",
        "department": "Product Engineering",
        "description": "Author of pull requests, bug fixes, feature payloads, and local test coverage across domain microservices.",
        "hierarchy_level": 3
    },
    {
        "role_id": "org-audit",
        "title": "Compliance & PCI-DSS Auditor",
        "department": "Internal Audit & Risk Oversight",
        "description": "Independent evaluator inspecting immutable 6-tuple evidence logs, cryptographic trails, and non-compliance waivers.",
        "hierarchy_level": 3
    }
]

SEED_APP_ROLES = [
    {
        "role_id": "SUPER_ADMIN",
        "name": "Super Administrator",
        "description": "Unrestricted mesh sovereignty. Manage users, RBAC mapping rules, override locks, and register microservices.",
        "permissions": [
            "pipeline.execute", "golden_tests.run", "chaos.simulate", 
            "health.restore", "waiver.create", "waiver.approve", 
            "arbiter.override", "project.onboard", "rbac.manage", "circuit_breaker.toggle"
        ]
    },
    {
        "role_id": "SECURITY_LEAD",
        "name": "Security Sentinel Lead",
        "description": "Enforce Invariant #1 (Enclosure) & #10 (Authentication). Manage cryptographic credentials, secret audits, and security waivers.",
        "permissions": [
            "golden_tests.run", "waiver.create", "waiver.approve", 
            "arbiter.override", "audit.view_immutable"
        ]
    },
    {
        "role_id": "ARCH_GOVERNOR",
        "name": "Architecture Governor",
        "description": "Enforce ADR-001 decoupling, approve/reject Architectural Waivers, resolve Super Agent challenges, and onboard new projects.",
        "permissions": [
            "golden_tests.run", "waiver.create", "waiver.approve", 
            "project.onboard", "audit.view_immutable"
        ]
    },
    {
        "role_id": "SRE_OPERATOR",
        "name": "Site Reliability Operator",
        "description": "Trigger targeted pipeline runs, inject chaos and failure simulations, trip/reset circuit breakers, and restore baseline health.",
        "permissions": [
            "pipeline.execute", "golden_tests.run", "chaos.simulate", 
            "health.restore", "circuit_breaker.toggle"
        ]
    },
    {
        "role_id": "RELEASE_MANAGER",
        "name": "Release Delivery Manager",
        "description": "Control Stage 3 Release Gates, approve production deployment promotions, and execute verified delivery pipelines.",
        "permissions": [
            "pipeline.execute", "waiver.create", "golden_tests.run", 
            "audit.view_immutable"
        ]
    },
    {
        "role_id": "SQUAD_DEV",
        "name": "Squad Developer",
        "description": "Submit code changes for conformance evaluation, run regression golden suites, and propose architectural waivers.",
        "permissions": [
            "golden_tests.run", "waiver.create"
        ]
    },
    {
        "role_id": "AUDIT_COMPLIANCE",
        "name": "Compliance & Forensics Auditor",
        "description": "Read-only access to immutable 6-tuple audit ledger, evidence store, and operational telemetry.",
        "permissions": [
            "audit.view_immutable"
        ]
    }
]

# N:M Mapping: Each Application Role maps to multiple Organizational Roles
SEED_ROLE_MAPPINGS = {
    "SUPER_ADMIN": ["org-admin"],
    "SECURITY_LEAD": ["org-ciso", "org-sre", "org-admin"],
    "ARCH_GOVERNOR": ["org-arch", "org-ciso", "org-audit"],
    "SRE_OPERATOR": ["org-sre", "org-admin", "org-arch"],
    "RELEASE_MANAGER": ["org-release", "org-admin"],
    "SQUAD_DEV": ["org-dev", "org-sre", "org-arch"],
    "AUDIT_COMPLIANCE": ["org-audit", "org-ciso", "org-release"]
}

SEED_USERS = [
    {
        "user_id": "usr-sarah",
        "name": "Sarah Chen",
        "email": "sarah.admin@corp.internal",
        "department": "Platform Operations",
        "org_role_id": "org-admin",
        "org_role_title": "Platform Systems Administrator",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "status": "ACTIVE",
        "last_login": "Today, 08:30 UTC"
    },
    {
        "user_id": "usr-elena",
        "name": "Elena Rostova",
        "email": "elena.ciso@corp.internal",
        "department": "Information Security & SecOps",
        "org_role_id": "org-ciso",
        "org_role_title": "Chief Information Security Officer (CISO)",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        "status": "ACTIVE",
        "last_login": "Today, 09:15 UTC"
    },
    {
        "user_id": "usr-david",
        "name": "David Ross",
        "email": "david.arch@corp.internal",
        "department": "Architecture Office",
        "org_role_id": "org-arch",
        "org_role_title": "Principal Enterprise Architect",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "status": "ACTIVE",
        "last_login": "Today, 10:02 UTC"
    },
    {
        "user_id": "usr-marcus",
        "name": "Marcus Vance",
        "email": "marcus.sre@corp.internal",
        "department": "Reliability & Infrastructure",
        "org_role_id": "org-sre",
        "org_role_title": "Lead Site Reliability Engineer (SRE)",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "status": "ACTIVE",
        "last_login": "Today, 11:20 UTC"
    },
    {
        "user_id": "usr-jordan",
        "name": "Jordan Taylor",
        "email": "jordan.delivery@corp.internal",
        "department": "Release & Delivery Management",
        "org_role_id": "org-release",
        "org_role_title": "Release & Delivery Governor",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "status": "ACTIVE",
        "last_login": "Today, 07:45 UTC"
    },
    {
        "user_id": "usr-priya",
        "name": "Priya Sharma",
        "email": "priya.dev@corp.internal",
        "department": "Product Engineering",
        "org_role_id": "org-dev",
        "org_role_title": "Senior Full-Stack Developer",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
        "status": "ACTIVE",
        "last_login": "Today, 12:10 UTC"
    },
    {
        "user_id": "usr-arthur",
        "name": "Arthur Pendelton",
        "email": "arthur.auditor@corp.internal",
        "department": "Internal Audit & Risk Oversight",
        "org_role_id": "org-audit",
        "org_role_title": "Compliance & PCI-DSS Auditor",
        "custom_app_role_override": None,
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        "status": "ACTIVE",
        "last_login": "Yesterday, 16:30 UTC"
    }
]







