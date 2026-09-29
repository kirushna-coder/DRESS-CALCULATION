// ============================================================
// Fabriplay AI – Fabric Requirement Calculator Section
// Inputs: Dress Type, Height, Selected Fit, Optional Sleeve Type
// Output: Estimated Fabric Required (with mandatory label and disclaimer)
// ============================================================

import React from 'react';
import { Ruler, AlertCircle } from 'lucide-react';
import type { DressType, Measurements, FabricType, FabricCalculationResult } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface FabricRequirementCalculatorProps {
  dressType: DressType;
  fabricType: FabricType;
  measurements: Measurements;
  calculation: FabricCalculationResult;
  onChangeMeasurements: (m: Measurements) => void;
}

const FabricRequirementCalculatorSection: React.FC<FabricRequirementCalculatorProps> = ({
  dressType,
  measurements: m,
  calculation: calc,
  onChangeMeasurements,
}) => {
  const dressInfo = DRESS_TYPE_INFO[dressType] || DRESS_TYPE_INFO.SHIRT;

  const handleSleeveTypeChange = (sleeveType: Measurements['sleeveType']) => {
    onChangeMeasurements({ ...m, sleeveType });
  };

  return (
    <div className="fabric-calculator-section-card" id="step-calculator">
      {/* Header */}
      <div className="card-header-row">
        <div className="header-title-wrap">
          <div className="icon-badge emerald">
            <Ruler size={18} />
          </div>
          <div>
            <h2 className="card-title">Fabric Requirement Calculator</h2>
            <p className="card-sub">
              Calculates fabric consumption based on garment silhouette, height, fit, and sleeve style
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls Grid */}
      <div className="calc-inputs-row-grid">
        {/* Dress Type Display */}
        <div className="calc-input-box">
          <label className="calc-box-label">Selected Dress Type</label>
          <div className="read-only-pill">{dressInfo.label}</div>
        </div>

        {/* Height Display */}
        <div className="calc-input-box">
          <label className="calc-box-label">Customer Height</label>
          <div className="read-only-pill">{m.height || 165} cm ({Math.round((m.height || 165) / 2.54)} in)</div>
        </div>

        {/* Selected Fit Option */}
        <div className="calc-input-box">
          <label className="calc-box-label">Selected Fit Allowance</label>
          <select
            className="calc-select-input"
            value={m.ease || 1.5}
            onChange={(e) => onChangeMeasurements({ ...m, ease: parseFloat(e.target.value) || 1.5 })}
          >
            <option value={1.0}>Slim Fit (+1.0" Ease)</option>
            <option value={1.5}>Regular Fit (+1.5" Ease)</option>
            <option value={2.5}>Relaxed / Comfort Fit (+2.5" Ease)</option>
          </select>
        </div>

        {/* Optional Sleeve Type */}
        <div className="calc-input-box">
          <label className="calc-box-label">Optional Sleeve Type</label>
          <select
            className="calc-select-input"
            value={m.sleeveType || 'Long Sleeve'}
            onChange={(e) => handleSleeveTypeChange(e.target.value as Measurements['sleeveType'])}
          >
            <option value="Long Sleeve">Full / Long Sleeve</option>
            <option value="Short Sleeve">Short Sleeve</option>
            <option value="3/4 Sleeve">3/4 Length Sleeve</option>
            <option value="Sleeveless">Sleeveless</option>
          </select>
        </div>
      </div>

      {/* Primary Result Card */}
      <div className="estimated-fabric-output-box">
        <span className="output-mandatory-label">Estimated Fabric Requirement</span>
        <div className="meter-large-display">
          <span className="number">{calc.requiredLengthMeters}</span>
          <span className="unit">meters</span>
          <span className="sub-yards">({calc.requiredLengthYards} yards)</span>
        </div>
        <p className="layout-hint">
          Suggested Layout: <em>{calc.fabricLayoutSuggestion}</em>
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mandatory-disclaimer-box">
        <AlertCircle size={16} className="disclaimer-icon" />
        <div className="disclaimer-text">
          <strong>Important Sizing Disclaimer:</strong>
          <p>
            Estimated Fabric Requirement is provided as a guidance calculation.
            Do not claim it is an exact professional cutting measurement.
            Fabric consumption may vary depending on fabric pattern matching, plaid alignment, and tailor cutting style.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FabricRequirementCalculatorSection;
