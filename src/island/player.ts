import * as THREE from 'three';
import { ObstacleCollider, PlayerStats } from '../types';
import { getTerrainHeight, resolveCollisions } from './terrain';
import { sound } from '../audio';

export interface PlayerController {
  mesh: THREE.Group;
  stats: PlayerStats;
  update: (
    delta: number,
    input: { forward: number; strafe: number; jump: boolean; sprint: boolean },
    cameraYaw: number,
    obstacles: ObstacleCollider[]
  ) => void;
  resetPosition: (x?: number, z?: number) => void;
  getPosition: () => THREE.Vector3;
}

export function createPlayer(): PlayerController {
  const mesh = new THREE.Group();

  // Materials for low-poly avatar
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Vibrant cyber teal/blue
    flatShading: true,
    roughness: 0.5,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    flatShading: true,
    roughness: 0.4,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfde047, // Stylized gold/amber
    flatShading: true,
    roughness: 0.6,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    flatShading: true,
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    flatShading: true,
    roughness: 0.7,
  });

  // Pelvis / Root offset
  const bodyRoot = new THREE.Group();
  mesh.add(bodyRoot);

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.32);
  const torso = new THREE.Mesh(torsoGeo, suitMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyRoot.add(torso);

  // Belt / Accent stripe
  const beltGeo = new THREE.BoxGeometry(0.52, 0.1, 0.34);
  const belt = new THREE.Mesh(beltGeo, accentMat);
  belt.position.y = 0.68;
  bodyRoot.add(belt);

  // Backpack / Energy cell
  const packGeo = new THREE.BoxGeometry(0.36, 0.45, 0.18);
  const pack = new THREE.Mesh(packGeo, backpackMat);
  pack.position.set(0, 0.98, -0.24);
  pack.castShadow = true;
  bodyRoot.add(pack);

  // Antenna
  const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
  const antenna = new THREE.Mesh(antennaGeo, accentMat);
  antenna.position.set(0.12, 1.3, -0.24);
  bodyRoot.add(antenna);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.45, 0);
  bodyRoot.add(headGroup);

  const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.4);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.36, 0.16, 0.1);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.02, 0.2);
  headGroup.add(visor);

  // Limbs with pivot points
  // Left Arm
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.35, 1.2, 0);
  bodyRoot.add(leftArmPivot);

  const armGeo = new THREE.BoxGeometry(0.16, 0.55, 0.16);
  const leftArm = new THREE.Mesh(armGeo, suitMat);
  leftArm.position.y = -0.25;
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);

  // Right Arm
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.35, 1.2, 0);
  bodyRoot.add(rightArmPivot);

  const rightArm = new THREE.Mesh(armGeo, suitMat);
  rightArm.position.y = -0.25;
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);

  // Left Leg
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.16, 0.65, 0);
  bodyRoot.add(leftLegPivot);

  const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
  const leftLeg = new THREE.Mesh(legGeo, suitMat);
  leftLeg.position.y = -0.32;
  leftLeg.castShadow = true;
  leftLegPivot.add(leftLeg);

  // Right Leg
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.16, 0.65, 0);
  bodyRoot.add(rightLegPivot);

  const rightLeg = new THREE.Mesh(legGeo, suitMat);
  rightLeg.position.y = -0.32;
  rightLeg.castShadow = true;
  rightLegPivot.add(rightLeg);

  // Contact Shadow Disc
  const shadowGeo = new THREE.CircleGeometry(0.42, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  mesh.add(shadowMesh);

  // Internal physics & kinematic state
  const pos = new THREE.Vector3(0, getTerrainHeight(0, 4), 4);
  let velocityY = 0;
  let isGrounded = true;
  let currentFacingAngle = 0;
  let targetFacingAngle = 0;
  let walkCycle = 0;
  const playerRadius = 0.45;

  mesh.position.copy(pos);

  const stats: PlayerStats = {
    x: pos.x,
    y: pos.y,
    z: pos.z,
    speed: 0,
    isGrounded: true,
    isSprinting: false,
    headingDeg: 0,
  };

  const resetPosition = (newX = 0, newZ = 4) => {
    pos.x = newX;
    pos.z = newZ;
    pos.y = getTerrainHeight(newX, newZ);
    velocityY = 0;
    isGrounded = true;
    mesh.position.copy(pos);
  };

  const update = (
    delta: number,
    input: { forward: number; strafe: number; jump: boolean; sprint: boolean },
    cameraYaw: number,
    obstacles: ObstacleCollider[]
  ) => {
    // Clamping delta to avoid physics explosions during tab switch
    const dt = Math.min(delta, 0.1);

    // 1. Calculate horizontal movement relative to camera yaw
    let moveX = 0;
    let moveZ = 0;

    if (input.forward !== 0 || input.strafe !== 0) {
      // Forward vector from camera horizontal orientation
      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);

      // Forward is along -Z in local camera space
      const forwardX = -sinYaw;
      const forwardZ = -cosYaw;

      // Right/Strafe vector (+X in camera space)
      const rightX = cosYaw;
      const rightZ = -sinYaw;

      moveX = forwardX * input.forward + rightX * input.strafe;
      moveZ = forwardZ * input.forward + rightZ * input.strafe;

      // Normalize diagonal movement
      const mag = Math.hypot(moveX, moveZ);
      if (mag > 0.001) {
        moveX /= mag;
        moveZ /= mag;
      }
    }

    const isMoving = Math.hypot(moveX, moveZ) > 0.01;
    const baseSpeed = input.sprint ? 9.2 : 5.4;
    const speed = isMoving ? baseSpeed : 0;

    // 2. Position updates & obstacle collision
    if (isMoving) {
      const nextX = pos.x + moveX * speed * dt;
      const nextZ = pos.z + moveZ * speed * dt;

      // Resolve basic collisions with trees, rocks, lighthouse, campfire
      const collisionResult = resolveCollisions(nextX, nextZ, playerRadius, obstacles);
      pos.x = collisionResult.x;
      pos.z = collisionResult.z;

      // Calculate desired player facing angle
      targetFacingAngle = Math.atan2(moveX, moveZ);

      // Play procedural footsteps
      if (isGrounded) {
        sound.playFootstep(input.sprint);
      }
    }

    // Smooth rotational slerp toward target facing direction
    let angleDiff = targetFacingAngle - currentFacingAngle;
    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    currentFacingAngle += angleDiff * Math.min(1.0, dt * 14);
    bodyRoot.rotation.y = currentFacingAngle;

    // 3. Vertical Physics & Jump
    const groundHeight = getTerrainHeight(pos.x, pos.z);

    if (input.jump && isGrounded) {
      velocityY = 7.6;
      isGrounded = false;
      sound.playJump();
    }

    if (!isGrounded) {
      // Gravity
      velocityY -= 19.0 * dt;
      pos.y += velocityY * dt;

      if (pos.y <= groundHeight) {
        pos.y = groundHeight;
        velocityY = 0;
        isGrounded = true;
        sound.playLand();
      }
    } else {
      // Smoothly stick to ground elevation
      pos.y += (groundHeight - pos.y) * Math.min(1.0, dt * 18);
    }

    // 4. Procedural walk & limb animations
    if (isMoving && isGrounded) {
      const animRate = input.sprint ? 14 : 9;
      walkCycle += dt * animRate;

      const swing = Math.sin(walkCycle) * 0.65;
      leftLegPivot.rotation.x = swing;
      rightLegPivot.rotation.x = -swing;
      leftArmPivot.rotation.x = -swing * 0.85;
      rightArmPivot.rotation.x = swing * 0.85;

      // Natural vertical body bobbing
      bodyRoot.position.y = Math.abs(Math.cos(walkCycle * 2)) * 0.08;
      bodyRoot.rotation.z = Math.sin(walkCycle) * 0.05;
    } else if (!isGrounded) {
      // Airborne pose
      leftLegPivot.rotation.x = 0.3;
      rightLegPivot.rotation.x = -0.2;
      leftArmPivot.rotation.x = -0.6;
      rightArmPivot.rotation.x = -0.6;
      bodyRoot.position.y = 0;
      bodyRoot.rotation.z = 0;
    } else {
      // Idle return to rest
      leftLegPivot.rotation.x *= 0.8;
      rightLegPivot.rotation.x *= 0.8;
      leftArmPivot.rotation.x *= 0.8;
      rightArmPivot.rotation.x *= 0.8;
      bodyRoot.position.y *= 0.8;
      bodyRoot.rotation.z *= 0.8;
    }

    // Update mesh transform
    mesh.position.set(pos.x, pos.y, pos.z);

    // Contact shadow sits directly on the ground
    shadowMesh.position.y = groundHeight - pos.y + 0.02;
    const heightAboveGround = Math.max(0, pos.y - groundHeight);
    shadowMat.opacity = Math.max(0.08, 0.35 - heightAboveGround * 0.08);
    const shadowScale = Math.max(0.6, 1.0 - heightAboveGround * 0.1);
    shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);

    // Telemetry stats
    stats.x = pos.x;
    stats.y = pos.y;
    stats.z = pos.z;
    stats.speed = speed;
    stats.isGrounded = isGrounded;
    stats.isSprinting = input.sprint;
    stats.headingDeg = Math.round(((currentFacingAngle * 180) / Math.PI + 360) % 360);
  };

  const getPosition = () => pos.clone();

  return {
    mesh,
    stats,
    update,
    resetPosition,
    getPosition,
  };
}
