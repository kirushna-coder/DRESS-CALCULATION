// ============================================================
// FabricPlay AI – Fit Validation & Seam Alignment Panel
// Displays missing measurement alerts, seam alignment checks, & warnings
// ============================================================

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Layers, Info } from 'lucide-react';
import type { Measurements, PatternType, PantOptions } from '../types';
import { validateGarmentFit } from '../utils/fitValidator';

interface FitValidationPanelProps {
  measurements: Measurements;
  patternType: PatternType;
  pantOptions?: PantOptions;
  onFixMeasurement?: (field: keyof Measurements) => void;
}

const FitValidationPanel: React.FC<FitValidationPanelProps> = ({
  measurements,
  patternType,
  pantOptions,
}) => {
  const result = validateGarmentFit(measurements, patternType, pantOptions);

  return (
    <div className="fit-validation-card">
      <div className="fvc-header">
        <div className="fvc-title-group">
          <div className={`fvc-score-badge ${result.overallConfidence >= 80 ? 'high' : result.overallConfidence >= 60 ? 'mid' : 'low'}`}>
            <Sparkles size={14} />
            <span>{result.overallConfidence}% Fit Confidence</span>
          </div>
          <h3 className="fvc-title">Pattern Fit &amp; Seam Integrity Validation</h3>
        </div>
        <span className={`status-pill ${result.isValid ? 'valid' : 'warning'}`}>
          {result.isValid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          <span>{result.isValid ? 'Geometry Verified' : 'Review Required'}</span>
        </span>
      </div>

      {/* ── Missing Fields Alert ─────────────────────── */}
      {result.missingFields.length > 0 && (
        <div className="fvc-alert-box error">
          <div className="alert-box-header">
            <ShieldAlert size={15} />
            <span>Missing Essential Measurements ({result.missingFields.length})</span>
          </div>
          <p className="alert-box-sub">
            The following measurements are required for high-precision drafting:
          </p>
          <div className="missing-chips-row">
            {result.missingFields.map((field) => (
              <span key={field} className="missing-chip">
                + {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Dimension & Proportion Warnings ───────────── */}
      {result.dimensionWarnings.length > 0 && (
        <div className="fvc-alert-box warning">
          <div className="alert-box-header">
            <AlertTriangle size={15} />
            <span>Proportional &amp; Dimensional Warnings</span>
          </div>
          <ul className="alert-list">
            {result.dimensionWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Seam Alignment Table (Front vs Back Joins) ── */}
      <div className="fvc-section">
        <div className="fvc-section-header">
          <Layers size={14} />
          <span>Joining Seam Alignment &amp; Ease Balance</span>
        </div>

        <div className="seam-table-wrap">
          <table className="seam-alignment-table">
            <thead>
              <tr>
                <th>Joining Seam Name</th>
                <th>Front Seam</th>
                <th>Back Seam</th>
                <th>Difference</th>
                <th>Patternmaking Rule &amp; Alignment</th>
              </tr>
            </thead>
            <tbody>
              {result.mismatches.map((mismatch, idx) => (
                <tr key={idx} className={`seam-row ${mismatch.severity}`}>
                  <td className="font-semibold">{mismatch.seamName}</td>
                  <td>{mismatch.frontLength}"</td>
                  <td>{mismatch.backLength}"</td>
                  <td>
                    <span className={`diff-badge ${mismatch.difference > 0.5 ? 'warn' : 'ok'}`}>
                      {mismatch.difference > 0 ? `+${mismatch.difference}"` : '0"'}
                    </span>
                  </td>
                  <td>
                    <p className="seam-msg">{mismatch.message}</p>
                    <p className="seam-sug">{mismatch.suggestion}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Disclaimer Box ──────────────────────────── */}
      <div className="fvc-disclaimer-box">
        <Info size={14} className="info-icon" />
        <p className="disclaimer-text">
          <strong>Fitting Validation Notice:</strong> Mathematical pattern alignment verifies 2D geometry consistency. Physical garment fit depends on fabric drape, elasticity, and individual posture. Always sew a test muslin prior to cutting final fabric.
        </p>
      </div>
    </div>
  );
};

export default FitValidationPanel;
