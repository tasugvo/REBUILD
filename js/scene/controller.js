import * as THREE from 'https://esm.sh/three@0.170.0';
import { OrbitControls } from 'https://esm.sh/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import RAPIER from 'https://esm.sh/@dimforge/rapier3d-compat@0.12.0';
import { PALETTE } from '../config/content.js';
import { buildClearingEnvironment, createGroundBody, DustSystem, RainSystem } from './environment.js';
import { buildConcreteHouse, buildWoodenCabin } from './structures.js';
import { disposeCachedMaterials, getConcreteMaterials, getWoodMaterial } from './textures.js';

export class Scene3DController {
  constructor({ canvas, sound, callbacks }) {
    this.canvas = canvas;
    this.sound = sound;
    this.callbacks = callbacks;

    this.phase = 'observe'; // 'observe' | 'storm' | 'recovery' | 'rebuild'
    this.stormIntensity = 0.78;
    this.stormDuration = 8.0;
    this.stormElapsed = 0;
    this.stormCompleted = false;
    this.initialized = false;
    this.destroyed = false;
    this.rafId = 0;

    this.simTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1 / 60;
    this.targetFps = 30;
    this.frameIntervalMs = 1000 / this.targetFps;
    this.lastFrameTime = performance.now();
    this.lightningTimer = 2.5;
    this.lightningIntensity = 0;
    this.lastWindAudioAt = -10;
    this.lastCrackAudioAt = -10;
    this.lastCollapseAudioAt = -10;

    this.dynamicBodies = [];
    this.joints = [];
    this.staticProps = [];
    this.recoveredPieces = [];
    this.placedRebuildPieces = [];
    this.woodBlueprint = new Map();
    this.woodCenter = null;
    this.pieceAnimations = [];
    this.rebuildPlacedIds = new Set();
    this.selectedRebuildPiece = null;
    this.isDraggingPiece = false;

    this.raycaster = new THREE.Raycaster();
    this.pointerNDC = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.0);
    this.dragOffset = new THREE.Vector3();

    this.initialCameraPos = new THREE.Vector3(0, 7.6, 18.8);
    this.initialTarget = new THREE.Vector3(0, 1.8, 0);

    this._tmpPos = new THREE.Vector3();
    this._tmpQuat = new THREE.Quaternion();
    this._animPos = new THREE.Vector3();
    this._animQuat = new THREE.Quaternion();
    this._windDir = new THREE.Vector3(0.76, 0.1, 0.64).normalize();
    this._listeners = [];
  }

  async init() {
    if (this.initialized || this.destroyed) return;
    await RAPIER.init();
    this.RAPIER = RAPIER;
    this.world = new RAPIER.World({ x: 0.0, y: -20.0, z: 0.0 });

    this.setupRendererAndScene();
    this.setupLighting();
    this.staticProps = buildClearingEnvironment(this.scene, this.world, this.RAPIER);
    this.rain = new RainSystem(this.scene);
    this.dust = new DustSystem(this.scene);
    this.buildInitialHouses();
    this.bindEvents();
    this.lastFrameTime = performance.now();
    this.initialized = true;
    this.startLoop();
  }

  setupRendererAndScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.baseBg);
    this.scene.fog = new THREE.FogExp2(PALETTE.baseBg, 0.016);

    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.4, 160);
    this.camera.position.copy(this.initialCameraPos);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.copy(this.initialTarget);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 32;
    this.controls.minPolarAngle = 0.18;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.update();

    this.cameraResetAnim = null;
    this.controls.addEventListener('start', () => {
      if (this.cameraResetAnim) this.cameraResetAnim.active = false;
    });
  }

  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight('#c7d2fe', '#1f2428', 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight('#fff7ed', 2.0);
    this.dirLight.position.set(12, 18, 11);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(2048, 2048);
    this.dirLight.shadow.camera.near = 2;
    this.dirLight.shadow.camera.far = 55;
    this.dirLight.shadow.camera.left = -16;
    this.dirLight.shadow.camera.right = 16;
    this.dirLight.shadow.camera.top = 14;
    this.dirLight.shadow.camera.bottom = -14;
    this.dirLight.shadow.bias = -0.0006;
    this.dirLight.shadow.normalBias = 0.025;
    this.scene.add(this.dirLight);

    this.lightningLight = new THREE.PointLight('#bae6fd', 0, 80);
    this.lightningLight.position.set(0, 22, 6);
    this.scene.add(this.lightningLight);

    this.warmLight = new THREE.PointLight('#f59e0b', 0, 24);
    this.warmLight.position.set(0, 4.5, 2.5);
    this.scene.add(this.warmLight);
  }

  createBoxPiece({
    id,
    kind,
    dims,
    pos,
    rot = [0, 0, 0],
    material,
    isFixed = false,
    density = 1.0,
    friction = 0.75,
    restitution = 0.15,
    variant = 'warm',
    memory = '',
    isNewGolden = false
  }) {
    if (kind === 'wood' && this.woodCenter && !this.woodBlueprint.has(id)) {
      this.woodBlueprint.set(id, {
        id,
        dims: [...dims],
        localPos: [pos[0] - this.woodCenter.cx, pos[1], pos[2] - this.woodCenter.cz],
        rot: [...rot],
        variant
      });
    }

    const [w, h, d] = dims;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    this.scene.add(mesh);

    const bodyDesc = isFixed
      ? this.RAPIER.RigidBodyDesc.fixed()
      : this.RAPIER.RigidBodyDesc.dynamic();
    bodyDesc.setTranslation(pos[0], pos[1], pos[2]);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
    bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    bodyDesc.setLinearDamping(0.25);
    bodyDesc.setAngularDamping(0.35);

    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = this.RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2)
      .setDensity(density)
      .setFriction(friction)
      .setRestitution(restitution);
    const collider = this.world.createCollider(colliderDesc, body);

    const entry = {
      id,
      kind,
      mesh,
      body,
      collider,
      dims,
      variant,
      memory,
      isNewGolden,
      isFixed,
      alive: true,
      originX: pos[0],
      originZ: pos[2],
      condition: 'preservada',
      damage: 0,
      fragmented: false,
      collected: false,
      prevPos: new THREE.Vector3(pos[0], pos[1], pos[2]),
      prevQuat: q.clone()
    };
    mesh.userData.pieceEntry = entry;
    this.dynamicBodies.push(entry);
    return entry;
  }

  linkPieces(pieceA, pieceB, breakThreshold = 14) {
    const posA = pieceA.body.translation();
    const posB = pieceB.body.translation();
    const qA = pieceA.body.rotation();
    const qB = pieceB.body.rotation();

    const invQA = new THREE.Quaternion(qA.x, qA.y, qA.z, qA.w).invert();
    const quatB = new THREE.Quaternion(qB.x, qB.y, qB.z, qB.w);
    const relQ = invQA.clone().multiply(quatB);

    const mid = new THREE.Vector3(
      (posA.x + posB.x) / 2,
      (posA.y + posB.y) / 2,
      (posA.z + posB.z) / 2
    );

    const localA = mid.clone().sub(new THREE.Vector3(posA.x, posA.y, posA.z)).applyQuaternion(invQA);
    const invQB = quatB.clone().invert();
    const localB = mid.clone().sub(new THREE.Vector3(posB.x, posB.y, posB.z)).applyQuaternion(invQB);

    const params = this.RAPIER.JointData.fixed(
      { x: localA.x, y: localA.y, z: localA.z },
      { x: relQ.x, y: relQ.y, z: relQ.z, w: relQ.w },
      { x: localB.x, y: localB.y, z: localB.z },
      { x: 0, y: 0, z: 0, w: 1 }
    );
    const handle = this.world.createImpulseJoint(params, pieceA.body, pieceB.body, true);
    this.joints.push({
      handle,
      pieceA,
      pieceB,
      breakThreshold,
      stress: 0,
      broken: false
    });
  }

  buildInitialHouses() {
    buildConcreteHouse(this, -5.2, 0);
    buildWoodenCabin(this, 5.2, 0);
  }

  resetCamera() {
    if (!this.camera || !this.controls) return;
    this.cameraResetAnim = {
      active: true,
      elapsed: 0,
      duration: 0.95,
      startPos: this.camera.position.clone(),
      startTarget: this.controls.target.clone(),
      endPos: this.initialCameraPos.clone(),
      endTarget: this.initialTarget.clone()
    };
  }

  setStormIntensity(val) {
    this.stormIntensity = Math.max(0.1, Math.min(1, val));
  }

  startStorm() {
    this.phase = 'storm';
    this.stormElapsed = 0;
    this.stormCompleted = false;
    this.callbacks.onStormTick?.(this.stormDuration);
    this.dirLight.color.set('#93c5fd');
    this.dirLight.intensity = 1.1;
    this.hemiLight.intensity = 0.45;
    this.scene.fog.density = 0.028;
    this.rain.setOpacity(0.65);
    this.sound.playWind();
    this.lastWindAudioAt = this.simTime;
  }

  enterRecovery() {
    this.phase = 'recovery';
    this.rain.setOpacity(0);
    this.lightningLight.intensity = 0;
    this.dirLight.color.set('#e2e8f0');
    this.dirLight.intensity = 1.65;
    this.hemiLight.intensity = 0.78;
    this.scene.fog.density = 0.014;

    const leftoverConcrete = this.dynamicBodies.filter(
      (p) => p.kind === 'concrete' && !p.isFixed && p.alive && !p.fragmented
    );
    leftoverConcrete.forEach((p) => this.fragmentConcreteBlock(p));

    this.dynamicBodies.forEach((p) => {
      if (!p.isFixed && p.alive) {
        try {
          p.body.resetForces(false);
          p.body.resetTorques(false);
        } catch {
          // Body already inactive.
        }
      }
    });

    const woodPieces = this.dynamicBodies.filter((p) => p.kind === 'wood' && !p.collected);
    woodPieces.forEach((p, idx) => {
      if (idx % 6 === 5 && p.damage > 0.3) {
        p.condition = 'inutilizavel';
        p.mesh.material = getWoodMaterial(p.variant, true);
      } else if (p.damage > 0.45) {
        p.condition = 'danificada';
        p.mesh.material = getWoodMaterial(p.variant, true);
      } else {
        p.condition = 'preservada';
      }
    });
  }

  enterRebuild() {
    this.phase = 'rebuild';
    this.joints = [];
    this.pieceAnimations = [];
    this.rebuildPlacedIds = new Set();
    this.placedRebuildPieces = [];
    this.selectedRebuildPiece = null;
    this.isDraggingPiece = false;

    this.dynamicBodies.forEach((entry) => {
      this.scene.remove(entry.mesh);
      entry.mesh.geometry.dispose();
    });
    this.dynamicBodies = [];

    this.world = new this.RAPIER.World({ x: 0.0, y: -20.0, z: 0.0 });
    createGroundBody(this.world, this.RAPIER);

    this.dirLight.color.set('#fde68a');
    this.dirLight.intensity = 2.2;
    this.hemiLight.color.set('#fef3c7');
    this.hemiLight.intensity = 0.95;
    this.warmLight.intensity = 3.2;
    this.scene.fog.density = 0.01;

    this.createBoxPiece({
      id: 'rebuild-foundation',
      kind: 'rebuild-base',
      dims: [4.35, 0.24, 3.95],
      pos: [0, 0.12, 0],
      material: getWoodMaterial('dark'),
      isFixed: true
    });

    this.initialCameraPos.set(-1.35, 5.4, 13.0);
    this.initialTarget.set(-1.35, 1.85, 0);
    this.camera.position.copy(this.initialCameraPos);
    this.controls.target.copy(this.initialTarget);
    this.controls.update();
  }

  placeBlueprintPieces(pieceIds) {
    if (!Array.isArray(pieceIds) || pieceIds.length === 0) return 0;
    let newlyPlaced = 0;

    pieceIds.forEach((pieceId, idx) => {
      if (this.rebuildPlacedIds.has(pieceId)) return;
      const spec = this.woodBlueprint.get(pieceId);
      if (!spec) return;

      this.rebuildPlacedIds.add(pieceId);
      newlyPlaced++;

      const targetPos = new THREE.Vector3(spec.localPos[0], spec.localPos[1], spec.localPos[2]);
      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(spec.rot[0], spec.rot[1], spec.rot[2])
      );

      const startPos = new THREE.Vector3(
        targetPos.x * 1.25 + (idx % 2 === 0 ? -0.45 : 0.45),
        targetPos.y + 2.2,
        targetPos.z + 1.35
      );
      const startQuat = targetQuat.clone().multiply(
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, idx % 2 === 0 ? -0.35 : 0.35, 0.18))
      );

      const piece = this.createBoxPiece({
        id: `rebuilt-${spec.id}`,
        kind: 'rebuild-piece',
        dims: spec.dims,
        pos: [startPos.x, startPos.y, startPos.z],
        rot: spec.rot,
        material: getWoodMaterial(spec.variant, false),
        variant: spec.variant,
        isFixed: true
      });
      piece.body.setRotation({ x: startQuat.x, y: startQuat.y, z: startQuat.z, w: startQuat.w }, true);
      piece.mesh.position.copy(startPos);
      piece.mesh.quaternion.copy(startQuat);
      piece.prevPos.copy(startPos);
      piece.prevQuat.copy(startQuat);

      this.placedRebuildPieces.push(piece);
      this.pieceAnimations.push({
        entry: piece,
        startPos,
        targetPos,
        startQuat,
        targetQuat,
        elapsed: 0,
        duration: 0.62
      });
    });

    if (newlyPlaced > 0) {
      this.sound.playWarmChime(0.95 + Math.min(0.45, this.rebuildPlacedIds.size * 0.02));
    }
    return newlyPlaced;
  }

  removeJointSafe(j) {
    if (!j || j.broken) return;
    j.broken = true;
    try {
      if (j.handle) {
        this.world.removeImpulseJoint(j.handle, true);
      }
    } catch {
      // Joint handle already freed by Rapier.
    }
  }

  fragmentConcreteBlock(entry) {
    if (!entry || !entry.alive || entry.fragmented || entry.kind !== 'concrete' || entry.isFixed) return;
    entry.fragmented = true;
    entry.alive = false;

    const pos = entry.body.translation();
    const vel = entry.body.linvel();
    const [w, h, d] = entry.dims;

    for (const j of this.joints) {
      if (!j.broken && (j.pieceA === entry || j.pieceB === entry)) {
        this.removeJointSafe(j);
      }
    }
    this.joints = this.joints.filter((j) => !j.broken);

    entry.mesh.visible = false;
    entry.collider.setCollisionGroups(0);
    entry.body.resetForces(false);
    entry.body.resetTorques(false);
    entry.body.setGravityScale(0, false);
    entry.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
    entry.body.setAngvel({ x: 0, y: 0, z: 0 }, false);

    if (this.simTime - this.lastCollapseAudioAt > 0.45) {
      this.sound.playCollapse();
      this.lastCollapseAudioAt = this.simTime;
    } else if (this.simTime - this.lastCrackAudioAt > 0.16) {
      this.sound.playCrack(0.85);
      this.lastCrackAudioAt = this.simTime;
    }

    if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) return;

    this.dust.spawn(pos.x, Math.max(0.25, pos.y), pos.z, 22);

    const currentRubble = this.dynamicBodies.filter((b) => b.kind === 'rubble' && b.alive).length;
    if (currentRubble >= 90) return;
    const grainCount = Math.min(6, 90 - currentRubble);
    const mats = getConcreteMaterials();

    const offsets = [
      [-0.25, -0.15, -0.2],
      [0.25, -0.15, 0.2],
      [-0.2, 0.2, 0.22],
      [0.22, 0.2, -0.22],
      [0, 0.05, 0],
      [-0.12, 0.12, -0.14]
    ];

    for (let i = 0; i < grainCount; i++) {
      const r = 0.06 + Math.random() * 0.055;
      const [ox, oy, oz] = offsets[i % offsets.length];

      const geo = new THREE.DodecahedronGeometry(r, 0);
      const mesh = new THREE.Mesh(geo, mats.cracked);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const gx = pos.x + ox * Math.min(1.2, w);
      const gy = Math.max(0.18, pos.y + oy * Math.min(1.2, h));
      const gz = pos.z + oz * Math.min(1.2, d);
      mesh.position.set(gx, gy, gz);
      this.scene.add(mesh);

      const bodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(gx, gy, gz)
        .setLinearDamping(0.85)
        .setAngularDamping(0.9);
      const body = this.world.createRigidBody(bodyDesc);
      const colliderDesc = this.RAPIER.ColliderDesc.cuboid(r * 0.85, r * 0.85, r * 0.85)
        .setDensity(1.9)
        .setFriction(1.35)
        .setRestitution(0.02);
      const collider = this.world.createCollider(colliderDesc, body);

      body.setLinvel(
        {
          x: vel.x * 0.25 + (Math.random() - 0.5) * 1.4,
          y: vel.y * 0.2 + Math.random() * 0.6,
          z: vel.z * 0.25 + (Math.random() - 0.5) * 1.4
        },
        true
      );

      this.dynamicBodies.push({
        id: `${entry.id}-sand-${i}`,
        kind: 'rubble',
        mesh,
        body,
        collider,
        dims: [r * 2, r * 2, r * 2],
        variant: 'concrete',
        memory: '',
        isNewGolden: false,
        isFixed: false,
        alive: true,
        originX: entry.originX,
        originZ: entry.originZ,
        condition: 'inutilizavel',
        damage: 1,
        fragmented: true,
        collected: false,
        dustAge: 0,
        dustLife: 5.5 + Math.random() * 3.0,
        prevPos: new THREE.Vector3(gx, gy, gz),
        prevQuat: new THREE.Quaternion()
      });
    }
  }

  stepStormPhysics(dt) {
    const gust = 0.7 + 0.55 * Math.sin(this.simTime * 2.1) + 0.35 * Math.cos(this.simTime * 4.7);
    const windStrength = this.stormIntensity * 24 * Math.max(0.25, gust);
    const windDir = this._windDir;

    if (this.simTime - this.lastWindAudioAt > 2.2) {
      this.sound.playWind();
      this.lastWindAudioAt = this.simTime;
    }

    const vx1 = Math.cos(this.simTime * 0.95) * 6.5;
    const vz1 = Math.sin(this.simTime * 0.75) * 4.2;
    const vx2 = Math.cos(this.simTime * 0.7 + Math.PI) * 5.5;
    const vz2 = Math.sin(this.simTime * 1.05 + 1.2) * 4.5;

    this.dynamicBodies.forEach((entry) => {
      if (!entry.alive || entry.isFixed || entry.collected) return;
      entry.body.resetForces(false);
      entry.body.resetTorques(false);

      const t = entry.body.translation();
      if (!Number.isFinite(t.x) || !Number.isFinite(t.y) || !Number.isFinite(t.z)) return;
      const [w, h, d] = entry.dims;
      const area = w * h + h * d + w * d * 0.35;
      const heightFactor = t.y > 0.75 ? 1.0 : 0.08;
      const forceMag = Math.min(45, windStrength * area * heightFactor * (entry.kind === 'wood' ? 0.95 : 0.75));

      if (entry.kind === 'wood') {
        const d1 = Math.hypot(t.x - vx1, t.z - vz1);
        const d2 = Math.hypot(t.x - vx2, t.z - vz2);
        const vx = d1 <= d2 ? vx1 : vx2;
        const vz = d1 <= d2 ? vz1 : vz2;
        const rx = t.x - vx;
        const rz = t.z - vz;
        const rDist = Math.max(0.6, Math.hypot(rx, rz));
        const tangX = -rz / rDist;
        const tangZ = rx / rDist;
        const swirlFalloff = Math.max(0.35, 1.35 - rDist / 12.0);
        const swirlForce = this.stormIntensity * (15 + 11 * swirlFalloff) * Math.max(0.25, area);
        const radialPull = rDist > 3.2 ? -1.4 : 1.1;
        const lift = t.y < 1.8
          ? (0.25 + 0.35 * Math.sin(this.simTime * 3.2 + t.x)) * swirlForce * 0.24
          : -swirlForce * 0.55;

        entry.body.addForce(
          {
            x: windDir.x * forceMag * 0.5 + tangX * swirlForce + (rx / rDist) * swirlForce * 0.28 * radialPull,
            y: lift,
            z: windDir.z * forceMag * 0.5 + tangZ * swirlForce + (rz / rDist) * swirlForce * 0.28 * radialPull
          },
          true
        );

        entry.body.addTorque(
          {
            x: Math.sin(this.simTime * 3.0 + t.z) * swirlForce * 0.05,
            y: 0.07 * swirlForce,
            z: Math.cos(this.simTime * 2.8 + t.x) * swirlForce * 0.05
          },
          true
        );

        const av = entry.body.angvel();
        const angSpeed = Math.hypot(av.x, av.y, av.z);
        if (angSpeed > 4.0) {
          const as = 4.0 / angSpeed;
          entry.body.setAngvel({ x: av.x * as, y: av.y * as, z: av.z * as }, true);
        }
      } else if (entry.kind !== 'rubble') {
        entry.body.addForce(
          {
            x: windDir.x * forceMag,
            y: windDir.y * forceMag * 0.4,
            z: windDir.z * forceMag
          },
          true
        );
        if (t.y > 0.75) {
          entry.body.addTorque(
            {
              x: (Math.random() - 0.5) * forceMag * 0.22,
              y: (Math.random() - 0.5) * forceMag * 0.25,
              z: (Math.random() - 0.5) * forceMag * 0.22
            },
            true
          );
        }
      }

      const v = entry.body.linvel();
      const speed = Math.hypot(v.x, v.y, v.z);
      if (speed > 16) {
        const s = 16 / speed;
        entry.body.setLinvel({ x: v.x * s, y: v.y * s, z: v.z * s }, true);
      }

      if (entry.kind === 'wood') {
        const maxX = 12.5;
        const maxZ = 9.0;
        const maxY = 2.8;
        if (v.y > 2.6) {
          entry.body.setLinvel({ x: v.x, y: 2.6, z: v.z }, true);
        }
        if (Math.abs(t.x) > maxX || Math.abs(t.z) > maxZ || t.y > maxY) {
          const pullX = Math.abs(t.x) > maxX ? -Math.sign(t.x) * (Math.abs(t.x) - maxX) * 26 : 0;
          const pullZ = Math.abs(t.z) > maxZ ? -Math.sign(t.z) * (Math.abs(t.z) - maxZ) * 26 : 0;
          const pullY = t.y > maxY ? -(t.y - maxY) * 34 : 0;
          entry.body.addForce({ x: pullX, y: pullY, z: pullZ }, true);
          entry.body.setLinvel({ x: v.x * 0.82, y: Math.min(v.y, 0.5), z: v.z * 0.82 }, true);
        }
      } else {
        const dx = t.x - entry.originX;
        const dz = t.z - entry.originZ;
        const maxRadius = entry.kind === 'rubble' ? 3.2 : 4.2;
        const dist = Math.hypot(dx, dz);
        if (dist > maxRadius) {
          const pull = Math.min(60, (dist - maxRadius) * 20);
          entry.body.addForce({ x: -(dx / dist) * pull, y: 0, z: -(dz / dist) * pull }, true);
          const cv = entry.body.linvel();
          entry.body.setLinvel({ x: cv.x * 0.78, y: cv.y, z: cv.z * 0.78 }, true);
        }
      }
    });

    const mats = getConcreteMaterials();
    const toFragment = [];
    this.joints.forEach((j) => {
      if (
        j.broken ||
        j.pieceA.fragmented ||
        j.pieceB.fragmented ||
        j.pieceA.collected ||
        j.pieceB.collected
      ) {
        j.broken = true;
        return;
      }
      const vA = j.pieceA.body.linvel();
      const vB = j.pieceB.body.linvel();
      const relSpeed = Math.hypot(vA.x - vB.x, vA.y - vB.y, vA.z - vB.z);
      j.stress += (windStrength * 0.22 + relSpeed * 6.5) * dt;

      if (j.stress > j.breakThreshold) {
        this.removeJointSafe(j);
        j.pieceA.damage += 0.4;
        j.pieceB.damage += 0.4;

        if (j.pieceB.kind === 'concrete' && !j.pieceB.isFixed) {
          j.pieceB.mesh.material = mats.cracked;
          j.pieceB.body.setLinearDamping(0.65);
          if (j.pieceB.damage >= 0.4) {
            toFragment.push(j.pieceB);
          }
        } else if (j.pieceB.kind === 'wood') {
          j.pieceB.body.setLinearDamping(0.32);
          j.pieceB.body.setAngularDamping(0.72);
        }
      }
    });

    if (toFragment.length > 0) {
      toFragment.forEach((b) => this.fragmentConcreteBlock(b));
    }
    this.joints = this.joints.filter((j) => !j.broken);

    this.rain.step(dt, this.stormIntensity, windDir, vx1, vz1);

    this.lightningTimer -= dt;
    if (this.lightningTimer <= 0) {
      this.lightningIntensity = 9.0 * this.stormIntensity;
      this.lightningTimer = 2.6 + Math.random() * 3.8;
      this.sound.playThunder();
    }
    this.lightningIntensity = Math.max(0, this.lightningIntensity - dt * 24);
    this.lightningLight.intensity = this.lightningIntensity;
  }

  updateRubbleDecay(dt) {
    for (const entry of this.dynamicBodies) {
      if (!entry.alive || entry.kind !== 'rubble' || entry.dustLife == null) continue;
      entry.dustAge += dt;
      const remaining = entry.dustLife - entry.dustAge;
      if (remaining <= 0) {
        entry.alive = false;
        entry.mesh.visible = false;
        try {
          entry.collider.setCollisionGroups(0);
          entry.body.setGravityScale(0, false);
          entry.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
          entry.body.setAngvel({ x: 0, y: 0, z: 0 }, false);
        } catch {
          // Body already disabled.
        }
      } else if (remaining < 1.5) {
        entry.mesh.scale.setScalar(Math.max(0.01, remaining / 1.5));
      }
    }
  }

  updatePointerNDC(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    this.pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  addListener(target, type, handler) {
    target.addEventListener(type, handler);
    this._listeners.push({ target, type, handler });
  }

  bindEvents() {
    this.addListener(window, 'resize', () => {
      if (this.destroyed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    this.addListener(this.canvas, 'pointerdown', (e) => {
      if (this.phase !== 'rebuild') return;
      this.updatePointerNDC(e);
      this.raycaster.setFromCamera(this.pointerNDC, this.camera);

      // Only allow dragging non-fixed pieces; blueprint pieces stay anchored in place.
      const draggableMeshes = this.placedRebuildPieces
        .filter((p) => !p.isFixed && p.alive)
        .map((p) => p.mesh);
      if (draggableMeshes.length === 0) return;

      const hits = this.raycaster.intersectObjects(draggableMeshes, false);
      if (hits.length > 0) {
        const entry = hits[0].object.userData.pieceEntry;
        this.selectedRebuildPiece = entry;
        this.isDraggingPiece = true;
        this.controls.enabled = false;

        const p = entry.body.translation();
        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(p.x, p.y, p.z)
        );
        const intersect = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.dragPlane, intersect)) {
          this.dragOffset.set(p.x - intersect.x, 0, p.z - intersect.z);
        }
        entry.body.setBodyType(this.RAPIER.RigidBodyType.KinematicPositionBased, true);
      }
    });

    this.addListener(window, 'pointermove', (e) => {
      if (this.phase !== 'rebuild' || !this.isDraggingPiece || !this.selectedRebuildPiece) return;
      this.updatePointerNDC(e);
      this.raycaster.setFromCamera(this.pointerNDC, this.camera);
      const intersect = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersect)) {
        const cur = this.selectedRebuildPiece.body.translation();
        const nx = Math.max(-4.5, Math.min(4.5, intersect.x + this.dragOffset.x));
        const nz = Math.max(-4.0, Math.min(4.0, intersect.z + this.dragOffset.z));
        this.selectedRebuildPiece.body.setNextKinematicTranslation({ x: nx, y: cur.y, z: nz });
      }
    });

    const releaseDrag = () => {
      if (this.isDraggingPiece && this.selectedRebuildPiece) {
        this.selectedRebuildPiece.body.setBodyType(this.RAPIER.RigidBodyType.Dynamic, true);
        this.selectedRebuildPiece.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        this.isDraggingPiece = false;
        this.controls.enabled = true;
      }
    };
    this.addListener(window, 'pointerup', releaseDrag);
    this.addListener(window, 'pointercancel', releaseDrag);
    this.addListener(this.canvas, 'webglcontextlost', (e) => {
      e.preventDefault();
    });
  }

  startLoop() {
    // Allow immediate first frame render on startup while enforcing 30 FPS cap thereafter.
    this.lastFrameTime = performance.now() - this.frameIntervalMs;

    const animate = (now) => {
      if (this.destroyed) return;
      this.rafId = window.requestAnimationFrame(animate);

      const elapsedMs = now - this.lastFrameTime;
      if (elapsedMs < this.frameIntervalMs - 1.5) return;

      try {
        const frameDt = Math.min(0.05, Math.max(0.001, elapsedMs / 1000));
        this.lastFrameTime = now - Math.min(elapsedMs % this.frameIntervalMs, 4);
        this.simTime += frameDt;
        this.accumulator = Math.min(this.accumulator + frameDt, this.fixedDt * 3);

        while (this.accumulator >= this.fixedDt) {
          this.dynamicBodies.forEach((entry) => {
            if (entry.collected || !entry.alive) return;
            const t = entry.body.translation();
            const r = entry.body.rotation();
            entry.prevPos.set(t.x, t.y, t.z);
            entry.prevQuat.set(r.x, r.y, r.z, r.w);
          });

          if (this.phase === 'storm') {
            this.stepStormPhysics(this.fixedDt);
          }

          this.world.step();
          this.accumulator -= this.fixedDt;
        }

        if (this.pieceAnimations.length > 0) {
          this.pieceAnimations = this.pieceAnimations.filter((anim) => {
            anim.elapsed += frameDt;
            const t = Math.min(1, anim.elapsed / anim.duration);
            const ease = 1 - Math.pow(1 - t, 3);
            this._animPos.lerpVectors(anim.startPos, anim.targetPos, ease);
            this._animQuat.slerpQuaternions(anim.startQuat, anim.targetQuat, ease);
            anim.entry.body.setTranslation(
              { x: this._animPos.x, y: this._animPos.y, z: this._animPos.z },
              false
            );
            anim.entry.body.setRotation(
              { x: this._animQuat.x, y: this._animQuat.y, z: this._animQuat.z, w: this._animQuat.w },
              false
            );
            anim.entry.prevPos.copy(this._animPos);
            anim.entry.prevQuat.copy(this._animQuat);
            anim.entry.mesh.position.copy(this._animPos);
            anim.entry.mesh.quaternion.copy(this._animQuat);
            return t < 1;
          });
        }

        const alpha = this.accumulator / this.fixedDt;
        this.dynamicBodies.forEach((entry) => {
          if (entry.collected || !entry.alive) return;
          const t = entry.body.translation();
          const r = entry.body.rotation();
          this._tmpPos.set(t.x, t.y, t.z);
          this._tmpQuat.set(r.x, r.y, r.z, r.w);

          entry.mesh.position.lerpVectors(entry.prevPos, this._tmpPos, alpha);
          entry.mesh.quaternion.slerpQuaternions(entry.prevQuat, this._tmpQuat, alpha);
        });

        if (this.phase === 'storm' && !this.stormCompleted) {
          this.stormElapsed += frameDt;
          const remaining = Math.max(0, this.stormDuration - this.stormElapsed);
          this.callbacks.onStormTick?.(remaining);
          if (this.stormElapsed >= this.stormDuration) {
            this.stormCompleted = true;
            this.callbacks.onStormComplete?.();
          }
        }

        this.dust.update(frameDt, this.simTime);
        this.updateRubbleDecay(frameDt);

        if (this.cameraResetAnim?.active) {
          this.cameraResetAnim.elapsed += frameDt;
          const t = Math.min(1, this.cameraResetAnim.elapsed / this.cameraResetAnim.duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.camera.position.lerpVectors(this.cameraResetAnim.startPos, this.cameraResetAnim.endPos, ease);
          this.controls.target.lerpVectors(this.cameraResetAnim.startTarget, this.cameraResetAnim.endTarget, ease);
          if (t >= 1) {
            this.cameraResetAnim.active = false;
          }
        }
      } catch (err) {
        console.error('Erro no loop de física 3D:', err);
      }

      if (this.destroyed) return;
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    this.rafId = window.requestAnimationFrame(animate);
  }

  destroyFatal() {
    this.destroyed = true;
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this._listeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this._listeners = [];

    try {
      this.dynamicBodies.forEach((entry) => entry.mesh.geometry?.dispose());
      this.rain?.dispose();
      this.dust?.dispose();
      disposeCachedMaterials();
      this.controls?.dispose();
      this.renderer?.dispose();
    } catch {
      // Ignore cleanup errors during fatal termination.
    }
  }
}
