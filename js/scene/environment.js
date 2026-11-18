import * as THREE from 'https://esm.sh/three@0.170.0';
import { getGroundMaterial } from './textures.js';

const TREE_COORDS = [
  [-14, -9], [-11, -12], [13, -10], [15, -6], [-16, 4], [16, 5], [0, -14],
  [-18, -14], [-6, -16], [6, -16], [19, -13], [-21, -3], [21, -2],
  [-19, 10], [19, 11], [-12, 13], [13, 13], [-24, -10], [24, -8],
  [-3, -21], [9, -20], [-15, -19], [16, -19],
  [-26, 2], [26, 3], [-23, 15], [23, 15], [-8, 17], [8, 17],
  [-28, -18], [28, -17], [-1, -26], [-11, -25], [12, -24],
  [-20, -23], [21, -22], [-29, 9], [29, 10]
];

const BUSH_COORDS = [
  [-12.5, -7.2], [-9.4, -10.5], [11.2, -8.5], [13.8, -4.4],
  [-13.5, 2.8], [13.5, 3.6], [-8.8, 8.8], [9.5, 9.2],
  [-2.5, -12.5], [3.8, -13.2], [-16.8, -1.5], [17.2, 0.8],
  [-15.2, 8.4], [15.6, 8.8], [-5.2, 13.4], [5.8, 13.2]
];

const ROCK_COORDS = [
  [-12, 6], [12, 7], [-9, -8], [10, -8],
  [-14.5, -2.5], [14.8, -1.8], [-7.2, -13.2], [7.8, -12.4],
  [-17.2, 7.5], [16.5, 8.2], [-4.5, 11.8], [5.2, 11.5],
  [-10.5, 10.2], [11.4, -12.8], [-19.5, -6.5], [19.8, -5.2],
  [-1.5, -16.5], [2.4, 15.2]
];

const LOG_COORDS = [
  [-11.8, 3.8, 0.45],
  [11.6, 4.5, -0.6],
  [-6.5, -11.4, 1.15],
  [7.4, -10.8, -0.95],
  [1.2, 12.6, 0.15],
  [-15.4, -5.8, 0.85]
];

export function createGroundBody(world, RAPIER) {
  const groundBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.25, 0)
  );
  const groundCol = RAPIER.ColliderDesc.cuboid(35, 0.25, 35)
    .setFriction(1.2)
    .setRestitution(0.05);
  world.createCollider(groundCol, groundBody);
  return groundBody;
}

export function buildClearingEnvironment(scene, world, RAPIER) {
  const groundGeo = new THREE.PlaneGeometry(70, 70);
  const groundMesh = new THREE.Mesh(groundGeo, getGroundMaterial());
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
  createGroundBody(world, RAPIER);

  const staticProps = [groundMesh];
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a3525', roughness: 0.9 });
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: '#1a2e23', roughness: 0.86 }),
    new THREE.MeshStandardMaterial({ color: '#1f3328', roughness: 0.84 }),
    new THREE.MeshStandardMaterial({ color: '#263d2f', roughness: 0.85 })
  ];
  const shrubMat = new THREE.MeshStandardMaterial({ color: '#243a2b', roughness: 0.9 });
  const rockMat = new THREE.MeshStandardMaterial({ color: '#3b4148', roughness: 0.92 });
  const logMat = new THREE.MeshStandardMaterial({ color: '#543c2a', roughness: 0.92 });

  const trunkGeoHi = new THREE.CylinderGeometry(0.15, 0.24, 1.9, 7);
  const coneLowHi = new THREE.ConeGeometry(1.22, 2.2, 7);
  const coneTopHi = new THREE.ConeGeometry(0.86, 1.9, 7);
  const trunkGeoMed = new THREE.CylinderGeometry(0.15, 0.22, 1.9, 5);
  const coneMed = new THREE.ConeGeometry(1.2, 3.1, 5);
  const coneFar = new THREE.ConeGeometry(1.15, 3.4, 4);

  TREE_COORDS.forEach(([tx, tz], idx) => {
    const scale = 0.8 + (idx % 4) * 0.22;
    const mat = leafMats[idx % leafMats.length];
    const lod = new THREE.LOD();
    lod.position.set(tx, 0.02, tz);
    lod.scale.setScalar(scale);

    const hiGroup = new THREE.Group();
    const trunkHi = new THREE.Mesh(trunkGeoHi, trunkMat);
    trunkHi.position.y = 0.95;
    trunkHi.castShadow = true;
    trunkHi.receiveShadow = true;

    const lowerCrown = new THREE.Mesh(coneLowHi, mat);
    lowerCrown.position.y = 2.25;
    lowerCrown.rotation.y = idx * 0.6;
    lowerCrown.castShadow = true;
    lowerCrown.receiveShadow = true;

    const upperCrown = new THREE.Mesh(coneTopHi, mat);
    upperCrown.position.y = 3.45;
    upperCrown.rotation.y = idx * 0.9 + 0.4;
    upperCrown.castShadow = true;
    upperCrown.receiveShadow = true;

    hiGroup.add(trunkHi, lowerCrown, upperCrown);
    lod.addLevel(hiGroup, 0);

    const medGroup = new THREE.Group();
    const trunkMed = new THREE.Mesh(trunkGeoMed, trunkMat);
    trunkMed.position.y = 0.95;
    const crownMed = new THREE.Mesh(coneMed, mat);
    crownMed.position.y = 2.75;
    medGroup.add(trunkMed, crownMed);
    lod.addLevel(medGroup, 24);

    const farGroup = new THREE.Group();
    const trunkFar = new THREE.Mesh(trunkGeoMed, trunkMat);
    trunkFar.position.y = 0.95;
    const farMesh = new THREE.Mesh(coneFar, mat);
    farMesh.position.y = 2.6;
    farGroup.add(trunkFar, farMesh);
    lod.addLevel(farGroup, 38);

    scene.add(lod);
    staticProps.push(lod);
  });

  const bushPuffGeo = new THREE.IcosahedronGeometry(0.4, 0);
  BUSH_COORDS.forEach(([bx, bz], idx) => {
    const baseScale = 0.65 + (idx % 3) * 0.18;
    const lod = new THREE.LOD();
    lod.position.set(bx, 0, bz);
    lod.scale.setScalar(baseScale);

    const hiGroup = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const puffScale = 1 - k * 0.14;
      const puff = new THREE.Mesh(bushPuffGeo, shrubMat);
      const angle = k * 2.1 + idx;
      puff.scale.setScalar(puffScale);
      puff.position.set(
        Math.cos(angle) * 0.28,
        0.28 * puffScale,
        Math.sin(angle) * 0.28
      );
      puff.rotation.set(idx, k, 0.3);
      puff.castShadow = true;
      puff.receiveShadow = true;
      hiGroup.add(puff);
    }
    lod.addLevel(hiGroup, 0);

    const lowPuff = new THREE.Mesh(bushPuffGeo, shrubMat);
    lowPuff.position.y = 0.28;
    lowPuff.scale.set(1.25, 0.85, 1.25);
    lod.addLevel(lowPuff, 22);

    scene.add(lod);
    staticProps.push(lod);
  });

  ROCK_COORDS.forEach(([rx, rz], idx) => {
    const size = 0.38 + (idx % 3) * 0.2;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat);
    rock.position.set(rx, size * 0.55, rz);
    rock.scale.set(1 + (idx % 2) * 0.25, 0.78, 1);
    rock.rotation.set(idx, idx * 0.7, 0);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    staticProps.push(rock);
  });

  LOG_COORDS.forEach(([lx, lz, rotY], idx) => {
    const length = 1.6 + (idx % 2) * 0.5;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, length, 7), logMat);
    log.position.set(lx, 0.14, lz);
    log.rotation.set(Math.PI / 2, 0, rotY);
    log.castShadow = true;
    log.receiveShadow = true;
    scene.add(log);
    staticProps.push(log);
  });

  return staticProps;
}

export class RainSystem {
  constructor(scene, count = 1100) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: '#93c5fd',
      size: 0.09,
      transparent: true,
      opacity: 0
    });
    this.points = new THREE.Points(geo, mat);
    scene.add(this.points);
  }

  setOpacity(opacity) {
    this.points.material.opacity = opacity;
  }

  step(dt, stormIntensity, windDir, vortexX, vortexZ) {
    const posAttr = this.points.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const pz = posAttr.getZ(i);
      const rx = px - vortexX;
      const rz = pz - vortexZ;
      const rDist = Math.max(1.2, Math.hypot(rx, rz));
      const swirlSpd = (11.0 * stormIntensity) / Math.max(1.5, rDist * 0.35);
      let x = px + (windDir.x * 12 + (-rz / rDist) * swirlSpd) * dt;
      let y = posAttr.getY(i) - (18 + stormIntensity * 12) * dt;
      let z = pz + (windDir.z * 12 + (rx / rDist) * swirlSpd) * dt;
      if (y < 0) {
        y = 18 + Math.random() * 4;
        x = (Math.random() - 0.5) * 36;
        z = (Math.random() - 0.5) * 28;
      }
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}

export class DustSystem {
  constructor(scene, maxDust = 520) {
    this.maxDust = maxDust;
    this.slots = Array.from({ length: maxDust }, () => ({
      active: false,
      x: 0,
      y: -999,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      age: 0,
      maxLife: 4.5
    }));
    const positions = new Float32Array(maxDust * 3);
    const colors = new Float32Array(maxDust * 3);
    for (let i = 0; i < maxDust; i++) {
      positions[i * 3 + 1] = -999;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  spawn(x, y, z, count = 22) {
    let spawned = 0;
    for (let i = 0; i < this.maxDust && spawned < count; i++) {
      const p = this.slots[i];
      if (p.active) continue;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 0.9;
      p.y = Math.max(0.15, y + (Math.random() - 0.5) * 0.7);
      p.z = z + (Math.random() - 0.5) * 0.9;
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.8 + Math.random() * 2.4;
      p.vx = Math.cos(angle) * spd;
      p.vy = 0.6 + Math.random() * 2.0;
      p.vz = Math.sin(angle) * spd;
      p.age = 0;
      p.maxLife = 3.2 + Math.random() * 2.6;
      spawned++;
    }
  }

  update(dt, simTime) {
    const posAttr = this.points.geometry.attributes.position;
    const colAttr = this.points.geometry.attributes.color;
    const bgR = 0.071;
    const bgG = 0.086;
    const bgB = 0.098;
    const dustR = 0.66;
    const dustG = 0.70;
    const dustB = 0.74;

    for (let i = 0; i < this.maxDust; i++) {
      const p = this.slots[i];
      if (!p.active) continue;

      p.age += dt;
      if (p.age >= p.maxLife) {
        p.active = false;
        posAttr.setXYZ(i, 0, -999, 0);
        colAttr.setXYZ(i, bgR, bgG, bgB);
        continue;
      }

      p.vx += (Math.sin(simTime * 2.0 + i) * 0.65 - p.vx * 0.75) * dt;
      p.vz += (Math.cos(simTime * 1.8 + i) * 0.65 - p.vz * 0.75) * dt;
      p.vy -= 1.25 * dt;
      p.x += p.vx * dt;
      p.y = Math.max(0.08, p.y + p.vy * dt);
      p.z += p.vz * dt;
      if (p.y <= 0.09 && p.vy < 0) {
        p.vy *= -0.15;
        p.vx *= 0.82;
        p.vz *= 0.82;
      }

      const fade = Math.max(0, 1 - p.age / p.maxLife);
      posAttr.setXYZ(i, p.x, p.y, p.z);
      colAttr.setXYZ(
        i,
        bgR + (dustR - bgR) * fade,
        bgG + (dustG - bgG) * fade,
        bgB + (dustB - bgB) * fade
      );
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
