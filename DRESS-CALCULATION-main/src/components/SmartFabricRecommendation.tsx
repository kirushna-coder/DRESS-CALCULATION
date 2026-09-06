// ============================================================
// FabriPlay – Smart Fabric Recommendation Card & Controls
// Renders recommended fabric, scores, rationale & Compare Fabrics modal launcher
// ============================================================

import React, { useState } from 'react';
import { Sparkles, Layers, SlidersHorizontal, Scale, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import type { DressType, FabricType, Currency, Measurements } from '../types';
import {
  recommendSmartFabric,
  type OccasionOption,
  type BudgetOption,
  type FitOption,
} from '../utils/fabricRecommendationEngine';
import FabricComparisonModal from './FabricComparisonModal';

interface SmartFabricRecommendationProps {
  dressType: DressType;
  measurements: Measurements;
  selectedFabric: FabricType;
  onSelectFabric: (fabric: FabricType) => void;
  currency: Currency;
  preferredFit?: FitOption;
  className?: string;
}

const SmartFabricRecommendation: React.FC<SmartFabricRecommendationProps> = ({
  dressType,
  measurements,
  selectedFabric,
  onSelectFabric,
  currency,
  preferredFit = 'Regular',
  className = '',
}) => {
  const [occasion, setOccasion] = useState<OccasionOption>('Casual');
  const [budget, setBudget] = useState<BudgetOption>('Standard');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const recommendationOutput = recommendSmartFabric(
    dressType,
    measurements,
    preferredFit,
    occasion,
    budget,
    currency
  );

  const primary = recommendationOutput.primaryRecommendation;
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  return (
    <div className={`smart-fabric-recommendation-card ${className}`}>
      {/* Header */}
      <div className="card-top-header">
        <div className="header-title-group">
          <div className="sparkle-badge-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h3>Smart Fabric Recommendation</h3>
            <p className="card-sub">AI recommendation tailored for your occasion, budget &amp; style</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-compare-fabrics"
          onClick={() => setIsCompareModalOpen(true)}
        >
          <Scale size={14} />
          <span>Compare Fabrics</span>
        </button>
      </div>

      {/* Occasion & Budget Selectors */}
      <div className="rec-selectors-row">
        <div className="selector-group">
          <label htmlFor="occasion-select" className="selector-label">Occasion:</label>
          <div className="chip-group">
            {(['Casual', 'Summer', 'Formal', 'Festive', 'Evening'] as OccasionOption[]).map((occ) => (
              <button
                key={occ}
                type="button"
                className={`chip-btn ${occasion === occ ? 'active' : ''}`}
                onClick={() => setOccasion(occ)}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        <div className="selector-group">
          <label htmlFor="budget-select" className="selector-label">Budget Tier:</label>
          <div className="chip-group">
            {(['Budget', 'Standard', 'Premium'] as BudgetOption[]).map((b) => (
              <button
                key={b}
                type="button"
                className={`chip-btn ${budget === b ? 'active' : ''}`}
                onClick={() => setBudget(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Recommendation Banner */}
      <div className="primary-fabric-banner">
        <div className="fabric-hero-info">
          <div className="recommended-label-badge">
            <Sparkles size={12} /> Top Recommendation
          </div>
          <h4 className="recommended-fabric-title">{primary.fabricName}</h4>
          <p className="recommended-why-text">{primary.whyRecommended}</p>
        </div>

        {/* Apply Recommended Button if not already selected */}
        {selectedFabric !== primary.fabricType ? (
          <button
            type="button"
            className="btn-apply-recommended"
            onClick={() => onSelectFabric(primary.fabricType)}
          >
            <span>Use {primary.fabricName}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <div className="active-fabric-tag">
            <Layers size={14} /> Active Choice
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="fabric-metrics-grid">
        {/* Comfort Score Card */}
        <div className="metric-score-box">
          <div className="metric-box-top">
            <HeartPulse size={16} className="icon-rose" />
            <span className="box-title">Comfort Score</span>
          </div>
          <div className="box-value-row">
            <span className="big-score">{primary.comfortScore}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill comfort-fill" style={{ width: `${primary.comfortScore}%` }} />
          </div>
        </div>

        {/* Durability Score Card */}
        <div className="metric-score-box">
          <div className="metric-box-top">
            <ShieldCheck size={16} className="icon-emerald" />
            <span className="box-title">Durability Score</span>
          </div>
          <div className="box-value-row">
            <span className="big-score">{primary.durabilityScore}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill durability-fill" style={{ width: `${primary.durabilityScore}%` }} />
          </div>
        </div>

        {/* Estimated Fabric Required */}
        <div className="metric-score-box">
          <div className="metric-box-top">
            <SlidersHorizontal size={16} className="icon-indigo" />
            <span className="box-title">Est. Fabric Required</span>
          </div>
          <div className="box-value-row">
            <span className="big-score">{primary.estimatedRequiredMeters}m</span>
            <span className="sub-unit">({primary.estimatedRequiredYards} yds)</span>
          </div>
          <span className="box-footer-note">Calculated for {dressType}</span>
        </div>

        {/* Estimated Price Range */}
        <div className="metric-score-box">
          <div className="metric-box-top">
            <Layers size={16} className="icon-gold" />
            <span className="box-title">Estimated Price Range</span>
          </div>
          <div className="box-value-row">
            <span className="big-score">
              {currencySymbol}
              {primary.estimatedTotalPriceRange.min.toLocaleString()} - {currencySymbol}
              {primary.estimatedTotalPriceRange.max.toLocaleString()}
            </span>
          </div>
          <span className="box-footer-note">
            {currencySymbol}
            {primary.pricePerMeterRange.min} - {currencySymbol}
            {primary.pricePerMeterRange.max} / meter
          </span>
        </div>
      </div>

      {/* Comparison Modal Launcher */}
      <FabricComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        fabrics={recommendationOutput.allFabricsComparison}
        selectedFabric={selectedFabric}
        onSelectFabric={onSelectFabric}
        currency={currency}
      />
    </div>
  );
};

export default SmartFabricRecommendation;
