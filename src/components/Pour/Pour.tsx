import { useCallback, useRef, useState } from 'react';
import { gsap, ScrollTrigger, Draggable, isMobile } from '../../lib/gsap';
import { useIsoLayoutEffect } from '../../hooks/useIsoLayoutEffect';
import type { Flavor } from '../../data/flavors';
import './Pour.css';

/* The film is a 173-frame WebP sequence: can → lid pops → pour → iced glass. */
const TOTAL = 173;
/** Logical frame where the lid is fully open and the tilt begins. */
const OPEN_END = 45;
/** Share of the pinned scroll reserved for the opening gate. */
const GATE_P = 0.12;

const pad = (n: number) => String(n).padStart(3, '0');

type Props = { flavor: Flavor };

export default function Pour({ flavor }: Props) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const gate = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const railFill = useRef<HTMLElement>(null);
  const railLabel = useRef<HTMLSpanElement>(null);

  const images = useRef<HTMLImageElement[]>([]);
  const stepRef = useRef(1);
  const opened = useRef(false);
  const dragP = useRef(0);
  /** Index of the frame currently painted; -1 until the first real paint. */
  const painted = useRef(-1);

  const [ready, setReady] = useState(false);

  /* ---------------------------------------------------------------
     Canvas painting — cover-fit, DPR aware, repaints only on change.
     --------------------------------------------------------------- */
  const draw = useCallback((frame: number, force = false) => {
    const c = canvas.current;
    const list = images.current;
    if (!c || !list.length) return;

    const k = Math.min(list.length - 1, Math.max(0, Math.round(frame / stepRef.current)));
    if (k === painted.current && !force) return;

    const img = list[k];
    // Not decoded yet — leave the last good frame up rather than flashing.
    if (!img || !img.complete || !img.naturalWidth) return;

    const ctx = c.getContext('2d');
    if (!ctx) return;

    painted.current = k;

    const { width: cw, height: ch } = c;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }, []);

  const resize = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(c.clientWidth * dpr);
    c.height = Math.round(c.clientHeight * dpr);
    draw(Math.max(painted.current, 0) * stepRef.current, true);
  }, [draw]);

  /* ---------------------------------------------------------------
     Preload. Mobile gets a half-rate, half-size set so memory and
     bandwidth stay sane on a phone.
     --------------------------------------------------------------- */
  useIsoLayoutEffect(() => {
    const mobile = isMobile();
    const step = mobile ? 2 : 1;
    const dir = mobile ? 'video/seq-sm' : 'video/seq';
    stepRef.current = step;

    const list: HTMLImageElement[] = [];
    for (let f = 0; f < TOTAL; f += step) list.push(new Image());
    images.current = list;

    let loaded = 0;
    let cancelled = false;
    const total = list.length;
    const bar = document.querySelector<HTMLElement>('.pour__loader-bar i');

    list.forEach((img, k) => {
      img.decoding = 'async';
      const done = () => {
        if (cancelled) return;
        loaded += 1;
        if (bar) bar.style.width = `${(loaded / total) * 100}%`;
        if (k === 0) draw(0, true);
        if (loaded === total) setReady(true);
      };
      img.onload = done;
      img.onerror = done;
      img.src = `${dir}/f_${pad(k * step + 1)}.webp`;
    });

    return () => {
      cancelled = true;
      list.forEach((i) => {
        i.onload = null;
        i.onerror = null;
      });
      images.current = [];
    };
  }, [draw]);

  /* ---------------------------------------------------------------
     Scroll runway + the pull-tab gate.
     --------------------------------------------------------------- */
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      resize();
      window.addEventListener('resize', resize);

      let st: ScrollTrigger | null = null;
      let nudge: gsap.core.Tween | null = null;

      /** Finish the lid-pop and dismiss the gate. */
      const commitOpen = (fromDrag: boolean) => {
        if (opened.current) return;
        opened.current = true;
        nudge?.kill();

        const o = { f: dragP.current * OPEN_END };
        gsap.to(o, {
          f: OPEN_END,
          duration: fromDrag ? 0.45 : 0.3,
          ease: 'power3.out',
          onUpdate: () => draw(o.f),
        });

        gsap.fromTo(
          ring.current,
          { opacity: 0.9, scale: 0.4 },
          { opacity: 0, scale: 9, duration: 1, ease: 'power2.out' },
        );

        gsap.to(gate.current, { opacity: 0, y: 26, duration: 0.5, pointerEvents: 'none' });

        if (fromDrag && st) {
          gsap.to(window, {
            scrollTo: {
              y: st.start + (st.end - st.start) * (GATE_P + 0.04),
              autoKill: false,
            },
            duration: 1.2,
            ease: 'bizon',
          });
        }
      };

      const chapterEls = gsap.utils.toArray<HTMLElement>('.pour__ch', root.current);

      /** Everything that depends on scroll position, in one place so the
          initial state can be painted before the first scroll event. */
      const render = (p: number) => {
        if (!opened.current && p > 0.07) commitOpen(false);

        const frame = opened.current
          ? OPEN_END +
            gsap.utils.clamp(0, 1, (p - GATE_P) / (1 - GATE_P)) * (TOTAL - 1 - OPEN_END)
          : dragP.current * OPEN_END;
        draw(frame);

        if (railFill.current) railFill.current.style.height = `${p * 100}%`;
        if (railLabel.current)
          railLabel.current.textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;

        /* Chapter cross-fades, read straight off scroll progress. */
        const ramp = (a: number, b: number) => gsap.utils.clamp(0, 1, (p - a) / (b - a));
        const vis = [
          1 - ramp(0.1, 0.19),
          Math.min(ramp(0.2, 0.3), 1 - ramp(0.5, 0.6)),
          ramp(0.62, 0.72),
        ];
        chapterEls.forEach((el, i) => {
          const v = vis[i] ?? 0;
          el.style.opacity = String(v);
          el.style.setProperty('--ch-shift', `${(1 - v) * 28}px`);
        });
      };

      st = ScrollTrigger.create({
        trigger: root.current!,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.9}`,
        pin: pin.current,
        scrub: 0.5,
        onUpdate: (self) => render(self.progress),
        /* onUpdate does not fire at exactly progress 0, which would leave
           the first chapter invisible for anyone landing on the section. */
        onRefresh: (self) => render(self.progress),
      });

      render(0);

      /* Pull-tab: drag the handle across the track to pop the lid. */
      if (handle.current && track.current) {
        const maxX = () =>
          Math.max(1, track.current!.offsetWidth - handle.current!.offsetWidth - 10);

        const [drag] = Draggable.create(handle.current, {
          type: 'x',
          bounds: { minX: 0, maxX: maxX() },
          cursor: 'grab',
          activeCursor: 'grabbing',
          onPress() {
            nudge?.kill();
            gsap.set(this.target, { x: this.x });
          },
          onDrag() {
            dragP.current = gsap.utils.clamp(0, 1, this.x / maxX());
            if (fill.current) fill.current.style.width = `${dragP.current * 100}%`;
            draw(dragP.current * OPEN_END);
          },
          onRelease() {
            if (dragP.current > 0.72) {
              dragP.current = 1;
              gsap.to(this.target, { x: maxX(), duration: 0.25 });
              if (fill.current) gsap.to(fill.current, { width: '100%', duration: 0.25 });
              commitOpen(true);
            } else {
              dragP.current = 0;
              gsap.to(this.target, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });
              if (fill.current) gsap.to(fill.current, { width: '0%', duration: 0.4 });
              draw(0);
            }
          },
        });

        const applyBounds = () => drag.applyBounds({ minX: 0, maxX: maxX() });
        window.addEventListener('resize', applyBounds);

        /* Idle nudge so the handle reads as draggable. */
        nudge = gsap.to(handle.current, {
          x: 12,
          repeat: -1,
          yoyo: true,
          duration: 1.3,
          ease: 'sine.inOut',
        });

        return () => window.removeEventListener('resize', applyBounds);
      }
      return undefined;
    }, root);

    return () => {
      window.removeEventListener('resize', resize);
      ctx.revert();
    };
  }, [draw, resize]);

  return (
    <section className="pour" ref={root} id="pour">
      <div className="pour__pin" ref={pin}>
        <canvas className="pour__canvas" ref={canvas} aria-hidden />
        <div className="pour__wash" />
        <div className="pour__scrim" />

        {!ready && (
          <div className="pour__loader">
            <div className="pour__loader-inner">
              Kadrlar yüklənir
              <div className="pour__loader-bar">
                <i />
              </div>
            </div>
          </div>
        )}

        <div className="pour__chapters">
          <article className="pour__ch">
            <span className="pour__ch-num">01 — AÇILIŞ</span>
            <h3>
              Qapağı
              <br />
              aç
            </h3>
            <p>
              Alüminiumun altında 250 ml təzyiq var. Dəstəyi sürüşdür — qalanını
              fizika edir.
            </p>
          </article>

          <article className="pour__ch">
            <span className="pour__ch-num">02 — AXIN</span>
            <h3>
              Saniyədə
              <br />
              tam güc
            </h3>
            <p>
              Kəskin karbonizasiya, sıx formula. Kofein, taurin və B-kompleks ilk
              qurtumdan işə düşür.
            </p>
          </article>

          <article className="pour__ch">
            <span className="pour__ch-num">03 — BUZLU ZƏRBƏ</span>
            <h3>
              Buzun
              <br />
              üstünə
            </h3>
            <p>
              −4°C-də dad profili açılır. Sitrusun kəskinliyi yumşalır, bitiş uzanır.
            </p>
            <div className="pour__ch-can">
              <img src={flavor.can} alt="" aria-hidden />
              <div>
                <b>BIZON {flavor.display}</b>
                <small>
                  {flavor.volume} · {flavor.caffeine}
                </small>
              </div>
            </div>
          </article>
        </div>

        <div className="pour__rail" aria-hidden>
          <i ref={railFill} />
          <span ref={railLabel}>00%</span>
        </div>

        <div className="pour__gate" ref={gate}>
          <p className="pour__gate-label">BIZON {flavor.display}</p>
          <div className="pour__track" ref={track}>
            <div className="pour__track-fill" ref={fill} />
            <span className="pour__track-text">Qapağı açmaq üçün sürüşdürün</span>
            <button ref={handle} className="pour__handle" aria-label="Qapağı aç">
              <span className="pour__ring" ref={ring} />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
