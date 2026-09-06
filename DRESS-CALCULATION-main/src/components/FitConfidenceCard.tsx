// ============================================================
// FabriPlay – Fit Confidence Score Result Card
// Interactive UI component rendering circular progress meter & tailoring advice
// ============================================================

import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Sliders } from 'lucide-react';
import type { Measurements, DressType } from '../types';
import {
  calculateFitConfidenceScore,
  type FitPreferenceOption,
} from '../utils/fitConfidenceEngine';

interface FitConfidenceCardProps {
  measurements: Measurements;
  dressType?: DressType;
  selectedFit?: FitPreferenceOption;
  onFitChange?: (fit: FitPreferenceOption) => void;
  onApplyEase?: (ease: number) => void;
  className?: string;
}

const FitConfidenceCard: React.FC<FitConfidenceCardProps> = ({
  measurements,
  dressType = 'FROCK',
  selectedFit = 'Regular',
  onFitChange,
  onApplyEase,
  className = '',
}) => {
  const result = calculateFitConfidenceScore(measurements, dressType, selectedFit);

  const getStatusColorClass = (status: string) => {
    if (status === 'Excellent Match') return 'status-excellent';
    if (status === 'Good Match') return 'status-good';
    return 'status-needs-adj';
  };

  const strokeDashoffset = 283 - (283 * result.score) / 100;

  return (
    <div className={`fit-confidence-card ${className}`}>
      <div className="fit-card-header">
        <div className="fit-header-title">
          <Sparkles className="fit-sparkle-icon" size={18} />
          <h3>Fit Confidence Score</h3>
        </div>
        <span className={`fit-status-badge ${getStatusColorClass(result.status)}`}>
          {result.status}
        </span>
      </div>

      <div className="fit-score-body">
        {/* Animated Circular Progress Meter */}
        <div className="fit-meter-container">
          <svg className="fit-circular-meter" viewBox="0 0 100 100">
            <circle className="meter-bg-circle" cx="50" cy="50" r="45" />
            <circle
              className={`meter-progress-circle ${getStatusColorClass(result.status)}`}
              cx="50"
              cy="50"
              r="45"
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="meter-text-overlay">
            <span className="meter-number">{result.score}%</span>
            <span className="meter-label">Match</span>
          </div>
        </div>

        {/* Fit Preference Pills */}
        <div className="fit-preference-picker">
          <div className="picker-label">
            <Sliders size={13} />
            <span>Target Fit:</span>
          </div>
          <div className="fit-pills-row">
            {(['Slim', 'Regular', 'Loose', 'Comfort'] as FitPreferenceOption[]).map((fit) => (
              <button
                key={fit}
                type="button"
                className={`fit-pill-btn ${selectedFit === fit ? 'active' : ''}`}
                onClick={() => {
                  if (onFitChange) onFitChange(fit);
                  if (onApplyEase) {
                    const easeVal = fit === 'Slim' ? 1.5 : fit === 'Loose' ? 3.0 : fit === 'Comfort' ? 3.5 : 2.0;
                    onApplyEase(easeVal);
                  }
                }}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="fit-summary-text">
        Your measurements are evaluated for selected <strong>{result.fitPreference} Fit</strong> with{' '}
        <strong>{result.completenessPercent}% profile completeness</strong>.
      </p>

      {/* Areas breakdown */}
      <div className="fit-breakdown-grid">
        {/* Accurate Areas */}
        {result.accurateAreas.length > 0 && (
          <div className="fit-breakdown-box accurate-box">
            <div className="box-title text-emerald">
              <CheckCircle2 size={15} />
              <span>Accurate Proportion Areas</span>
            </div>
            <ul>
              {result.accurateAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Adjustment Needed Areas */}
        {result.adjustmentAreas.length > 0 && (
          <div className="fit-breakdown-box adjustment-box">
            <div className="box-title text-amber">
              <AlertTriangle size={15} />
              <span>Areas That May Need Adjustment</span>
            </div>
            <ul>
              {result.adjustmentAreas.map((adj, idx) => (
                <li key={idx}>{adj}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tailoring Suggestions */}
        {result.tailoringSuggestions.length > 0 && (
          <div className="fit-breakdown-box suggestions-box">
            <div className="box-title text-indigo">
              <Lightbulb size={15} />
              <span>Tailoring &amp; Cutting Suggestions</span>
            </div>
            <ul>
              {result.tailoringSuggestions.map((sug, idx) => (
                <li key={idx}>{sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitConfidenceCard;
