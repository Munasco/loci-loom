# Architecture

## Product layers

- `apps/mobile/App.tsx`: the complete judge flow and visual system.
- `apps/mobile/src/domain/`: pure trail and billing contracts with Jest tests.
- `apps/mobile/src/services/`: the RevenueCat production adapter.
- `apps/ai-api/`: server-side Nemotron generation, schema validation, and pure HTTP handler.
- `apps/video/src/scenes/`: five independently previewable Remotion scenes.
- `apps/video/src/DemoVideo.tsx`: the 54-second transition timeline.
- `submission/`: exact-dimension store art and Devpost copy.

## External boundaries

`TrailGenerator` selects a deterministic, free provider for the judge demo or an HTTP provider when `EXPO_PUBLIC_TRAIL_API_URL` is configured. The server keeps `NEBIUS_API_KEY` private, calls Nemotron on Token Factory, validates exactly five scenes with Zod, and refuses malformed model output.

`BillingGateway` isolates RevenueCat. Production native builds use `react-native-purchases`; tests and the public judge preview use a clearly disclosed in-memory adapter.

The persistence boundary is the next product increment; AsyncStorage is installed but deliberately not presented as finished.

## Quality gates

The current release passes strict TypeScript, three Jest tests, a production web export, an automated full-flow browser walkthrough at 393×852, Remotion lint and compilation, full MP4 rendering, and an FFmpeg decode check.
