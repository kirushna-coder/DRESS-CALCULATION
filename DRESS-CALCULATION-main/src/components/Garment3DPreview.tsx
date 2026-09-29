// ============================================================
// FabricPlay AI – 3D Garment Preview Component
// Embeds ThreeDGarmentViewer WebGL 3D Engine with texture mapping & swatches
// ============================================================

import React from 'react';
import { Box } from 'lucide-react';
import type { PatternType, FabricType, Measurements, PantOptions } from '../types';
import ThreeDGarmentViewer from './ThreeDGarmentViewer';

interface Garment3DPreviewProps {
  patternType: PatternType;
  fabricType: FabricType;
  color: string;
  onColorChange: (color: string) => void;
  measurements: Measurements;
  pantOptions?: PantOptions;
}

const Garment3DPreview: React.FC<Garment3DPreviewProps> = ({
  patternType,
  fabricType,
  color,
  onColorChange,
  measurements,
  pantOptions,
}) => {
  return (
    <div className="garment-3d-card">
      <div className="g3d-header">
        <div className="g3d-title-group">
          <div className="g3d-badge">
            <Box size={16} />
          </div>
          <div>
            <h3 className="g3d-title">Dynamic 3D WebGL Garment Visualizer</h3>
            <p className="g3d-sub">360° Mouse Orbit &bull; Procedural Fabric Texture Mapping &bull; Real Geometry</p>
          </div>
        </div>
      </div>

      {/* Embedded 3D Three.js WebGL Viewer */}
      <ThreeDGarmentViewer
        dressType={patternType as any}
        fabricType={fabricType}
        color={color}
        onColorChange={onColorChange}
        measurements={measurements}
        pantOptions={pantOptions}
        height={360}
      />


    </div>
  );
};

export default Garment3DPreview;
