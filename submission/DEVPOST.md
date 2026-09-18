# Loci Loom — Devpost draft

## One-line pitch

Turn anything you study into a world you can walk through.

## Inspiration

Rereading can make a page feel familiar without making its ideas retrievable. Memory-palace techniques solve a different problem: they bind abstract information to a stable place, a striking image, and an ordered route. Loci Loom makes that method immediate enough to use between lectures instead of treating it as a separate skill to master.

## What it does

Enter a subject or paste source notes. Loci Loom creates five linked landmarks, lays them out on a reusable palace map, and turns each concept into a place, image, and mnemonic story. After the walk, three prompts test different retrieval paths: the idea itself, where it lived, and what came next. The first answer is locked, recall accuracy is persisted, and the next review is scheduled sooner for weak routes and later for strong ones.

The bundled starter trail is free, and learners can create three more. Scholar Pass opens unlimited trails and deeper adaptive practice.

## How it was built

The client is one Expo + React Native + TypeScript codebase, currently shipped and tested on the web while remaining ready for iOS and Android. `react-native-svg` renders the spatial route, AsyncStorage preserves validated trails and review history, and the learning logic stays separate from the interface.

The generation service prefers NVIDIA Nemotron through Nebius Token Factory and can use an OpenAI fallback. It keeps credentials server-side, supports source-grounded notes, handles browser CORS, enforces timeouts, and rejects malformed model output with Zod before it can enter the app.

RevenueCat sits behind a typed billing boundary. Native builds load offerings, purchase the annual package, inspect the `scholar` entitlement, and restore access; the web judge build clearly identifies its interactive demo entitlement. The 49.5-second Remotion film embeds a recording of the working app rather than a fabricated prototype.

## Challenges

The hardest product decision was making the palace spatial rather than decorative. Five attractive cards would have been easier, but they would not create a route the learner could mentally revisit. That led to fixed landmarks, ordered path recall, and review intervals driven by what the learner actually retrieved. The other challenge was keeping an AI demo reliable: curated trails provide a zero-network path, while arbitrary topics still pass through the same strict domain schema.

## Accomplishments

- A complete notes → map → trail → three-part recall → scheduled-review journey.
- A memorable spatial interface designed for small screens, not a dashboard template.
- Live source-grounded generation with schema validation and a deterministic judge fallback.
- A real RevenueCat SDK integration with entitlement and restoration logic.
- 26 automated tests, strict compilation, Expo Doctor, production export, and two browser-level product walkthroughs.
- A reproducible, browser-playback-tested Remotion demo under the two-minute limit.

## What is next

Next I would add model-based mnemonic-quality evaluation, learner-authored landmark sets, and cross-device review sync. A later Alexa+ skill could conduct hands-free daily recall while preserving the same route and progress across devices.
