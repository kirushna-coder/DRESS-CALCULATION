// ============================================================
// Fabriplay – PatternCanvas Component
// Renders the SVG pattern with all layers:
//   1. CAD grid background (minor + major lines)
//   2. Construction (guide) lines
//   3. Dress outline path(s) — supports compound paths for PANT
//   4. Measurement annotations
//   5. Named point labels
//   6. [PANT] Piece title labels, grainline arrows
//   7. [PANT] Optional seam allowance offset overlay
// Supports panning via mouse drag.
// Grid elements carry data-grid="true" and are stripped on SVG export.
// ============================================================

import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { PatternData, PatternType } from '../types';
import MeasurementLine from './MeasurementLine';

export interface PatternCanvasHandle {
  getSVGElement: () => SVGSVGElement | null;
  getContainerElement: () => HTMLDivElement | null;
}

interface PatternCanvasProps {
  patternData: PatternData | null;
  scale: number;
  error: string | null;
  isLoading?: boolean;
  patternType?: PatternType;
  seamAllowance?: number; // in pixels; 0 = off
}

// Grid geometry constants
// Minor subdivisions per major division (so 4 minor cells = 1 inch at default scale)
const MINOR_DIVS = 4;

// ── Grainline Arrow helper ──────────────────────────────────
// Renders a double-headed grainline arrow at (cx, cy) of given length (vertical)
const GrainLine: React.FC<{ cx: number; cy: number; len: number; label: string }> = ({
  cx, cy, len, label,
}) => {
  const hy = len / 2;
  const arrowSize = 6;
  return (
    <g>
      {/* shaft */}
      <line x1={cx} y1={cy - hy} x2={cx} y2={cy + hy} stroke="#6C63FF" strokeWidth={1.2} />
      {/* top arrow */}
      <polyline
        points={`${cx - arrowSize / 2},${cy - hy + arrowSize} ${cx},${cy - hy} ${cx + arrowSize / 2},${cy - hy + arrowSize}`}
        fill="none" stroke="#6C63FF" strokeWidth={1.2} strokeLinejoin="round"
      />
      {/* bottom arrow */}
      <polyline
        points={`${cx - arrowSize / 2},${cy + hy - arrowSize} ${cx},${cy + hy} ${cx + arrowSize / 2},${cy + hy - arrowSize}`}
        fill="none" stroke="#6C63FF" strokeWidth={1.2} strokeLinejoin="round"
      />
      {/* label */}
      <text
        x={cx + 9} y={cy + 4}
        fontSize={8} fill="#6C63FF" fontFamily="Inter, sans-serif"
        fontStyle="italic"
      >
        {label}
      </text>
    </g>
  );
};

// ── Piece title badge ──────────────────────────────────────
const PieceLabel: React.FC<{ x: number; y: number; text: string; sub?: string }> = ({
  x, y, text, sub,
}) => (
  <g>
    <text
      x={x} y={y}
      fontSize={11} fontWeight="700" fill="#1E293B"
      fontFamily="Inter, sans-serif" textAnchor="middle"
    >
      {text}
    </text>
    {sub && (
      <text
        x={x} y={y + 14}
        fontSize={8} fill="#64748B"
        fontFamily="Inter, sans-serif" textAnchor="middle"
      >
        {sub}
      </text>
    )}
  </g>
);

const PatternCanvas = forwardRef<PatternCanvasHandle, PatternCanvasProps>(
  ({ patternData, scale, error, isLoading, patternType, seamAllowance = 0 }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });

    // Expose SVG and container elements for export utilities
    useImperativeHandle(ref, () => ({
      getSVGElement: () => svgRef.current,
      getContainerElement: () => containerRef.current,
    }));

    // ── Pan handlers ────────────────────────────────────────
    const onMouseDown = useCallback((e: React.MouseEvent) => {
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }, [pan]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
      if (!isPanning) return;
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }, [isPanning]);

    const onMouseUp = useCallback(() => setIsPanning(false), []);

    // ── Render states ────────────────────────────────────────
    if (error) {
      return (
        <div className="canvas-wrapper" ref={containerRef}>
          <div className="canvas-error">
            <span>⚠️ {error}</span>
          </div>
        </div>
      );
    }

    if (!patternData) {
      return (
        <div className="canvas-wrapper" ref={containerRef}>
          <div className="canvas-empty">
            <div className="canvas-empty-icon">✂️</div>
            <p>Enter measurements and click <strong>Generate Pattern</strong> to preview your dress pattern.</p>
          </div>
        </div>
      );
    }

    const { outlinePath, points, constructionLines, annotations, bounds } = patternData;
    const svgW = bounds.width + 120;   // extra space for right-side annotations
    const svgH = bounds.height + 40;

    const isPant = patternType === 'PANT';

    // ── PANT-specific piece geometry (computed from scale) ────
    // These match the layout geometry in calculatePantPattern:
    const fX0 = 36;
    const fY0 = 40;
    const outseamLen   = 40;  // fallback; actual comes from pattern data via annotations
    const inseamLen    = 30;

    return (
      <div
        className={`canvas-wrapper${isPanning ? ' panning' : ''}`}
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {isLoading && <div className="canvas-loading">Calculating…</div>}

        <svg
          key={patternType ?? 'pattern'}
          ref={svgRef}
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="pattern-svg"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
          aria-label="Dress pattern canvas"
        >
          {/* ── CAD Grid Background ───────────────────────── */}
          {/* Grid spacing: scale px = 1 inch (major); scale/MINOR_DIVS px = 1/4 inch (minor) */}
          <defs data-grid="true">
            {/* Minor grid tile: 1/4-inch cell */}
            <pattern
              id="cad-minor-grid"
              width={scale / MINOR_DIVS}
              height={scale / MINOR_DIVS}
              patternUnits="userSpaceOnUse"
            >
              {/* Vertical minor line */}
              <line
                x1={scale / MINOR_DIVS} y1={0}
                x2={scale / MINOR_DIVS} y2={scale / MINOR_DIVS}
                stroke="#E2E8F0" strokeWidth={0.4}
              />
              {/* Horizontal minor line */}
              <line
                x1={0} y1={scale / MINOR_DIVS}
                x2={scale / MINOR_DIVS} y2={scale / MINOR_DIVS}
                stroke="#E2E8F0" strokeWidth={0.4}
              />
            </pattern>
            {/* Major grid tile: 1-inch cell (overlaid on top of minor) */}
            <pattern
              id="cad-major-grid"
              width={scale}
              height={scale}
              patternUnits="userSpaceOnUse"
            >
              {/* Minor grid fill inside major tile */}
              <rect width={scale} height={scale} fill="url(#cad-minor-grid)" />
              {/* Vertical major line */}
              <line
                x1={scale} y1={0}
                x2={scale} y2={scale}
                stroke="#CBD5E1" strokeWidth={0.75}
              />
              {/* Horizontal major line */}
              <line
                x1={0} y1={scale}
                x2={scale} y2={scale}
                stroke="#CBD5E1" strokeWidth={0.75}
              />
            </pattern>
          </defs>
          {/* White canvas base */}
          <rect width={svgW} height={svgH} fill="#FAFBFC" data-grid="true" />
          {/* Minor grid fill */}
          <rect width={svgW} height={svgH} fill="url(#cad-minor-grid)" data-grid="true" />
          {/* Major grid overlay */}
          <rect width={svgW} height={svgH} fill="url(#cad-major-grid)" data-grid="true" />

          {/* ── Construction Lines ───────────────────────── */}
          <g className="construction-lines">
            {constructionLines.map((line, i) => (
              <line
                key={i}
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke={line.dashed ? '#CBD5E1' : '#94A3B8'}
                strokeWidth={line.dashed ? 0.8 : 1}
                strokeDasharray={line.dashed ? '4 3' : undefined}
              />
            ))}
          </g>

          {/* ── Dress Outline / Multi-Piece Shapes ─────────── */}
          <g className="dress-outline">
            {patternData.pieces && patternData.pieces.length > 0 ? (
              patternData.pieces.map((piece) => (
                <g key={piece.id}>
                  <path d={piece.path} fill={piece.fillTint} stroke="none" />
                  <path
                    d={piece.path}
                    fill="none"
                    stroke={piece.strokeColor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </g>
              ))
            ) : isPant ? (
              // Fallback split for legacy compound path PANT
              (() => {
                const pieces = outlinePath
                  .split(/(?=M\s)/)
                  .map((p) => p.trim())
                  .filter(Boolean);
                const fills = [
                  'rgba(108,99,255,0.07)',   // front – indigo tint
                  'rgba(16,185,129,0.07)',   // back  – emerald tint
                  'rgba(245,158,11,0.08)',   // waistband – amber tint
                ];
                const strokes = [
                  '#4338CA',   // front  – darker indigo
                  '#059669',   // back   – darker emerald
                  '#B45309',   // waistband – darker amber
                ];
                return pieces.map((piece, i) => (
                  <g key={i}>
                    <path d={piece} fill={fills[i] ?? 'rgba(108,99,255,0.05)'} stroke="none" />
                    <path
                      d={piece}
                      fill="none"
                      stroke={strokes[i] ?? '#1E293B'}
                      strokeWidth={i === 2 ? 1.5 : 2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                ));
              })()
            ) : (
              <>
                <path d={outlinePath} fill="rgba(108,99,255,0.05)" stroke="none" />
                <path
                  d={outlinePath}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>

          {/* ── Seam Allowance Overlay ────────────────────── */}
          {seamAllowance > 0 && (
            <g className="seam-allowance">
              <path
                d={outlinePath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={seamAllowance * 2}
                strokeDasharray="5 4"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeOpacity={0.55}
              />
            </g>
          )}

          {/* ── Measurement Annotations ──────────────────── */}
          <g className="annotations">
            {annotations.map((ann, i) => (
              <MeasurementLine
                key={i}
                from={ann.from}
                to={ann.to}
                label={ann.label}
                direction={ann.direction}
              />
            ))}
          </g>

          {/* ── Point Labels ──────────────────────────────── */}
          <g className="point-labels">
            {points.map((p) => (
              <g key={p.label} className="pattern-point">
                {/* Dot */}
                <circle
                  cx={p.point.x}
                  cy={p.point.y}
                  r={3}
                  fill="#6C63FF"
                  stroke="white"
                  strokeWidth={1.5}
                />
                {/* Label */}
                <text
                  x={p.point.x + 6}
                  y={p.point.y - 5}
                  fontSize={9}
                  fontWeight="700"
                  fill="#6C63FF"
                  fontFamily="Inter, sans-serif"
                >
                  {p.label}
                </text>
                {p.description && <title>{`${p.label}: ${p.description}`}</title>}
              </g>
            ))}
          </g>

          {/* ── Piece Title Labels & Grainline Arrows ── */}
          {patternData.pieces && patternData.pieces.length > 0 ? (
            <g className="piece-meta-labels">
              {patternData.pieces.map((piece) => (
                <g key={`meta-${piece.id}`}>
                  {piece.labelCx !== undefined && piece.labelCy !== undefined && (
                    <PieceLabel
                      x={piece.labelCx}
                      y={piece.labelCy}
                      text={piece.label}
                      sub={piece.subLabel}
                    />
                  )}
                  {piece.grainCx !== undefined &&
                    piece.grainCy !== undefined &&
                    piece.grainLen !== undefined && (
                      <GrainLine
                        cx={piece.grainCx}
                        cy={piece.grainCy}
                        len={piece.grainLen}
                        label="Grain"
                      />
                    )}
                </g>
              ))}
            </g>
          ) : isPant ? (
            (() => {
              const fRise   = (outseamLen - inseamLen) * scale;
              const fInseam = inseamLen * scale;
              const frontH  = 10 * scale;

              const frontCX = fX0 + frontH * 0.5 + 0.2 * frontH;
              const frontCY = fY0 + fRise * 0.4;
              const frontGrainLen = fRise * 0.5;

              const backOffsetX = fX0 + frontH + (3.5 * scale) + (frontH + 0.5 * scale) + 0.35 * frontH + frontH * 0.5;
              const backCY   = fY0 + fRise * 0.4;
              const backGrainLen = fRise * 0.5;

              const wbY0 = fY0 + fRise + fInseam + 2.5 * scale;
              const wbLength = 33.5 * scale;
              const wbCenterX = fX0 + wbLength / 2;
              const wbCenterY = wbY0 + 0.75 * scale;

              return (
                <>
                  <PieceLabel x={frontCX} y={frontCY} text="FRONT" sub="(Cut × 2)" />
                  <GrainLine cx={frontCX} cy={frontCY + 30} len={frontGrainLen * 0.5} label="Grain" />
                  <PieceLabel x={backOffsetX} y={backCY} text="BACK" sub="(Cut × 2)" />
                  <GrainLine cx={backOffsetX} cy={backCY + 30} len={backGrainLen * 0.5} label="Grain" />
                  <PieceLabel x={wbCenterX} y={wbCenterY} text="WAISTBAND" sub="(Cut × 2 on fold)" />

                  <text x={fX0 + 2} y={fY0 - 5} fontSize={7} fill="#94A3B8" fontFamily="Inter, sans-serif">
                    WAIST LINE
                  </text>
                  <text x={fX0 + 2} y={fY0 + fRise * 0.6 - 4} fontSize={7} fill="#94A3B8" fontFamily="Inter, sans-serif">
                    HIP LINE
                  </text>
                  <text x={fX0 + 2} y={fY0 + fRise - 4} fontSize={7} fill="#94A3B8" fontFamily="Inter, sans-serif">
                    CROTCH LINE
                  </text>
                  <text x={fX0 + 2} y={fY0 + fRise + fInseam * 0.45 - 4} fontSize={7} fill="#94A3B8" fontFamily="Inter, sans-serif">
                    KNEE LINE
                  </text>
                  <text x={fX0 + 2} y={fY0 + fRise + fInseam - 4} fontSize={7} fill="#94A3B8" fontFamily="Inter, sans-serif">
                    HEM LINE
                  </text>
                </>
              );
            })()
          ) : null}

          {/* ── Centre-front fold indicator (non-pant only) ─── */}
          {!isPant && (
            <text
              x={16}
              y={svgH / 2}
              fontSize={9}
              fill="#94A3B8"
              fontFamily="Inter, sans-serif"
              transform={`rotate(-90, 16, ${svgH / 2})`}
              textAnchor="middle"
            >
              ← FOLD / CENTRE FRONT →
            </text>
          )}

          {/* ── Scale indicator ──────────────────────────── */}
          <g transform={`translate(${svgW - 80}, ${svgH - 24})`}>
            <line x1={0} y1={8} x2={scale} y2={8} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={0} y1={4} x2={0} y2={12} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={scale} y1={4} x2={scale} y2={12} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={scale / 2} y={20} textAnchor="middle" fontSize={8} fill="#94A3B8" fontFamily="Inter, sans-serif">
              1 inch
            </text>
          </g>
        </svg>
      </div>
    );
  }
);

PatternCanvas.displayName = 'PatternCanvas';
export default PatternCanvas;
