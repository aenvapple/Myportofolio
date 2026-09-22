import * as THREE from 'three';
import { ObstacleCollider } from '../types';
import { getTerrainHeight } from '../island/terrain';

export interface CentralHubResult {
  group: THREE.Group;
  obstacles: ObstacleCollider[];
  update: (time: number, delta: number) => void;
}

export function createCentralHub(): CentralHubResult {
  const group = new THREE.Group();
  const obstacles: ObstacleCollider[] = [];

  const hubX = 0;
  const hubZ = 0;
  const hubY = getTerrainHeight(hubX, hubZ);
  group.position.set(hubX, hubY, hubZ);

  // 1. CIRCULAR STONE PLAZA PLATFORM
  const plazaRadius = 6.8;
  const plazaGeo = new THREE.CylinderGeometry(plazaRadius, plazaRadius + 0.6, 0.4, 32);
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    flatShading: true,
    roughness: 0.85,
    metalness: 0.1,
  });
  const plaza = new THREE.Mesh(plazaGeo, stoneMat);
  plaza.position.y = 0.2;
  plaza.receiveShadow = true;
  group.add(plaza);

  // Inner circular concentric ring
  const innerRingGeo = new THREE.RingGeometry(3.6, 3.8, 32);
  innerRingGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
  });
  const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
  innerRing.position.y = 0.41;
  group.add(innerRing);

  // Decorative compass star pattern in plaza center
  const starGeo = new THREE.RingGeometry(1.6, 1.8, 4);
  starGeo.rotateX(-Math.PI / 2);
  const starMesh = new THREE.Mesh(starGeo, ringMat);
  starMesh.position.y = 0.415;
  starMesh.rotation.y = Math.PI / 4;
  group.add(starMesh);

  // 2. BENCHES & DECORATIVE STYLIZED LAMPS
  const benchWoodMat = new THREE.MeshStandardMaterial({
    color: 0x92613b,
    flatShading: true,
    roughness: 0.8,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    flatShading: true,
    roughness: 0.5,
  });

  const benchAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  benchAngles.forEach((angle) => {
    const dist = 5.2;
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;

    const bench = new THREE.Group();
    bench.position.set(bx, 0.4, bz);
    bench.rotation.y = -angle - Math.PI / 2;

    // Seat plank
    const seatGeo = new THREE.BoxGeometry(1.5, 0.1, 0.4);
    const seat = new THREE.Mesh(seatGeo, benchWoodMat);
    seat.position.y = 0.35;
    seat.castShadow = true;
    bench.add(seat);

    // Backrest
    const backGeo = new THREE.BoxGeometry(1.5, 0.35, 0.08);
    const back = new THREE.Mesh(backGeo, benchWoodMat);
    back.position.set(0, 0.62, -0.16);
    back.castShadow = true;
    bench.add(back);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.35, 0.36);
    const leg1 = new THREE.Mesh(legGeo, metalMat);
    leg1.position.set(-0.6, 0.175, 0);
    const leg2 = new THREE.Mesh(legGeo, metalMat);
    leg2.position.set(0.6, 0.175, 0);
    bench.add(leg1);
    bench.add(leg2);

    group.add(bench);
    obstacles.push({ x: bx, z: bz, radius: 0.8, name: 'Plaza Bench' });
  });

  // Stylized modern plaza lamp posts
  const lampAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  lampAngles.forEach((angle) => {
    const dist = 5.8;
    const lx = Math.cos(angle) * dist;
    const lz = Math.sin(angle) * dist;

    const lamp = new THREE.Group();
    lamp.position.set(lx, 0.4, lz);

    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.8, 6);
    const post = new THREE.Mesh(postGeo, metalMat);
    post.position.y = 1.4;
    post.castShadow = true;
    lamp.add(post);

    const headGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.2, 6);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.position.y = 2.8;
    lamp.add(head);

    const lightGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const bulb = new THREE.Mesh(lightGeo, lightMat);
    bulb.position.y = 2.65;
    lamp.add(bulb);

    const pLight = new THREE.PointLight(0x38bdf8, 1.2, 7);
    pLight.position.y = 2.65;
    lamp.add(pLight);

    group.add(lamp);
    obstacles.push({ x: lx, z: lz, radius: 0.4, name: 'Plaza Lamp' });
  });

  // 3. THE EVAN.OS CORE (FLOATING TRANSLUCENT ENERGY SPHERE)
  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 2.2, 0);
  group.add(coreGroup);

  // Outer translucent electric-blue energy sphere
  const sphereGeo = new THREE.SphereGeometry(1.15, 24, 20);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.2,
    wireframe: false,
  });
  const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
  coreGroup.add(coreSphere);

  // Inner pulsing dense orb
  const innerOrbGeo = new THREE.IcosahedronGeometry(0.5, 2);
  const innerOrbMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.0,
    roughness: 0.2,
    flatShading: true,
  });
  const innerOrb = new THREE.Mesh(innerOrbGeo, innerOrbMat);
  coreGroup.add(innerOrb);

  // Light emission from Core
  const coreLight = new THREE.PointLight(0x38bdf8, 2.2, 14);
  coreLight.position.set(0, 0, 0);
  coreGroup.add(coreLight);

  // Rotating Gimbal Rings
  const ring1Geo = new THREE.TorusGeometry(1.4, 0.04, 8, 32);
  const gimbalMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const ring1 = new THREE.Mesh(ring1Geo, gimbalMat);
  coreGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(1.65, 0.035, 8, 32);
  const ring2 = new THREE.Mesh(ring2Geo, gimbalMat);
  ring2.rotation.x = Math.PI / 3;
  coreGroup.add(ring2);

  // ROTATING CORE WORDS: "CODE", "DESIGN", "DATA", "CONTENT", "IDEAS"
  const coreWords = ['CODE', 'DESIGN', 'DATA', 'CONTENT', 'IDEAS'];
  const wordPivots: THREE.Group[] = [];

  function createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 256, 96);
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Glow effect
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, 128, 48);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.52, 1);
    return sprite;
  }

  const wordRadius = 2.1;
  coreWords.forEach((word, index) => {
    const pivot = new THREE.Group();
    const angle = (index / coreWords.length) * Math.PI * 2;
    const sprite = createTextSprite(word);
    sprite.position.set(Math.cos(angle) * wordRadius, 0, Math.sin(angle) * wordRadius);
    pivot.add(sprite);
    coreGroup.add(pivot);
    wordPivots.push(pivot);
  });

  // Floating digital particles inside & around core
  const particleCount = 45;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 0.5 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    pPos[i * 3] = r * Math.cos(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi);
    pPos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
  });
  const particles = new THREE.Points(pGeo, pMat);
  coreGroup.add(particles);

  // Core base pedestal to prevent player walking straight through core
  const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.8, 12);
  const pedestal = new THREE.Mesh(pedestalGeo, stoneMat);
  pedestal.position.y = 0.4;
  pedestal.castShadow = true;
  group.add(pedestal);
  obstacles.push({ x: hubX, z: hubZ, radius: 1.6, name: 'The EVAN.OS Core' });

  // 4. FLOATING 3D EVAN.OS MAIN SIGN
  const signGroup = new THREE.Group();
  signGroup.position.set(0, 6.4, 0);
  group.add(signGroup);

  function createMainSignBillboard(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark translucent backing with rounded rect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(10, 10, 1004, 340, 24);
      ctx.fill();
      ctx.stroke();

      // Cyan accent line
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(80, 40, 6, 280);

      // Title: EVAN.OS
      ctx.font = 'bold 74px "JetBrains Mono", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.fillText('EVAN.OS', 110, 125);

      // Name: EVAN CHANDRA MAULANA
      ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillText('EVAN CHANDRA MAULANA', 110, 195);

      // Subtitle: INFORMATICS • CREATIVE • DIGITAL
      ctx.font = '600 24px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.letterSpacing = '4px';
      ctx.fillText('INFORMATICS • CREATIVE • DIGITAL', 110, 255);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const signGeo = new THREE.PlaneGeometry(6.4, 2.25);
    const signMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    return new THREE.Mesh(signGeo, signMat);
  }

  const signMesh = createMainSignBillboard();
  signGroup.add(signMesh);

  // Support energy struts
  const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.2, 4);
  const strutMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
  const strutLeft = new THREE.Mesh(strutGeo, strutMat);
  strutLeft.position.set(-2.8, -1.8, 0);
  signGroup.add(strutLeft);

  const strutRight = new THREE.Mesh(strutGeo, strutMat);
  strutRight.position.set(2.8, -1.8, 0);
  signGroup.add(strutRight);

  // Update animation hook
  const update = (time: number, delta: number) => {
    // Core rotation
    ring1.rotation.y += delta * 0.8;
    ring1.rotation.x += delta * 0.4;
    ring2.rotation.y -= delta * 0.6;
    ring2.rotation.z += delta * 0.5;

    // Word pivots orbiting slowly
    wordPivots.forEach((pivot) => {
      pivot.rotation.y += delta * 0.35;
    });

    // Gentle core bobbing
    coreGroup.position.y = 2.2 + Math.sin(time * 2.0) * 0.12;

    // Inner orb spin
    innerOrb.rotation.y += delta * 1.5;
    innerOrb.rotation.x += delta * 1.0;

    // Subtle light pulsation
    coreLight.intensity = 2.0 + Math.sin(time * 3.0) * 0.3;

    // Floating sign gentle bobbing
    signGroup.position.y = 6.4 + Math.sin(time * 1.4) * 0.1;
  };

  return { group, obstacles, update };
}
