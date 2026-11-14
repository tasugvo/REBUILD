import { ACTS_COPY, MEMORIES, PALETTE } from './content.js';

export class ExperienceController {
  constructor({ canvas, sound, ui, onCompleteAct3 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = sound;
    this.ui = ui;
    this.onCompleteAct3 = onCompleteAct3;

    const { Engine, World, Bodies, Body, Events, Composite } = window.Matter;
    this.Matter = window.Matter;
    this.Engine = Engine;
    this.World = World;
    this.Bodies = Bodies;
    this.Body = Body;
    this.Events = Events;
    this.Composite = Composite;

    this.engine = Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 1.0;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.groundHeight = 60;

    this.currentAct = 0;
    this.concreteHits = 0;
    this.maxConcreteHits = 5;
    this.concreteCollapsed = false;
    this.concreteMonolith = null;
    this.concreteCracks = [];
    this.rubblePieces = [];

    this.woodPlanks = [];
    this.stormTriggered = false;
    this.rebuildSlots = [];
    this.snappedCount = 0;
    this.draggedPlank = null;
    this.dragOffset = { x: 0, y: 0 };
    this.activeActTimers = [];

    this.pointerDown = false;
    this.pointerStart = { x: 0, y: 0 };
    this.pointerLast = { x: 0, y: 0 };

    this.resizeCanvas();
    this.createBoundaries();
    this.bindEvents();
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  createBoundaries() {
    if (this.ground) {
      this.World.remove(this.world, [this.ground, this.leftWall, this.rightWall]);
    }
    this.ground = this.Bodies.rectangle(
      this.width / 2,
      this.height - this.groundHeight / 2 + 10,
      this.width * 2,
      this.groundHeight,
      { isStatic: true, friction: 0.85, label: 'ground' }
    );
    this.leftWall = this.Bodies.rectangle(-30, this.height / 2, 60, this.height * 2, {
      isStatic: true,
      label: 'wall'
    });
    this.rightWall = this.Bodies.rectangle(this.width + 30, this.height / 2, 60, this.height * 2, {
      isStatic: true,
      label: 'wall'
    });
    this.World.add(this.world, [this.ground, this.leftWall, this.rightWall]);
  }

  scheduleActTimeout(fn, delay) {
    const id = window.setTimeout(fn, delay);
    this.activeActTimers.push(id);
    return id;
  }

  clearActTimers() {
    this.activeActTimers.forEach((id) => window.clearTimeout(id));
    this.activeActTimers = [];
  }

  clearDynamicBodies() {
    this.clearActTimers();
    const allBodies = this.Composite.allBodies(this.world);
    allBodies.forEach((b) => {
      if (!b.isStatic) this.World.remove(this.world, b);
    });
    if (this.concreteMonolith) {
      this.World.remove(this.world, this.concreteMonolith);
      this.concreteMonolith = null;
    }
    this.rubblePieces = [];
    this.woodPlanks = [];
    this.rebuildSlots = [];
    this.draggedPlank = null;
    this.pointerDown = false;
    this.ui.clearMemories();
  }

  start() {
    const loop = () => {
      this.Engine.update(this.engine, 1000 / 60);
      this.drawScene();
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  }

  startAct1() {
    this.currentAct = 1;
    this.clearDynamicBodies();
    this.ui.hideNarrativeFooter();
    this.concreteHits = 0;
    this.concreteCollapsed = false;
    this.concreteCracks = [];

    this.ui.setSky(PALETTE.skyAct1);
    this.ui.updateHeader(
      ACTS_COPY.act1.badge,
      ACTS_COPY.act1.title,
      ACTS_COPY.act1.instructionStart
    );

    const pillarW = Math.min(130, this.width * 0.34);
    const pillarH = Math.min(310, this.height * 0.42);
    const startX = this.width / 2;
    const startY = this.height - this.groundHeight - pillarH / 2 + 10;

    this.concreteMonolith = this.Bodies.rectangle(startX, startY, pillarW, pillarH, {
      isStatic: true,
      label: 'concrete_monolith',
      renderWidth: pillarW,
      renderHeight: pillarH
    });
    this.World.add(this.world, this.concreteMonolith);
  }

  hitConcrete(tapX, tapY) {
    if (this.currentAct !== 1 || this.concreteCollapsed || !this.concreteMonolith) return;

    this.concreteHits++;
    this.sound.playCrack(0.7 + this.concreteHits * 0.15);
    this.ui.triggerShake();

    const bounds = this.concreteMonolith.bounds;
    const cx = Math.max(bounds.min.x + 15, Math.min(bounds.max.x - 15, tapX || this.width / 2));
    const cy = Math.max(
      bounds.min.y + 20,
      Math.min(bounds.max.y - 20, tapY || (bounds.min.y + bounds.max.y) / 2)
    );

    const segments = [];
    let curX = cx - this.concreteMonolith.position.x;
    let curY = cy - this.concreteMonolith.position.y;
    const steps = 6 + this.concreteHits * 2;
    for (let i = 0; i < steps; i++) {
      curX += (Math.random() - 0.5) * 38;
      curY += (Math.random() - 0.35) * 42;
      segments.push({ x: curX, y: curY });
    }
    this.concreteCracks.push({
      startX: cx - this.concreteMonolith.position.x,
      startY: cy - this.concreteMonolith.position.y,
      segments
    });

    if (this.concreteHits < this.maxConcreteHits) {
      const remaining = this.maxConcreteHits - this.concreteHits;
      this.ui.setInstruction(
        remaining === 1
          ? ACTS_COPY.act1.instructionLastHit
          : ACTS_COPY.act1.instructionProgress(this.concreteHits, this.maxConcreteHits)
      );
    } else {
      this.shatterConcrete();
    }
  }

  shatterConcrete() {
    this.concreteCollapsed = true;
    this.sound.playCollapse();
    this.ui.hideInstruction();

    const pos = this.concreteMonolith.position;
    const w = this.concreteMonolith.renderWidth;
    const h = this.concreteMonolith.renderHeight;
    this.World.remove(this.world, this.concreteMonolith);
    this.concreteMonolith = null;

    const cols = 4;
    const rows = 8;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rx = pos.x - w / 2 + c * cellW + cellW / 2;
        const ry = pos.y - h / 2 + r * cellH + cellH / 2;
        const sides = Math.floor(Math.random() * 3) + 3;
        const radius = Math.min(cellW, cellH) * 0.55 * (0.7 + Math.random() * 0.5);

        const shard = this.Bodies.polygon(rx, ry, sides, radius, {
          restitution: 0.15,
          friction: 0.9,
          density: 0.005,
          label: 'rubble',
          shade: Math.floor(100 + Math.random() * 55)
        });

        this.Body.setVelocity(shard, {
          x: (rx - pos.x) * 0.12 + (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.8) * 5
        });
        this.Body.setAngularVelocity(shard, (Math.random() - 0.5) * 0.3);

        this.rubblePieces.push(shard);
        this.World.add(this.world, shard);
      }
    }

    this.scheduleActTimeout(() => {
      this.ui.showNarrativeFooter(
        ACTS_COPY.act1.quote,
        ACTS_COPY.act1.nextBtn,
        () => this.startAct2()
      );
    }, 1500);
  }

  startAct2() {
    this.currentAct = 2;
    this.clearDynamicBodies();
    this.ui.hideNarrativeFooter();
    this.stormTriggered = false;

    this.ui.setSky(PALETTE.skyAct2);
    this.ui.updateHeader(
      ACTS_COPY.act2.badge,
      ACTS_COPY.act2.title,
      ACTS_COPY.act2.instructionStart
    );

    const cx = this.width / 2;
    const baseY = this.height - this.groundHeight + 10;
    const plankThick = 22;
    const wallH = 125;
    const spanW = Math.min(180, this.width * 0.48);

    const planksConfig = [
      { x: cx - spanW / 2 + 15, y: baseY - wallH / 2, w: plankThick, h: wallH, angle: 0, memory: MEMORIES[0] },
      { x: cx + spanW / 2 - 15, y: baseY - wallH / 2, w: plankThick, h: wallH, angle: 0, memory: MEMORIES[1] },
      { x: cx, y: baseY - wallH / 2, w: plankThick, h: wallH, angle: 0, memory: MEMORIES[2] },
      { x: cx, y: baseY - wallH - plankThick / 2, w: spanW + 24, h: plankThick, angle: 0, memory: MEMORIES[3] },
      { x: cx - spanW * 0.28, y: baseY - wallH - 52, w: spanW * 0.65, h: plankThick, angle: -0.52, memory: MEMORIES[4] },
      { x: cx + spanW * 0.28, y: baseY - wallH - 52, w: spanW * 0.65, h: plankThick, angle: 0.52, memory: MEMORIES[5] }
    ];

    planksConfig.forEach((cfg, idx) => {
      const plank = this.Bodies.rectangle(cfg.x, cfg.y, cfg.w, cfg.h, {
        angle: cfg.angle,
        restitution: 0.35,
        friction: 0.7,
        density: 0.002,
        chamfer: { radius: 4 },
        label: 'wood_plank',
        plankW: cfg.w,
        plankH: cfg.h,
        memory: cfg.memory,
        isNewGolden: false,
        snapped: false,
        woodTone: idx % 2 === 0 ? '#b4692e' : '#9a5422'
      });
      this.woodPlanks.push(plank);
      this.World.add(this.world, plank);
    });
  }

  triggerWoodStorm(swipeVx) {
    if (this.currentAct !== 2 || this.stormTriggered) return;
    this.stormTriggered = true;
    this.sound.playWind();

    const direction = swipeVx >= 0 ? 1 : -1;

    this.woodPlanks.forEach((plank) => {
      this.Body.setVelocity(plank, {
        x: direction * (9 + Math.random() * 8) + (Math.random() - 0.5) * 4,
        y: -6 - Math.random() * 7
      });
      this.Body.setAngularVelocity(plank, direction * (0.08 + Math.random() * 0.14));
    });

    this.scheduleActTimeout(() => {
      this.ui.setInstruction(ACTS_COPY.act2.instructionAfterStorm);
    }, 900);

    this.scheduleActTimeout(() => {
      this.ui.showNarrativeFooter(
        ACTS_COPY.act2.quote,
        ACTS_COPY.act2.nextBtn,
        () => this.startAct3()
      );
    }, 2400);
  }

  startAct3() {
    this.currentAct = 3;
    this.ui.hideNarrativeFooter();
    this.snappedCount = 0;

    if (this.woodPlanks.length === 0) {
      this.clearDynamicBodies();
      this.ui.setSky(PALETTE.skyAct2);

      const baseY = this.height - this.groundHeight - 25;
      for (let i = 0; i < 6; i++) {
        const isVertical = i < 3;
        const pw = isVertical ? 22 : Math.min(140, this.width * 0.36);
        const ph = isVertical ? 110 : 22;
        const px = this.width * (0.22 + (i % 3) * 0.28) + (Math.random() - 0.5) * 20;
        const py = baseY - Math.floor(i / 3) * 35;

        const plank = this.Bodies.rectangle(px, py, pw, ph, {
          angle: (Math.random() - 0.5) * 0.4,
          restitution: 0.35,
          friction: 0.7,
          density: 0.002,
          chamfer: { radius: 4 },
          label: 'wood_plank',
          plankW: pw,
          plankH: ph,
          memory: MEMORIES[i],
          isNewGolden: false,
          snapped: false,
          woodTone: i % 2 === 0 ? '#b4692e' : '#9a5422'
        });
        this.woodPlanks.push(plank);
        this.World.add(this.world, plank);
      }
    } else {
      this.clearActTimers();
    }

    this.ui.updateHeader(
      ACTS_COPY.act3.badge,
      ACTS_COPY.act3.title,
      ACTS_COPY.act3.instructionStart
    );

    const cx = this.width / 2;
    const houseBaseY = Math.min(this.height * 0.54, this.height - 230);
    const houseW = Math.min(190, this.width * 0.52);
    const wallH = 120;
    const thick = 22;

    this.rebuildSlots = [
      { id: 0, x: cx, y: houseBaseY, w: houseW + 26, h: thick, angle: 0, filled: false, label: 'Base' },
      { id: 1, x: cx - houseW / 2 + 11, y: houseBaseY - wallH / 2 - thick / 2, w: thick, h: wallH, angle: 0, filled: false, label: 'Parede Esq' },
      { id: 2, x: cx + houseW / 2 - 11, y: houseBaseY - wallH / 2 - thick / 2, w: thick, h: wallH, angle: 0, filled: false, label: 'Parede Dir' },
      { id: 3, x: cx, y: houseBaseY - wallH - thick, w: houseW + 20, h: thick, angle: 0, filled: false, label: 'Viga' },
      { id: 4, x: cx - houseW * 0.28, y: houseBaseY - wallH - 56, w: houseW * 0.66, h: thick, angle: -0.52, filled: false, label: 'Telhado Esq' },
      { id: 5, x: cx + houseW * 0.28, y: houseBaseY - wallH - 56, w: houseW * 0.66, h: thick, angle: 0.52, filled: false, label: 'Telhado Dir' },
      { id: 6, x: cx, y: houseBaseY - wallH / 2 - thick / 2, w: thick * 0.85, h: wallH * 0.92, angle: 0, filled: false, label: 'Novo Elo' }
    ];

    this.woodPlanks.forEach((p, idx) => {
      if (idx < 6) {
        p.snapped = false;
        p.targetSlot = this.rebuildSlots[idx + 1];
        p.memory = MEMORIES[idx];
      }
    });

    const goldenPlank = this.Bodies.rectangle(
      this.width * 0.5,
      this.height - this.groundHeight - 40,
      houseW + 20,
      thick,
      {
        restitution: 0.3,
        friction: 0.8,
        chamfer: { radius: 4 },
        label: 'wood_plank',
        plankW: houseW + 20,
        plankH: thick,
        memory: ACTS_COPY.act3.goldenPlankBaseMemory,
        isNewGolden: true,
        snapped: false,
        targetSlot: this.rebuildSlots[0],
        woodTone: '#f59e0b'
      }
    );
    this.woodPlanks.push(goldenPlank);
    this.World.add(this.world, goldenPlank);

    if (this.woodPlanks[2]) {
      this.woodPlanks[2].isNewGolden = true;
      this.woodPlanks[2].memory = ACTS_COPY.act3.goldenPlankLinkMemory;
      this.woodPlanks[2].woodTone = '#f59e0b';
    }
  }

  snapPlankToSlot(plank, slot) {
    if (plank.snapped || slot.filled) return;

    plank.snapped = true;
    slot.filled = true;
    this.snappedCount++;

    this.Body.setStatic(plank, true);
    this.Body.setPosition(plank, { x: slot.x, y: slot.y });
    this.Body.setAngle(plank, slot.angle);
    plank.plankW = slot.w;
    plank.plankH = slot.h;

    this.sound.playWarmChime(0.85 + this.snappedCount * 0.06);
    this.ui.showFloatingMemory(slot.x, slot.y - 15, plank.memory, this.width);

    const progress = this.snappedCount / this.rebuildSlots.length;
    this.updateSkyWarmth(progress);

    if (this.snappedCount >= this.rebuildSlots.length) {
      this.completeAct3();
    }
  }

  updateSkyWarmth(progress) {
    if (progress < 0.4) {
      this.ui.setSky(PALETTE.skyAct3Low);
    } else if (progress < 0.85) {
      this.ui.setSky(PALETTE.skyAct3Mid);
    } else {
      this.ui.setSky(PALETTE.skyAct3Warm);
    }
  }

  completeAct3() {
    this.ui.hideInstruction();
    this.sound.playWarmChime(1.25);

    this.scheduleActTimeout(() => {
      this.ui.showNarrativeFooter(
        ACTS_COPY.act3.quote,
        ACTS_COPY.act3.nextBtn,
        () => {
          this.clearActTimers();
          this.currentAct = 4;
          this.onCompleteAct3();
        }
      );
    }, 900);
  }

  getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  handlePointerDown(e) {
    if (this.currentAct === 0 || this.currentAct === 4) return;
    if (e.type === 'touchstart') e.preventDefault();

    const pos = this.getPointerPos(e);
    this.pointerDown = true;
    this.pointerStart = { ...pos };
    this.pointerLast = { ...pos };

    if (this.currentAct === 1 && !this.concreteCollapsed && this.concreteMonolith) {
      const b = this.concreteMonolith.bounds;
      if (pos.x >= b.min.x - 30 && pos.x <= b.max.x + 30 && pos.y >= b.min.y - 30 && pos.y <= b.max.y + 30) {
        this.hitConcrete(pos.x, pos.y);
      }
    }

    if (this.currentAct === 2 && this.stormTriggered) {
      for (const plank of this.woodPlanks) {
        if (this.Matter.Bounds.contains(plank.bounds, pos)) {
          this.sound.playWoodKnock(1.5);
          this.Body.setVelocity(plank, { x: (Math.random() - 0.5) * 3, y: -3.5 });
          this.ui.showFloatingMemory(pos.x, pos.y, plank.memory, this.width);
          break;
        }
      }
    }

    if (this.currentAct === 3) {
      for (let i = this.woodPlanks.length - 1; i >= 0; i--) {
        const plank = this.woodPlanks[i];
        if (plank.snapped) continue;
        const pad = 22;
        if (
          pos.x >= plank.bounds.min.x - pad &&
          pos.x <= plank.bounds.max.x + pad &&
          pos.y >= plank.bounds.min.y - pad &&
          pos.y <= plank.bounds.max.y + pad
        ) {
          this.draggedPlank = plank;
          this.dragOffset = { x: pos.x - plank.position.x, y: pos.y - plank.position.y };
          this.Body.setVelocity(plank, { x: 0, y: 0 });
          this.Body.setAngularVelocity(plank, 0);
          if (plank.targetSlot) {
            this.Body.setAngle(plank, plank.targetSlot.angle);
          }
          this.sound.playWoodKnock(0.9);
          break;
        }
      }
    }
  }

  handlePointerMove(e) {
    if (!this.pointerDown) return;
    if (e.type === 'touchmove') e.preventDefault();

    const pos = this.getPointerPos(e);

    if (this.currentAct === 2 && !this.stormTriggered) {
      const dx = pos.x - this.pointerStart.x;
      const dy = pos.y - this.pointerStart.y;
      if (Math.hypot(dx, dy) > 45) {
        this.triggerWoodStorm(dx);
      }
    }

    if (this.currentAct === 3 && this.draggedPlank) {
      const targetX = pos.x - this.dragOffset.x;
      const targetY = pos.y - this.dragOffset.y;
      this.Body.setPosition(this.draggedPlank, { x: targetX, y: targetY });
      this.Body.setVelocity(this.draggedPlank, { x: 0, y: 0 });

      const slot = this.draggedPlank.targetSlot;
      if (slot && !slot.filled) {
        const dist = Math.hypot(targetX - slot.x, targetY - slot.y);
        if (dist < 52) {
          this.snapPlankToSlot(this.draggedPlank, slot);
          this.draggedPlank = null;
        }
      }
    }

    this.pointerLast = { ...pos };
  }

  handlePointerUp() {
    if (!this.pointerDown) return;
    this.pointerDown = false;

    if (this.currentAct === 3 && this.draggedPlank) {
      const movedDist = Math.hypot(
        this.pointerLast.x - this.pointerStart.x,
        this.pointerLast.y - this.pointerStart.y
      );
      if (movedDist < 12 && this.draggedPlank.targetSlot && !this.draggedPlank.targetSlot.filled) {
        this.snapPlankToSlot(this.draggedPlank, this.draggedPlank.targetSlot);
      }
      this.draggedPlank = null;
    }
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    window.addEventListener('mouseup', () => this.handlePointerUp());

    this.canvas.addEventListener('touchstart', (e) => this.handlePointerDown(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.handlePointerMove(e), { passive: false });
    window.addEventListener('touchend', () => this.handlePointerUp());

    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createBoundaries();
    });

    this.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const speed = pair.collision.depth;
        if (speed > 1.2) {
          if (pair.bodyA.label === 'wood_plank' || pair.bodyB.label === 'wood_plank') {
            this.sound.playWoodKnock(speed * 0.4);
          }
        }
      });
    });
  }

  drawScene() {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const groundHeight = this.groundHeight;

    ctx.clearRect(0, 0, width, height);

    const gradGround = ctx.createLinearGradient(0, height - groundHeight, 0, height);
    gradGround.addColorStop(0, this.currentAct >= 3 ? '#241b15' : '#181d21');
    gradGround.addColorStop(1, PALETTE.deepBg);
    ctx.fillStyle = gradGround;
    ctx.fillRect(0, height - groundHeight + 10, width, groundHeight);

    ctx.strokeStyle = this.currentAct >= 3 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height - groundHeight + 10);
    ctx.lineTo(width, height - groundHeight + 10);
    ctx.stroke();

    if (this.currentAct === 1 && this.concreteMonolith) {
      const { x, y } = this.concreteMonolith.position;
      const w = this.concreteMonolith.renderWidth;
      const h = this.concreteMonolith.renderHeight;

      ctx.save();
      ctx.translate(x, y);

      const cGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      cGrad.addColorStop(0, '#64748b');
      cGrad.addColorStop(0.5, '#475569');
      cGrad.addColorStop(1, '#334155');
      ctx.fillStyle = cGrad;
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      this.concreteCracks.forEach((crack) => {
        ctx.beginPath();
        ctx.moveTo(crack.startX, crack.startY);
        crack.segments.forEach((seg) => {
          const clampedX = Math.max(-w / 2 + 4, Math.min(w / 2 - 4, seg.x));
          const clampedY = Math.max(-h / 2 + 4, Math.min(h / 2 - 4, seg.y));
          ctx.lineTo(clampedX, clampedY);
        });
        ctx.stroke();
      });

      ctx.restore();
    }

    this.rubblePieces.forEach((shard) => {
      ctx.save();
      ctx.beginPath();
      const verts = shard.vertices;
      ctx.moveTo(verts[0].x, verts[0].y);
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i].x, verts[i].y);
      }
      ctx.closePath();
      const s = shard.shade;
      ctx.fillStyle = `rgb(${s}, ${s + 5}, ${s + 12})`;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    if (this.currentAct >= 3 && this.rebuildSlots.length > 0) {
      if (this.snappedCount > 0) {
        const glowAlpha = (this.snappedCount / this.rebuildSlots.length) * 0.45;
        const houseCenter = this.rebuildSlots[6];
        const radGrad = ctx.createRadialGradient(
          houseCenter.x,
          houseCenter.y,
          10,
          houseCenter.x,
          houseCenter.y,
          160
        );
        radGrad.addColorStop(0, `rgba(251, 191, 36, ${glowAlpha})`);
        radGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      }

      this.rebuildSlots.forEach((slot) => {
        if (slot.filled) return;
        ctx.save();
        ctx.translate(slot.x, slot.y);
        ctx.rotate(slot.angle);

        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-slot.w / 2, -slot.h / 2, slot.w, slot.h);

        ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
        ctx.fillRect(-slot.w / 2, -slot.h / 2, slot.w, slot.h);
        ctx.restore();
      });
    }

    this.woodPlanks.forEach((plank) => {
      const { x, y } = plank.position;
      const w = plank.plankW;
      const h = plank.plankH;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(plank.angle);

      if (plank.isNewGolden) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = plank.snapped ? 18 : 14;
      }

      const wGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      if (plank.isNewGolden) {
        wGrad.addColorStop(0, '#fbbf24');
        wGrad.addColorStop(1, '#d97706');
      } else {
        wGrad.addColorStop(0, '#c27838');
        wGrad.addColorStop(1, '#85461b');
      }

      ctx.fillStyle = wGrad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      } else {
        ctx.rect(-w / 2, -h / 2, w, h);
      }
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = plank.isNewGolden ? 'rgba(120, 53, 15, 0.35)' : 'rgba(45, 20, 6, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (w > h) {
        ctx.moveTo(-w * 0.35, -h * 0.15);
        ctx.lineTo(w * 0.35, -h * 0.15);
        ctx.moveTo(-w * 0.25, h * 0.2);
        ctx.lineTo(w * 0.4, h * 0.2);
      } else {
        ctx.moveTo(-w * 0.15, -h * 0.35);
        ctx.lineTo(-w * 0.15, h * 0.35);
        ctx.moveTo(w * 0.2, -h * 0.25);
        ctx.lineTo(w * 0.2, h * 0.4);
      }
      ctx.stroke();

      ctx.strokeStyle = plank.isNewGolden ? '#fef3c7' : '#d99b66';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      ctx.restore();
    });
  }
}
