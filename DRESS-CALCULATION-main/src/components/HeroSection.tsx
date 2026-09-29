// ============================================================
// Fabriplay AI – Hero Section & Workflow Pipeline
// Header banner showcasing branding, step pipeline, and quick navigation
// ============================================================

import React from 'react';
import { Sparkles, Scissors, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onScrollToSection?: (sectionId: string) => void;
}

const PIPELINE_STEPS = [
  { id: 'step-measurements', label: '1. Body Measurements', short: 'Measurements' },
  { id: 'step-dress', label: '2. Dress Selection', short: 'Dress' },
  { id: 'step-fabric', label: '3. Fabric Selection', short: 'Fabric' },
  { id: 'step-pattern', label: '4. Pattern Recommendation', short: 'Pattern' },
  { id: 'step-calculator', label: '5. Fabric Calculator', short: 'Calculator' },
  { id: 'step-ai-analysis', label: '6. AI Analysis', short: 'AI Photo' },
  { id: 'step-dashboard', label: '7. Final Result', short: 'Result' },
];

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToSection }) => {
  const handleClick = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fabriplay-hero-banner" id="step-hero">
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={13} className="hero-sparkle" />
          <span>Patternmaking Engine &bull; Fabriplay AI</span>
        </div>

        <h1 className="hero-main-title">
          Smart Dress Calculation &amp; Traditional Patternmaking
        </h1>

        <p className="hero-subtitle">
          Transform body measurements into optimized size recommendations, custom cutting patterns,
          and precise fabric estimation—guided by haute couture tailoring principles.
        </p>

        {/* Step Flow Pipeline */}
        <div className="hero-pipeline-bar">
          <span className="pipeline-title">WORKFLOW PIPELINE:</span>
          <div className="pipeline-steps">
            {PIPELINE_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className="pipeline-step-btn"
                  onClick={() => handleClick(step.id)}
                >
                  <span className="step-num">{idx + 1}</span>
                  <span className="step-text">{step.short}</span>
                </button>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight size={12} className="pipeline-arrow" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Quick Features Row */}
        <div className="hero-perks-row">
          <div className="perk-pill">
            <Scissors size={13} />
            <span>Traditional Pattern Logic</span>
          </div>
          <div className="perk-pill">
            <ShieldCheck size={13} />
            <span>Validated Sizing Formulas</span>
          </div>
          <div className="perk-pill">
            <Sparkles size={13} />
            <span>AI Garment Compatibility</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
