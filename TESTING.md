# Test matrix

| Gate | Command / method | Result |
| --- | --- | --- |
| Type safety | `cd apps/mobile && npm run typecheck` | Pass |
| Domain and SDK-adapter tests | `cd apps/mobile && npm test` | 4 suites, 9 tests pass |
| Production bundle | `cd apps/mobile && npm run export:web` | Pass |
| Product smoke test | `cd apps/mobile && npm run smoke:web` | Home → create → five stops → recall → paywall → saved library pass |
| Video source | `cd apps/video && npm run lint` | ESLint and TypeScript pass |
| Video still | Frame 780 at 1920×1080 | Inspected, pass |
| Video render | `cd apps/video && npm run render` | 54.0 seconds, H.264 with measured 51.96-second voiceover |
| Video integrity | FFmpeg full decode | No errors |
| Video production audit | `npm audit --omit=dev` | 0 vulnerabilities |

## Device-only checks remaining

- Configure the RevenueCat Test Store, `scholar` entitlement, and annual package.
- Add `EXPO_PUBLIC_REVENUECAT_API_KEY` and run the checked-in EAS `development` build profile.
- Complete a sandbox purchase, entitlement refresh, cancellation, and restoration on iOS or Android.
- Confirm haptics, safe areas, and reduced-motion behavior on physical hardware.

## Dependency note

Expo SDK 57 currently pulls `uuid <11.1.1` through its native `xcode` build tooling. npm reports a moderate buffer-bounds advisory and only proposes a breaking downgrade to Expo 46. No vulnerable API is called by the app runtime; the project records the finding and will take the upstream compatible update when available.
