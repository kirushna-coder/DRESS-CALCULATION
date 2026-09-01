// ============================================================
// Fabriplay – Header Component
// ============================================================

import React from 'react';
import { Scissors, Ruler } from 'lucide-react';
import type { PatternType, Unit } from '../types';
import { PATTERN_TYPES, PATTERN_REGISTRY } from '../patterns/patternRegistry';

interface HeaderProps {
  unit: Unit;
  onUnitChange: (u: Unit) => void;
  patternType: PatternType;
  onPatternTypeChange: (t: PatternType) => void;
}

const Header: React.FC<HeaderProps> = ({
  unit,
  onUnitChange,
  patternType,
  onPatternTypeChange,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo">
          <Scissors size={22} strokeWidth={2} />
        </div>
        <div className="header-title-group">
          <h1 className="header-title">FABRIPLAY</h1>
          <p className="header-subtitle">
            Generate accurate dress patterns using measurements &amp; mathematical calculations.
          </p>
        </div>
      </div>

      <div className="header-controls">
        {/* Pattern type selector */}
        <div className="control-group">
          <Ruler size={14} className="control-icon" />
          <select
            id="pattern-type-select"
            className="select-input"
            value={patternType}
            onChange={(e) => onPatternTypeChange(e.target.value as PatternType)}
          >
            {PATTERN_TYPES.map((t) => (
              <option key={t} value={t}>
                {PATTERN_REGISTRY[t].label}
              </option>
            ))}
          </select>
        </div>

        {/* Unit toggle */}
        <div className="unit-toggle" role="group" aria-label="Unit selection">
          <button
            id="unit-inch"
            className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
            onClick={() => onUnitChange('in')}
          >
            Inches
          </button>
          <button
            id="unit-cm"
            className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
            onClick={() => onUnitChange('cm')}
          >
            cm
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
