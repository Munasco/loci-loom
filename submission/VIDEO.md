# Video release

- Composition: `LociLoomDemo`
- Resolution: 1920×1080
- Video: H.264 Main Profile, Level 4.0, `yuv420p`, `avc1`, progressive
- Audio: AAC-LC, 48 kHz stereo, generated from the checked-in narration without paid credits
- Streaming: MP4 fast-start metadata (`moov` atom before media data)
- Measured duration: 49.557 seconds
- File size: 2,902,381 bytes
- SHA-256: `74C9BE398DA96D4F976423B496A2C0D426232259DADCA8B873D9E2942483EEBD`
- Release artifact: `submission/loci-loom-demo.mp4`
- Remotion render: `apps/video/out/loci-loom-demo.mp4`

Verification: Remotion lint and TypeScript passed; the complete release MP4 decoded through FFmpeg with no errors. A headless Chrome playback test loads the exact committed file, begins playback, and performs duration-aware seeks while verifying decoded playback. The source voice track measures 48.48 seconds and is delayed by 15 frames with frame-based fade-in and fade-out.
