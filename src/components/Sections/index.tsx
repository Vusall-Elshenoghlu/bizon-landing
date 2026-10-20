import { useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useIsoLayoutEffect } from '../../hooks/useIsoLayoutEffect';
import { FLAVORS } from '../../data/flavors';
import './Sections.css';

/* ============================================================
   Nav + reading progress
   ============================================================ */
export function Nav() {
  const bar = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: () => document.body.scrollHeight - window.innerHeight,
        onUpdate: (self) => {
          if (bar.current) bar.current.style.width = `${self.progress * 100}%`;
        },
      });
      gsap.from('.nav', { y: -40, opacity: 0, duration: 1, delay: 0.4 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="nav__progress" ref={bar} />
      <header className="nav">
        <a className="nav__logo" href="#top">
          BIZON <small>ENERGY</small>
        </a>
        <nav className="nav__links">
          <a href="#lineup">Dadlar</a>
          <a href="#pour">Formula</a>
          <a href="#spec">Tərkib</a>
          <a href="#shop">Sifariş</a>
        </nav>
      </header>
    </>
  );
}

/* ============================================================
   Marquee — infinite band, skews with scroll velocity
   ============================================================ */
export function Marquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const row = root.current!.querySelector<HTMLElement>('.marquee__row')!;
      const loop = gsap.to(row, {
        xPercent: -50,
        duration: 26,
        ease: 'none',
        repeat: -1,
      });

      /* Scroll velocity bends the band — speeds it up and skews it. */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-18, 18, self.getVelocity() / 180);
          gsap.to(row, { skewX: -v * 0.5, duration: 0.5, overwrite: 'auto' });
          loop.timeScale(gsap.utils.clamp(0.4, 5, 1 + Math.abs(v) * 0.25));
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const content = (
    <>
      {items.map((t, i) => (
        <span key={i}>
          {t}
          <i />
        </span>
      ))}
    </>
  );

  return (
    <div className="marquee" ref={root} aria-hidden>
      <div className="marquee__row">
        {content}
        {content}
      </div>
    </div>
  );
}

/* ============================================================
   Spec — sticky can beside an annotated breakdown
   ============================================================ */
const SPEC_ROWS = [
  {
    title: 'Kofein',
    value: '80 mg',
    body: 'Bir fincan espresso ilə eyni doza. Mərkəzi sinir sistemini 15 dəqiqə ərzində oyadır.',
  },
  {
    title: 'Taurin',
    value: '1000 mg',
    body: 'Əzələ yığılması və maye balansı üçün amin turşusu. Kofeinlə birlikdə daha hamar təsir verir.',
  },
  {
    title: 'B-kompleks',
    value: 'B3 · B6 · B12',
    body: 'Qida maddələrinin enerjiyə çevrilməsində iştirak edir. Yorğunluğun azalmasına kömək edir.',
  },
  {
    title: 'İnositol',
    value: '50 mg',
    body: 'Hüceyrə siqnalizasiyasını dəstəkləyir. Formulanın sabitliyini və dadın balansını saxlayır.',
  },
  {
    title: 'Karbonizasiya',
    value: '3.1 vol',
    body: 'Yüksək təzyiqli qaz doyması — qapaq açılan anda eşidilən o səs buradan gəlir.',
  },
];

export function Spec() {
  const root = useRef<HTMLElement>(null);
  /* The ingredient breakdown is the same for every flavor, so it is shown
     on the Classic can — the blue BIZON the brand is known by. */
  const flavor = FLAVORS[0];

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.spec__row', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        scrollTrigger: { trigger: '.spec__rows', start: 'top 78%' },
      });

      gsap.from('.spec__visual img', {
        y: 70,
        opacity: 0,
        rotate: -8,
        duration: 1.3,
        scrollTrigger: { trigger: '.spec__visual', start: 'top 80%' },
      });

      /* Can turns slowly as the column scrolls past. */
      gsap.to('.spec__visual img', {
        rotate: 6,
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      gsap.to('.spec__ring', {
        rotate: 180,
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section spec" ref={root} id="spec">
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--accent">02 — Tərkib</p>
            <h2 className="display">
              Hər qutuda
              <br />
              nə var
            </h2>
          </div>
          <p className="lede">
            250 ml-lik alüminium qutu. Süni boya yoxdur, formula sabitdir — hansı
            dadı seçməyindən asılı olmayaraq enerji bazası eynidir.
          </p>
        </div>

        <div className="spec__grid">
          <div className="spec__visual">
            <div className="spec__visual-glow" />
            <div className="spec__ring" />
            <img src={flavor.can} alt={`BIZON ${flavor.name}`} />
          </div>

          <div className="spec__rows">
            {SPEC_ROWS.map((r, i) => (
              <div className="spec__row" key={r.title}>
                <span className="spec__row-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{r.title}</h4>
                  <p>{r.body}</p>
                </div>
                <b>{r.value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Flavor grid
   ============================================================ */
export function FlavorGrid({ onPick }: { onPick: (i: number) => void }) {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fcard', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.07,
        scrollTrigger: { trigger: '.fgrid', start: 'top 82%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section grid-sec" ref={root} id="shop">
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--accent">03 — Çeşid</p>
            <h2 className="display">
              {FLAVORS.length} dad,
              <br />
              bir güc
            </h2>
          </div>
          <p className="lede">
            Klassikdən Cyber-ə qədər. Birinə toxun — yuxarıdakı səhnə həmin dada
            keçsin.
          </p>
        </div>

        <div className="fgrid">
          {FLAVORS.map((f, i) => (
            <button
              className="fcard"
              key={f.id}
              style={{ ['--card' as string]: f.accent }}
              onClick={() => onPick(i)}
            >
              <span className="fcard__num">{String(i + 1).padStart(2, '0')}</span>
              <div className="fcard__shot">
                <img src={f.can} alt={`BIZON ${f.name}`} />
              </div>
              <h3>{f.name}</h3>
              <span className="fcard__tag">{f.tagline}</span>
              <div className="fcard__meta">
                <span>{f.volume}</span>
                <span>{f.caffeine}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Energy curve — the 12-hour effect window, drawn on scroll.
   ============================================================ */
const CURVE_MARKS = [
  { x: 18, label: '0 dəq', note: 'Qapaq açılır' },
  { x: 230, label: '15 dəq', note: 'Kofein qana keçir' },
  { x: 430, label: '1–2 saat', note: 'Pik fokus' },
  { x: 650, label: '6 saat', note: 'Sabit plato' },
  { x: 940, label: '12 saat', note: 'Yumşaq eniş' },
];

/* Rise, plateau, gentle decline — the shape of the formula's effect. */
const CURVE_D =
  'M0,290 C70,290 150,80 240,68 C350,54 420,96 560,106 C700,116 820,158 1000,212';

export function Curve() {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const line = root.current!.querySelector<SVGPathElement>('.ecurve__line')!;
      const dot = root.current!.querySelector<SVGCircleElement>('.ecurve__dot')!;
      const halo = root.current!.querySelector<SVGCircleElement>('.ecurve__halo')!;

      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set([dot, halo], { opacity: 0 });

      /* The line draws itself while the dot rides its leading edge. */
      const head = { p: 0 };
      gsap.to(head, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top 72%',
          end: 'bottom 78%',
          scrub: 0.9,
        },
        onUpdate: () => {
          line.style.strokeDashoffset = String(len * (1 - head.p));
          const pt = line.getPointAtLength(len * head.p);
          for (const el of [dot, halo]) {
            el.setAttribute('cx', String(pt.x));
            el.setAttribute('cy', String(pt.y));
          }
        },
      });

      gsap.to([dot, halo], {
        opacity: 1,
        duration: 0.5,
        scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
      });

      gsap.from('.ecurve__area', {
        opacity: 0,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 68%', once: true },
      });

      gsap.from('.ecurve__grid line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.1,
        stagger: 0.08,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      });

      gsap.from('.ecurve__mark', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section ecurve" ref={root} id="effect">
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--accent">04 — Təsir</p>
            <h2 className="display">
              Bir qutu,
              <br />
              on iki saat
            </h2>
          </div>
          <p className="lede">
            Kofein tək işləmir. Taurin və B-kompleks eniş anını yumşaldır — pik
            kəskin gəlir, plato uzun qalır, bitiş isə çırpınma olmadan keçir.
          </p>
        </div>

        <div className="ecurve__plot">
          <svg viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="ecurveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.38" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="ecurveLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>

            <g className="ecurve__grid">
              {[60, 130, 200, 270].map((y) => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} />
              ))}
            </g>

            <path className="ecurve__area" d={`${CURVE_D} L1000,320 L0,320 Z`} fill="url(#ecurveFill)" />
            <path className="ecurve__line" d={CURVE_D} fill="none" stroke="url(#ecurveLine)" />
            <circle className="ecurve__halo" r="16" />
            <circle className="ecurve__dot" r="5" />
          </svg>

          <div className="ecurve__marks">
            {CURVE_MARKS.map((m) => (
              <div className="ecurve__mark" key={m.label} style={{ left: `${m.x / 10}%` }}>
                <span className="ecurve__tick" />
                <strong>{m.label}</strong>
                <small>{m.note}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA — looping pour film behind an oversized headline
   ============================================================ */
export function Cta() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta h2', {
        yPercent: 18,
        opacity: 0,
        duration: 1.2,
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      });
      gsap.from('.cta__row .btn', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 60%' },
      });
      gsap.to('.cta__video', {
        scale: 1.14,
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      /* Only spend decode cycles while the band is actually on screen. */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          const v = video.current;
          if (!v) return;
          if (self.isActive) void v.play().catch(() => {});
          else v.pause();
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cta" ref={root}>
      <video
        className="cta__video"
        ref={video}
        src="video/pour.mp4"
        poster="video/poster.jpg"
        muted
        loop
        playsInline
        preload="none"
      />
      <div className="cta__overlay" />
      <div className="cta__inner">
        <p className="eyebrow eyebrow--accent">05 — Hazırsan?</p>
        <h2 className="display">
          Charge
          <br />
          <em>Your Power</em>
        </h2>
        <p className="lede" style={{ marginInline: 'auto' }}>
          Ən yaxın marketdə və onlayn. Qutunu götür, qapağı aç, davam et.
        </p>
        <div className="cta__row">
          <a className="btn btn--solid" href="#shop">
            <span className="btn__dot" />
            Sifariş et
          </a>
          <a className="btn btn--ghost" href="#lineup">
            Dadlara bax
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Footer
   ============================================================ */
export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__col">
            <h5>Məhsul</h5>
            <ul>
              {FLAVORS.slice(0, 4).map((f) => (
                <li key={f.id}>
                  <a href="#shop">{f.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <h5>Şirkət</h5>
            <ul>
              <li>
                <a href="#top">Haqqımızda</a>
              </li>
              <li>
                <a href="#top">Distribütorluq</a>
              </li>
              <li>
                <a href="#top">Karyera</a>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Əlaqə</h5>
            <ul>
              <li>
                <a href="#top">info@bizon.az</a>
              </li>
              <li>
                <a href="#top">+994 12 000 00 00</a>
              </li>
              <li>
                <a href="#top">Bakı, Azərbaycan</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="footer__word">BIZON</p>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} BIZON ENERGY</span>
          <span>Charge Your Power</span>
        </div>
      </div>
    </footer>
  );
}
