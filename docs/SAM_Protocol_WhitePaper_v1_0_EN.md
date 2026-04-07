# SAM PROTOCOL
## White Paper — Version 2.2
### The Trust and Mandate Layer for Agentic Commerce

*Merchant-ready. Agent-ready. Bounded autonomy.*

---

## Executive Summary

AI agents can already search, compare, configure, and buy. What they cannot yet do reliably is **discover a merchant in a standardized way, verify its identity, understand the limits of autonomous execution, and fall back gracefully to a human when autonomy is not enough**.

SAM addresses this gap with a single, simple object: a `sam.json` document, published by the merchant at a canonical well-known location, readable by any agent, cryptographically signed, and rich enough to describe available capabilities, autonomous-execution rules, and minimum trust conditions.

Version 2.2 deliberately narrows SAM around a **minimal core**. The core standardizes six things and nothing more:

1. **Discovery** — a canonical, well-known location for the merchant manifest.
2. **Merchant identity** — bound to the domain.
3. **Document signature** — origin, integrity, and bounded freshness.
4. **Mandate** — what an agent is allowed to do, expressed in a small closed grammar.
5. **Agent authentication** — a single normative profile based on HTTP Message Signatures (RFC 9421).
6. **Human escalation** — a clear, structured fallback path.

Everything else — payment, disputes, embedded catalogs, registries, incentives — is an **optional extension profile**. This separation is the heart of the adoption strategy: the core must be small enough to deploy in an afternoon, useful before the rest of the ecosystem aligns, and credible enough to govern real autonomy.

SAM does not replace OpenAPI, MCP, A2A, REST APIs, or the merchant's internal workflows. It provides the **upstream trust and mandate layer** they all lack: who is this merchant, what can the agent do here, within which bounds, and how to return to a human when in doubt.

> **Strategic positioning.** SAM aims to become indispensable *before* the transaction, then extensible *during* and *after* it. The narrative is consistent end-to-end: **merchant-ready, agent-ready, bounded autonomy**.

**What changed in v2.2.** v2.1 locked the two big technical decisions (RFC 9421 + `ed25519` for authentication; an eight-primitive closed mandate grammar) and elevated manifest freshness to a constitutional rule. v2.2 sharpens four areas that remained too thin: the operator document (`sam-operator.json`) is now treated as a first-order normative object subject to the same discipline as `sam.json`; the cryptographic claim of user delegation is honestly distinguished from what is already proven today; the austerity of mandate grammar v0.1 is explicitly assumed; and the revocation model is operationalized with an explicit *no fail-open* rule.

---

## 1. Why Agentic Commerce Needs a Trust Layer

The web was designed for humans assisted by browsers. Agents operate differently. They must select an execution surface, interpret rules, arbitrate between offers, and sometimes commit to acts with real economic consequences. Without a shared standard, every merchant becomes a special case, and every agent must re-learn the same trust assumptions from scratch.

Four gaps hold useful autonomy back today:

- **Discovery.** No universal way for a merchant to expose its transactional capabilities to agents.
- **Verification.** TLS proves the channel, not the manifest. Agents have no simple proof that a merchant document genuinely originates from the merchant — and no model for when that proof expires.
- **Mandate.** Nothing cleanly expresses what an agent may do without human validation, within which price bounds, categories, regions, or time windows.
- **Escalation.** When the system steps outside its safe perimeter, there is rarely a structured, explicit path back to a human.

The consequence is familiar: integrations stay ad hoc, trust stays implicit, guardrails are scattered across proprietary SDKs, and real autonomy remains confined to demos and tightly controlled surfaces.

---

## 2. Design Principles

- **Useful minimalism.** The core must be small enough that any merchant can deploy it without an integration project.
- **Progressive adoption.** A merchant can start with a simple capabilities manifest and increase its trust level later, without rewriting its architecture.
- **Interoperability.** SAM complements existing execution protocols. It does not compete with them.
- **Merchant sovereignty.** Identity, keys, rules, and integrations stay under the merchant's control.
- **Bilateral trust.** The agent verifies the merchant; the merchant verifies the agent when autonomy demands it.
- **Explicit escalation.** Autonomy is not absolute. The protocol must say *when* and *how* to return to a human.
- **Closed, not flexible-by-default.** Where flexibility would destroy interoperability, SAM closes the door. One mandate grammar. One authentication profile. Exceptions are exceptions, not alternatives.
- **Bounded freshness.** A signed manifest is not eternally valid because it is signed. It is valid only within its declared freshness window.

---

## 3. What SAM Standardizes — and What It Does Not

SAM standardizes a single agent-readable entry document. That document describes the merchant's existence as an agent-compatible actor, how to verify it, the capabilities it exposes, the conditions under which autonomous execution is permitted, and the conditions under which human escalation must occur. It creates a common starting point regardless of the execution protocol used downstream.

SAM does **not** attempt to impose a single payment rail, a universal catalog engine, a global reputation system, or centralized commerce governance. These domains exist, will continue to exist, and must be pluggable into SAM.

> **Scoping rule.** The SAM core answers *"may I act here, and within which bounds?"* — not *"how should every commerce subsystem in the world work?"*

---

## 4. The SAM Core

The SAM core is a single `sam.json` file, published at the canonical well-known location `https://<merchant-domain>/.well-known/sam.json`. It is not just a technical manifest. It is a **readability contract** for agents.

### 4.1 Core Components

| Block | Role | Why it belongs in the core |
|---|---|---|
| `sam:version` | Schema version and forward/backward compatibility | Required for interoperable, controlled evolution |
| `sam:capabilities` | Available actions, endpoints, supported protocols | The most immediately useful machine-readable entry point |
| `sam:identity` | Merchant identity bound to the domain | Anchors the document to the right economic actor |
| `sam:signature` | Document signature, key delegation, and TTL | Turns the manifest into a verifiable, time-bounded object |
| `sam:mandate` | Autonomous-execution rules, in the normative grammar | Enables governance of autonomy on both sides |
| `sam:agentAuth` | Declared agent-authentication profile | Makes bilateral trust operational |
| `sam:human` | Contacts, fallback, escalation channel | Ensures autonomy never fails without a way out |

If a field is not strictly required to make discovery safe and execution bounded, it does not belong in the core.

### 4.2 Discovery and Capabilities

SAM lets an agent immediately understand whether the merchant exposes standard actions such as `browse_catalog`, `get_quote`, `place_order`, `track_order`, or `cancel_order`, and which protocols are available to consume them. SAM does **not** impose an execution protocol: a merchant can expose REST, OpenAPI, MCP, agent-to-agent, or several at once.

The cost of entry is **not rebuilding the existing stack** — it is making it discoverable and governable.

### 4.3 Identity, Signature, and Freshness

An agent must be able to verify that the `sam.json` it consumes was genuinely issued by the merchant's domain. v2.1 specifies a deliberately simple model: identity bound to the domain, `ed25519` signature of the canonicalized document, and short-lived delegated session keys for production signing. The master key stays offline.

Crucially, every signed manifest carries a `validUntil` timestamp. **A SAM manifest is valid only within a bounded freshness window. Agents MUST revalidate signed manifests after the declared TTL, and MUST treat revocation signals as higher priority than cached validity.** This rule sits at the same level as the rest of the security model: a signature without a freshness window is not a proof, it is a snapshot.

Revocation operates in two modes that the specification describes without conflating them. In **baseline mode**, the merchant publishes a new manifest with a shortened or retroactive `validUntil`, and the freshness rule alone guarantees that agents stop trusting the previous version. In **assisted mode**, a registry or comparable service publishes faster revocation signals that take precedence over cached validity. The constitutive rule is the same in both modes: **if the revocation source is unreachable and the TTL has expired, the agent MUST refuse to act. SAM never fails open.**

### 4.4 The Mandate — a small, closed grammar

The mandate is the most important piece of the core after the signature. It formalizes what an agent may do without human intervention. SAM specifies it as a **small, closed, versioned grammar** of exactly eight primitives: `autoExecute`, `maxAmount`, `maxPriceDrift`, `allowedCategories`, `deniedCategories`, `allowedRegions`, `validityWindow`, and `agentClass`.

The grammar deliberately refuses what would destroy interoperability. There are no `OR` conditions, no free fields, no extensions, no external references, no stateful counters. Composition is **AND-only**. The category taxonomy and region codes are closed and versioned with the grammar itself. Extending the grammar requires a new version, not new fields.

**v0.1 deliberately chooses robustness over coverage.** Recurring subscriptions, bundles, dynamic pricing, frequency limits, and other realistic but complex cases are **out of scope for v0.1 by design**. They will be evaluated for v0.2 only after pilot deployments produce data that justifies their inclusion. A small grammar that runs identically on every agent is more valuable than a large grammar that each implementer interprets differently.

The mandate **MUST** be evaluated **client-side**, locally, by the agent itself, before any autonomous action. No network call during evaluation. This is the strongest guardrail in the protocol: a misconfigured or compromised merchant endpoint cannot trick an agent into exceeding bounds the agent itself enforces.

### 4.5 Agent Authentication — one normative profile

Trust cannot be one-way. As soon as an action has meaningful economic or operational impact, the merchant needs to know which agent operator is acting, under which delegation, and on behalf of which user context.

SAM locks the choice: **agent authentication uses HTTP Message Signatures (RFC 9421), with `ed25519` as the required algorithm.** A small, fixed set of HTTP components is covered by the signature, including a `sam-mandate-ref` header that cryptographically binds each request to the mandate under which the agent claims to be acting.

> "SAM defines a single normative mainstream authentication profile. Deviations are permitted only through explicitly scoped exception profiles, each justified by a constraint the mainstream profile cannot satisfy."

Each authenticated agent request carries, in a single verifiable envelope, three things: a **cryptographic proof of operator identity** (the RFC 9421 signature), a **cryptographic proof of mandate adherence** (the `sam-mandate-ref` covered by the signature), and a **claim of user delegation** (the `sam-user-context` header, integrity-protected by the signature). The first two are proven cryptographically today; the third is a claim whose cryptographic proof — a user-issued or user-delegated credential — is an explicit objective of the technical specification, not a property already in v0.1. SAM will not pretend to deliver what it has not yet specified.

#### 4.5.1 The Operator Document

Locking authentication to a single mechanism creates a second normative object alongside `sam.json`: the operator document `sam-operator.json`, published at `https://<operator-domain>/.well-known/sam-operator.json`. To prevent the simplicity gained on the merchant side from leaking out through a complex operator side, the operator document is held to **the same discipline** as the merchant manifest:

- It **MUST** be served over HTTPS at the canonical well-known location.
- It **MUST** be signed with `ed25519`.
- It **MUST** declare a `validUntil` timestamp; the freshness rule of §4.3 applies in full.
- It **MUST** contain a minimal, fixed set of fields: operator identity, current public key, keys in rotation, validity window, escalation contact, and signature.
- It **MUST** declare its own conformance level. Operators below the equivalent of L2 cannot be used for autonomous economic action.

Anything beyond this minimal set is a profile, not a core field. The operator document is a *second small object*, not a second large one.

### 4.6 Human Escalation

Responsible autonomy is not the absence of humans — it is the ability to know when to return to one. The `sam:human` block belongs in the core because it provides an explicit fallback for the cases where the mandate forbids the action, authentication fails, the manifest is stale or revoked, or merchant policy simply requires human validation.

---

## 5. A Progressive Adoption Model

| Level | Content | Claim | Value to the merchant | Value to the agent |
|---|---|---|---|---|
| **L0 — Discovery** | `version` + `capabilities` + `human` | **merchant-ready** | Becomes readable to agents with no security project | Discovers actions; knows when to escalate |
| **L1 — Verification** | L0 + `identity` + `signature` | **agent-ready** | Adds proof of origin, integrity, and a freshness window | Distinguishes a verified merchant from an unsigned manifest |
| **L2 — Bounded execution** | L1 + `mandate` + `agentAuth` | **bounded autonomy** | Authorizes useful autonomy within a controlled, auditable frame | Can execute confidently within published bounds |

Each level is useful even if the merchant never moves to the next. A merchant can start by being **merchant-ready**, then become **agent-ready**, then open select transactions to **bounded autonomy**. Conformant agents **MUST NOT** perform autonomous economic actions against a merchant below L2.

---

## 6. Extension Profiles

| Profile | Purpose | Status in v2.2 |
|---|---|---|
| **Payment Profile** | Payment authorization, supported rails, quote/order binding | Official extension, outside the core |
| **Dispute Profile** | Dispute opening and tracking, evidence model, arbitration | Official extension, outside the core |
| **Catalog Profile** | Inline catalog for small merchants or bootstrap | Lightweight optional extension |
| **Registry Profile** | Assisted discovery, operator status, enriched revocation | Assisted mode, not required for baseline |
| **Incentive Profile** | Commission models and user-facing transparency | Treated separately, with caution |

The core can stay stable, rigorous, and small. Profiles can evolve at their own pace through specialized working groups, without blocking the baseline.

---

## 7. Fitting Into the Existing Ecosystem

SAM lives **upstream** of execution layers. Where a tool-calling protocol or API specification says *how* to execute an action, SAM says *how to discover the merchant, verify it, and understand the frame* in which that action may be executed.

Target flow in a modern integration:

1. The agent discovers the domain.
2. It fetches `sam.json` from the well-known location.
3. It verifies identity, signature, and freshness window.
4. It reads capabilities and parses the mandate.
5. It signs its outgoing requests using RFC 9421, binding each request to a `sam-mandate-ref`.
6. It hands off to the most appropriate execution protocol (REST, OpenAPI, MCP, A2A, …).

> **Integration principle.** SAM maps cleanly onto OpenAPI, MCP, REST, and other transports — without imposing a single runtime or product hierarchy.

---

## 8. Security Model

SAM's security model rests on five constitutional rules:

1. **No autonomy without proof.**
2. **No proof without signature.**
3. **No execution without bounds.**
4. **No bounds without local enforcement.**
5. **No signature is valid forever — only within its declared freshness window.**

Beyond these, the technical specification addresses key rotation, revocation, clock drift, replay attacks, multi-tenant environments, and manifest staleness.

The single most important guardrail: the mandate is evaluated **locally by the agent**, before any autonomous action, without any network call. A misconfigured or compromised merchant endpoint cannot push an agent past bounds the agent itself enforces.

---

## 9. Why Each Stakeholder Should Adopt SAM

| Stakeholder | Immediate benefit | Strategic benefit |
|---|---|---|
| **Merchants** | Become **merchant-ready** without rewriting the stack | Become a reliable destination for automation |
| **Agentic platforms** | A common source of trust and mandate enforcement | Lower per-merchant risk and integration cost |
| **E-commerce vendors** | Ship a SAM module as a native platform feature | Position themselves as the agentic activation layer |
| **End users** | More useful actions with no extra friction | More control, more safety, better traceability under **bounded autonomy** |

For massive adoption, SAM must produce **asymmetric value**. On the merchant side, L0 must be nearly free. On the platform side, reading SAM must reduce marginal integration cost. On the user side, the expected effect is autonomy that is **more useful but more bounded** — and therefore more acceptable.

---

## 10. Recommended Adoption Strategy

A credible adoption strategy starts with a clear **beachhead**: simple quote-and-order commerce in verticals where catalog, stock, and return rules are already structured.

Sequence:

1. **Distribution through platforms.** Plugins for CMS and e-commerce platforms, visual generators, linters, validators. Make L0 a one-click setting.
2. **Distribution through developer tools.** Reading SDKs, RFC 9421 verification libraries, mandate evaluators, mappings to OpenAPI.
3. **Distribution through agent marketplaces and model operators.** Native SAM fetch, signature verification, and mandate enforcement built into the autonomous-execution path.

Product communication discipline: SAM is not a future total commerce system. It is the simplest way to make a merchant **merchant-ready**, then **agent-ready**, then capable of supporting **bounded autonomy**.

> **Message to carry.** *Publish once, be discoverable everywhere. Verify continuously, execute safely within bounds.*

---

## 11. Governance

To succeed, SAM must remain open, documented, and governed as **shared infrastructure**. The schema, reference implementations, test vectors, validators, and profiles must be published under a permissive license. Changes to the core must go through a transparent proposal process, with backward-compatibility requirements and clear justification of implementation cost.

Two legitimate operating modes coexist:

- **Baseline mode** — relies solely on the domain and the signature.
- **Assisted mode** — a registry or complementary services add enriched discovery, operator status, revocation, or reputation.

The specification describes both modes without conflating them.

---

## 12. Roadmap

1. **Stabilize the core objects and the mandate grammar v0.1.** Publish a clean schema, valid and invalid examples, and verification libraries in several languages.
2. **Publish the RFC 9421 authentication profile** with the full covered-components set, the operator key resolution mechanism, and conformance tests.
3. **Ship the first official Payment Profile.** Limited scope: quote binding, idempotency, basic authorization rules.
4. **Defer the Dispute Profile** until after the first real deployments inform it.
5. **Mandate grammar v0.2** only after pilot data justifies it (likely targets: recurring subscriptions, frequency limits, dynamic-pricing nuances).

---

## 13. Conclusion

Agentic commerce needs a common layer for discovery, verification, and mandate. SAM can become that common layer — on the condition that it gives up the illusion of being a *total* protocol.

The right strategy is to define a core that is extremely clear, extremely credible, and extremely easy to deploy, then let the ecosystem extend it cleanly where value and maturity justify it. v2.1 took the two decisions that made that promise serious — a single normative authentication profile and a small, closed mandate grammar. v2.2 holds the operator document to the same discipline, distinguishes proven facts from claims awaiting their mechanism, assumes the austerity of v0.1, and forbids fail-open on revocation.

In v2.2, SAM is interoperability infrastructure for the agent era: simple to publish, simple to read, hard to misuse, time-bounded by design, and flexible enough to coexist with the stacks that already matter. **Merchant-ready. Agent-ready. Bounded autonomy.**

---

## Appendix A — Changes from v2.0 and v2.1

**From v2.0 to v2.1:**

- Locked the agent authentication profile (RFC 9421 + `ed25519`).
- Locked the mandate grammar v0.1 (eight closed primitives, AND-only).
- Elevated the freshness rule to a constitutional security rule.
- Unified narrative wording around *merchant-ready / agent-ready / bounded autonomy*.
- Explicit prohibition of autonomous economic action below L2.

**From v2.1 to v2.2:**

- **Operator document elevated to a first-order normative object** (§4.5.1): same discipline, freshness rule, conformance levels and minimal field set as `sam.json`.
- **Honest distinction between proof and claim** in §4.5: operator identity and mandate adherence are cryptographically proven today; user delegation is a claim whose mechanism is an explicit objective, not a property already in v0.1.
- **Austerity of mandate grammar v0.1 explicitly assumed** in §4.4: subscriptions, bundles, dynamic pricing and frequency limits are out of scope by design.
- **Revocation operationalized** in §4.3: two modes (baseline / assisted), explicit *no fail-open* rule when revocation source is unreachable past TTL.
- **Slogan tightened**: *"Verify continuously, execute safely within bounds"* — aligned with the freshness rule.
- Minor editorial pass.
