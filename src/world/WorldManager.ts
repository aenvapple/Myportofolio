import * as THREE from 'three';
import { ObstacleCollider } from '../types';
import { createCentralHub } from './CentralHub';
import { createNavigationPaths } from './NavigationPaths';
import { createZoneLandmarks } from './ZoneLandmarks';

export interface WorldHubElements {
  group: THREE.Group;
  obstacles: ObstacleCollider[];
  update: (time: number, delta: number) => void;
}

export function buildWorldHub(): WorldHubElements {
  const group = new THREE.Group();
  const obstacles: ObstacleCollider[] = [];

  // 1. Central Hub Plaza & The EVAN.OS Core & Sign
  const hub = createCentralHub();
  group.add(hub.group);
  obstacles.push(...hub.obstacles);

  // 2. Navigational Express Paths
  const paths = createNavigationPaths();
  group.add(paths);

  // 3. Zone Exterior Landmarks
  const landmarks = createZoneLandmarks();
  group.add(landmarks.group);
  obstacles.push(...landmarks.obstacles);

  const update = (time: number, delta: number) => {
    hub.update(time, delta);
    landmarks.update(time, delta);
  };

  return {
    group,
    obstacles,
    update,
  };
}
