// ============================================================
// Fabriplay – usePatternCalculation hook
// Runs the pattern calculation engine and memoises the result.
// Debounced 120 ms so the SVG updates smoothly during typing.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import type { Measurements, PatternData, PatternType, PantOptions } from '../types';
import { PATTERN_REGISTRY, calculatePantPattern } from '../patterns/patternRegistry';

export function usePatternCalculation(
  measurements: Measurements,
  scale: number,
  patternType: PatternType,
  pantOptions?: PantOptions
) {
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce recalculation
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        if (patternType === 'PANT') {
          const data = calculatePantPattern(measurements, scale, pantOptions);
          setPatternData(data);
        } else {
          const def = PATTERN_REGISTRY[patternType];
          const data = def.calculate(measurements, scale);
          setPatternData(data);
        }
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Calculation error');
      }
    }, 120);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [measurements, scale, patternType, pantOptions]);

  return { patternData, error };
}
