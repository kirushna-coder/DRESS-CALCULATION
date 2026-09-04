// ============================================================
// SmartTailor AI – Customer Measurement Module
// Captures personal profile, body metrics, presets, and granular tailor sizing
// ============================================================

import React, { useState } from 'react';
import {
  User,
  Activity,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
} from 'lucide-react';
import type { Customer, Measurements, Unit, Gender } from '../types';
import { inchToCm, cmToInch } from '../utils/unitConversion';

interface CustomerMeasurementModuleProps {
  measurements: Measurements;
  onChange: (m: Measurements) => void;
  unit: Unit;
  customers: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  onSaveAsCustomer: () => void;
  isSavingCustomer?: boolean;
}

const SIZE_PRESETS: Record<
  string,
  { label: string; bust: number; waist: number; hip: number; shoulder: number; length: number }
> = {
  XS: { label: 'Size 32 (XS)', bust: 32, waist: 26, hip: 34, shoulder: 13.5, length: 40 },
  S: { label: 'Size 34 (S)', bust: 34, waist: 28, hip: 36, shoulder: 14, length: 42 },
  M: { label: 'Size 38 (M - Std)', bust: 38, waist: 31, hip: 40, shoulder: 15, length: 44 },
  L: { label: 'Size 42 (L)', bust: 42, waist: 35, hip: 44, shoulder: 16, length: 45 },
  XL: { label: 'Size 46 (XL)', bust: 46, waist: 39, hip: 48, shoulder: 17, length: 46 },
  XXL: { label: 'Size 50 (2XL)', bust: 50, waist: 43, hip: 52, shoulder: 18, length: 46 },
};

const CustomerMeasurementModule: React.FC<CustomerMeasurementModuleProps> = ({
  measurements: m,
  onChange,
  unit,
  customers,
  onSelectCustomer,
  onSaveAsCustomer,
  isSavingCustomer,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('M');

  // Convert inch -> display (or display -> inch)
  const toDisplay = (inchVal: number | undefined): string => {
    if (inchVal === undefined || isNaN(inchVal)) return '';
    return String(unit === 'cm' ? inchToCm(inchVal) : inchVal);
  };

  const handleNumChange = (field: keyof Measurements, rawVal: string) => {
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;
    const inchVal = unit === 'cm' && !['dressSize', 'age'].includes(field) ? cmToInch(num) : num;
    onChange({ ...m, [field]: inchVal });
  };

  const handleTextChange = (field: keyof Measurements, val: string) => {
    onChange({ ...m, [field]: val });
  };

  const applyPreset = (key: string) => {
    const p = SIZE_PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    onChange({
      ...m,
      bust: p.bust,
      waist: p.waist,
      hip: p.hip,
      shoulderWidth: p.shoulder,
      fullLength: p.length,
      dressSize: parseInt(p.label.replace(/\D/g, ''), 10) || 38,
    });
  };

  // BMI Calculation
  const heightCm = m.height || 165;
  const weightKg = m.weight || 62;
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  return (
    <div className="measurement-module-card">
      {/* ── Card Header ────────────────────────────────── */}
      <div className="module-card-header">
        <div className="header-title-group">
          <div className="module-icon-wrap">
            <User size={18} />
          </div>
          <div>
            <h2 className="module-title">Customer &amp; Body Measurements</h2>
            <p className="module-sub">Enter customer details or select a registered profile</p>
          </div>
        </div>

        {/* Quick Load Existing Customer */}
        <div className="customer-quick-select">
          <select
            className="select-customer-dropdown"
            onChange={(e) => {
              const cust = customers.find((c) => c.id === e.target.value);
              if (cust) onSelectCustomer(cust);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Load Saved Customer...
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.gender}, Size {c.measurements.dressSize})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Customer Profile Section ────────────────────── */}
      <div className="profile-fields-grid">
        {/* Name */}
        <div className="input-group">
          <label className="input-label" htmlFor="cust-name-input">
            Customer Name <span className="req">*</span>
          </label>
          <input
            id="cust-name-input"
            type="text"
            className="text-input"
            placeholder="e.g. Priya Sharma"
            value={m.customerName || ''}
            onChange={(e) => handleTextChange('customerName', e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className="input-group">
          <label className="input-label" htmlFor="cust-gender-select">
            Gender
          </label>
          <select
            id="cust-gender-select"
            className="select-input"
            value={m.gender || 'female'}
            onChange={(e) => onChange({ ...m, gender: e.target.value as Gender })}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        {/* Age */}
        <div className="input-group">
          <label className="input-label" htmlFor="cust-age-input">
            Age
          </label>
          <input
            id="cust-age-input"
            type="number"
            className="text-input"
            placeholder="26"
            value={m.age || ''}
            min={3}
            max={100}
            onChange={(e) => handleNumChange('age', e.target.value)}
          />
        </div>

        {/* Height */}
        <div className="input-group">
          <label className="input-label" htmlFor="cust-height-input">
            Height ({unit === 'cm' ? 'cm' : 'in'})
          </label>
          <input
            id="cust-height-input"
            type="number"
            className="text-input"
            placeholder={unit === 'cm' ? '165' : '65'}
            value={unit === 'cm' ? m.height || 165 : Math.round((m.height || 165) / 2.54)}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              const cmVal = unit === 'cm' ? val : Math.round(val * 2.54);
              onChange({ ...m, height: cmVal });
            }}
          />
        </div>

        {/* Weight */}
        <div className="input-group">
          <label className="input-label" htmlFor="cust-weight-input">
            Weight (kg)
          </label>
          <input
            id="cust-weight-input"
            type="number"
            className="text-input"
            placeholder="60"
            value={m.weight || ''}
            onChange={(e) => handleNumChange('weight', e.target.value)}
          />
        </div>

        {/* BMI Live Indicator */}
        <div className="bmi-badge-wrap">
          <span className="bmi-label">
            <Activity size={12} />
            <span>Body Index</span>
          </span>
          <div className="bmi-pill">
            <span className="bmi-val">{bmi} BMI</span>
            <span className="bmi-status">
              {bmi < 18.5 ? 'Lean' : bmi < 25 ? 'Normal' : 'Sturdy'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Standard Size Quick Presets ─────────────────── */}
      <div className="preset-bar">
        <span className="preset-label">Quick Sizing Presets:</span>
        <div className="preset-buttons">
          {Object.entries(SIZE_PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`preset-btn ${activePreset === key ? 'active' : ''}`}
              onClick={() => applyPreset(key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Primary Measurement Inputs ──────────────────── */}
      <div className="measurements-grid">
        {/* Chest / Bust */}
        <div className="measure-field highlight">
          <label className="measure-label" htmlFor="m-bust">
            Chest / Bust ({unit})
          </label>
          <div className="measure-input-row">
            <input
              id="m-bust"
              type="number"
              className="measure-input"
              value={toDisplay(m.bust)}
              step="0.5"
              onChange={(e) => handleNumChange('bust', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Waist */}
        <div className="measure-field highlight">
          <label className="measure-label" htmlFor="m-waist">
            Waist Circumference
          </label>
          <div className="measure-input-row">
            <input
              id="m-waist"
              type="number"
              className="measure-input"
              value={toDisplay(m.waist)}
              step="0.5"
              onChange={(e) => handleNumChange('waist', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Hip */}
        <div className="measure-field highlight">
          <label className="measure-label" htmlFor="m-hip">
            Hip Circumference
          </label>
          <div className="measure-input-row">
            <input
              id="m-hip"
              type="number"
              className="measure-input"
              value={toDisplay(m.hip)}
              step="0.5"
              onChange={(e) => handleNumChange('hip', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Shoulder Width */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-shoulder">
            Shoulder Width
          </label>
          <div className="measure-input-row">
            <input
              id="m-shoulder"
              type="number"
              className="measure-input"
              value={toDisplay(m.shoulderWidth)}
              step="0.25"
              onChange={(e) => handleNumChange('shoulderWidth', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Sleeve Length */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-sleeve">
            Sleeve Length
          </label>
          <div className="measure-input-row">
            <input
              id="m-sleeve"
              type="number"
              className="measure-input"
              value={toDisplay(m.sleeveLength || 22)}
              step="0.5"
              onChange={(e) => handleNumChange('sleeveLength', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Dress / Full Length */}
        <div className="measure-field highlight">
          <label className="measure-label" htmlFor="m-length">
            Dress / Garment Length
          </label>
          <div className="measure-input-row">
            <input
              id="m-length"
              type="number"
              className="measure-input"
              value={toDisplay(m.fullLength)}
              step="0.5"
              onChange={(e) => handleNumChange('fullLength', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Neck Width */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-neck-w">
            Neck Width
          </label>
          <div className="measure-input-row">
            <input
              id="m-neck-w"
              type="number"
              className="measure-input"
              value={toDisplay(m.neckWidth)}
              step="0.25"
              onChange={(e) => handleNumChange('neckWidth', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Neck Depth */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-neck-d">
            Neck Depth
          </label>
          <div className="measure-input-row">
            <input
              id="m-neck-d"
              type="number"
              className="measure-input"
              value={toDisplay(m.neckDepth)}
              step="0.25"
              onChange={(e) => handleNumChange('neckDepth', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Armhole Depth */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-armhole">
            Armhole Depth
          </label>
          <div className="measure-input-row">
            <input
              id="m-armhole"
              type="number"
              className="measure-input"
              value={toDisplay(m.armholeDepth)}
              step="0.25"
              onChange={(e) => handleNumChange('armholeDepth', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Bottom Width */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-bottom">
            Bottom Hem Width
          </label>
          <div className="measure-input-row">
            <input
              id="m-bottom"
              type="number"
              className="measure-input"
              value={toDisplay(m.bottomWidth)}
              step="0.5"
              onChange={(e) => handleNumChange('bottomWidth', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Flare */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-flare">
            Skirt / Hem Flare
          </label>
          <div className="measure-input-row">
            <input
              id="m-flare"
              type="number"
              className="measure-input"
              value={toDisplay(m.flare)}
              step="0.5"
              onChange={(e) => handleNumChange('flare', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>

        {/* Ease Allowance */}
        <div className="measure-field">
          <label className="measure-label" htmlFor="m-ease">
            Ease Allowance
          </label>
          <div className="measure-input-row">
            <input
              id="m-ease"
              type="number"
              className="measure-input"
              value={toDisplay(m.ease)}
              step="0.25"
              onChange={(e) => handleNumChange('ease', e.target.value)}
            />
            <span className="unit-tag">{unit}</span>
          </div>
        </div>
      </div>

      {/* ── Advanced Lower Body & Tailor Metrics (Expandable) ── */}
      <div className="advanced-accordion">
        <button
          type="button"
          className="accordion-toggle-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>Advanced Body Details (Inseam, Outseam, Bicep, Cross Back)</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="advanced-fields-grid">
            <div className="measure-field">
              <label className="measure-label" htmlFor="m-outseam">
                Trouser Outseam
              </label>
              <div className="measure-input-row">
                <input
                  id="m-outseam"
                  type="number"
                  className="measure-input"
                  value={toDisplay(m.outseam || 39)}
                  step="0.5"
                  onChange={(e) => handleNumChange('outseam', e.target.value)}
                />
                <span className="unit-tag">{unit}</span>
              </div>
            </div>

            <div className="measure-field">
              <label className="measure-label" htmlFor="m-inseam">
                Trouser Inseam
              </label>
              <div className="measure-input-row">
                <input
                  id="m-inseam"
                  type="number"
                  className="measure-input"
                  value={toDisplay(m.inseam || 29)}
                  step="0.5"
                  onChange={(e) => handleNumChange('inseam', e.target.value)}
                />
                <span className="unit-tag">{unit}</span>
              </div>
            </div>

            <div className="measure-field">
              <label className="measure-label" htmlFor="m-bicep">
                Bicep Circumference
              </label>
              <div className="measure-input-row">
                <input
                  id="m-bicep"
                  type="number"
                  className="measure-input"
                  value={toDisplay(m.bicepCircumference || 12)}
                  step="0.25"
                  onChange={(e) => handleNumChange('bicepCircumference', e.target.value)}
                />
                <span className="unit-tag">{unit}</span>
              </div>
            </div>

            <div className="measure-field">
              <label className="measure-label" htmlFor="m-crossback">
                Cross Back Width
              </label>
              <div className="measure-input-row">
                <input
                  id="m-crossback"
                  type="number"
                  className="measure-input"
                  value={toDisplay(m.crossBack || 15)}
                  step="0.25"
                  onChange={(e) => handleNumChange('crossBack', e.target.value)}
                />
                <span className="unit-tag">{unit}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Actions ─────────────────────────────── */}
      <div className="module-footer">
        <button
          type="button"
          className="btn-secondary-outline"
          onClick={onSaveAsCustomer}
          disabled={!m.customerName || isSavingCustomer}
        >
          {isSavingCustomer ? (
            <>
              <Check size={14} className="animate-spin" />
              <span>Saved to Directory!</span>
            </>
          ) : (
            <>
              <Bookmark size={14} />
              <span>Save Customer to Directory</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerMeasurementModule;
