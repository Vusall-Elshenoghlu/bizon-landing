# BIZON ENERGY — scroll landing page

React + TypeScript + GSAP. Scroll-driven flavor slider, drag-to-open can, and a
scrubbed pour film.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview
```

---

## How the hero works

`src/components/Hero/Hero.tsx`

The section is taller than the viewport; GSAP pins the inner `.hero__pin` and
walks the scroll progress across the seven flavors, snapping to each one.

- **Scroll** moves through the lineup. `snap: 1/(N-1)` settles on a flavor
  instead of leaving you between two.
- **Clicking a side can** scrolls the pinned timeline to that flavor —
  `scrollToIndex` converts an index into a scroll position from the
  ScrollTrigger's own `start`/`end`, so the click and the scrubbing agree.
- **Clicking the active can, or "Qabağı aç"**, runs `runOpen()`: the other six
  cans fly out sideways, the UI chrome fades, the chosen can lifts and scales,
  and then the page hands off to the pour section.
- **The palette morphs** per flavor. `gsap.utils.interpolate` tweens the hex
  values and writes `--accent`, `--accent-2` and `--flavor-bg`, so the glow,
  buttons, bars and every later section follow the active can.

Slot positions live in one place — `slotFor(offset, mobile)` returns x / scale /
rotation / opacity / blur for a can at a given distance from centre. Change the
carousel shape there, not in the tweens.

Two details worth keeping if you refactor:

- The intro timeline animates `.can__inner`, never `.can`. The outer element's
  opacity and transform belong to the slot tween; two tweens fighting over them
  leaves cans that should be hidden half-visible.
- `onUpdate` bails out while `opening.current` is true. Committing to a flavor
  scrolls through the whole runway, and without the guard the index would sweep
  to the last flavor and the pour section would open in the wrong colour.

---

## How the pour works

`src/components/Pour/Pour.tsx`

The film is **173 WebP frames painted to a canvas**, not a `<video>` element.
Seeking `video.currentTime` from a scroll handler stutters badly on iOS Safari;
drawing a preloaded frame is deterministic everywhere.

```
frame 0 ──────── 45 ──────────────────────── 172
  can closed    lid open, tilt      pour → iced glass
  └── drag gate ──┘└──────── scroll scrub ────────┘
```

- **Frames 0–45 are driven by the drag handle.** GSAP Draggable moves the pull
  tab along the track; release past 72% commits the open, pops the ring, fades
  the gate and auto-scrolls into the pour.
- **Frames 45–172 are driven by scroll**, mapped over the pinned runway.
- **Nobody gets stuck.** If a visitor just scrolls instead of dragging, passing
  7% auto-commits the open. The drag is the delightful path, not a gate.
- **Mobile loads a different set** — `video/seq-sm`, half the frames at 640px.
  173 decoded 960×540 frames is a lot of memory for a phone.

Chapter copy cross-fades from scroll progress. The JS writes only `opacity` and
a `--ch-shift` custom property; the transform itself stays in CSS so the phone
breakpoint can place the copy below the film instead of centring it.

---

## Assets

`public/cans/*.webp` — the seven cans, trimmed and alpha-preserved.

`public/video/` — `pour.mp4` (the two source clips merged and re-encoded, used
as the looping background in the CTA band), `seq/` and `seq-sm/` (the scrub
frames), `poster.jpg`.

To regenerate the frames from a new master:

```bash
ffmpeg -i pour.mp4 -vf "fps=18,scale=960:-2" -c:v libwebp -quality 60 seq/f_%03d.webp
```

Then update `TOTAL` and `OPEN_END` in `Pour.tsx` — `OPEN_END` is the frame where
the lid is fully open and the tilt begins.

**One thing to know:** the pour film is the BIZON **Max** master. Whichever
flavor the visitor picks, the section is tinted with that flavor's accent and
the closing chapter shows the chosen can, but the can in the film is Max. Shoot
a clip per flavor and the component takes a per-flavor frame directory with no
other change.

---

## Adding a flavor

Everything comes from `src/data/flavors.ts`. Add an entry with `accent`,
`accent2`, `bg`, a can image and the profile bars — the hero carousel, the rail,
the grid, the spec column and the pour tint all pick it up. Nothing else needs
touching.

---

## Structure

```
src/
  data/flavors.ts            all product + palette data
  lib/gsap.ts                plugin registration, house easings
  components/
    Hero/                    pinned flavor carousel
    Pour/                    drag gate + canvas frame scrub
    Sections/                nav, marquee, spec, grid, stats, CTA, footer
    Preloader.tsx
  styles/global.css          tokens, typography, buttons
```

Display type is set in Barlow Condensed at `line-height: 0.94` with vertical
padding — Azerbaijani sets dotted İ and tailed Ç/Ş/Ğ, and the tighter leading a
Latin-only headline can take will clip them.

`prefers-reduced-motion` is honoured in `global.css`.
