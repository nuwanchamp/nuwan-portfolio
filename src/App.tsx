import { useCallback, useState } from 'react';
import { DEFAULT_IMAGE_TUNING } from '@encenlab/star-dust';
import { DustCanvas } from '@encenlab/star-dust/react';
import { SCENES, isSceneId, type SceneId } from './scenes';

// Shown one after another, one per click. After the last one, the dust opens the 'home' layout.
const MESSAGES = ['Hello!', 'I am Nuwan.'];
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
  | { kind: 'text'; index: number }
  | { kind: 'layout'; scene: SceneId };

export default function App() {
  const [stage, setStage] = useState<Stage>({ kind: 'wave' });
  // Last text shown; kept as the target while in other stages so it doesn't re-sample needlessly.
  const [scatterVersion, setScatterVersion] = useState(0);

  const toWave = useCallback(() => {
    setScatterVersion((v) => v + 1);
    setStage({ kind: 'wave' });
  }, []);

  // Plain canvas clicks step through the messages. Layout scenes are driven by their buttons instead.
  const handleCanvasClick = useCallback(() => {
    if (stage.kind === 'layout') return;
    const next = 0;
    setStage({ kind: 'layout', scene: 'home' });
  }, [stage]);

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

  const isLayout = stage.kind === 'layout';

  return (
    <main className="relative h-full w-full overflow-hidden">
      <DustCanvas
        targetMode={isLayout ? 'layout' : 'text'}
        activeText={""}
        layoutAst={isLayout ? SCENES[stage.scene] : null}
        isFreeDrift={stage.kind === 'wave'}
        scatterVersion={scatterVersion}
        palette="aurora"
        imageTuning={IMAGE_TUNING}
        physics={{
          density: 'balanced',
          cursorMode: 'off',
          bloom: false,
          perlinFlow: true,
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
          ? 'tap the dust'
          : stage.kind === 'text'
            ? 'tap to continue'
            : 'tap a button'}
      </p>
    </main>
  );
}
