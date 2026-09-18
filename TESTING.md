# Test matrix

| Gate | Command / method | Result |
| --- | --- | --- |
| Type safety | `cd apps/mobile && npm run typecheck` | Pass |
| Mobile domain and adapters | `cd apps/mobile && npm test` | 6 suites, 17 tests pass |
| AI generation service | `cd apps/ai-api && npm run verify` | TypeScript and 9 HTTP/provider tests pass |
| Production bundle | `cd apps/mobile && npm run export:web` | Pass |
| Curated product smoke | `cd apps/mobile && npm run smoke:web` | Create → map → five stops → locked answer → adaptive result → paywall → persistence pass |
| Live-AI product smoke | `cd apps/mobile && npm run smoke:ai` | Arbitrary topic + source notes → validated model trail → map → first stop pass |
| Expo compatibility | `cd apps/mobile && npx expo-doctor` | 21/21 checks pass |
| Video source | `cd apps/video && npm run lint` | ESLint and TypeScript pass |
| Video frames | 4, 14, 27, and 42 seconds at 1920×1080 | Inspected, pass |
| Video render | `cd apps/video && npm run render` | 49.5 seconds, H.264, real app recording, regenerated narration |
| Video integrity | FFmpeg full decode | No errors |
| Browser video playback | `cd apps/mobile && npm run smoke:video` | Metadata, play, and duration-aware seeks pass in Chrome |
| Video production audit | `npm audit --omit=dev` | 0 vulnerabilities |
| AI API production audit | `npm audit --omit=dev` | 0 vulnerabilities |

## Device-only checks remaining

- Configure the RevenueCat Test Store, `scholar` entitlement, and annual package.
- Add `EXPO_PUBLIC_REVENUECAT_API_KEY` and run the checked-in EAS `development` build profile.
- Complete a sandbox purchase, entitlement refresh, cancellation, and restoration on iOS or Android.
- Confirm haptics and safe areas on physical hardware.

## Dependency note

Expo SDK 57 currently pulls `uuid <11.1.1` through its native `xcode` build tooling. npm reports a moderate buffer-bounds advisory and only proposes a breaking downgrade to Expo 46. No vulnerable API is called by the app runtime; the project records the finding and will take the upstream compatible update when available.
