// ============================================================
// Fabriplay AI – Smart Result Dashboard Module
// Displays Cards 1 to 6 summarizing final analysis result + order & invoice action buttons
// ============================================================

import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Receipt,
  Printer,
  CheckCircle,
  Shirt,
  Tag,
  Ruler,
  Layers,
  Sliders,
  Award,
} from 'lucide-react';
import type { DressType, FabricType, Measurements, FabricCalculationResult, Currency } from '../types';
import { DRESS_TYPE_INFO, FABRICS } from '../utils/demoData';

interface SmartResultDashboardProps {
  dressType: DressType;
  fabricType: FabricType;
  measurements: Measurements;
  calculation: FabricCalculationResult;
  currency: Currency;
  onSaveOrder: () => void;
  onOpenInvoice: () => void;
}

const SmartResultDashboard: React.FC<SmartResultDashboardProps> = ({
  dressType,
  fabricType,
  measurements: m,
  calculation: calc,
  currency: _currency,
  onSaveOrder,
  onOpenInvoice,
}) => {
  const dressInfo = DRESS_TYPE_INFO[dressType] || DRESS_TYPE_INFO.SHIRT;
  const fabricInfo = FABRICS[fabricType] || FABRICS.COTTON;

  // Calculate size
  const bust = m.bust || 36;
  const recommendedSize =
    bust <= 32 ? 'XS (Size 32)' : bust <= 35 ? 'S (Size 34)' : bust <= 38 ? 'M (Size 38)' : bust <= 42 ? 'L (Size 42)' : bust <= 46 ? 'XL (Size 46)' : 'XXL (Size 50)';

  // Calculate fit recommendation
  let fitRec = dressInfo.fitType;
  if (m.gender === 'male' && m.shoulderWidth >= 17) {
    fitRec = 'Athletic Fit';
  } else if ((m.waist || 30) > (m.bust || 36)) {
    fitRec = 'Relaxed / Comfort Fit';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="smart-result-dashboard-card" id="step-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header-row">
        <div className="header-title-wrap">
          <div className="icon-badge gold">
            <Award size={18} />
          </div>
          <div>
            <h2 className="card-title">Fabriplay AI Analysis Result</h2>
            <p className="card-sub">Comprehensive tailor dashboard summarizing size, garment, fabric, &amp; pattern specifications</p>
          </div>
        </div>

        <span className="live-result-tag">
          <Sparkles size={11} /> Live Calculation Complete
        </span>
      </div>

      {/* 6 Summary Cards Grid */}
      <div className="result-cards-6-grid">
        {/* CARD 1: Recommended Size */}
        <div className="result-card card-size">
          <div className="card-top-icon">
            <Award size={16} />
            <span className="card-num">CARD 1</span>
          </div>
          <span className="card-title-text">Recommended Size</span>
          <div className="card-main-value">{recommendedSize}</div>
          <span className="card-sub-info">Based on Bust: {toDisplay(bust)}" &amp; Chest</span>
        </div>

        {/* CARD 2: Selected Dress */}
        <div className="result-card card-dress">
          <div className="card-top-icon">
            <Shirt size={16} />
            <span className="card-num">CARD 2</span>
          </div>
          <span className="card-title-text">Selected Dress</span>
          <div className="card-main-value">{dressInfo.label}</div>
          <span className="card-sub-info">{dressInfo.gender} Silhouette</span>
        </div>

        {/* CARD 3: Recommended Fabric */}
        <div className="result-card card-fabric">
          <div className="card-top-icon">
            <Tag size={16} />
            <span className="card-num">CARD 3</span>
          </div>
          <span className="card-title-text">Recommended Fabric</span>
          <div className="card-main-value">{fabricInfo.name.split('(')[0]}</div>
          <span className="card-sub-info">{fabricInfo.drape} Drape &bull; {fabricInfo.stretchLevel} Stretch</span>
        </div>

        {/* CARD 4: Estimated Fabric Required */}
        <div className="result-card card-meter">
          <div className="card-top-icon">
            <Ruler size={16} />
            <span className="card-num">CARD 4</span>
          </div>
          <span className="card-title-text">Estimated Fabric Required</span>
          <div className="card-main-value">{calc.requiredLengthMeters} meters</div>
          <span className="card-sub-info">({calc.requiredLengthYards} Yards)</span>
        </div>

        {/* CARD 5: Pattern Type */}
        <div className="result-card card-pattern">
          <div className="card-top-icon">
            <Layers size={16} />
            <span className="card-num">CARD 5</span>
          </div>
          <span className="card-title-text">Pattern Type</span>
          <div className="card-main-value">{dressInfo.patternType}</div>
          <span className="card-sub-info">{dressInfo.patternComponents.length} Components</span>
        </div>

        {/* CARD 6: Fit Recommendation */}
        <div className="result-card card-fit">
          <div className="card-top-icon">
            <Sliders size={16} />
            <span className="card-num">CARD 6</span>
          </div>
          <span className="card-title-text">Fit Recommendation</span>
          <div className="card-main-value">{fitRec}</div>
          <span className="card-sub-info">Ease Allowance: {m.ease || 1.5}"</span>
        </div>
      </div>

      {/* Structured Text Result Summary Box */}
      <div className="structured-summary-box">
        <div className="box-title-row">
          <CheckCircle size={14} className="text-emerald" />
          <span>FABRIPLAY AI ANALYSIS SUMMARY</span>
        </div>
        <div className="summary-key-value-list">
          <div className="key-val-line">
            <span className="k">Recommended Size:</span>
            <span className="v">{recommendedSize}</span>
          </div>
          <div className="key-val-line">
            <span className="k">Selected Dress:</span>
            <span className="v">{dressInfo.label}</span>
          </div>
          <div className="key-val-line">
            <span className="k">Recommended Fabric:</span>
            <span className="v">{fabricInfo.name}</span>
          </div>
          <div className="key-val-line">
            <span className="k">Estimated Fabric:</span>
            <span className="v">{calc.requiredLengthMeters} meters</span>
          </div>
          <div className="key-val-line">
            <span className="k">Pattern Type:</span>
            <span className="v">{dressInfo.patternType}</span>
          </div>
          <div className="key-val-line">
            <span className="k">Fit:</span>
            <span className="v">{fitRec}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="dashboard-action-buttons">
        <button
          type="button"
          className="btn-dash-action primary"
          onClick={onSaveOrder}
        >
          <ShoppingBag size={16} />
          <span>Save as New Order</span>
        </button>

        <button
          type="button"
          className="btn-dash-action secondary"
          onClick={onOpenInvoice}
        >
          <Receipt size={16} />
          <span>Generate Invoice</span>
        </button>

        <button
          type="button"
          className="btn-dash-action outline"
          onClick={handlePrint}
        >
          <Printer size={16} />
          <span>Print / Export Result</span>
        </button>
      </div>
    </div>
  );
};

function toDisplay(val: number) {
  return String(val);
}

export default SmartResultDashboard;
