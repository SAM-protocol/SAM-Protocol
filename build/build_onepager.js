// Build SAM Normative One-Pager in V1 visual style
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, TabStopType,
} = require('docx');

const BLUE = "1F4E79", BLUE_LIGHT = "2E75B6", BLUE_BG = "EAF2FA", GRAY = "808080";
const BORDER = { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

const runs = parts => parts.map(p => new TextRun(typeof p === 'string' ? { text: p } : p));
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 100, line: 280 }, alignment: o.alignment, children: [new TextRun({ text: t, bold: o.bold, italics: o.italics, color: o.color, size: o.size, font: o.font })] });
const Pmix = (parts, o = {}) => new Paragraph({ spacing: { after: o.after ?? 100, line: 280 }, alignment: o.alignment, children: runs(parts) });
const H1 = (t, n) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 140 }, children: [new TextRun({ text: n ? `${n}. ${t}` : t, bold: true, color: BLUE, size: 28, font: "Arial" })] });
const bullet = t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60, line: 260 }, children: runs(Array.isArray(t) ? t : [t]) });

function callout(title, body) {
  const kids = [];
  if (title) kids.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: title, bold: true, color: BLUE, size: 22, font: "Arial" })] }));
  kids.push(...body);
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: BLUE_BG, type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 200, right: 200 },
      children: kids,
    })] })],
  });
}

function dataTable(headers, rows, widths) {
  const total = 9360;
  const cw = widths || headers.map(() => Math.floor(total / headers.length));
  const b = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const bs = { top: b, bottom: b, left: b, right: b };
  const hRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
    width: { size: cw[i], type: WidthType.DXA }, borders: bs,
    shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: BLUE, size: 18, font: "Arial" })] })],
  })) });
  const dRows = rows.map(r => new TableRow({ children: r.map((c, i) => new TableCell({
    width: { size: cw[i], type: WidthType.DXA }, borders: bs,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: "Arial" })] })],
  })) }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: cw, rows: [hRow, ...dRows] });
}

const header = new Header({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT, space: 4 } },
  children: [
    new TextRun({ text: "SAM Protocol", bold: true, color: BLUE_LIGHT, font: "Arial", size: 22 }),
    new TextRun({ text: "  -  Normative One-Pager v1.0", color: "000000", font: "Arial", size: 22 }),
    new TextRun({ text: "\t", font: "Arial" }),
    new TextRun({ text: "draft-sam-protocol-01  |  April 2026", italics: true, font: "Arial", size: 22 }),
  ],
})] });

const footer = new Footer({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT, space: 4 } },
  children: [
    new TextRun({ text: "sam-protocol.org  |  github.com/sam-protocol", color: BLUE_LIGHT, font: "Arial", size: 20 }),
    new TextRun({ text: "\t", font: "Arial" }),
    new TextRun({ text: "p. ", italics: true, color: GRAY, font: "Arial", size: 20 }),
    new TextRun({ children: [PageNumber.CURRENT], italics: true, color: GRAY, font: "Arial", size: 20 }),
  ],
})] });

const c = [];
// Title
c.push(new Paragraph({ spacing: { before: 400, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPEN STANDARD  |  NORMATIVE COMPANION  |  APRIL 2026", bold: true, color: GRAY, size: 20, font: "Arial" })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "SAM PROTOCOL", bold: true, color: BLUE, size: 56, font: "Arial" })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Normative One-Pager", italics: true, color: BLUE_LIGHT, size: 32, font: "Arial" })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: "Companion to White Paper v1.0", italics: true, size: 22, font: "Arial" })] }));

c.push(callout(null, [
  Pmix([{ text: "What an implementer must do to be SAM-conformant. ", bold: true }, "The white paper explains the why; this page states the what. Keywords MUST, SHOULD, MAY follow RFC 2119."]),
]));

c.push(H1("Discovery", "1"));
c.push(bullet([{ text: "A SAM-conformant merchant ", }, { text: "MUST", bold: true }, { text: " publish a single sam.json document at the canonical well-known location: " }, { text: "https://<merchant-domain>/.well-known/sam.json", font: "Courier New" }]));
c.push(bullet([{ text: "The document " }, { text: "MUST", bold: true }, { text: " be served over HTTPS." }]));
c.push(bullet([{ text: "The document " }, { text: "MUST", bold: true }, { text: " declare a " }, { text: "sam:version", font: "Courier New" }, { text: " field matching a published schema version." }]));

c.push(H1("Core Blocks (six, no more, no less)", "2"));
c.push(dataTable(
  ["Block", "Requirement"],
  [
    ["sam:version", "MUST — schema version string"],
    ["sam:capabilities", "MUST — list of supported actions and the protocol(s) used to invoke each"],
    ["sam:identity", "MUST — merchant identity bound to the serving domain"],
    ["sam:signature", "MUST — cryptographic signature over the canonicalized document"],
    ["sam:mandate", "MUST — autonomous-execution rules expressed in the normative mandate grammar (see §5)"],
    ["sam:agentAuth", "MUST — declared agent-authentication profile (see §4)"],
    ["sam:human", "MUST — at least one structured human-escalation channel"],
  ],
  [2600, 6760],
));
c.push(P(""));
c.push(Pmix(["Extension profiles ", { text: "MUST", bold: true }, " namespace their fields (e.g. ", { text: "sam.payment:*", font: "Courier New" }, "). No other top-level blocks are part of the core."]));

c.push(H1("Identity, Signature, and Freshness", "3"));
c.push(bullet([{ text: "The signature " }, { text: "MUST", bold: true }, { text: " cover a canonicalized form of the entire document, using " }, { text: "ed25519", font: "Courier New" }, { text: "." }]));
c.push(bullet([{ text: "Merchants " }, { text: "MUST", bold: true }, { text: " keep their root key offline and " }, { text: "SHOULD", bold: true }, { text: " sign production manifests with a short-lived delegated session key." }]));
c.push(bullet([{ text: "Every signed manifest " }, { text: "MUST", bold: true }, { text: " declare a " }, { text: "validUntil", font: "Courier New" }, { text: " timestamp (TTL)." }]));
c.push(callout("Constitutional freshness rule", [
  Pmix([{ text: "A SAM manifest is valid only within a bounded freshness window. Agents ", bold: true }, { text: "MUST", bold: true }, { text: " revalidate signed manifests after the declared TTL, and ", bold: true }, { text: "MUST", bold: true }, { text: " treat revocation signals as higher priority than cached validity.", bold: true }]),
]));
c.push(Pmix(["Revocation operates in two modes: ", { text: "baseline", bold: true }, " (re-published manifest with shortened ", { text: "validUntil", font: "Courier New" }, ") and ", { text: "assisted", bold: true }, " (registry signal). ", { text: "If the revocation source is unreachable and the TTL has expired, the agent MUST refuse to act. SAM never fails open.", bold: true }]));

c.push(H1("Agent Authentication — normative profile", "4"));
c.push(bullet([{ text: "SAM defines agent authentication via " }, { text: "HTTP Message Signatures (RFC 9421)", bold: true }, { text: ". Conformant merchants " }, { text: "MUST", bold: true }, { text: " support it for sensitive operations." }]));
c.push(bullet([{ text: "The signature algorithm " }, { text: "MUST", bold: true }, { text: " be " }, { text: "ed25519", font: "Courier New" }, { text: ". " }, { text: "ecdsa-p256-sha256", font: "Courier New" }, { text: " is tolerated as a transition algorithm. " }, { text: "No other algorithm is permitted.", bold: true }]));
c.push(bullet([{ text: "The covered components set " }, { text: "MUST", bold: true }, { text: " include: " }, { text: "@method, @target-uri, @authority, content-digest, sam-mandate-ref, sam-operator, sam-user-context, and created", font: "Courier New" }, { text: "." }]));
c.push(bullet([{ text: "Operator public keys " }, { text: "MUST", bold: true }, { text: " be resolvable via " }, { text: "https://<operator-domain>/.well-known/sam-operator.json", font: "Courier New" }, { text: ". The operator document is held to the " }, { text: "same discipline", bold: true }, { text: " as sam.json: HTTPS, ed25519 signature, mandatory validUntil, freshness rule of §3, declared conformance level. Operators below L2-equivalent " }, { text: "MUST NOT", bold: true }, { text: " be used for autonomous economic action." }]));
c.push(bullet([{ text: "Each authenticated request carries a cryptographic " }, { text: "proof of operator identity", bold: true }, { text: ", a cryptographic " }, { text: "proof of mandate adherence", bold: true }, { text: " (sam-mandate-ref covered by the signature), and an integrity-protected " }, { text: "claim of user delegation", bold: true }, { text: " (sam-user-context). Cryptographic proof of user delegation is an explicit objective of the spec, not a property of v0.1." }]));
c.push(bullet([{ text: "Deviations are permitted only through " }, { text: "explicitly scoped exception profiles", bold: true }, { text: ", each justified by a constraint the mainstream profile cannot satisfy. Exception profiles are " }, { text: "not alternatives", bold: true }, { text: "; they are documented exceptions." }]));

c.push(H1("Mandate Grammar v0.1 — normative, closed, eight primitives", "5"));
c.push(dataTable(
  ["Primitive", "Type", "Semantics"],
  [
    ["autoExecute", "boolean", "If false, no autonomous action permitted"],
    ["maxAmount", "{value, currency, inclusiveOfTaxes, inclusiveOfShipping}", "All four fields required"],
    ["maxPriceDrift", "{percent, reference: \"quote\"|\"catalog\"}", "Tolerated drift between quote and order"],
    ["allowedCategories", "string[] (closed SAM taxonomy)", "Whitelist; absent = no constraint"],
    ["deniedCategories", "string[] (closed SAM taxonomy)", "Blacklist; evaluated after whitelist"],
    ["allowedRegions", "string[] (ISO 3166-1 alpha-2)", "Permitted jurisdictions"],
    ["validityWindow", "{notBefore, notAfter} (ISO 8601)", "Mandatory"],
    ["agentClass", "\"retail\" | \"business\" | \"any\"", "Permitted agent type"],
  ],
  [1800, 3780, 3780],
));
c.push(P(""));
c.push(P("Evaluation rules (normative):", { bold: true }));
c.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: runs([{ text: "The mandate " }, { text: "MUST", bold: true }, { text: " be evaluated " }, { text: "locally", bold: true }, { text: " by the agent before any autonomous action. " }, { text: "No network call", bold: true }, { text: " during evaluation." }]) }));
c.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: runs([{ text: "Evaluation is a strict " }, { text: "AND", bold: true }, { text: ". One failed primitive = action refused, escalation via " }, { text: "sam:human", font: "Courier New" }, { text: "." }]) }));
c.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: runs([{ text: "Absence of a primitive means \"no constraint on that axis\", except " }, { text: "validityWindow", font: "Courier New" }, { text: " which is mandatory." }]) }));
c.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: runs([{ text: "The grammar is versioned as a whole. An agent that does not support the declared " }, { text: "grammarVersion", font: "Courier New" }, { text: " " }, { text: "MUST", bold: true }, { text: " refuse to act. " }, { text: "No best-effort on unknown versions.", bold: true }]) }));
c.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: runs([{ text: "The category taxonomy and region codes are " }, { text: "closed and versioned with the grammar", bold: true }, { text: ". Adding a category requires a version bump." }]) }));
c.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: runs([{ text: "The grammar contains " }, { text: "no OR, no conditional, no free fields, no extensions", bold: true }, { text: ". Extending requires a new grammar version." }]) }));

c.push(H1("Human Escalation", "6"));
c.push(bullet([{ text: "The " }, { text: "sam:human", font: "Courier New" }, { text: " block " }, { text: "MUST", bold: true }, { text: " provide at least one channel reachable without further discovery." }]));
c.push(bullet([{ text: "Escalation " }, { text: "MUST", bold: true }, { text: " be triggered when: the mandate forbids the action, agent authentication fails, the manifest is stale or revoked, or merchant policy requires human validation." }]));

c.push(H1("Conformance Levels", "7"));
c.push(dataTable(
  ["Level", "Required blocks", "Claim"],
  [
    ["L0 — Discovery", "version, capabilities, human", "merchant-ready"],
    ["L1 — Verification", "L0 + identity, signature", "agent-ready"],
    ["L2 — Bounded execution", "L1 + mandate, agentAuth", "bounded autonomy"],
  ],
  [2600, 4160, 2600],
));
c.push(P(""));
c.push(Pmix(["A merchant ", { text: "MUST", bold: true }, " declare its conformance level. Agents ", { text: "MUST NOT", bold: true }, " perform autonomous economic actions against a merchant below L2."]));

c.push(H1("Five Constitutional Rules", "8"));
c.push(callout(null, [
  Pmix([{ text: "1. No autonomy without proof.", bold: true }]),
  Pmix([{ text: "2. No proof without signature.", bold: true }]),
  Pmix([{ text: "3. No execution without bounds.", bold: true }]),
  Pmix([{ text: "4. No bounds without local enforcement.", bold: true }]),
  Pmix([{ text: "5. No signature is valid forever — only within its declared freshness window.", bold: true }]),
]));

c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "SAM Protocol — Normative One-Pager — companion to White Paper v1.0", italics: true, color: GRAY, size: 20, font: "Arial" })] }));

const doc = new Document({
  styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: header },
    footers: { default: footer },
    children: c,
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync("/sessions/peaceful-wizardly-cori/mnt/SAM-PROTOCOL/SAM_Protocol_Normative_OnePager.docx", b); console.log("OK onepager"); });
