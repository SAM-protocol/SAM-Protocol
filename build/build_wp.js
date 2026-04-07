// Build SAM White Paper v1.0 in V1 visual style
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, TabStopType, TabStopPosition
} = require('docx');

const BLUE = "1F4E79";       // dark blue headings
const BLUE_LIGHT = "2E75B6"; // accent blue
const BLUE_BG = "EAF2FA";    // pale blue callout background
const GRAY = "808080";
const BORDER = { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

function P(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 300 },
    alignment: opts.alignment,
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size, font: opts.font })],
  });
}

function runs(parts) {
  return parts.map(p => new TextRun(typeof p === 'string' ? { text: p } : p));
}

function Pmix(parts, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 300 },
    alignment: opts.alignment,
    children: runs(parts),
  });
}

function H1(text, num) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text: num ? `${num}. ${text}` : text, bold: true, color: "000000", size: 32, font: "Arial" })],
  });
}
function H2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: BLUE, size: 26, font: "Arial" })],
  });
}
function H3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, color: BLUE_LIGHT, size: 22, font: "Arial" })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80, line: 280 },
    children: runs(Array.isArray(text) ? text : [text]),
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80, line: 280 },
    children: runs(Array.isArray(text) ? text : [text]),
  });
}

// Callout box = single-cell table with blue border and pale background
function callout(titleText, bodyParas) {
  const cellChildren = [];
  if (titleText) {
    cellChildren.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: titleText, bold: true, color: BLUE, size: 24, font: "Arial" })],
    }));
  }
  cellChildren.push(...bodyParas);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    borders: {
      top: BORDER, bottom: BORDER, left: BORDER, right: BORDER,
      insideHorizontal: NONE, insideVertical: NONE,
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: BLUE_BG, type: ShadingType.CLEAR },
        margins: { top: 180, bottom: 180, left: 220, right: 220 },
        children: cellChildren,
      })],
    })],
  });
}

// Data table (header row + rows)
function dataTable(headers, rows, widths) {
  const totalWidth = 9360;
  const colWidths = widths || headers.map(() => Math.floor(totalWidth / headers.length));
  const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      borders,
      shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: BLUE, size: 20, font: "Arial" })] })],
    })),
  });

  const dataRows = rows.map(r => new TableRow({
    children: r.map((c, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      borders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, font: "Arial" })] })],
    })),
  }));

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

// Spacer
const spacer = () => new Paragraph({ spacing: { after: 80 }, children: [] });

// ---------- Header & Footer ----------
const pageHeader = new Header({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT, space: 4 } },
      children: [
        new TextRun({ text: "SAM Protocol", bold: true, color: BLUE_LIGHT, font: "Arial", size: 22 }),
        new TextRun({ text: "  -  White Paper v1.0", color: "000000", font: "Arial", size: 22 }),
        new TextRun({ text: "\t", font: "Arial" }),
        new TextRun({ text: "draft-sam-protocol-01  |  April 2026", italics: true, color: "000000", font: "Arial", size: 22 }),
      ],
    }),
  ],
});

const pageFooter = new Footer({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT, space: 4 } },
      children: [
        new TextRun({ text: "sam-protocol.org  |  github.com/sam-protocol", color: BLUE_LIGHT, font: "Arial", size: 20 }),
        new TextRun({ text: "\t", font: "Arial" }),
        new TextRun({ text: "p. ", italics: true, color: GRAY, font: "Arial", size: 20 }),
        new TextRun({ children: [PageNumber.CURRENT], italics: true, color: GRAY, font: "Arial", size: 20 }),
      ],
    }),
  ],
});

// ---------- Content ----------
const content = [];

// Title block
content.push(new Paragraph({
  spacing: { before: 600, after: 120 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "OPEN STANDARD  |  INTERNET-DRAFT  |  APRIL 2026", bold: true, color: GRAY, size: 20, font: "Arial" })],
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
  children: [new TextRun({ text: "SAM PROTOCOL", bold: true, color: BLUE, size: 72, font: "Arial" })],
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
  children: [new TextRun({ text: "The Trust and Mandate Layer for Agentic Commerce", italics: true, color: BLUE_LIGHT, size: 32, font: "Arial" })],
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: "draft-sam-protocol-01", font: "Courier New", size: 22 })],
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 360 },
  children: [new TextRun({ text: "Merchant-ready. Agent-ready. Bounded autonomy.", italics: true, size: 22, font: "Arial" })],
}));

// Abstract callout
content.push(callout("Abstract", [
  Pmix([
    "AI agents can already search, compare, configure, and buy. What they cannot yet do reliably is ",
    { text: "discover a merchant in a standardized way, verify its identity, understand the limits of autonomous execution, and fall back gracefully to a human when autonomy is not enough", bold: true },
    ".",
  ]),
  P("This document specifies SAM Protocol v2.2: a free, open standard defined by a sam.json file published at the merchant's well-known location. SAM is the upstream trust and mandate layer for existing agent execution frameworks (MCP, OpenAI Actions, A2A, REST). It does not compete with these frameworks. It feeds them."),
  Pmix([
    { text: "v2.2 locks the technical decisions v2.0 and v2.1 promised in principle: ", bold: true },
    "HTTP Message Signatures (RFC 9421) with ed25519 for agent authentication, a closed eight-primitive mandate grammar, a constitutional freshness rule, an operator document held to the same discipline as sam.json, and an explicit no-fail-open rule on revocation.",
  ]),
]));

content.push(spacer());
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: "sam-protocol.org  |  github.com/sam-protocol/spec", color: BLUE_LIGHT, font: "Arial", size: 22 })],
}));

// ========== Section 1: Status ==========
content.push(H1("Status of This Document", "1"));
content.push(callout(null, [
  Pmix([{ text: "This is a draft specification. The text is stable but not yet final.", bold: true, color: "C0504D" }]),
  P("Implementors are encouraged to experiment and provide feedback via GitHub issues. The specification may change based on community review before v2.2 is declared stable."),
  Pmix([
    { text: "Feedback:   ", bold: true },
    { text: "github.com/sam-protocol/spec/issues", color: BLUE_LIGHT },
  ]),
  Pmix([
    { text: "Discussion: ", bold: true },
    { text: "github.com/sam-protocol/spec/discussions", color: BLUE_LIGHT },
  ]),
]));
content.push(P("This white paper accompanies the SAM Protocol technical specification. It explains the why; the specification and the Normative One-Pager state the what."));
content.push(P("The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174]."));

// ========== Section 2: Why ==========
content.push(H1("Why Agentic Commerce Needs a Trust Layer", "2"));
content.push(P("The web was designed for humans assisted by browsers. Agents operate differently. They must select an execution surface, interpret rules, arbitrate between offers, and sometimes commit to acts with real economic consequences. Without a shared standard, every merchant becomes a special case, and every agent must re-learn the same trust assumptions from scratch."));
content.push(P("Four gaps hold useful autonomy back today:"));
content.push(bullet([{ text: "Discovery. ", bold: true }, "No universal way for a merchant to expose its transactional capabilities to agents."]));
content.push(bullet([{ text: "Verification. ", bold: true }, "TLS proves the channel, not the manifest. Agents have no simple proof that a merchant document genuinely originates from the merchant — and no model for when that proof expires."]));
content.push(bullet([{ text: "Mandate. ", bold: true }, "Nothing cleanly expresses what an agent may do without human validation, within which price bounds, categories, regions, or time windows."]));
content.push(bullet([{ text: "Escalation. ", bold: true }, "When the system steps outside its safe perimeter, there is rarely a structured, explicit path back to a human."]));
content.push(P("The consequence is familiar: integrations stay ad hoc, trust stays implicit, guardrails are scattered across proprietary SDKs, and real autonomy remains confined to demos and tightly controlled surfaces."));

content.push(callout("Scope of this specification", [
  Pmix([{ text: "SAM v2.2 is a trust and mandate protocol.", bold: true, color: BLUE }]),
  P("SAM defines: who the merchant is, what agents can do, under what rules, and when to escalate to a human."),
  P("SAM does not define: how payments are settled, how disputes are resolved, how catalogs are structured globally, or how operators compete."),
  P("Payment, disputes, catalog, registry, and incentives are specified as optional extension profiles. Framework-specific execution (MCP, OpenAI Actions, A2A) is handled by those frameworks, not by SAM. SAM provides the upstream trust context."),
]));

// ========== Section 3: Design Principles ==========
content.push(H1("Design Principles", "3"));
content.push(H3("Useful minimalism"));
content.push(P("The core must be small enough that any merchant can deploy it without an integration project."));
content.push(H3("Progressive adoption"));
content.push(P("A merchant can start with a simple capabilities manifest and increase its trust level later, without rewriting its architecture."));
content.push(H3("Interoperability"));
content.push(P("SAM complements existing execution protocols. It does not compete with them."));
content.push(H3("Merchant sovereignty"));
content.push(P("Identity, keys, rules, and integrations stay under the merchant's control."));
content.push(H3("Bilateral trust"));
content.push(P("The agent verifies the merchant; the merchant verifies the agent when autonomy demands it."));
content.push(H3("Explicit escalation"));
content.push(P("Autonomy is not absolute. The protocol must say when and how to return to a human."));
content.push(H3("Closed, not flexible-by-default"));
content.push(P("Where flexibility would destroy interoperability, SAM closes the door. One mandate grammar. One authentication profile. Exceptions are exceptions, not alternatives."));
content.push(H3("Bounded freshness"));
content.push(P("A signed manifest is not eternally valid because it is signed. It is valid only within its declared freshness window."));

// ========== Section 4: What SAM standardizes ==========
content.push(H1("What SAM Standardizes — and What It Does Not", "4"));
content.push(P("SAM standardizes a single agent-readable entry document. That document describes the merchant's existence as an agent-compatible actor, how to verify it, the capabilities it exposes, the conditions under which autonomous execution is permitted, and the conditions under which human escalation must occur. It creates a common starting point regardless of the execution protocol used downstream."));
content.push(Pmix([
  "SAM does ",
  { text: "not", bold: true },
  " attempt to impose a single payment rail, a universal catalog engine, a global reputation system, or centralized commerce governance. These domains exist, will continue to exist, and must be pluggable into SAM.",
]));
content.push(callout("Scoping rule", [
  Pmix([
    "The SAM core answers ",
    { text: '"may I act here, and within which bounds?"', italics: true },
    " — not ",
    { text: '"how should every commerce subsystem in the world work?"', italics: true },
  ]),
]));

// ========== Section 5: The SAM Core ==========
content.push(H1("The SAM Core", "5"));
content.push(Pmix([
  "The SAM core is a single ",
  { text: "sam.json", font: "Courier New" },
  " file, published at the canonical well-known location ",
  { text: "https://<merchant-domain>/.well-known/sam.json", font: "Courier New" },
  ". It is not just a technical manifest. It is a readability contract for agents.",
]));

content.push(H2("5.1 Core Components"));
content.push(dataTable(
  ["Block", "Role", "Why it belongs in the core"],
  [
    ["sam:version", "Schema version and compatibility", "Required for interoperable, controlled evolution"],
    ["sam:capabilities", "Actions, endpoints, supported protocols", "The most immediately useful machine-readable entry point"],
    ["sam:identity", "Merchant identity bound to the domain", "Anchors the document to the right economic actor"],
    ["sam:signature", "Document signature, key delegation, TTL", "Turns the manifest into a verifiable, time-bounded object"],
    ["sam:mandate", "Autonomous-execution rules (closed grammar)", "Enables governance of autonomy on both sides"],
    ["sam:agentAuth", "Declared agent-authentication profile", "Makes bilateral trust operational"],
    ["sam:human", "Contacts, fallback, escalation channel", "Ensures autonomy never fails without a way out"],
  ],
  [2000, 3400, 3960]
));
content.push(spacer());
content.push(P("If a field is not strictly required to make discovery safe and execution bounded, it does not belong in the core."));

content.push(H2("5.2 Discovery and Capabilities"));
content.push(Pmix([
  "SAM lets an agent immediately understand whether the merchant exposes standard actions such as ",
  { text: "browse_catalog", font: "Courier New" }, ", ",
  { text: "get_quote", font: "Courier New" }, ", ",
  { text: "place_order", font: "Courier New" }, ", ",
  { text: "track_order", font: "Courier New" }, ", or ",
  { text: "cancel_order", font: "Courier New" },
  ", and which protocols are available to consume them. SAM does not impose an execution protocol: a merchant can expose REST, OpenAPI, MCP, agent-to-agent, or several at once.",
]));
content.push(P("The cost of entry is not rebuilding the existing stack — it is making it discoverable and governable."));

content.push(H2("5.3 Identity, Signature, and Freshness"));
content.push(Pmix([
  "An agent must be able to verify that the ",
  { text: "sam.json", font: "Courier New" },
  " it consumes was genuinely issued by the merchant's domain. SAM specifies a deliberately simple model: identity bound to the domain, ",
  { text: "ed25519", font: "Courier New" },
  " signature of the canonicalized document, and short-lived delegated session keys for production signing. The master key stays offline.",
]));
content.push(callout("Constitutional freshness rule", [
  Pmix([
    { text: "A SAM manifest is valid only within a bounded freshness window. Agents MUST revalidate signed manifests after the declared TTL, and MUST treat revocation signals as higher priority than cached validity.", bold: true, color: BLUE },
  ]),
  P("A signature without a freshness window is not a proof — it is a snapshot."),
]));
content.push(P("Revocation operates in two modes that the specification describes without conflating them. In baseline mode, the merchant publishes a new manifest with a shortened or retroactive validUntil, and the freshness rule alone guarantees that agents stop trusting the previous version. In assisted mode, a registry or comparable service publishes faster revocation signals that take precedence over cached validity."));
content.push(Pmix([
  { text: "The constitutive rule is the same in both modes: if the revocation source is unreachable and the TTL has expired, the agent MUST refuse to act. SAM never fails open.", bold: true },
]));

content.push(H2("5.4 The Mandate — a small, closed grammar"));
content.push(P("The mandate is the most important piece of the core after the signature. It formalizes what an agent may do without human intervention. SAM specifies it as a small, closed, versioned grammar of exactly eight primitives:"));
content.push(dataTable(
  ["Primitive", "Meaning"],
  [
    ["autoExecute", "If false, no autonomous action permitted"],
    ["maxAmount", "Absolute cap with explicit tax and shipping inclusivity"],
    ["maxPriceDrift", "Tolerated drift between quote and order"],
    ["allowedCategories", "Whitelist (closed SAM taxonomy)"],
    ["deniedCategories", "Blacklist (evaluated after whitelist)"],
    ["allowedRegions", "Permitted jurisdictions (ISO 3166-1 alpha-2)"],
    ["validityWindow", "Mandatory time window (ISO 8601)"],
    ["agentClass", "retail | business | any"],
  ],
  [2800, 6560]
));
content.push(spacer());
content.push(P("The grammar deliberately refuses what would destroy interoperability. There are no OR conditions, no free fields, no extensions, no external references, no stateful counters. Composition is AND-only. The category taxonomy and region codes are closed and versioned with the grammar itself. Extending the grammar requires a new version, not new fields."));
content.push(callout("Austerity assumed", [
  Pmix([{ text: "v0.1 deliberately chooses robustness over coverage.", bold: true, color: BLUE }]),
  P("Recurring subscriptions, bundles, dynamic pricing, frequency limits, and other realistic but complex cases are out of scope for v0.1 by design. They will be evaluated for v0.2 only after pilot deployments produce data that justifies their inclusion."),
  P("A small grammar that runs identically on every agent is more valuable than a large grammar that each implementer interprets differently."),
]));
content.push(Pmix([
  "The mandate ",
  { text: "MUST", bold: true },
  " be evaluated ",
  { text: "client-side", bold: true },
  ", locally, by the agent itself, before any autonomous action. No network call during evaluation. This is the strongest guardrail in the protocol: a misconfigured or compromised merchant endpoint cannot trick an agent into exceeding bounds the agent itself enforces.",
]));

content.push(H2("5.5 Agent Authentication — one normative profile"));
content.push(P("Trust cannot be one-way. As soon as an action has meaningful economic or operational impact, the merchant needs to know which agent operator is acting, under which delegation, and on behalf of which user context."));
content.push(Pmix([
  "SAM locks the choice: ",
  { text: "agent authentication uses HTTP Message Signatures (RFC 9421), with ed25519 as the required algorithm.", bold: true },
  " A small, fixed set of HTTP components is covered by the signature, including a ",
  { text: "sam-mandate-ref", font: "Courier New" },
  " header that cryptographically binds each request to the mandate under which the agent claims to be acting.",
]));
content.push(callout("Normative profile", [
  Pmix([{
    text: '"SAM defines a single normative mainstream authentication profile. Deviations are permitted only through explicitly scoped exception profiles, each justified by a constraint the mainstream profile cannot satisfy."',
    italics: true, color: BLUE,
  }]),
]));
content.push(P("Each authenticated agent request carries, in a single verifiable envelope, three things: a cryptographic proof of operator identity (the RFC 9421 signature), a cryptographic proof of mandate adherence (the sam-mandate-ref covered by the signature), and a claim of user delegation (the sam-user-context header, integrity-protected by the signature)."));
content.push(Pmix([
  { text: "The first two are proven cryptographically today; the third is a claim whose cryptographic proof — a user-issued or user-delegated credential — is an explicit objective of the technical specification, not a property already in v0.1. SAM will not pretend to deliver what it has not yet specified.", italics: true },
]));

content.push(H3("5.5.1 The Operator Document"));
content.push(Pmix([
  "Locking authentication to a single mechanism creates a second normative object alongside ",
  { text: "sam.json", font: "Courier New" }, ": the operator document ",
  { text: "sam-operator.json", font: "Courier New" },
  ", published at ",
  { text: "https://<operator-domain>/.well-known/sam-operator.json", font: "Courier New" },
  ". To prevent the simplicity gained on the merchant side from leaking out through a complex operator side, the operator document is held to the same discipline as the merchant manifest:",
]));
content.push(bullet([{ text: "MUST ", bold: true }, "be served over HTTPS at the canonical well-known location."]));
content.push(bullet([{ text: "MUST ", bold: true }, "be signed with ed25519."]));
content.push(bullet([{ text: "MUST ", bold: true }, "declare a validUntil timestamp; the freshness rule of §5.3 applies in full."]));
content.push(bullet([{ text: "MUST ", bold: true }, "contain a minimal, fixed set of fields: operator identity, current public key, keys in rotation, validity window, escalation contact, and signature."]));
content.push(bullet([{ text: "MUST ", bold: true }, "declare its own conformance level. Operators below the equivalent of L2 cannot be used for autonomous economic action."]));
content.push(P("Anything beyond this minimal set is a profile, not a core field. The operator document is a second small object, not a second large one."));

content.push(H2("5.6 Human Escalation"));
content.push(Pmix([
  "Responsible autonomy is not the absence of humans — it is the ability to know when to return to one. The ",
  { text: "sam:human", font: "Courier New" },
  " block belongs in the core because it provides an explicit fallback for the cases where the mandate forbids the action, authentication fails, the manifest is stale or revoked, or merchant policy simply requires human validation.",
]));

// ========== Section 6: Adoption model ==========
content.push(H1("A Progressive Adoption Model", "6"));
content.push(dataTable(
  ["Level", "Content", "Claim", "Value to merchant", "Value to agent"],
  [
    ["L0 — Discovery", "version + capabilities + human", "merchant-ready", "Readable to agents, no security project", "Discovers actions; knows when to escalate"],
    ["L1 — Verification", "L0 + identity + signature", "agent-ready", "Proof of origin, integrity, freshness", "Distinguishes verified from unsigned"],
    ["L2 — Bounded exec.", "L1 + mandate + agentAuth", "bounded autonomy", "Authorizes useful autonomy in a frame", "Executes confidently within bounds"],
  ],
  [1700, 2000, 1660, 2000, 2000]
));
content.push(spacer());
content.push(Pmix([
  "Each level is useful even if the merchant never moves to the next. A merchant can start by being ",
  { text: "merchant-ready", bold: true },
  ", then become ",
  { text: "agent-ready", bold: true },
  ", then open select transactions to ",
  { text: "bounded autonomy", bold: true },
  ". Conformant agents ",
  { text: "MUST NOT", bold: true },
  " perform autonomous economic actions against a merchant below L2.",
]));

// ========== Section 7: Extension Profiles ==========
content.push(H1("Extension Profiles", "7"));
content.push(dataTable(
  ["Profile", "Purpose", "Status in v2.2"],
  [
    ["Payment", "Payment authorization, rails, quote/order binding", "Official extension, outside the core"],
    ["Dispute", "Dispute opening, evidence, arbitration", "Official extension, outside the core"],
    ["Catalog", "Inline catalog for small merchants", "Lightweight optional extension"],
    ["Registry", "Assisted discovery, operator status, revocation", "Assisted mode, not required for baseline"],
    ["Incentive", "Commission models, user-facing transparency", "Treated separately, with caution"],
  ],
  [1800, 4160, 3400]
));
content.push(spacer());
content.push(P("The core can stay stable, rigorous, and small. Profiles evolve at their own pace through specialized working groups, without blocking the baseline."));

// ========== Section 8: Ecosystem fit ==========
content.push(H1("Fitting Into the Existing Ecosystem", "8"));
content.push(P("SAM lives upstream of execution layers. Where a tool-calling protocol or API specification says how to execute an action, SAM says how to discover the merchant, verify it, and understand the frame in which that action may be executed."));
content.push(P("Target flow in a modern integration:"));
content.push(numbered("The agent discovers the domain."));
content.push(numbered("It fetches sam.json from the well-known location."));
content.push(numbered("It verifies identity, signature, and freshness window."));
content.push(numbered("It reads capabilities and parses the mandate."));
content.push(numbered("It signs its outgoing requests using RFC 9421, binding each request to a sam-mandate-ref."));
content.push(numbered("It hands off to the most appropriate execution protocol (REST, OpenAPI, MCP, A2A)."));
content.push(callout("Integration principle", [
  P("SAM maps cleanly onto OpenAPI, MCP, REST, and other transports — without imposing a single runtime or product hierarchy."),
]));

// ========== Section 9: Security Model ==========
content.push(H1("Security Model", "9"));
content.push(P("SAM's security model rests on five constitutional rules:"));
content.push(numbered([{ text: "No autonomy without proof.", bold: true }]));
content.push(numbered([{ text: "No proof without signature.", bold: true }]));
content.push(numbered([{ text: "No execution without bounds.", bold: true }]));
content.push(numbered([{ text: "No bounds without local enforcement.", bold: true }]));
content.push(numbered([{ text: "No signature is valid forever — only within its declared freshness window.", bold: true }]));
content.push(P("Beyond these, the technical specification addresses key rotation, revocation, clock drift, replay attacks, multi-tenant environments, and manifest staleness."));
content.push(P("The single most important guardrail: the mandate is evaluated locally by the agent, before any autonomous action, without any network call. A misconfigured or compromised merchant endpoint cannot push an agent past bounds the agent itself enforces."));

// ========== Section 10: Why adopt ==========
content.push(H1("Why Each Stakeholder Should Adopt SAM", "10"));
content.push(dataTable(
  ["Stakeholder", "Immediate benefit", "Strategic benefit"],
  [
    ["Merchants", "Become merchant-ready without rewriting the stack", "Reliable destination for automation"],
    ["Agentic platforms", "Common source of trust and mandate enforcement", "Lower per-merchant risk and integration cost"],
    ["E-commerce vendors", "Ship a SAM module as a platform feature", "Position as the agentic activation layer"],
    ["End users", "More useful actions, no extra friction", "More control, traceable bounded autonomy"],
  ],
  [2200, 3580, 3580]
));
content.push(spacer());
content.push(P("For massive adoption, SAM must produce asymmetric value. On the merchant side, L0 must be nearly free. On the platform side, reading SAM must reduce marginal integration cost. On the user side, the expected effect is autonomy that is more useful but more bounded — and therefore more acceptable."));

// ========== Section 11: Adoption Strategy ==========
content.push(H1("Recommended Adoption Strategy", "11"));
content.push(P("A credible adoption strategy starts with a clear beachhead: simple quote-and-order commerce in verticals where catalog, stock, and return rules are already structured."));
content.push(numbered([{ text: "Distribution through platforms. ", bold: true }, "Plugins for CMS and e-commerce platforms, visual generators, linters, validators. Make L0 a one-click setting."]));
content.push(numbered([{ text: "Distribution through developer tools. ", bold: true }, "Reading SDKs, RFC 9421 verification libraries, mandate evaluators, mappings to OpenAPI."]));
content.push(numbered([{ text: "Distribution through agent marketplaces and model operators. ", bold: true }, "Native SAM fetch, signature verification, and mandate enforcement in the autonomous-execution path."]));
content.push(Pmix([
  "Product communication discipline: SAM is not a future total commerce system. It is the simplest way to make a merchant ",
  { text: "merchant-ready", bold: true },
  ", then ",
  { text: "agent-ready", bold: true },
  ", then capable of supporting ",
  { text: "bounded autonomy", bold: true },
  ".",
]));
content.push(callout("Message to carry", [
  Pmix([
    { text: "Publish once, be discoverable everywhere. Verify continuously, execute safely within bounds.", italics: true, bold: true, color: BLUE },
  ]),
]));

// ========== Section 12: Governance ==========
content.push(H1("Governance", "12"));
content.push(P("To succeed, SAM must remain open, documented, and governed as shared infrastructure. The schema, reference implementations, test vectors, validators, and profiles must be published under a permissive license. Changes to the core must go through a transparent proposal process, with backward-compatibility requirements and clear justification of implementation cost."));
content.push(P("Two legitimate operating modes coexist:"));
content.push(bullet([{ text: "Baseline mode ", bold: true }, "— relies solely on the domain and the signature."]));
content.push(bullet([{ text: "Assisted mode ", bold: true }, "— a registry or complementary services add enriched discovery, operator status, revocation, or reputation."]));
content.push(P("The specification describes both modes without conflating them."));

// ========== Section 13: Roadmap ==========
content.push(H1("Roadmap", "13"));
content.push(numbered([{ text: "Stabilize the core objects and the mandate grammar v0.1. ", bold: true }, "Publish a clean schema, valid and invalid examples, and verification libraries in several languages."]));
content.push(numbered([{ text: "Publish the RFC 9421 authentication profile ", bold: true }, "with the full covered-components set, the operator key resolution mechanism, and conformance tests."]));
content.push(numbered([{ text: "Ship the first official Payment Profile. ", bold: true }, "Limited scope: quote binding, idempotency, basic authorization rules."]));
content.push(numbered([{ text: "Defer the Dispute Profile ", bold: true }, "until after the first real deployments inform it."]));
content.push(numbered([{ text: "Mandate grammar v0.2 ", bold: true }, "only after pilot data justifies it (likely targets: recurring subscriptions, frequency limits, dynamic-pricing nuances)."]));

// ========== Section 14: Conclusion ==========
content.push(H1("Conclusion", "14"));
content.push(P("Agentic commerce needs a common layer for discovery, verification, and mandate. SAM can become that common layer — on the condition that it gives up the illusion of being a total protocol."));
content.push(P("The right strategy is to define a core that is extremely clear, extremely credible, and extremely easy to deploy, then let the ecosystem extend it cleanly where value and maturity justify it. v2.1 locked the two decisions that made that promise serious — a single normative authentication profile and a small, closed mandate grammar. v2.2 holds the operator document to the same discipline, distinguishes proven facts from claims awaiting their mechanism, assumes the austerity of v0.1, and forbids fail-open on revocation."));
content.push(Pmix([
  "In v2.2, SAM is interoperability infrastructure for the agent era: simple to publish, simple to read, hard to misuse, time-bounded by design, and flexible enough to coexist with the stacks that already matter. ",
  { text: "Merchant-ready. Agent-ready. Bounded autonomy.", bold: true, color: BLUE },
]));

// ========== Appendix ==========
content.push(H1("Appendix A — Changes from v2.0 and v2.1", "A"));
content.push(H3("From v2.0 to v2.1"));
content.push(bullet("Locked the agent authentication profile (RFC 9421 + ed25519)."));
content.push(bullet("Locked the mandate grammar v0.1 (eight closed primitives, AND-only)."));
content.push(bullet("Elevated the freshness rule to a constitutional security rule."));
content.push(bullet("Unified narrative wording around merchant-ready / agent-ready / bounded autonomy."));
content.push(bullet("Explicit prohibition of autonomous economic action below L2."));
content.push(H3("From v2.1 to v2.2"));
content.push(bullet("Operator document elevated to a first-order normative object (§5.5.1)."));
content.push(bullet("Honest distinction between proof and claim in §5.5: operator identity and mandate adherence are cryptographically proven; user delegation is a claim whose mechanism is an explicit objective."));
content.push(bullet("Austerity of mandate grammar v0.1 explicitly assumed in §5.4."));
content.push(bullet("Revocation operationalized in §5.3 with explicit no-fail-open rule."));
content.push(bullet('Slogan tightened to "Verify continuously, execute safely within bounds."'));

// ---------- Build document ----------
const doc = new Document({
  creator: "SAM Protocol Working Group",
  title: "SAM Protocol White Paper v1.0",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "000000" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: BLUE_LIGHT },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: { default: pageHeader },
    footers: { default: pageFooter },
    children: content,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/sessions/peaceful-wizardly-cori/mnt/SAM-PROTOCOL/SAM_Protocol_WhitePaper_v1_0_EN.docx", buf);
  console.log("OK");
});
