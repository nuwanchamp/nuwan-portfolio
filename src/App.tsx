import { useCallback, useEffect, useRef, useState } from 'react';
import { AmbientSoundEngine, DEFAULT_IMAGE_TUNING, type MotionMetrics } from '@encenlab/star-dust';
import { DustCanvas } from '@encenlab/star-dust/react';
import { EngineControls, useDustSettings } from './EngineControls';
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
// Space kept clear around layouts. The top clears the nav bar, the bottom the hint text.
// Defined at module level so the engine gets the same object each render and doesn't re-layout.
const LAYOUT_PADDING = { top: 112, right: 32, bottom: 88, left: 32 };

// Images (photo, icons) without the default soft edge fade. Module-level so the reference is stable.
const IMAGE_TUNING = { ...DEFAULT_IMAGE_TUNING, edgeBlur: 0 };

// The fixed nav bar (also the scenes that have their own address, e.g. /#bio).
// `short` is shown on phones, where both sides of the logo must fit in half the width each.
const NAV: { scene: SceneId; label: string; short?: string }[] = [
  { scene: 'home', label: 'Home' },
  { scene: 'bio', label: 'About' },
  { scene: 'mindmap', label: 'Graph View', short: 'Graph' },
  { scene: 'projects', label: 'Projects' },
];
const isNavScene = (id: string): id is SceneId => NAV.some((n) => n.scene === id);
const sceneFromHash = (): SceneId | null => {
  const id = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
  return isNavScene(id) ? id : null;
};

type Stage =
  | { kind: 'wave' }
  | { kind: 'intro'; index: number }
  | { kind: 'layout'; scene: SceneId };

export default function App() {
  const [stage, setStage] = useState<Stage>({ kind: 'wave' });
  const [scatterVersion, setScatterVersion] = useState(0);
  // After the intro has played once, tapping the wave goes straight to the scene.
  const introDone = useRef(false);
  // Look-and-feel settings from the bottom-left "Dust" panel (remembered in this browser).
  const [dust, setDust] = useDustSettings();

  // Ambient sound (star-dust's procedural engine), off unless the visitor turns it on.
  const sound = useRef<AmbientSoundEngine | null>(null);
  const soundOn = useRef(dust.sound);
  soundOn.current = dust.sound;
  useEffect(() => {
    const engine = new AmbientSoundEngine();
    engine.setMuted(!soundOn.current);
    sound.current = engine;
    // Browsers only start audio after a user gesture (remembered "on" needs one after a reload).
    const unlock = () => {
      if (soundOn.current) engine.unlock();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      engine.dispose();
      sound.current = null;
    };
  }, []);
  useEffect(() => {
    sound.current?.setMuted(!dust.sound);
  }, [dust.sound]);
  // Where the intro ends: the scene in the address (/#bio) or home; later, the last scene visited.
  const landingScene = useRef<SceneId>(sceneFromHash() ?? 'home');

  const nextIntroStep = useCallback((index: number) => {
    if (index < INTRO.length) {
      setStage({ kind: 'intro', index });
    } else {
      introDone.current = true;
      setStage({ kind: 'layout', scene: landingScene.current });
    }
  }, []);

  const goToScene = useCallback((scene: SceneId) => {
    introDone.current = true;
    setStage({ kind: 'layout', scene });
  }, []);

  // Keep the address in step with the scene (/#bio), so pages can be linked and Back works.
  useEffect(() => {
    if (stage.kind !== 'layout' || !isNavScene(stage.scene)) return;
    landingScene.current = stage.scene;
    const hash = `#${stage.scene}`;
    if (window.location.hash === hash) return;
    // The first scene after the intro replaces the entry; later visits add history entries.
    if (window.location.hash === '') window.history.replaceState(null, '', hash);
    else window.history.pushState(null, '', hash);
  }, [stage]);

  // Back/forward (or a pasted link) changes the address: show that scene.
  useEffect(() => {
    const onHash = () => {
      const scene = sceneFromHash();
      if (!scene) return;
      landingScene.current = scene;
      if (introDone.current) setStage({ kind: 'layout', scene });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
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

  const currentScene = stage.kind === 'layout' ? stage.scene : null;

  const handleMotionMetrics = useCallback(
    (m: MotionMetrics) =>
      sound.current?.updateMetrics({
        particleCount: m.particleCount,
        avgVelocity: m.avgVelocity,
        avgEnergy: m.avgEnergy,
        isFreeDrift: stage.kind === 'wave',
        palette: dust.palette,
      }),
    [stage.kind, dust.palette]
  );
  const handleSoundImpulse = useCallback(
    (intensity: number, normX: number) => sound.current?.triggerChime(intensity, normX),
    []
  );

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

  const navItem = ({ scene, label, short }: { scene: SceneId; label: string; short?: string }) => {
    const current = currentScene === scene;
    return (
      <li key={scene}>
        <button
          type="button"
          onClick={() => goToScene(scene)}
          aria-current={current ? 'page' : undefined}
          tabIndex={currentScene ? 0 : -1}
          className={`relative whitespace-nowrap pb-1.5 pt-1.5 transition-colors duration-300 focus-visible:outline-none focus-visible:text-cyan-100 ${
            current ? 'text-cyan-200' : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          {short ? (
            <>
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          ) : (
            label
          )}
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 bottom-0 mx-auto h-px bg-cyan-300/70 transition-all duration-500 ${
              current ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`}
          />
        </button>
      </li>
    );
  };

  return (
    <main className="relative h-full w-full overflow-hidden">
      <DustCanvas
        targetMode={isLayout ? 'layout' : 'text'}
        activeText={lastIntroText.current}
        layoutAst={layoutScene ? SCENES[layoutScene] : null}
        isFreeDrift={stage.kind === 'wave'}
        formFlowMs={FORM_FLOW_MS}
        scatterVersion={scatterVersion}
        palette={dust.palette}
        imageTuning={IMAGE_TUNING}
        physics={{
          density: dust.density,
          cursorMode: dust.cursor,
          bloom: dust.bloom,
          constellation: dust.constellation,
          perlinFlow: true,
          cohesion: COHESION,
          autoDissolveSec: isLayout ? LAYOUT_DISSOLVE_SEC : IDLE_DISSOLVE_SEC,
        }}
        onCanvasClick={handleCanvasClick}
        onMotionMetrics={dust.sound ? handleMotionMetrics : undefined}
        onSoundImpulse={dust.sound ? handleSoundImpulse : undefined}
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
        layoutParticleBudget={85000}
        layoutPadding={LAYOUT_PADDING}
        onAutoDissolvedToWave={handleAutoDissolvedToWave}
      />
      <nav
        aria-label="Sections"
        // Home · About | logo | Graph View · Projects, with the logo at the centre of the screen.
        className={`absolute inset-x-0 top-0 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-3 pt-4 transition-opacity duration-700 sm:gap-9 ${
          currentScene ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex items-center justify-end gap-x-3 text-[11px] uppercase tracking-[0.14em] sm:gap-x-9 sm:text-xs sm:tracking-[0.2em]">
          {NAV.slice(0, 2).map(navItem)}
        </ul>
        <button
          type="button"
          onClick={() => goToScene('home')}
          tabIndex={currentScene ? 0 : -1}
          aria-label="Nuwan C. Perera, home"
          className="opacity-70 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
        >
          <img src="/logo.png" alt="" className="block h-auto w-8 sm:w-10" draggable={false} />
        </button>
        <ul className="flex items-center justify-start gap-x-3 text-[11px] uppercase tracking-[0.14em] sm:gap-x-9 sm:text-xs sm:tracking-[0.2em]">
          {NAV.slice(2).map(navItem)}
        </ul>
      </nav>
      <EngineControls
        settings={dust}
        onChange={setDust}
        visible={introDone.current && stage.kind !== 'intro'}
      />
    </main>
  );
}
