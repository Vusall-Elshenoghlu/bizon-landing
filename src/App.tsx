import { useCallback, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from './lib/gsap';
import { useIsoLayoutEffect } from './hooks/useIsoLayoutEffect';
import { FLAVORS } from './data/flavors';
import Preloader from './components/Preloader';
import Hero from './components/Hero/Hero';
import Pour from './components/Pour/Pour';
import { Nav, Marquee, Spec, FlavorGrid, Curve, Cta, Footer } from './components/Sections';
import './components/Sections/Sections.css';

const BAND = [
  'Charge Your Power',
  '250 ML',
  'Zero Compromise',
  'Bizon Energy',
  'Oyat',
];

export default function App() {
  const [active, setActive] = useState(0);
  const [booted, setBooted] = useState(false);
  const jump = useRef<((i: number) => void) | null>(null);

  const flavor = FLAVORS[active];

  /* ScrollTrigger measures against a layout that the preloader was
     covering — refresh once the curtain is up. */
  const handleBoot = useCallback(() => {
    setBooted(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  useIsoLayoutEffect(() => {
    if (!booted) return;
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('orientationchange', onResize);
    return () => window.removeEventListener('orientationchange', onResize);
  }, [booted]);

  /** Hero committed to a flavor — hand the visitor to the pour film. */
  const handleOpen = useCallback(() => {
    const el = document.getElementById('pour');
    if (!el) return;
    gsap.to(window, {
      scrollTo: { y: el, autoKill: false },
      duration: 1.2,
      ease: 'bizon',
    });
  }, []);

  /** A card down the page was picked — send the hero back to that flavor. */
  const handlePick = useCallback((i: number) => {
    setActive(i);
    jump.current?.(i);
  }, []);

  return (
    <>
      <div className="grain" />
      <Preloader onDone={handleBoot} />
      <Nav />

      <main id="top">
        <Hero
          activeIndex={active}
          onChange={setActive}
          onOpen={handleOpen}
          registerJump={(fn) => {
            jump.current = fn;
          }}
        />
        <Pour flavor={flavor} />
        <Marquee items={BAND} />
        <Spec />
        <FlavorGrid onPick={handlePick} />
        <Curve />
        <Cta />
      </main>

      <Footer />
    </>
  );
}
