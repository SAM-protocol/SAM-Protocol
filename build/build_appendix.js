// Build SAM Technical Appendix in V1 visual style
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, TabStopType,
} = require('docx');

const BLUE = "1F4E79", BLUE_LIGHT = "2E75B6", BLUE_BG = "EAF2FA", CODE_BG = "F4F4F4", GRAY = "808080";
const BORDER = { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT };
const CODE_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

const runs = parts => parts.map(p => new TextRun(typeof p === 'string' ? { text: p } : p));
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, line: 300 }, alignment: o.alignment, children: [new TextRun({ text: t, bold: o.bold, italics: o.italics, color: o.color, size: o.size, font: o.font })] });
const Pmix = (parts, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, line: 300 }, alignment: o.alignment, children: runs(parts) });
const H1 = (t, n) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 }, children: [new TextRun({ text: n ? `${n}. ${t}` : t, bold: true, color: BLUE, size: 30, font: "Arial" })] });
const bullet = t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80, line: 280 }, children: runs(Array.isArray(t) ? t : [t]) });

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

// Code block = single-cell table with gray border, light gray bg, Courier font
function codeBlock(code) {
  const lines = code.split('\n');
  const kids = lines.map(line => new Paragraph({
    spacing: { after: 0, line: 260 },
    children: [new TextRun({ text: line || " ", font: "Courier New", size: 18 })],
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    borders: { top: CODE_BORDER, bottom: CODE_BORDER, left: CODE_BORDER, right: CODE_BORDER, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: CODE_BG, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 180, right: 180 },
      children: kids,
    })] })],
  });
}

const header = new Header({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE_LIGHT, space: 4 } },
  children: [
    new TextRun({ text: "SAM Protocol", bold: true, color: BLUE_LIGHT, font: "Arial", size: 22 }),
    new TextRun({ text: "  -  Technical Appendix", color: "000000", font: "Arial", size: 22 }),
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
c.push(new Paragraph({ spacing: { before: 400, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPEN STANDARD  |  IMPLEMENTATION GUIDE  |  APRIL 2026", bold: true, color: GRAY, size: 20, font: "Arial" })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "SAM PROTOCOL", bold: true, color: BLUE, size: 56, font: "Arial" })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Technical Appendix", italics: true, color: BLUE_LIGHT, size: 32, font: "Arial" })] }));
c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: "Companion to White Paper v1.0 — Implementation Snippets", italics: true, size: 22, font: "Arial" })] }));

c.push(callout(null, [
  Pmix([{ text: "A handful of pages. Just enough code to start a pilot. ", bold: true }, "Python is used for clarity; equivalent libraries exist in Go, Node, Rust."]),
]));

c.push(H1("A minimal sam.json (Level 2)", "A"));
c.push(codeBlock(`{
  "sam:version": "1.0",
  "sam:identity": {
    "domain": "shop.example.com",
    "legalName": "Example Retail SAS",
    "jurisdiction": "FR"
  },
  "sam:capabilities": [
    { "action": "browse_catalog", "protocol": "rest", "endpoint": "/api/catalog" },
    { "action": "get_quote",      "protocol": "rest", "endpoint": "/api/quote" },
    { "action": "place_order",    "protocol": "rest", "endpoint": "/api/order" },
    { "action": "track_order",    "protocol": "rest", "endpoint": "/api/order/{id}" }
  ],
  "sam:mandate": {
    "grammarVersion": "0.1",
    "autoExecute": true,
    "maxAmount": {
      "value": 500,
      "currency": "EUR",
      "inclusiveOfTaxes": true,
      "inclusiveOfShipping": true
    },
    "maxPriceDrift": { "percent": 2, "reference": "quote" },
    "allowedCategories": ["consumer.electronics", "consumer.books"],
    "allowedRegions": ["FR", "BE", "LU"],
    "validityWindow": {
      "notBefore": "2026-04-07T00:00:00Z",
      "notAfter":  "2026-05-07T00:00:00Z"
    },
    "agentClass": "retail"
  },
  "sam:agentAuth": {
    "profile": "rfc9421",
    "algorithm": "ed25519",
    "requiredComponents": [
      "@method", "@target-uri", "@authority",
      "content-digest", "sam-mandate-ref",
      "sam-operator", "sam-user-context", "created"
    ]
  },
  "sam:human": {
    "channels": [
      { "type": "email", "value": "agents@shop.example.com" },
      { "type": "https", "value": "https://shop.example.com/agent-escalation" }
    ]
  },
  "sam:signature": {
    "algorithm": "ed25519",
    "sessionKeyId": "shop.example.com/keys/2026-04",
    "validUntil": "2026-04-14T00:00:00Z",
    "value": "base64(...)"
  }
}`));

c.push(H1("Verifying the manifest signature (agent side)", "B"));
c.push(codeBlock(`import json, base64
from datetime import datetime, timezone
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

def verify_sam_manifest(raw: bytes, public_key_b64: str) -> dict:
    doc = json.loads(raw)
    sig = doc.pop("sam:signature")

    # 1. Check freshness — Constitutional rule #5
    valid_until = datetime.fromisoformat(sig["validUntil"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > valid_until:
        raise ValueError("Manifest expired — MUST re-fetch")

    # 2. Canonicalize and verify ed25519 signature
    canonical = json.dumps(doc, sort_keys=True, separators=(",", ":")).encode()
    try:
        VerifyKey(base64.b64decode(public_key_b64)).verify(
            canonical, base64.b64decode(sig["value"])
        )
    except BadSignatureError:
        raise ValueError("Invalid signature")

    return doc`));

c.push(H1("Evaluating the mandate (client-side, no network call)", "C"));
c.push(codeBlock(`from datetime import datetime, timezone

class MandateViolation(Exception): pass

def evaluate_mandate(mandate: dict, action: dict) -> None:
    """Raises MandateViolation on any failed primitive. AND-only."""
    if mandate.get("grammarVersion") != "0.1":
        raise MandateViolation("Unsupported grammar version — MUST refuse")

    if not mandate.get("autoExecute", False):
        raise MandateViolation("autoExecute=false")

    # validityWindow is mandatory
    vw = mandate["validityWindow"]
    now = datetime.now(timezone.utc)
    if not (datetime.fromisoformat(vw["notBefore"].replace("Z", "+00:00"))
            <= now <=
            datetime.fromisoformat(vw["notAfter"].replace("Z", "+00:00"))):
        raise MandateViolation("Outside validity window")

    # maxAmount — strict, with explicit inclusivity
    cap = mandate["maxAmount"]
    total = action["amount"]  # already normalized to cap inclusivity
    if action["currency"] != cap["currency"]:
        raise MandateViolation("Currency mismatch")
    if total > cap["value"]:
        raise MandateViolation(f"Amount {total} exceeds cap {cap['value']}")

    # Price drift
    drift = mandate.get("maxPriceDrift")
    if drift and action.get("priceDriftPercent", 0) > drift["percent"]:
        raise MandateViolation("Price drift exceeded")

    # Categories (whitelist then blacklist)
    allowed = mandate.get("allowedCategories")
    if allowed and action["category"] not in allowed:
        raise MandateViolation("Category not allowed")
    denied = mandate.get("deniedCategories", [])
    if action["category"] in denied:
        raise MandateViolation("Category denied")

    # Regions
    regions = mandate.get("allowedRegions")
    if regions and action["region"] not in regions:
        raise MandateViolation("Region not allowed")

    # Agent class
    ac = mandate.get("agentClass", "any")
    if ac != "any" and ac != action["agentClass"]:
        raise MandateViolation("Agent class mismatch")`));
c.push(Pmix([{ text: "Roughly 35 lines. No network. No state. ", italics: true }, { text: "Stateless evaluation is exactly what makes the mandate portable across agents.", italics: true, bold: true }]));

c.push(H1("Signing an outgoing request (RFC 9421, agent side)", "D"));
c.push(codeBlock(`import base64, hashlib, time
from nacl.signing import SigningKey

def sign_request(method, url, host, body, mandate_ref, operator, user_ctx, signing_key: SigningKey):
    digest = "sha-256=:" + base64.b64encode(hashlib.sha256(body).digest()).decode() + ":"
    created = int(time.time())

    # Covered components — exactly the set required by §4 of the One-Pager
    covered = (
        f'"@method": {method}\\n'
        f'"@target-uri": {url}\\n'
        f'"@authority": {host}\\n'
        f'"content-digest": {digest}\\n'
        f'"sam-mandate-ref": {mandate_ref}\\n'
        f'"sam-operator": {operator}\\n'
        f'"sam-user-context": {user_ctx}\\n'
        f'"@signature-params": ("@method" "@target-uri" "@authority" '
        f'"content-digest" "sam-mandate-ref" "sam-operator" "sam-user-context");'
        f'created={created};alg="ed25519"'
    )

    sig = signing_key.sign(covered.encode()).signature
    return {
        "Content-Digest": digest,
        "SAM-Mandate-Ref": mandate_ref,
        "SAM-Operator": operator,
        "SAM-User-Context": user_ctx,
        "Signature-Input": f'sam=("@method" "@target-uri" "@authority" '
                           f'"content-digest" "sam-mandate-ref" "sam-operator" '
                           f'"sam-user-context");created={created};alg="ed25519"',
        "Signature": f"sam=:{base64.b64encode(sig).decode()}:"
    }`));
c.push(P("The merchant-side verifier mirrors this: rebuild the covered string from the received headers, fetch the operator's public key from https://<operator-domain>/.well-known/sam-operator.json, and verify with ed25519."));

c.push(H1("Operator key resolution (merchant side)", "E"));
c.push(codeBlock(`import requests

def resolve_operator_key(operator_domain: str) -> str:
    """Returns base64 ed25519 public key for the operator."""
    url = f"https://{operator_domain}/.well-known/sam-operator.json"
    doc = requests.get(url, timeout=5).json()
    # The operator doc is itself signed; verify against its TLS-bound identity.
    # (Verification omitted for brevity — same pattern as verify_sam_manifest.)
    return doc["currentKey"]["publicKey"]`));
c.push(Pmix([{ text: "One mechanism. No DID resolution. No registry lookup. ", italics: true }, { text: "Exception profiles may add others, but they are exceptions — not alternatives.", italics: true, bold: true }]));

c.push(H1("Open issues for the normative spec", "F"));
c.push(P("These are the points where this appendix deliberately simplifies. Each one MUST be closed without ambiguity by the normative specification before SAM can be declared stable."));
c.push(bullet([{ text: "Canonicalization. ", bold: true }, "JSON canonical form must be defined exhaustively (number representation, Unicode normalization, escapes, ordering) and accompanied by a conformance test vector. The Python sort_keys idiom used here is illustrative, not normative."]));
c.push(bullet([{ text: "Amount normalization. ", bold: true }, "Who computes the value compared against maxAmount, when, and how — including taxes, shipping, discounts, coupons, bundles, variable fees, and partially unknown costs at quote time. The mandate evaluator assumes a normalized total; the spec must define the normalization rules."]));
c.push(bullet([{ text: "Operator document trust model. ", bold: true }, "sam-operator.json must be held to exactly the same discipline as sam.json: ed25519 signature over canonicalized form, mandatory validUntil, freshness rule of §3, no-fail-open revocation. TLS-bound identity is a transport-level check, not a substitute for the application-level proof."]));
c.push(bullet([{ text: "Replay protection and clock skew. ", bold: true }, "Acceptance window for created, optional nonce, merchant-side anti-replay strategy, and the exact relationship between created and the validity of the referenced sam-mandate-ref must all be specified."]));
c.push(bullet([{ text: "sam-user-context semantics. ", bold: true }, "The minimum set of claims must be closed: which fields are mandatory, which are forbidden, and which must be pseudonymized. Too poor and it proves nothing; too rich and it becomes a privacy and compliance liability."]));
c.push(P("These items are the next mile. They are not blockers for pilots; they are blockers for declaring v1.0 stable.", { italics: true }));

c.push(H1("What this appendix is not"));
c.push(bullet("It is not the formal spec. It omits canonicalization edge cases, error codes, retry semantics, replay protection details, and clock-skew tolerances."));
c.push(bullet("It is not a security audit. The code above is illustrative; production implementations must add input validation, timing-safe comparisons, and structured logging."));
c.push(bullet([{ text: "It is not exhaustive — but it is " }, { text: "enough to start a pilot in an afternoon", bold: true }, { text: ", which is the entire point." }]));

c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "SAM Protocol — Technical Appendix — companion to White Paper v1.0", italics: true, color: GRAY, size: 20, font: "Arial" })] }));

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

Packer.toBuffer(doc).then(b => { fs.writeFileSync("/sessions/peaceful-wizardly-cori/mnt/SAM-PROTOCOL/SAM_Protocol_Technical_Appendix.docx", b); console.log("OK appendix"); });
