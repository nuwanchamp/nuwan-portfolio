# Nuwan C. Perera: portfolio

A personal site where every page is drawn in particles. A wave of dust gathers into the logo. The logo
then dissolves through Perlin-noise wind into the home page. Each section is built from the dust of the
one before it.

Built on [star-dust](https://github.com/nuwanchamp/star-dust), my WebGL dust library. It turns text,
images and a small layout markup into particles.

## Sections

| Address | Scene |
|---|---|
| `/#home` | Photo, name and contact links |
| `/#bio` | About me |
| `/#mindmap` | Graph View: skills and experience as an interactive mind map |
| `/#projects` | Case studies from [blueprints](https://github.com/nuwanchamp/blueprints/tree/main/case-studies) |

Each section has its own address, so you can link to a section directly. Back and Forward work too.

The **Dust** button in the bottom-left corner opens the engine controls:
- atmosphere (colour palette)
- how the cursor moves the dust
- particle density
- glow
- constellation lines
- ambient sound

Your choices are remembered in your browser.

## Run it

Requires [Bun](https://bun.sh) (or Node 20+ with npm).

```sh
bun install
bun run dev      # http://localhost:5173
bun run build    # type-check + production build into dist/
bun run preview  # serve the production build
```

## Where things live

| File | What it holds |
|---|---|
| `src/scenes.ts` | Every scene's content, written in star-dust layout markup (`Col`, `Row`, `Heading`, `Text`, `Image`, `Button`, `MindMap`…). Edit this to change what the site says. |
| `src/App.tsx` | The intro sequence, transitions, nav bar and the `DustCanvas` setup |
| `src/EngineControls.tsx` | The bottom-left Dust panel and its saved settings |
| `src/main.tsx` | Preloads fonts and images so the dust samples the right glyphs |
| `public/` | Logo, photo and icons |

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4 and [star-dust](https://github.com/nuwanchamp/star-dust).
The particles are drawn with WebGL.
