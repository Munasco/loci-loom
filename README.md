# Loci Loom

Turn anything you study into a world you can walk through.

Loci Loom is an Expo learning game that converts a subject into five visual memory stops, then tests retrieval. A free learner can create three trails; Scholar Pass unlocks unlimited trails, adaptive recall, and voice review through a RevenueCat entitlement.

## What is working

- Polished mobile flow: home → topic → five-stop trail → recall → paywall.
- Deterministic trail generation for a reliable, offline judge demo.
- RevenueCat SDK adapter for offerings, purchases, entitlement checks, and restoration.
- Server-side Nebius Nemotron adapter with strict output validation and an opt-in mobile HTTP client.
- Explicit demo billing adapter when no public SDK key is configured.
- Seventeen mobile and AI-service tests, strict TypeScript, compiled web output, and a reproducible full browser smoke test.
- A tested 54-second Remotion submission video with a no-credit neural voiceover, built from real product screenshots. [Play the compatible MP4](submission/loci-loom-demo.mp4).

## Run the app

Requirements: Node.js 22.13 or later.

```bash
cd apps/mobile
npm install
npm run web
```

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

The browser smoke tests cover topic entry, generation, all trail stops, recall selection, paywall arrival, the saved-trail library, and real MP4 playback and seeking in Chrome. Store artwork is in `submission/`.

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
