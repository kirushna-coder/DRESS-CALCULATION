// ============================================================
// Fabriplay AI – Patternmaking Concept Section ("How Fabriplay Works")
// Explains the 6-step workflow and basic concepts (Pattern, Fit, Fabric, Size)
// ============================================================

import React from 'react';
import { BookOpen, ArrowRight, HelpCircle, Layers, Sliders, Tag, Award } from 'lucide-react';

const WORKFLOW_STEPS = [
  { num: '1', title: 'Enter Body Measurements', desc: 'Input customer chest, waist, hip, height, weight, and shoulder measurements.' },
  { num: '2', title: 'Select Garment Type', desc: 'Choose from Women, Men, or General silhouettes (Shirt, Frock, Pant, Skirt, etc.).' },
  { num: '3', title: 'Choose Fabric', desc: 'Select material (Cotton, Silk, Linen, Denim) to factor in drape & stretch.' },
  { num: '4', title: 'Calculate Size', desc: 'Automated sizing algorithm evaluates measurements and generates alpha size.' },
  { num: '5', title: 'Generate Pattern Recommendation', desc: 'View required pattern components (Front, Back, Sleeve) and seam allowances.' },
  { num: '6', title: 'View Final Result', desc: 'Get itemized fabric requirements, total price estimate, and printable dashboard.' },
];

const BASIC_CONCEPTS = [
  {
    icon: <Layers size={18} className="text-violet" />,
    title: 'Pattern',
    def: 'A template used for garment construction.',
    explanation: 'A 2D paper or digital blueprint of individual garment parts (Front, Back, Sleeves, Collar) used to cut fabric accurately.',
  },
  {
    icon: <Sliders size={18} className="text-emerald" />,
    title: 'Fit',
    def: 'How closely or loosely the garment matches body measurements.',
    explanation: 'Controlled by ease allowance added to raw body metrics for comfort (Slim, Regular, or Relaxed).',
  },
  {
    icon: <Tag size={18} className="text-amber" />,
    title: 'Fabric',
    def: 'The material selected for garment construction.',
    explanation: 'Different fabrics (Cotton, Silk, Linen, Denim) possess unique drape, stretch, and shrinkage properties.',
  },
  {
    icon: <Award size={18} className="text-indigo" />,
    title: 'Size',
    def: 'A recommendation based on entered measurements.',
    explanation: 'Standard sizing designation (XS, S, M, L, XL, XXL) derived from key body circumferences.',
  },
];

const HowFabriplayWorks: React.FC = () => {
  return (
    <div className="how-fabriplay-works-card" id="step-how-works">
      {/* Header */}
      <div className="card-header-row">
        <div className="header-title-wrap">
          <div className="icon-badge indigo">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="card-title">How Fabriplay Works</h2>
            <p className="card-sub">Traditional patternmaking concepts &amp; digital workflow step-by-step</p>
          </div>
        </div>
      </div>

      {/* 6 Workflow Steps Horizontal / Grid Pipeline */}
      <div className="how-workflow-pipeline-grid">
        {WORKFLOW_STEPS.map((step, idx) => (
          <div key={step.num} className="workflow-step-card">
            <div className="step-num-badge">{step.num}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.desc}</p>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <div className="step-arrow-connector">
                <ArrowRight size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Basic Patternmaking Concepts Section */}
      <div className="basic-concepts-section">
        <div className="concepts-header-title">
          <HelpCircle size={16} className="text-indigo" />
          <span>Core Patternmaking Concepts Explained</span>
        </div>

        <div className="concepts-cards-grid">
          {BASIC_CONCEPTS.map((concept) => (
            <div key={concept.title} className="concept-card">
              <div className="concept-icon-wrap">{concept.icon}</div>
              <div className="concept-content">
                <div className="concept-title-row">
                  <h4 className="concept-name">{concept.title}</h4>
                </div>
                <div className="concept-def-quote">"{concept.def}"</div>
                <p className="concept-explanation">{concept.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowFabriplayWorks;
