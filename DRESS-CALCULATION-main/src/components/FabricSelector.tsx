// ============================================================
// SmartTailor AI – Fabric Selection & Tailoring Pricing Module
// ============================================================

import React from 'react';
import {
  CheckCircle,
  Sparkles,
  Tag,
  DollarSign,
  Plus,
  Zap,
} from 'lucide-react';
import type { FabricType, TailoringAddOns, Currency } from '../types';
import { FABRICS } from '../utils/demoData';

interface FabricSelectorProps {
  selectedFabric: FabricType;
  onSelectFabric: (f: FabricType) => void;
  pricePerMeter: number;
  onPriceChange: (p: number) => void;
  stitchingCharge: number;
  onStitchingChargeChange: (c: number) => void;
  addOns: TailoringAddOns;
  onAddOnsChange: (addOns: TailoringAddOns) => void;
  currency: Currency;
}

const FABRIC_TYPES_LIST: FabricType[] = [
  'COTTON',
  'SILK',
  'POLYESTER',
  'LINEN',
  'DENIM',
  'GEORGETTE',
  'VELVET',
  'WOOL',
];

const FabricSelector: React.FC<FabricSelectorProps> = ({
  selectedFabric,
  onSelectFabric,
  pricePerMeter,
  onPriceChange,
  stitchingCharge,
  onStitchingChargeChange,
  addOns,
  onAddOnsChange,
  currency,
}) => {
  const currencySymbol =
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  const toggleAddOn = (key: keyof TailoringAddOns) => {
    onAddOnsChange({
      ...addOns,
      [key]: !addOns[key],
    });
  };

  return (
    <div className="fabric-selector-card">
      {/* ── Card Header ────────────────────────────────── */}
      <div className="selector-header">
        <div className="selector-title-group">
          <div className="selector-icon-wrap emerald">
            <Tag size={18} />
          </div>
          <div>
            <h2 className="selector-title">Select Fabric &amp; Tailoring Pricing</h2>
            <p className="selector-sub">
              Choose material to factor in shrinkage, width, drape, and cutting efficiency
            </p>
          </div>
        </div>
      </div>

      {/* ── Fabric Cards Grid ───────────────────────────── */}
      <div className="fabric-cards-grid">
        {FABRIC_TYPES_LIST.map((fKey) => {
          const item = FABRICS[fKey];
          const isSelected = selectedFabric === fKey;

          return (
            <div
              key={fKey}
              className={`fabric-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                onSelectFabric(fKey);
                onPriceChange(item.defaultPricePerMeter);
              }}
              role="button"
              tabIndex={0}
            >
              {isSelected && (
                <div className="selected-check-badge">
                  <CheckCircle size={16} />
                </div>
              )}

              <div className="fabric-card-top">
                <h3 className="fabric-title">{item.name}</h3>
                <span className="fabric-width-tag">{item.standardWidthInches}" Width</span>
              </div>

              <p className="fabric-desc">{item.description}</p>

              <div className="fabric-badges-row">
                <span className="badge-pill drape">{item.drape} Drape</span>
                <span className="badge-pill breath">
                  <Sparkles size={11} /> {item.breathability} Breathability
                </span>
              </div>

              <div className="fabric-card-price">
                <span className="price-tag">
                  {currencySymbol}
                  {item.defaultPricePerMeter}
                  <span className="per-meter">/meter</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Custom Pricing & Tailoring Charges ─────────── */}
      <div className="pricing-inputs-section">
        <h3 className="section-subtitle">
          <DollarSign size={15} />
          <span>Tailoring Rates &amp; Charge Inputs</span>
        </h3>

        <div className="pricing-inputs-grid">
          {/* Price Per Meter Input */}
          <div className="pricing-field">
            <label className="pricing-label" htmlFor="price-per-meter-input">
              Fabric Price per Meter ({currencySymbol})
            </label>
            <div className="price-input-row">
              <span className="currency-prefix">{currencySymbol}</span>
              <input
                id="price-per-meter-input"
                type="number"
                className="price-input"
                value={pricePerMeter}
                step="10"
                min="0"
                onChange={(e) => onPriceChange(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          {/* Stitching Charge Input */}
          <div className="pricing-field">
            <label className="pricing-label" htmlFor="stitching-charge-input">
              Base Stitching / Tailoring Charge ({currencySymbol})
            </label>
            <div className="price-input-row">
              <span className="currency-prefix">{currencySymbol}</span>
              <input
                id="stitching-charge-input"
                type="number"
                className="price-input"
                value={stitchingCharge}
                step="20"
                min="0"
                onChange={(e) =>
                  onStitchingChargeChange(Math.max(0, parseFloat(e.target.value) || 0))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tailoring Add-ons & Customizations ───────────── */}
      <div className="addons-section">
        <h3 className="section-subtitle">
          <Plus size={15} />
          <span>Additional Services &amp; Finishes</span>
        </h3>

        <div className="addons-grid">
          {/* Inner Lining */}
          <label className={`addon-card ${addOns.lining ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={addOns.lining}
              onChange={() => toggleAddOn('lining')}
              className="addon-checkbox"
            />
            <div className="addon-info">
              <span className="addon-title">Inner Lining Fabric</span>
              <span className="addon-sub">Soft breathable cotton/satin lining</span>
            </div>
            <span className="addon-price">+{currencySymbol}180</span>
          </label>

          {/* Embroidery / Lace */}
          <label className={`addon-card ${addOns.embroideryOrLace ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={addOns.embroideryOrLace}
              onChange={() => toggleAddOn('embroideryOrLace')}
              className="addon-checkbox"
            />
            <div className="addon-info">
              <span className="addon-title">Embroidery &amp; Lace Work</span>
              <span className="addon-sub">Zari, sequins, or border embellishment</span>
            </div>
            <span className="addon-price">+{currencySymbol}250</span>
          </label>

          {/* Premium Buttons / Zips */}
          <label className={`addon-card ${addOns.premiumButtonsOrZips ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={addOns.premiumButtonsOrZips}
              onChange={() => toggleAddOn('premiumButtonsOrZips')}
              className="addon-checkbox"
            />
            <div className="addon-info">
              <span className="addon-title">Designer Buttons / Zippers</span>
              <span className="addon-sub">Metallic shank or concealed YKK zippers</span>
            </div>
            <span className="addon-price">+{currencySymbol}80</span>
          </label>

          {/* Express Rush */}
          <label className={`addon-card ${addOns.expressDelivery ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={addOns.expressDelivery}
              onChange={() => toggleAddOn('expressDelivery')}
              className="addon-checkbox"
            />
            <div className="addon-info">
              <span className="addon-title">
                <Zap size={13} className="express-zap" /> 24h Express Rush Tailoring
              </span>
              <span className="addon-sub">Priority queue in cutting &amp; stitching</span>
            </div>
            <span className="addon-price">+{currencySymbol}150</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FabricSelector;
