# Loci Loom

Turn anything you need to remember into a world you can walk through.

Loci Loom is an Expo memory tool that converts a question, topic, or source material into five spatial memory stops, then tests retrieval from three angles. It works for professional concepts, personal knowledge, languages, and formal study. A free user can create three trails; Scholar Pass unlocks unlimited trails and deeper adaptive practice through a RevenueCat entitlement.

## What is working

- Polished responsive flow: home → topic or source notes → spatial map → five-stop trail → three-part recall → adaptive result.
- Deterministic curated demos plus live, schema-validated generation for arbitrary subjects.
- RevenueCat SDK adapter for offerings, purchases, entitlement checks, and restoration.
- Server-side Nebius Nemotron adapter, OpenAI fallback, request timeouts, CORS preflight, and strict output validation.
- Explicit demo billing adapter when no public SDK key is configured.
- Twenty-six mobile and AI-service tests, strict TypeScript, compiled web output, and reproducible browser smoke tests for both curated and live-AI paths.
- A tested 49.5-second Remotion submission video with a no-credit neural voiceover and a recording of the working product. [Play the compatible MP4](submission/loci-loom-demo.mp4).

## Run the app

Requirements: Node.js 22.13 or later.

```bash
cd apps/mobile
npm install
npm run web
```

To enable arbitrary-topic generation, run `apps/ai-api` with a server-side `NEBIUS_API_KEY` or `OPENAI_API_KEY`, then set `EXPO_PUBLIC_TRAIL_API_URL` in `apps/mobile/.env.local`. Curated subjects remain available without a model provider.

For the native RevenueCat path, copy `.env.example` to `.env.local`, add a public RevenueCat SDK key, and configure a `scholar` entitlement with an annual package. `expo-dev-client` and `apps/mobile/eas.json` provide the internal development-build profile required for native purchase testing; Expo Go cannot execute native purchases.

## Quality gates

```bash
# Run the complete source gate from the repository root
npm run verify

cd apps/mobile
npm run typecheck
npm test
npm run export:web

cd ../video
npm run lint
npm run render
```

The same type, unit, export, and Remotion-source gates run in GitHub Actions on every push and pull request. The browser smoke test stays in the local `verify` command because it targets the installed Chrome binary directly.

The browser smoke tests cover topic and source-note entry, schema-validated model generation, the spatial map, all trail stops, first-answer locking, adaptive scheduling, paywall arrival, persistence, and real MP4 playback and seeking in Chrome. Store artwork is in `submission/`.

## Structure

- `apps/mobile/` — Expo + React Native product.
- `apps/ai-api/` — Nebius Token Factory/Nemotron generation service.
- `apps/video/` — Remotion composition and verified MP4 source.
- `submission/` — store screenshot, icon, and submission copy.
- `TASK_BOARD.md` — live delivery and external-dependency checklist.

## Honest demo boundary

The app does not fake a configured store. Without `EXPO_PUBLIC_REVENUECAT_API_KEY`, the paywall visibly says “Demo purchase mode.” With a key, the same UI calls the RevenueCat SDK through `RevenueCatBillingGateway`.

## License

MIT
