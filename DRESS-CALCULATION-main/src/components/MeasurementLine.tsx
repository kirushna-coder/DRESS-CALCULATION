// ============================================================
// Fabriplay – MeasurementLine (SVG annotation component)
// Renders a double-headed arrow with a dimension label.
// ============================================================

import React from 'react';
import type { Point } from '../types';

interface MeasurementLineProps {
  from: Point;
  to: Point;
  label: string;
  direction?: 'horizontal' | 'vertical' | 'auto';
  offset?: number;
  color?: string;
  fontSize?: number;
}

const ARROW_SIZE = 6;
const FONT_SIZE_DEFAULT = 9;

const MeasurementLine: React.FC<MeasurementLineProps> = ({
  from,
  to,
  label,
  direction = 'auto',
  color = '#6C63FF',
  fontSize = FONT_SIZE_DEFAULT,
}) => {
  // Midpoint for label
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;


  const isHorizontal =
    direction === 'horizontal' ||
    (direction === 'auto' && Math.abs(to.x - from.x) > Math.abs(to.y - from.y));

  const textOffset = isHorizontal ? -8 : 4;

  return (
    <g className="measurement-annotation" aria-label={`Measurement: ${label}`}>
      {/* Defs for arrowhead marker */}
      <defs>
        <marker
          id={`arrowhead-${label.replace(/[^a-z0-9]/gi, '')}`}
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE - 1}
          refY={ARROW_SIZE / 2}
          orient="auto"
        >
          <polygon
            points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
            fill={color}
          />
        </marker>
        <marker
          id={`arrowhead-r-${label.replace(/[^a-z0-9]/gi, '')}`}
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={1}
          refY={ARROW_SIZE / 2}
          orient="auto"
        >
          <polygon
            points={`${ARROW_SIZE} 0, 0 ${ARROW_SIZE / 2}, ${ARROW_SIZE} ${ARROW_SIZE}`}
            fill={color}
          />
        </marker>
      </defs>

      {/* Arrow line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={1}
        markerEnd={`url(#arrowhead-${label.replace(/[^a-z0-9]/gi, '')})`}
        markerStart={`url(#arrowhead-r-${label.replace(/[^a-z0-9]/gi, '')})`}
        strokeDasharray="none"
      />

      {/* Label background */}
      <rect
        x={midX - (label.length * fontSize * 0.32)}
        y={midY + textOffset - fontSize}
        width={label.length * fontSize * 0.62 + 4}
        height={fontSize + 4}
        fill="white"
        rx={2}
        opacity={0.9}
      />

      {/* Label text */}
      <text
        x={midX}
        y={midY + textOffset}
        textAnchor="middle"
        fill={color}
        fontSize={fontSize}
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        transform={
          !isHorizontal
            ? `rotate(-90, ${midX}, ${midY})`
            : undefined
        }
      >
        {label}
      </text>

      {/* Tick marks at endpoints */}
      {isHorizontal ? (
        <>
          <line x1={from.x} y1={from.y - 4} x2={from.x} y2={from.y + 4} stroke={color} strokeWidth={1} />
          <line x1={to.x} y1={to.y - 4} x2={to.x} y2={to.y + 4} stroke={color} strokeWidth={1} />
        </>
      ) : (
        <>
          <line x1={from.x - 4} y1={from.y} x2={from.x + 4} y2={from.y} stroke={color} strokeWidth={1} />
          <line x1={to.x - 4} y1={to.y} x2={to.x + 4} y2={to.y} stroke={color} strokeWidth={1} />
        </>
      )}
    </g>
  );
};

export default MeasurementLine;
