// ============================================================
// FabricPlay AI – Advanced Pant Design Studio Component
// Controls style variations, fit ease, pocket styles, pleats, & hem
// ============================================================

import React from 'react';
import { Sparkles, Scissors, Check } from 'lucide-react';
import type { PantOptions, PantStyle, PantFit, PantPocketStyle, PantPleats, PantHemStyle } from '../types';

interface PantDesignStudioProps {
  pantOptions: PantOptions;
  onChange: (options: PantOptions) => void;
}

const STYLES: { id: PantStyle; label: string; desc: string }[] = [
  { id: 'formal', label: 'Formal Trousers', desc: 'Classic tailor crease, crisp waistband, slant pockets' },
  { id: 'straight', label: 'Straight Fit', desc: 'Balanced thigh & hem width for all-day comfort' },
  { id: 'slim', label: 'Slim Fit Trousers', desc: 'Snug taper along thigh and knee contour' },
  { id: 'jeans', label: '5-Pocket Jeans', desc: 'Classic denim cut with patch pockets & coin pocket' },
];

const FITS: { id: PantFit; label: string; easeText: string }[] = [
  { id: 'slim', label: 'Slim Fit', easeText: '+0.75" Snug Ease' },
  { id: 'regular', label: 'Regular Fit', easeText: '+1.50" Standard Ease' },
  { id: 'relaxed', label: 'Relaxed Fit', easeText: '+3.00" Generous Ease' },
];

const POCKETS: { id: PantPocketStyle; label: string }[] = [
  { id: 'slant', label: 'Slant Pockets' },
  { id: 'side', label: 'Side Seam Pockets' },
  { id: 'welt', label: 'Rear Welt Pockets' },
  { id: 'patch', label: 'Rear Patch Pockets' },
];

const PLEATS: { id: PantPleats; label: string }[] = [
  { id: 'none', label: 'Flat Front (No Pleats)' },
  { id: 'single', label: 'Single Forward Pleat' },
  { id: 'double', label: 'Double Pleats' },
];

const HEMS: { id: PantHemStyle; label: string }[] = [
  { id: 'straight', label: 'Straight Hem' },
  { id: 'tapered', label: 'Tapered Ankle' },
  { id: 'bootcut', label: 'Bootcut Flare' },
  { id: 'cuffed', label: 'Turn-up Cuff Hem' },
];

const PantDesignStudio: React.FC<PantDesignStudioProps> = ({ pantOptions: opt, onChange }) => {
  const updateOption = <K extends keyof PantOptions>(key: K, value: PantOptions[K]) => {
    onChange({ ...opt, [key]: value });
  };

  return (
    <div className="pant-design-studio-card">
      <div className="pds-header">
        <div className="pds-title-group">
          <div className="pds-icon">
            <Scissors size={18} />
          </div>
          <div>
            <h3 className="pds-title">Advanced Pant &amp; Trouser Design Studio</h3>
            <p className="pds-sub">Parametric pant drafting &bull; Pocket, pleat &amp; fit customization</p>
          </div>
        </div>

        <span className="pds-badge">
          <Sparkles size={12} /> Live Pattern Updates
        </span>
      </div>

      {/* ── 1. Pant Style Selection ─────────────────────── */}
      <div className="pds-section">
        <label className="pds-section-label">Garment Trouser Style</label>
        <div className="pds-styles-grid">
          {STYLES.map((st) => {
            const isSelected = opt.style === st.id;
            return (
              <button
                key={st.id}
                type="button"
                className={`pds-style-card ${isSelected ? 'selected' : ''}`}
                onClick={() => updateOption('style', st.id)}
              >
                <div className="style-card-top">
                  <span className="style-card-title">{st.label}</span>
                  {isSelected && <Check size={14} className="check-icon" />}
                </div>
                <p className="style-card-desc">{st.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Fit Option Ease Selection ─────────────────── */}
      <div className="pds-section">
        <label className="pds-section-label">Ease &amp; Fit Allowance</label>
        <div className="pds-pill-group">
          {FITS.map((fit) => (
            <button
              key={fit.id}
              type="button"
              className={`pds-pill-btn ${opt.fit === fit.id ? 'active' : ''}`}
              onClick={() => updateOption('fit', fit.id)}
            >
              <span>{fit.label}</span>
              <span className="pill-sub">{fit.easeText}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Pockets & Pleats Grid ─────────────────────── */}
      <div className="pds-two-col-grid">
        {/* Pockets */}
        <div className="pds-sub-section">
          <label className="pds-section-label">Pocket Variations</label>
          <div className="pds-compact-list">
            {POCKETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pds-compact-btn ${opt.pockets === p.id ? 'selected' : ''}`}
                onClick={() => updateOption('pockets', p.id)}
              >
                <span>{p.label}</span>
                {opt.pockets === p.id && <Check size={13} />}
              </button>
            ))}
          </div>
        </div>

        {/* Pleats */}
        <div className="pds-sub-section">
          <label className="pds-section-label">Waist Pleat Construction</label>
          <div className="pds-compact-list">
            {PLEATS.map((pl) => (
              <button
                key={pl.id}
                type="button"
                className={`pds-compact-btn ${opt.pleats === pl.id ? 'selected' : ''}`}
                onClick={() => updateOption('pleats', pl.id)}
              >
                <span>{pl.label}</span>
                {opt.pleats === pl.id && <Check size={13} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Hem & Waistband Controls ──────────────────── */}
      <div className="pds-two-col-grid">
        {/* Hem Variation */}
        <div className="pds-sub-section">
          <label className="pds-section-label">Leg Hem Finish</label>
          <select
            className="select-input-sm full-w"
            value={opt.hem}
            onChange={(e) => updateOption('hem', e.target.value as PantHemStyle)}
          >
            {HEMS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* Waistband & Zipper */}
        <div className="pds-sub-section">
          <label className="pds-section-label">Waistband &amp; Closure</label>
          <div className="pds-controls-row">
            <label className="toggle-checkbox-label">
              <input
                type="checkbox"
                checked={opt.flyZipper}
                onChange={(e) => updateOption('flyZipper', e.target.checked)}
              />
              <span>Fly Zipper Shield</span>
            </label>

            <div className="wb-width-slider">
              <span className="slider-lbl">Band: {opt.waistbandWidth}"</span>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.25"
                value={opt.waistbandWidth}
                onChange={(e) => updateOption('waistbandWidth', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantDesignStudio;
