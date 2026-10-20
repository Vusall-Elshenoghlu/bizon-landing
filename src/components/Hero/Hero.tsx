import { useCallback, useRef } from 'react';
import { gsap, ScrollTrigger, Draggable, isMobile } from '../../lib/gsap';
import { useIsoLayoutEffect } from '../../hooks/useIsoLayoutEffect';
import { FLAVORS } from '../../data/flavors';
import './Hero.css';

type Props = {
  activeIndex: number;
  onChange: (i: number) => void;
  /** Fired when the user commits to a flavor — hands off to the pour sequence. */
  onOpen: (i: number) => void;
  /** Hands the parent a way to bring the stage back into view from elsewhere. */
  registerJump: (fn: (i: number) => void) => void;
};

/** Where a can sits, given its distance from the active slot. */
function slotFor(offset: number, mobile: boolean) {
  const dir = Math.sign(offset);
  const d = Math.abs(offset);
  const unit = mobile ? 200 : 360;

  if (d === 0) {
    return { x: 0, y: 0, scale: 1, rotY: 0, rotZ: 0, opacity: 1, blur: 0, z: 30 };
  }
  if (d === 1) {
    return {
      x: dir * unit,
      y: mobile ? 14 : 26,
      scale: mobile ? 0.5 : 0.58,
      rotY: dir * -16,
      rotZ: dir * 2,
      opacity: mobile ? 0.34 : 0.5,
      blur: 1.6,
      z: 20,
    };
  }
  if (d === 2) {
    return {
      x: dir * unit * 1.62,
      y: mobile ? 24 : 46,
      scale: mobile ? 0.34 : 0.4,
      rotY: dir * -24,
      rotZ: dir * 3,
      opacity: mobile ? 0.1 : 0.2,
      blur: 4,
      z: 10,
    };
  }
  return {
    x: dir * unit * 2.1,
    y: mobile ? 30 : 60,
    scale: 0.3,
    rotY: dir * -30,
    rotZ: dir * 4,
    opacity: 0,
    blur: 8,
    z: 0,
  };
}

/** Lay every can out around the active slot. Shared by the index effect and
    the restore path, so the two always agree on where a can belongs. */
function positionCans(stageEl: HTMLElement | null, idx: number, mobile: boolean, duration = 0.9) {
  gsap.utils.toArray<HTMLElement>('.can', stageEl).forEach((can, i) => {
    const s = slotFor(i - idx, mobile);
    gsap.to(can, {
      x: s.x,
      y: s.y,
      scale: s.scale,
      rotateY: s.rotY,
      rotate: s.rotZ,
      opacity: s.opacity,
      filter: `blur(${s.blur}px)`,
      zIndex: s.z,
      duration,
      ease: 'bizon',
      overwrite: 'auto',
    });
    can.classList.toggle('is-active', i === idx);
  });
}

export default function Hero({ activeIndex, onChange, onOpen, registerJump }: Props) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);

  const track = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  const opening = useRef(false);
  /** True while the slider handle is under the pointer — the index effect
      must not fight the drag for the handle's position. */
  const sliding = useRef(false);
  /** A stage drag ends with a click event; this swallows it. */
  const swallowClick = useRef(false);
  /** Called by the React handlers to hold the carousel while someone is
      steering it themselves. Filled in once the effect has run. */
  const holdAuto = useRef<() => void>(() => {});

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  const N = FLAVORS.length;

  /** Chrome that fades out when a flavor is committed, and back in on return. */
  const CHROME = '.hero__rail-item, .hero__cta, .hero__slider, .hero__meta, .hero__copy';

  const go = useCallback(
    (i: number) => {
      const next = gsap.utils.clamp(0, N - 1, i);
      if (next !== activeRef.current) onChangeRef.current(next);
    },
    [N],
  );

  /* ---------------------------------------------------------------
     Intro, the slider, and dragging the stage itself. The lineup is no
     longer tied to scroll — the hero is a plain full-height section that
     you drive by hand.
     --------------------------------------------------------------- */
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mobile = isMobile();

      /* ----- Slider ----- */
      const maxX = () =>
        Math.max(1, track.current!.offsetWidth - handle.current!.offsetWidth);
      const stepX = () => maxX() / (N - 1);
      const paint = (x: number) => {
        if (fill.current) fill.current.style.width = `${(x / maxX()) * 100}%`;
      };

      /* ----- Autoplay -----
         The next can steps up every few seconds, and the carousel stands
         down for a spell whenever someone takes the wheel.

         Every gate here is read live at tick time. An earlier cut cached
         "is it on screen" from a ScrollTrigger toggle and kept a boolean
         for "is it paused" — either one could latch false and silently
         kill the carousel for good, which is exactly what happened. */
      const AUTO_EVERY = 3000;
      const RESUME_AFTER = 7000;
      let heldUntil = 0;

      const hold = () => {
        heldUntil = Date.now() + RESUME_AFTER;
      };
      holdAuto.current = hold;

      const onScreen = () => {
        const r = root.current?.getBoundingClientRect();
        return !!r && r.bottom > 0 && r.top < window.innerHeight;
      };

      const advance = window.setInterval(() => {
        if (document.hidden) return;
        if (Date.now() < heldUntil) return;
        if (opening.current || sliding.current) return;
        if (!onScreen()) return;
        go((activeRef.current + 1) % N);
      }, AUTO_EVERY);

      const [drag] = Draggable.create(handle.current, {
        type: 'x',
        bounds: { minX: 0, maxX: maxX() },
        cursor: 'grab',
        activeCursor: 'grabbing',
        onPress() {
          sliding.current = true;
          hold();
        },
        onDrag() {
          paint(this.x);
          go(Math.round(this.x / stepX()));
        },
        onRelease() {
          sliding.current = false;
          /* Settle on the exact notch for whichever flavor we landed on. */
          const i = gsap.utils.clamp(0, N - 1, Math.round(this.x / stepX()));
          gsap.to(this.target, { x: i * stepX(), duration: 0.3, ease: 'power2.out' });
          paint(i * stepX());
          go(i);
          hold();
        },
      });

      const applyBounds = () => {
        drag.applyBounds({ minX: 0, maxX: maxX() });
        const x = activeRef.current * stepX();
        gsap.set(handle.current, { x });
        paint(x);
      };
      applyBounds();
      window.addEventListener('resize', applyBounds);

      /* ----- Hold the left button on the stage and flip through ----- */
      const stageEl = stage.current!;
      const STEP = mobile ? 72 : 118; // px of travel per flavor
      let startX = 0;
      let baseIdx = 0;
      let travel = 0;
      let active = false;

      const down = (e: PointerEvent) => {
        if (e.button !== 0) return; // left button only
        active = true;
        startX = e.clientX;
        baseIdx = activeRef.current;
        travel = 0;
        hold();
        stageEl.classList.add('is-dragging');
        stageEl.setPointerCapture(e.pointerId);
      };

      const move = (e: PointerEvent) => {
        if (!active) return;
        const dx = e.clientX - startX;
        travel = Math.max(travel, Math.abs(dx));
        /* Drag left and the next can comes in from the right. */
        go(baseIdx - Math.round(dx / STEP));
      };

      const up = (e: PointerEvent) => {
        if (!active) return;
        active = false;
        stageEl.classList.remove('is-dragging');
        if (stageEl.hasPointerCapture(e.pointerId)) stageEl.releasePointerCapture(e.pointerId);
        /* Anything past a few pixels was a drag, not a tap on a can. */
        swallowClick.current = travel > 6;
        hold();
      };

      stageEl.addEventListener('pointerdown', down);
      stageEl.addEventListener('pointermove', move);
      stageEl.addEventListener('pointerup', up);
      stageEl.addEventListener('pointercancel', up);

      /* ----- Coming back up from the pour film: rebuild the stage ----- */
      ScrollTrigger.create({
        trigger: root.current!,
        start: 'top top',
        end: 'bottom top',
        onEnterBack: () => {
          if (!opening.current) return;
          opening.current = false;
          gsap.to(CHROME, { opacity: 1, y: 0, duration: 0.6, stagger: 0.02 });
          gsap.to(ghost.current, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6 });
          gsap.to('.can', { opacity: 1, duration: 0.6 });
          positionCans(stage.current, activeRef.current, mobile, 0.7);
        },
      });

      /* ----- Intro -----
         This animates .can__inner, never .can — the outer element's
         opacity/transform belongs to the slot tween, and two tweens
         fighting over it leaves hidden cans half-visible. */
      gsap
        .timeline({ delay: 0.15 })
        .from('.can__inner', {
          y: 120,
          opacity: 0,
          scale: 0.8,
          stagger: { each: 0.06, from: 'center' },
          duration: 1.2,
        })
        .from(ghost.current, { yPercent: 22, opacity: 0, duration: 1.3 }, '-=1.0')
        .from(
          ['.hero__index', '.hero__name', '.hero__tagline', '.hero__desc', '.hero__note'],
          { y: 24, opacity: 0, stagger: 0.05, duration: 0.9 },
          '-=1.0',
        )
        .from(
          ['.hero__cta', '.hero__slider', '.hero__rail-item'],
          { y: 20, opacity: 0, stagger: 0.035, duration: 0.8 },
          '-=0.75',
        );

      return () => {
        clearInterval(advance);
        window.removeEventListener('resize', applyBounds);
        stageEl.removeEventListener('pointerdown', down);
        stageEl.removeEventListener('pointermove', move);
        stageEl.removeEventListener('pointerup', up);
        stageEl.removeEventListener('pointercancel', up);
      };
    }, root);

    return () => ctx.revert();
  }, [N, go, CHROME]);

  /* ---------------------------------------------------------------
     Flavor change: reposition every can, morph the palette, swap copy.
     --------------------------------------------------------------- */
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mobile = isMobile();

    positionCans(stage.current, activeIndex, mobile);

    /* Keep the slider in step — unless the slider is what moved us. */
    if (!sliding.current && track.current && handle.current) {
      const span = Math.max(1, track.current.offsetWidth - handle.current.offsetWidth);
      const x = (span / (N - 1)) * activeIndex;
      gsap.to(handle.current, { x, duration: 0.5, ease: 'bizon', overwrite: 'auto' });
      if (fill.current) {
        gsap.to(fill.current, {
          width: `${(x / span) * 100}%`,
          duration: 0.5,
          ease: 'bizon',
          overwrite: 'auto',
        });
      }
    }

    /* Palette morph — interpolate hex so every --var stays a real color. */
    const next = FLAVORS[activeIndex];
    const read = (k: string) => getComputedStyle(el).getPropertyValue(k).trim();
    const from = { a: read('--accent'), b: read('--accent-2'), c: read('--flavor-bg') };
    const prox = { t: 0 };

    gsap.to(prox, {
      t: 1,
      duration: 0.85,
      ease: 'power2.inOut',
      onUpdate: () => {
        const set = (k: string, v: string) => {
          el.style.setProperty(k, v);
          document.documentElement.style.setProperty(k, v);
        };
        set('--accent', gsap.utils.interpolate(from.a, next.accent, prox.t) as string);
        set('--accent-2', gsap.utils.interpolate(from.b, next.accent2, prox.t) as string);
        el.style.setProperty(
          '--flavor-bg',
          gsap.utils.interpolate(from.c, next.bg, prox.t) as string,
        );
      },
    });

    /* Ghost word swaps with a vertical wipe. */
    if (ghost.current) {
      gsap.fromTo(
        ghost.current,
        { yPercent: 36, opacity: 0, filter: 'blur(14px)' },
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95, ease: 'bizon' },
      );
    }

    /* Copy column re-enters line by line. */
    gsap.fromTo(
      gsap.utils.toArray('.hero__index, .hero__name, .hero__tagline, .hero__desc, .hero__note', copy.current),
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.045, ease: 'bizon', overwrite: true },
    );

    /* On phones the rail scrolls horizontally — keep the active chip in
       view without touching the page's own scroll position. */
    const railInner = el.querySelector<HTMLElement>('.hero__rail-inner');
    const chip = railInner?.children[activeIndex] as HTMLElement | undefined;
    if (railInner && chip && railInner.scrollWidth > railInner.clientWidth) {
      railInner.scrollTo({
        left: chip.offsetLeft - railInner.clientWidth / 2 + chip.clientWidth / 2,
        behavior: 'smooth',
      });
    }

    /* Stat bars re-fill. */
    gsap.utils.toArray<HTMLElement>('.hero__bar-fill', meta.current).forEach((f, i) => {
      gsap.fromTo(
        f,
        { width: '0%' },
        {
          width: `${next.profile[i]?.value ?? 0}%`,
          duration: 1,
          delay: 0.08 * i,
          ease: 'bizon',
          overwrite: true,
        },
      );
    });
  }, [activeIndex, N]);

  /* A card further down the page was picked — the parent has already set the
     index, so all that is left is to bring the stage back into view. */
  const jumpToStage = useCallback(() => {
    if (!root.current) return;
    gsap.to(window, {
      scrollTo: { y: root.current, autoKill: false },
      duration: 0.9,
      ease: 'bizon',
    });
  }, []);

  useIsoLayoutEffect(() => {
    registerJump(jumpToStage);
  }, [registerJump, jumpToStage]);

  /* The commit: everything but the chosen can clears the stage, then we
     hand off to the pour sequence. */
  const runOpen = useCallback(
    (i: number) => {
      if (opening.current) return;
      opening.current = true;

      const cans = gsap.utils.toArray<HTMLElement>('.can', stage.current);
      const chosen = cans[i];
      const others = cans.filter((_, k) => k !== i);

      gsap
        .timeline({ onComplete: () => onOpen(i) })
        .to(
          others,
          {
            x: (k: number) => (k < i ? -900 : 900),
            y: 90,
            scale: 0.42,
            opacity: 0,
            filter: 'blur(16px)',
            duration: 0.75,
            stagger: { each: 0.05, from: 'center' },
          },
          0,
        )
        .to(CHROME, { opacity: 0, y: 16, duration: 0.5, stagger: 0.02 }, 0)
        .to(ghost.current, { opacity: 0, scale: 1.25, filter: 'blur(26px)', duration: 0.7 }, 0)
        .to(chosen, { scale: 1.18, y: -18, rotate: 0, duration: 1, ease: 'bizon' }, 0.08)
        .to('.hero__aura', { opacity: 1, scale: 1.35, duration: 1 }, 0);
    },
    [onOpen, CHROME],
  );

  const handleCanClick = (i: number) => {
    /* The pointerup that ended a stage drag also fires a click. */
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    holdAuto.current();
    if (i === activeIndex) runOpen(i);
    else go(i);
  };

  const handleSliderKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    let next: number | null = null;
    if (k === 'ArrowRight' || k === 'ArrowUp') next = activeIndex + 1;
    else if (k === 'ArrowLeft' || k === 'ArrowDown') next = activeIndex - 1;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = N - 1;
    if (next === null) return;
    e.preventDefault();
    holdAuto.current();
    go(next);
  };

  const flavor = FLAVORS[activeIndex];

  return (
    <section className="hero" ref={root} id="lineup">
      <div className="hero__pin">
        <div className="hero__aura" />
        <div className="hero__rays" />

        <div className="hero__ghost">
          <span ref={ghost}>{flavor.display}</span>
        </div>

        <div className="hero__stage" ref={stage}>
          {FLAVORS.map((f, i) => (
            <button
              key={f.id}
              className="can"
              /* Offset phases so the lineup breathes instead of marching. */
              style={{ zIndex: 10, ['--spin-delay' as string]: `${(i % 5) * 1.3}s` }}
              onClick={() => handleCanClick(i)}
              aria-label={
                i === activeIndex ? `${f.name} — qapağı aç` : `${f.name} dadına keç`
              }
            >
              <span className="can__inner">
                <img src={f.can} alt={`BIZON ${f.name}`} draggable={false} />
                <img className="can__reflect" src={f.can} alt="" aria-hidden draggable={false} />
                <span className="can__pool" />
              </span>
            </button>
          ))}
        </div>

        <div className="hero__vignette" />

        <div className="hero__grid">
          <div className="hero__copy" ref={copy}>
            <p className="hero__index">
              {String(activeIndex + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </p>
            <h1 className="hero__name">
              BIZON
              <br />
              {flavor.display}
            </h1>
            <p className="hero__tagline">{flavor.tagline}</p>
            <p className="hero__desc">{flavor.description}</p>
            <div className="hero__notes">
              {flavor.notes.map((n) => (
                <span className="hero__note" key={n}>
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div aria-hidden />

          <div className="hero__meta" ref={meta}>
            <div className="hero__spec">
              <div>
                <b>{flavor.volume.replace(' ml', '')}</b>
                <small>ml həcm</small>
              </div>
              <div>
                <b>{flavor.caffeine.replace(' mg', '')}</b>
                <small>mg kofein</small>
              </div>
            </div>
            {flavor.profile.map((p) => (
              <div className="hero__bar" key={p.label}>
                <div className="hero__bar-top">
                  <span>{p.label}</span>
                  <span>{p.value}</span>
                </div>
                <div className="hero__bar-track">
                  <i className="hero__bar-fill" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__slider">
          <span className="hero__slider-cap">Özü gəzir — sürüşdür və ya qutunu tut</span>
          <div className="hero__slider-track" ref={track}>
            <span className="hero__slider-fill" ref={fill} />
            <button
              className="hero__slider-handle"
              ref={handle}
              role="slider"
              tabIndex={0}
              aria-label="Dad seçimi"
              aria-valuemin={1}
              aria-valuemax={N}
              aria-valuenow={activeIndex + 1}
              aria-valuetext={flavor.name}
              onKeyDown={handleSliderKey}
            >
              <span className="hero__slider-dot" />
            </button>
          </div>
        </div>

        <div className="hero__cta">
          <button className="btn btn--solid" onClick={() => runOpen(activeIndex)}>
            <span className="btn__dot" />
            Qapağı aç
          </button>
        </div>

        <nav className="hero__rail" aria-label="Dadlar">
          <div className="hero__rail-inner">
            {FLAVORS.map((f, i) => (
              <button
                key={f.id}
                className={`hero__rail-item${i === activeIndex ? ' is-active' : ''}`}
                onClick={() => {
                  holdAuto.current();
                  go(i);
                }}
              >
                <i className="hero__rail-swatch" />
                <span className="hero__rail-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="hero__rail-name">{f.name}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
