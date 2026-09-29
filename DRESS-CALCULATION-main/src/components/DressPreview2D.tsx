// ============================================================
// FabricPlay AI – Interactive Garment Visualizer & 3D WebGL Studio
// Renders dynamic Three.js 3D garment models & 2D Vector Schematics
// ============================================================

import React, { useState } from 'react';
import { Palette, Eye, Sparkles, ShieldCheck, Box, Shirt } from 'lucide-react';
import type { DressType, FabricType, Measurements } from '../types';
import { COLOR_PALETTE, FABRICS } from '../utils/demoData';
import ThreeDGarmentViewer from './ThreeDGarmentViewer';

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
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showMeasurements, setShowMeasurements] = useState(true);


  const fabricInfo = FABRICS[fabricType] || FABRICS.COTTON;

  return (
    <div className="dress-preview-card">
      <div className="preview-header">
        <div className="preview-title-group">
          <div className="preview-icon-badge">
            <Shirt size={16} />
          </div>
          <div>
            <h3 className="preview-heading">Dynamic 3D Garment Preview</h3>
            <p className="preview-sub">
              {fabricInfo.name} &bull; {dressType.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="preview-toggles">
          {/* Mode Switcher: 3D WebGL vs 2D Vector */}
          <div className="mode-switch-group">
            <button
              type="button"
              className={`btn-mode-toggle ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <Box size={13} />
              <span>3D WebGL</span>
            </button>
            <button
              type="button"
              className={`btn-mode-toggle ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode('2d')}
            >
              <Shirt size={13} />
              <span>2D Pattern</span>
            </button>
          </div>

          <button
            type="button"
            className={`btn-icon-pill ${showMeasurements ? 'active' : ''}`}
            onClick={() => setShowMeasurements(!showMeasurements)}
            title="Toggle measurement tags"
          >
            <Eye size={13} />
            <span>Tags</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Display Area */}
      {viewMode === '3d' ? (
        <ThreeDGarmentViewer
          dressType={dressType}
          fabricType={fabricType}
          color={color}
          onColorChange={onColorChange}
          measurements={m}
          height={400}
        />
      ) : (
        <div className="preview-canvas-container">
          <svg viewBox="0 0 400 420" className="preview-svg-canvas" aria-label="Interactive 2D Garment Visualizer">
            <defs>
              <linearGradient id="fabricShimmer2D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <rect width="400" height="420" fill="#F8FAFC" />

            {/* Garment 2D Schematic Shape */}
            <g transform="translate(0, 10)">
              {dressType === 'PANT' ? (
                <g>
                  {/* Anatomically Curved Waistband */}
                  <path d="M 130 110 Q 200 102 270 110 L 270 90 Q 200 82 130 90 Z" fill={color} stroke="#0F172A" strokeWidth="2.5" />
                  {/* Smooth Hip Seams & Crotch Curve */}
                  <path d="M 130 110 C 120 160 115 200 125 380 L 175 380 Q 185 280 195 210 Q 200 195 205 210 Q 215 280 225 380 L 275 380 C 285 200 280 160 270 110 Q 200 118 130 110 Z" fill="url(#fabricShimmer2D)" stroke="#0F172A" strokeWidth="2.5" />
                </g>
              ) : dressType === 'SHIRT' ? (
                <g>
                  {/* Smooth Armholes, Sloped Shoulders & Curved Shirt-Tail Hem */}
                  <path d="M 140 120 L 100 135 C 85 160 80 190 75 220 L 110 230 C 118 200 124 185 130 180 L 130 350 Q 200 370 270 350 L 270 180 C 276 185 282 200 290 230 L 325 220 C 320 190 315 160 300 135 L 260 120 Q 200 138 140 120 Z" fill="url(#fabricShimmer2D)" stroke="#0F172A" strokeWidth="2.5" />
                  {/* Folded Collar Points */}
                  <path d="M 165 110 Q 185 125 200 135 Q 192 148 185 160 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                  <path d="M 235 110 Q 215 125 200 135 Q 208 148 215 160 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                </g>
              ) : (
                <g>
                  {/* Bodice with Armhole S-Curves */}
                  <path d="M 150 100 L 110 120 C 100 145 95 165 95 180 L 130 185 C 135 170 138 158 140 150 L 145 210 L 255 210 L 260 150 C 262 158 265 170 270 185 L 305 180 C 305 165 300 145 290 120 L 250 100 Q 200 115 150 100 Z" fill="url(#fabricShimmer2D)" stroke="#0F172A" strokeWidth="2.5" />
                  {/* Sweeping Flared Umbrella Skirt */}
                  <path d="M 145 220 C 120 280 90 330 60 380 Q 200 410 340 380 C 310 330 280 280 255 220 Q 200 212 145 220 Z" fill="url(#fabricShimmer2D)" stroke="#0F172A" strokeWidth="2.5" />
                </g>
              )}
            </g>

            {/* Measurement Callout Tags */}
            {showMeasurements && (
              <g className="preview-callout-tags" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600">
                <g transform="translate(60, 160)">
                  <rect x="-8" y="-12" width="70" height="20" rx="10" fill="#0F172A" fillOpacity="0.85" />
                  <text x="27" y="2" fill="#F8FAFC" textAnchor="middle">
                    Bust: {m.bust}"
                  </text>
                </g>
                <g transform="translate(60, 215)">
                  <rect x="-8" y="-12" width="74" height="20" rx="10" fill="#0F172A" fillOpacity="0.85" />
                  <text x="29" y="2" fill="#F8FAFC" textAnchor="middle">
                    Waist: {m.waist}"
                  </text>
                </g>
                <g transform="translate(325, 270)">
                  <rect x="-8" y="-12" width="80" height="20" rx="10" fill="#6366F1" fillOpacity="0.9" />
                  <text x="32" y="2" fill="#FFFFFF" textAnchor="middle">
                    Len: {m.fullLength}"
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Fabric Drape & Texture Badge */}
      <div className="preview-fabric-badge">
        <Sparkles size={13} className="sparkle-icon" />
        <span>{fabricInfo.drape} Drape &bull; {fabricInfo.breathability} Breathability</span>
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
