# 🛡️ SentinelX — AI Governance Firewall

> **Every prompt. Every model. Zero secrets leaking.**
> SentinelX is an enterprise AI governance layer that sits between employees and large language models — an 8-agent pipeline that detects secrets, enforces regulatory policy, scores composite risk, rewrites unsafe content, and records an immutable audit trail. In production it protects; in a demo it convinces.

![Hero]() _<!-- Hero banner placeholder: full-page screenshot of the Executive Command Center -->_

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio&logoColor=white)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Project Story

Shadow AI is every company's silent data leak: employees paste secrets, PII, PHI, and source code into public LLM chat interfaces — and nobody in IT knows. One survey after another shows the same thing: **the majority of employees have pasted sensitive company data into AI tools**, and security teams have **no visibility, no policy, and no controls** at the boundary.

SentinelX fixes that. Instead of blocking AI (which employees will work around anyway), SentinelX sits **in the middle of the conversation** — a gateway between your team and every model they use. It reads every prompt, understands what is sensitive, decides what policy says about it, scores the risk, and then **blocks, rewrites, or allows** the request before it ever reaches the model. Every single decision is explained, every event is logged, and executives finally get a number they can understand: **how much sensitive data their company keeps out of third-party AI models.**

This repository is the complete SentinelX product: a production-grade **AI governance platform** built for the AI Frontier Challenge — with a live, judge-ready demonstration built in.

> Read the full narrative in [`docs/STORY.md`](docs/STORY.md).

---

## 🔥 Why Shadow AI matters

- **Employees are already leaking.** Corporate secrets, source code, customer PII, patient records, and credentials are being pasted into consumer AI tools every day.
- **Regulators are catching up.** GDPR, HIPAA, PCI DSS, and SOC 2 all require *demonstrable* controls over where personal and regulated data flows — "we told them not to" is not a control.
- **Breaches are expensive.** Average breach costs run into the millions; a single leaked credential or patient record can mean a fine, a lawsuit, or a headline.
- **Blocking is not the answer.** Banning AI tools creates shadow IT. The winning move is governance, not prohibition: let people use AI, safely.

## 🧠 The Solution

SentinelX is a **security gateway for AI traffic**:

- **Intercept** every prompt before it reaches a model.
- **Detect** secrets, PII, PHI, and regulated data with 42 detection rules.
- **Enforce** 7 regulatory & corporate policy packs (GDPR, HIPAA, PCI DSS, SOC 2, ISO 27001, Internal, Secrets).
- **Score** composite risk per request → `ALLOW` · `REWRITE` · `BLOCK` · `FLAG`.
- **Explain** every decision with an AI Explainability Center (agent contributions, reasoning timeline, confidence).
- **Govern** with an executive command center, live SOC, digital twin, analytics, audit trail, and role-based access.

---

## 🏗️ Architecture

```
Employee ──▶ Gateway API (Fastify)
                │
   ┌────────────▼────────────┐
   │      8-Agent Pipeline    │
   │                          │
   │ 1. Inspector Agent       │  normalizes & chunks the prompt
   │ 2. Secret Detection      │  42 rules · Luhn-validated PAN ·
   │    Agent                 │  API keys · PII · credentials
   │ 3. Policy Engine Agent   │  7 packs: GDPR · HIPAA · PCI DSS ·
   │                          │  SOC 2 · ISO 27001 · Internal · Secrets
   │ 4. Risk Engine Agent     │  composite score → SAFE/MEDIUM/HIGH/CRITICAL
   │ 5. Rewriter Agent        │  intent-preserving sanitization
   │ 6. LLM Adapter Agent     │  5 providers + simulation fallback
   │ 7. Audit Logger Agent    │  immutable record · violations · trace
   │ 8. Memory Agent          │  short/long-term context
   └────────────┬────────────┘
                ▼
     Decision: ALLOW | REWRITE | BLOCK | FLAG
```

![System diagram]() _<!-- Placeholder: architecture diagram (canva/diagram asset) — see docs/SCREENSHOT_GUIDE.md -->_

### Data layer

- **In-memory demo mode** by default — zero configuration, boots in seconds with a fully realistic dataset (6 users, 42 detection rules, 7 policy packs, 15 seeded audits, incidents, threats, executive metrics).
- **PostgreSQL + Prisma** for production persistence, with a store-facade so the app runs identically with or without a database.
- **Redis + Socket.io** (optional) for live presence and real-time agent telemetry.

### Deployment modes

| Mode | Database | LLM | Use case |
| --- | --- | --- | --- |
| Demo (default) | In-memory | Simulated | Hackathon judging, CI, previews |
| Connected | PostgreSQL | 5 providers (OpenAI, Anthropic, Gemini, Ollama, OpenRouter) | Production |

---

## 🎬 Demo in 60 seconds

```bash
# 1. API — port 3001
cd apps/api
npm install
npx tsx src/server.ts        # boots in-memory demo mode; no config needed

# 2. Web — port 3000 (second terminal)
cd apps/web
npm install
npm run dev
```

Open **http://localhost:3000** → go to **Demo Mode** (`/demo`) → click **▶ Judge Mode**.

SentinelX auto-runs a keynote presentation: **6 live attacks** (AWS key → JWT → HR database → credit card → source code → patient record), each one detected, scored, and neutralized by the 8-agent pipeline — with stage-by-stage narration (text + optional voice), a live threat-activity chart, explainable decisions, and a generated protection report on completion.

![Demo GIF placeholder]() _<!-- Demo GIF: judge mode running the 6-attack sequence -->_

---

## ✨ Key Features

| Capability | Where |
| --- | --- |
| **AI Pipeline + Replay** — live 8-agent visualization, play/pause/step/speed, data-packet animation, trace export | `/scanner` |
| **Judge Presentation Mode** — one-click 6-attack demo, narration, voice, confetti, auto report | `/demo` |
| **Executive Command Center** — security score, maturity gauge, compliance status, financial exposure, risk forecast | `/executive` |
| **Mission Control (SOC)** — global threat map, live attack stream, incident queue, pipeline throughput | `/soc` |
| **Digital Twin** — interactive org risk graph (HR · Finance · Engineering · Legal · Sales · Operations) + per-department security DNA | `/twin` |
| **Enterprise Analytics** — 15 charts: risk forecast, incident heatmap, policy effectiveness, detection accuracy, compliance trend, CSV/PNG export | `/analytics` |
| **AI Explainability Center** — decision graph, agent contributions, reasoning timeline, confidence, recommendation | `/explain` |
| **Executive + Security Copilot** — telemetry-grounded answers with rich visual cards and AI memory recall | `/copilot` |
| **Incident Response Center** — queue, workspace, resolution workflow, related prompts, decision tree | `/incidents` |
| **Compliance Center** — regulatory posture cards (GDPR, HIPAA, PCI DSS, SOC 2, ISO 27001) with evidence log | `/compliance` |
| **Enterprise Settings** — risk sliders, provider routing, policy builder + templates, notification rules, API tokens, branding, export, **role management (RBAC, 7 roles)** | `/settings` |
| **Live collaboration** — presence (6 analysts), live cursors, incident notifications | platform-wide |
| **Command palette** — ⌘K → `G` + key to jump anywhere | platform-wide |

## 🛡️ Security model

See [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) — redaction of credentials in API logs, secret-free config, RBAC roles, audit integrity, and LLM provider isolation.

## 🖼️ Screenshots

| Executive Command Center | Mission Control (SOC) |
| --- | --- |
| Company security score, maturity gauge, dept breakdown, financial exposure, risk forecast | Global threat map, live attack stream, incident queue, agent activity |

| Digital Twin | Analytics |
| --- | --- |
| Interactive per-department risk DNA, incidents, violations, improvements | 15 charts — risk forecast, incident heatmap, policy effectiveness, compliance trend |

| Judge Mode | Explainability Center |
| --- | --- |
| One-click 6-attack keynote demo with narration + generated report | Decision graph, agent contributions, reasoning timeline, confidence |

*(Full capture guide with exact timing & viewport: [`docs/SCREENSHOT_GUIDE.md`](docs/SCREENSHOT_GUIDE.md).)*

## ⚙️ Technology

| Layer | Stack |
| --- | --- |
| Backend | Fastify 5 · TypeScript (strict) · Prisma · Socket.io |
| Frontend | Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Recharts · Framer Motion |
| Data | PostgreSQL (optional) · Redis (optional) · in-memory demo store |
| AI | 8-agent pipeline · 42 detection rules · 5 LLM providers + simulation fallback |
| Quality | Strict typecheck both apps · production builds verified · smoke tests · verification reports per phase |

## 📚 Documentation

- [Project story](docs/STORY.md) · [Pitch deck](docs/PITCH_DECK.md) · [Demo script](docs/DEMO_SCRIPT.md) · [Judge checklist](docs/JUDGE_CHECKLIST.md) · [Backup plan](docs/BACKUP_PLAN.md) · [Screenshot guide](docs/SCREENSHOT_GUIDE.md)
- [System architecture](docs/ARCHITECTURE.md) · [API reference](docs/API_REFERENCE.md) · [AI agent reference](docs/AI_AGENT_REFERENCE.md) · [Developer guide](docs/DEVELOPER_GUIDE.md) · [Security model](docs/SECURITY_MODEL.md)
- [Changelog](docs/CHANGELOG.md) · [Roadmap](docs/PROJECT_ROADMAP.md)

## 🗺️ Future Roadmap

- **Guardrails-as-code** — policy packs versioned in Git, PR-reviewed like infrastructure
- **On-device detection** — local embeddings for PII classification without sending data anywhere
- **Agent-to-agent guardrails** — govern AI agents talking to each other, not just humans to models
- **Browser extension** — enforce policy at the paste point, before the prompt is even written
- **Marketplace** — community policy packs and detection rule registry
- **SOC 2 / ISO 27001 evidence packs** — one-click evidence bundles for compliance audits

## 🏆 Awards & Recognition

- **AI Frontier Challenge 2026** — finalist entry (hackathon build)

## 📄 License

MIT — see [LICENSE](LICENSE).

## 🙏 Acknowledgements

Built for the AI Frontier Challenge with an 8-agent pipeline, a real-time command center, and a demo that runs itself. No external services required — no API keys, no database, no internet: judge-ready from a fresh checkout.
