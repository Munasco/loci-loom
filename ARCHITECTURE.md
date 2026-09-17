# Architecture

## Product layers

- `apps/mobile/App.tsx`: the complete judge flow and visual system.
- `apps/mobile/src/domain/`: pure trail and billing contracts with Jest tests.
- `apps/mobile/src/services/`: the RevenueCat production adapter.
- `apps/video/src/scenes/`: five independently previewable Remotion scenes.
- `apps/video/src/DemoVideo.tsx`: the 54-second transition timeline.
- `submission/`: exact-dimension store art and Devpost copy.

## External boundaries

`generateTrail` is deterministic, free, and testable for the judge demo. A later `TrailGenerator` interface will allow a `NemotronTrailGenerator` to replace it without changing the UI.

`BillingGateway` isolates RevenueCat. Production native builds use `react-native-purchases`; tests and the public judge preview use a clearly disclosed in-memory adapter.

The persistence boundary is the next product increment; AsyncStorage is installed but deliberately not presented as finished.

## Quality gates

The current release passes strict TypeScript, three Jest tests, a production web export, an automated full-flow browser walkthrough at 393×852, Remotion lint and compilation, full MP4 rendering, and an FFmpeg decode check.
