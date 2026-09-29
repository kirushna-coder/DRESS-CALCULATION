// ============================================================
// SmartTailor AI – Dress Type Selection Module
// Category filtering (Women, Men, General) & Pattern Component breakdowns
// ============================================================

import React, { useState } from 'react';
import { Shirt, CheckCircle, Layers, Check } from 'lucide-react';
import type { DressType } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface DressSelectorProps {
  selectedDress: DressType;
  onSelectDress: (dress: DressType) => void;
}

type CategoryFilter = 'ALL' | 'WOMEN' | 'MEN' | 'GENERAL';

const ALL_DRESS_TYPES: DressType[] = [
  'FROCK',
  'SKIRT',
  'TOP',
  'BLOUSE',
  'SHIRT',
  'TSHIRT',
  'PANT',
  'JACKET',
  'KURTA',
  'CHUDIDAR',
  'SALWAR',
];

const DressSelector: React.FC<DressSelectorProps> = ({
  selectedDress,
  onSelectDress,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  const filteredTypes = ALL_DRESS_TYPES.filter((typeKey) => {
    const info = DRESS_TYPE_INFO[typeKey];
    if (!info) return false;
    if (activeCategory === 'ALL') return true;
    return info.category === activeCategory;
  });

  const currentInfo = DRESS_TYPE_INFO[selectedDress] || DRESS_TYPE_INFO.SHIRT;

  return (
    <div className="dress-selector-card" id="step-dress">
      {/* ── Header & Category Filter ─────────────────────── */}
      <div className="selector-header">
        <div className="selector-title-group">
          <div className="selector-icon-wrap">
            <Shirt size={18} />
          </div>
          <div>
            <h2 className="selector-title">Select Dress / Garment Type</h2>
            <p className="selector-sub">
              Automatically updates pattern specs, fabric recommendations, and measurement formulas
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-filter-pills" role="tablist" aria-label="Garment Categories">
          <button
            type="button"
            className={`cat-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            All
          </button>
          <button
            type="button"
            className={`cat-pill ${activeCategory === 'WOMEN' ? 'active' : ''}`}
            onClick={() => setActiveCategory('WOMEN')}
          >
            Women
          </button>
          <button
            type="button"
            className={`cat-pill ${activeCategory === 'MEN' ? 'active' : ''}`}
            onClick={() => setActiveCategory('MEN')}
          >
            Men
          </button>
          <button
            type="button"
            className={`cat-pill ${activeCategory === 'GENERAL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('GENERAL')}
          >
            General
          </button>
        </div>
      </div>

      {/* ── Garment Cards Grid ───────────────────────────── */}
      <div className="dress-cards-grid">
        {filteredTypes.map((typeKey) => {
          const info = DRESS_TYPE_INFO[typeKey];
          if (!info) return null;
          const isSelected = selectedDress === typeKey;

          return (
            <div
              key={typeKey}
              className={`dress-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDress(typeKey)}
              role="button"
              tabIndex={0}
            >
              {isSelected && (
                <div className="selected-check-badge">
                  <CheckCircle size={16} />
                </div>
              )}

              <div className="dress-card-icon-wrap">
                <span className="dress-emoji">{info.icon}</span>
              </div>

              <div className="dress-card-content">
                <div className="dress-card-title-row">
                  <h3 className="dress-name">{info.label}</h3>
                  <span className="gender-tag">{info.gender}</span>
                </div>
                <p className="dress-desc">{info.description}</p>
              </div>

              <div className="dress-card-footer">
                <span className="stitching-base-tag">
                  Base Stitch: ₹{info.baseStitchingCharge}
                </span>
                <span className="rec-fab-tag">Rec: {info.recommendedFabric}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Selected Garment Details & Pattern Components breakdown ── */}
      <div className="selected-dress-breakdown-box">
        <div className="breakdown-header-row">
          <div className="breakdown-title-wrap">
            <Layers size={16} className="layers-icon" />
            <h3>Selected: {currentInfo.label}</h3>
          </div>
          <span className="fit-tag-pill">{currentInfo.fitType}</span>
        </div>

        <p className="selected-garment-desc">{currentInfo.description}</p>

        {/* Pattern Components List */}
        <div className="pattern-components-display">
          <span className="comp-label">Pattern Components:</span>
          <div className="comp-chips-grid">
            {currentInfo.patternComponents.map((comp, i) => (
              <div key={i} className="comp-chip-badge">
                <Check size={12} className="check-icon" />
                <span>{comp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressSelector;
