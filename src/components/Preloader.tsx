import { useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { useIsoLayoutEffect } from '../hooks/useIsoLayoutEffect';
import { FLAVORS } from '../data/flavors';

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useIsoLayoutEffect(() => {
    document.body.classList.add('is-locked');

    const ctx = gsap.context(() => {
      gsap.from('.preload__word span', {
        yPercent: 110,
        duration: 1,
        stagger: 0.055,
        ease: 'bizon',
      });

      /* Hold the curtain until the can shots are decoded — the hero
         is nothing without them. */
      let loaded = 0;
      const total = FLAVORS.length;
      const bar = root.current?.querySelector<HTMLElement>('.preload__bar i') ?? null;

      const tick = () => {
        loaded += 1;
        if (bar) gsap.to(bar, { width: `${(loaded / total) * 100}%`, duration: 0.4 });
        if (loaded === total) finish();
      };

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        gsap
          .timeline({
            delay: 0.25,
            onComplete: () => {
              document.body.classList.remove('is-locked');
              setGone(true);
              onDone();
            },
          })
          .to('.preload__word span', { yPercent: -110, duration: 0.7, stagger: 0.04 })
          .to('.preload__bar', { opacity: 0, duration: 0.3 }, '-=0.5')
          .to(root.current, { yPercent: -100, duration: 0.9, ease: 'bizonIn' }, '-=0.25');
      };

      FLAVORS.forEach((f) => {
        const img = new Image();
        img.onload = tick;
        img.onerror = tick;
        img.src = f.can;
      });

      /* Never strand the visitor behind a stalled asset. */
      const bail = window.setTimeout(finish, 6000);
      return () => window.clearTimeout(bail);
    }, root);

    return () => {
      document.body.classList.remove('is-locked');
      ctx.revert();
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div className="preload" ref={root}>
      <div style={{ textAlign: 'center' }}>
        <div className="preload__word">
          {'BIZON'.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className="preload__bar">
          <i />
        </div>
      </div>
    </div>
  );
}
