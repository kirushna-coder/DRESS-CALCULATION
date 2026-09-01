// ============================================================
// Fabriplay – Unit Conversion Utilities
// ============================================================

export const IN_TO_CM = 2.54;
export const CM_TO_IN = 1 / IN_TO_CM;

/** Convert inches to centimetres, rounded to 1 decimal */
export const inchToCm = (inches: number): number =>
  Math.round(inches * IN_TO_CM * 10) / 10;

/** Convert centimetres to inches, rounded to 2 decimals */
export const cmToInch = (cm: number): number =>
  Math.round((cm * CM_TO_IN) * 100) / 100;

/** Format a value for display with its unit */
export const formatValue = (value: number, unit: 'in' | 'cm'): string => {
  if (unit === 'cm') return `${inchToCm(value)} cm`;
  return `${value}"`;
};

/** Convert a full Measurements object from cm → in for internal storage */
export const measurementsCmToIn = <T extends Record<string, number>>(obj: T): T => {
  const result: Record<string, number> = {};
  for (const key in obj) {
    result[key] = cmToInch(obj[key]);
  }
  return result as T;
};

/** Convert a full Measurements object from in → cm for display */
export const measurementsInToCm = <T extends Record<string, number>>(obj: T): T => {
  const result: Record<string, number> = {};
  for (const key in obj) {
    result[key] = inchToCm(obj[key]);
  }
  return result as T;
};
