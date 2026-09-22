export type TimeOfDay = 'day' | 'sunset' | 'twilight' | 'night';

export interface PlayerStats {
  x: number;
  y: number;
  z: number;
  speed: number;
  isGrounded: boolean;
  isSprinting: boolean;
  headingDeg: number;
}

export interface ObstacleCollider {
  x: number;
  z: number;
  radius: number;
  name: string;
}

export interface PointOfInterest {
  id: string;
  title: string;
  code: string;
  tag: string;
  description: string;
  coords: [number, number, number];
  color: string;
  icon: string;
  status: 'ONLINE' | 'ACTIVE' | 'CALIBRATED' | 'STANDBY';
  logs: string[];
}

export interface WorldZone {
  id: string;
  name: string;
  code: string;
  tag: string;
  tagline: string;
  description: string;
  coords: [number, number, number];
  color: string;
  icon: string;
  radarSymbol: string;
  category: 'core' | 'projects' | 'skills' | 'creative' | 'experience' | 'learning' | 'future' | 'leisure' | 'contact' | 'career';
  highlights: string[];
}

export interface Waypoint {
  zoneId: string;
  name: string;
  coords: [number, number, number];
  color: string;
}

export interface GameSettings {
  timeOfDay: TimeOfDay;
  soundEnabled: boolean;
  developerHud: boolean;
  fov: number;
  cameraDistance: number;
  graphicsQuality: 'high' | 'medium';
  invertY: boolean;
  sensitivity: number;
}
