import * as THREE from 'three';
import { ObstacleCollider } from '../types';
import { WORLD_ZONES } from '../data/worldZones';
import { getTerrainHeight } from '../island/terrain';

export interface ZoneLandmarksResult {
  group: THREE.Group;
  obstacles: ObstacleCollider[];
  update: (time: number, delta: number) => void;
}

export function createZoneLandmarks(): ZoneLandmarksResult {
  const group = new THREE.Group();
  const obstacles: ObstacleCollider[] = [];
  const animatedUpdaters: ((time: number, delta: number) => void)[] = [];

  // Common materials
  const darkFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    flatShading: true,
    roughness: 0.5,
    metalness: 0.3,
  });

  const whiteStructureMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    flatShading: true,
    roughness: 0.6,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    metalness: 0.2,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    flatShading: true,
    roughness: 0.85,
  });

  // Helper to create an entrance interaction halo ring on ground
  function createZoneEntryTrigger(zoneId: string, x: number, y: number, z: number, color: string) {
    const triggerRingGeo = new THREE.RingGeometry(1.6, 1.85, 24);
    triggerRingGeo.rotateX(-Math.PI / 2);
    const triggerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const triggerRing = new THREE.Mesh(triggerRingGeo, triggerMat);
    triggerRing.position.set(x, y + 0.05, z);
    group.add(triggerRing);

    // Subtle breathing pulse
    animatedUpdaters.push((time) => {
      const s = 1.0 + Math.sin(time * 2.5) * 0.08;
      triggerRing.scale.set(s, s, s);
    });
  }

  // ========================================================
  // 1. PROJECT ARCADE (Small Futuristic Arcade Building)
  // ========================================================
  const arcadeZone = WORLD_ZONES.find((z) => z.id === 'project-arcade')!;
  const [ax, , az] = arcadeZone.coords;
  const ay = getTerrainHeight(ax, az);
  const arcadeGroup = new THREE.Group();
  arcadeGroup.position.set(ax, ay, az);

  // Main arcade building shell
  const arcadeShellGeo = new THREE.BoxGeometry(4.2, 3.4, 4.2);
  const arcadeShell = new THREE.Mesh(arcadeShellGeo, darkFrameMat);
  arcadeShell.position.y = 1.7;
  arcadeShell.castShadow = true;
  arcadeShell.receiveShadow = true;
  arcadeGroup.add(arcadeShell);

  // Slanted futuristic marquee roof
  const marqueeGeo = new THREE.BoxGeometry(4.6, 0.6, 1.8);
  const marqueeMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.45,
    flatShading: true,
  });
  const marquee = new THREE.Mesh(marqueeGeo, marqueeMat);
  marquee.position.set(0, 3.5, 1.4);
  marquee.rotation.x = 0.25;
  marquee.castShadow = true;
  arcadeGroup.add(marquee);

  // Neon Arcade Signboard
  const arcadeSignGeo = new THREE.BoxGeometry(3.2, 0.8, 0.2);
  const arcadeSignMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const arcadeSign = new THREE.Mesh(arcadeSignGeo, arcadeSignMat);
  arcadeSign.position.set(0, 3.65, 2.2);
  arcadeGroup.add(arcadeSign);

  // Pixel game screen glow inside entrance
  const screenGeo = new THREE.PlaneGeometry(2.4, 2.0);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 1.5, 2.12);
  arcadeGroup.add(screenMesh);

  // Arcade Cabinet silhouette inside
  const cabGeo = new THREE.BoxGeometry(0.8, 1.6, 0.8);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.3 });
  const cab1 = new THREE.Mesh(cabGeo, cabMat);
  cab1.position.set(-1.1, 0.8, 1.6);
  arcadeGroup.add(cab1);

  // Floating arcade coin token
  const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16);
  coinGeo.rotateZ(Math.PI / 2);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  });
  const coin = new THREE.Mesh(coinGeo, coinMat);
  coin.position.set(0, 4.8, 0);
  arcadeGroup.add(coin);

  animatedUpdaters.push((time, delta) => {
    coin.rotation.y += delta * 1.8;
    coin.position.y = 4.8 + Math.sin(time * 3) * 0.15;
  });

  group.add(arcadeGroup);
  obstacles.push({ x: ax, z: az, radius: 2.8, name: 'Project Arcade' });
  createZoneEntryTrigger(arcadeZone.id, ax, ay, az + 3.0, arcadeZone.color);

  // ========================================================
  // 2. SKILL LAB (Modern Glass & Steel Laboratory)
  // ========================================================
  const labZone = WORLD_ZONES.find((z) => z.id === 'skill-lab')!;
  const [lx, , lz] = labZone.coords;
  const ly = getTerrainHeight(lx, lz);
  const labGroup = new THREE.Group();
  labGroup.position.set(lx, ly, lz);

  // Geometric laboratory foundation
  const labBaseGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.5, 6);
  const labBase = new THREE.Mesh(labBaseGeo, whiteStructureMat);
  labBase.position.y = 0.25;
  labBase.castShadow = true;
  labGroup.add(labBase);

  // Glass chamber prism
  const glassGeo = new THREE.CylinderGeometry(2.4, 2.4, 3.6, 6);
  const glassCylinder = new THREE.Mesh(glassGeo, glassMat);
  glassCylinder.position.y = 2.1;
  labGroup.add(glassCylinder);

  // Angular tech columns
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const colGeo = new THREE.BoxGeometry(0.25, 3.8, 0.35);
    const col = new THREE.Mesh(colGeo, darkFrameMat);
    col.position.set(Math.cos(angle) * 2.4, 2.1, Math.sin(angle) * 2.4);
    col.castShadow = true;
    labGroup.add(col);
  }

  // Futuristic lab roof cap
  const labRoofGeo = new THREE.ConeGeometry(2.8, 1.2, 6);
  const labRoof = new THREE.Mesh(labRoofGeo, whiteStructureMat);
  labRoof.position.y = 4.5;
  labRoof.castShadow = true;
  labGroup.add(labRoof);

  // Floating Quantum Atom / Matrix in center of glass
  const atomCoreGeo = new THREE.IcosahedronGeometry(0.45, 1);
  const atomMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });
  const atomCore = new THREE.Mesh(atomCoreGeo, atomMat);
  atomCore.position.y = 2.2;
  labGroup.add(atomCore);

  const atomRingGeo = new THREE.TorusGeometry(0.85, 0.03, 6, 24);
  const ringA = new THREE.Mesh(atomRingGeo, atomMat);
  ringA.position.y = 2.2;
  labGroup.add(ringA);

  const ringB = new THREE.Mesh(atomRingGeo, atomMat);
  ringB.position.y = 2.2;
  ringB.rotation.x = Math.PI / 2.5;
  labGroup.add(ringB);

  animatedUpdaters.push((time, delta) => {
    atomCore.rotation.y += delta * 1.5;
    ringA.rotation.x += delta * 2.0;
    ringB.rotation.y += delta * 1.7;
    atomCore.position.y = 2.2 + Math.sin(time * 2.5) * 0.1;
  });

  group.add(labGroup);
  obstacles.push({ x: lx, z: lz, radius: 2.9, name: 'Skill Lab' });
  createZoneEntryTrigger(labZone.id, lx, ly, lz + 2.8, labZone.color);

  // ========================================================
  // 3. CREATIVE PARK (Surreal Digital Garden)
  // ========================================================
  const parkZone = WORLD_ZONES.find((z) => z.id === 'creative-park')!;
  const [px, , pz] = parkZone.coords;
  const py = getTerrainHeight(px, pz);
  const parkGroup = new THREE.Group();
  parkGroup.position.set(px, py, pz);

  // Organic winding garden terrace
  const parkTerraceGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.35, 16);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0xa7f3d0, flatShading: true });
  const parkTerrace = new THREE.Mesh(parkTerraceGeo, grassMat);
  parkTerrace.position.y = 0.18;
  parkTerrace.receiveShadow = true;
  parkGroup.add(parkTerrace);

  // Giant Surreal Prism Flower
  const stemGeo = new THREE.CylinderGeometry(0.12, 0.18, 3.2, 6);
  const stem = new THREE.Mesh(stemGeo, darkFrameMat);
  stem.position.y = 1.6;
  parkGroup.add(stem);

  // Blooming Crystal Petals
  const petalGroup = new THREE.Group();
  petalGroup.position.y = 3.2;
  parkGroup.add(petalGroup);

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    emissive: 0xdb2777,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    flatShading: true,
  });

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const petalGeo = new THREE.ConeGeometry(0.55, 1.4, 4);
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.rotation.z = Math.PI / 3;
    petal.rotation.y = angle;
    petal.position.set(Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7);
    petalGroup.add(petal);
  }

  // Glowing Crystal mushrooms & digital flora around park
  const shroomMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x9333ea,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.4;
    const dist = 2.2;
    const capGeo = new THREE.ConeGeometry(0.35, 0.45, 6);
    const cap = new THREE.Mesh(capGeo, shroomMat);
    cap.position.set(Math.cos(angle) * dist, 0.5, Math.sin(angle) * dist);
    parkGroup.add(cap);
  }

  animatedUpdaters.push((time, delta) => {
    petalGroup.rotation.y += delta * 0.6;
    petalGroup.scale.setScalar(1.0 + Math.sin(time * 2.0) * 0.06);
  });

  group.add(parkGroup);
  obstacles.push({ x: px, z: pz, radius: 2.6, name: 'Creative Park' });
  createZoneEntryTrigger(parkZone.id, px, py, pz + 2.8, parkZone.color);

  // ========================================================
  // 4. WORKSPACE (Modern Creative Studio Pavilion)
  // ========================================================
  const workZone = WORLD_ZONES.find((z) => z.id === 'workspace')!;
  const [wx, , wz] = workZone.coords;
  const wy = getTerrainHeight(wx, wz);
  const workGroup = new THREE.Group();
  workGroup.position.set(wx, wy, wz);

  // Modern studio deck
  const deckGeo = new THREE.BoxGeometry(4.6, 0.3, 4.6);
  const studioDeck = new THREE.Mesh(deckGeo, whiteStructureMat);
  studioDeck.position.y = 0.15;
  studioDeck.receiveShadow = true;
  workGroup.add(studioDeck);

  // Modern Pergola / Beam Roof
  for (let i = -1.8; i <= 1.8; i += 0.9) {
    const beamGeo = new THREE.BoxGeometry(4.4, 0.15, 0.2);
    const beam = new THREE.Mesh(beamGeo, darkFrameMat);
    beam.position.set(0, 3.2, i);
    workGroup.add(beam);
  }

  // 4 Corner pillars
  const pillarGeo = new THREE.BoxGeometry(0.2, 3.2, 0.2);
  const p1 = new THREE.Mesh(pillarGeo, darkFrameMat);
  p1.position.set(-2.0, 1.6, -2.0);
  const p2 = new THREE.Mesh(pillarGeo, darkFrameMat);
  p2.position.set(2.0, 1.6, -2.0);
  const p3 = new THREE.Mesh(pillarGeo, darkFrameMat);
  p3.position.set(-2.0, 1.6, 2.0);
  const p4 = new THREE.Mesh(pillarGeo, darkFrameMat);
  p4.position.set(2.0, 1.6, 2.0);
  workGroup.add(p1);
  workGroup.add(p2);
  workGroup.add(p3);
  workGroup.add(p4);

  // Modern studio desk
  const deskGeo = new THREE.BoxGeometry(2.4, 0.1, 1.0);
  const desk = new THREE.Mesh(deskGeo, woodMat);
  desk.position.set(0, 0.9, 0);
  desk.castShadow = true;
  workGroup.add(desk);

  // Dual glowing monitors
  const monMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
  const monGeo = new THREE.BoxGeometry(0.8, 0.5, 0.05);
  const mon1 = new THREE.Mesh(monGeo, monMat);
  mon1.position.set(-0.5, 1.35, -0.1);
  mon1.rotation.y = 0.2;
  const mon2 = new THREE.Mesh(monGeo, monMat);
  mon2.position.set(0.5, 1.35, -0.1);
  mon2.rotation.y = -0.2;
  workGroup.add(mon1);
  workGroup.add(mon2);

  group.add(workGroup);
  obstacles.push({ x: wx, z: wz, radius: 2.7, name: 'Workspace Studio' });
  createZoneEntryTrigger(workZone.id, wx, wy, wz + 2.8, workZone.color);

  // ========================================================
  // 5. KNOWLEDGE LIBRARY (Tall Circular Rotunda Library)
  // ========================================================
  const libZone = WORLD_ZONES.find((z) => z.id === 'knowledge-library')!;
  const [kx, , kz] = libZone.coords;
  const ky = getTerrainHeight(kx, kz);
  const libGroup = new THREE.Group();
  libGroup.position.set(kx, ky, kz);

  // Stepped base
  const libPlinthGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.6, 16);
  const libPlinth = new THREE.Mesh(libPlinthGeo, whiteStructureMat);
  libPlinth.position.y = 0.3;
  libPlinth.castShadow = true;
  libPlinth.receiveShadow = true;
  libGroup.add(libPlinth);

  // Circular pillars around rotunda
  const rotundaRadius = 3.0;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const colGeo = new THREE.CylinderGeometry(0.18, 0.22, 4.6, 8);
    const col = new THREE.Mesh(colGeo, whiteStructureMat);
    col.position.set(Math.cos(angle) * rotundaRadius, 2.6, Math.sin(angle) * rotundaRadius);
    col.castShadow = true;
    libGroup.add(col);
  }

  // Inner library core with book arches
  const libCoreGeo = new THREE.CylinderGeometry(2.1, 2.1, 4.4, 16);
  const libCoreMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.8,
    flatShading: true,
  });
  const libCore = new THREE.Mesh(libCoreGeo, libCoreMat);
  libCore.position.y = 2.5;
  libGroup.add(libCore);

  // Rotunda classical dome
  const domeGeo = new THREE.SphereGeometry(3.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    flatShading: true,
    metalness: 0.2,
    roughness: 0.5,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 4.9;
  dome.castShadow = true;
  libGroup.add(dome);

  // Floating glowing Knowledge crystal above dome
  const bookGeo = new THREE.OctahedronGeometry(0.65, 0);
  const bookMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.8,
    flatShading: true,
  });
  const book = new THREE.Mesh(bookGeo, bookMat);
  book.position.y = 7.2;
  libGroup.add(book);

  animatedUpdaters.push((time, delta) => {
    book.rotation.y += delta * 1.2;
    book.position.y = 7.2 + Math.sin(time * 2.2) * 0.15;
  });

  group.add(libGroup);
  obstacles.push({ x: kx, z: kz, radius: 3.5, name: 'Knowledge Library' });
  createZoneEntryTrigger(libZone.id, kx, ky, kz + 3.4, libZone.color);

  // ========================================================
  // 6. CLOUD DATA (Elevated Sky Platform & Data Nodes)
  // ========================================================
  const cloudZone = WORLD_ZONES.find((z) => z.id === 'cloud-data')!;
  const [cx, , cz] = cloudZone.coords;
  const cy = getTerrainHeight(cx, cz);
  const cloudGroup = new THREE.Group();
  cloudGroup.position.set(cx, cy, cz);

  // 4 High-tech support pylons
  const pylonHeight = 3.6;
  const pylonPositions = [
    { x: -2.0, z: -2.0 },
    { x: 2.0, z: -2.0 },
    { x: -2.0, z: 2.0 },
    { x: 2.0, z: 2.0 },
  ];
  pylonPositions.forEach((pos) => {
    const pGeo = new THREE.CylinderGeometry(0.12, 0.2, pylonHeight, 6);
    const pMesh = new THREE.Mesh(pGeo, darkFrameMat);
    pMesh.position.set(pos.x, pylonHeight / 2, pos.z);
    cloudGroup.add(pMesh);
  });

  // Elevated floating disc platform
  const discGeo = new THREE.CylinderGeometry(3.2, 3.0, 0.35, 12);
  const disc = new THREE.Mesh(discGeo, whiteStructureMat);
  disc.position.y = pylonHeight;
  disc.castShadow = true;
  disc.receiveShadow = true;
  cloudGroup.add(disc);

  // Floating Cloud Data Ring
  const haloGeo = new THREE.TorusGeometry(2.4, 0.08, 8, 24);
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 0.8,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = pylonHeight + 1.8;
  halo.rotation.x = Math.PI / 2;
  cloudGroup.add(halo);

  // Floating crystalline cloud node
  const nodeGeo = new THREE.DodecahedronGeometry(0.7, 1);
  const node = new THREE.Mesh(nodeGeo, haloMat);
  node.position.y = pylonHeight + 1.8;
  cloudGroup.add(node);

  animatedUpdaters.push((time, delta) => {
    halo.rotation.z += delta * 0.8;
    node.rotation.y += delta * 1.4;
    node.position.y = pylonHeight + 1.8 + Math.sin(time * 2.5) * 0.15;
  });

  group.add(cloudGroup);
  obstacles.push({ x: cx, z: cz, radius: 2.8, name: 'Cloud Data Platform' });
  createZoneEntryTrigger(cloudZone.id, cx, cy, cz + 2.6, cloudZone.color);

  // ========================================================
  // 7. SECRET CAFE (Cozy Seaside Cafe Kiosk)
  // ========================================================
  const cafeZone = WORLD_ZONES.find((z) => z.id === 'secret-cafe')!;
  const [fx, , fz] = cafeZone.coords;
  const fy = getTerrainHeight(fx, fz);
  const cafeGroup = new THREE.Group();
  cafeGroup.position.set(fx, fy, fz);

  // Timber decking
  const cafeDeckGeo = new THREE.BoxGeometry(3.8, 0.25, 3.8);
  const cafeDeck = new THREE.Mesh(cafeDeckGeo, woodMat);
  cafeDeck.position.y = 0.125;
  cafeGroup.add(cafeDeck);

  // Cafe counter cabin
  const cabinGeo = new THREE.BoxGeometry(2.2, 2.4, 1.6);
  const cabin = new THREE.Mesh(cabinGeo, whiteStructureMat);
  cabin.position.set(0, 1.3, -0.8);
  cabin.castShadow = true;
  cafeGroup.add(cabin);

  // Striped canopy awning
  const awningGeo = new THREE.BoxGeometry(2.5, 0.15, 1.2);
  const awningMat = new THREE.MeshStandardMaterial({ color: 0xf97316, flatShading: true });
  const awning = new THREE.Mesh(awningGeo, awningMat);
  awning.position.set(0, 2.55, 0.1);
  awning.rotation.x = 0.2;
  cafeGroup.add(awning);

  // Round cafe table with umbrella
  const tableGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 12);
  const table = new THREE.Mesh(tableGeo, woodMat);
  table.position.set(0.9, 0.75, 0.9);
  cafeGroup.add(table);

  const tableLegGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.75, 6);
  const tableLeg = new THREE.Mesh(tableLegGeo, darkFrameMat);
  tableLeg.position.set(0.9, 0.375, 0.9);
  cafeGroup.add(tableLeg);

  // Umbrella
  const umbrellaGeo = new THREE.ConeGeometry(1.2, 0.45, 8);
  const umbrella = new THREE.Mesh(umbrellaGeo, awningMat);
  umbrella.position.set(0.9, 2.1, 0.9);
  cafeGroup.add(umbrella);

  const umbrellaPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6);
  const umbrellaPole = new THREE.Mesh(umbrellaPoleGeo, darkFrameMat);
  umbrellaPole.position.set(0.9, 1.4, 0.9);
  cafeGroup.add(umbrellaPole);

  // Coffee cup with steam particles
  const cupGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.18, 8);
  const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.position.set(0.9, 0.88, 0.9);
  cafeGroup.add(cup);

  // Steam particle sprite
  const steamGeo = new THREE.SphereGeometry(0.08, 6, 6);
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffedd5, transparent: true, opacity: 0.6 });
  const steam = new THREE.Mesh(steamGeo, steamMat);
  steam.position.set(0.9, 1.05, 0.9);
  cafeGroup.add(steam);

  animatedUpdaters.push((time) => {
    steam.position.y = 1.05 + Math.sin(time * 3) * 0.08;
    steam.scale.setScalar(0.8 + Math.sin(time * 4) * 0.3);
  });

  group.add(cafeGroup);
  obstacles.push({ x: fx, z: fz, radius: 2.2, name: 'Secret Cafe' });
  createZoneEntryTrigger(cafeZone.id, fx, fy, fz + 2.2, cafeZone.color);

  // ========================================================
  // 8. CONTACT STATION (Futuristic Comms Array)
  // ========================================================
  const contactZone = WORLD_ZONES.find((z) => z.id === 'contact-station')!;
  const [tx, , tz] = contactZone.coords;
  const ty = getTerrainHeight(tx, tz);
  const contactGroup = new THREE.Group();
  contactGroup.position.set(tx, ty, tz);

  // Base platform
  const stationBaseGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.4, 8);
  const stationBase = new THREE.Mesh(stationBaseGeo, darkFrameMat);
  stationBase.position.y = 0.2;
  contactGroup.add(stationBase);

  // Satellite Antenna mast
  const mastGeo = new THREE.CylinderGeometry(0.09, 0.15, 3.5, 6);
  const mast = new THREE.Mesh(mastGeo, whiteStructureMat);
  mast.position.y = 1.95;
  mast.castShadow = true;
  contactGroup.add(mast);

  // Parabolic Satellite Dish
  const dishGeo = new THREE.SphereGeometry(1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.4,
    roughness: 0.4,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.set(0, 3.5, 0);
  dish.rotation.x = -Math.PI / 3;
  dish.rotation.y = 0.4;
  contactGroup.add(dish);

  // Blinking transmission beacon on top of antenna
  const beaconLightGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const beaconLightMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  const beaconLight = new THREE.Mesh(beaconLightGeo, beaconLightMat);
  beaconLight.position.set(0, 3.9, 0);
  contactGroup.add(beaconLight);

  animatedUpdaters.push((time) => {
    dish.rotation.y = 0.4 + Math.sin(time * 0.8) * 0.3;
    beaconLight.scale.setScalar(0.9 + Math.sin(time * 6) * 0.3);
  });

  group.add(contactGroup);
  obstacles.push({ x: tx, z: tz, radius: 1.8, name: 'Contact Station' });
  createZoneEntryTrigger(contactZone.id, tx, ty, tz + 2.0, contactZone.color);

  // ========================================================
  // 9. RESUME PORTAL (Monumental Archway Gateway)
  // ========================================================
  const resumeZone = WORLD_ZONES.find((z) => z.id === 'resume-portal')!;
  const [rx, , rz] = resumeZone.coords;
  const ry = getTerrainHeight(rx, rz);
  const portalGroup = new THREE.Group();
  portalGroup.position.set(rx, ry, rz);

  // Twin grand pillars
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x312e81,
    roughness: 0.4,
    metalness: 0.5,
    flatShading: true,
  });
  const portalPillarGeo = new THREE.BoxGeometry(0.7, 5.2, 0.7);
  const leftPillar = new THREE.Mesh(portalPillarGeo, pillarMat);
  leftPillar.position.set(-1.8, 2.6, 0);
  leftPillar.castShadow = true;
  portalGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(portalPillarGeo, pillarMat);
  rightPillar.position.set(1.8, 2.6, 0);
  rightPillar.castShadow = true;
  portalGroup.add(rightPillar);

  // Top lintel crossbeam
  const lintelGeo = new THREE.BoxGeometry(4.6, 0.8, 0.9);
  const lintel = new THREE.Mesh(lintelGeo, pillarMat);
  lintel.position.set(0, 5.0, 0);
  lintel.castShadow = true;
  portalGroup.add(lintel);

  // Shimmering translucent portal vortex event-horizon
  const vortexGeo = new THREE.PlaneGeometry(2.6, 4.2);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });
  const vortex = new THREE.Mesh(vortexGeo, vortexMat);
  vortex.position.set(0, 2.5, 0);
  portalGroup.add(vortex);

  // Floating CV / Resume Badge
  const cvGeo = new THREE.BoxGeometry(0.8, 1.1, 0.1);
  const cvMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x4f46e5,
    emissiveIntensity: 0.7,
  });
  const cvBadge = new THREE.Mesh(cvGeo, cvMat);
  cvBadge.position.set(0, 5.8, 0);
  portalGroup.add(cvBadge);

  animatedUpdaters.push((time, delta) => {
    vortex.rotation.z += delta * 0.3;
    cvBadge.rotation.y += delta * 1.5;
    cvBadge.position.y = 5.8 + Math.sin(time * 2.5) * 0.12;
  });

  group.add(portalGroup);
  obstacles.push({ x: rx - 1.8, z: rz, radius: 0.7, name: 'Portal Left Pillar' });
  obstacles.push({ x: rx + 1.8, z: rz, radius: 0.7, name: 'Portal Right Pillar' });
  createZoneEntryTrigger(resumeZone.id, rx, ry, rz - 2.2, resumeZone.color);

  // Update loop
  const update = (time: number, delta: number) => {
    animatedUpdaters.forEach((fn) => fn(time, delta));
  };

  return { group, obstacles, update };
}
