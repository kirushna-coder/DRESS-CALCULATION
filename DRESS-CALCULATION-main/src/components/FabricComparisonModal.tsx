// ============================================================
// FabriPlay – Fabric Comparison Modal
// Side-by-side analysis of Cotton, Linen, Silk, Denim, Rayon, Polyester
// ============================================================

import React from 'react';
import { X, Check, Sparkles, Scale, Info } from 'lucide-react';
import type { FabricType, Currency } from '../types';
import type { FabricRecommendationDetail } from '../utils/fabricRecommendationEngine';

interface FabricComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabrics: FabricRecommendationDetail[];
  selectedFabric: FabricType;
  onSelectFabric: (fabric: FabricType) => void;
  currency: Currency;
}

const FabricComparisonModal: React.FC<FabricComparisonModalProps> = ({
  isOpen,
  onClose,
  fabrics,
  selectedFabric,
  onSelectFabric,
  currency,
}) => {
  if (!isOpen) return null;

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="fabric-comparison-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-card-header">
          <div className="header-brand-title">
            <Scale size={20} className="header-icon-purple" />
            <div>
              <h2>Fabric Intelligence Comparison</h2>
              <p className="modal-sub">Analyze comfort, durability, drape, care &amp; price metrics side-by-side</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Close comparison">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content / Comparison Grid */}
        <div className="modal-comparison-body">
          <div className="comparison-table-wrapper">
            <table className="fabric-comparison-table">
              <thead>
                <tr>
                  <th className="feature-col">Metric / Attribute</th>
                  {fabrics.map((item) => (
                    <th
                      key={item.fabricType}
                      className={`fabric-col ${item.fabricType === selectedFabric ? 'active-col' : ''} ${
                        item.isPrimaryChoice ? 'recommended-col' : ''
                      }`}
                    >
                      <div className="col-header-box">
                        {item.isPrimaryChoice && (
                          <span className="rec-top-tag">
                            <Sparkles size={10} /> Top Match
                          </span>
                        )}
                        <span className="fabric-col-title">{item.fabricName}</span>
                        {item.fabricType === selectedFabric && (
                          <span className="active-selection-badge">Selected</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Comfort Score */}
                <tr>
                  <td className="feature-label">
                    <strong>Comfort Score</strong>
                    <small>Softness &amp; skin feeling</small>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell">
                      <div className="score-badge-wrap">
                        <span className="score-num">{item.comfortScore}%</span>
                        <div className="mini-progress-track">
                          <div className="mini-fill comfort" style={{ width: `${item.comfortScore}%` }} />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Durability Score */}
                <tr>
                  <td className="feature-label">
                    <strong>Durability Score</strong>
                    <small>Wear resistance &amp; life</small>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell">
                      <div className="score-badge-wrap">
                        <span className="score-num">{item.durabilityScore}%</span>
                        <div className="mini-progress-track">
                          <div className="mini-fill durability" style={{ width: `${item.durabilityScore}%` }} />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Breathability */}
                <tr>
                  <td className="feature-label">
                    <strong>Breathability</strong>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell">
                      <span className={`pill-tag breath-${item.breathability.toLowerCase()}`}>
                        {item.breathability}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Drape */}
                <tr>
                  <td className="feature-label">
                    <strong>Drape &amp; Structure</strong>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell font-medium">
                      {item.drape}
                    </td>
                  ))}
                </tr>

                {/* Care */}
                <tr>
                  <td className="feature-label">
                    <strong>Washing &amp; Care</strong>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell text-muted">
                      {item.care}
                    </td>
                  ))}
                </tr>

                {/* Price / Meter */}
                <tr>
                  <td className="feature-label">
                    <strong>Price / Meter</strong>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell price-highlight">
                      {currencySymbol}
                      {item.pricePerMeterRange.min} - {currencySymbol}
                      {item.pricePerMeterRange.max}
                    </td>
                  ))}
                </tr>

                {/* Estimated Total Garment Price */}
                <tr>
                  <td className="feature-label">
                    <strong>Est. Total Garment Cost</strong>
                    <small>For {fabrics[0]?.estimatedRequiredMeters}m fabric</small>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell total-price-cell">
                      {currencySymbol}
                      {item.estimatedTotalPriceRange.min.toLocaleString()} - {currencySymbol}
                      {item.estimatedTotalPriceRange.max.toLocaleString()}
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="feature-label">
                    <strong>Apply Selection</strong>
                  </td>
                  {fabrics.map((item) => (
                    <td key={item.fabricType} className="metric-cell action-cell">
                      <button
                        type="button"
                        className={`apply-fabric-btn ${
                          item.fabricType === selectedFabric ? 'selected-btn' : ''
                        }`}
                        onClick={() => {
                          onSelectFabric(item.fabricType);
                          onClose();
                        }}
                      >
                        {item.fabricType === selectedFabric ? (
                          <>
                            <Check size={14} /> Active
                          </>
                        ) : (
                          'Select Fabric'
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="comparison-footer-info">
            <Info size={14} className="info-icon" />
            <span>
              Values are calculated in real time using FabriPlay tailor intelligence algorithms. You can select any fabric to instantly update cutting requirements and total price estimation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FabricComparisonModal;
