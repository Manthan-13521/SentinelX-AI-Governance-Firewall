import { randomUUID } from 'node:crypto';
import type { AgentTraceEntry, DecisionType, DetectedSecret, PipelineResult, PolicyViolation } from "../lib/types";
import { Decision, ThreatLevel,  } from "../lib/types";
import { InspectorAgent } from './inspector';
import { SecretDetectionAgent } from './secret-detection';
import { PolicyEngineAgent } from './policy-engine';
import { RiskEngineAgent } from './risk-engine';
import { AdaptiveRiskAgent } from './adaptive-risk';
import { RewriterAgent } from './rewriter';
import { LLMAdapterAgent } from './llm-adapter';
import { AuditLoggerAgent } from './audit-logger';
import { MemoryAgent } from './memory';

export interface PipelineRunOptions {
  userId?: string;
  ipAddress?: string;
  sessionId?: string;
  provider?: string;
  model?: string;
  onAgentUpdate?: (trace: AgentTraceEntry) => void;
}

const PACE_BASE_MS = Math.max(0, Number(process.env.PIPELINE_PACE_MS ?? 240));
const PACE_JITTER_MS = Math.max(0, Number(process.env.PIPELINE_PACE_JITTER_MS ?? 220));

function pace(): Promise<void> {
  if (PACE_BASE_MS === 0 && PACE_JITTER_MS === 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, PACE_BASE_MS + Math.random() * PACE_JITTER_MS));
}

export class SentinelPipeline {
  constructor(
    private emitUpdate?: (trace: AgentTraceEntry) => void,
    private options: { paced?: boolean } = {},
  ) {}

  async execute(prompt: string, options: PipelineRunOptions = {}): Promise<PipelineResult> {
    const pipelineId = randomUUID();
    const startedAt = performance.now();
    const trace: AgentTraceEntry[] = [];
    const notify = (entry: AgentTraceEntry) => {
      trace.push(entry);
      this.emitUpdate?.(entry);
    };
    const step = () => (this.options.paced === false ? Promise.resolve() : pace());

    const provider = options.provider ?? 'openai';
    const model = options.model ?? 'auto';

    try {
      const inspector = new InspectorAgent();
      const inspectorResult = await inspector.run(prompt);
      await step();
      notify(inspector.toTrace());
      const inspectorOutput = inspectorResult.output;

      const secretAgent = new SecretDetectionAgent();
      const secretResult = await secretAgent.run(prompt);
      await step();
      notify(secretAgent.toTrace());
      const secrets = secretResult.output;

      const policyAgent = new PolicyEngineAgent();
      const policyResult = await policyAgent.run(secrets);
      await step();
      notify(policyAgent.toTrace());
      const violations = policyResult.output;

      const riskAgent = new RiskEngineAgent();
      const riskResult = await riskAgent.run({
        secrets,
        violations,
        inspector: inspectorOutput,
        userId: options.userId,
      });
      await step();
      notify(riskAgent.toTrace());
      const risk = riskResult.output;

      const adaptive = new AdaptiveRiskAgent();
      const adaptiveResult = await adaptive.run({
        prompt,
        risk,
        department: options.userId,
      });
      await step();
      notify(adaptive.toTrace());
      if (adaptiveResult.output.adjustedScore !== risk.score) {
        risk.score = adaptiveResult.output.adjustedScore;
        risk.threatLevel =
          risk.score >= 80 ? ThreatLevel.CRITICAL : risk.score >= 60 ? ThreatLevel.HIGH : risk.score >= 35 ? ThreatLevel.MEDIUM : risk.score >= 15 ? ThreatLevel.LOW : ThreatLevel.SAFE;
        risk.contributingFactors.push({
          factor: 'AI contextual assessment',
          weight: adaptiveResult.output.delta,
          severity: adaptiveResult.output.delta > 0 ? 'HIGH' : 'LOW',
        });
      }

      const rewriter = new RewriterAgent();
      const rewriterResult = await rewriter.run({ prompt, secrets, risk });
      await step();
      notify(rewriter.toTrace());
      const rewrittenPrompt = rewriterResult.output.changed ? rewriterResult.output.rewritten : prompt;

      let decision = this.decide(risk.threatLevel, violations, secrets);
      if (secrets.length === 0 && risk.threatLevel === ThreatLevel.SAFE) decision = Decision.ALLOW;

      let llmProvider: string | null = null;
      let llmModel: string | null = null;

      if (decision === Decision.ALLOW || decision === Decision.REWRITE) {
        const llm = new LLMAdapterAgent();
        const llmResult = await llm.run({ prompt: rewrittenPrompt, provider, model });
        await step();
        notify(llm.toTrace());
        llmProvider = llmResult.output.provider;
        llmModel = llmResult.output.model;
      } else {
        notify({
          agent: 'llm-adapter',
          status: 'SKIPPED',
          confidence: 1,
          executionTimeMs: 0,
          startedAt: new Date().toISOString(),
        });
      }

      const audit = new AuditLoggerAgent();
      const auditResult = await audit.run({
        pipelineId,
        userId: options.userId,
        ipAddress: options.ipAddress,
        sessionId: options.sessionId,
        prompt,
        rewrittenPrompt: rewrittenPrompt !== prompt ? rewrittenPrompt : null,
        violations,
        secrets,
        riskScore: risk.score,
        threatLevel: risk.threatLevel,
        decision,
        provider: llmProvider ?? provider,
        model: llmModel ?? model,
        latencyMs: Math.round(performance.now() - startedAt),
        agentTrace: trace,
      });
      notify(audit.toTrace());
      await step();

      const memory = new MemoryAgent();
      await memory.run({
        userId: options.userId,
        sessionId: options.sessionId,
        prompt,
        riskScore: risk.score,
      });
      await step();
      notify(memory.toTrace());

      const latencyMs = Math.round(performance.now() - startedAt);

      return {
        pipelineId,
        status: decision === Decision.BLOCK ? 'BLOCKED' : decision === Decision.REWRITE ? 'REWRITTEN' : decision === Decision.FLAG ? 'FLAGGED' : 'COMPLETED',
        decision,
        riskScore: risk.score,
        threatLevel: risk.threatLevel,
        violations,
        secrets,
        originalPrompt: prompt,
        rewrittenPrompt: rewrittenPrompt !== prompt ? rewrittenPrompt : null,
        agentTrace: trace,
        auditLogId: auditResult.output.id,
        provider: llmProvider ?? provider,
        model: llmModel ?? model,
        latencyMs,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const audit = new AuditLoggerAgent();
      await audit.run({
        pipelineId,
        userId: options.userId,
        ipAddress: options.ipAddress,
        sessionId: options.sessionId,
        prompt,
        violations: [],
        secrets: [],
        riskScore: 100,
        threatLevel: ThreatLevel.CRITICAL,
        decision: Decision.BLOCK,
        provider,
        model,
        latencyMs: Math.round(performance.now() - startedAt),
        agentTrace: [...trace, {
          agent: 'pipeline',
          status: 'FAILED',
          confidence: 0,
          executionTimeMs: Math.round(performance.now() - startedAt),
          startedAt: new Date().toISOString(),
          error,
        }],
      });

      throw err;
    }
  }

  private decide(threatLevel: string, violations: PolicyViolation[], secrets: DetectedSecret[]): DecisionType {
    const hasCriticalSecret = secrets.some((s) => s.severity === 'CRITICAL');
    if (threatLevel === ThreatLevel.CRITICAL || hasCriticalSecret) return Decision.BLOCK;
    if (threatLevel === ThreatLevel.HIGH && violations.length >= 2) return Decision.BLOCK;
    if (threatLevel === ThreatLevel.HIGH || threatLevel === ThreatLevel.MEDIUM) return Decision.REWRITE;
    if (threatLevel === ThreatLevel.LOW) return Decision.FLAG;
    return Decision.ALLOW;
  }
}
