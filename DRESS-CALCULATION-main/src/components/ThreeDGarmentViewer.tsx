// ============================================================
// FabricPlay AI – Interactive 3D WebGL Garment Rendering Engine
// Powered by Three.js — Parametric Garment Meshes, Fabric Textures,
// 360° Mouse Orbiting, Custom Lighting, & Measurement-Driven Scaling
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import type { PatternType, FabricType, Measurements, PantOptions } from '../types';
import { COLOR_PALETTE } from '../utils/demoData';

interface ThreeDGarmentViewerProps {
  dressType: PatternType;
  fabricType: FabricType;
  color: string;
  onColorChange?: (color: string) => void;
  measurements: Measurements;
  pantOptions?: PantOptions;
  height?: number; // canvas height in px
  showControls?: boolean;
}

// Helper to build procedural fabric textures using HTML Canvas
function createProceduralFabricTexture(fabricType: FabricType, baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Fill base color
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.globalAlpha = 0.15;

  if (fabricType === 'DENIM') {
    // Diagonal twill lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    for (let i = -256; i < 512; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }
    // Contrast slub noise
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 600; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  } else if (fabricType === 'COTTON') {
    // Fine grid weave
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  } else if (fabricType === 'LINEN') {
    // Irregular slub threads
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 256; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i + (Math.random() * 4 - 2), 0);
      ctx.lineTo(i + (Math.random() * 4 - 2), 256);
      ctx.stroke();
    }
    ctx.strokeStyle = '#000000';
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 256; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  } else if (fabricType === 'WOOL') {
    // Herringbone tweed pattern
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 12) {
      for (let x = 0; x < 256; x += 12) {
        ctx.beginPath();
        if ((x / 12) % 2 === 0) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 6, y + 6);
          ctx.lineTo(x + 12, y);
        } else {
          ctx.moveTo(x, y + 6);
          ctx.lineTo(x + 6, y);
          ctx.lineTo(x + 12, y + 6);
        }
        ctx.stroke();
      }
    }
  } else if (fabricType === 'SILK') {
    // Smooth subtle sheen gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

const ThreeDGarmentViewer: React.FC<ThreeDGarmentViewerProps> = ({
  dressType,
  fabricType,
  color,
  onColorChange,
  measurements: m,
  pantOptions,
  height = 420,
  showControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0.1, y: 0 });
  const zoomLevel = useRef<number>(4.2);
  const [viewPreset, setViewPreset] = useState<'front' | 'side' | 'back' | 'isometric'>('front');
  const [showMannequin, setShowMannequin] = useState(true);

  // ── Build 3D Garment Mesh Group ───────────────────────────
  // ── Build 3D Garment Mesh Group ───────────────────────────
  const createGarment3DMesh = (
    type: PatternType,
    fab: FabricType,
    hexColor: string,
    measurements: Measurements,
    pOpts?: PantOptions
  ): THREE.Group => {
    const group = new THREE.Group();

    // Scale factors derived from body measurements
    const bustScale = (measurements.bust || 36) / 36;
    const waistScale = (measurements.waist || 30) / 30;
    const hipScale = (measurements.hip || 40) / 40;
    const lenScale = (measurements.fullLength || 40) / 40;
    const sleeveLenScale = (measurements.sleeveLength || 22) / 22;

    const texture = createProceduralFabricTexture(fab, hexColor);

    // Material properties based on fabric type
    const roughness = fab === 'SILK' ? 0.2 : fab === 'DENIM' ? 0.85 : fab === 'VELVET' ? 0.9 : 0.6;
    const metalness = fab === 'SILK' ? 0.15 : 0.0;

    const mainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hexColor),
      map: texture,
      roughness,
      metalness,
      side: THREE.DoubleSide,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F59E0B'), // Gold/Amber accent
      roughness: 0.3,
      metalness: 0.5,
    });

    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1E293B'), // Dark Slate button
      roughness: 0.2,
      metalness: 0.2,
    });

    const whiteTrimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F8FAFC'),
      roughness: 0.35,
    });

    // Helper: Create pleated skirt geometry with wavy pleat ridges
    const createPleatedSkirtGeo = (topR: number, botR: number, h: number, pleatCount: number = 16) => {
      const geo = new THREE.CylinderGeometry(topR, botR, h, pleatCount * 2, 8, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = pos.getY(i);
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        const heightFactor = (0.5 - y / h); // 0 at top, 1 at bottom
        const pleatRipple = Math.sin(angle * pleatCount) * 0.05 * heightFactor;
        const newRadius = Math.max(0.04, radius + pleatRipple);
        pos.setX(i, Math.cos(angle) * newRadius);
        pos.setZ(i, Math.sin(angle) * newRadius);
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Helper: Create 3D folded collar flap wing
    const createCollarFlap = (isLeft: boolean) => {
      const flapShape = new THREE.Shape();
      flapShape.moveTo(0, 0);
      flapShape.lineTo(isLeft ? -0.15 : 0.15, -0.04);
      flapShape.lineTo(isLeft ? -0.22 : 0.22, -0.22); // Sharp collar tip pointing down
      flapShape.lineTo(isLeft ? -0.06 : 0.06, -0.18);
      flapShape.closePath();

      const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelSize: 0.008,
        bevelThickness: 0.008,
      });

      const flapMesh = new THREE.Mesh(flapGeo, whiteTrimMaterial);
      flapMesh.position.set(isLeft ? -0.04 : 0.04, 0.76, 0.20);
      flapMesh.rotation.x = 0.35; // Angle forward onto chest
      flapMesh.rotation.y = isLeft ? -0.25 : 0.25;
      return flapMesh;
    };

    // ── Build Mesh Geometry by Garment Type ─────────────────
    switch (type) {
      case 'SHIRT': {
        // ── Tailored Formal Shirt with Sloped Shoulders & Curved Hem ──────
        const torsoShape = new THREE.Shape();
        torsoShape.moveTo(0, 0.70); // Neck cutout center
        torsoShape.quadraticCurveTo(0.08, 0.70, 0.16, 0.80); // Right neck base
        torsoShape.lineTo(0.54 * bustScale, 0.65);           // Sloped shoulder
        torsoShape.quadraticCurveTo(0.50 * bustScale, 0.45, 0.46 * bustScale, 0.35); // Armhole seam
        torsoShape.quadraticCurveTo(0.42 * waistScale, 0.0, 0.44 * waistScale, -0.15); // Waist taper
        torsoShape.lineTo(0.47 * waistScale, -0.65 * lenScale); // Hip hem
        torsoShape.quadraticCurveTo(0.24 * waistScale, -0.78 * lenScale, 0, -0.78 * lenScale); // Shirt tail curved hem
        // Left side (mirrored)
        torsoShape.quadraticCurveTo(-0.24 * waistScale, -0.78 * lenScale, -0.47 * waistScale, -0.65 * lenScale);
        torsoShape.lineTo(-0.44 * waistScale, -0.15);
        torsoShape.quadraticCurveTo(-0.42 * waistScale, 0.0, -0.46 * bustScale, 0.35);
        torsoShape.quadraticCurveTo(-0.50 * bustScale, 0.45, -0.54 * bustScale, 0.65);
        torsoShape.lineTo(-0.16, 0.80);
        torsoShape.quadraticCurveTo(-0.08, 0.70, 0, 0.70);

        const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, {
          depth: 0.36 * waistScale,
          bevelEnabled: true,
          bevelSegments: 6,
          steps: 1,
          bevelSize: 0.08,
          bevelThickness: 0.08,
          curveSegments: 32,
        });
        torsoGeo.center();

        const torso = new THREE.Mesh(torsoGeo, mainMaterial);
        group.add(torso);

        // Collar Stand (Upright collar ring around neck base)
        const standGeo = new THREE.CylinderGeometry(0.22, 0.23, 0.14, 24, 1, true);
        const stand = new THREE.Mesh(standGeo, whiteTrimMaterial);
        stand.position.set(0, 0.80, 0);
        group.add(stand);

        // Folded Collar Flaps (Left & Right collar tips pointing down over chest)
        group.add(createCollarFlap(true));
        group.add(createCollarFlap(false));

        // Front Placket (Vertical button strip along front center)
        const placketGeo = new THREE.BoxGeometry(0.08, 1.4 * lenScale, 0.03);
        const placket = new THREE.Mesh(placketGeo, whiteTrimMaterial);
        placket.position.set(0, -0.02, 0.27);
        group.add(placket);

        // 6 Front Buttons
        for (let i = 0; i < 6; i++) {
          const btnGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.02, 16);
          const btn = new THREE.Mesh(btnGeo, buttonMaterial);
          btn.rotation.x = Math.PI / 2;
          btn.position.set(0, 0.60 - i * 0.24 * lenScale, 0.29);
          group.add(btn);
        }

        // Left Chest Pocket
        const pocketGeo = new THREE.BoxGeometry(0.14, 0.16, 0.02);
        const pocket = new THREE.Mesh(pocketGeo, mainMaterial);
        pocket.position.set(-0.20 * bustScale, 0.32, 0.27);
        group.add(pocket);

        // Back Yoke Seam (Across upper back)
        const yokeGeo = new THREE.BoxGeometry(0.85 * bustScale, 0.02, 0.02);
        const yoke = new THREE.Mesh(yokeGeo, whiteTrimMaterial);
        yoke.position.set(0, 0.58, -0.27);
        group.add(yoke);

        // Downward Angled Sleeves with Natural Shoulder Connection
        const sleeveGeo = new THREE.CylinderGeometry(0.18 * bustScale, 0.13, 1.15 * sleeveLenScale, 20);

        // Left Sleeve (Angled ~60° downward)
        const leftSleeve = new THREE.Mesh(sleeveGeo, mainMaterial);
        leftSleeve.position.set(-0.54 * bustScale, 0.22, 0);
        leftSleeve.rotation.z = Math.PI / 3;
        group.add(leftSleeve);

        // Right Sleeve (Angled ~60° downward)
        const rightSleeve = new THREE.Mesh(sleeveGeo, mainMaterial);
        rightSleeve.position.set(0.54 * bustScale, 0.22, 0);
        rightSleeve.rotation.z = -Math.PI / 3;
        group.add(rightSleeve);

        // Sleeve Cuffs with Cuff Buttons
        const cuffGeo = new THREE.CylinderGeometry(0.135, 0.135, 0.10, 20);
        const lcuff = new THREE.Mesh(cuffGeo, whiteTrimMaterial);
        lcuff.position.set(
          -0.54 * bustScale - Math.sin(Math.PI / 3) * 0.55 * sleeveLenScale,
          0.22 - Math.cos(Math.PI / 3) * 0.55 * sleeveLenScale,
          0
        );
        lcuff.rotation.z = Math.PI / 3;
        group.add(lcuff);

        const rcuff = new THREE.Mesh(cuffGeo, whiteTrimMaterial);
        rcuff.position.set(
          0.54 * bustScale + Math.sin(Math.PI / 3) * 0.55 * sleeveLenScale,
          0.22 - Math.cos(Math.PI / 3) * 0.55 * sleeveLenScale,
          0
        );
        rcuff.rotation.z = -Math.PI / 3;
        group.add(rcuff);
        break;
      }

      case 'TSHIRT': {
        // Crew Neck Casual T-Shirt with Sloped Shoulders & Downward Short Sleeves
        const teeShape = new THREE.Shape();
        teeShape.moveTo(0, 0.68);
        teeShape.quadraticCurveTo(0.12, 0.68, 0.20, 0.78);
        teeShape.lineTo(0.54 * bustScale, 0.65);
        teeShape.quadraticCurveTo(0.50 * bustScale, 0.45, 0.46 * bustScale, 0.35);
        teeShape.lineTo(0.44 * waistScale, -0.65 * lenScale);
        teeShape.lineTo(-0.44 * waistScale, -0.65 * lenScale);
        teeShape.lineTo(-0.46 * bustScale, 0.35);
        teeShape.quadraticCurveTo(-0.50 * bustScale, 0.45, -0.54 * bustScale, 0.65);
        teeShape.lineTo(-0.20, 0.78);
        teeShape.quadraticCurveTo(-0.12, 0.68, 0, 0.68);

        const teeGeo = new THREE.ExtrudeGeometry(teeShape, {
          depth: 0.36 * waistScale,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 1,
          bevelSize: 0.08,
          bevelThickness: 0.08,
          curveSegments: 24,
        });
        teeGeo.center();

        const tee = new THREE.Mesh(teeGeo, mainMaterial);
        group.add(tee);

        // Ribbed Round Neck Collar Ring
        const neckRibGeo = new THREE.TorusGeometry(0.24, 0.045, 12, 28);
        const neckRib = new THREE.Mesh(neckRibGeo, whiteTrimMaterial);
        neckRib.rotation.x = Math.PI / 2.2;
        neckRib.position.set(0, 0.74, 0.05);
        group.add(neckRib);

        // Short Casual Sleeves
        const sGeo = new THREE.CylinderGeometry(0.19 * bustScale, 0.15, 0.65 * sleeveLenScale, 18);

        const slL = new THREE.Mesh(sGeo, mainMaterial);
        slL.position.set(-0.56 * bustScale, 0.48, 0);
        slL.rotation.z = Math.PI / 3.5;
        group.add(slL);

        const slR = new THREE.Mesh(sGeo, mainMaterial);
        slR.position.set(0.56 * bustScale, 0.48, 0);
        slR.rotation.z = -Math.PI / 3.5;
        group.add(slR);

        // Sleeve Hem Rings
        const sHemGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 20);
        const sHemL = new THREE.Mesh(sHemGeo, whiteTrimMaterial);
        sHemL.position.set(
          -0.56 * bustScale - Math.sin(Math.PI / 3.5) * 0.32 * sleeveLenScale,
          0.48 - Math.cos(Math.PI / 3.5) * 0.32 * sleeveLenScale,
          0
        );
        sHemL.rotation.z = Math.PI / 3.5;
        group.add(sHemL);

        const sHemR = new THREE.Mesh(sHemGeo, whiteTrimMaterial);
        sHemR.position.set(
          0.56 * bustScale + Math.sin(Math.PI / 3.5) * 0.32 * sleeveLenScale,
          0.48 - Math.cos(Math.PI / 3.5) * 0.32 * sleeveLenScale,
          0
        );
        sHemR.rotation.z = -Math.PI / 3.5;
        group.add(sHemR);
        break;
      }

      case 'PANT': {
        const pStyle = pOpts?.style || 'formal';
        const isJeans = pStyle === 'jeans';
        const isSlim = pStyle === 'slim' || pOpts?.fit === 'slim';

        const pMat = isJeans
          ? new THREE.MeshStandardMaterial({ color: new THREE.Color(hexColor), map: texture, roughness: 0.85 })
          : mainMaterial;

        // Tailored Waistband
        const wbGeo = new THREE.CylinderGeometry(0.48 * waistScale, 0.49 * waistScale, 0.18, 24);
        const wb = new THREE.Mesh(wbGeo, pMat);
        wb.position.y = 0.50;
        group.add(wb);

        // 5 Belt Loops
        for (let a = 0; a < 5; a++) {
          const angle = (a / 5) * Math.PI * 2;
          const loopGeo = new THREE.BoxGeometry(0.04, 0.20, 0.04);
          const loop = new THREE.Mesh(loopGeo, isJeans ? accentMaterial : pMat);
          loop.position.set(Math.cos(angle) * 0.49 * waistScale, 0.50, Math.sin(angle) * 0.49 * waistScale);
          group.add(loop);
        }

        // Front Zip Fly Placket
        const flyGeo = new THREE.BoxGeometry(0.06, 0.28, 0.03);
        const fly = new THREE.Mesh(flyGeo, pMat);
        fly.position.set(0, 0.32, 0.50 * waistScale);
        group.add(fly);

        // Legs snapped to waistband bottom
        const legH = 2.2 * lenScale;
        const legCentreY = 0.40 - legH / 2;
        const bottomR = isSlim ? 0.16 : 0.22;
        const legGeo = new THREE.CylinderGeometry(0.28 * hipScale, bottomR, legH, 20);

        const leftLeg = new THREE.Mesh(legGeo, pMat);
        leftLeg.position.set(-0.25 * hipScale, legCentreY, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, pMat);
        rightLeg.position.set(0.25 * hipScale, legCentreY, 0);
        group.add(rightLeg);

        // Crotch Gusset
        const gussetGeo = new THREE.SphereGeometry(0.20 * hipScale, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const gusset = new THREE.Mesh(gussetGeo, pMat);
        gusset.position.y = 0.40;
        gusset.rotation.x = Math.PI;
        group.add(gusset);

        if (isJeans) {
          // Jeans Curved Coin Pockets & Brass Rivets
          const pckGeo = new THREE.TorusGeometry(0.18, 0.02, 8, 16, Math.PI / 2);
          const pckL = new THREE.Mesh(pckGeo, accentMaterial);
          pckL.position.set(-0.35, 0.32, 0.48 * waistScale);
          pckL.rotation.z = -Math.PI / 4;
          group.add(pckL);

          const pckR = new THREE.Mesh(pckGeo, accentMaterial);
          pckR.position.set(0.35, 0.32, 0.48 * waistScale);
          pckR.rotation.z = Math.PI / 4;
          group.add(pckR);
        } else {
          // Formal Press Crease Lines down front of each leg
          const creaseGeo = new THREE.BoxGeometry(0.012, legH, 0.012);
          const cL = new THREE.Mesh(creaseGeo, whiteTrimMaterial);
          cL.position.set(-0.25 * hipScale, legCentreY, bottomR * 1.1);
          group.add(cL);

          const cR = new THREE.Mesh(creaseGeo, whiteTrimMaterial);
          cR.position.set(0.25 * hipScale, legCentreY, bottomR * 1.1);
          group.add(cR);
        }
        break;
      }

      case 'KURTA':
      // @ts-ignore - KURTI alias
      case 'KURTI': {
        // Flowing Ethnic Tunic with Open Side Slits & Mandarin Collar
        const kurtaShape = new THREE.Shape();
        kurtaShape.moveTo(0, 0.75);
        kurtaShape.quadraticCurveTo(0.10, 0.75, 0.18, 0.85);
        kurtaShape.lineTo(0.52 * bustScale, 0.70);
        kurtaShape.quadraticCurveTo(0.48 * bustScale, 0.50, 0.45 * bustScale, 0.40);
        kurtaShape.lineTo(0.50 * hipScale, -1.1 * lenScale);
        kurtaShape.lineTo(-0.50 * hipScale, -1.1 * lenScale);
        kurtaShape.lineTo(-0.45 * bustScale, 0.40);
        kurtaShape.quadraticCurveTo(-0.48 * bustScale, 0.50, -0.52 * bustScale, 0.70);
        kurtaShape.lineTo(-0.18, 0.85);
        kurtaShape.quadraticCurveTo(-0.10, 0.75, 0, 0.75);

        const kurtaGeo = new THREE.ExtrudeGeometry(kurtaShape, {
          depth: 0.36 * waistScale,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 1,
          bevelSize: 0.08,
          bevelThickness: 0.08,
          curveSegments: 24,
        });
        kurtaGeo.center();

        const kurta = new THREE.Mesh(kurtaGeo, mainMaterial);
        group.add(kurta);

        // Mandarin Stand Collar
        const collarGeo = new THREE.CylinderGeometry(0.22, 0.23, 0.14, 24, 1, true);
        const collar = new THREE.Mesh(collarGeo, whiteTrimMaterial);
        collar.position.set(0, 0.86, 0);
        group.add(collar);

        // Embroidered Placket with V-Neck slit
        const placketGeo = new THREE.BoxGeometry(0.10, 0.85, 0.03);
        const placket = new THREE.Mesh(placketGeo, accentMaterial);
        placket.position.set(0, 0.40, 0.27);
        group.add(placket);

        // Long Sleeves
        const sGeo = new THREE.CylinderGeometry(0.18 * bustScale, 0.13, 1.35 * sleeveLenScale, 18);
        const slL = new THREE.Mesh(sGeo, mainMaterial);
        slL.position.set(-0.54 * bustScale, 0.20, 0);
        slL.rotation.z = Math.PI / 4.5;
        group.add(slL);

        const slR = new THREE.Mesh(sGeo, mainMaterial);
        slR.position.set(0.54 * bustScale, 0.20, 0);
        slR.rotation.z = -Math.PI / 4.5;
        group.add(slR);
        break;
      }

      case 'BLOUSE': {
        // Cropped Saree Blouse with Sculpted Neckline & Gold Zari Trim
        const blouseShape = new THREE.Shape();
        blouseShape.moveTo(0, 0.55); // Deep front neck cutout
        blouseShape.quadraticCurveTo(0.12, 0.55, 0.18, 0.72);
        blouseShape.lineTo(0.50 * bustScale, 0.65);
        blouseShape.lineTo(0.42 * waistScale, 0.15);
        blouseShape.lineTo(-0.42 * waistScale, 0.15);
        blouseShape.lineTo(-0.50 * bustScale, 0.65);
        blouseShape.lineTo(-0.18, 0.72);
        blouseShape.quadraticCurveTo(-0.12, 0.55, 0, 0.55);

        const blouseGeo = new THREE.ExtrudeGeometry(blouseShape, {
          depth: 0.34 * waistScale,
          bevelEnabled: true,
          bevelSegments: 4,
          steps: 1,
          bevelSize: 0.06,
          bevelThickness: 0.06,
          curveSegments: 24,
        });
        blouseGeo.center();

        const blouse = new THREE.Mesh(blouseGeo, mainMaterial);
        group.add(blouse);

        // Gold Zari Embroidered Hem Ring
        const zariGeo = new THREE.TorusGeometry(0.42 * waistScale, 0.035, 12, 28);
        const zari = new THREE.Mesh(zariGeo, accentMaterial);
        zari.rotation.x = Math.PI / 2;
        zari.position.set(0, 0.15, 0);
        group.add(zari);

        // Fitted Short Sleeves
        const sGeo = new THREE.CylinderGeometry(0.17 * bustScale, 0.14, 0.45 * sleeveLenScale, 16);
        const slL = new THREE.Mesh(sGeo, mainMaterial);
        slL.position.set(-0.52 * bustScale, 0.52, 0);
        slL.rotation.z = Math.PI / 3;
        group.add(slL);

        const slR = new THREE.Mesh(sGeo, mainMaterial);
        slR.position.set(0.52 * bustScale, 0.52, 0);
        slR.rotation.z = -Math.PI / 3;
        group.add(slR);
        break;
      }

      case 'SKIRT': {
        // Flared Pleated Skirt
        const skirtGeo = createPleatedSkirtGeo(0.46 * waistScale, 1.15 * hipScale, 1.8 * lenScale, 18);
        const skirt = new THREE.Mesh(skirtGeo, mainMaterial);
        skirt.position.y = -0.40;
        group.add(skirt);

        // High Waistband
        const wbGeo = new THREE.CylinderGeometry(0.46 * waistScale, 0.46 * waistScale, 0.15, 24);
        const wb = new THREE.Mesh(wbGeo, mainMaterial);
        wb.position.y = 0.50;
        group.add(wb);
        break;
      }

      case 'CHUDIDAR': {
        // Fitted Chudidar Legs with Ankle Gathering Ripples
        const legH = 2.4 * lenScale;
        const legGeo = new THREE.CylinderGeometry(0.28 * hipScale, 0.13, legH, 20);

        const leftLeg = new THREE.Mesh(legGeo, mainMaterial);
        leftLeg.position.set(-0.20 * hipScale, -0.60, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, mainMaterial);
        rightLeg.position.set(0.20 * hipScale, -0.60, 0);
        group.add(rightLeg);

        // Ankle Churi Gather Rings
        for (let r = 0; r < 6; r++) {
          const ringGeo = new THREE.TorusGeometry(0.14, 0.022, 8, 16);
          const ringL = new THREE.Mesh(ringGeo, mainMaterial);
          ringL.rotation.x = Math.PI / 2;
          ringL.position.set(-0.20 * hipScale, -1.45 + r * 0.08, 0);
          group.add(ringL);

          const ringR = new THREE.Mesh(ringGeo, mainMaterial);
          ringR.rotation.x = Math.PI / 2;
          ringR.position.set(0.20 * hipScale, -1.45 + r * 0.08, 0);
          group.add(ringR);
        }
        break;
      }

      case 'JACKET': {
        // Structured Blazer Jacket with Notched Lapels
        const jacketShape = new THREE.Shape();
        jacketShape.moveTo(0, 0.65);
        jacketShape.quadraticCurveTo(0.12, 0.65, 0.20, 0.78);
        jacketShape.lineTo(0.56 * bustScale, 0.65);
        jacketShape.lineTo(0.50 * waistScale, -0.60 * lenScale);
        jacketShape.lineTo(-0.50 * waistScale, -0.60 * lenScale);
        jacketShape.lineTo(-0.56 * bustScale, 0.65);
        jacketShape.lineTo(-0.20, 0.78);
        jacketShape.quadraticCurveTo(-0.12, 0.65, 0, 0.65);

        const jacketGeo = new THREE.ExtrudeGeometry(jacketShape, {
          depth: 0.38 * waistScale,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 1,
          bevelSize: 0.08,
          bevelThickness: 0.08,
          curveSegments: 24,
        });
        jacketGeo.center();

        const jacket = new THREE.Mesh(jacketGeo, mainMaterial);
        group.add(jacket);

        // Notched Lapels
        const lapelGeo = new THREE.BoxGeometry(0.18, 0.65, 0.04);
        const leftLapel = new THREE.Mesh(lapelGeo, whiteTrimMaterial);
        leftLapel.position.set(-0.16, 0.42, 0.28);
        leftLapel.rotation.z = -Math.PI / 10;
        group.add(leftLapel);

        const rightLapel = new THREE.Mesh(lapelGeo, whiteTrimMaterial);
        rightLapel.position.set(0.16, 0.42, 0.28);
        rightLapel.rotation.z = Math.PI / 10;
        group.add(rightLapel);

        // Long Structured Sleeves
        const sGeo = new THREE.CylinderGeometry(0.20 * bustScale, 0.15, 1.30 * sleeveLenScale, 18);
        const slL = new THREE.Mesh(sGeo, mainMaterial);
        slL.position.set(-0.62 * bustScale, 0.22, 0);
        slL.rotation.z = Math.PI / 4;
        group.add(slL);

        const slR = new THREE.Mesh(sGeo, mainMaterial);
        slR.position.set(0.62 * bustScale, 0.22, 0);
        slR.rotation.z = -Math.PI / 4;
        group.add(slR);
        break;
      }

      // @ts-ignore - KIDS alias
      case 'KIDS': {
        // Child Wear Frock with Ribbon Bow
        const bodiceShape = new THREE.Shape();
        bodiceShape.moveTo(0, 0.55);
        bodiceShape.quadraticCurveTo(0.08, 0.55, 0.14, 0.65);
        bodiceShape.lineTo(0.40 * bustScale, 0.55);
        bodiceShape.lineTo(0.36 * waistScale, 0.10);
        bodiceShape.lineTo(-0.36 * waistScale, 0.10);
        bodiceShape.lineTo(-0.40 * bustScale, 0.55);
        bodiceShape.lineTo(-0.14, 0.65);
        bodiceShape.quadraticCurveTo(-0.08, 0.55, 0, 0.55);

        const bodiceGeo = new THREE.ExtrudeGeometry(bodiceShape, {
          depth: 0.30 * waistScale,
          bevelEnabled: true,
          bevelSize: 0.05,
          bevelThickness: 0.05,
        });
        bodiceGeo.center();

        const bodice = new THREE.Mesh(bodiceGeo, mainMaterial);
        group.add(bodice);

        const skirtGeo = createPleatedSkirtGeo(0.36 * waistScale, 0.85, 0.90, 14);
        const skirt = new THREE.Mesh(skirtGeo, mainMaterial);
        skirt.position.y = -0.35;
        group.add(skirt);

        // Ribbon Bow
        const bowGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
        const bow = new THREE.Mesh(bowGeo, accentMaterial);
        bow.position.set(0, 0.10, 0.22);
        group.add(bow);
        break;
      }

      case 'TOP': {
        // Crop Fashion Top with Scoop Neck & Cap Sleeves
        const topShape = new THREE.Shape();
        topShape.moveTo(0, 0.58);
        topShape.quadraticCurveTo(0.10, 0.58, 0.16, 0.72);
        topShape.lineTo(0.48 * bustScale, 0.62);
        topShape.lineTo(0.42 * waistScale, 0.0);
        topShape.lineTo(-0.42 * waistScale, 0.0);
        topShape.lineTo(-0.48 * bustScale, 0.62);
        topShape.lineTo(-0.16, 0.72);
        topShape.quadraticCurveTo(-0.10, 0.58, 0, 0.58);

        const topGeo = new THREE.ExtrudeGeometry(topShape, {
          depth: 0.32 * waistScale,
          bevelEnabled: true,
          bevelSegments: 4,
          steps: 1,
          bevelSize: 0.06,
          bevelThickness: 0.06,
        });
        topGeo.center();

        const topBody = new THREE.Mesh(topGeo, mainMaterial);
        group.add(topBody);

        // Cap Sleeves
        const capGeo = new THREE.CylinderGeometry(0.17 * bustScale, 0.14, 0.40, 14);
        const capL = new THREE.Mesh(capGeo, mainMaterial);
        capL.position.set(-0.50 * bustScale, 0.48, 0);
        capL.rotation.z = Math.PI / 3;
        group.add(capL);

        const capR = new THREE.Mesh(capGeo, mainMaterial);
        capR.position.set(0.50 * bustScale, 0.48, 0);
        capR.rotation.z = -Math.PI / 3;
        group.add(capR);
        break;
      }

      case 'FROCK':
      // @ts-ignore - ONE_PIECE alias
      case 'ONE_PIECE':
      default: {
        // Tailored Bodice + Flared Pleated Umbrella Skirt
        const bodiceShape = new THREE.Shape();
        bodiceShape.moveTo(0, 0.65);
        bodiceShape.quadraticCurveTo(0.10, 0.65, 0.16, 0.78);
        bodiceShape.lineTo(0.50 * bustScale, 0.65);
        bodiceShape.lineTo(0.42 * waistScale, 0.08);
        bodiceShape.lineTo(-0.42 * waistScale, 0.08);
        bodiceShape.lineTo(-0.50 * bustScale, 0.65);
        bodiceShape.lineTo(-0.16, 0.78);
        bodiceShape.quadraticCurveTo(-0.10, 0.65, 0, 0.65);

        const bodiceGeo = new THREE.ExtrudeGeometry(bodiceShape, {
          depth: 0.34 * waistScale,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 1,
          bevelSize: 0.07,
          bevelThickness: 0.07,
        });
        bodiceGeo.center();

        const bodice = new THREE.Mesh(bodiceGeo, mainMaterial);
        group.add(bodice);

        // Waist Sash Belt with Ribbon Bow
        const beltGeo = new THREE.CylinderGeometry(0.43 * waistScale, 0.43 * waistScale, 0.10, 24);
        const belt = new THREE.Mesh(beltGeo, accentMaterial);
        belt.position.y = 0.04;
        group.add(belt);

        const bowGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
        const bow = new THREE.Mesh(bowGeo, accentMaterial);
        bow.position.set(0, 0.04, 0.44 * waistScale);
        group.add(bow);

        // Pleated Umbrella Skirt
        const skirtGeo = createPleatedSkirtGeo(0.43 * waistScale, 1.25 * hipScale, 1.7 * lenScale, 18);
        const skirt = new THREE.Mesh(skirtGeo, mainMaterial);
        skirt.position.y = -0.85;
        group.add(skirt);
        break;
      }
    }

    return group;
  };

  // ── Build Neutral 3D Mannequin Form ────────────────────────
  const create3DMannequinForm = (): THREE.Group => {
    const mannequinGroup = new THREE.Group();
    const mannequinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#CBD5E1'),
      roughness: 0.5,
      metalness: 0.1,
    });

    // Head/Neck
    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const head = new THREE.Mesh(headGeo, mannequinMaterial);
    head.position.y = 1.35;
    mannequinGroup.add(head);

    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16);
    const neck = new THREE.Mesh(neckGeo, mannequinMaterial);
    neck.position.y = 1.15;
    mannequinGroup.add(neck);

    // Stand Base Pole & Disk
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.5, 12);
    const pole = new THREE.Mesh(poleGeo, mannequinMaterial);
    pole.position.y = -0.8;
    mannequinGroup.add(pole);

    const baseGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24);
    const base = new THREE.Mesh(baseGeo, mannequinMaterial);
    base.position.y = -2.5;
    mannequinGroup.add(base);

    return mannequinGroup;
  };

  // ── Init & Update Three.js Scene ──────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const currentHeight = height;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F8FAFC');
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 100);
    camera.position.set(0, 0.2, zoomLevel.current);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.4);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 3, -3);
    scene.add(backLight);

    // Ground Plane Shadow Receiver
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 5. Add Mannequin Backdrop
    if (showMannequin) {
      const mannequin = create3DMannequinForm();
      scene.add(mannequin);
    }

    // 6. Build and Add Garment Mesh Group
    const garmentGroup = createGarment3DMesh(dressType, fabricType, color, m, pantOptions);
    garmentGroupRef.current = garmentGroup;
    scene.add(garmentGroup);

    // 7. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (garmentGroupRef.current) {
        garmentGroupRef.current.rotation.y = rotation.current.y;
        garmentGroupRef.current.rotation.x = rotation.current.x;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = zoomLevel.current;
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      cameraRef.current.aspect = w / currentHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, currentHeight);
    };
    window.addEventListener('resize', handleResize);

    // FIX (Bug 2): Capture domElement NOW so cleanup can always remove it,
    // even if mountRef.current is null when the effect re-runs (e.g. on
    // rapid garment-type changes). Previously this caused the old canvas to
    // remain in the DOM, stacking a second canvas on top and freezing the preview.
    const domElement = renderer.domElement;
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.parentNode?.removeChild(domElement);
      renderer.dispose();
    };
  }, [dressType, fabricType, color, m, pantOptions, showMannequin, height]);

  // ── Mouse Drag & Touch Rotation Handlers ──────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    rotation.current.y += deltaX * 0.01;
    rotation.current.x = Math.max(-0.5, Math.min(0.5, rotation.current.x + deltaY * 0.01));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    zoomLevel.current = Math.max(2.5, Math.min(7.0, zoomLevel.current + e.deltaY * 0.003));
  };

  const setPresetAngle = (preset: 'front' | 'side' | 'back' | 'isometric') => {
    setViewPreset(preset);
    if (preset === 'front') {
      rotation.current = { x: 0.1, y: 0 };
    } else if (preset === 'side') {
      rotation.current = { x: 0.1, y: Math.PI / 2 };
    } else if (preset === 'back') {
      rotation.current = { x: 0.1, y: Math.PI };
    } else {
      rotation.current = { x: 0.2, y: Math.PI / 4 };
    }
  };

  return (
    <div className="three-d-garment-container">
      {showControls && (
        <div className="three-d-header-bar">
          <div className="three-d-title">
            <Sparkles size={15} className="sparkle-icon" />
            <span>Interactive 3D WebGL Model &bull; {dressType.replace('_', ' ')}</span>
          </div>

          <div className="three-d-view-presets">
            {(['front', 'side', 'back', 'isometric'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-btn-sm ${viewPreset === preset ? 'active' : ''}`}
                onClick={() => setPresetAngle(preset)}
              >
                {preset.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="three-d-quick-actions">
            <button
              type="button"
              className={`btn-icon-sm ${showMannequin ? 'active' : ''}`}
              onClick={() => setShowMannequin(!showMannequin)}
              title="Toggle Mannequin Form"
            >
              <Layers size={13} />
            </button>
            <button
              type="button"
              className="btn-icon-sm"
              onClick={() => {
                zoomLevel.current = Math.max(2.5, zoomLevel.current - 0.5);
              }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className="btn-icon-sm"
              onClick={() => {
                zoomLevel.current = Math.min(7.0, zoomLevel.current + 0.5);
              }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className="btn-icon-sm"
              onClick={() => setPresetAngle('front')}
              title="Reset 3D View"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas Surface */}
      <div
        ref={mountRef}
        className={`three-d-canvas-viewport ${isDragging ? 'dragging' : ''}`}
        style={{ height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Helper Drag Overlay */}
      <div className="three-d-drag-hint">
        <span>🖱️ Drag to rotate 360° &bull; Scroll to zoom</span>
      </div>

      {/* Color Swatch Bar if onColorChange provided */}
      {onColorChange && (
        <div className="three-d-swatch-bar">
          <span className="swatch-label">
            <Palette size={12} /> Fabric Color:
          </span>
          <div className="swatch-row">
            {COLOR_PALETTE.map((swatch) => {
              const isSelected = color.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  className={`swatch-chip ${isSelected ? 'selected' : ''}`}
                  style={{ backgroundColor: swatch.hex }}
                  onClick={() => onColorChange(swatch.hex)}
                  title={swatch.name}
                >
                  {isSelected && <ShieldCheck size={11} color={swatch.dark ? '#FFFFFF' : '#0F172A'} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDGarmentViewer;
