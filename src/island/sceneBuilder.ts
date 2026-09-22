import * as THREE from 'three';
import { ObstacleCollider, TimeOfDay } from '../types';
import { getTerrainHeight, PIER_CONFIG } from './terrain';

export interface IslandSceneElements {
  group: THREE.Group;
  obstacles: ObstacleCollider[];
  update: (time: number, delta: number) => void;
  setLightingTime: (timeOfDay: TimeOfDay) => void;
  sunLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  hemiLight: THREE.HemisphereLight;
  skyMesh: THREE.Mesh;
  starParticles: THREE.Points;
}

export function buildIslandDecorations(): IslandSceneElements {
  const group = new THREE.Group();
  const obstacles: ObstacleCollider[] = [];

  // Materials reuse for optimal rendering
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x795548,
    flatShading: true,
    roughness: 0.9,
  });

  const pineFoliageMat1 = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    flatShading: true,
    roughness: 0.8,
  });

  const pineFoliageMat2 = new THREE.MeshStandardMaterial({
    color: 0x388e3c,
    flatShading: true,
    roughness: 0.8,
  });

  const roundFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x4caf50,
    flatShading: true,
    roughness: 0.75,
  });

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x78909c,
    flatShading: true,
    roughness: 0.9,
  });

  const darkRockMat = new THREE.MeshStandardMaterial({
    color: 0x455a64,
    flatShading: true,
    roughness: 0.95,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    flatShading: true,
    roughness: 0.85,
  });

  // Keep references for animation
  const animatedObjects: {
    update: (time: number, delta: number) => void;
  }[] = [];

  // ==========================================
  // 1. LOW POLY TREES
  // ==========================================
  function createPineTree(x: number, z: number, scale = 1.0) {
    const y = getTerrainHeight(x, z);
    if (y < 0.25) return; // Avoid underwater placement

    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.22 * scale, 0.35 * scale, 1.6 * scale, 5);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.8 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 3 Foliage cones
    const tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const bottomR = (1.5 - i * 0.35) * scale;
      const height = (1.4 - i * 0.2) * scale;
      const coneGeo = new THREE.ConeGeometry(bottomR, height, 6);
      const mat = i % 2 === 0 ? pineFoliageMat1 : pineFoliageMat2;
      const cone = new THREE.Mesh(coneGeo, mat);
      cone.position.y = (1.4 + i * 0.9) * scale;
      cone.rotation.y = (i * Math.PI) / 3;
      cone.castShadow = true;
      cone.receiveShadow = true;
      treeGroup.add(cone);
    }

    group.add(treeGroup);
    obstacles.push({ x, z, radius: 0.7 * scale, name: 'Pine Tree' });
  }

  function createRoundTree(x: number, z: number, scale = 1.0) {
    const y = getTerrainHeight(x, z);
    if (y < 0.25) return;

    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, 2.0 * scale, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.0 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Low poly spherical foliage
    const foliageGeo = new THREE.DodecahedronGeometry(1.6 * scale, 1);
    const foliage = new THREE.Mesh(foliageGeo, roundFoliageMat);
    foliage.position.y = 2.6 * scale;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    treeGroup.add(foliage);

    group.add(treeGroup);
    obstacles.push({ x, z, radius: 0.75 * scale, name: 'Deciduous Tree' });
  }

  // Scatter trees naturally on island green zones
  const treeCoords = [
    { x: -5, z: -8, type: 'pine', s: 1.1 },
    { x: -8, z: -12, type: 'pine', s: 1.3 },
    { x: -12, z: -15, type: 'pine', s: 0.9 },
    { x: -3, z: -14, type: 'round', s: 1.2 },
    { x: 6, z: -8, type: 'round', s: 1.0 },
    { x: 8, z: -15, type: 'pine', s: 1.4 },
    { x: -7, z: 2, type: 'round', s: 1.1 },
    { x: -14, z: 4, type: 'pine', s: 1.2 },
    { x: 8, z: 5, type: 'round', s: 0.95 },
    { x: 14, z: 2, type: 'pine', s: 1.1 },
    { x: -6, z: 12, type: 'round', s: 1.05 },
    { x: 10, z: 14, type: 'pine', s: 1.25 },
    { x: -18, z: 10, type: 'pine', s: 1.1 },
    { x: 16, z: -5, type: 'round', s: 1.0 },
    { x: 4, z: -18, type: 'pine', s: 1.2 },
    { x: -16, z: -18, type: 'pine', s: 1.3 },
    { x: 18, z: 8, type: 'round', s: 1.1 },
    { x: -2, z: -20, type: 'round', s: 1.2 },
  ];

  treeCoords.forEach((t) => {
    if (t.type === 'pine') createPineTree(t.x, t.z, t.s);
    else createRoundTree(t.x, t.z, t.s);
  });

  // ==========================================
  // 2. LOW POLY BOULDERS & CRYSTALS
  // ==========================================
  function createRock(x: number, z: number, scale = 1.0, isDark = false) {
    const y = getTerrainHeight(x, z);
    const rockGeo = new THREE.DodecahedronGeometry(1.0 * scale, 0);
    const mesh = new THREE.Mesh(rockGeo, isDark ? darkRockMat : rockMat);
    mesh.position.set(x, y + 0.3 * scale, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    obstacles.push({ x, z, radius: 0.9 * scale, name: 'Rock' });
  }

  const rockCoords = [
    { x: -10, z: -4, s: 1.2, d: true },
    { x: -18, z: 16, s: 1.5, d: false },
    { x: -8, z: 18, s: 1.1, d: true },
    { x: 15, z: -14, s: 1.4, d: false },
    { x: 20, z: -2, s: 1.3, d: true },
    { x: 14, z: 18, s: 1.0, d: false },
    { x: -4, z: 16, s: 0.8, d: false },
    { x: 18, z: 12, s: 1.4, d: true },
    { x: 21, z: 15, s: 1.3, d: false },
    { x: 24, z: 18, s: 1.5, d: false },
  ];

  rockCoords.forEach((r) => createRock(r.x, r.z, r.s, r.d));

  // ==========================================
  // 3. THE LIGHTHOUSE / BEACON (POIS: BCN-ALPHA)
  // ==========================================
  const beaconGroup = new THREE.Group();
  const bX = -12;
  const bZ = 16;
  const bY = getTerrainHeight(bX, bZ);
  beaconGroup.position.set(bX, bY, bZ);

  // Lighthouse base stone pedestal
  const baseGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.2, 8);
  const baseMesh = new THREE.Mesh(baseGeo, darkRockMat);
  baseMesh.position.y = 0.6;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  beaconGroup.add(baseMesh);

  // Main white & red banded tower
  const towerHeight = 7.5;
  const towerGeo = new THREE.CylinderGeometry(1.2, 2.0, towerHeight, 8);
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    flatShading: true,
    roughness: 0.6,
  });
  const towerMesh = new THREE.Mesh(towerGeo, towerMat);
  towerMesh.position.y = 0.6 + towerHeight / 2;
  towerMesh.castShadow = true;
  towerMesh.receiveShadow = true;
  beaconGroup.add(towerMesh);

  // Red ring stripe
  const stripeGeo = new THREE.CylinderGeometry(1.5, 1.68, 1.4, 8);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    flatShading: true,
    roughness: 0.7,
  });
  const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
  stripeMesh.position.y = 4.2;
  beaconGroup.add(stripeMesh);

  // Balcony catwalk
  const balconyGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 8);
  const balconyMat = new THREE.MeshStandardMaterial({ color: 0x334155, flatShading: true });
  const balconyMesh = new THREE.Mesh(balconyGeo, balconyMat);
  balconyMesh.position.y = 0.6 + towerHeight;
  beaconGroup.add(balconyMesh);

  // Glass lantern room
  const lanternGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.4, 8);
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  });
  const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
  lanternMesh.position.y = 0.6 + towerHeight + 0.8;
  beaconGroup.add(lanternMesh);

  // Conical roof
  const roofGeo = new THREE.ConeGeometry(1.5, 1.4, 8);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, flatShading: true });
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.y = 0.6 + towerHeight + 2.0;
  beaconGroup.add(roofMesh);

  // Rotating optical beacon beam
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 0.6 + towerHeight + 0.8;
  beaconGroup.add(beamPivot);

  // Light beam cone
  const beamGeo = new THREE.ConeGeometry(4.5, 26, 8, 1, true);
  beamGeo.rotateX(-Math.PI / 2);
  beamGeo.translate(0, 0, 13);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamPivot.add(beamMesh);

  // Spotlight in the lantern
  const beaconLight = new THREE.SpotLight(0x38bdf8, 8, 45, Math.PI / 6, 0.4, 1.2);
  beaconLight.position.set(0, 0, 0);
  beaconLight.target.position.set(0, 0, 20);
  beamPivot.add(beaconLight);
  beamPivot.add(beaconLight.target);

  animatedObjects.push({
    update: (_, delta) => {
      beamPivot.rotation.y += delta * 1.2;
    },
  });

  group.add(beaconGroup);
  obstacles.push({ x: bX, z: bZ, radius: 2.5, name: 'Lighthouse Beacon' });

  // ==========================================
  // 4. THE DATA MONOLITH (POIS: CORE-MNL)
  // ==========================================
  const mX = 12;
  const mZ = -10;
  const mY = getTerrainHeight(mX, mZ);
  const monolithGroup = new THREE.Group();
  monolithGroup.position.set(mX, mY, mZ);

  // Obsidian central prism
  const monoGeo = new THREE.CylinderGeometry(0.8, 1.2, 5.2, 6);
  const monoMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.8,
    flatShading: true,
  });
  const monoMesh = new THREE.Mesh(monoGeo, monoMat);
  monoMesh.position.y = 2.6;
  monoMesh.castShadow = true;
  monolithGroup.add(monoMesh);

  // Glowing neon circuit bands
  const bandGeo = new THREE.CylinderGeometry(0.84, 1.04, 0.25, 6);
  const bandMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  const bandMesh1 = new THREE.Mesh(bandGeo, bandMat);
  bandMesh1.position.y = 2.0;
  monolithGroup.add(bandMesh1);

  const bandMesh2 = new THREE.Mesh(bandGeo, bandMat);
  bandMesh2.position.y = 3.8;
  monolithGroup.add(bandMesh2);

  // Floating orbiting data shards
  const shards: THREE.Mesh[] = [];
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.7,
    roughness: 0.3,
    flatShading: true,
  });

  for (let i = 0; i < 4; i++) {
    const sGeo = new THREE.OctahedronGeometry(0.28, 0);
    const sMesh = new THREE.Mesh(sGeo, shardMat);
    monolithGroup.add(sMesh);
    shards.push(sMesh);
  }

  const monoLight = new THREE.PointLight(0xc084fc, 2.5, 12);
  monoLight.position.y = 3.0;
  monolithGroup.add(monoLight);

  animatedObjects.push({
    update: (time) => {
      shards.forEach((s, idx) => {
        const angle = time * 1.5 + (idx * Math.PI) / 2;
        const radius = 1.8;
        s.position.x = Math.cos(angle) * radius;
        s.position.z = Math.sin(angle) * radius;
        s.position.y = 2.8 + Math.sin(time * 3 + idx) * 0.4;
        s.rotation.x = time * 2;
        s.rotation.y = time * 2;
      });
      monoLight.intensity = 2.0 + Math.sin(time * 4) * 0.8;
    },
  });

  group.add(monolithGroup);
  obstacles.push({ x: mX, z: mZ, radius: 1.8, name: 'Data Monolith' });

  // ==========================================
  // 5. SOLAR RESONANCE ARRAY (POIS: SOL-PWR)
  // ==========================================
  const sX = -15;
  const sZ = -6;
  const sY = getTerrainHeight(sX, sZ);
  const solarGroup = new THREE.Group();
  solarGroup.position.set(sX, sY, sZ);

  // Pylon
  const pylonGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.6, 6);
  const pylonMesh = new THREE.Mesh(pylonGeo, darkRockMat);
  pylonMesh.position.y = 0.8;
  solarGroup.add(pylonMesh);

  // Two angled hexagonal solar panels
  const panelGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 6);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    emissive: 0x2563eb,
    emissiveIntensity: 0.25,
    roughness: 0.1,
    metalness: 0.9,
    flatShading: true,
  });

  const panel1 = new THREE.Mesh(panelGeo, panelMat);
  panel1.position.set(0, 1.7, 0);
  panel1.rotation.x = -0.45;
  panel1.rotation.y = 0.2;
  panel1.castShadow = true;
  solarGroup.add(panel1);

  group.add(solarGroup);
  obstacles.push({ x: sX, z: sZ, radius: 1.5, name: 'Solar Array' });

  // ==========================================
  // 6. CAMPFIRE OUTPOST (POIS: OUT-CAMP)
  // ==========================================
  const cX = 0;
  const cZ = 4;
  const cY = getTerrainHeight(cX, cZ);
  const campGroup = new THREE.Group();
  campGroup.position.set(cX, cY, cZ);

  // Stone ring
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const sGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const sMesh = new THREE.Mesh(sGeo, darkRockMat);
    sMesh.position.set(Math.cos(angle) * 0.7, 0.08, Math.sin(angle) * 0.7);
    campGroup.add(sMesh);
  }

  // Logs around campfire
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const lGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.1, 5);
    const lMesh = new THREE.Mesh(lGeo, trunkMat);
    lMesh.rotation.z = Math.PI / 2;
    lMesh.rotation.y = angle;
    lMesh.position.set(Math.cos(angle) * 0.2, 0.15, Math.sin(angle) * 0.2);
    campGroup.add(lMesh);
  }

  // Seating log
  const benchGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.4, 6);
  const benchMesh = new THREE.Mesh(benchGeo, woodMat);
  benchMesh.rotation.z = Math.PI / 2;
  benchMesh.position.set(0, 0.2, -1.6);
  benchMesh.castShadow = true;
  campGroup.add(benchMesh);
  obstacles.push({ x: cX, z: cZ - 1.6, radius: 0.8, name: 'Bench Log' });

  // Fire flame low-poly pyramid
  const flameGeo = new THREE.ConeGeometry(0.35, 0.8, 5);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.y = 0.45;
  campGroup.add(flameMesh);

  const innerFlameGeo = new THREE.ConeGeometry(0.18, 0.5, 5);
  const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  innerFlame.position.y = 0.35;
  campGroup.add(innerFlame);

  const fireLight = new THREE.PointLight(0xf97316, 2.5, 9);
  fireLight.position.set(0, 0.6, 0);
  campGroup.add(fireLight);

  animatedObjects.push({
    update: (time) => {
      const flicker = Math.sin(time * 18) * 0.15 + Math.cos(time * 26) * 0.1;
      flameMesh.scale.set(1 + flicker, 1 + flicker * 1.5, 1 + flicker);
      innerFlame.scale.set(1 - flicker, 1 + flicker, 1 - flicker);
      flameMesh.rotation.y = time * 3;
      fireLight.intensity = 2.4 + flicker * 1.2;
    },
  });

  group.add(campGroup);
  obstacles.push({ x: cX, z: cZ, radius: 0.75, name: 'Campfire' });

  // ==========================================
  // 7. WOODEN PIER / DOCK (POIS: MAR-DOCK)
  // ==========================================
  const pierGroup = new THREE.Group();
  const plankMat = new THREE.MeshStandardMaterial({
    color: 0x92613b,
    flatShading: true,
    roughness: 0.8,
  });

  const plankW = PIER_CONFIG.maxX - PIER_CONFIG.minX;
  const centerX = (PIER_CONFIG.minX + PIER_CONFIG.maxX) / 2;

  // Deck planks
  for (let z = PIER_CONFIG.minZ; z <= PIER_CONFIG.maxZ; z += 0.8) {
    const plankGeo = new THREE.BoxGeometry(plankW, 0.14, 0.65);
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(centerX, PIER_CONFIG.deckHeight, z);
    plank.castShadow = true;
    plank.receiveShadow = true;
    pierGroup.add(plank);

    // Support piles into water every 3 units
    if (Math.round(z) % 3 === 0) {
      const pileGeo = new THREE.CylinderGeometry(0.14, 0.16, 3.2, 6);
      const pileLeft = new THREE.Mesh(pileGeo, trunkMat);
      pileLeft.position.set(PIER_CONFIG.minX + 0.2, 0.2, z);
      pierGroup.add(pileLeft);

      const pileRight = new THREE.Mesh(pileGeo, trunkMat);
      pileRight.position.set(PIER_CONFIG.maxX - 0.2, 0.2, z);
      pierGroup.add(pileRight);
    }
  }

  // Mooring posts at pier end
  const bollardGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.7, 6);
  const bollard1 = new THREE.Mesh(bollardGeo, darkRockMat);
  bollard1.position.set(PIER_CONFIG.minX + 0.4, PIER_CONFIG.deckHeight + 0.35, PIER_CONFIG.maxZ - 0.3);
  pierGroup.add(bollard1);

  const bollard2 = new THREE.Mesh(bollardGeo, darkRockMat);
  bollard2.position.set(PIER_CONFIG.maxX - 0.4, PIER_CONFIG.deckHeight + 0.35, PIER_CONFIG.maxZ - 0.3);
  pierGroup.add(bollard2);

  // Lantern post on pier
  const pierLanternGroup = new THREE.Group();
  pierLanternGroup.position.set(PIER_CONFIG.minX + 0.3, PIER_CONFIG.deckHeight, 24);
  const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.0, 5);
  const postMesh = new THREE.Mesh(postGeo, woodMat);
  postMesh.position.y = 1.0;
  pierLanternGroup.add(postMesh);

  const lampGeo = new THREE.DodecahedronGeometry(0.2, 0);
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const lampMesh = new THREE.Mesh(lampGeo, lampMat);
  lampMesh.position.set(0, 2.0, 0);
  pierLanternGroup.add(lampMesh);

  const lampLight = new THREE.PointLight(0xfef08a, 1.8, 8);
  lampLight.position.set(0, 2.0, 0);
  pierLanternGroup.add(lampLight);
  pierGroup.add(pierLanternGroup);

  group.add(pierGroup);

  // ==========================================
  // 8. DRIFTING LOW-POLY CLOUDS
  // ==========================================
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    flatShading: true,
  });

  interface CloudInstance {
    mesh: THREE.Group;
    speed: number;
    initialX: number;
  }
  const clouds: CloudInstance[] = [];

  function createCloud(startX: number, y: number, z: number, scale = 1.0) {
    const c = new THREE.Group();
    c.position.set(startX, y, z);

    // Puff geometries
    const puffs = [
      { x: 0, y: 0, z: 0, r: 1.8 },
      { x: -1.4, y: -0.3, z: 0.2, r: 1.4 },
      { x: 1.5, y: -0.2, z: -0.3, r: 1.5 },
      { x: 0.8, y: 0.6, z: 0.1, r: 1.2 },
      { x: -0.7, y: 0.5, z: -0.2, r: 1.3 },
    ];

    puffs.forEach((p) => {
      const pGeo = new THREE.DodecahedronGeometry(p.r * scale, 1);
      const pMesh = new THREE.Mesh(pGeo, cloudMat);
      pMesh.position.set(p.x * scale, p.y * scale, p.z * scale);
      c.add(pMesh);
    });

    cloudGroup.add(c);
    clouds.push({ mesh: c, speed: 0.6 + Math.random() * 0.4, initialX: startX });
  }

  createCloud(-30, 18, -25, 1.5);
  createCloud(15, 22, -35, 1.8);
  createCloud(35, 19, 10, 1.3);
  createCloud(-20, 24, 30, 1.6);
  createCloud(5, 20, 40, 1.4);

  animatedObjects.push({
    update: (_, delta) => {
      clouds.forEach((c) => {
        c.mesh.position.x += delta * c.speed;
        if (c.mesh.position.x > 75) {
          c.mesh.position.x = -75;
        }
      });
    },
  });
  group.add(cloudGroup);

  // ==========================================
  // 9. CELESTIAL ENVIRONMENT & LIGHTING
  // ==========================================
  // Sky dome / background
  const skyGeo = new THREE.SphereGeometry(140, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    side: THREE.BackSide,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyMesh);

  // Star particles
  const starCount = 600;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.9 + 0.1); // upper hemisphere
    const r = 135;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    transparent: true,
    opacity: 0.0, // hidden in daytime
  });
  const starParticles = new THREE.Points(starGeo, starMat);
  group.add(starParticles);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  group.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x38bdf8, 0.4);
  hemiLight.position.set(0, 50, 0);
  group.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
  sunLight.position.set(28, 42, 22);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 130;
  sunLight.shadow.camera.left = -35;
  sunLight.shadow.camera.right = 35;
  sunLight.shadow.camera.top = 35;
  sunLight.shadow.camera.bottom = -35;
  sunLight.shadow.bias = -0.0004;
  group.add(sunLight);

  // Time of Day setter
  const setLightingTime = (timeOfDay: TimeOfDay) => {
    switch (timeOfDay) {
      case 'day':
        skyMat.color.setHex(0x7dd3fc); // Crisp sky blue
        sunLight.color.setHex(0xfffbeb);
        sunLight.intensity = 1.9;
        sunLight.position.set(28, 42, 22);
        ambientLight.color.setHex(0xffffff);
        ambientLight.intensity = 0.7;
        hemiLight.color.setHex(0xffffff);
        hemiLight.groundColor.setHex(0x38bdf8);
        hemiLight.intensity = 0.4;
        starMat.opacity = 0.0;
        break;

      case 'sunset':
        skyMat.color.setHex(0xf97316); // Glowing amber sunset
        sunLight.color.setHex(0xfdba74);
        sunLight.intensity = 2.0;
        sunLight.position.set(45, 12, 18);
        ambientLight.color.setHex(0xfed7aa);
        ambientLight.intensity = 0.55;
        hemiLight.color.setHex(0xfb923c);
        hemiLight.groundColor.setHex(0x7c3aed);
        hemiLight.intensity = 0.45;
        starMat.opacity = 0.2;
        break;

      case 'twilight':
        skyMat.color.setHex(0x1e1b4b); // Deep indigo twilight
        sunLight.color.setHex(0x818cf8);
        sunLight.intensity = 0.8;
        sunLight.position.set(30, 18, 30);
        ambientLight.color.setHex(0x312e81);
        ambientLight.intensity = 0.6;
        hemiLight.color.setHex(0x6366f1);
        hemiLight.groundColor.setHex(0x0f172a);
        hemiLight.intensity = 0.35;
        starMat.opacity = 0.65;
        break;

      case 'night':
        skyMat.color.setHex(0x020617); // Obsidian black cosmos
        sunLight.color.setHex(0x93c5fd); // Silver moonlight
        sunLight.intensity = 0.45;
        sunLight.position.set(-20, 35, -20);
        ambientLight.color.setHex(0x1e293b);
        ambientLight.intensity = 0.4;
        hemiLight.color.setHex(0x38bdf8);
        hemiLight.groundColor.setHex(0x020617);
        hemiLight.intensity = 0.2;
        starMat.opacity = 0.95;
        break;
    }
  };

  const update = (time: number, delta: number) => {
    animatedObjects.forEach((obj) => obj.update(time, delta));
  };

  return {
    group,
    obstacles,
    update,
    setLightingTime,
    sunLight,
    ambientLight,
    hemiLight,
    skyMesh,
    starParticles,
  };
}
