# Video release

- Composition: `LociLoomDemo`
- Resolution: 1920×1080
- Video: H.264 Main Profile, Level 4.0, `yuv420p`, `avc1`, progressive
- Audio: AAC-LC, 48 kHz stereo, generated from the checked-in narration without paid credits
- Streaming: MP4 fast-start metadata (`moov` atom before media data)
- Measured duration: 54.058 seconds
- File size: 3,459,879 bytes
- SHA-256: `7A3F84D358695BF117FC5320E9DCE23546C938C4AF4AB52A0ECEB391691C0C21`
- Release artifact: `submission/loci-loom-demo.mp4`
- Remotion render: `apps/video/out/loci-loom-demo.mp4`

Verification: Remotion lint and TypeScript passed; the complete release MP4 decoded through FFmpeg with no errors. A headless Chrome playback test loads the exact committed file, begins playback, seeks to 12, 30, and 50 seconds, and verifies decoded playback after every seek. The source voice track measures 51.96 seconds and is delayed by 15 frames with frame-based fade-in and fade-out.
