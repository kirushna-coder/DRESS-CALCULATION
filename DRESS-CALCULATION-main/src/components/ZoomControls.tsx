// ============================================================
// Fabriplay – ZoomControls Component
// Floating panel for zooming in/out and resetting the view.
// ============================================================

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  minScale: number;
  maxScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  minScale,
  maxScale,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <div className="zoom-controls" aria-label="Zoom controls">
      <button
        id="zoom-out-btn"
        className="zoom-btn"
        onClick={onZoomOut}
        disabled={scale <= minScale}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>

      <button
        id="zoom-reset-btn"
        className="zoom-label-btn"
        onClick={onReset}
        title="Reset Zoom"
        aria-label="Reset Zoom"
      >
        {Math.round((scale / 8) * 100)}%
      </button>

      <button
        id="zoom-in-btn"
        className="zoom-btn"
        onClick={onZoomIn}
        disabled={scale >= maxScale}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn size={16} />
      </button>

      <div className="zoom-divider" />

      <button
        id="zoom-fit-btn"
        className="zoom-btn"
        onClick={onReset}
        title="Fit to View"
        aria-label="Fit to View"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
};

export default ZoomControls;
