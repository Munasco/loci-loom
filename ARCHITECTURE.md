# Architecture

## Product layers

- `apps/mobile/App.tsx`: the complete judge flow and visual system.
- `apps/mobile/src/domain/`: trail, spatial-recall, scheduling, validation, persistence, and billing contracts with Jest tests.
- `apps/mobile/src/services/`: validated HTTP generation, AsyncStorage persistence, and the RevenueCat production adapter.
- `apps/ai-api/`: server-side Nemotron/OpenAI generation, strict schemas, CORS, timeouts, and a pure HTTP handler.
- `apps/video/src/scenes/`: independently previewable Remotion scenes, including an embedded recording of the real app.
- `apps/video/src/DemoVideo.tsx`: the 49.5-second transition timeline.
- `submission/`: exact-dimension store art and Devpost copy.

## External boundaries

`TrailGenerator` keeps curated subjects deterministic for a reliable judge path and uses the HTTP provider for arbitrary topics or pasted notes when `EXPO_PUBLIC_TRAIL_API_URL` is configured. The server prefers Nemotron on Nebius Token Factory, falls back to OpenAI when configured, treats source notes as authoritative, validates exactly five scenes with Zod, and refuses malformed output.

`BillingGateway` isolates RevenueCat. Production native builds use `react-native-purchases`; tests and the public judge preview use a clearly disclosed in-memory adapter.

`AsyncTrailRepository` validates restored data before exposing it. Recall records the first submitted answer, persists accuracy and attempts, and schedules weak paths sooner than strong paths.

## Quality gates

The current release passes strict TypeScript, 26 automated tests, Expo Doctor's 21 checks, a production web export, curated and live-AI browser walkthroughs at 393×852, Remotion lint and compilation, Chrome playback/seek verification, and an FFmpeg decode check.
