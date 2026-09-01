// ============================================================
// Fabriplay – MeasurementForm Component
// Left-side panel: all input fields + action buttons.
// ============================================================

import React from 'react';
import { RefreshCw, Save, FileDown, Image } from 'lucide-react';
import type { Measurements, Unit } from '../types';
import type { CadMeasurementKey } from '../calculations/onePieceDress';
import { MEASUREMENT_BOUNDS } from '../calculations/onePieceDress';
import { inchToCm, cmToInch } from '../utils/unitConversion';

interface MeasurementFormProps {
  measurements: Measurements;
  unit: Unit;
  onChange: (m: Measurements) => void;
  onGenerate: () => void;
  onReset: () => void;
  onSave: () => void;
  onDownloadPDF: () => void;
  onDownloadSVG: () => void;
  isSaving?: boolean;
}

type MeasurementKey = CadMeasurementKey;

// Fields shown in the form (ordered for UX)
const FIELD_ORDER: MeasurementKey[] = [
  'dressSize',
  'fullLength',
  'shoulderWidth',
  'neckWidth',
  'neckDepth',
  'armholeDepth',
  'bust',
  'waist',
  'hip',
  'bottomWidth',
  'flare',
  'ease',
];

const MeasurementForm: React.FC<MeasurementFormProps> = ({
  measurements,
  unit,
  onChange,
  onGenerate,
  onReset,
  onSave,
  onDownloadPDF,
  onDownloadSVG,
  isSaving,
}) => {
  const [errors, setErrors] = React.useState<Partial<Record<MeasurementKey, string>>>({});

  // Convert internal inch value → display value for the input
  const toDisplay = (key: MeasurementKey, val: number | undefined): string => {
    const num = val ?? 0;
    if (key === 'dressSize') return String(num);
    return String(unit === 'cm' ? inchToCm(num) : num);
  };

  // Validate and update a single field
  const handleChange = (key: MeasurementKey, raw: string) => {
    const numRaw = parseFloat(raw);
    if (isNaN(numRaw)) {
      setErrors((e) => ({ ...e, [key]: 'Must be a number' }));
      return;
    }

    // Convert cm → in for storage if needed
    const inchVal = unit === 'cm' && key !== 'dressSize' ? cmToInch(numRaw) : numRaw;

    const bounds = MEASUREMENT_BOUNDS[key];
    if (inchVal < bounds.min || inchVal > bounds.max) {
      setErrors((e) => ({
        ...e,
        [key]: `Range: ${bounds.min}–${bounds.max} ${bounds.unit || ''}`,
      }));
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }

    onChange({ ...measurements, [key]: inchVal });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <aside className="measurement-panel">
      <div className="panel-header">
        <h2 className="panel-title">Measurements</h2>
        <span className="panel-badge">Size {measurements.dressSize}</span>
      </div>

      <div className="form-fields">
        {FIELD_ORDER.map((key) => {
          const bounds = MEASUREMENT_BOUNDS[key];
          const displayVal = toDisplay(key, measurements[key]);
          const hasError = Boolean(errors[key]);
          const isSize = key === 'dressSize';

          return (
            <div key={key} className={`form-field${hasError ? ' has-error' : ''}`}>
              <label htmlFor={`field-${key}`} className="field-label">
                {bounds.label}
              </label>
              <div className="field-input-row">
                <input
                  id={`field-${key}`}
                  type="number"
                  className={`field-input${hasError ? ' error' : ''}`}
                  value={displayVal}
                  min={isSize ? bounds.min : undefined}
                  max={isSize ? bounds.max : undefined}
                  step={isSize ? 1 : 0.1}
                  onChange={(e) => handleChange(key, e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `err-${key}` : undefined}
                />
                {!isSize && (
                  <span className="field-unit">
                    {unit === 'cm' ? 'cm' : '"'}
                  </span>
                )}
              </div>
              {hasError && (
                <span id={`err-${key}`} className="field-error" role="alert">
                  {errors[key]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Action Buttons ─────────────────────────────── */}
      <div className="action-buttons">
        <button
          id="btn-generate"
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={hasErrors}
        >
          ✂️ Generate Pattern
        </button>

        <div className="btn-row">
          <button id="btn-reset" className="btn btn-secondary" onClick={onReset}>
            <RefreshCw size={14} /> Reset
          </button>
          <button
            id="btn-save"
            className={`btn btn-secondary${isSaving ? ' saving' : ''}`}
            onClick={onSave}
          >
            <Save size={14} /> {isSaving ? 'Saved!' : 'Save'}
          </button>
        </div>

        <div className="btn-row">
          <button id="btn-download-pdf" className="btn btn-outline" onClick={onDownloadPDF}>
            <FileDown size={14} /> PDF
          </button>
          <button id="btn-download-svg" className="btn btn-outline" onClick={onDownloadSVG}>
            <Image size={14} /> SVG
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MeasurementForm;
