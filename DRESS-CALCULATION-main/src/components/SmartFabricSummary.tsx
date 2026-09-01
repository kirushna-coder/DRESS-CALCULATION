// ============================================================
// SmartTailor AI – Smart Fabric Calculation Summary Component
// Displays live fabric consumption, itemized pricing & order/invoice actions
// ============================================================

import React from 'react';
import {
  Ruler,
  Receipt,
  ShoppingBag,
  Scissors,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { FabricCalculationResult, Currency } from '../types';

interface SmartFabricSummaryProps {
  calculation: FabricCalculationResult;
  currency: Currency;
  onSaveOrder: () => void;
  onOpenInvoice: () => void;
  onOpenCADStudio: () => void;
}

const SmartFabricSummary: React.FC<SmartFabricSummaryProps> = ({
  calculation: calc,
  currency,
  onSaveOrder,
  onOpenInvoice,
  onOpenCADStudio,
}) => {
  const currencySymbol =
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  return (
    <div className="calculation-summary-card">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="calc-card-header">
        <div className="calc-header-title">
          <div className="calc-header-icon">
            <Ruler size={18} />
          </div>
          <div>
            <h3 className="calc-title">Fabric Consumption &amp; Price Estimate</h3>
            <p className="calc-sub">
              Engineered for {calc.garmentType} with {calc.fabricType} ({calc.fabricWidthInches}" fabric)
            </p>
          </div>
        </div>

        <span className="efficiency-badge">
          <Sparkles size={12} /> {100 - calc.cuttingWasteEstimatePercent}% Cutting Efficiency
        </span>
      </div>

      {/* ── Key Metrics Highlights ──────────────────────── */}
      <div className="fabric-metric-hero">
        <div className="fabric-meter-box">
          <span className="meter-label">Required Fabric Length</span>
          <div className="meter-value-row">
            <span className="meter-number">{calc.requiredLengthMeters}</span>
            <span className="meter-unit">Meters</span>
          </div>
          <span className="meter-yards">({calc.requiredLengthYards} Yards)</span>
        </div>

        <div className="fabric-cost-box">
          <span className="cost-label">Total Estimated Price</span>
          <div className="cost-value-row">
            <span className="cost-currency">{currencySymbol}</span>
            <span className="cost-number">{calc.totalCost.toLocaleString()}</span>
          </div>
          <span className="cost-breakdown-sub">Fabric + Stitching + Finishes</span>
        </div>
      </div>

      {/* ── Itemized Cost Breakdown ──────────────────────── */}
      <div className="cost-breakdown-panel">
        <h4 className="breakdown-title">Itemized Cost Breakdown</h4>

        <div className="breakdown-rows-list">
          {/* Fabric Cost */}
          <div className="breakdown-row">
            <div className="breakdown-row-name">
              <span>Fabric Cost</span>
              <span className="breakdown-detail">
                ({calc.requiredLengthMeters}m &times; {currencySymbol}
                {calc.pricePerMeter})
              </span>
            </div>
            <span className="breakdown-row-value">
              {currencySymbol}
              {calc.fabricCost.toLocaleString()}
            </span>
          </div>

          {/* Stitching Fee */}
          <div className="breakdown-row">
            <div className="breakdown-row-name">
              <span>Base Stitching Charge</span>
              <span className="breakdown-detail">(Standard Tailoring)</span>
            </div>
            <span className="breakdown-row-value">
              {currencySymbol}
              {calc.baseStitchingCharge.toLocaleString()}
            </span>
          </div>

          {/* Lining */}
          {calc.addOnCharges.lining > 0 && (
            <div className="breakdown-row">
              <div className="breakdown-row-name">
                <span>Inner Lining Fabric &amp; Attachment</span>
              </div>
              <span className="breakdown-row-value">
                +{currencySymbol}
                {calc.addOnCharges.lining}
              </span>
            </div>
          )}

          {/* Embroidery */}
          {calc.addOnCharges.embroidery > 0 && (
            <div className="breakdown-row">
              <div className="breakdown-row-name">
                <span>Custom Embroidery / Lace Finishing</span>
              </div>
              <span className="breakdown-row-value">
                +{currencySymbol}
                {calc.addOnCharges.embroidery}
              </span>
            </div>
          )}

          {/* Buttons/Zips */}
          {calc.addOnCharges.buttons > 0 && (
            <div className="breakdown-row">
              <div className="breakdown-row-name">
                <span>Designer Buttons / Zips</span>
              </div>
              <span className="breakdown-row-value">
                +{currencySymbol}
                {calc.addOnCharges.buttons}
              </span>
            </div>
          )}

          {/* Express */}
          {calc.addOnCharges.express > 0 && (
            <div className="breakdown-row">
              <div className="breakdown-row-name">
                <span>24-48h Express Delivery Rush</span>
              </div>
              <span className="breakdown-row-value">
                +{currencySymbol}
                {calc.addOnCharges.express}
              </span>
            </div>
          )}

          {/* Custom Collar */}
          {calc.addOnCharges.customization > 0 && (
            <div className="breakdown-row">
              <div className="breakdown-row-name">
                <span>Collar / Cuff Customization</span>
              </div>
              <span className="breakdown-row-value">
                +{currencySymbol}
                {calc.addOnCharges.customization}
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div className="breakdown-row total-highlight">
            <span className="total-label">Total Payable Amount</span>
            <span className="total-value">
              {currencySymbol}
              {calc.totalCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Master Tailor Layout Tip ─────────────────────── */}
      <div className="layout-tip-box">
        <Layers size={15} className="layout-icon" />
        <div className="layout-tip-text">
          <strong>Cutting Layout Suggestion:</strong>
          <p>{calc.fabricLayoutSuggestion}</p>
        </div>
      </div>

      {/* ── Action Buttons ─────────────────────────────── */}
      <div className="calc-action-buttons">
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

        <button
          type="button"
          className="btn-calc-action outline-cad"
          onClick={onOpenCADStudio}
        >
          <Scissors size={16} />
          <span>View CAD Draft</span>
        </button>
      </div>
    </div>
  );
};

export default SmartFabricSummary;
