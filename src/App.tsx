import { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './island/GameCanvas';
import { EvanOsHeader } from './components/EvanOsHeader';
import { ControlsOverlay } from './components/ControlsOverlay';
import { PortfolioHUD } from './components/PortfolioHUD';
import { PoiModal } from './components/PoiModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { CentralHubIntro } from './components/CentralHubIntro';
import { ZoneInformationPanel } from './components/ZoneInformationPanel';
import { WaypointBanner } from './components/WaypointBanner';
import { MapOverlay } from './components/MapOverlay';
import { QuickView } from './components/QuickView';
import {
  GameSettings,
  PlayerStats,
  PointOfInterest,
  WorldZone,
  Waypoint,
} from './types';
import { sound } from './audio';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>({
    timeOfDay: 'day',
    soundEnabled: true,
    fov: 50,
    cameraDistance: 8.5,
    graphicsQuality: 'high',
    invertY: false,
    sensitivity: 1.0,
    developerHud: false,
  });

  const [stats, setStats] = useState<PlayerStats>({
    x: 0,
    y: 1.4,
    z: 4,
    speed: 0,
    isGrounded: true,
    isSprinting: false,
    headingDeg: 0,
  });

  const [fps, setFps] = useState<number>(60);

  // Proximity states
  const [nearbyPoi, setNearbyPoi] = useState<PointOfInterest | null>(null);
  const [nearbyZone, setNearbyZone] = useState<WorldZone | null>(null);

  // Teleport targets
  const [teleportTarget, setTeleportTarget] = useState<PointOfInterest | null>(null);
  const [zoneTeleportTarget, setZoneTeleportTarget] = useState<WorldZone | null>(null);

  // Active navigation waypoint
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);

  // UI Modal / Overlay states
  const [activePoiModal, setActivePoiModal] = useState<PointOfInterest | null>(null);
  const [activeZone, setActiveZone] = useState<WorldZone | null>(null);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);
  const [quickViewTab, setQuickViewTab] = useState<string>('about');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleUpdateStats = useCallback((newStats: PlayerStats, currentFps: number) => {
    setStats({ ...newStats });
    setFps(currentFps);
  }, []);

  const handleNearbyPoi = useCallback((poi: PointOfInterest | null) => {
    setNearbyPoi(poi);
  }, []);

  const handleNearbyZone = useCallback((zone: WorldZone | null) => {
    setNearbyZone(zone);
  }, []);

  const handleInspectPoi = useCallback((poi: PointOfInterest) => {
    setActivePoiModal(poi);
    sound.playChime(880);
  }, []);

  const handleInspectZone = useCallback((zone: WorldZone) => {
    setActiveZone(zone);
    sound.playChime(880);
  }, []);

  const handleTeleportPoi = useCallback((poi: PointOfInterest) => {
    setTeleportTarget(poi);
    sound.playChime(659);
  }, []);

  const handleFastTravelToZone = useCallback((zone: WorldZone) => {
    setZoneTeleportTarget(zone);
    sound.playChime(784);
  }, []);

  const handleClearTeleport = useCallback(() => {
    setTeleportTarget(null);
    setZoneTeleportTarget(null);
  }, []);

  const handleSetWaypoint = useCallback((zone: WorldZone) => {
    setActiveWaypoint({
      zoneId: zone.id,
      name: zone.name,
      coords: zone.coords,
      color: zone.color,
    });
    sound.playChime(987.77);
  }, []);

  const handleClearWaypoint = useCallback(() => {
    setActiveWaypoint(null);
    sound.playChime(440);
  }, []);

  const handleOpenMap = useCallback(() => {
    setIsMapOpen(true);
    sound.playChime(784);
  }, []);

  const handleOpenQuickView = useCallback((tab: string = 'about') => {
    setQuickViewTab(tab);
    setIsQuickViewOpen(true);
    sound.playChime(880);
  }, []);

  const handleEnterZoneExperience = useCallback((zone: WorldZone) => {
    setActiveZone(null);
    switch (zone.id) {
      case 'project-arcade':
        handleOpenQuickView('projects');
        break;
      case 'skill-lab':
        handleOpenQuickView('skills');
        break;
      case 'workspace':
        handleOpenQuickView('experience');
        break;
      case 'library':
        handleOpenQuickView('education');
        break;
      case 'resume-portal':
        handleOpenQuickView('resume');
        break;
      case 'contact-station':
        handleOpenQuickView('contact');
        break;
      default:
        handleOpenQuickView('about');
        break;
    }
  }, [handleOpenQuickView]);

  // Global hotkeys for Map [M] and Quick View [Q]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (e.code === 'KeyM') {
        setIsMapOpen((prev) => !prev);
        sound.playChime(784);
      } else if (e.code === 'KeyQ') {
        setIsQuickViewOpen((prev) => !prev);
        sound.playChime(880);
      } else if (e.code === 'Escape') {
        setIsMapOpen(false);
        setIsQuickViewOpen(false);
        setActiveZone(null);
        setActivePoiModal(null);
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main
      id="evan-os-root"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100"
    >
      {/* 1. EVAN.OS Top Bar & Status Telemetry */}
      <EvanOsHeader
        settings={settings}
        onUpdateSettings={setSettings}
        stats={stats}
        fps={fps}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        onOpenMap={handleOpenMap}
        onOpenQuickView={handleOpenQuickView}
      />

      {/* 2. Interactive 3D Three.js Island Simulation Viewport */}
      <GameCanvas
        settings={settings}
        onUpdateStats={handleUpdateStats}
        onNearbyPoi={handleNearbyPoi}
        onInspectPoi={handleInspectPoi}
        nearbyZone={nearbyZone}
        onNearbyZone={handleNearbyZone}
        onInspectZone={handleInspectZone}
        teleportTarget={teleportTarget}
        zoneTeleportTarget={zoneTeleportTarget}
        onClearTeleport={handleClearTeleport}
        isMapOpen={isMapOpen}
      />

      {/* 3. Top Persistent Waypoint Navigation Banner */}
      <WaypointBanner
        waypoint={activeWaypoint}
        stats={stats}
        onClear={handleClearWaypoint}
      />

      {/* 4. HUD Controls Overlay with 10-Zone Circular Radar & Proximity Prompts */}
      <ControlsOverlay
        stats={stats}
        nearbyPoi={nearbyPoi}
        nearbyZone={nearbyZone}
        onInspectPoi={handleInspectPoi}
        onInspectZone={handleInspectZone}
        onTeleportToZone={handleFastTravelToZone}
      />

      {/* 5. Bottom-Left Quick Links Bar & Top-Right HUD Controls */}
      <PortfolioHUD
        settings={settings}
        onUpdateSettings={setSettings}
        stats={stats}
        fps={fps}
        onOpenMap={handleOpenMap}
        onOpenQuickView={handleOpenQuickView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectZone={handleInspectZone}
      />

      {/* 6. Central Hub Welcome Intro Modal */}
      <CentralHubIntro
        onExplore={() => sound.playChime(659)}
        onViewResume={() => handleOpenQuickView('resume')}
      />

      {/* 7. Zone Exploration & Portfolio Detail Modal */}
      <ZoneInformationPanel
        zone={activeZone}
        onClose={() => setActiveZone(null)}
        onEnter={handleEnterZoneExperience}
        onSetWaypoint={handleSetWaypoint}
        onFastTravel={handleFastTravelToZone}
      />

      {/* 8. Holographic World Map Blueprint Overlay */}
      <MapOverlay
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        stats={stats}
        onSetWaypoint={handleSetWaypoint}
        onFastTravel={handleFastTravelToZone}
      />

      {/* 9. Recruiter Quick View Panel */}
      <QuickView
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        initialTab={quickViewTab}
      />

      {/* 10. POI Inspection Modal (Lighthouse, Campfire, Monolith, etc.) */}
      <PoiModal
        poi={activePoiModal}
        onClose={() => setActivePoiModal(null)}
        onTeleport={handleTeleportPoi}
      />

      {/* 11. Configuration Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </main>
  );
}
