# Loci Loom demo video

The `LociLoomDemo` Remotion composition is a 54-second, 1920×1080 product film built from verified app screenshots. Five individually previewable scenes explain the problem, product flow, recall model, RevenueCat business model, and expansion vision.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run render
```

The checked-in voice track was generated without paid API credits. To reproduce it, create a Python 3.12 virtual environment in `.venv`, install `scripts/requirements.txt`, then run `scripts/generate-voiceover.ps1`. The narration and generated VTT transcript are versioned alongside the Remotion source.

The rendered MP4 is intentionally ignored by Git. Its measured metadata and checksum are recorded in `submission/VIDEO.md` at the repository root.
