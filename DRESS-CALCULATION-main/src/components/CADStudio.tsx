// ============================================================
// FabricPlay AI – CAD Pattern Drafting Studio Component
// Full CAD vector drafting engine, Pant Design Studio, Fit Validation & 3D Preview
// ============================================================

import React, { useRef, useState, useCallback } from 'react';
import {
  Scissors,
  FileDown,
  Image,
  Layout,
  Undo2,
  Redo2,
  CheckCircle2,
  Box,
  Sliders,
  Settings,
} from 'lucide-react';
import PatternCanvas from './PatternCanvas';
import type { PatternCanvasHandle } from './PatternCanvas';
import ZoomControls from './ZoomControls';
import MeasurementForm from './MeasurementForm';
import CADMaterialPreviewCard from './CADMaterialPreviewCard';
import PantDesignStudio from './PantDesignStudio';
import FitValidationPanel from './FitValidationPanel';
import Garment3DPreview from './Garment3DPreview';

import { useZoom } from '../hooks/useZoom';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { usePatternCalculation } from '../hooks/usePatternCalculation';
import type {
  Measurements,
  PatternType,
  Unit,
  PantOptions,
  PDFPaperSize,
  PDFExportScale,
  SeamAllowanceCm,
} from '../types';
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
  measurements: initialMeasurements,
  onMeasurementsChange,
  unit,
  patternType,
  onPatternTypeChange,
}) => {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTabRight, setActiveTabRight] = useState<'material' | 'pant_studio' | 'fit_validation' | '3d_preview'>('material');

  // Seam allowance settings: 0 cm, 0.5 cm, 1 cm, 1.5 cm
  const [seamAllowanceCm, setSeamAllowanceCm] = useState<SeamAllowanceCm>(1);

  // PDF Export Modal & Settings State
  const [showExportModal, setShowExportModal] = useState(false);
  const [pdfPaperSize, setPdfPaperSize] = useState<PDFPaperSize>('A4');
  const [pdfExportScale, setPdfExportScale] = useState<PDFExportScale>('fit');

  // Pant Studio Customization Options
  const [pantOptions, setPantOptions] = useState<PantOptions>({
    style: 'formal',
    fit: 'regular',
    pockets: 'slant',
    pleats: 'none',
    hem: 'straight',
    flyZipper: true,
    waistbandWidth: 1.5,
  });

  // Garment Color State for 3D & Material Preview
  const [garmentColor, setGarmentColor] = useState<string>('#1E3A8A');

  // Undo / Redo History Hook for Measurements
  const {
    state: currentMeasurements,
    set: setMeasurementsHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<Measurements>(initialMeasurements);

  const handleMeasurementsUpdate = useCallback(
    (m: Measurements) => {
      setMeasurementsHistory(m);
      onMeasurementsChange(m);
    },
    [setMeasurementsHistory, onMeasurementsChange]
  );

  // Zoom hook
  const { scale, zoomIn, zoomOut, resetZoom, MIN_SCALE, MAX_SCALE } = useZoom();

  // Pattern calculation engine
  const { patternData, error } = usePatternCalculation(
    currentMeasurements,
    scale,
    patternType,
    pantOptions
  );

  // Convert seam allowance from cm to px
  const seamAllowancePx = seamAllowanceCm > 0 ? (seamAllowanceCm / 2.54) * scale : 0;

  const canvasRef = useRef<PatternCanvasHandle>(null);

  const handleDownloadSVG = useCallback(() => {
    const svg = canvasRef.current?.getSVGElement();
    if (!svg) return;
    downloadSVG(svg, `FabricPlay-CAD-${patternType}-size${currentMeasurements.dressSize}`);
  }, [currentMeasurements.dressSize, patternType]);

  const handleDownloadPDF = useCallback(async () => {
    const container = canvasRef.current?.getContainerElement();
    if (!container) return;
    setIsExporting(true);
    try {
      await downloadPDF(
        container,
        `FabricPlay-CAD-${patternType}-size${currentMeasurements.dressSize}`,
        {
          paperSize: pdfPaperSize,
          exportScale: pdfExportScale,
          seamAllowanceCm,
          measurements: currentMeasurements,
          patternName: PATTERN_REGISTRY[patternType]?.label || patternType,
        }
      );
      setShowExportModal(false);
    } finally {
      setIsExporting(false);
    }
  }, [currentMeasurements, patternType, pdfPaperSize, pdfExportScale, seamAllowanceCm]);

  const handleReset = useCallback(() => {
    handleMeasurementsUpdate({
      ...currentMeasurements,
      ...DEFAULT_MEASUREMENTS,
    });
  }, [currentMeasurements, handleMeasurementsUpdate]);

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
            <h2 className="cad-title">FabricPlay AI – CAD Pattern Drafting Studio</h2>
            <p className="cad-sub">
              Parametric drafting &bull; Seam allowances (0–1.5cm) &bull; Undo/Redo &bull; Fit validation &bull; 3D preview
            </p>
          </div>
        </div>

        <div className="cad-top-controls">
          {/* Undo / Redo Controls */}
          <div className="undo-redo-group">
            <button
              type="button"
              className="btn-toolbar-icon"
              onClick={undo}
              disabled={!canUndo}
              title="Undo Measurement Edit"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              className="btn-toolbar-icon"
              onClick={redo}
              disabled={!canRedo}
              title="Redo Measurement Edit"
            >
              <Redo2 size={15} />
            </button>
          </div>

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

          {/* Seam Allowance Toggle */}
          <div className="pattern-select-wrap">
            <label htmlFor="cad-seam-allowance-select" className="cad-control-label">
              Seam Allowance:
            </label>
            <select
              id="cad-seam-allowance-select"
              className="select-input-sm"
              value={seamAllowanceCm}
              onChange={(e) => setSeamAllowanceCm(Number(e.target.value) as SeamAllowanceCm)}
            >
              <option value={0}>0 cm (No Allowance)</option>
              <option value={0.5}>0.5 cm Margin</option>
              <option value={1}>1.0 cm (Standard)</option>
              <option value={1.5}>1.5 cm Seam</option>
            </select>
          </div>

          {/* Tab View Selectors for Right Side Panel */}
          <div className="cad-tab-group">
            {patternType === 'PANT' && (
              <button
                type="button"
                className={`tab-btn-sm ${activeTabRight === 'pant_studio' ? 'active' : ''}`}
                onClick={() => setActiveTabRight('pant_studio')}
              >
                <Sliders size={13} />
                <span>Pant Studio</span>
              </button>
            )}
            <button
              type="button"
              className={`tab-btn-sm ${activeTabRight === 'material' ? 'active' : ''}`}
              onClick={() => setActiveTabRight('material')}
            >
              <Layout size={13} />
              <span>Material Card</span>
            </button>
            <button
              type="button"
              className={`tab-btn-sm ${activeTabRight === 'fit_validation' ? 'active' : ''}`}
              onClick={() => setActiveTabRight('fit_validation')}
            >
              <CheckCircle2 size={13} />
              <span>Fit Check</span>
            </button>
            <button
              type="button"
              className={`tab-btn-sm ${activeTabRight === '3d_preview' ? 'active' : ''}`}
              onClick={() => setActiveTabRight('3d_preview')}
            >
              <Box size={13} />
              <span>3D Preview</span>
            </button>
          </div>

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
              onClick={() => setShowExportModal(true)}
              title="Open Printable PDF Export Options"
            >
              <FileDown size={14} />
              <span>Export PDF...</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: 3-Panel Grid (Measurement Form | CAD Canvas | Right Panel) ── */}
      <div className="cad-main-3col-layout has-preview">
        {/* Left Form: Parameters */}
        <div className="cad-sidebar">
          <MeasurementForm
            measurements={currentMeasurements}
            unit={unit}
            patternType={patternType}
            onChange={handleMeasurementsUpdate}
            onGenerate={() => {}}
            onReset={handleReset}
            onSave={handleSave}
            onDownloadPDF={() => setShowExportModal(true)}
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
            seamAllowance={seamAllowancePx}
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
                <span className="calc-value">{fmt(currentMeasurements.fullLength)}</span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac14; Bust (+Ease)</span>
                <span className="calc-value">
                  {fmt((currentMeasurements.bust + currentMeasurements.ease) / 4)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac14; Waist</span>
                <span className="calc-value">
                  {fmt((currentMeasurements.waist + currentMeasurements.ease) / 4)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">&frac14; Hip</span>
                <span className="calc-value">
                  {fmt((currentMeasurements.hip + currentMeasurements.ease) / 4)}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">Seam Margin</span>
                <span className="calc-value">{seamAllowanceCm} cm</span>
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

        {/* Right Panel: Dynamic Tab Views (Pant Studio | Material Card | Fit Check | 3D Preview) */}
        <div className="cad-material-sidebar">
          {activeTabRight === 'pant_studio' && patternType === 'PANT' && (
            <PantDesignStudio pantOptions={pantOptions} onChange={setPantOptions} />
          )}

          {activeTabRight === 'material' && (
            <CADMaterialPreviewCard
              patternType={patternType}
              measurements={currentMeasurements}
              onSelectPatternType={onPatternTypeChange}
            />
          )}

          {activeTabRight === 'fit_validation' && (
            <FitValidationPanel
              measurements={currentMeasurements}
              patternType={patternType}
              pantOptions={pantOptions}
            />
          )}

          {activeTabRight === '3d_preview' && (
            <Garment3DPreview
              patternType={patternType}
              fabricType="COTTON"
              color={garmentColor}
              onColorChange={setGarmentColor}
              measurements={currentMeasurements}
              pantOptions={pantOptions}
            />
          )}
        </div>
      </div>

      {/* ── Export PDF Modal Window ─────────────────────── */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="export-pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Settings size={18} />
                <h3 className="modal-title">Printable PDF Export Settings</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowExportModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="export-field">
                <label className="export-label">Paper Sheet Format:</label>
                <div className="export-radio-group">
                  {(['A4', 'A3', 'A0'] as PDFPaperSize[]).map((sz) => (
                    <label key={sz} className={`radio-pill ${pdfPaperSize === sz ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paperSize"
                        value={sz}
                        checked={pdfPaperSize === sz}
                        onChange={() => setPdfPaperSize(sz)}
                      />
                      <span>{sz} {sz === 'A4' ? '(Standard Printer)' : sz === 'A3' ? '(Tabloid / Medium)' : '(Large Roll Plotter)'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="export-field">
                <label className="export-label">Export Scale Ratio:</label>
                <div className="export-radio-group">
                  <label className={`radio-pill ${pdfExportScale === 'fit' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="exportScale"
                      value="fit"
                      checked={pdfExportScale === 'fit'}
                      onChange={() => setPdfExportScale('fit')}
                    />
                    <span>Fit to Page (Auto Scale)</span>
                  </label>
                  <label className={`radio-pill ${pdfExportScale === '1:1' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="exportScale"
                      value="1:1"
                      checked={pdfExportScale === '1:1'}
                      onChange={() => setPdfExportScale('1:1')}
                    />
                    <span>1:1 Real Scale (Full Size Tailor Cut)</span>
                  </label>
                  <label className={`radio-pill ${pdfExportScale === '1:2' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="exportScale"
                      value="1:2"
                      checked={pdfExportScale === '1:2'}
                      onChange={() => setPdfExportScale('1:2')}
                    />
                    <span>1:2 Half Scale</span>
                  </label>
                  <label className={`radio-pill ${pdfExportScale === '1:4' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="exportScale"
                      value="1:4"
                      checked={pdfExportScale === '1:4'}
                      onChange={() => setPdfExportScale('1:4')}
                    />
                    <span>1:4 Quarter Scale</span>
                  </label>
                </div>
              </div>

              <div className="export-field">
                <span className="export-summary-text">
                  Included Metadata: Pattern pieces, Grainlines, Notches, Pattern name, Size {currentMeasurements.dressSize}, {seamAllowanceCm} cm Seam Allowances, and Full Measurement Report Page.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleDownloadPDF}
                disabled={isExporting}
              >
                <FileDown size={14} />
                <span>{isExporting ? 'Generating PDF...' : 'Download PDF Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CADStudio;
