// ============================================================
// SmartTailor AI – Tailoring Price Calculator Component
// Interactive financial estimator calculating Total Fabric Cost,
// Stitching Charges, Design / Extra Work Charges, and Final Estimated Price in ₹.
// ============================================================

import React, { useState } from 'react';
import {
  IndianRupee,
  Calculator,
  ShoppingBag,
  Receipt,
  Layers,
  Scissors,
  Palette,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { FabricCalculationResult, Currency, ActiveTab } from '../types';

interface TailoringPriceCalculatorProps {
  currentCalculation?: FabricCalculationResult;
  currency: Currency;
  onSaveOrder: () => void;
  onOpenInvoice: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

const TailoringPriceCalculator: React.FC<TailoringPriceCalculatorProps> = ({
  currentCalculation,
  currency,
  onSaveOrder,
  onOpenInvoice,
}) => {
  // Inputs state pre-filled from current calculation or realistic defaults
  const [pricePerMeter, setPricePerMeter] = useState<number>(
    currentCalculation?.pricePerMeter ?? 450
  );
  const [fabricQuantityMeters, setFabricQuantityMeters] = useState<number>(
    currentCalculation?.requiredLengthMeters ?? 2.5
  );
  const [stitchingCharge, setStitchingCharge] = useState<number>(
    currentCalculation?.baseStitchingCharge ?? 650
  );
  const [extraDesignCharge, setExtraDesignCharge] = useState<number>(
    currentCalculation?.totalAddOns ?? 350
  );

  // Form validation state
  const [errors, setErrors] = useState<{
    price?: string;
    qty?: string;
    stitching?: string;
    extra?: string;
  }>({});

  // Calculation Math
  const totalFabricCost = Math.round((Math.max(0, pricePerMeter) * Math.max(0, fabricQuantityMeters)));
  const finalEstimatedPrice = Math.round(
    totalFabricCost + Math.max(0, stitchingCharge) + Math.max(0, extraDesignCharge)
  );

  // Currency display symbol
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  const validate = (
    price: number,
    qty: number,
    stitch: number,
    extra: number
  ) => {
    const errs: { price?: string; qty?: string; stitching?: string; extra?: string } = {};
    if (price < 0 || isNaN(price)) errs.price = 'Price must be 0 or positive';
    if (qty <= 0 || isNaN(qty)) errs.qty = 'Quantity must be greater than 0';
    if (stitch < 0 || isNaN(stitch)) errs.stitching = 'Stitching charge must be 0 or positive';
    if (extra < 0 || isNaN(extra)) errs.extra = 'Extra design charge must be 0 or positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResetToCalculation = () => {
    if (currentCalculation) {
      setPricePerMeter(currentCalculation.pricePerMeter);
      setFabricQuantityMeters(currentCalculation.requiredLengthMeters);
      setStitchingCharge(currentCalculation.baseStitchingCharge);
      setExtraDesignCharge(currentCalculation.totalAddOns);
      setErrors({});
    }
  };

  return (
    <div className="price-calculator-container">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="price-header-row">
        <div>
          <div className="badge-pill-emerald mb-2">
            <IndianRupee size={13} />
            <span>Instant Price &amp; Billing Estimation</span>
          </div>
          <h2 className="price-title">Tailoring Price Calculator</h2>
          <p className="price-sub">
            Calculate accurate total tailoring prices with itemized fabric cost, stitching charges, and extra design work.
          </p>
        </div>

        {currentCalculation && (
          <button
            type="button"
            className="btn-secondary-action"
            onClick={handleResetToCalculation}
            title="Reset values from current Dress Calculation"
          >
            <RefreshCw size={14} />
            <span>Sync with Dress Calculation</span>
          </button>
        )}
      </div>

      {/* ── Main 2-Column Grid ──────────────────────────── */}
      <div className="price-grid-layout">
        {/* Left Column: Interactive Inputs */}
        <div className="panel-card price-inputs-panel">
          <h3 className="panel-subtitle border-b pb-3 mb-4">
            <Calculator size={18} />
            <span>Price Calculation Inputs</span>
          </h3>

          <form onSubmit={(e) => e.preventDefault()} noValidate>
            {/* Input 1: Fabric Price Per Meter */}
            <div className="form-group-item mb-4">
              <label className="form-label-main">
                <Layers size={14} />
                <span>Fabric Price per Meter ({currencySymbol})</span>
              </label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  className={`form-input-lg ${errors.price ? 'input-error' : ''}`}
                  value={pricePerMeter}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPricePerMeter(val);
                    validate(val, fabricQuantityMeters, stitchingCharge, extraDesignCharge);
                  }}
                  placeholder="e.g. 450"
                />
              </div>
              {errors.price && <span className="error-text"><AlertCircle size={12} /> {errors.price}</span>}
            </div>

            {/* Input 2: Required Fabric Quantity */}
            <div className="form-group-item mb-4">
              <label className="form-label-main">
                <Scissors size={14} />
                <span>Required Fabric Quantity (Meters)</span>
              </label>
              <div className="input-suffix-wrap">
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  className={`form-input-lg ${errors.qty ? 'input-error' : ''}`}
                  value={fabricQuantityMeters}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFabricQuantityMeters(val);
                    validate(pricePerMeter, val, stitchingCharge, extraDesignCharge);
                  }}
                  placeholder="e.g. 2.5"
                />
                <span className="input-suffix">Meters</span>
              </div>
              {errors.qty && <span className="error-text"><AlertCircle size={12} /> {errors.qty}</span>}
            </div>

            {/* Input 3: Base Stitching Charge */}
            <div className="form-group-item mb-4">
              <label className="form-label-main">
                <Scissors size={14} />
                <span>Stitching Charge ({currencySymbol})</span>
              </label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step={20}
                  className={`form-input-lg ${errors.stitching ? 'input-error' : ''}`}
                  value={stitchingCharge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStitchingCharge(val);
                    validate(pricePerMeter, fabricQuantityMeters, val, extraDesignCharge);
                  }}
                  placeholder="e.g. 650"
                />
              </div>
              {errors.stitching && <span className="error-text"><AlertCircle size={12} /> {errors.stitching}</span>}
            </div>

            {/* Input 4: Design / Extra Work Charge */}
            <div className="form-group-item mb-4">
              <label className="form-label-main">
                <Palette size={14} />
                <span>Design / Extra Work Charge ({currencySymbol})</span>
              </label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step={20}
                  className={`form-input-lg ${errors.extra ? 'input-error' : ''}`}
                  value={extraDesignCharge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setExtraDesignCharge(val);
                    validate(pricePerMeter, fabricQuantityMeters, stitchingCharge, val);
                  }}
                  placeholder="e.g. 350 (Lining, Embroidery, Zips, etc.)"
                />
              </div>
              {errors.extra && <span className="error-text"><AlertCircle size={12} /> {errors.extra}</span>}
              <span className="field-hint-sm">
                Includes lining fabric, lace, embroidery, designer buttons, or custom collar work.
              </span>
            </div>
          </form>
        </div>

        {/* Right Column: Calculation Formula & Breakdown Card */}
        <div className="price-summary-column">
          {/* Main Hero Card */}
          <div className="panel-card price-hero-card">
            <div className="price-hero-header">
              <span className="price-hero-label">Final Estimated Price</span>
              <span className="currency-badge-inr">{currency} ({currencySymbol})</span>
            </div>

            <div className="price-hero-amount">
              <span className="currency-symbol-hero">{currencySymbol}</span>
              <span className="amount-number-hero">{finalEstimatedPrice.toLocaleString()}</span>
            </div>

            <p className="price-hero-sub">
              All inclusive estimate: Total Fabric Cost + Stitching Charge + Extra Work
            </p>

            {/* Equation Bar */}
            <div className="equation-bar-card mt-4">
              <div className="eq-chunk">
                <span className="eq-label">Fabric</span>
                <span className="eq-val">{currencySymbol}{totalFabricCost.toLocaleString()}</span>
              </div>
              <span className="eq-plus">+</span>
              <div className="eq-chunk">
                <span className="eq-label">Stitching</span>
                <span className="eq-val">{currencySymbol}{stitchingCharge.toLocaleString()}</span>
              </div>
              <span className="eq-plus">+</span>
              <div className="eq-chunk">
                <span className="eq-label">Design Work</span>
                <span className="eq-val">{currencySymbol}{extraDesignCharge.toLocaleString()}</span>
              </div>
              <span className="eq-equals">=</span>
              <div className="eq-chunk eq-total">
                <span className="eq-label">Final Price</span>
                <span className="eq-val text-emerald">{currencySymbol}{finalEstimatedPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table Breakdown */}
          <div className="panel-card mt-4">
            <h4 className="visual-card-title mb-3">
              <CheckCircle2 size={16} />
              <span>Itemized Price Breakdown</span>
            </h4>

            <div className="itemized-price-list">
              <div className="itemized-row">
                <div className="itemized-info">
                  <span className="item-title">Total Fabric Cost</span>
                  <span className="item-sub">
                    ({fabricQuantityMeters} m &times; {currencySymbol}{pricePerMeter}/m)
                  </span>
                </div>
                <span className="item-amount font-semibold">{currencySymbol}{totalFabricCost.toLocaleString()}</span>
              </div>

              <div className="itemized-row">
                <div className="itemized-info">
                  <span className="item-title">Stitching Charge</span>
                  <span className="item-sub">Base Tailoring &amp; Cutting</span>
                </div>
                <span className="item-amount font-semibold">{currencySymbol}{stitchingCharge.toLocaleString()}</span>
              </div>

              <div className="itemized-row">
                <div className="itemized-info">
                  <span className="item-title">Extra Design &amp; Work Charge</span>
                  <span className="item-sub">Lining, Embroidery, Accessories</span>
                </div>
                <span className="item-amount font-semibold">+{currencySymbol}{extraDesignCharge.toLocaleString()}</span>
              </div>

              <div className="itemized-row total-highlight-row pt-3 mt-2 border-t">
                <div className="itemized-info">
                  <span className="item-title-lg">Final Estimated Price</span>
                  <span className="item-sub text-emerald">Net Total (Inclusive of all charges)</span>
                </div>
                <span className="item-amount-lg text-emerald font-bold">{currencySymbol}{finalEstimatedPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="price-actions-grid mt-4">
            <button
              type="button"
              className="btn-calc-action primary-save"
              onClick={onSaveOrder}
            >
              <ShoppingBag size={16} />
              <span>Save as New Order</span>
            </button>

            <button
              type="button"
              className="btn-calc-action secondary-invoice"
              onClick={onOpenInvoice}
            >
              <Receipt size={16} />
              <span>Generate Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailoringPriceCalculator;
