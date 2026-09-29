import React from 'react';
import { ArrowRight, Check, Camera, Ruler, Sparkles } from 'lucide-react';
import type { AIRecommendationResult, DressType, FabricCalculationResult, FabricType, Measurements } from '../types';
import { DRESS_TYPE_INFO, FABRICS } from '../utils/demoData';

interface WorkflowInsightsProps {
  dressType: DressType;
  fabricType: FabricType;
  measurements: Measurements;
  recommendation: AIRecommendationResult;
  calculation: FabricCalculationResult;
  onOpenAI: () => void;
}

const PATTERN_PARTS: Record<DressType, string[]> = {
  SHIRT: ['Front', 'Back', 'Sleeve', 'Collar', 'Cuff'],
  PANT: ['Front leg', 'Back leg', 'Waistband', 'Pocket bag', 'Fly facing'],
  TSHIRT: ['Front', 'Back', 'Sleeve', 'Neckband'],
  KURTA: ['Front', 'Back', 'Sleeve', 'Collar', 'Side slit'],
  BLOUSE: ['Front bodice', 'Back bodice', 'Sleeve', 'Neck facing'],
  CHUDIDAR: ['Front leg', 'Back leg', 'Waistband', 'Ankle cuff'],
  FROCK: ['Bodice', 'Back bodice', 'Sleeve', 'Skirt panels'],
  SKIRT: ['Front panels', 'Back panels', 'Waistband', 'Zip facing'],
  JACKET: ['Front', 'Back', 'Sleeve', 'Collar', 'Lapel', 'Lining'],
  TOP: ['Front', 'Back', 'Sleeve', 'Neckband'],
};

const PATTERN_NAMES: Record<DressType, string> = {
  SHIRT: 'Basic Shirt Pattern', PANT: 'Tapered Trouser Pattern', TSHIRT: 'Knit Tee Block',
  KURTA: 'Straight Kurta Pattern', BLOUSE: 'Fitted Bodice Pattern', CHUDIDAR: 'Chudidar Bottom Pattern',
  FROCK: 'Bodice and Flared Skirt Pattern', SKIRT: 'A-Line Skirt Pattern',
  JACKET: 'Structured Jacket Pattern', TOP: 'Casual Top Block',
};

const WorkflowInsights: React.FC<WorkflowInsightsProps> = ({ dressType, fabricType, measurements, recommendation, calculation, onOpenAI }) => {
  const dress = DRESS_TYPE_INFO[dressType];
  const fabric = FABRICS[fabricType];
  return (
    <div className="workflow-insights">
      <section className="pattern-recommendation-card">
        <div className="insights-heading"><div className="insights-icon pattern-icon"><Ruler size={18} /></div><div><span className="insights-kicker">Pattern recommendation</span><h2>{PATTERN_NAMES[dressType]}</h2></div></div>
        <p className="insights-description">{dress.description} {PATTERN_PARTS[dressType].length} construction pieces are suggested for this garment.</p>
        <div className="pattern-detail-grid"><div><span className="detail-label">Pattern components</span><ul className="pattern-parts-list">{PATTERN_PARTS[dressType].map((part) => <li key={part}><Check size={14} />{part}</li>)}</ul></div><div className="construction-note"><span className="detail-label">Basic construction</span><p>{fabric.drape} fabrics work with the current block. Keep grainline parallel to the selvage and add seam allowance before cutting.</p><span className="fit-chip">{recommendation.recommendedFit}</span></div></div>
      </section>

      <section className="fabric-analysis-strip"><div><span className="insights-kicker">Fabric analysis</span><h2>{fabric.name}</h2><p>{fabric.description}</p></div><div className="fabric-analysis-facts"><span><b>{fabric.drape}</b>Drape</span><span><b>{fabric.breathability}</b>Breathability</span><span><b>{fabric.suitableFor.includes(dressType) ? 'Suitable' : 'Alternative'}</b>{dress.label}</span></div></section>

      <section className="result-dashboard-card"><div className="result-dashboard-header"><div><span className="insights-kicker">Final result</span><h2>Fabriplay AI Analysis Result</h2></div><Sparkles size={20} /></div><div className="result-dashboard-grid">
        <div><span>Recommended size</span><strong>{recommendation.sizeSuggestion.alphaSize}</strong><small>Tailor size {recommendation.sizeSuggestion.tailorSize}</small></div><div><span>Selected dress</span><strong>{dress.label}</strong><small>{dress.gender} category</small></div><div><span>Recommended fabric</span><strong>{fabric.name.split(' (')[0]}</strong><small>{fabric.drape} drape</small></div><div><span>Estimated fabric</span><strong>{calculation.requiredLengthMeters} m</strong><small>Estimated requirement</small></div><div><span>Pattern type</span><strong>{PATTERN_NAMES[dressType]}</strong><small>{PATTERN_PARTS[dressType].length} components</small></div><div><span>Fit recommendation</span><strong>{recommendation.recommendedFit}</strong><small>{recommendation.sizeSuggestion.fitConfidence}% confidence</small></div>
      </div><p className="estimate-note">Estimated Fabric Requirement is a planning estimate, not an exact professional cutting measurement.</p></section>

      <section className="ai-analysis-note"><div className="insights-icon ai-icon"><Camera size={18} /></div><div><h2>Photo analysis, carefully framed</h2><p>Upload a photo in Size Intelligence for category suggestions only. Photo analysis provides recommendations only. For accurate dress measurements, please enter body measurements manually.</p></div><button type="button" className="insights-link-button" onClick={onOpenAI}>Open AI analysis <ArrowRight size={15} /></button></section>

      <section className="education-grid"><div className="education-panel"><span className="insights-kicker">The workflow</span><h2>How Fabriplay Works</h2><ol>{['Enter body measurements', 'Select garment type', 'Choose fabric', 'Calculate size', 'Generate pattern recommendation', 'View final result'].map((step, index) => <li key={step}><b>{index + 1}</b>{step}</li>)}</ol></div><div className="education-panel concepts-panel"><span className="insights-kicker">Patternmaking basics</span><h2>Small glossary</h2><dl><div><dt>Pattern</dt><dd>A template used for garment construction.</dd></div><div><dt>Fit</dt><dd>How closely or loosely a garment matches the body.</dd></div><div><dt>Fabric</dt><dd>The material selected for garment construction.</dd></div><div><dt>Size</dt><dd>A recommendation based on entered measurements.</dd></div></dl></div></section>

      <section className="future-features-panel"><div><span className="insights-kicker">On the roadmap</span><h2>Future of Fabriplay AI</h2></div><div className="future-feature-list">{['AI Body Analysis', 'Smart Measurement Estimation', 'Digital Pattern Generation', '3D Garment Preview', 'Virtual Try-On', 'Advanced Fabric Recommendation'].map((feature) => <span key={feature}>{feature}<small>Future feature</small></span>)}</div></section>
      <p className="measurement-summary">Body summary: {measurements.bust}&quot; chest/bust · {measurements.waist}&quot; waist · {measurements.hip}&quot; hip · {measurements.shoulderWidth}&quot; shoulder</p>
    </div>
  );
};

export default WorkflowInsights;