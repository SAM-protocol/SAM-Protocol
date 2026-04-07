# Build scripts

These Node.js scripts generate the DOCX versions of the three SAM Protocol documents in the V1 IETF-style visual layout (blue accents, header/footer with borders, blue-bordered callouts, centered title block).

## Requirements

```bash
npm install docx
```

## Usage

From the repository root:

```bash
node build/build_wp.js          # → SAM_Protocol_WhitePaper_v1_0_EN.docx
node build/build_onepager.js    # → SAM_Protocol_Normative_OnePager.docx
node build/build_appendix.js    # → SAM_Protocol_Technical_Appendix.docx
```

Each script writes its output to `../mnt/SAM-PROTOCOL/` by default. Adjust the output paths at the bottom of each script to match your environment.

## Converting to PDF

Once the DOCX files are built, convert them with LibreOffice (headless):

```bash
soffice --headless --convert-to pdf SAM_Protocol_WhitePaper_v1_0_EN.docx
```

## Notes

These scripts are reference implementations of the V1 visual style, not part of the normative specification. The canonical source of the documents is the Markdown in `docs/`; the DOCX and PDF are generated artifacts.
