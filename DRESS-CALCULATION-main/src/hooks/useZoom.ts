// ============================================================
// Fabriplay – useZoom hook
// Manages SVG scale (px per inch) with zoom controls.
// ============================================================

import { useState, useCallback } from 'react';

const MIN_SCALE = 4;    // 4 px / inch
const MAX_SCALE = 24;   // 24 px / inch
const DEFAULT_SCALE = 8; // 8 px / inch  (good for a ~58" dress on screen)
const STEP = 1;

export function useZoom(initialScale = DEFAULT_SCALE) {
  const [scale, setScale] = useState(initialScale);

  const zoomIn = useCallback(() =>
    setScale((s) => Math.min(s + STEP, MAX_SCALE)), []);

  const zoomOut = useCallback(() =>
    setScale((s) => Math.max(s - STEP, MIN_SCALE)), []);

  const resetZoom = useCallback(() => setScale(DEFAULT_SCALE), []);

  const setExact = useCallback(
    (v: number) => setScale(Math.min(Math.max(v, MIN_SCALE), MAX_SCALE)),
    []
  );

  return { scale, zoomIn, zoomOut, resetZoom, setExact, MIN_SCALE, MAX_SCALE };
}
