// ============================================================
// SmartTailor AI – CAD Pattern Drafting Studio Component
// Full CAD vector drafting engine + Dynamic Dress Material & Fabric Preview
// ============================================================

import React, { useRef, useState, useCallback } from 'react';
import { Scissors, FileDown, Image, Layout } from 'lucide-react';
import PatternCanvas from './PatternCanvas';
import type { PatternCanvasHandle } from './PatternCanvas';
import ZoomControls from './ZoomControls';
import MeasurementForm from './MeasurementForm';
import CADMaterialPreviewCard from './CADMaterialPreviewCard';

import { useZoom } from '../hooks/useZoom';
import { usePatternCalculation } from '../hooks/usePatternCalculation';
import type { Measurements, PatternType, Unit } from '../types';
import { DEFAULT_MEASUREMENTS } from '../calculations/onePieceDress';
import { downloadSVG } from '../utils/svgExport';
import { downloadPDF } from '../utils/pdfExport';
import { inchToCm } from '../utils/unitConversion';
import { PATTERN_TYPES, PATTERN_REGISTRY } from '../patterns/patternRegistry';

interface CADStudioProps {
  measurements: Measurements;
  onMeasurementsChange: (m: Measurements) => void;
  unit: Unit;
  onUnitChange?: (u: Unit) => void;
  patternType: PatternType;
  onPatternTypeChange: (t: PatternType) => void;
}

const CADStudio: React.FC<CADStudioProps> = ({
  measurements,
  onMeasurementsChange,
  unit,
  patternType,
  onPatternTypeChange,
}) => {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMaterialPreview, setShowMaterialPreview] = useState(true);

  // Zoom hook
  const { scale, zoomIn, zoomOut, resetZoom, MIN_SCALE, MAX_SCALE } = useZoom();

  // Pattern calculation engine
  const { patternData, error } = usePatternCalculation(
    measurements,
    scale,
    patternType
  );

  const canvasRef = useRef<PatternCanvasHandle>(null);

  const handleDownloadSVG = useCallback(() => {
    const svg = canvasRef.current?.getSVGElement();
    if (!svg) return;
    downloadSVG(svg, `FabriPlay-CAD-${patternType}-size${measurements.dressSize}`);
  }, [measurements.dressSize, patternType]);

  const handleDownloadPDF = useCallback(async () => {
    const container = canvasRef.current?.getContainerElement();
    if (!container) return;
    setIsExporting(true);
    try {
      await downloadPDF(
        container,
        `FabriPlay-CAD-${patternType}-size${measurements.dressSize}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [measurements.dressSize, patternType]);

  const handleReset = useCallback(() => {
    onMeasurementsChange({
      ...measurements,
      ...DEFAULT_MEASUREMENTS,
    });
  }, [measurements, onMeasurementsChange]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  }, []);

  const fmt = (val: number) =>
    unit === 'cm' ? `${inchToCm(val)} cm` : `${val.toFixed(1)}"`;

  return (
    <div className="cad-studio-container">
      {/* ── Top CAD Toolbar ─────────────────────────────── */}
      <div className="cad-top-bar">
        <div className="cad-title-group">
          <div className="cad-logo-badge">
            <Scissors size={18} />
          </div>
          <div>
            <h2 className="cad-title">CAD Mathematical Pattern Drafting Studio</h2>
            <p className="cad-sub">
              Parametric geometry &bull; Half-panel fold drafting &bull; Seam allowances &bull; Material preview
            </p>
          </div>
        </div>

        <div className="cad-top-controls">
          {/* Pattern Type Selector Dropdown */}
          <div className="pattern-select-wrap">
            <label htmlFor="cad-pattern-type-select" className="cad-control-label">
              Pattern Model:
            </label>
            <select
              id="cad-pattern-type-select"
              className="select-input-sm"
              value={patternType}
              onChange={(e) => onPatternTypeChange(e.target.value as PatternType)}
            >
              {PATTERN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PATTERN_REGISTRY[t]?.label || t}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Material Preview Card */}
          <button
            type="button"
            className={`btn-cad-export ${showMaterialPreview ? 'primary' : ''}`}
            onClick={() => setShowMaterialPreview(!showMaterialPreview)}
            title="Toggle Material & Dress Preview Card"
          >
            <Layout size={14} />
            <span>{showMaterialPreview ? 'Hide Material Card' : 'Show Material Card'}</span>
          </button>

          {/* Export Action Buttons */}
          <div className="cad-export-buttons">
            <button
              type="button"
              className="btn-cad-export"
              onClick={handleDownloadSVG}
              title="Download Vector SVG"
            >
              <Image size={14} />
              <span>SVG</span>
            </button>
            <button
              type="button"
              className="btn-cad-export primary"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              title="Download Printable PDF"
            >
              <FileDown size={14} />
              <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: 3-Panel Grid (Measurement Form | CAD Canvas | Material Preview Card) ── */}
      <div className={`cad-main-3col-layout ${showMaterialPreview ? 'has-preview' : 'no-preview'}`}>
        {/* Left Form: Parameters */}
        <div className="cad-sidebar">
          <MeasurementForm
            measurements={measurements}
            unit={unit}
            onChange={onMeasurementsChange}
            onGenerate={() => {}}
            onReset={handleReset}
            onSave={handleSave}
            onDownloadPDF={handleDownloadPDF}
            onDownloadSVG={handleDownloadSVG}
            isSaving={isSaving}
          />
        </div>

        {/* Center: CAD Technical Drafting Canvas */}
        <div className="cad-canvas-area">
          {/* Canvas Sub-toolbar */}
          <div className="pattern-toolbar">
            <div className="toolbar-info">
              <div className={`toolbar-badge${error ? ' error' : ''}`}>
                <span />
                {error
                  ? 'Calculation error'
                  : patternData
                  ? `Parametric ${PATTERN_REGISTRY[patternType]?.label || patternType} Ready`
                  : 'Generating...'}
              </div>

              <label className="realtime-toggle-label">
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="accent-checkbox"
                />
                <span>Real-time Sync</span>
              </label>
            </div>

            <ZoomControls
              scale={scale}
              minScale={MIN_SCALE}
              maxScale={MAX_SCALE}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onReset={resetZoom}
            />
          </div>

          {/* SVG Canvas Rendering */}
          <PatternCanvas
            ref={canvasRef}
            patternData={patternData}
            scale={scale}
            error={error}
            isLoading={isExporting}
            patternType={patternType}
          />

          {/* Bottom Calculation Summary */}
          {patternData && (
            <div className="calc-summary">
              <div className="calc-item">
                <span className="calc-label">Pattern Model</span>
                <span className="calc-value">{PATTERN_REGISTRY[patternType]?.label || patternType}</span>
              </div>
              <div className="calc-item">
                <span className="calc-label">Full Length</span>
                <span className="calc-value">{fmt(measurements.fullLength)}</span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac14; Bust (+Ease)</span>
                <span className="calc-value">
                  {fmt((measurements.bust + measurements.ease) / 4)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac14; Waist</span>
                <span className="calc-value">
                  {fmt((measurements.waist + measurements.ease) / 4)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac14; Hip</span>
                <span className="calc-value">
                  {fmt((measurements.hip + measurements.ease) / 4)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac12; Bottom Hem</span>
                <span className="calc-value">{fmt(measurements.bottomWidth / 2)}</span>
              </div>
              <div className="calc-item">
                <span className="calc-label">Scale Factor</span>
                <span className="calc-value">
                  {scale}px<span>/in</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Dress Material & Fabric Preview Card */}
        {showMaterialPreview && (
          <div className="cad-material-sidebar">
            <CADMaterialPreviewCard
              patternType={patternType}
              measurements={measurements}
              onSelectPatternType={onPatternTypeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CADStudio;
