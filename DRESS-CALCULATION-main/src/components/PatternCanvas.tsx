// ============================================================
// Fabriplay – PatternCanvas Component
// Renders the SVG pattern with all layers:
//   1. Grid background
//   2. Construction (guide) lines
//   3. Dress outline path
//   4. Measurement annotations
//   5. Named point labels
// Supports panning via mouse drag.
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
}

const GRID_SIZE = 20; // px between grid dots

const PatternCanvas = forwardRef<PatternCanvasHandle, PatternCanvasProps>(
  ({ patternData, scale, error, isLoading, patternType }, ref) => {
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
          {/* ── Grid Background ──────────────────────────── */}
          <defs>
            <pattern
              id="grid"
              width={GRID_SIZE}
              height={GRID_SIZE}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={GRID_SIZE} cy={GRID_SIZE} r={0.8} fill="#E2E8F0" />
            </pattern>
          </defs>
          <rect width={svgW} height={svgH} fill="white" />
          <rect width={svgW} height={svgH} fill="url(#grid)" />

          {/* ── Construction Lines ───────────────────────── */}
          <g className="construction-lines">
            {constructionLines.map((line, i) => (
              <line
                key={i}
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke="#CBD5E1"
                strokeWidth={0.8}
                strokeDasharray={line.dashed ? '4 3' : undefined}
              />
            ))}
          </g>

          {/* ── Dress Outline ────────────────────────────── */}
          <g className="dress-outline">
            {/* Subtle fill for the dress body */}
            <path
              d={outlinePath}
              fill="rgba(108,99,255,0.05)"
              stroke="none"
            />
            {/* Main outline */}
            <path
              d={outlinePath}
              fill="none"
              stroke="#1E293B"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

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
                  fontSize={10}
                  fontWeight="700"
                  fill="#6C63FF"
                  fontFamily="Inter, sans-serif"
                >
                  {p.label}
                </text>
                {/* Tooltip-style description on hover via title */}
                {p.description && <title>{`${p.label}: ${p.description}`}</title>}
              </g>
            ))}
          </g>

          {/* ── Centre-front fold indicator ──────────────── */}
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
