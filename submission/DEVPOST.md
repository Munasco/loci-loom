# Loci Loom — Devpost draft

## One-line pitch

Turn anything you study into a world you can walk through.

## Inspiration

Students spend hours rereading because it feels fluent, but fluency is not recall. Memory-palace techniques work because they give abstract ideas a place, an image, and a route. Loci Loom makes that technique immediate: enter a topic, walk through five vivid stops, then retrieve the ideas before the trail fades.

## What it does

Loci Loom turns a subject into a five-stop visual memory trail. Each stop binds one concept to a distinctive location and memory anchor. A short recall round follows the walk. Free learners can save three trails; Scholar Pass adds unlimited trails, adaptive practice, visual themes, and voice-guided review.

## How it was built

The mobile client uses Expo, React Native, and strict TypeScript. Domain logic is deterministic and independently tested so the public demo is fast and reliable. RevenueCat is isolated behind a typed billing gateway: the production adapter loads offerings, purchases the annual package, checks the `scholar` entitlement, and restores purchases; a clearly labelled demo adapter keeps local judging possible without impersonating a live store. The 54-second product film is generated with Remotion from real, smoke-tested app screens.

## Challenges

The hardest product decision was balancing wonder with learning clarity. Each trail needed to feel cinematic without burying the concept. Technically, the purchase flow also needed to remain honest when native store credentials were absent, so billing was designed as an external boundary rather than scattered UI state.

## Accomplishments

- A complete create → trail → recall → paywall journey.
- A distinctive visual system designed for mobile, not a dashboard template.
- A real RevenueCat SDK integration with entitlement and restoration logic.
- Automated domain tests, strict compilation, production export, and browser-level flow verification.
- A reproducible Remotion demo video under the two-minute limit.

## What is next

Nebius-hosted Nemotron generation can replace the deterministic trail provider and evaluate mnemonic quality. An Alexa+ skill can turn each trail into a hands-free daily recall session while preserving progress across devices.
