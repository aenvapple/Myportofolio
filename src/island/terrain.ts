import * as THREE from 'three';
import { ObstacleCollider, PointOfInterest } from '../types';

export const ISLAND_RADIUS = 34;
export const WATER_LEVEL = 0;

// Pier specifications
export const PIER_CONFIG = {
  minX: 0,
  maxX: 5,
  minZ: 20,
  maxZ: 33,
  deckHeight: 0.9,
};

/**
 * Procedural Island Height Function
 */
export function getTerrainHeight(x: number, z: number): number {
  // Check if player is on the wooden pier
  if (
    x >= PIER_CONFIG.minX - 0.4 &&
    x <= PIER_CONFIG.maxX + 0.4 &&
    z >= PIER_CONFIG.minZ - 0.4 &&
    z <= PIER_CONFIG.maxZ + 0.5
  ) {
    return PIER_CONFIG.deckHeight;
  }

  const distFromCenter = Math.hypot(x, z);

  // Stepping stones path to islet
  const isletDist = Math.hypot(x - 24, z + 18);
  if (isletDist < 8) {
    const isletFalloff = Math.max(0, 1 - isletDist / 8);
    return Math.pow(isletFalloff, 1.4) * 2.8 + 0.3;
  }

  // Stepping stones
  const stones = [
    { x: 18, z: 12, r: 1.6, h: 0.6 },
    { x: 21, z: 15, r: 1.5, h: 0.5 },
    { x: 20, z: -10, r: 1.8, h: 0.7 },
  ];
  for (const s of stones) {
    const d = Math.hypot(x - s.x, z - s.z);
    if (d < s.r) {
      return s.h * (1 - (d / s.r) * 0.4);
    }
  }

  if (distFromCenter > ISLAND_RADIUS + 4) {
    return -4.0; // Under water
  }

  // Island base profile (radial falloff)
  const normalizedDist = distFromCenter / ISLAND_RADIUS;
  if (normalizedDist > 1.0) {
    // Shoreline slope dropping into water
    const drop = (normalizedDist - 1.0) * 12;
    return Math.max(-5.0, 0.1 - drop);
  }

  // Organic coastline deformation
  const angle = Math.atan2(z, x);
  const coastMod =
    Math.sin(angle * 3.0) * 2.2 +
    Math.cos(angle * 5.0) * 1.5 +
    Math.sin(angle * 8.0) * 0.8;

  const effectiveRadius = ISLAND_RADIUS - Math.max(0, coastMod);
  const effectiveNormDist = Math.min(1.0, distFromCenter / effectiveRadius);

  // Hills and terrain features
  const hill1 = Math.exp(-Math.pow(Math.hypot(x + 12, z + 8) / 10, 2)) * 5.2; // North-West cliff/hill
  const hill2 = Math.exp(-Math.pow(Math.hypot(x - 14, z - 8) / 11, 2)) * 4.0; // South-East ridge
  const beaconRidge = Math.exp(-Math.pow(Math.hypot(x - 12, z + 16) / 8, 2)) * 4.5; // Beacon outlook

  // Subtle natural rolling landscape
  const rolling =
    Math.sin(x * 0.22) * Math.cos(z * 0.22) * 0.8 +
    Math.sin(x * 0.45 + 1.2) * 0.35 +
    Math.cos(z * 0.38 - 0.7) * 0.4;

  const baseElevation = Math.pow(1 - effectiveNormDist, 0.85) * 1.8;
  const totalHeight = baseElevation + hill1 + hill2 + beaconRidge + rolling;

  return Math.max(0.12, totalHeight);
}

/**
 * Creates the stylized low-poly island mesh with faceted vertex colors
 */
export function createIslandMesh(): THREE.Mesh {
  const size = 96;
  const segments = 68;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const posAttr = geometry.attributes.position;
  const count = posAttr.count;

  // Vertex colors
  const colors = new Float32Array(count * 3);

  // Stylized color palette
  const sandColor = new THREE.Color(0xf6e58d); // Golden warm beach sand
  const shoreGrassColor = new THREE.Color(0x9cd874); // Vibrant light green
  const lushGrassColor = new THREE.Color(0x6ab04c); // Deep stylized meadow green
  const hillGrassColor = new THREE.Color(0x4b9437); // Rich forest hill green
  const rockColor = new THREE.Color(0x7f8c8d); // Low poly grey rock
  const snowRockColor = new THREE.Color(0xb2bec3); // Mountain peak pale rock

  for (let i = 0; i < count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);

    let vy = getTerrainHeight(vx, vz);

    // Add slight geometric jitter for low-poly faceted charm
    if (vy > 0.2) {
      vy += (Math.random() - 0.5) * 0.15;
    }

    posAttr.setY(i, vy);

    // Color based on height and slope
    const tempColor = new THREE.Color();
    if (vy <= 0.35) {
      tempColor.copy(sandColor);
    } else if (vy <= 1.2) {
      const alpha = (vy - 0.35) / (1.2 - 0.35);
      tempColor.lerpColors(sandColor, shoreGrassColor, alpha);
    } else if (vy <= 3.2) {
      const alpha = (vy - 1.2) / (3.2 - 1.2);
      tempColor.lerpColors(lushGrassColor, hillGrassColor, alpha);
    } else if (vy <= 4.6) {
      const alpha = (vy - 3.2) / (4.6 - 3.2);
      tempColor.lerpColors(hillGrassColor, rockColor, alpha);
    } else {
      const alpha = Math.min(1.0, (vy - 4.6) / 1.5);
      tempColor.lerpColors(rockColor, snowRockColor, alpha);
    }

    // Small chromatic variance per vertex for low-poly texture depth
    const jitter = (Math.random() - 0.5) * 0.05;
    tempColor.r = Math.min(1, Math.max(0, tempColor.r + jitter));
    tempColor.g = Math.min(1, Math.max(0, tempColor.g + jitter));
    tempColor.b = Math.min(1, Math.max(0, tempColor.b + jitter));

    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.85,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

/**
 * Creates dynamic stylized water with animated wave surface
 */
export function createWaterMesh(): { mesh: THREE.Mesh; update: (time: number) => void } {
  const waterGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
  waterGeo.rotateX(-Math.PI / 2);

  const pos = waterGeo.attributes.position;
  const initialY = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    initialY[i] = 0;
  }

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x22a6b3,
    transparent: true,
    opacity: 0.84,
    roughness: 0.2,
    metalness: 0.15,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(waterGeo, waterMat);
  mesh.position.y = -0.05;
  mesh.receiveShadow = true;

  const update = (time: number) => {
    const posAttr = waterGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const wave =
        Math.sin(vx * 0.15 + time * 1.8) * 0.12 +
        Math.cos(vz * 0.18 + time * 1.4) * 0.1 +
        Math.sin((vx + vz) * 0.1 + time * 2.2) * 0.08;
      posAttr.setY(i, wave - 0.05);
    }
    posAttr.needsUpdate = true;
    waterGeo.computeVertexNormals();
  };

  return { mesh, update };
}

/**
 * Points of Interest scattered across the EVAN.OS Archipelago
 */
export const ISLAND_POIS: PointOfInterest[] = [
  {
    id: 'beacon',
    title: 'EVAN.OS Signal Beacon',
    code: 'BCN-ALPHA',
    tag: 'TRANSMITTER',
    description: 'High-gain low-poly transmission lighthouse providing quantum telemetry across Sector 07.',
    coords: [-12, 4.5, 16],
    color: '#38bdf8',
    icon: 'Radio',
    status: 'ONLINE',
    logs: [
      'Sub-space frequency broadcast locked at 1420.405 MHz.',
      'Rotary optical emitter spinning at 24 RPM.',
      'Signal coverage: 100% archipelago perimeter.',
    ],
  },
  {
    id: 'monolith',
    title: 'Data Monolith 01',
    code: 'CORE-MNL',
    tag: 'ANCIENT ARCHIVE',
    description: 'A crystalline obsidian obelisk embedded with encrypted EVAN.OS kernel logs and system memory crystals.',
    coords: [12, 3.8, -10],
    color: '#a855f7',
    icon: 'Cpu',
    status: 'ACTIVE',
    logs: [
      'Encrypted neural cache initialized.',
      'Resonance frequency aligned with island bedrock.',
      'Data integrity verified at 99.98%.',
    ],
  },
  {
    id: 'solar',
    title: 'Solar Resonance Array',
    code: 'SOL-PWR',
    tag: 'ENERGY GENERATOR',
    description: 'Photovoltaic low-poly hexagonal collector farm converting solar and celestial radiation into bio-grid energy.',
    coords: [-15, 2.2, -6],
    color: '#facc15',
    icon: 'Sun',
    status: 'CALIBRATED',
    logs: [
      'Output: 42.8 kW Clean Quantum Yield.',
      'Battery banks charged to 98.4%.',
      'Dual tracking axis optimal angle 42° N.',
    ],
  },
  {
    id: 'campfire',
    title: 'Explorer Outpost // Campfire',
    code: 'OUT-CAMP',
    tag: 'REST HABITAT',
    description: 'A cozy field sanctuary equipped with low-poly timber logs, warm embers, and field sensory diagnostic kit.',
    coords: [0, 1.4, 4],
    color: '#fb923c',
    icon: 'Flame',
    status: 'ACTIVE',
    logs: [
      'Atmospheric reading: Clean oceanic breeze.',
      'Campfire temperature: 680°C optimal comfort.',
      'Field diagnostics report: Zero system anomalies.',
    ],
  },
  {
    id: 'pier',
    title: 'Archipelago Dock & Marina',
    code: 'MAR-DOCK',
    tag: 'TRANSIT PORT',
    description: 'A rustic timber pier extending out into the azure sea with mooring poles and ocean current sensors.',
    coords: [2.5, 0.9, 28],
    color: '#34d399',
    icon: 'Anchor',
    status: 'STANDBY',
    logs: [
      'Tide state: High tide at 0.05m standard datum.',
      'Water temperature: 21.4°C crystal clear.',
      'Navigation channel clear of reef obstructions.',
    ],
  },
];

/**
 * Handles basic circle-circle obstacle collision with smooth sliding
 */
export function resolveCollisions(
  x: number,
  z: number,
  radius: number,
  obstacles: ObstacleCollider[]
): { x: number; z: number; collided: boolean } {
  let resolvedX = x;
  let resolvedZ = z;
  let collided = false;

  for (const obs of obstacles) {
    const dx = resolvedX - obs.x;
    const dz = resolvedZ - obs.z;
    const dist = Math.hypot(dx, dz);
    const minDist = radius + obs.radius;

    if (dist < minDist && dist > 0.0001) {
      collided = true;
      const pushFactor = (minDist - dist) / dist;
      resolvedX += dx * pushFactor;
      resolvedZ += dz * pushFactor;
    }
  }

  // Pier boundary handling if player is on or near pier
  const onPierZ = resolvedZ >= PIER_CONFIG.minZ && resolvedZ <= PIER_CONFIG.maxZ + 0.5;
  if (onPierZ) {
    if (resolvedX < PIER_CONFIG.minX) resolvedX = PIER_CONFIG.minX;
    if (resolvedX > PIER_CONFIG.maxX) resolvedX = PIER_CONFIG.maxX;
    if (resolvedZ > PIER_CONFIG.maxZ) resolvedZ = PIER_CONFIG.maxZ;
    return { x: resolvedX, z: resolvedZ, collided };
  }

  // Island perimeter boundary constraint
  const distFromCenter = Math.hypot(resolvedX, resolvedZ);
  const maxAllowedDist = ISLAND_RADIUS - 0.5;

  if (distFromCenter > maxAllowedDist) {
    collided = true;
    const angle = Math.atan2(resolvedZ, resolvedX);
    resolvedX = Math.cos(angle) * maxAllowedDist;
    resolvedZ = Math.sin(angle) * maxAllowedDist;
  }

  return { x: resolvedX, z: resolvedZ, collided };
}
