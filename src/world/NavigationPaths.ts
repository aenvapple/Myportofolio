import * as THREE from 'three';
import { getTerrainHeight } from '../island/terrain';
import { WORLD_ZONES } from '../data/worldZones';

export function createNavigationPaths(): THREE.Group {
  const group = new THREE.Group();

  // Materials
  const stonePaverMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.85,
    flatShading: true,
  });

  const woodPlankMat = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.8,
    flatShading: true,
  });

  const darkSlateMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.7,
    flatShading: true,
  });

  // Reusable paver geometries
  const roundPaverGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.08, 7);
  const rectPaverGeo = new THREE.BoxGeometry(1.1, 0.08, 0.55);
  const hexPaverGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.08, 6);

  // Connect Central Hub (0, 0) to each destination
  const hubCenter = new THREE.Vector2(0, 0);

  WORLD_ZONES.forEach((zone) => {
    if (zone.id === 'central-hub') return;

    const targetPos = new THREE.Vector2(zone.coords[0], zone.coords[2]);
    const totalDist = hubCenter.distanceTo(targetPos);
    const dir = targetPos.clone().sub(hubCenter).normalize();

    // Start slightly outside Central Hub plaza (r ~ 6.5)
    const startDist = 6.2;
    const endDist = Math.max(startDist + 2, totalDist - 2.8);
    const stepDist = 1.6;

    let stepIndex = 0;
    for (let d = startDist; d <= endDist; d += stepDist) {
      stepIndex++;
      const currentX = dir.x * d;
      const currentZ = dir.y * d;
      const currentY = getTerrainHeight(currentX, currentZ);

      // Only place paver if above water
      if (currentY < 0.15) continue;

      let paverMesh: THREE.Mesh;

      if (zone.id === 'project-arcade') {
        // Digital tech path (slate pavers)
        paverMesh = new THREE.Mesh(rectPaverGeo, darkSlateMat);
        paverMesh.rotation.y = Math.atan2(dir.x, dir.y);
      } else if (zone.id === 'skill-lab') {
        // Hexagonal modern pavers
        paverMesh = new THREE.Mesh(hexPaverGeo, stonePaverMat);
      } else if (zone.id === 'workspace') {
        // Sleek rectangular modern pavers
        paverMesh = new THREE.Mesh(rectPaverGeo, stonePaverMat);
        paverMesh.rotation.y = Math.atan2(dir.x, dir.y) + Math.PI / 2;
      } else if (zone.id === 'secret-cafe' || zone.id === 'contact-station' || zone.id === 'resume-portal') {
        // Wooden planks
        paverMesh = new THREE.Mesh(rectPaverGeo, woodPlankMat);
        paverMesh.rotation.y = Math.atan2(dir.x, dir.y) + Math.PI / 2;
      } else {
        // Organic round pavers for Library, Creative Park, Cloud Data
        paverMesh = new THREE.Mesh(roundPaverGeo, stonePaverMat);
        paverMesh.rotation.y = stepIndex * 0.4;
      }

      paverMesh.position.set(currentX, currentY + 0.04, currentZ);
      paverMesh.receiveShadow = true;
      group.add(paverMesh);

      // Add distinctive subtle pathway markers every ~4 pavers
      if (stepIndex % 4 === 2) {
        const markerGroup = new THREE.Group();
        const sideOffset = (stepIndex % 8 === 2 ? 0.9 : -0.9);
        const normDir = new THREE.Vector2(-dir.y, dir.x);
        const mx = currentX + normDir.x * sideOffset;
        const mz = currentZ + normDir.y * sideOffset;
        const my = getTerrainHeight(mx, mz);
        markerGroup.position.set(mx, my, mz);

        if (zone.id === 'knowledge-library') {
          // Warm amber mini-lamp
          const postGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 5);
          const post = new THREE.Mesh(postGeo, darkSlateMat);
          post.position.y = 0.4;
          markerGroup.add(post);

          const lampGeo = new THREE.DodecahedronGeometry(0.12, 0);
          const lampMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 0.8,
            roughness: 0.2,
          });
          const lamp = new THREE.Mesh(lampGeo, lampMat);
          lamp.position.y = 0.8;
          markerGroup.add(lamp);
        } else if (zone.id === 'project-arcade') {
          // Small blue digital marker stud
          const studGeo = new THREE.BoxGeometry(0.18, 0.25, 0.18);
          const studMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 0.6,
          });
          const stud = new THREE.Mesh(studGeo, studMat);
          stud.position.y = 0.12;
          markerGroup.add(stud);
        } else if (zone.id === 'creative-park') {
          // Small floral accent / glowing sprout
          const sproutGeo = new THREE.ConeGeometry(0.12, 0.35, 5);
          const sproutMat = new THREE.MeshStandardMaterial({
            color: 0xec4899,
            emissive: 0xdb2777,
            emissiveIntensity: 0.5,
          });
          const sprout = new THREE.Mesh(sproutGeo, sproutMat);
          sprout.position.y = 0.18;
          markerGroup.add(sprout);
        } else if (zone.id === 'contact-station') {
          // Blue communication beacon
          const beaconGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.5, 6);
          const beaconMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.7,
          });
          const bMesh = new THREE.Mesh(beaconGeo, beaconMat);
          bMesh.position.y = 0.25;
          markerGroup.add(bMesh);
        }

        group.add(markerGroup);
      }
    }
  });

  return group;
}
