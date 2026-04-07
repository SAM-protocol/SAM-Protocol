# SAM Protocol

**The Trust and Mandate Layer for Agentic Commerce**

[![Status: Draft](https://img.shields.io/badge/status-draft-orange.svg)](docs/SAM_Protocol_WhitePaper_v1_0_EN.pdf)
[![Version: 1.0](https://img.shields.io/badge/version-1.0-blue.svg)](docs/SAM_Protocol_WhitePaper_v1_0_EN.pdf)
[![Spec: draft-sam-protocol-01](https://img.shields.io/badge/spec-draft--sam--protocol--01-lightgrey.svg)](docs/SAM_Protocol_Normative_OnePager.pdf)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

> *Merchant-ready. Agent-ready. Bounded autonomy.*

SAM (Semantic Agent Model) is an **open standard** that lets AI agents discover a merchant, verify its identity, understand the limits of autonomous execution, and fall back gracefully to a human when autonomy is not enough.

SAM is not a commerce protocol. It is the **upstream trust and mandate layer** for existing agent execution frameworks (MCP, OpenAI Actions, A2A, REST). It does not compete with them. It feeds them.

---

## Why SAM exists

AI agents can already search, compare, configure, and buy. What they cannot yet do reliably is:

- **Discover** a merchant in a standardized way
- **Verify** its cryptographic identity
- **Understand** the bounds within which autonomous execution is permitted
- **Escalate** to a human when those bounds do not hold

A merchant publishes a single signed JSON document at a well-known location:

```
https://<merchant-domain>/.well-known/sam.json
```

That document carries identity, capabilities, a bounded mandate, an agent-authentication profile, and a human-escalation channel. Agents evaluate the mandate **locally**, with no network call, before taking any action. Signatures are time-bounded by a constitutional freshness rule. Revocation never fails open.

**One file. One signature. One grammar. One fallback.**

---

## Documents

| Document | What it is | Format |
|---|---|---|
| **White Paper v1.0** | The why, the design, the trade-offs | [PDF](docs/SAM_Protocol_WhitePaper_v1_0_EN.pdf) · [DOCX](docs/SAM_Protocol_WhitePaper_v1_0_EN.docx) · [Markdown](docs/SAM_Protocol_WhitePaper_v1_0_EN.md) |
| **Normative One-Pager** | What an implementer must do — MUST / SHOULD / MAY | [PDF](docs/SAM_Protocol_Normative_OnePager.pdf) · [DOCX](docs/SAM_Protocol_Normative_OnePager.docx) |
| **Technical Appendix** | Code snippets — just enough to start a pilot | [PDF](docs/SAM_Protocol_Technical_Appendix.pdf) · [DOCX](docs/SAM_Protocol_Technical_Appendix.docx) |

---

## The five constitutional rules

1. **No autonomy without proof.**
2. **No proof without signature.**
3. **No execution without bounds.**
4. **No bounds without local enforcement.**
5. **No signature is valid forever — only within its declared freshness window.**

---

## Core design decisions (locked in v1.0)

- **Agent authentication** — HTTP Message Signatures (RFC 9421) with `ed25519`. One profile. One algorithm. One covered-components set. Exceptions are documented profiles, not alternatives.
- **Mandate grammar v0.1** — a closed grammar of eight primitives, AND-only, evaluated locally with no network call. No OR, no conditionals, no free fields.
- **Constitutional freshness rule** — every signed manifest carries a `validUntil`. Agents MUST revalidate after TTL expiry. Revocation signals outrank cached validity. **SAM never fails open.**
- **Operator document discipline** — `sam-operator.json` is held to the same signing, freshness, and revocation discipline as `sam.json`.
- **Conformance levels** — L0 *merchant-ready*, L1 *agent-ready*, L2 *bounded autonomy*. Autonomous economic actions require L2.

---

## Quick start

### For merchants (L0 → L2, in an afternoon)

1. Read the [Normative One-Pager](docs/SAM_Protocol_Normative_OnePager.pdf).
2. Copy the minimal `sam.json` example: [`examples/sam.json`](examples/sam.json).
3. Sign it with an `ed25519` key (see the [Technical Appendix](docs/SAM_Protocol_Technical_Appendix.pdf), section B).
4. Publish it at `https://<your-domain>/.well-known/sam.json`.
5. Declare your conformance level.

### For agent builders

1. Read the [White Paper](docs/SAM_Protocol_WhitePaper_v1_0_EN.pdf).
2. Implement the manifest verifier (Technical Appendix, section B — ~20 lines Python).
3. Implement the stateless mandate evaluator (Technical Appendix, section C — ~35 lines, no network).
4. Sign outgoing requests with RFC 9421 + `ed25519` (Technical Appendix, section D).

---

## Repository layout

```
SAM-Protocol/
├── README.md                   This file
├── LICENSE                     Apache License 2.0
├── CONTRIBUTING.md             How to contribute
├── docs/                       White paper, one-pager, technical appendix
├── examples/                   Minimal sam.json example
└── build/                      Build scripts for the PDF/DOCX versions
```

---

## Status

This is a **draft specification** (`draft-sam-protocol-01`). The text is stable but not yet final. Implementors are encouraged to run pilots and provide feedback via GitHub issues. The specification may change based on community review before v1.0 is declared stable.

**Known open issues for the normative spec** (section F of the Technical Appendix):

- JSON canonicalization — must be defined exhaustively with test vectors
- Amount normalization — who computes the value compared against `maxAmount`, when, and how
- Operator document trust model — exact discipline and revocation semantics
- Replay protection and clock skew — acceptance window, nonce policy, anti-replay
- `sam-user-context` semantics — minimum and maximum claim set

---

## Contributing

Pull requests, issues, and discussions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

- **Feedback** → [Issues](https://github.com/SAM-protocol/SAM-Protocol/issues)
- **Discussion** → [Discussions](https://github.com/SAM-protocol/SAM-Protocol/discussions)

---

## License

SAM Protocol is released under the [Apache License 2.0](LICENSE). Free to use, implement, extend, and commercialize. No royalties. No gatekeeper.

---

## Citation

```
SAM Protocol — The Trust and Mandate Layer for Agentic Commerce
Draft specification: draft-sam-protocol-01
Version 1.0, April 2026
https://github.com/SAM-protocol/SAM-Protocol
```
