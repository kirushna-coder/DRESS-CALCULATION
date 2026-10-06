// ============================================================
// Fabriplay – A-Line / Flared Skirt Pattern Drafting Engine
// ============================================================

import type { Measurements, PatternData } from '../types';

const px = (inches: number, scale: number) => inches * scale;

export function calculateSkirtPattern(m: Measurements, scale: number): PatternData {
  const ease = m.ease ?? 1;
  const halfWaist = (m.waist + ease) / 4;
  const halfHip = (m.hip + ease) / 4;
  const skirtLength = m.fullLength || 24;
  const hipDepth = m.hipDepth || 8;
  const flareSweep = m.flare || 15;

  const gap = px(5, scale);
  const originX = 20;
  const originY = 20;

  // ── PIECE 1: FRONT SKIRT ──────────────────────────────────
  const fX0 = originX;
  const fY0 = originY;

  const fCF_x = fX0;
  const fWaist_x = fCF_x + px(halfWaist + 0.5, scale); // +0.5 for dart
  const fHip_x = fCF_x + px(halfHip, scale);
  const fHem_x = fCF_x + px(halfHip + flareSweep, scale);

  const yWaist = fY0;
  const yHip = fY0 + px(hipDepth, scale);
  const yHem = fY0 + px(skirtLength, scale);

  const waistDrop = px(0.5, scale);
  const hemDrop = px(1, scale);

  const frontPath = [
    `M ${fCF_x} ${yWaist + waistDrop}`,
    `Q ${fCF_x + px(halfWaist/2, scale)} ${yWaist} ${fWaist_x} ${yWaist}`,
    `Q ${fHip_x} ${yHip} ${fHem_x} ${yHem - hemDrop}`,
    `Q ${fCF_x + px(halfHip/2, scale)} ${yHem} ${fCF_x} ${yHem}`,
    'Z',
  ].join(' ');

  // ── PIECE 2: BACK SKIRT ───────────────────────────────────
  const bX0 = fX0 + px(halfHip + flareSweep + 2, scale) + gap;

  const bCB_x = bX0;
  const bWaist_x = bCB_x + px(halfWaist + 1, scale); // +1 for dart
  const bHip_x = bCB_x + px(halfHip, scale);
  const bHem_x = bCB_x + px(halfHip + flareSweep, scale);

  const backPath = [
    `M ${bCB_x} ${yWaist + waistDrop}`,
    `Q ${bCB_x + px(halfWaist/2, scale)} ${yWaist} ${bWaist_x} ${yWaist}`,
    `Q ${bHip_x} ${yHip} ${bHem_x} ${yHem - hemDrop}`,
    `Q ${bCB_x + px(halfHip/2, scale)} ${yHem} ${bCB_x} ${yHem}`,
    'Z',
  ].join(' ');

  return {
    outlinePath: [frontPath, backPath].join(' '),
    pieces: [
      {
        id: 'skirt_front',
        label: 'FRONT SKIRT',
        subLabel: '(Cut 1 on fold)',
        path: frontPath,
        fillTint: 'rgba(59, 130, 246, 0.08)',
        strokeColor: '#3B82F6',
      },
      {
        id: 'skirt_back',
        label: 'BACK SKIRT',
        subLabel: '(Cut 2 pair / center zip)',
        path: backPath,
        fillTint: 'rgba(16, 185, 129, 0.08)',
        strokeColor: '#059669',
      }
    ],
    points: [],
    constructionLines: [],
    annotations: [],
    bounds: { width: bX0 + px(halfHip + flareSweep, scale) + px(5, scale), height: yHem + px(5, scale) },
  };
}
