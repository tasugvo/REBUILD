import { MEMORIES } from '../config/content.js';
import { getConcreteMaterials, getWoodMaterial } from './textures.js';

export function buildConcreteHouse(controller, cx, cz) {
  const mats = getConcreteMaterials();
  const mat = mats.intact;
  const W = 3.8;
  const D = 3.4;
  const H = 2.4;
  const gap = 0.025;

  const foundation = controller.createBoxPiece({
    id: 'conc-foundation',
    kind: 'concrete',
    dims: [W + 0.5, 0.3, D + 0.5],
    pos: [cx, 0.15, cz],
    material: mat,
    isFixed: true
  });

  const pW = 0.34;
  const px = W / 2 - pW / 2;
  const pz = D / 2 - pW / 2;
  const pillarOffsets = [
    [-px, pz],
    [px, pz],
    [-px, -pz],
    [px, -pz]
  ];
  const pillars = pillarOffsets.map(([ox, oz], i) => {
    const p = controller.createBoxPiece({
      id: `conc-pillar-${i}`,
      kind: 'concrete',
      dims: [pW, H, pW],
      pos: [cx + ox, 0.3 + gap + H / 2, cz + oz],
      material: mat,
      density: 2.4
    });
    controller.linkPieces(foundation, p, 9.5);
    return p;
  });

  const bH = 0.28;
  const beamY = 0.3 + gap + H + gap + bH / 2;
  const frontBeam = controller.createBoxPiece({
    id: 'conc-beam-f',
    kind: 'concrete',
    dims: [W, bH, 0.32],
    pos: [cx, beamY, cz + pz],
    material: mat,
    density: 2.2
  });
  const backBeam = controller.createBoxPiece({
    id: 'conc-beam-b',
    kind: 'concrete',
    dims: [W, bH, 0.32],
    pos: [cx, beamY, cz - pz],
    material: mat,
    density: 2.2
  });
  const leftBeam = controller.createBoxPiece({
    id: 'conc-beam-l',
    kind: 'concrete',
    dims: [0.32, bH, D - pW * 2 - gap * 2],
    pos: [cx - px, beamY, cz],
    material: mat,
    density: 2.2
  });
  const rightBeam = controller.createBoxPiece({
    id: 'conc-beam-r',
    kind: 'concrete',
    dims: [0.32, bH, D - pW * 2 - gap * 2],
    pos: [cx + px, beamY, cz],
    material: mat,
    density: 2.2
  });

  controller.linkPieces(pillars[0], frontBeam, 8.5);
  controller.linkPieces(pillars[1], frontBeam, 8.5);
  controller.linkPieces(pillars[2], backBeam, 8.5);
  controller.linkPieces(pillars[3], backBeam, 8.5);
  controller.linkPieces(pillars[0], leftBeam, 8.5);
  controller.linkPieces(pillars[2], leftBeam, 8.5);
  controller.linkPieces(pillars[1], rightBeam, 8.5);
  controller.linkPieces(pillars[3], rightBeam, 8.5);

  const innerSpanX = W - pW * 2 - gap * 2;
  const innerSpanZ = D - pW * 2 - gap * 2;
  const panelH = (H - gap * 2) / 2;
  const yRow1 = 0.3 + gap + panelH / 2;
  const yRow2 = 0.3 + gap + panelH + gap + panelH / 2;

  const wallPanels = [
    { id: 'conc-wall-b1', dims: [innerSpanX, panelH, 0.24], pos: [cx, yRow1, cz - pz] },
    { id: 'conc-wall-b2', dims: [innerSpanX, panelH, 0.24], pos: [cx, yRow2, cz - pz] },
    { id: 'conc-wall-l1', dims: [0.24, panelH, innerSpanZ], pos: [cx - px, yRow1, cz] },
    { id: 'conc-wall-l2', dims: [0.24, panelH, innerSpanZ], pos: [cx - px, yRow2, cz] },
    { id: 'conc-wall-r1', dims: [0.24, panelH, innerSpanZ], pos: [cx + px, yRow1, cz] },
    { id: 'conc-wall-r2', dims: [0.24, panelH, innerSpanZ], pos: [cx + px, yRow2, cz] },
    { id: 'conc-wall-fl', dims: [0.95, H - gap * 2, 0.24], pos: [cx - 1.0, 0.3 + gap + H / 2, cz + pz] },
    { id: 'conc-wall-fr', dims: [0.95, H - gap * 2, 0.24], pos: [cx + 1.0, 0.3 + gap + H / 2, cz + pz] }
  ];

  wallPanels.forEach((wp) => {
    const panel = controller.createBoxPiece({
      id: wp.id,
      kind: 'concrete',
      dims: wp.dims,
      pos: wp.pos,
      material: mat,
      density: 2.3
    });
    controller.linkPieces(foundation, panel, 7.5);
  });

  const slabY = beamY + bH / 2 + gap + 0.13;
  const slab = controller.createBoxPiece({
    id: 'conc-slab',
    kind: 'concrete',
    dims: [W + 0.3, 0.26, D + 0.3],
    pos: [cx, slabY, cz],
    material: mat,
    density: 2.5
  });
  controller.linkPieces(frontBeam, slab, 8.0);
  controller.linkPieces(backBeam, slab, 8.0);
  controller.linkPieces(leftBeam, slab, 8.0);
  controller.linkPieces(rightBeam, slab, 8.0);

  const roofLeft = controller.createBoxPiece({
    id: 'conc-roof-l',
    kind: 'concrete',
    dims: [2.05, 0.18, D + 0.32],
    pos: [cx - 1.02, slabY + 0.56, cz],
    rot: [0, 0, 0.32],
    material: mat,
    density: 2.1
  });
  const roofRight = controller.createBoxPiece({
    id: 'conc-roof-r',
    kind: 'concrete',
    dims: [2.05, 0.18, D + 0.32],
    pos: [cx + 1.02, slabY + 0.56, cz],
    rot: [0, 0, -0.32],
    material: mat,
    density: 2.1
  });
  controller.linkPieces(slab, roofLeft, 7.0);
  controller.linkPieces(slab, roofRight, 7.0);
}

export function buildWoodenCabin(controller, cx, cz) {
  controller.woodCenter = { cx, cz };
  const W = 3.8;
  const D = 3.4;
  const H = 2.3;
  const gap = 0.025;
  const variants = ['warm', 'dark', 'light'];
  let memIdx = 0;
  const nextMemory = () => MEMORIES[memIdx++ % MEMORIES.length];
  const nextMat = (i) => getWoodMaterial(variants[i % variants.length]);

  const deck = controller.createBoxPiece({
    id: 'wood-deck',
    kind: 'wood-base',
    dims: [W + 0.55, 0.24, D + 0.55],
    pos: [cx, 0.12, cz],
    material: getWoodMaterial('dark'),
    isFixed: true
  });

  const pW = 0.22;
  const px = W / 2 - pW / 2;
  const pz = D / 2 - pW / 2;
  const postOffsets = [
    [-px, pz],
    [px, pz],
    [-px, -pz],
    [px, -pz]
  ];
  const posts = postOffsets.map(([ox, oz], i) => {
    const post = controller.createBoxPiece({
      id: `wood-post-${i}`,
      kind: 'wood',
      dims: [pW, H, pW],
      pos: [cx + ox, 0.24 + gap + H / 2, cz + oz],
      material: nextMat(i),
      variant: variants[i % variants.length],
      density: 0.75,
      memory: nextMemory()
    });
    controller.linkPieces(deck, post, 11.5);
    return post;
  });

  const bH = 0.2;
  const beamY = 0.24 + gap + H + gap + bH / 2;
  const beamConfigs = [
    { id: 'wood-beam-f', dims: [W, bH, 0.22], pos: [cx, beamY, cz + pz], links: [posts[0], posts[1]] },
    { id: 'wood-beam-b', dims: [W, bH, 0.22], pos: [cx, beamY, cz - pz], links: [posts[2], posts[3]] },
    { id: 'wood-beam-l', dims: [0.22, bH, D - pW * 2 - gap * 2], pos: [cx - px, beamY, cz], links: [posts[0], posts[2]] },
    { id: 'wood-beam-r', dims: [0.22, bH, D - pW * 2 - gap * 2], pos: [cx + px, beamY, cz], links: [posts[1], posts[3]] }
  ];
  const beams = beamConfigs.map((cfg, i) => {
    const b = controller.createBoxPiece({
      id: cfg.id,
      kind: 'wood',
      dims: cfg.dims,
      pos: cfg.pos,
      material: nextMat(i + 1),
      variant: variants[(i + 1) % variants.length],
      density: 0.72,
      memory: nextMemory()
    });
    cfg.links.forEach((p) => controller.linkPieces(p, b, 10));
    return b;
  });

  const plankH = (H - gap * 4) / 3;
  const plankThick = 0.12;
  const extOffsetZ = pz + pW / 2 + plankThick / 2 + gap;
  const extOffsetX = px + pW / 2 + plankThick / 2 + gap;

  for (let row = 0; row < 3; row++) {
    const py = 0.24 + gap + plankH / 2 + row * (plankH + gap);
    const backPlank = controller.createBoxPiece({
      id: `wood-plank-b-${row}`,
      kind: 'wood',
      dims: [W - 0.04, plankH, plankThick],
      pos: [cx, py, cz - extOffsetZ],
      material: nextMat(row),
      variant: variants[row % variants.length],
      density: 0.65,
      memory: nextMemory()
    });
    controller.linkPieces(posts[2], backPlank, 8.5);
    controller.linkPieces(posts[3], backPlank, 8.5);

    const leftPlank = controller.createBoxPiece({
      id: `wood-plank-l-${row}`,
      kind: 'wood',
      dims: [plankThick, plankH, D - 0.04],
      pos: [cx - extOffsetX, py, cz],
      material: nextMat(row + 1),
      variant: variants[(row + 1) % variants.length],
      density: 0.65,
      memory: nextMemory()
    });
    controller.linkPieces(posts[0], leftPlank, 8.5);

    const rightPlank = controller.createBoxPiece({
      id: `wood-plank-r-${row}`,
      kind: 'wood',
      dims: [plankThick, plankH, D - 0.04],
      pos: [cx + extOffsetX, py, cz],
      material: nextMat(row + 2),
      variant: variants[(row + 2) % variants.length],
      density: 0.65,
      memory: nextMemory()
    });
    controller.linkPieces(posts[1], rightPlank, 8.5);
  }

  const frontLeft = controller.createBoxPiece({
    id: 'wood-plank-fl',
    kind: 'wood',
    dims: [1.0, H - gap * 2, plankThick],
    pos: [cx - 1.15, 0.24 + gap + H / 2, cz + extOffsetZ],
    material: nextMat(0),
    variant: 'warm',
    density: 0.65,
    memory: nextMemory()
  });
  const frontRight = controller.createBoxPiece({
    id: 'wood-plank-fr',
    kind: 'wood',
    dims: [1.0, H - gap * 2, plankThick],
    pos: [cx + 1.15, 0.24 + gap + H / 2, cz + extOffsetZ],
    material: nextMat(2),
    variant: 'light',
    density: 0.65,
    memory: nextMemory()
  });
  controller.linkPieces(posts[0], frontLeft, 8.5);
  controller.linkPieces(posts[1], frontRight, 8.5);

  const roofY = beamY + bH / 2 + 0.56;
  for (let i = 0; i < 3; i++) {
    const zOff = -1.14 + i * 1.14;
    const rLeft = controller.createBoxPiece({
      id: `wood-roof-l-${i}`,
      kind: 'wood',
      dims: [2.15, 0.12, 1.06],
      pos: [cx - 1.02, roofY, cz + zOff],
      rot: [0, 0, 0.44],
      material: nextMat(i),
      variant: variants[i % variants.length],
      density: 0.6,
      memory: nextMemory()
    });
    controller.linkPieces(beams[2], rLeft, 7.2);

    const rRight = controller.createBoxPiece({
      id: `wood-roof-r-${i}`,
      kind: 'wood',
      dims: [2.15, 0.12, 1.06],
      pos: [cx + 1.02, roofY, cz + zOff],
      rot: [0, 0, -0.44],
      material: nextMat(i + 1),
      variant: variants[(i + 1) % variants.length],
      density: 0.6,
      memory: nextMemory()
    });
    controller.linkPieces(beams[3], rRight, 7.2);
  }
}
