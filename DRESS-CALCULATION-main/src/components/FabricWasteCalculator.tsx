// ============================================================
// SmartTailor AI – Fabric Waste Calculator Component
// Interactive analysis of total required fabric, usable fabric,
// estimated cutting waste, waste percentage, and visual usage charts.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Scissors,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import type { DressType, FabricType, Measurements, ActiveTab } from '../types';
import { calculateFabricRequirement } from '../calculations/fabricCalculator';
import { DRESS_TYPE_INFO, FABRICS } from '../utils/demoData';

interface FabricWasteCalculatorProps {
  currentDressType: DressType;
  currentFabricType: FabricType;
  currentMeasurements: Measurements;
  onNavigate: (tab: ActiveTab) => void;
}

const FabricWasteCalculator: React.FC<FabricWasteCalculatorProps> = ({
  currentDressType,
  currentFabricType,
  currentMeasurements,
  onNavigate,
}) => {
  const [selectedDress, setSelectedDress] = useState<DressType>(currentDressType);
  const [selectedFabric, setSelectedFabric] = useState<FabricType>(currentFabricType);
  const [lengthInput, setLengthInput] = useState<number>(currentMeasurements.fullLength || 40);
  const [flareInput, setFlareInput] = useState<number>(currentMeasurements.flare || 4);

  // Compute fabric calculation
  const calcResult = useMemo(() => {
    const customMeasurements: Measurements = {
      ...currentMeasurements,
      fullLength: lengthInput,
      flare: flareInput,
    };

    return calculateFabricRequirement({
      garmentType: selectedDress,
      fabricType: selectedFabric,
      measurements: customMeasurements,
    });
  }, [selectedDress, selectedFabric, lengthInput, flareInput, currentMeasurements]);

  const totalRequired = calcResult.requiredLengthMeters;
  const estimatedWaste = calcResult.estimatedWasteMeters;
  const usableFabric = calcResult.usableFabricMeters;
  const wastePercent = calcResult.cuttingWasteEstimatePercent;
  const usablePercent = 100 - wastePercent;

  const wasteBreakdown = calcResult.wasteBreakdown || {
    seamAllowanceMeters: Number((estimatedWaste * 0.35).toFixed(2)),
    curveOffcutsMeters: Number((estimatedWaste * 0.30).toFixed(2)),
    selvageTrimMeters: Number((estimatedWaste * 0.20).toFixed(2)),
    shrinkageBufferMeters: Number((estimatedWaste * 0.15).toFixed(2)),
  };

  return (
    <div className="fabric-waste-container">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="waste-header-row">
        <div>
          <div className="badge-pill-purple mb-2">
            <Sparkles size={13} />
            <span>Precision Fabric Cutting Intelligence</span>
          </div>
          <h2 className="waste-title">Fabric Waste Calculator</h2>
          <p className="waste-sub">
            Analyze fabric efficiency, estimate offcut waste, and optimize pattern layout for zero excess spending.
          </p>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────── */}
      <div className="waste-grid-layout">
        {/* Left Column: Interactive Inputs */}
        <div className="waste-controls-panel">
          <h3 className="panel-subtitle">
            <Scissors size={18} />
            <span>Garment &amp; Cutting Parameters</span>
          </h3>

          <div className="form-group-item">
            <label className="form-label-sm">Select Garment / Dress Type</label>
            <div className="dress-selector-grid-sm">
              {(Object.keys(DRESS_TYPE_INFO) as DressType[]).map((dType) => {
                const info = DRESS_TYPE_INFO[dType];
                return (
                  <button
                    key={dType}
                    type="button"
                    className={`selector-chip-btn ${selectedDress === dType ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDress(dType);
                      setLengthInput(info.defaultLength);
                    }}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group-item mt-4">
            <label className="form-label-sm">Fabric Type &amp; Roll Width</label>
            <select
              className="form-select-sm"
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value as FabricType)}
            >
              {(Object.keys(FABRICS) as FabricType[]).map((fKey) => {
                const fab = FABRICS[fKey];
                return (
                  <option key={fKey} value={fKey}>
                    {fab.name} ({fab.standardWidthInches}" standard width)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-row-2col mt-4">
            <div className="form-group-item">
              <label className="form-label-sm">Garment Full Length (Inches)</label>
              <input
                type="number"
                min={10}
                max={90}
                className="form-input-sm"
                value={lengthInput}
                onChange={(e) => setLengthInput(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="form-group-item">
              <label className="form-label-sm">Skirt / Bottom Flare (Inches)</label>
              <input
                type="number"
                min={0}
                max={30}
                className="form-input-sm"
                value={flareInput}
                onChange={(e) => setFlareInput(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          <div className="layout-spec-note mt-4">
            <Info size={14} />
            <span>
              Fabric width: <strong>{calcResult.fabricWidthInches} Inches</strong> | Layout strategy:{' '}
              <em>{calcResult.fabricLayoutSuggestion}</em>
            </span>
          </div>
        </div>

        {/* Right Column: Waste Metrics & Progress Bar */}
        <div className="waste-results-panel">
          {/* 4 Metric Cards */}
          <div className="waste-metrics-4grid">
            {/* Total Required */}
            <div className="metric-card metric-primary">
              <div className="metric-card-header">
                <span className="metric-title">Total Fabric Required</span>
                <Layers size={18} className="metric-icon" />
              </div>
              <div className="metric-big-num">
                {totalRequired} <span className="metric-unit-text">Meters</span>
              </div>
              <span className="metric-sub-text">({calcResult.requiredLengthYards} Yards)</span>
            </div>

            {/* Usable Fabric */}
            <div className="metric-card metric-success">
              <div className="metric-card-header">
                <span className="metric-title">Usable Fabric</span>
                <CheckCircle2 size={18} className="metric-icon" />
              </div>
              <div className="metric-big-num text-emerald">
                {usableFabric} <span className="metric-unit-text">Meters</span>
              </div>
              <span className="metric-sub-text">({usablePercent}% Efficiency)</span>
            </div>

            {/* Estimated Waste */}
            <div className="metric-card metric-warning">
              <div className="metric-card-header">
                <span className="metric-title">Estimated Fabric Waste</span>
                <Trash2 size={18} className="metric-icon" />
              </div>
              <div className="metric-big-num text-rose">
                {estimatedWaste} <span className="metric-unit-text">Meters</span>
              </div>
              <span className="metric-sub-text">(Offcuts &amp; Margins)</span>
            </div>

            {/* Waste Percentage */}
            <div className="metric-card metric-danger">
              <div className="metric-card-header">
                <span className="metric-title">Waste Percentage</span>
                <TrendingDown size={18} className="metric-icon" />
              </div>
              <div className="metric-big-num text-amber">
                {wastePercent}%
              </div>
              <span className="metric-sub-text">
                {wastePercent <= 7 ? 'Optimal Cut Efficiency' : 'Standard Cutting Loss'}
              </span>
            </div>
          </div>

          {/* Visual Usage Progress Bar & Chart */}
          <div className="panel-card waste-visual-card mt-4">
            <div className="visual-card-header">
              <h4 className="visual-card-title">
                <PieChart size={18} />
                <span>Fabric Utilization vs. Cutting Waste Bar</span>
              </h4>
              <span className="efficiency-pill-glow">
                {usablePercent}% Usable Area
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-segment segment-usable"
                style={{ width: `${usablePercent}%` }}
                title={`Usable Fabric: ${usableFabric}m (${usablePercent}%)`}
              >
                {usablePercent > 15 && <span>Usable ({usablePercent}%)</span>}
              </div>
              <div
                className="progress-segment segment-waste"
                style={{ width: `${wastePercent}%` }}
                title={`Estimated Waste: ${estimatedWaste}m (${wastePercent}%)`}
              >
                {wastePercent > 5 && <span>Waste ({wastePercent}%)</span>}
              </div>
            </div>

            {/* Legend Below Progress Bar */}
            <div className="bar-legend-row mt-3">
              <div className="legend-item">
                <span className="legend-dot dot-usable" />
                <span className="legend-label">Net Usable Pattern Panels:</span>
                <strong className="legend-val">{usableFabric} m</strong>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-waste" />
                <span className="legend-label">Estimated Cutting Waste:</span>
                <strong className="legend-val text-rose">{estimatedWaste} m</strong>
              </div>
            </div>
          </div>

          {/* Waste Factor Breakdown */}
          <div className="panel-card mt-4">
            <h4 className="visual-card-title mb-3">
              <AlertCircle size={16} />
              <span>Category Breakdown of Fabric Loss</span>
            </h4>

            <div className="waste-factor-list">
              <div className="factor-item">
                <span className="factor-name">Seam &amp; Hem Allowances</span>
                <span className="factor-bar-wrap">
                  <span
                    className="factor-bar-fill fill-blue"
                    style={{ width: `${(wasteBreakdown.seamAllowanceMeters / (estimatedWaste || 1)) * 100}%` }}
                  />
                </span>
                <span className="factor-val">{wasteBreakdown.seamAllowanceMeters} m</span>
              </div>

              <div className="factor-item">
                <span className="factor-name">Curve &amp; Armhole Offcuts</span>
                <span className="factor-bar-wrap">
                  <span
                    className="factor-bar-fill fill-purple"
                    style={{ width: `${(wasteBreakdown.curveOffcutsMeters / (estimatedWaste || 1)) * 100}%` }}
                  />
                </span>
                <span className="factor-val">{wasteBreakdown.curveOffcutsMeters} m</span>
              </div>

              <div className="factor-item">
                <span className="factor-name">Selvage &amp; Edge Trimming</span>
                <span className="factor-bar-wrap">
                  <span
                    className="factor-bar-fill fill-amber"
                    style={{ width: `${(wasteBreakdown.selvageTrimMeters / (estimatedWaste || 1)) * 100}%` }}
                  />
                </span>
                <span className="factor-val">{wasteBreakdown.selvageTrimMeters} m</span>
              </div>

              <div className="factor-item">
                <span className="factor-name">Shrinkage Safety Buffer</span>
                <span className="factor-bar-wrap">
                  <span
                    className="factor-bar-fill fill-rose"
                    style={{ width: `${(wasteBreakdown.shrinkageBufferMeters / (estimatedWaste || 1)) * 100}%` }}
                  />
                </span>
                <span className="factor-val">{wasteBreakdown.shrinkageBufferMeters} m</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="waste-actions-row mt-4">
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => onNavigate('price_estimation')}
            >
              <span>Calculate Price Estimate</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FabricWasteCalculator;
