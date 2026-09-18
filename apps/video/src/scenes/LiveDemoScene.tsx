import { Video } from '@remotion/media';
import { AbsoluteFill, Easing, Interactive, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Eyebrow, palette } from '../design';

export const LiveDemoScene = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: palette.paper, padding: '82px 100px', overflow: 'hidden' }}>
    <div style={{ width: 940 }}>
      <Eyebrow>Real product run</Eyebrow>
      <Interactive.Div name="Live demo title" style={{ color: palette.ink, fontSize: 82, lineHeight: 1.01, fontWeight: 950, letterSpacing: -3.5 }}>
        Encode space.<br />Retrieve the route.<br /><span style={{ color: palette.plum }}>Adapt the interval.</span>
      </Interactive.Div>
      <Interactive.Div name="Live demo explanation" style={{ color: palette.muted, fontSize: 29, lineHeight: 1.42, width: 850, marginTop: 34 }}>
        This is the running app—not a mockup. A topic becomes five linked landmarks, then three spatial recall prompts produce a persisted recall-accuracy result.
      </Interactive.Div>
      <Interactive.Div name="Learning loop" style={{ display: 'flex', gap: 14, marginTop: 38 }}>
        {['5 vivid stops', '3 retrieval angles', '1 adaptive review'].map((label) => <div key={label} style={{ borderRadius: 999, padding: '12px 18px', background: palette.lavender, color: palette.plum, fontSize: 20, fontWeight: 850 }}>{label}</div>)}
      </Interactive.Div>
    </div>
    <Interactive.Div name="Live app phone" style={{ position: 'absolute', right: 170, top: 40, width: 410, height: 890, borderRadius: 58, padding: 12, background: '#12131D', boxShadow: '0 38px 100px rgba(29,18,40,.34)', opacity: interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.16, 1, .3, 1) }), translate: `0 ${interpolate(frame, [0, 24], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.16, 1, .3, 1) })}px` }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 46, overflow: 'hidden', background: palette.paper }}>
        <Video src={staticFile('footage/product-run.webm')} muted playbackRate={0.8} objectFit="cover" style={{ width: '100%', height: '100%' }} />
      </div>
    </Interactive.Div>
  </AbsoluteFill>;
};
