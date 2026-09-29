// ============================================================
// SmartTailor AI – CAD Dress Material & Fabric Preview Card
// Dynamic visual SVG model, material recommendations & fabric specifications
// ============================================================

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Ruler,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import type { Measurements, PatternType } from '../types';
import { CAD_MODEL_SPECS, type CADModelSpecification } from '../utils/cadModelRecommendations';

interface CADMaterialPreviewCardProps {
  patternType: PatternType;
  measurements: Measurements;
  onSelectPatternType?: (t: PatternType) => void;
}

const CADMaterialPreviewCard: React.FC<CADMaterialPreviewCardProps> = ({
  patternType,
  measurements,
  onSelectPatternType,
}) => {
  void onSelectPatternType;

  const spec: CADModelSpecification =
    CAD_MODEL_SPECS[patternType] || CAD_MODEL_SPECS.ONE_PIECE;

  // Selected preview color (default to first suitable color)
  const [selectedColor, setSelectedColor] = useState<string>(
    spec.suitableColors[0]?.hex || '#1E3A8A'
  );
  const [selectedFabricChip, setSelectedFabricChip] = useState<string>(
    spec.availableFabrics[0] || ''
  );
  const [_copiedFabric, setCopiedFabric] = useState(false);

  // Re-sync color when patternType changes if needed
  React.useEffect(() => {
    if (spec.suitableColors[0]) {
      setSelectedColor(spec.suitableColors[0].hex);
    }
    if (spec.availableFabrics[0]) {
      setSelectedFabricChip(spec.availableFabrics[0]);
    }
  }, [patternType]);

  // Compute dynamic quantity
  const qty = spec.calculateQuantity(measurements);

  // Render dynamic SVG vector illustration for the currently selected Pattern Model
  const renderModelIllustration = () => {
    switch (patternType) {
      case 'TSHIRT':
        return (
          <g id="model-tshirt">
            <path
              d="M 140 100 L 90 130 L 110 180 L 135 168 L 135 320 L 265 320 L 265 168 L 290 180 L 310 130 L 260 100 Q 200 120 140 100 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Crew Neck */}
            <path
              d="M 160 100 Q 200 130 240 100 Q 200 110 160 100 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Hem stitch lines */}
            <line x1="135" y1="312" x2="265" y2="312" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} strokeDasharray="3 2" />
            <line x1="92" y1="174" x2="112" y2="174" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} strokeDasharray="3 2" />
            <line x1="288" y1="174" x2="308" y2="174" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} strokeDasharray="3 2" />
          </g>
        );

      case 'SHIRT':
        return (
          <g id="model-shirt">
            {/* Body */}
            <path
              d="M 135 110 L 95 125 L 70 210 L 105 220 L 125 170 L 125 340 Q 200 355 275 340 L 275 170 L 295 220 L 330 210 L 305 125 L 265 110 Q 200 125 135 110 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Left/Right Sleeves */}
            <path d="M 135 110 L 95 125 L 70 210 L 105 220 L 125 170 Z" fill={selectedColor} stroke="#0F172A" strokeWidth="2.5" />
            <path d="M 265 110 L 305 125 L 330 210 L 295 220 L 275 170 Z" fill={selectedColor} stroke="#0F172A" strokeWidth="2.5" />
            {/* Placket */}
            <line x1="200" y1="110" x2="200" y2="345" stroke="#0F172A" strokeWidth="2" strokeDasharray="5 2" />
            {/* Collar Points */}
            <path d="M 160 100 L 200 125 L 180 150 L 160 115 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <path d="M 240 100 L 200 125 L 220 150 L 240 115 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            {/* Pocket */}
            <path d="M 145 180 L 175 180 L 175 220 L 160 230 L 145 220 Z" fill="none" stroke="#0F172A" strokeWidth="1.5" />
            {/* Buttons */}
            <circle cx="200" cy="165" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="210" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="255" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="300" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
          </g>
        );

      case 'PANT':
        return (
          <g id="model-pant">
            {/* Waistband */}
            <rect x="125" y="80" width="150" height="20" rx="4" fill={selectedColor} stroke="#0F172A" strokeWidth="2.5" />
            {/* Belt Loops */}
            <line x1="140" y1="80" x2="140" y2="100" stroke="#0F172A" strokeWidth="2" />
            <line x1="175" y1="80" x2="175" y2="100" stroke="#0F172A" strokeWidth="2" />
            <line x1="225" y1="80" x2="225" y2="100" stroke="#0F172A" strokeWidth="2" />
            <line x1="260" y1="80" x2="260" y2="100" stroke="#0F172A" strokeWidth="2" />
            {/* Trouser Legs */}
            <path
              d="M 125 100 L 110 210 L 120 370 L 170 370 L 195 200 L 205 200 L 230 370 L 280 370 L 290 210 L 275 100 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Central Crease Lines */}
            <line x1="145" y1="130" x2="145" y2="365" stroke="#FFFFFF" strokeWidth="1" opacity={0.35} />
            <line x1="255" y1="130" x2="255" y2="365" stroke="#FFFFFF" strokeWidth="1" opacity={0.35} />
            {/* Side Pockets */}
            <path d="M 125 115 Q 140 135 135 160" fill="none" stroke="#0F172A" strokeWidth="2" />
            <path d="M 275 115 Q 260 135 265 160" fill="none" stroke="#0F172A" strokeWidth="2" />
          </g>
        );

      case 'KURTA':
      case 'KURTI':
        return (
          <g id="model-kurta">
            {/* Main Body with Side Slits */}
            <path
              d="M 140 90 L 85 115 L 65 230 L 105 238 L 120 170 L 120 250 L 115 370 L 195 370 L 205 370 L 285 370 L 280 250 L 280 170 L 295 238 L 335 230 L 315 115 L 260 90 Q 200 105 140 90 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Side Slits Line */}
            <line x1="120" y1="250" x2="120" y2="370" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="280" y1="250" x2="280" y2="370" stroke="#0F172A" strokeWidth="2.5" />
            {/* Mandarin Collar Band */}
            <path d="M 170 82 Q 200 78 230 82 L 230 96 Q 200 92 170 96 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            {/* Button Placket */}
            <rect x="195" y="95" width="10" height="85" fill="#FFFFFF" opacity={0.85} stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="200" cy="110" r="2.5" fill="#D97706" />
            <circle cx="200" cy="135" r="2.5" fill="#D97706" />
            <circle cx="200" cy="160" r="2.5" fill="#D97706" />
          </g>
        );

      case 'BLOUSE':
        return (
          <g id="model-blouse">
            {/* Fitted Bodice */}
            <path
              d="M 145 105 L 100 125 L 90 185 L 125 190 L 135 155 L 135 235 L 265 235 L 265 155 L 275 190 L 310 185 L 300 125 L 255 105 Q 200 165 145 105 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sweetheart Neck Trim */}
            <path d="M 145 105 Q 172 135 200 155 Q 228 135 255 105" fill="none" stroke="#F59E0B" strokeWidth="3" />
            {/* Princess Seams */}
            <path d="M 155 140 Q 160 185 165 235" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            <path d="M 245 140 Q 240 185 235 235" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Gold Zari Border */}
            <line x1="135" y1="230" x2="265" y2="230" stroke="#F59E0B" strokeWidth="4" />
          </g>
        );

      case 'CHUDIDAR':
        return (
          <g id="model-chudidar">
            {/* Upper Casing */}
            <path d="M 140 80 L 260 80 L 250 120 L 150 120 Z" fill={selectedColor} stroke="#0F172A" strokeWidth="2" />
            {/* Fitted Slim Legs */}
            <path
              d="M 150 120 Q 135 170 155 230 L 170 380 L 185 380 L 195 230 L 205 230 L 215 380 L 230 380 L 245 230 Q 265 170 250 120 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Fitted Narrow Ankle Churi Gather Rings */}
            <g stroke="#0F172A" strokeWidth="1.5" opacity={0.75}>
              <path d="M 167 315 Q 177 320 188 315" fill="none" />
              <path d="M 168 330 Q 177 335 186 330" fill="none" />
              <path d="M 169 345 Q 177 350 185 345" fill="none" />
              <path d="M 170 360 Q 177 365 184 360" fill="none" />

              <path d="M 212 315 Q 223 320 233 315" fill="none" />
              <path d="M 214 330 Q 223 335 232 330" fill="none" />
              <path d="M 215 345 Q 223 350 231 345" fill="none" />
              <path d="M 216 360 Q 223 365 230 360" fill="none" />
            </g>
          </g>
        );

      case 'SALWAR':
        return (
          <g id="model-salwar">
            {/* Upper Waist Yoke */}
            <rect x="130" y="80" width="140" height="28" rx="3" fill={selectedColor} stroke="#0F172A" strokeWidth="2.5" />
            <line x1="130" y1="94" x2="270" y2="94" stroke="#0F172A" strokeWidth="1" strokeDasharray="3 2" />
            {/* Loose Voluminous Pleated Legs */}
            <path
              d="M 130 108 C 80 180 85 280 125 350 L 175 350 C 190 280 195 200 200 108 C 205 200 210 280 225 350 L 275 350 C 315 280 320 180 270 108 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Waist Pleat Folds */}
            <g opacity={0.4} stroke="#FFFFFF" strokeWidth="1.5">
              <path d="M 145 108 L 140 230" fill="none" />
              <path d="M 160 108 L 155 240" fill="none" />
              <path d="M 175 108 L 170 240" fill="none" />
              <path d="M 225 108 L 230 240" fill="none" />
              <path d="M 240 108 L 245 240" fill="none" />
              <path d="M 255 108 L 260 230" fill="none" />
            </g>
            {/* Stiffened Ankle Poncha Cuff Bands */}
            <rect x="125" y="348" width="50" height="18" rx="1" fill="#FFFFFF" opacity={0.9} stroke="#0F172A" strokeWidth="2" />
            <rect x="225" y="348" width="50" height="18" rx="1" fill="#FFFFFF" opacity={0.9} stroke="#0F172A" strokeWidth="2" />
            {/* Stitch details on Poncha */}
            <line x1="125" y1="357" x2="175" y2="357" stroke="#0F172A" strokeWidth="1" strokeDasharray="2 1" />
            <line x1="225" y1="357" x2="275" y2="357" stroke="#0F172A" strokeWidth="1" strokeDasharray="2 1" />
          </g>
        );

      case 'SKIRT':
        return (
          <g id="model-skirt">
            {/* Waistband */}
            <rect x="140" y="110" width="120" height="18" rx="3" fill={selectedColor} stroke="#0F172A" strokeWidth="2" />
            {/* Flared Body */}
            <path
              d="M 140 128 Q 115 230 80 350 Q 200 370 320 350 Q 285 230 260 128 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Flare Curves */}
            <path d="M 170 128 Q 160 240 140 355" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 200 128 Q 200 240 200 360" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 230 128 Q 240 240 260 355" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
          </g>
        );

      case 'KIDS':
        return (
          <g id="model-kids">
            {/* Cute Dress Body */}
            <path
              d="M 155 120 L 125 140 L 115 185 L 140 190 L 148 160 L 148 205 L 125 310 Q 200 325 275 310 L 252 205 L 252 160 L 260 190 L 285 185 L 275 140 L 245 120 Q 200 140 155 120 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Rounded Collar */}
            <path d="M 170 120 Q 200 140 230 120 Q 200 130 170 120 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            {/* Heart Pocket */}
            <path d="M 225 240 C 220 235 210 235 210 245 C 210 255 225 265 225 265 C 225 265 240 255 240 245 C 240 235 230 235 225 240 Z" fill="#FFFFFF" opacity={0.8} />
          </g>
        );

      case 'JACKET':
        return (
          <g id="model-jacket">
            {/* Main Jacket Body */}
            <path
              d="M 130 100 L 85 120 L 70 210 L 105 218 L 125 170 L 125 330 L 275 330 L 275 170 L 295 218 L 330 210 L 315 120 L 270 100 Q 200 115 130 100 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sleeves */}
            <path d="M 130 100 L 85 120 L 70 210 L 105 218 L 125 170 Z" fill={selectedColor} stroke="#0F172A" strokeWidth="2.5" />
            <path d="M 270 100 L 315 120 L 330 210 L 295 218 L 275 170 Z" fill={selectedColor} stroke="#0F172A" strokeWidth="2.5" />
            {/* Notched Lapels & Collar */}
            <path d="M 160 95 L 200 135 L 175 180 L 135 150 L 160 95 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <path d="M 240 95 L 200 135 L 225 180 L 265 150 L 240 95 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            {/* Center Opening */}
            <line x1="200" y1="135" x2="200" y2="330" stroke="#0F172A" strokeWidth="2" />
            {/* Flap Pockets */}
            <rect x="135" y="240" width="45" height="15" rx="2" fill="#FFFFFF" opacity={0.3} stroke="#0F172A" strokeWidth="1.5" />
            <rect x="220" y="240" width="45" height="15" rx="2" fill="#FFFFFF" opacity={0.3} stroke="#0F172A" strokeWidth="1.5" />
            {/* Buttons */}
            <circle cx="190" cy="210" r="3.5" fill="#D97706" stroke="#0F172A" strokeWidth="1" />
            <circle cx="190" cy="250" r="3.5" fill="#D97706" stroke="#0F172A" strokeWidth="1" />
          </g>
        );

      case 'TOP':
        return (
          <g id="model-top">
            {/* Relaxed Body with Scoop Neck and Curved Hem */}
            <path
              d="M 140 105 L 105 125 L 95 175 L 128 178 L 135 155 L 130 295 Q 200 315 270 295 L 265 155 L 272 178 L 305 175 L 295 125 L 260 105 Q 200 145 140 105 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Scoop Neckline Trim */}
            <path d="M 140 105 Q 200 145 260 105" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Side Fit Creases */}
            <path d="M 145 190 Q 155 240 150 290" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity={0.35} />
            <path d="M 255 190 Q 245 240 250 290" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity={0.35} />
          </g>
        );

      case 'ONE_PIECE':
      case 'FROCK':
      default:
        return (
          <g id="model-frock">
            {/* Bodice */}
            <path
              d="M 145 90 L 105 110 L 90 170 L 125 175 L 135 140 L 140 200 L 260 200 L 265 140 L 275 175 L 310 170 L 295 110 L 255 90 Q 200 120 145 90 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Waist Belt */}
            <rect x="140" y="195" width="120" height="15" fill="#D97706" stroke="#0F172A" strokeWidth="1.5" rx="2" />
            <circle cx="200" cy="202.5" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            {/* Umbrella Flared Skirt */}
            <path
              d="M 140 210 Q 105 280 55 370 Q 200 395 345 370 Q 295 280 260 210 Z"
              fill={selectedColor}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Cascading Flow Lines */}
            <path d="M 165 210 Q 140 290 110 380" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 200 210 Q 200 290 200 388" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 235 210 Q 260 290 290 380" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
          </g>
        );
    }
  };

  const handleCopyFabricName = (name: string) => {
    setSelectedFabricChip(name);
    setCopiedFabric(true);
    setTimeout(() => setCopiedFabric(false), 1500);
  };

  return (
    <div className="cad-material-preview-card">
      {/* ── Card Header ────────────────────────────────── */}
      <div className="cmp-header">
        <div className="cmp-title-group">
          <div className="cmp-icon-badge">
            <Layers size={16} />
          </div>
          <div>
            <div className="cmp-badge-row">
              <h3 className="cmp-title">Dress Material &amp; Fabric Preview</h3>
              <span className="cmp-category-tag">{spec.category}</span>
            </div>
            <p className="cmp-model-name">{spec.label}</p>
          </div>
        </div>

        <span className="live-sync-badge">
          <Sparkles size={11} /> Live Model Sync
        </span>
      </div>

      {/* ── 2D Visual Garment Preview Box ───────────────── */}
      <div className="cmp-canvas-container">
        <svg
          viewBox="0 0 400 400"
          className="cmp-svg"
          aria-label={spec.imagePlaceholderAlt}
        >
          <defs>
            <filter id="cadPreviewShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.2" floodColor="#0F172A" />
            </filter>
          </defs>

          {/* Mannequin Silhouette Background */}
          <g opacity={0.2}>
            <ellipse cx="200" cy="40" rx="18" ry="22" fill="#94A3B8" />
            <path d="M 160 70 Q 200 62 240 70 L 230 220 L 170 220 Z" fill="#94A3B8" />
            <line x1="200" y1="220" x2="200" y2="380" stroke="#64748B" strokeWidth="4" />
          </g>

          {/* Garment Rendering */}
          <g filter="url(#cadPreviewShadow)">{renderModelIllustration()}</g>
        </svg>

        {/* Live Quantity Callout Tag */}
        <div className="cmp-quantity-overlay">
          <Ruler size={13} />
          <span>
            Qty: <strong>{qty.meters}m</strong> ({qty.yards} yds)
          </span>
        </div>
      </div>

      {/* ── Suitable Colour Swatches ─────────────────────── */}
      <div className="cmp-section">
        <div className="cmp-section-header">
          <span className="cmp-section-label">
            <Palette size={13} />
            <span>Suitable Colours for {spec.label}</span>
          </span>
          <span className="cmp-active-color-name">
            {spec.suitableColors.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name ||
              'Custom'}
          </span>
        </div>

        <div className="cmp-swatches-grid">
          {spec.suitableColors.map((swatch) => {
            const isSelected = selectedColor.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                className={`cmp-swatch-btn ${isSelected ? 'selected' : ''}`}
                style={{ backgroundColor: swatch.hex }}
                onClick={() => setSelectedColor(swatch.hex)}
                title={`${swatch.name} (${swatch.hex})`}
              >
                {isSelected && (
                  <ShieldCheck
                    size={13}
                    color={swatch.dark ? '#FFFFFF' : '#0F172A'}
                    className="cmp-swatch-check"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Primary Material Recommendation ─────────────── */}
      <div className="cmp-recommendation-box">
        <div className="rec-box-header">
          <Sparkles size={14} className="rec-star-icon" />
          <span className="rec-box-title">Fabric Material Recommendation</span>
        </div>
        <p className="rec-primary-text">{spec.primaryRecommendation}</p>
        <p className="rec-rationale-text">{spec.rationale}</p>
      </div>

      {/* ── Available Fabric Options Chips ───────────────── */}
      <div className="cmp-section">
        <span className="cmp-section-label">Available Fabric Options (Click to Select)</span>
        <div className="cmp-fabric-chips">
          {spec.availableFabrics.map((fabricName) => {
            const isChipSelected = selectedFabricChip === fabricName;
            return (
              <button
                key={fabricName}
                type="button"
                className={`fabric-chip-btn ${isChipSelected ? 'selected' : ''}`}
                onClick={() => handleCopyFabricName(fabricName)}
              >
                {isChipSelected && <Check size={11} className="chip-check" />}
                <span>{fabricName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recommended Usage & Quantity ─────────────────── */}
      <div className="cmp-usage-grid">
        <div className="cmp-usage-box">
          <span className="usage-lbl">Recommended Quantity:</span>
          <span className="usage-val text-primary font-bold">
            {qty.meters} Meters / {qty.yards} Yards
          </span>
          <span className="usage-sub">Based on Size {measurements.dressSize}</span>
        </div>

        <div className="cmp-usage-box">
          <span className="usage-lbl">Recommended Usage &amp; Layout:</span>
          <span className="usage-val text-dark">{spec.recommendedUsage}</span>
          <span className="usage-sub">{spec.cuttingLayout}</span>
        </div>
      </div>

      {/* ── Pattern Measurement Requirements ─────────────── */}
      <div className="cmp-measurements-req-box">
        <div className="req-box-title-row">
          <Info size={13} className="info-icon" />
          <span className="req-box-title">Required CAD Pattern Measurements</span>
        </div>
        <div className="req-pills-wrap">
          {spec.keyMeasurementFields.map((field) => {
            const currentVal = measurements[field.key];
            const displayVal =
              currentVal !== undefined && currentVal !== null
                ? currentVal
                : field.defaultVal;
            return (
              <div key={String(field.key)} className="req-measure-pill">
                <span className="pill-name">{field.label}:</span>
                <span className="pill-val">{displayVal}"</span>
              </div>
            );
          })}
        </div>
        <p className="ease-recommendation-note">
          <strong>Ease Allowance:</strong> {spec.easeRecommendation}
        </p>
      </div>
    </div>
  );
};

export default CADMaterialPreviewCard;
