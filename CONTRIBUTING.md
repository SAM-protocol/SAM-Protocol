# Contributing to SAM Protocol

Thanks for your interest in SAM. This is an **open standard**, and the only way it becomes useful is if real merchants, real agent builders, and real reviewers push it against reality.

## How to contribute

### Issues

Open an issue for any of the following:

- **Ambiguity** in the normative text — MUST/SHOULD/MAY that is not crisp enough to implement
- **Bugs** in the reference snippets of the Technical Appendix
- **Interoperability concerns** — cases where two honest implementations could disagree
- **Missing edge cases** — especially in canonicalization, amount normalization, replay protection, and the operator document trust model (the five open issues tracked in section F of the Technical Appendix)
- **Typos, broken links, formatting**

### Discussions

Use Discussions for:

- Design questions ("why not X instead of Y?")
- Pilot feedback ("here's what we learned deploying SAM at <merchant>")
- Proposals for extension profiles (`sam.payment:*`, `sam.dispute:*`, `sam.catalog:*`, etc.)

### Pull requests

PRs are welcome on:

- The **Markdown source** of the documents (in `docs/`)
- The **reference code snippets** (Technical Appendix)
- The **example files** (`examples/sam.json`)
- The **build scripts** (`build/`)

For substantive changes to the normative text, please open an issue first so the design trade-off can be discussed before a PR lands.

## Review principles

Every change is reviewed against four questions:

1. **Does it preserve austerity?** SAM v1.0 is deliberately minimal. New primitives, fields, or extension points require strong justification.
2. **Does it keep local evaluation possible?** The mandate is evaluated client-side with no network call. Anything that breaks this is a design regression.
3. **Does it preserve the no-fail-open rule?** If a change makes it possible for an agent to act when a trust signal is unreachable, it is a security regression.
4. **Does it help or hurt adoption?** SAM's core promise is that a merchant can become L2-conformant in an afternoon. Changes that add implementation friction need to earn their keep.

## Versioning

- **Major versions** (`draft-sam-protocol-0X`) lock technical decisions and may break wire compatibility.
- **Minor versions** may add normative profiles or clarify ambiguity without breaking conformance.
- The **mandate grammar** is versioned as a whole (`grammarVersion`). Adding a primitive requires a version bump. Agents that do not support the declared grammar version MUST refuse to act.

## Code of conduct

Be honest, be specific, be kind. Disagreement on design is welcome; personal attacks and bad-faith arguments are not.

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
