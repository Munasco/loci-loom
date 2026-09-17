# Hackathon strategy — 17 September 2026

The objective is one excellent product with three credible integrations, not three unrelated prototypes. RevenueCat is the first submission; Nebius and Alexa+ extend the same learner identity, trail, and recall model.

| Priority | Track | Top cash | Deadline | Two-day feasibility | Integration risk | Decision |
| --- | --- | ---: | --- | --- | --- | --- |
| 1 | RevenueCat Shipaton — Next Gen student | $20,000 | Sep 30, 11:45 PM PDT | High | Low–medium | Ship first |
| 2 | Nebius x NVIDIA — Apps and Agents | $20,000 | Oct 30, 10:00 AM PDT | Medium | Medium | Add real AI generation next |
| 3 | Amazon — Alexa+ | $25,000 | Oct 23, noon PDT | Medium–low | High | Build only after the first submission is stable |

Official sources: [RevenueCat rules](https://revenuecat-shipaton-2026.devpost.com/rules), [Nebius hackathon](https://nebiusglobalaihackathon.devpost.com/), [Amazon Build, Ship, Shape](https://amazonappdev2026.devpost.com/).

## 1. RevenueCat: Loci Loom Scholar Pass

Why it is the best first bet:

- The student track accepts a public repository and short demo without requiring a paid Apple or Google developer account.
- Monetization is central to the product: free discovery, then unlimited trails and adaptive review.
- The native SDK is already isolated behind a tested `BillingGateway`; only account configuration and a sandbox-device purchase remain.
- A 54-second, 1080p Remotion video and exact-dimension artwork are already rendered.

Definition of done: configure the Test Store, `scholar` entitlement, and annual offering; prove purchase and restore on a development build; publish the repository and public video; submit the Devpost draft.

## 2. Nebius: adaptive mnemonic intelligence

Implemented foundation: an opt-in mobile `TrailGenerator` calls a server-side Nemotron client on Nebius Token Factory. The key stays off-device, all output is schema-validated, malformed responses are rejected, and the complete network boundary is tested without spending credits. The next pass adds a second evaluator that scores distinctiveness, causal accuracy, and visual contrast; recall history will adjust the next trail and produce an explainable “memory strength” trace.

Why this is the next build: it raises technical depth without changing the polished client. The interface boundary is already clear; fixtures keep generation tests deterministic while a recorded integration test proves the hosted model path.

No-cost plan: use official hackathon credits only. Do not add a paid card or enable a billable deployment without explicit approval. Fall back to a small local fixture when credits are unavailable, and label that state honestly.

## 3. Alexa+: a daily recall companion

Extension: expose `get_due_trails`, `start_recall`, and `record_answer` through an Agent Skill or MCP server. Alexa conducts a two-minute voice walk, gives one hint tied to the original location, and syncs the result to the learner’s trail.

Why it waits: the prize ceiling is attractive, but actual device/simulator integration and stateful voice QA add more failure modes than the RevenueCat submission. Build it after the mobile data contract and hosted generation path are stable. Keep a friction log because Amazon judging can reward useful platform feedback.

## Next 24 hours

1. Authenticate GitHub as `Munasco`, publish the tested repository, and verify the public license and README.
2. Configure RevenueCat Test Store and entitlement; record a successful native purchase and restore.
3. Regenerate product screenshots from the configured build and add a clear Test Store proof moment to the video.
4. Upload the video publicly and finish the Devpost draft without submitting until final review.
5. If the primary submission is fully proven, create the Nebius adapter and contract tests.
