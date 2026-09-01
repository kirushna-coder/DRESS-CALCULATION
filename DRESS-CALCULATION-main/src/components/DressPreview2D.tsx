// ============================================================
// SmartTailor AI – Dynamic 2D Garment Visualizer & Color Studio
// Renders realistic SVG garment models responding to type, color, and fabric
// ============================================================

import React, { useState } from 'react';
import { Palette, Eye, Sparkles, Layers, ShieldCheck, Shirt } from 'lucide-react';
import type { DressType, FabricType, Measurements } from '../types';
import { COLOR_PALETTE, FABRICS } from '../utils/demoData';

interface DressPreview2DProps {
  dressType: DressType;
  fabricType: FabricType;
  color: string;
  onColorChange: (hex: string) => void;
  measurements: Measurements;
}

const DressPreview2D: React.FC<DressPreview2DProps> = ({
  dressType,
  fabricType,
  color,
  onColorChange,
  measurements: m,
}) => {
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showMannequin, setShowMannequin] = useState(true);

  const fabricInfo = FABRICS[fabricType] || FABRICS.COTTON;

  // Render garment SVG vector illustration based on dressType
  const renderGarmentSVG = () => {
    switch (dressType) {
      case 'SHIRT':
        return (
          <g id="garment-shirt">
            {/* Mannequin neck backdrop */}
            {showMannequin && (
              <path d="M 180 50 Q 200 45 220 50 L 215 110 L 185 110 Z" fill="#E2E8F0" opacity={0.6} />
            )}
            {/* Main Body */}
            <path
              d="M 140 120 L 100 135 L 75 220 L 110 230 L 130 180 L 130 350 Q 200 365 270 350 L 270 180 L 290 230 L 325 220 L 300 135 L 260 120 Q 200 135 140 120 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Left Sleeve */}
            <path
              d="M 140 120 L 100 135 L 75 220 L 110 230 L 130 180 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            {/* Right Sleeve */}
            <path
              d="M 260 120 L 300 135 L 325 220 L 290 230 L 270 180 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            {/* Placket */}
            <line x1="200" y1="120" x2="200" y2="355" stroke="#0F172A" strokeWidth="2" strokeDasharray="6 2" />
            {/* Collar */}
            <path
              d="M 165 110 L 200 135 L 185 160 L 165 125 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            <path
              d="M 235 110 L 200 135 L 215 160 L 235 125 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Pocket */}
            <path
              d="M 150 190 L 180 190 L 180 230 L 165 240 L 150 230 Z"
              fill="none"
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            {/* Buttons */}
            <circle cx="200" cy="180" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="225" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="270" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <circle cx="200" cy="315" r="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            {/* Sleeve Cuffs */}
            <line x1="75" y1="220" x2="110" y2="230" stroke="#0F172A" strokeWidth="3" />
            <line x1="290" y1="230" x2="325" y2="220" stroke="#0F172A" strokeWidth="3" />
          </g>
        );

      case 'PANT':
        return (
          <g id="garment-pant">
            {/* Waistband */}
            <rect
              x="130"
              y="90"
              width="140"
              height="20"
              rx="4"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            {/* Belt Loops */}
            <line x1="145" y1="90" x2="145" y2="110" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="180" y1="90" x2="180" y2="110" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="220" y1="90" x2="220" y2="110" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="255" y1="90" x2="255" y2="110" stroke="#0F172A" strokeWidth="2.5" />
            {/* Legs and Crotch */}
            <path
              d="M 130 110 L 115 220 L 125 380 L 175 380 L 195 210 L 205 210 L 225 380 L 275 380 L 285 220 L 270 110 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Creases */}
            <line x1="150" y1="140" x2="150" y2="375" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} />
            <line x1="250" y1="140" x2="250" y2="375" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} />
            {/* Side Pockets */}
            <path d="M 130 125 Q 145 145 140 170" fill="none" stroke="#0F172A" strokeWidth="2" />
            <path d="M 270 125 Q 255 145 260 170" fill="none" stroke="#0F172A" strokeWidth="2" />
            {/* Fly zipper seam */}
            <path d="M 200 110 L 200 160 Q 200 175 190 180" fill="none" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        );

      case 'TSHIRT':
        return (
          <g id="garment-tshirt">
            {/* Main Body */}
            <path
              d="M 145 110 L 95 140 L 115 190 L 138 175 L 138 340 L 262 340 L 262 175 L 285 190 L 305 140 L 255 110 Q 200 130 145 110 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Ribbed Round Neck */}
            <path
              d="M 165 110 Q 200 140 235 110 Q 200 120 165 110 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Hem double stitching */}
            <line x1="138" y1="332" x2="262" y2="332" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} strokeDasharray="3 2" />
            <line x1="97" y1="184" x2="117" y2="184" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} strokeDasharray="3 2" />
            <line x1="283" y1="184" x2="303" y2="184" stroke="#FFFFFF" strokeWidth="1" opacity={0.4} strokeDasharray="3 2" />
          </g>
        );

      case 'KURTA':
        return (
          <g id="garment-kurta">
            {/* Main Body with Side Slits */}
            <path
              d="M 145 100 L 90 125 L 70 240 L 110 248 L 125 180 L 125 260 L 120 380 L 195 380 L 205 380 L 280 380 L 275 260 L 275 180 L 290 248 L 330 240 L 310 125 L 255 100 Q 200 115 145 100 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Side Slits Line */}
            <line x1="125" y1="260" x2="125" y2="380" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="275" y1="260" x2="275" y2="380" stroke="#0F172A" strokeWidth="2.5" />
            {/* Mandarin Collar Band */}
            <path
              d="M 175 92 Q 200 88 225 92 L 225 106 Q 200 102 175 106 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Button Placket */}
            <rect x="195" y="105" width="10" height="90" fill="#FFFFFF" opacity={0.8} stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="200" cy="120" r="2.5" fill="#D97706" />
            <circle cx="200" cy="145" r="2.5" fill="#D97706" />
            <circle cx="200" cy="170" r="2.5" fill="#D97706" />
          </g>
        );

      case 'BLOUSE':
        return (
          <g id="garment-blouse">
            {/* Fitted Saree Blouse Body */}
            <path
              d="M 150 110 L 105 130 L 95 190 L 130 195 L 140 160 L 140 240 L 260 240 L 260 160 L 270 195 L 305 190 L 295 130 L 250 110 Q 200 170 150 110 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sweetheart Neckline Trim */}
            <path
              d="M 150 110 Q 175 140 200 160 Q 225 140 250 110"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
            />
            {/* Princess Dart Seams */}
            <path d="M 160 145 Q 165 190 170 240" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            <path d="M 240 145 Q 235 190 230 240" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Golden Zari Hem Border */}
            <line x1="140" y1="236" x2="260" y2="236" stroke="#F59E0B" strokeWidth="4" />
          </g>
        );

      case 'CHUDIDAR':
        return (
          <g id="garment-chudidar">
            {/* Salwar / Chudidar Waist Yoke */}
            <path
              d="M 130 90 L 270 90 L 260 140 L 140 140 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Main Gathered Legs */}
            <path
              d="M 140 140 Q 120 180 145 240 L 165 390 L 185 390 L 195 240 L 205 240 L 215 390 L 235 390 L 255 240 Q 280 180 260 140 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Ankle Churi Gathers (Ripples) */}
            <g stroke="#0F172A" strokeWidth="1.5" opacity={0.6}>
              <path d="M 160 330 Q 175 335 190 330" fill="none" />
              <path d="M 162 345 Q 175 350 188 345" fill="none" />
              <path d="M 164 360 Q 175 365 186 360" fill="none" />
              <path d="M 165 375 Q 175 380 185 375" fill="none" />

              <path d="M 210 330 Q 225 335 240 330" fill="none" />
              <path d="M 212 345 Q 225 350 238 345" fill="none" />
              <path d="M 214 360 Q 225 365 236 360" fill="none" />
              <path d="M 215 375 Q 225 380 235 375" fill="none" />
            </g>
          </g>
        );

      case 'SKIRT':
        return (
          <g id="garment-skirt">
            {/* Waistband */}
            <rect
              x="145"
              y="120"
              width="110"
              height="18"
              rx="3"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* A-Line Flared Skirt Body */}
            <path
              d="M 145 138 Q 120 240 85 360 Q 200 380 315 360 Q 280 240 255 138 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Flare Pleat Guides */}
            <path d="M 175 138 Q 165 250 145 365" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 200 138 Q 200 250 200 370" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 225 138 Q 235 250 255 365" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
          </g>
        );

      case 'FROCK':
      default:
        return (
          <g id="garment-frock">
            {/* Bodice */}
            <path
              d="M 150 100 L 110 120 L 95 180 L 130 185 L 140 150 L 145 210 L 255 210 L 260 150 L 270 185 L 305 180 L 290 120 L 250 100 Q 200 130 150 100 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Waist Belt */}
            <rect x="145" y="205" width="110" height="15" fill="#D97706" stroke="#0F172A" strokeWidth="1.5" rx="2" />
            <circle cx="200" cy="212.5" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            {/* Umbrella Flared Skirt Bottom */}
            <path
              d="M 145 220 Q 110 290 60 380 Q 200 405 340 380 Q 290 290 255 220 Z"
              fill="url(#fabricTexturePattern)"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Cascading Flow Lines */}
            <path d="M 170 220 Q 145 300 115 390" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 200 220 Q 200 300 200 398" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
            <path d="M 230 220 Q 255 300 285 390" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity={0.4} />
          </g>
        );
    }
  };

  return (
    <div className="dress-preview-card">
      <div className="preview-header">
        <div className="preview-title-group">
          <div className="preview-icon-badge">
            <Shirt size={16} />
          </div>
          <div>
            <h3 className="preview-heading">Interactive Garment Preview</h3>
            <p className="preview-sub">
              {fabricInfo.name} &bull; {dressType.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="preview-toggles">
          <button
            type="button"
            className={`btn-icon-pill ${showMeasurements ? 'active' : ''}`}
            onClick={() => setShowMeasurements(!showMeasurements)}
            title="Toggle measurement tags"
          >
            <Eye size={13} />
            <span>Tags</span>
          </button>
          <button
            type="button"
            className={`btn-icon-pill ${showMannequin ? 'active' : ''}`}
            onClick={() => setShowMannequin(!showMannequin)}
            title="Toggle mannequin backdrop"
          >
            <Layers size={13} />
            <span>Form</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="preview-canvas-container">
        <svg
          viewBox="0 0 400 420"
          className="preview-svg-canvas"
          aria-label="Interactive 2D Garment Visualizer"
        >
          <defs>
            {/* Base Color Fill */}
            <linearGradient id="fabricShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="50%" stopColor={color} stopOpacity={0.88} />
              <stop offset="100%" stopColor={color} stopOpacity={0.78} />
            </linearGradient>

            {/* Pattern Overlay matching Fabric Type */}
            <pattern
              id="fabricTexturePattern"
              patternUnits="userSpaceOnUse"
              width="20"
              height="20"
              patternTransform="rotate(45)"
            >
              <rect width="20" height="20" fill="url(#fabricShimmer)" />
              {fabricType === 'DENIM' && (
                <line x1="0" y1="0" x2="20" y2="20" stroke="#FFFFFF" strokeWidth="0.8" opacity={0.25} />
              )}
              {fabricType === 'SILK' && (
                <circle cx="10" cy="10" r="8" fill="#FFFFFF" opacity={0.06} />
              )}
              {fabricType === 'LINEN' && (
                <g stroke="#000000" strokeWidth="0.5" opacity={0.15}>
                  <line x1="0" y1="5" x2="20" y2="5" />
                  <line x1="5" y1="0" x2="5" y2="20" />
                </g>
              )}
              {fabricType === 'COTTON' && (
                <circle cx="5" cy="5" r="1" fill="#FFFFFF" opacity={0.18} />
              )}
            </pattern>

            {/* Soft Shadow Filter */}
            <filter id="garmentShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.18" floodColor="#0F172A" />
            </filter>
          </defs>

          {/* Mannequin Form Backdrop */}
          {showMannequin && (
            <g id="mannequin-base" opacity={0.25}>
              <ellipse cx="200" cy="45" rx="20" ry="25" fill="#94A3B8" />
              <path d="M 155 80 Q 200 70 245 80 L 235 240 L 165 240 Z" fill="#94A3B8" />
              <line x1="200" y1="240" x2="200" y2="400" stroke="#64748B" strokeWidth="4" />
              <path d="M 160 400 L 240 400" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {/* Garment Group with dynamic shadow */}
          <g filter="url(#garmentShadow)">{renderGarmentSVG()}</g>

          {/* Real-time Measurement Callouts */}
          {showMeasurements && (
            <g className="preview-callout-tags" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600">
              {/* Chest / Bust */}
              <g transform="translate(60, 160)">
                <rect x="-8" y="-12" width="70" height="20" rx="10" fill="#0F172A" fillOpacity="0.85" />
                <text x="27" y="2" fill="#F8FAFC" textAnchor="middle">
                  Bust: {m.bust}"
                </text>
              </g>

              {/* Waist */}
              <g transform="translate(60, 215)">
                <rect x="-8" y="-12" width="74" height="20" rx="10" fill="#0F172A" fillOpacity="0.85" />
                <text x="29" y="2" fill="#F8FAFC" textAnchor="middle">
                  Waist: {m.waist}"
                </text>
              </g>

              {/* Length */}
              <g transform="translate(325, 270)">
                <rect x="-8" y="-12" width="80" height="20" rx="10" fill="#6366F1" fillOpacity="0.9" />
                <text x="32" y="2" fill="#FFFFFF" textAnchor="middle">
                  Len: {m.fullLength}"
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Fabric Drape & Texture Badge */}
        <div className="preview-fabric-badge">
          <Sparkles size={13} className="sparkle-icon" />
          <span>{fabricInfo.drape} Drape &bull; {fabricInfo.breathability} Breathability</span>
        </div>
      </div>

      {/* Palette & Color Studio */}
      <div className="preview-color-section">
        <div className="color-header">
          <span className="color-label">
            <Palette size={13} />
            <span>Tailoring Color Palette</span>
          </span>
          <div className="custom-color-picker-wrap">
            <label htmlFor="custom-color-input" className="custom-color-label">
              Custom Hex
            </label>
            <input
              id="custom-color-input"
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="color-wheel-input"
            />
          </div>
        </div>

        <div className="color-swatches-grid">
          {COLOR_PALETTE.map((swatch) => {
            const isSelected = color.toLowerCase() === swatch.hex.toLowerCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                className={`swatch-btn ${isSelected ? 'selected' : ''}`}
                style={{ backgroundColor: swatch.hex }}
                onClick={() => onColorChange(swatch.hex)}
                title={swatch.name}
              >
                {isSelected && (
                  <ShieldCheck
                    size={14}
                    color={swatch.dark ? '#FFFFFF' : '#0F172A'}
                    className="swatch-check"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DressPreview2D;
