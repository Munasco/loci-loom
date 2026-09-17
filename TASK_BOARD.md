# Loci Loom — 24-Hour Ship Board

Status legend: `[ ]` queued, `[~]` active, `[x]` verified, `[!]` blocked.

## Outcome

Ship a polished, testable Expo mobile app and a sub-two-minute Remotion demo for RevenueCat Shipaton Next Gen. Preserve clean extension points for Nebius/NVIDIA and Alexa+ without diluting the first submission.

## 0–3 hours — Product and foundation

- [x] Compare hackathon prizes, deadlines, required technology, and zero-cost paths.
- [x] Select Loci Loom and define the cross-hackathon architecture.
- [x] Install the official Remotion best-practices skill.
- [x] Scaffold Expo + TypeScript application.
- [x] Add Jest, deterministic fixtures, strict TypeScript, and browser test tooling.
- [x] Establish the visual system, screen state model, and service boundaries.

## 3–10 hours — Core product

- [x] Build cinematic home and subject selection.
- [x] Build deterministic trail generation for a reliable judge demo.
- [x] Build the five-scene memory-trail player with gradients and haptics.
- [x] Build recall challenge, answer feedback, and a streak surface.
- [ ] Add progress persistence and the full trail library.
- [~] Add accessibility labels and purchase error states; reduced-motion remains.

## 10–15 hours — RevenueCat and monetization

- [x] Add `react-native-purchases` behind a typed billing gateway.
- [x] Implement entitlement state, offerings, restore purchases, and paywall UI.
- [x] Keep a clearly labelled local demo billing adapter for tests and judge preview.
- [x] Unit-test the billing contract; native sandbox integration remains external.
- [!] Create RevenueCat project and run a sandbox purchase (requires authenticated account/project credentials).

## 15–19 hours — Quality gate

- [x] Unit-test generation invariants and entitlement state.
- [x] Browser-test topic entry, trail playback, recall, and paywall.
- [x] Run TypeScript, Jest, and production web-export gates.
- [x] Perform mobile-viewport smoke test and fix visual defects.
- [x] Document the exact test matrix and remaining device-only checks.

## 19–23 hours — Submission assets

- [x] Add a 1024×1024 icon and required 1179×2556 screenshot.
- [x] Create a five-scene Remotion composition under two minutes.
- [x] Render the final 54-second MP4, inspect a 1080p frame, and decode-check the file.
- [x] Write README, architecture, setup, testing, RevenueCat integration, and demo instructions.
- [x] Add MIT license and submission copy.

## 23–24 hours — External handoff

- [x] Verify `github.com/Munasco` belongs to Munachi Ernest-Eze.
- [!] Authenticate the GitHub CLI as `Munasco` (only other accounts are currently available).
- [ ] Create public `munasco/loci-loom`, push tested source, and confirm license visibility.
- [ ] Prepare Devpost draft; do not submit without an explicit final review.

## Later extensions

- [ ] Nebius: replace the generator provider with Nemotron through Token Factory; add adaptive recall and evaluation traces.
- [ ] Alexa+: expose daily recall as a stateful Agent Skill/MCP flow and produce a simulated-device demo.
