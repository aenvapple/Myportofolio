import * as THREE from 'three';
import { getTerrainHeight } from './terrain';

export interface ThirdPersonCamera {
  camera: THREE.PerspectiveCamera;
  update: (delta: number, playerPos: THREE.Vector3) => void;
  onMouseMove: (deltaX: number, deltaY: number) => void;
  onWheel: (deltaY: number) => void;
  getYaw: () => number;
  setDistance: (distance: number) => void;
  getDistance: () => number;
  resetView: () => void;
}

export function createThirdPersonCamera(
  aspectRatio: number,
  initialFov = 50
): ThirdPersonCamera {
  const camera = new THREE.PerspectiveCamera(initialFov, aspectRatio, 0.1, 300);

  // Orbit angles (radians)
  let yaw = 0; // Horizontal orbit around player
  let pitch = 0.35; // Vertical angle (0 is level, positive is looking down from above)
  let targetDistance = 8.5;
  let currentDistance = 8.5;

  // Smoothing states
  const currentPos = new THREE.Vector3(0, 6, 12);
  const currentLookAt = new THREE.Vector3(0, 1.4, 4);
  camera.position.copy(currentPos);
  camera.lookAt(currentLookAt);

  const minPitch = -0.15; // Limit looking up from ground
  const maxPitch = 1.35; // Limit looking straight down
  const minDistance = 3.0;
  const maxDistance = 22.0;

  const onMouseMove = (deltaX: number, deltaY: number) => {
    const sensitivity = 0.0035;
    yaw -= deltaX * sensitivity;
    pitch += deltaY * sensitivity;
    pitch = Math.max(minPitch, Math.min(maxPitch, pitch));
  };

  const onWheel = (deltaY: number) => {
    const zoomFactor = deltaY * 0.006;
    targetDistance = Math.max(minDistance, Math.min(maxDistance, targetDistance + zoomFactor));
  };

  const setDistance = (d: number) => {
    targetDistance = Math.max(minDistance, Math.min(maxDistance, d));
  };

  const getDistance = () => currentDistance;

  const resetView = () => {
    yaw = 0;
    pitch = 0.35;
    targetDistance = 8.5;
  };

  const update = (delta: number, playerPos: THREE.Vector3) => {
    const dt = Math.min(delta, 0.1);

    // Smooth zoom transition
    currentDistance += (targetDistance - currentDistance) * Math.min(1.0, dt * 10);

    // Target look-at point slightly above player feet
    const targetFocus = playerPos.clone().add(new THREE.Vector3(0, 1.35, 0));

    // Calculate desired camera position in spherical coordinates
    // When yaw is 0 and pitch is 0, camera is behind player (+Z offset)
    const horizontalDistance = currentDistance * Math.cos(pitch);
    const verticalOffset = currentDistance * Math.sin(pitch);

    const desiredX = targetFocus.x + horizontalDistance * Math.sin(yaw);
    const desiredZ = targetFocus.z + horizontalDistance * Math.cos(yaw);
    let desiredY = targetFocus.y + verticalOffset;

    // Camera terrain collision prevention
    // Don't let the camera dip underneath the island terrain or water level
    const terrainAtCam = getTerrainHeight(desiredX, desiredZ);
    const minCamHeight = Math.max(0.4, terrainAtCam + 0.65);
    if (desiredY < minCamHeight) {
      desiredY = minCamHeight;
    }

    const desiredPos = new THREE.Vector3(desiredX, desiredY, desiredZ);

    // Smooth camera follow lerp
    const followFactor = Math.min(1.0, dt * 8.5);
    currentPos.lerp(desiredPos, followFactor);
    currentLookAt.lerp(targetFocus, Math.min(1.0, dt * 12));

    camera.position.copy(currentPos);
    camera.lookAt(currentLookAt);
  };

  return {
    camera,
    update,
    onMouseMove,
    onWheel,
    getYaw: () => yaw,
    setDistance,
    getDistance,
    resetView,
  };
}
