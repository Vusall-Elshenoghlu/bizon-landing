import { useEffect, useLayoutEffect } from 'react';

/** useLayoutEffect that stays quiet during SSR / prerender. */
export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
