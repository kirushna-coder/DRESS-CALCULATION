// ============================================================
// SmartTailor AI – AI Recommendation & Advisory Component
// ============================================================

import React, { useState } from 'react';
import { Sparkles, Zap, CheckCircle2, Bot, Lightbulb } from 'lucide-react';
import type { AIRecommendationResult, Measurements, FabricType, DressType } from '../types';

interface AIRecommendationCardProps {
  recommendation: AIRecommendationResult;
  measurements?: Measurements;
  selectedGarment?: DressType;
  selectedFabric?: FabricType;
  onApplyEase: (ease: number) => void;
  onApplyFabric: (fabric: FabricType) => void;
  onApplyGarment: (garment: DressType) => void;
}

const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation: rec,
  onApplyEase,
  onApplyFabric,
  onApplyGarment,
}) => {
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleApplyAll = () => {
    onApplyEase(rec.easeRecommendation.bustEase);
    if (rec.suggestedFabric) onApplyFabric(rec.suggestedFabric);
    if (rec.recommendedDressType) onApplyGarment(rec.recommendedDressType);

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2000);
  };

  return (
    <div className="ai-recommendation-card">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="ai-header-row">
        <div className="ai-brand-group">
          <div className="ai-neural-icon">
            <Bot size={18} />
          </div>
          <div>
            <div className="ai-title-row">
              <h3 className="ai-card-title">AI Master Tailor Advisory</h3>
              <span className="neural-tag">
                <Sparkles size={11} /> Smart Engine
              </span>
            </div>
            <p className="ai-card-sub">
              Morphology analysis, fit engineering, and fabric compatibility
            </p>
          </div>
        </div>

        {/* 1-Click Apply Button */}
        <button
          type="button"
          className={`btn-apply-ai ${appliedSuccess ? 'applied' : ''}`}
          onClick={handleApplyAll}
        >
          {appliedSuccess ? (
            <>
              <CheckCircle2 size={14} />
              <span>Applied!</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>Apply AI Suggestions</span>
            </>
          )}
        </button>
      </div>

      {/* ── Key AI Insights Grid ────────────────────────── */}
      <div className="ai-insights-grid">
        {/* Body Shape */}
        <div className="ai-insight-box">
          <span className="insight-label">Body Morphology</span>
          <span className="insight-value highlight">{rec.bodyShape}</span>
          <span className="insight-sub">BMI: {rec.bmi} ({rec.bmiCategory})</span>
        </div>

        {/* Recommended Fit */}
        <div className="ai-insight-box">
          <span className="insight-label">Recommended Fit</span>
          <span className="insight-value">{rec.recommendedFit}</span>
          <span className="insight-sub">
            Ease: {rec.easeRecommendation.bustEase}" Bust, {rec.easeRecommendation.hipEase}" Hip
          </span>
        </div>

        {/* Recommended Size */}
        <div className="ai-insight-box">
          <span className="insight-label">Size Suggestion</span>
          <span className="insight-value">{rec.sizeSuggestion.alphaSize} ({rec.sizeSuggestion.tailorSize})</span>
          <span className="insight-sub">{rec.sizeSuggestion.fitConfidence}% Confidence Score</span>
        </div>

        {/* Suggested Fabric */}
        <div className="ai-insight-box">
          <span className="insight-label">Ideal Fabric Match</span>
          <span className="insight-value">{rec.suggestedFabric}</span>
          <span className="insight-sub">{rec.fabricRationale.slice(0, 45)}...</span>
        </div>
      </div>

      {/* ── AI Tailoring Advice Bullets ──────────────────── */}
      <div className="ai-advice-section">
        <div className="advice-section-title">
          <Lightbulb size={14} className="lightbulb-icon" />
          <span>Tailoring Engineering &amp; Alteration Guidance</span>
        </div>

        <ul className="advice-bullets-list">
          {rec.tailoringAdvice.map((advice, idx) => (
            <li key={idx} className="advice-item">
              <span className="bullet-indicator">&bull;</span>
              <span>{advice}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Fabric Rationale Quote ───────────────────────── */}
      <div className="fabric-rationale-box">
        <span className="rationale-heading">Fabric Drape Rationale:</span>
        <p className="rationale-text">"{rec.fabricRationale}"</p>
      </div>
    </div>
  );
};

export default AIRecommendationCard;
