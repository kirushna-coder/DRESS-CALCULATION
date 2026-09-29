// ============================================================
// Fabriplay AI – Pattern Recommendation Module
// Visually attractive cards showing pattern type, required components with checkmarks, fit, and basic construction info
// ============================================================

import React from 'react';
import { Layers, Check, Scissors, Sparkles, Sliders } from 'lucide-react';
import type { DressType, Measurements } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface PatternRecommendationModuleProps {
  dressType: DressType;
  measurements: Measurements;
}

const PatternRecommendationModule: React.FC<PatternRecommendationModuleProps> = ({
  dressType,
  measurements: m,
}) => {
  const dressInfo = DRESS_TYPE_INFO[dressType] || DRESS_TYPE_INFO.SHIRT;

  // Fit determination based on measurements & garment
  let fitType = dressInfo.fitType;
  if (m.gender === 'male' && m.shoulderWidth >= 17) {
    fitType = 'Athletic V-Taper Fit';
  } else if ((m.waist || 30) > (m.bust || 36)) {
    fitType = 'Comfort / Relaxed Fit';
  } else if (dressType === 'BLOUSE') {
    fitType = 'Princess Cut Slim Fit';
  } else if (dressType === 'FROCK' || dressType === 'SKIRT') {
    fitType = 'Flared A-Line Fit';
  }

  return (
    <div className="pattern-recommendation-card" id="step-pattern">
      <div className="card-header-row">
        <div className="header-title-wrap">
          <div className="icon-badge violet">
            <Scissors size={18} />
          </div>
          <div>
            <h2 className="card-title">Pattern Recommendation</h2>
            <p className="card-sub">Traditional patternmaking template &amp; construction guidelines</p>
          </div>
        </div>
        <span className="pattern-badge-ai">
          <Sparkles size={11} /> Smart Pattern Draft
        </span>
      </div>

      <div className="pattern-main-grid">
        {/* Pattern Type Card */}
        <div className="pattern-sub-card highlight-border">
          <div className="sub-card-header">
            <Layers size={16} className="text-violet" />
            <span className="sub-label">Pattern Type</span>
          </div>
          <h3 className="pattern-name">{dressInfo.patternType}</h3>
          <p className="pattern-desc">
            Custom drafted template engineered for {dressInfo.label} with precise seam allowances and ease.
          </p>
        </div>

        {/* Fit Type Card */}
        <div className="pattern-sub-card">
          <div className="sub-card-header">
            <Sliders size={16} className="text-emerald" />
            <span className="sub-label">Recommended Fit</span>
          </div>
          <h3 className="fit-name">{fitType}</h3>
          <p className="fit-desc">
            Calculated ease allowance: Bust {m.ease || 1.5}", Waist {m.ease || 1.5}", Hip 2.0" for natural movement.
          </p>
        </div>
      </div>

      {/* Required Pattern Components Section */}
      <div className="pattern-components-card-section">
        <h4 className="section-small-title">
          <Check size={14} className="text-emerald" />
          <span>Required Pattern Components:</span>
        </h4>

        <div className="components-checklist-grid">
          {dressInfo.patternComponents.map((comp, idx) => (
            <div key={idx} className="checklist-item">
              <div className="check-box-icon">
                <Check size={14} />
              </div>
              <span className="comp-text">{comp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Construction Information */}
      <div className="construction-info-card-section">
        <h4 className="section-small-title">
          <Scissors size={14} className="text-amber" />
          <span>Basic Construction Information:</span>
        </h4>
        <p className="construction-details-text">{dressInfo.constructionInfo}</p>
      </div>
    </div>
  );
};

export default PatternRecommendationModule;
