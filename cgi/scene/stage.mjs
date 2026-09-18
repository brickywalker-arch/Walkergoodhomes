import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

RectAreaLightUniformsLib.init();

/** Procedural Marshalls 'Epoch' style coursed stone. */
export function stoneTexture(repeatX = 6, repeatY = 6) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#8d8579';
  g.fillRect(0, 0, 1024, 1024);

  const courseH = 62; // coursed, not random rubble
  let y = 0;
  let row = 0;
  while (y < 1024) {
    let x = row % 2 ? -70 : 0;
    while (x < 1024) {
      const w = 110 + Math.random() * 150;
      const shade = 0.78 + Math.random() * 0.3;
      const warm = Math.random() * 16;
      const r = Math.round(150 * shade + warm);
      const gg = Math.round(141 * shade + warm * 0.7);
      const b = Math.round(126 * shade + warm * 0.4);
      g.fillStyle = `rgb(${r},${gg},${b})`;
      g.fillRect(x + 2, y + 2, w - 4, courseH - 4);
      // A little tonal mottling within each stone.
      g.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
      g.fillRect(x + 6, y + 5, w - 14, courseH * 0.35);
      x += w;
    }
    y += courseH;
    row += 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Antique-slate roof covering, as the elevations note. */
export function slateTexture(repeatX = 8, repeatY = 8) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#39393c';
  g.fillRect(0, 0, 1024, 1024);
  const courseH = 54;
  const slateW = 88;
  for (let y = 0, row = 0; y < 1024; y += courseH, row += 1) {
    for (let x = row % 2 ? -slateW / 2 : 0; x < 1024; x += slateW) {
      const shade = 0.82 + Math.random() * 0.34;
      g.fillStyle = `rgb(${Math.round(62 * shade)},${Math.round(63 * shade)},${Math.round(68 * shade)})`;
      g.fillRect(x + 1, y + 1, slateW - 2, courseH * 1.55);
      g.fillStyle = 'rgba(0,0,0,.22)';
      g.fillRect(x + 1, y + courseH * 1.45, slateW - 2, 3);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * What you see through the glazing: sky, distant moorland and the garden
 * hedge. Rooms higher up the house get more sky and less hedge, which is what
 * the eye expects from a three-storey plan.
 */
export function viewTexture(level = 'ground') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  const horizon = { ground: 0.62, first: 0.5, second: 0.34 }[level] ?? 0.62;

  const sky = g.createLinearGradient(0, 0, 0, 512 * horizon);
  sky.addColorStop(0, '#7fa9cd');
  sky.addColorStop(0.55, '#b6d2e6');
  sky.addColorStop(1, '#dcebf4');
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 512 * horizon);

  // Soft cloud banding.
  g.globalAlpha = 0.5;
  for (let i = 0; i < 7; i += 1) {
    g.fillStyle = '#ffffff';
    const y = Math.random() * 512 * horizon * 0.8;
    g.beginPath();
    g.ellipse(Math.random() * 512, y, 60 + Math.random() * 120, 12 + Math.random() * 18, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  // Distant moorland ridge.
  g.fillStyle = '#7f8a79';
  g.beginPath();
  g.moveTo(0, 512 * horizon);
  for (let x = 0; x <= 512; x += 32) {
    g.lineTo(x, 512 * horizon - 14 - Math.sin(x / 70) * 12 - Math.random() * 6);
  }
  g.lineTo(512, 512 * horizon);
  g.closePath();
  g.fill();

  // Garden: hedge line then lawn falling away.
  const lawn = g.createLinearGradient(0, 512 * horizon, 0, 512);
  lawn.addColorStop(0, '#56693f');
  lawn.addColorStop(1, '#6f8250');
  g.fillStyle = lawn;
  g.fillRect(0, 512 * horizon, 512, 512 * (1 - horizon));
  g.fillStyle = '#3f5232';
  for (let x = 0; x < 512; x += 18) {
    g.beginPath();
    g.ellipse(x, 512 * horizon + 6, 16, 22 + Math.random() * 10, 0, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Grass / planting ground cover. */
export function grassTexture(repeat = 24) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#5d6b46';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i += 1) {
    const shade = 0.7 + Math.random() * 0.6;
    g.fillStyle = `rgba(${Math.round(104 * shade)},${Math.round(122 * shade)},${Math.round(72 * shade)},.8)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 3, 5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Engineered oak boards, laid in a broken bond. */
export function plankTexture(tone = '#b08a5f') {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext('2d');
  const base = new THREE.Color(tone);
  g.fillStyle = `#${base.getHexString()}`;
  g.fillRect(0, 0, 1024, 1024);

  const plankH = 128;
  for (let y = 0, row = 0; y < 1024; y += plankH, row += 1) {
    let x = row % 2 ? -190 : row % 3 ? -80 : 0;
    while (x < 1024) {
      const w = 280 + Math.random() * 260;
      const shade = 0.86 + Math.random() * 0.26;
      const col = base.clone().multiplyScalar(shade);
      g.fillStyle = `#${col.getHexString()}`;
      g.fillRect(x + 1, y + 1, w - 2, plankH - 2);
      // Grain: a few darker streaks along the length of the board.
      for (let i = 0; i < 9; i += 1) {
        g.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.06})`;
        g.lineWidth = 1 + Math.random() * 2;
        const gy = y + 8 + Math.random() * (plankH - 16);
        g.beginPath();
        g.moveTo(x + 3, gy);
        g.bezierCurveTo(x + w * 0.3, gy + (Math.random() - 0.5) * 9, x + w * 0.7, gy + (Math.random() - 0.5) * 9, x + w - 3, gy);
        g.stroke();
      }
      // Board joint.
      g.fillStyle = 'rgba(0,0,0,.20)';
      g.fillRect(x, y, 2, plankH);
      x += w;
    }
    g.fillStyle = 'rgba(0,0,0,.16)';
    g.fillRect(0, y, 1024, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Loop-pile carpet: fine tonal noise, no pattern. */
export function carpetTexture(tone = '#b9b2a6') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  const base = new THREE.Color(tone);
  g.fillStyle = `#${base.getHexString()}`;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i += 1) {
    const shade = 0.82 + Math.random() * 0.34;
    const col = base.clone().multiplyScalar(shade);
    g.fillStyle = `#${col.getHexString()}`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Large-format tiling with a fine grout joint. */
export function tileTexture(tone = '#cdc7bd', across = 3) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  const base = new THREE.Color(tone);
  g.fillStyle = '#b3aca2';
  g.fillRect(0, 0, 512, 512);
  const cell = 512 / across;
  for (let ty = 0; ty < across; ty += 1) {
    for (let tx = 0; tx < across; tx += 1) {
      const shade = 0.94 + Math.random() * 0.12;
      const col = base.clone().multiplyScalar(shade);
      g.fillStyle = `#${col.getHexString()}`;
      g.fillRect(tx * cell + 2, ty * cell + 2, cell - 4, cell - 4);
      g.fillStyle = 'rgba(255,255,255,.05)';
      g.fillRect(tx * cell + 2, ty * cell + 2, cell - 4, (cell - 4) * 0.4);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Loft boarding in the eaves stores. */
export function boardTexture() {
  return plankTexture('#c3ac8b');
}

/**
 * Interior lighting rig.
 *
 * Daylight is the point: a sun outside the glazing casts real shadows through
 * the openings, and each opening additionally carries a soft area light so
 * rooms that face away from the sun still read as daylit rather than murky.
 */
export function lightInterior(scene, group, room) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.26));
  const hemi = new THREE.HemisphereLight(0xdff0fb, 0x6b6357, 0.58);
  hemi.position.set(0, room.height, 0);
  scene.add(hemi);

  // Collect the openings the walls punched, so lights follow the real glazing.
  const openings = [];
  group.traverse((o) => {
    if (o.userData && Array.isArray(o.userData.openings)) openings.push(...o.userData.openings);
  });
  const windows = openings.filter((o) => o.kind !== 'door' || o.h > 1.9);

  windows.forEach((o) => {
    const light = new THREE.RectAreaLight(0xf2f7ff, 3.1, Math.max(0.5, o.w), Math.max(0.5, o.h));
    const cz = o.side === 'front' ? 0.06 : o.side === 'back' ? room.depth - 0.06 : 0;
    const cx = o.side === 'left' ? 0.06 : o.side === 'right' ? room.width - 0.06 : 0;
    if (o.side === 'front') {
      light.position.set(o.u + o.w / 2, o.sill + o.h / 2, cz);
      light.lookAt(o.u + o.w / 2, o.sill + o.h / 2, room.depth);
    } else if (o.side === 'back') {
      light.position.set(room.width - o.u - o.w / 2, o.sill + o.h / 2, cz);
      light.lookAt(room.width - o.u - o.w / 2, o.sill + o.h / 2, 0);
    } else if (o.side === 'left') {
      light.position.set(cx, o.sill + o.h / 2, room.depth - o.u - o.w / 2);
      light.lookAt(room.width, o.sill + o.h / 2, room.depth - o.u - o.w / 2);
    } else {
      light.position.set(cx, o.sill + o.h / 2, o.u + o.w / 2);
      light.lookAt(0, o.sill + o.h / 2, o.u + o.w / 2);
    }
    scene.add(light);
  });

  // One sun, aimed through the largest opening so the shadows have direction.
  const main = windows.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
  const sun = new THREE.DirectionalLight(0xfff3e2, windows.length ? 2.9 : 0.8);
  const span = Math.max(room.width, room.depth) * 1.4;
  if (main) {
    const dir = { front: [0.6, -1], back: [-0.4, 1], left: [-1, 0.3], right: [1, -0.3] }[main.side] ?? [0.6, -1];
    sun.position.set(room.width / 2 + dir[0] * 6, room.height + 4.5, room.depth / 2 + dir[1] * 6);
  } else {
    sun.position.set(room.width / 2 + 4, room.height + 4, room.depth / 2 + 4);
  }
  sun.target.position.set(room.width / 2, 0.6, room.depth / 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  sun.shadow.camera.left = -span;
  sun.shadow.camera.right = span;
  sun.shadow.camera.top = span;
  sun.shadow.camera.bottom = -span;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.022;
  scene.add(sun);
  scene.add(sun.target);

  // Warm practicals so ceilings and corners are not dead.
  const lamp = new THREE.PointLight(0xffe9c4, 1.1, Math.max(room.width, room.depth) * 2.2, 2);
  lamp.position.set(room.width / 2, room.height - 0.55, room.depth / 2);
  scene.add(lamp);

  // Internal rooms (bathroom, landings, stores) need a second practical or
  // they render as a dark box — the drawings give them no external opening.
  if (!windows.length) {
    // The drawings give these rooms no external opening, so the ceiling
    // fittings are the light: two practicals down the space plus a lift in
    // the ambient, or they render as a flat grey box.
    [0.3, 0.72].forEach((f) => {
      const fill = new THREE.PointLight(0xfff0d8, 2.6, Math.max(room.width, room.depth) * 2.6, 2);
      fill.position.set(room.width * 0.5, room.height - 0.3, room.depth * f);
      scene.add(fill);
    });
    scene.add(new THREE.AmbientLight(0xfff6ea, 0.34));
    const bounce = new THREE.HemisphereLight(0xfff3e4, 0x9a9384, 0.5);
    scene.add(bounce);
  }
}

export function makeRenderer(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

export function makeCamera(cam, width, height) {
  const camera = new THREE.PerspectiveCamera(cam.fov ?? 60, width / height, 0.05, 400);
  camera.position.set(...cam.pos);
  camera.lookAt(new THREE.Vector3(...cam.target));
  return camera;
}
