import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameSettings, PlayerStats, PointOfInterest, WorldZone } from '../types';
import { createIslandMesh, createWaterMesh, ISLAND_POIS } from './terrain';
import { buildIslandDecorations, IslandSceneElements } from './sceneBuilder';
import { createPlayer, PlayerController } from './player';
import { createThirdPersonCamera, ThirdPersonCamera } from './cameraController';
import { buildWorldHub, WorldHubElements } from '../world/WorldManager';
import { WORLD_ZONES } from '../data/worldZones';
import { sound } from '../audio';

interface GameCanvasProps {
  settings: GameSettings;
  onUpdateStats: (stats: PlayerStats, fps: number) => void;
  onNearbyPoi: (poi: PointOfInterest | null) => void;
  onInspectPoi: (poi: PointOfInterest) => void;
  nearbyZone: WorldZone | null;
  onNearbyZone: (zone: WorldZone | null) => void;
  onInspectZone: (zone: WorldZone) => void;
  teleportTarget: PointOfInterest | null;
  zoneTeleportTarget: WorldZone | null;
  onClearTeleport: () => void;
  isMapOpen: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  onUpdateStats,
  onNearbyPoi,
  onInspectPoi,
  nearbyZone,
  onNearbyZone,
  onInspectZone,
  teleportTarget,
  zoneTeleportTarget,
  onClearTeleport,
  isMapOpen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to engine instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraCtrlRef = useRef<ThirdPersonCamera | null>(null);
  const playerRef = useRef<PlayerController | null>(null);
  const sceneElementsRef = useRef<IslandSceneElements | null>(null);
  const worldHubRef = useRef<WorldHubElements | null>(null);

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);

  // Proximity tracking
  const currentNearbyPoi = useRef<PointOfInterest | null>(null);
  const currentNearbyZone = useRef<WorldZone | null>(null);

  // Handle pointer lock change
  useEffect(() => {
    const handleLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvasRef.current);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  // Update lighting when time of day changes
  useEffect(() => {
    if (sceneElementsRef.current) {
      sceneElementsRef.current.setLightingTime(settings.timeOfDay);
    }
  }, [settings.timeOfDay]);

  // Adjust camera distance when Map is open
  useEffect(() => {
    if (cameraCtrlRef.current) {
      if (isMapOpen) {
        cameraCtrlRef.current.setDistance(18);
      } else {
        cameraCtrlRef.current.setDistance(settings.cameraDistance || 8.5);
      }
    }
  }, [isMapOpen, settings.cameraDistance]);

  // Handle teleport target from OS map/radar
  useEffect(() => {
    if (teleportTarget && playerRef.current) {
      const [tx, , tz] = teleportTarget.coords;
      playerRef.current.resetPosition(tx + 1.5, tz + 1.5);
      sound.playChime(659.25);
      onClearTeleport();
    }
  }, [teleportTarget, onClearTeleport]);

  // Handle zone teleport target
  useEffect(() => {
    if (zoneTeleportTarget && playerRef.current) {
      const [zx, , zz] = zoneTeleportTarget.coords;
      playerRef.current.resetPosition(zx + 2.0, zz + 2.0);
      sound.playChime(784);
      onClearTeleport();
    }
  }, [zoneTeleportTarget, onClearTeleport]);

  // Main Three.js Initialization & Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera controller
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const cameraCtrl = createThirdPersonCamera(width / height, settings.fov);
    cameraCtrlRef.current = cameraCtrl;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // 4. Island & Water Meshes
    const islandMesh = createIslandMesh();
    scene.add(islandMesh);

    const water = createWaterMesh();
    scene.add(water.mesh);

    // 5. Scenery props, trees, lighthouse, campfire, monolith
    const sceneElements = buildIslandDecorations();
    scene.add(sceneElements.group);
    sceneElements.setLightingTime(settings.timeOfDay);
    sceneElementsRef.current = sceneElements;

    // 6. EVAN.OS World Hub (Central Hub Plaza, Core, Express Paths, Zone Landmarks)
    const worldHub = buildWorldHub();
    scene.add(worldHub.group);
    worldHubRef.current = worldHub;

    // Combine obstacles for player physics
    const combinedObstacles = [...sceneElements.obstacles, ...worldHub.obstacles];

    // 7. Player avatar
    const player = createPlayer();
    scene.add(player.mesh);
    playerRef.current = player;

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          cameraCtrl.camera.aspect = w / h;
          cameraCtrl.camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        }
      }
    });
    resizeObserver.observe(container);

    // 8. Render & Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let currentFps = 60;

    const clock = new THREE.Clock();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Measure FPS
      frameCount++;
      if (currentTime - lastFpsTime >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (currentTime - lastFpsTime));
        frameCount = 0;
        lastFpsTime = currentTime;
      }

      // Input polling (paused when map is open)
      const keys = keysPressed.current;
      let forward = 0;
      let strafe = 0;

      if (!isMapOpen) {
        if (keys['KeyW'] || keys['ArrowUp']) forward += 1;
        if (keys['KeyS'] || keys['ArrowDown']) forward -= 1;
        if (keys['KeyA'] || keys['ArrowLeft']) strafe -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) strafe += 1;
      }

      const jump = !isMapOpen && !!keys['Space'];
      const sprint = !isMapOpen && !!(keys['ShiftLeft'] || keys['ShiftRight']);

      // Update Player
      const camYaw = cameraCtrl.getYaw();
      player.update(
        delta,
        { forward, strafe, jump, sprint },
        camYaw,
        combinedObstacles
      );

      // Update Camera follow
      const playerPos = player.getPosition();
      cameraCtrl.update(delta, playerPos);

      // Update dynamic scene elements (waves, clouds, beacon light, fire flame)
      water.update(elapsedTime);
      sceneElements.update(elapsedTime, delta);
      worldHub.update(elapsedTime, delta);

      // Proximity check for Points of Interest
      let nearestPoi: PointOfInterest | null = null;
      let minDistance = 4.2;

      for (const poi of ISLAND_POIS) {
        const [px, , pz] = poi.coords;
        const dist = Math.hypot(playerPos.x - px, playerPos.z - pz);
        if (dist < minDistance) {
          minDistance = dist;
          nearestPoi = poi;
        }
      }

      if (nearestPoi !== currentNearbyPoi.current) {
        currentNearbyPoi.current = nearestPoi;
        onNearbyPoi(nearestPoi);
        if (nearestPoi) {
          sound.playChime(523.25);
        }
      }

      // Proximity check for World Zones
      let nearestZoneCandidate: WorldZone | null = null;
      let minZoneDist = 5.2;

      for (const zone of WORLD_ZONES) {
        const [zx, , zz] = zone.coords;
        const dist = Math.hypot(playerPos.x - zx, playerPos.z - zz);
        if (dist < minZoneDist) {
          minZoneDist = dist;
          nearestZoneCandidate = zone;
        }
      }

      if (nearestZoneCandidate !== currentNearbyZone.current) {
        currentNearbyZone.current = nearestZoneCandidate;
        onNearbyZone(nearestZoneCandidate);
        if (nearestZoneCandidate) {
          sound.playChime(659.25);
        }
      }

      // Render
      renderer.render(scene, cameraCtrl.camera);

      // Telemetry update
      onUpdateStats(player.stats, currentFps);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [isMapOpen]); // Re-attach if isMapOpen changes input polling

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling when using arrow keys / space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      keysPressed.current[e.code] = true;

      // Start procedural ocean audio on first user key/click
      sound.startOcean();

      // [E] key: Inspect nearby Zone or POI
      if (e.code === 'KeyE') {
        if (currentNearbyZone.current) {
          onInspectZone(currentNearbyZone.current);
          sound.playChime(880);
        } else if (currentNearbyPoi.current) {
          onInspectPoi(currentNearbyPoi.current);
          sound.playChime(880);
        }
      }

      // [R] key: Reset player position
      if (e.code === 'KeyR' && playerRef.current) {
        playerRef.current.resetPosition(0, 4);
        sound.playChime(440);
      }

      // [C] key: Cycle camera distance
      if (e.code === 'KeyC' && cameraCtrlRef.current) {
        const currentD = cameraCtrlRef.current.getDistance();
        const nextD = currentD > 14 ? 5.5 : currentD > 8 ? 16 : 8.5;
        cameraCtrlRef.current.setDistance(nextD);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInspectPoi, onInspectZone]);

  // Mouse / Pointer Controls
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    sound.startOcean();
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cameraCtrlRef.current) return;

    if (isPointerLocked) {
      cameraCtrlRef.current.onMouseMove(e.movementX, e.movementY);
    } else if (isDragging.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      cameraCtrlRef.current.onMouseMove(deltaX, deltaY);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  }, [isPointerLocked]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (cameraCtrlRef.current) {
      cameraCtrlRef.current.onWheel(e.deltaY);
    }
  }, []);

  // Touch controls for mobile drag orbit
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    sound.startOcean();
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current || !cameraCtrlRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    cameraCtrlRef.current.onMouseMove(deltaX * 1.5, deltaY * 1.5);
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const togglePointerLock = () => {
    if (!canvasRef.current) return;
    if (!isPointerLocked) {
      canvasRef.current.requestPointerLock();
    } else {
      document.exitPointerLock();
    }
  };

  return (
    <div
      ref={containerRef}
      id="evan-viewport-container"
      className="relative w-full h-full select-none overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950"
    >
      <canvas
        ref={canvasRef}
        id="evan-3d-canvas"
        className="w-full h-full block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Crosshair indicator when in pointer-lock mode */}
      {isPointerLocked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full border border-cyan-400/80 bg-cyan-400/30 backdrop-blur-xs" />
        </div>
      )}

      {/* Floating Pointer Lock Toggle Button */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <button
          id="btn-toggle-pointer-lock"
          onClick={togglePointerLock}
          className={`px-3 py-1.5 rounded-md text-xs font-mono tracking-wider transition-all border shadow-lg backdrop-blur-md flex items-center gap-1.5 ${
            isPointerLocked
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Toggle free mouse look (Press ESC to release)"
        >
          <span className={`w-2 h-2 rounded-full ${isPointerLocked ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
          {isPointerLocked ? 'LOCKED (ESC TO UNLOCK)' : 'CAPTURE MOUSE'}
        </button>

        <button
          id="btn-reset-pos"
          onClick={() => {
            playerRef.current?.resetPosition(0, 4);
            sound.playChime(440);
          }}
          className="px-3 py-1.5 rounded-md text-xs font-mono tracking-wider transition-all border shadow-lg backdrop-blur-md bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-cyan-500/40 hover:text-white"
        >
          RESET POS [R]
        </button>
      </div>
    </div>
  );
};
