import { useEffect, useRef, useState } from 'react';

export type DustPalette = 'aurora' | 'sunbeam' | 'moonlit';
export type DustCursor = 'off' | 'repel' | 'vortex' | 'breeze';
export type DustDensity = 'sparse' | 'balanced' | 'dense';

export interface DustSettings {
  palette: DustPalette;
  cursor: DustCursor;
  density: DustDensity;
  bloom: boolean;
  constellation: boolean;
  sound: boolean;
}

export const DEFAULT_DUST_SETTINGS: DustSettings = {
  palette: 'aurora',
  cursor: 'off',
  density: 'balanced',
  bloom: false,
  constellation: false,
  sound: false,
};

const STORAGE_KEY = 'dust-settings';

/** Settings remembered in this browser (falls back to defaults when storage is unavailable). */
export function useDustSettings() {
  const [settings, setSettings] = useState<DustSettings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      return saved ? { ...DEFAULT_DUST_SETTINGS, ...saved } : DEFAULT_DUST_SETTINGS;
    } catch {
      return DEFAULT_DUST_SETTINGS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Private mode / blocked storage: settings just won't be remembered.
    }
  }, [settings]);
  return [settings, setSettings] as const;
}

const PALETTES: { value: DustPalette; label: string }[] = [
  { value: 'aurora', label: 'Aurora' },
  { value: 'sunbeam', label: 'Sunbeam' },
  { value: 'moonlit', label: 'Moonlit' },
];
const CURSORS: { value: DustCursor; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'repel', label: 'Repel' },
  { value: 'vortex', label: 'Vortex' },
  { value: 'breeze', label: 'Breeze' },
];
const DENSITIES: { value: DustDensity; label: string }[] = [
  { value: 'sparse', label: 'Sparse' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'dense', label: 'Dense' },
];

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300/60 ${
                active
                  ? 'bg-cyan-300/15 text-cyan-100'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-[11px] text-slate-300 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300/60"
    >
      {label}
      <span
        aria-hidden="true"
        className={`relative h-4 w-7 rounded-full transition-colors ${checked ? 'bg-cyan-400/60' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-slate-100 transition-all ${checked ? 'left-3.5' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

/** Bottom-left panel for the dust engine's look and feel. */
export function EngineControls({
  settings,
  onChange,
  visible,
}: {
  settings: DustSettings;
  onChange: (next: DustSettings) => void;
  visible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof DustSettings>(key: K, value: DustSettings[K]) =>
    onChange({ ...settings, [key]: value });

  // Close on Escape or a click outside the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div
      ref={panelRef}
      className={`absolute bottom-4 left-4 z-10 transition-opacity duration-700 sm:bottom-6 sm:left-6 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {open && (
        <div
          id="dust-controls"
          role="group"
          aria-label="Dust controls"
          className="mb-2 w-60 space-y-3 rounded-xl border border-white/10 bg-slate-950/75 p-3.5 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          <Segmented label="Atmosphere" options={PALETTES} value={settings.palette} onChange={(v) => set('palette', v)} />
          <Segmented label="Cursor" options={CURSORS} value={settings.cursor} onChange={(v) => set('cursor', v)} />
          <Segmented label="Density" options={DENSITIES} value={settings.density} onChange={(v) => set('density', v)} />
          <div className="space-y-0.5 border-t border-white/5 pt-2">
            <Toggle label="Glow" checked={settings.bloom} onChange={(v) => set('bloom', v)} />
            <Toggle label="Constellation" checked={settings.constellation} onChange={(v) => set('constellation', v)} />
            <Toggle label="Sound" checked={settings.sound} onChange={(v) => set('sound', v)} />
          </div>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="dust-controls"
        tabIndex={visible ? 0 : -1}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300/60 ${
          open
            ? 'border-cyan-300/30 bg-slate-950/75 text-cyan-100'
            : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200'
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
        Dust
      </button>
    </div>
  );
}
