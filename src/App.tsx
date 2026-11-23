import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_IMAGE_TUNING } from '@encenlab/star-dust';
import { DustCanvas } from '@encenlab/star-dust/react';
import { SCENES, isSceneId, type SceneId } from './scenes';

// The intro plays by itself on first load: the wave pours into the first step, each step holds for
// `ms` (forming included) and then morphs into the next; after the last one it morphs into 'home'.
// A step is a layout scene (e.g. the logo) or a line of text. A click skips to the next step.
type IntroStep = { scene: SceneId; ms: number } | { text: string; ms: number };
const INTRO: IntroStep[] = [
  { scene: 'logo', ms: 7200 },
  // { text: 'Welcome', ms: 3400 },
];
// How long the opening wave drifts before the first step gathers out of it (long enough to be seen).
const INTRO_START_MS = 2200;
// Whenever the dust takes a new shape (wave → logo, logo → home, scene buttons), the old shape melts
// into the Perlin wind and the streams condense into the new one over about this long (star-dust
// formFlowMs, 0.7+).
const FORM_FLOW_MS = 2200;
// Spring that pulls each mote to its place (star-dust default 0.065). Lower = slower, gentler
// gathering; roughly halves the travel speed. Much below ~0.02 shapes stay soft for a long time.
const COHESION = 0.03;
// Seconds without interaction before formed text melts back into the wave.
const IDLE_DISSOLVE_SEC = 12;
// Layout scenes take ~10–25s to settle (longer with images), so give them more time to be read.
const LAYOUT_DISSOLVE_SEC = 45;
// Space kept clear around layouts. The bottom clears the hint text (bottom-8 + ~20px line).
// Defined at module level so the engine gets the same object each render and doesn't re-layout.
const LAYOUT_PADDING = { top: 32, right: 32, bottom: 88, left: 32 };

// Images (photo, icons) without the default soft edge fade. Module-level so the reference is stable.
const IMAGE_TUNING = { ...DEFAULT_IMAGE_TUNING, edgeBlur: 0 };

type Stage =
  | { kind: 'wave' }
  | { kind: 'intro'; index: number }
  | { kind: 'layout'; scene: SceneId };

export default function App() {
  const [stage, setStage] = useState<Stage>({ kind: 'wave' });
  const [scatterVersion, setScatterVersion] = useState(0);
  // After the intro has played once, tapping the wave goes straight to home.
  const introDone = useRef(false);

  const nextIntroStep = useCallback((index: number) => {
    if (index < INTRO.length) {
      setStage({ kind: 'intro', index });
    } else {
      introDone.current = true;
      setStage({ kind: 'layout', scene: 'home' });
    }
  }, []);

  // Start the intro after the opening wave has drifted for a moment.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!introDone.current) nextIntroStep(0);
    }, INTRO_START_MS);
    return () => clearTimeout(t);
  }, [nextIntroStep]);

  // Each intro step holds for its time, then morphs into the next.
  useEffect(() => {
    if (stage.kind !== 'intro') return;
    const t = setTimeout(() => nextIntroStep(stage.index + 1), INTRO[stage.index].ms);
    return () => clearTimeout(t);
  }, [stage, nextIntroStep]);

  const toWave = useCallback(() => {
    setScatterVersion((v) => v + 1);
    setStage({ kind: 'wave' });
  }, []);

  // Plain canvas clicks skip ahead in the intro. Layout scenes are driven by their buttons instead.
  const handleCanvasClick = useCallback(() => {
    if (stage.kind === 'layout') return;
    if (stage.kind === 'intro') return nextIntroStep(stage.index + 1);
    nextIntroStep(introDone.current ? INTRO.length : 0);
  }, [stage, nextIntroStep]);

  const handleLayoutAction = useCallback(
    (action: string) => {
      if (action === 'wave') return toWave();
      if (action === 'scatter') return setScatterVersion((v) => v + 1);
      // open:<url> → web links in a new tab; mailto:/tel: hand off to the mail or phone app.
      if (action.startsWith('open:')) {
        const url = action.slice('open:'.length);
        if (/^https?:\/\//.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
        else if (/^(mailto|tel):/.test(url)) window.location.href = url;
        return;
      }
      if (action.startsWith('scene:')) {
        const id = action.slice('scene:'.length);
        if (isSceneId(id)) setStage({ kind: 'layout', scene: id });
        else console.warn(`[App] unknown scene "${id}"`);
      }
    },
    [toWave]
  );

  // The engine dissolved idle text into the wave by itself; restart the sequence.
  const handleAutoDissolvedToWave = useCallback(() => setStage({ kind: 'wave' }), []);

  const introStep = stage.kind === 'intro' ? INTRO[stage.index] : null;
  // Which layout scene is showing, if any: a normal scene, or an intro step that is a scene.
  const layoutScene: SceneId | null =
    stage.kind === 'layout' ? stage.scene : introStep && 'scene' in introStep ? introStep.scene : null;
  const isLayout = layoutScene !== null;
  // The text target only matters for intro text steps; elsewhere keep the last one so it isn't re-sampled.
  const lastIntroText = useRef('');
  if (introStep && 'text' in introStep) lastIntroText.current = introStep.text;

  return (
    <main className="relative h-full w-full overflow-hidden">
      <DustCanvas
        targetMode={isLayout ? 'layout' : 'text'}
        activeText={lastIntroText.current}
        layoutAst={layoutScene ? SCENES[layoutScene] : null}
        isFreeDrift={stage.kind === 'wave'}
        formFlowMs={FORM_FLOW_MS}
        scatterVersion={scatterVersion}
        palette="aurora"
        imageTuning={IMAGE_TUNING}
        physics={{
          density: 'balanced',
          cursorMode: 'off',
          bloom: false,
          perlinFlow: true,
          cohesion: COHESION,
          autoDissolveSec: isLayout ? LAYOUT_DISSOLVE_SEC : IDLE_DISSOLVE_SEC,
        }}
        onCanvasClick={handleCanvasClick}
        onLayoutAction={handleLayoutAction}
        // Mind-map open/close and paging are handled by star-dust (0.3.0+). Don't pass
        // collapsedMindMapIds unless you want to manage that yourself — it turns the built-in off.
        // Since star-dust 0.2.0, layouts only idle-dissolve when this is on.
        layoutAutoDissolve
        // star-dust 0.4.0 can open open:<url> actions itself; we do it in handleLayoutAction instead
        // so mailto:/tel: go to the mail/phone app without leaving a blank tab.
        openLinks={false}
        // Particles per screen of layout. More = the visible band reaches further down before the
        // ⌄⌄ "scroll for more" cut (default 30k on 'balanced'). Lower it if phones stutter.
        layoutParticleBudget={45000}
        layoutPadding={LAYOUT_PADDING}
        onAutoDissolvedToWave={handleAutoDissolvedToWave}
      />
      <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm tracking-widest text-gray-400">
        {stage.kind === 'wave'
          ? introDone.current
            ? 'tap the dust'
            : ''
          : stage.kind === 'intro'
            ? 'tap to skip'
            : 'tap a button'}
      </p>
    </main>
  );
}
