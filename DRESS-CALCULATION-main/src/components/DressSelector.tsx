// ============================================================
// SmartTailor AI – Dress Type Selection Module
// Visual interactive cards for 7+ garment silhouettes
// ============================================================

import React from 'react';
import { Shirt, CheckCircle } from 'lucide-react';
import type { DressType } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface DressSelectorProps {
  selectedDress: DressType;
  onSelectDress: (dress: DressType) => void;
}

const DRESS_TYPES_LIST: DressType[] = [
  'SHIRT',
  'PANT',
  'TSHIRT',
  'KURTA',
  'BLOUSE',
  'CHUDIDAR',
  'FROCK',
  'SKIRT',
];

const DressSelector: React.FC<DressSelectorProps> = ({
  selectedDress,
  onSelectDress,
}) => {
  return (
    <div className="dress-selector-card">
      <div className="selector-header">
        <div className="selector-title-group">
          <div className="selector-icon-wrap">
            <Shirt size={18} />
          </div>
          <div>
            <h2 className="selector-title">Select Garment / Dress Type</h2>
            <p className="selector-sub">
              Choose silhouette to automatically adapt tailoring formulas &amp; seam calculations
            </p>
          </div>
        </div>
        <span className="count-badge">{DRESS_TYPES_LIST.length} Garments</span>
      </div>

      <div className="dress-cards-grid">
        {DRESS_TYPES_LIST.map((typeKey) => {
          const info = DRESS_TYPE_INFO[typeKey];
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DressSelector;
