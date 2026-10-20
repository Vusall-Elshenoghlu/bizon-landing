import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, Draggable, Observer, ScrollToPlugin, CustomEase);

/** House easing curves — one expressive, one mechanical. */
CustomEase.create('bizon', '0.16, 1, 0.3, 1');
CustomEase.create('bizonIn', '0.7, 0, 0.84, 0');

gsap.defaults({ ease: 'bizon', duration: 0.9 });

export { gsap, ScrollTrigger, Draggable, Observer };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shared breakpoint helper so components agree on what "mobile" means. */
export const isMobile = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches;
