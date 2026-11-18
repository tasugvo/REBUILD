import * as THREE from 'https://esm.sh/three@0.170.0';

const textureCache = new Map();

function createCanvas(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export function getConcreteMaterials() {
  if (textureCache.has('concrete_mats')) {
    return textureCache.get('concrete_mats');
  }

  const size = 256;
  const colorCanvas = createCanvas(size);
  const cCtx = colorCanvas.getContext('2d');
  cCtx.fillStyle = '#6c737b';
  cCtx.fillRect(0, 0, size, size);

  const bumpCanvas = createCanvas(size);
  const bCtx = bumpCanvas.getContext('2d');
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.6 + Math.random() * 2.2;
    const v = Math.floor(85 + Math.random() * 65);
    cCtx.fillStyle = `rgba(${v}, ${v + 2}, ${v + 5}, 0.32)`;
    cCtx.fillRect(x, y, r, r);

    const bv = Math.floor(90 + Math.random() * 80);
    bCtx.fillStyle = `rgba(${bv}, ${bv}, ${bv}, 0.35)`;
    bCtx.fillRect(x, y, r, r);
  }

  cCtx.strokeStyle = 'rgba(40, 44, 48, 0.16)';
  cCtx.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    const y = Math.random() * size;
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(size, y + (Math.random() - 0.5) * 6);
    cCtx.stroke();
  }

  const crackedCanvas = createCanvas(size);
  const crCtx = crackedCanvas.getContext('2d');
  crCtx.drawImage(colorCanvas, 0, 0);
  crCtx.strokeStyle = '#1b1f23';
  crCtx.lineWidth = 2.4;
  crCtx.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    crCtx.beginPath();
    crCtx.moveTo(cx, cy);
    for (let s = 0; s < 8; s++) {
      cx += (Math.random() - 0.5) * 44;
      cy += (Math.random() - 0.5) * 44;
      crCtx.lineTo(cx, cy);
    }
    crCtx.stroke();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;

  const crackedMap = new THREE.CanvasTexture(crackedCanvas);
  crackedMap.colorSpace = THREE.SRGBColorSpace;
  crackedMap.wrapS = crackedMap.wrapT = THREE.RepeatWrapping;

  const intact = new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.04,
    roughness: 0.9,
    metalness: 0.04
  });

  const cracked = new THREE.MeshStandardMaterial({
    map: crackedMap,
    bumpMap,
    bumpScale: 0.07,
    roughness: 0.94,
    metalness: 0.03
  });

  const mats = { intact, cracked };
  textureCache.set('concrete_mats', mats);
  return mats;
}

export function getWoodMaterial(variant = 'warm', isDamaged = false) {
  const key = `wood_${variant}_${isDamaged}`;
  if (textureCache.has(key)) {
    return textureCache.get(key);
  }

  const size = 256;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');

  const palettes = {
    warm: ['#a8602c', '#8c4b1e', '#bd7238'],
    dark: ['#78421d', '#5e3113', '#8c5127'],
    light: ['#be7b42', '#a3622d', '#cf8d52'],
    golden: ['#f59e0b', '#d97706', '#fbbf24']
  };
  const [base, dark, light] = palettes[variant] || palettes.warm;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 90; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = i % 3 === 0 ? light : dark;
    ctx.globalAlpha = 0.16 + Math.random() * 0.18;
    ctx.lineWidth = 0.8 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      size * 0.33,
      y + (Math.random() - 0.5) * 14,
      size * 0.66,
      y + (Math.random() - 0.5) * 14,
      size,
      y + (Math.random() - 0.5) * 6
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (isDamaged) {
    ctx.fillStyle = 'rgba(18, 14, 12, 0.35)';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 28, 6);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;

  const mat = new THREE.MeshStandardMaterial({
    map,
    roughness: variant === 'golden' ? 0.45 : 0.78,
    metalness: variant === 'golden' ? 0.15 : 0.03,
    emissive: variant === 'golden' ? new THREE.Color('#78350f') : new THREE.Color('#000000'),
    emissiveIntensity: variant === 'golden' ? 0.35 : 0
  });

  textureCache.set(key, mat);
  return mat;
}

export function getGroundMaterial() {
  if (textureCache.has('ground_mat')) {
    return textureCache.get('ground_mat');
  }

  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#181e21';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 2.5;
    const g = 26 + Math.floor(Math.random() * 22);
    ctx.fillStyle = `rgba(${g - 4}, ${g + 4}, ${g}, 0.4)`;
    ctx.fillRect(x, y, r, r);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(16, 16);

  const mat = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.96,
    metalness: 0.02
  });

  textureCache.set('ground_mat', mat);
  return mat;
}

export function disposeCachedMaterials() {
  for (const val of textureCache.values()) {
    const mats = val.intact ? [val.intact, val.cracked] : [val];
    for (const mat of mats) {
      mat.map?.dispose();
      mat.bumpMap?.dispose();
      mat.dispose();
    }
  }
  textureCache.clear();
}
