// ============================================================
// Fabriplay AI – Future AI Feature Section ("Future of Fabriplay AI")
// Showcase of upcoming innovations clearly marked as Future Features
// ============================================================

import React from 'react';
import { Sparkles, Scan, Ruler, Compass, Box, Shirt, Cpu, Clock } from 'lucide-react';

const FUTURE_FEATURES = [
  {
    icon: <Scan size={20} className="text-violet" />,
    title: 'AI Body Analysis',
    desc: 'Neural landmark detection for automated 3D body contouring and posture analysis.',
  },
  {
    icon: <Ruler size={20} className="text-emerald" />,
    title: 'Smart Measurement Estimation',
    desc: 'Extract millimeter-accurate circumferences directly from a single front-facing photo.',
  },
  {
    icon: <Compass size={20} className="text-indigo" />,
    title: 'Digital Pattern Generation',
    desc: 'Export vector DXF / SVG nested cutting layouts ready for automatic CNC & laser cutting machines.',
  },
  {
    icon: <Box size={20} className="text-amber" />,
    title: '3D Garment Preview',
    desc: 'Real-time physics-based 3D cloth drape simulation on customizable avatar models.',
  },
  {
    icon: <Shirt size={20} className="text-rose" />,
    title: 'Virtual Try-On',
    desc: 'Augmented reality fitting room overlay to preview fabrics and silhouettes live on video.',
  },
  {
    icon: <Cpu size={20} className="text-cyan" />,
    title: 'Advanced Fabric Recommendation',
    desc: 'Deep learning fabric suitability index matching garment weight, climate, and seam tension.',
  },
];

const FutureFeaturesSection: React.FC = () => {
  return (
    <div className="future-features-section-card" id="step-future">
      {/* Header */}
      <div className="card-header-row">
        <div className="header-title-wrap">
          <div className="icon-badge cyan">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="card-title">Future of Fabriplay AI</h2>
            <p className="card-sub">Next-generation fashion technology roadmap &amp; upcoming innovations</p>
          </div>
        </div>

        <span className="roadmap-tag">
          <Clock size={11} /> R&amp;D Roadmap
        </span>
      </div>

      {/* Grid of 6 Future Feature Cards */}
      <div className="future-cards-grid">
        {FUTURE_FEATURES.map((feat) => (
          <div key={feat.title} className="future-feature-card">
            <div className="card-top-row">
              <div className="feat-icon-box">{feat.icon}</div>
              <span className="future-badge">FUTURE FEATURE</span>
            </div>

            <h3 className="feat-title">{feat.title}</h3>
            <p className="feat-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FutureFeaturesSection;
