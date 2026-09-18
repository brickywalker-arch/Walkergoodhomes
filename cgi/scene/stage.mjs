import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

RectAreaLightUniformsLib.init();

/**
 * Procedural surfaces.
 *
 * Each generator draws a colour map onto a canvas; `surface()` then turns that
 * canvas into a texture set — a colour map plus a normal map derived from the
 * same pixels, so coursing, board joints and grout lines catch the light as
 * relief rather than reading as a flat decal.
 */
const TEX = 2048;

function canvas(size = TEX) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

/**
 * Derives a normal map from a colour map's luminance.
 *
 * A Sobel gradient over the luminance stands in for a height field. It is not
 * a measured height map, but for coursed stone, slates, boards and tiling the
 * dark lines are the recesses, which is exactly what we want lit.
 */
function normalFromCanvas(src, strength = 1.6) {
  const w = src.width;
  const h = src.height;
  const sg = src.getContext('2d').getImageData(0, 0, w, h).data;

  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i += 1) {
    lum[i] = (sg[i * 4] * 0.299 + sg[i * 4 + 1] * 0.587 + sg[i * 4 + 2] * 0.114) / 255;
  }

  const out = canvas(w);
  const ctx = out.getContext('2d');
  const img = ctx.createImageData(w, h);
  const at = (x, y) => lum[((y + h) % h) * w + ((x + w) % w)];

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx =
        at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1) -
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1));
      const dy =
        at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1) -
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1));
      // Normalise (dx, dy, 1/strength) into the 0..1 range a normal map stores.
      const nz = 1 / Math.max(0.05, strength);
      const len = Math.hypot(dx, dy, nz) || 1;
      const i = (y * w + x) * 4;
      img.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

/** Builds the texture set for a drawn canvas. */
export function surface(colourCanvas, { repeat = [1, 1], strength = 1.6, anisotropy = 8 } = {}) {
  const map = new THREE.CanvasTexture(colourCanvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = anisotropy;
  map.repeat.set(repeat[0], repeat[1]);

  const normalMap = new THREE.CanvasTexture(normalFromCanvas(colourCanvas, strength));
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.anisotropy = anisotropy;
  normalMap.repeat.set(repeat[0], repeat[1]);

  return { map, normalMap };
}

/** Procedural Marshalls 'Epoch' style coursed stone. */
export function stoneCanvas() {
  const c = canvas();
  const g = c.getContext('2d');
  const S = c.width;
  g.fillStyle = '#6f6a60';
  g.fillRect(0, 0, S, S);

  const courseH = Math.round(S / 16); // coursed, not random rubble
  for (let y = 0, row = 0; y < S; y += courseH, row += 1) {
    let x = row % 2 ? -Math.round(courseH * 1.1) : 0;
    while (x < S) {
      const w = courseH * (1.7 + Math.random() * 2.4);
      const shade = 0.8 + Math.random() * 0.3;
      const warm = Math.random() * 18;
      g.fillStyle = `rgb(${Math.round(150 * shade + warm)},${Math.round(141 * shade + warm * 0.7)},${Math.round(126 * shade + warm * 0.4)})`;
      g.fillRect(x + 3, y + 3, w - 6, courseH - 6);
      // Tonal mottling and a pitted face within each stone.
      g.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
      g.fillRect(x + 8, y + 7, w - 18, courseH * 0.34);
      for (let i = 0; i < 24; i += 1) {
        g.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.05})`;
        g.fillRect(x + 5 + Math.random() * (w - 12), y + 5 + Math.random() * (courseH - 12), 2 + Math.random() * 5, 2 + Math.random() * 4);
      }
      x += w;
    }
  }
  return c;
}

/** Antique-slate roof covering, as the elevations note. */
export function slateCanvas() {
  const c = canvas();
  const g = c.getContext('2d');
  const S = c.width;
  g.fillStyle = '#2f3033';
  g.fillRect(0, 0, S, S);
  const courseH = Math.round(S / 19);
  const slateW = Math.round(S / 11.6);
  for (let y = 0, row = 0; y < S; y += courseH, row += 1) {
    for (let x = row % 2 ? -slateW / 2 : 0; x < S; x += slateW) {
      const shade = 0.82 + Math.random() * 0.34;
      g.fillStyle = `rgb(${Math.round(62 * shade)},${Math.round(63 * shade)},${Math.round(68 * shade)})`;
      g.fillRect(x + 2, y + 2, slateW - 4, courseH * 1.55);
      g.fillStyle = 'rgba(255,255,255,.04)';
      g.fillRect(x + 2, y + 2, slateW - 4, courseH * 0.5);
      g.fillStyle = 'rgba(0,0,0,.3)';
      g.fillRect(x + 1, y + courseH * 1.44, slateW - 2, 5);
    }
  }
  return c;
}

/** Engineered oak boards, laid in a broken bond. */
export function plankCanvas(tone = '#b08a5f') {
  const c = canvas();
  const g = c.getContext('2d');
  const S = c.width;
  const base = new THREE.Color(tone);
  g.fillStyle = `#${base.getHexString()}`;
  g.fillRect(0, 0, S, S);

  const plankH = Math.round(S / 8);
  for (let y = 0, row = 0; y < S; y += plankH, row += 1) {
    let x = row % 2 ? -Math.round(S * 0.19) : row % 3 ? -Math.round(S * 0.08) : 0;
    while (x < S) {
      const w = S * (0.27 + Math.random() * 0.26);
      const shade = 0.87 + Math.random() * 0.24;
      g.fillStyle = `#${base.clone().multiplyScalar(shade).getHexString()}`;
      g.fillRect(x + 2, y + 2, w - 4, plankH - 4);
      // Grain: darker streaks running the length of the board.
      for (let i = 0; i < 16; i += 1) {
        g.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.07})`;
        g.lineWidth = 1 + Math.random() * 3;
        const gy = y + 10 + Math.random() * (plankH - 20);
        g.beginPath();
        g.moveTo(x + 4, gy);
        g.bezierCurveTo(x + w * 0.3, gy + (Math.random() - 0.5) * 12, x + w * 0.7, gy + (Math.random() - 0.5) * 12, x + w - 4, gy);
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,.26)';
      g.fillRect(x, y, 3, plankH);
      x += w;
    }
    g.fillStyle = 'rgba(0,0,0,.2)';
    g.fillRect(0, y, S, 3);
  }
  return c;
}

/** Loop-pile carpet: fine tonal noise, no pattern. */
export function carpetCanvas(tone = '#b9b2a6') {
  const c = canvas(1024);
  const g = c.getContext('2d');
  const S = c.width;
  const base = new THREE.Color(tone);
  g.fillStyle = `#${base.getHexString()}`;
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 120000; i += 1) {
    const shade = 0.8 + Math.random() * 0.38;
    g.fillStyle = `#${base.clone().multiplyScalar(shade).getHexString()}`;
    g.fillRect(Math.random() * S, Math.random() * S, 2, 3);
  }
  return c;
}

/** Large-format tiling with a fine grout joint. */
export function tileCanvas(tone = '#cdc7bd', across = 3) {
  const c = canvas(1024);
  const g = c.getContext('2d');
  const S = c.width;
  const base = new THREE.Color(tone);
  g.fillStyle = '#a49d94';
  g.fillRect(0, 0, S, S);
  const cell = S / across;
  for (let ty = 0; ty < across; ty += 1) {
    for (let tx = 0; tx < across; tx += 1) {
      const shade = 0.94 + Math.random() * 0.12;
      g.fillStyle = `#${base.clone().multiplyScalar(shade).getHexString()}`;
      g.fillRect(tx * cell + 5, ty * cell + 5, cell - 10, cell - 10);
      // A faint diagonal vein so the tiles are not dead flat.
      const grad = g.createLinearGradient(tx * cell, ty * cell, (tx + 1) * cell, (ty + 1) * cell);
      grad.addColorStop(0, 'rgba(255,255,255,.07)');
      grad.addColorStop(0.55, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(0,0,0,.05)');
      g.fillStyle = grad;
      g.fillRect(tx * cell + 5, ty * cell + 5, cell - 10, cell - 10);
    }
  }
  return c;
}

/** Loft boarding in the eaves stores. */
export function boardCanvas() {
  return plankCanvas('#c3ac8b');
}

/** Grass / planting ground cover. */
export function grassCanvas() {
  const c = canvas(1024);
  const g = c.getContext('2d');
  const S = c.width;
  g.fillStyle = '#5d6b46';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 60000; i += 1) {
    const shade = 0.68 + Math.random() * 0.62;
    g.fillStyle = `rgba(${Math.round(104 * shade)},${Math.round(122 * shade)},${Math.round(72 * shade)},.85)`;
    g.fillRect(Math.random() * S, Math.random() * S, 3, 6);
  }
  return c;
}

/**
 * What you see through the glazing: sky, distant moorland and the garden
 * hedge. Rooms higher up the house get more sky and less hedge, which is what
 * the eye expects from a three-storey plan.
 */
export function viewTexture(level = 'ground') {
  const c = canvas(1024);
  const g = c.getContext('2d');
  const S = c.width;
  const horizon = { ground: 0.62, first: 0.5, second: 0.34 }[level] ?? 0.62;

  const sky = g.createLinearGradient(0, 0, 0, S * horizon);
  sky.addColorStop(0, '#7fa9cd');
  sky.addColorStop(0.55, '#b6d2e6');
  sky.addColorStop(1, '#dcebf4');
  g.fillStyle = sky;
  g.fillRect(0, 0, S, S * horizon);

  // Soft cloud banding.
  g.globalAlpha = 0.45;
  for (let i = 0; i < 14; i += 1) {
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.ellipse(Math.random() * S, Math.random() * S * horizon * 0.8, 90 + Math.random() * 240, 20 + Math.random() * 36, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  // Distant moorland ridge.
  g.fillStyle = '#7f8a79';
  g.beginPath();
  g.moveTo(0, S * horizon);
  for (let x = 0; x <= S; x += 48) {
    g.lineTo(x, S * horizon - 26 - Math.sin(x / 130) * 22 - Math.random() * 12);
  }
  g.lineTo(S, S * horizon);
  g.closePath();
  g.fill();

  // Garden: hedge line then lawn falling away.
  const lawn = g.createLinearGradient(0, S * horizon, 0, S);
  lawn.addColorStop(0, '#56693f');
  lawn.addColorStop(1, '#6f8250');
  g.fillStyle = lawn;
  g.fillRect(0, S * horizon, S, S * (1 - horizon));
  g.fillStyle = '#3f5232';
  for (let x = 0; x < S; x += 34) {
    g.beginPath();
    g.ellipse(x, S * horizon + 12, 30, 42 + Math.random() * 20, 0, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Sky dome and outdoor environment map.
 *
 * Drawn for a sphere rather than for a window: zenith at the top of the
 * canvas, horizon across the middle, ground below. On a SphereGeometry with
 * the default flipY the image's top row lands at the zenith, which is what
 * this ordering assumes.
 */
export function skyTexture() {
  const c = canvas(2048);
  const g = c.getContext('2d');
  const W = c.width;
  const H = c.height;
  const horizon = H * 0.52;

  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#5d8fbd');
  sky.addColorStop(0.45, '#8fb6d6');
  sky.addColorStop(0.85, '#c3daea');
  sky.addColorStop(1, '#dfeaf1');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, horizon);

  // Cloud banding, thinning towards the zenith.
  for (let i = 0; i < 40; i += 1) {
    const y = horizon * (0.18 + Math.random() * 0.78);
    g.globalAlpha = 0.1 + Math.random() * 0.3;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.ellipse(Math.random() * W, y, 120 + Math.random() * 380, 16 + Math.random() * 46, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  // Distant moorland just above the horizon line.
  g.fillStyle = '#76806f';
  g.beginPath();
  g.moveTo(0, horizon);
  for (let x = 0; x <= W; x += 64) {
    g.lineTo(x, horizon - 30 - Math.sin(x / 220) * 26 - Math.random() * 14);
  }
  g.lineTo(W, horizon);
  g.closePath();
  g.fill();

  // Ground below, so the environment map has a plausible bounce colour.
  const ground = g.createLinearGradient(0, horizon, 0, H);
  ground.addColorStop(0, '#5f6d4b');
  ground.addColorStop(1, '#4b5340');
  g.fillStyle = ground;
  g.fillRect(0, horizon, W, H - horizon);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/**
 * Image-based lighting.
 *
 * A pre-filtered environment from a small scene. It is what gives surfaces
 * their soft directional fill and their reflections; ambient and hemisphere
 * lights alone leave everything looking like flat paint.
 *
 * Interiors and exteriors need different surroundings. An interior surface is
 * surrounded by plaster and floor, so its environment is sky above and a warm
 * neutral below — give it the garden instead and every ceiling picks up a
 * green cast off the lawn. The garden stays where it belongs, on the glazing.
 */
const ENV_CACHE = new Map();

function envScene(kind) {
  const scene = new THREE.Scene();

  if (kind === 'exterior') {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(60, 32, 24),
      new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide }),
    ));
  } else {
    // Sky above, warm neutral below, as seen from inside a plastered room.
    const c = canvas(512);
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#cfe2f0');
    grad.addColorStop(0.46, '#eef3f6');
    grad.addColorStop(0.54, '#efeade');
    grad.addColorStop(1, '#b9b1a3');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(60, 32, 24),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide }),
    ));
  }

  // A bright patch standing in for the sun, so reflections have a highlight.
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(7, 16, 12),
    new THREE.MeshBasicMaterial({ color: '#fff6e4' }),
  );
  sun.position.set(-26, 34, -22);
  scene.add(sun);
  return scene;
}

/**
 * The interior surround as a plain equirectangular texture.
 *
 * `makeEnvironment` pre-filters into a PMREM cube, which is what the raster
 * pipeline wants but not what a path tracer can sample — it reads the
 * environment directly and needs the equirect image.
 */
export function interiorEquirect({ width = 512, height = 256, sunBoost = 14 } = {}) {
  // Float data, because a path tracer samples the environment directly and
  // needs real radiance values rather than an 8-bit canvas.
  const data = new Float32Array(width * height * 4);
  const lerp = (a, b, t) => a + (b - a) * t;

  for (let y = 0; y < height; y += 1) {
    const v = y / (height - 1); // 0 = zenith
    // Sky above the horizon, warm neutral floor below it.
    let r;
    let g;
    let b;
    if (v < 0.5) {
      const t = v / 0.5;
      r = lerp(0.66, 0.94, t);
      g = lerp(0.78, 0.96, t);
      b = lerp(0.9, 0.98, t);
    } else {
      const t = (v - 0.5) / 0.5;
      r = lerp(0.93, 0.56, t);
      g = lerp(0.9, 0.52, t);
      b = lerp(0.82, 0.45, t);
    }
    for (let x = 0; x < width; x += 1) {
      const u = x / (width - 1);
      // A bright sun disc, so the trace has a directional key to find.
      const du = Math.min(Math.abs(u - 0.32), 1 - Math.abs(u - 0.32));
      const sun = Math.exp(-((du * du) / 0.0006 + ((v - 0.28) ** 2) / 0.0006));
      const i = (y * width + x) * 4;
      data[i] = r + sun * sunBoost;
      data[i + 1] = g + sun * sunBoost * 0.96;
      data[i + 2] = b + sun * sunBoost * 0.88;
      data[i + 3] = 1;
    }
  }

  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

export function makeEnvironment(renderer, kind = 'interior') {
  const cached = ENV_CACHE.get(kind);
  if (cached) return cached;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromScene(envScene(kind), 0.04).texture;
  pmrem.dispose();
  ENV_CACHE.set(kind, env);
  return env;
}

export function lightInterior(scene, group, room) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.04));
  const hemi = new THREE.HemisphereLight(0xdff0fb, 0x6b6357, 0.14);
  hemi.position.set(0, room.height, 0);
  scene.add(hemi);

  // Collect the openings the walls punched, so lights follow the real glazing.
  const openings = [];
  group.traverse((o) => {
    if (o.userData && Array.isArray(o.userData.openings)) openings.push(...o.userData.openings);
  });
  const windows = openings.filter((o) => o.kind !== 'door' || o.h > 1.9);

  windows.forEach((o) => {
    const light = new THREE.RectAreaLight(0xf2f7ff, 2.5, Math.max(0.5, o.w), Math.max(0.5, o.h));
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

  // One sun, placed *outside* the largest opening at about the height of its
  // head and aimed across the room at floor level. Putting it overhead instead
  // buries it above the ceiling slab, where the only light that reaches the
  // floor is a sliver at the foot of the wall.
  const main = windows.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
  const sun = new THREE.DirectionalLight(0xfff1dc, windows.length ? 2.5 : 0.6);
  const span = Math.max(room.width, room.depth) * 1.5;

  if (main) {
    const head = Math.min(room.height - 0.25, main.sill + main.h * 0.95);
    const out = 6.5;
    // Where the opening is, and where the light should land across from it.
    const place = {
      front: [
        [room.width * 0.72, head, -out],
        [room.width * 0.28, 0.05, room.depth * 0.62],
      ],
      back: [
        [room.width * 0.28, head, room.depth + out],
        [room.width * 0.72, 0.05, room.depth * 0.38],
      ],
      left: [
        [-out, head, room.depth * 0.3],
        [room.width * 0.66, 0.05, room.depth * 0.7],
      ],
      right: [
        [room.width + out, head, room.depth * 0.7],
        [room.width * 0.34, 0.05, room.depth * 0.3],
      ],
    }[main.side] ?? [
      [room.width * 0.72, head, -out],
      [room.width * 0.28, 0.05, room.depth * 0.62],
    ];
    sun.position.set(...place[0]);
    sun.target.position.set(...place[1]);
  } else {
    sun.position.set(room.width / 2 + 4, room.height + 4, room.depth / 2 + 4);
    sun.target.position.set(room.width / 2, 0.6, room.depth / 2);
  }

  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -span;
  sun.shadow.camera.right = span;
  sun.shadow.camera.top = span;
  sun.shadow.camera.bottom = -span;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  scene.add(sun);
  scene.add(sun.target);

  /*
   * Bounce light.
   *
   * A rasteriser has no indirect light at all, and its absence is most of what
   * makes a CG interior look flat: in a real room most of what you see is
   * light that has already hit something else. These stand in for the two
   * bounces that matter — up off the floor, and back off the wall opposite the
   * glazing — at a fraction of the key's intensity and tinted by the surface
   * they are meant to be leaving.
   */
  const floorBounce = new THREE.RectAreaLight(0xffeedd, 0.4, room.width * 0.9, room.depth * 0.9);
  floorBounce.position.set(room.width / 2, 0.04, room.depth / 2);
  floorBounce.lookAt(room.width / 2, room.height, room.depth / 2);
  scene.add(floorBounce);

  if (main) {
    // Off the wall facing the glazing, back into the room.
    const opposite = { front: 'back', back: 'front', left: 'right', right: 'left' }[main.side];
    const bounce = new THREE.RectAreaLight(0xfff4e8, 0.34, room.width * 0.8, room.height * 0.7);
    const mid = room.height * 0.45;
    if (opposite === 'back') {
      bounce.position.set(room.width / 2, mid, room.depth - 0.05);
      bounce.lookAt(room.width / 2, mid, 0);
    } else if (opposite === 'front') {
      bounce.position.set(room.width / 2, mid, 0.05);
      bounce.lookAt(room.width / 2, mid, room.depth);
    } else if (opposite === 'right') {
      bounce.position.set(room.width - 0.05, mid, room.depth / 2);
      bounce.lookAt(0, mid, room.depth / 2);
    } else {
      bounce.position.set(0.05, mid, room.depth / 2);
      bounce.lookAt(room.width, mid, room.depth / 2);
    }
    scene.add(bounce);
  }

  // Warm practicals so ceilings and corners are not dead.
  const lamp = new THREE.PointLight(0xffe9c4, 0.55, Math.max(room.width, room.depth) * 2.2, 2);
  lamp.position.set(room.width / 2, room.height - 0.55, room.depth / 2);
  scene.add(lamp);

  // Internal rooms (bathroom, landings, stores) need a second practical or
  // they render as a dark box — the drawings give them no external opening.
  if (!windows.length) {
    // The drawings give these rooms no external opening, so the ceiling
    // fittings are the light: two practicals down the space plus a lift in
    // the ambient, or they render as a flat grey box.
    [0.3, 0.72].forEach((f) => {
      const fill = new THREE.PointLight(0xfff0d8, 2.1, Math.max(room.width, room.depth) * 2.6, 2);
      fill.position.set(room.width * 0.5, room.height - 0.3, room.depth * f);
      scene.add(fill);
    });
    scene.add(new THREE.AmbientLight(0xfff6ea, 0.1));
    const bounce = new THREE.HemisphereLight(0xfff3e4, 0x9a9384, 0.2);
    scene.add(bounce);
  }
}

export function makeRenderer(canvasEl, width, height) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

/**
 * Camera. `near`/`far` are kept as tight as the subject allows: the ambient
 * occlusion pass reads the depth buffer, and a 0.05–400 range leaves it too
 * little precision to resolve contact shadows in a small room.
 */
export function makeCamera(cam, width, height) {
  const camera = new THREE.PerspectiveCamera(
    cam.fov ?? 60,
    width / height,
    cam.near ?? 0.08,
    cam.far ?? 40,
  );
  camera.position.set(...cam.pos);
  camera.lookAt(new THREE.Vector3(...cam.target));
  camera.updateMatrixWorld();
  return camera;
}

/**
 * Post-processing chain: ambient occlusion, then tone mapping, then SMAA.
 *
 * Ground-truth ambient occlusion is what stops a box-modelled interior reading
 * as cardboard — it puts contact shadow into every corner, under every
 * worktop and around every skirting, which no number of lights will do on
 * its own.
 *
 * The chain is built once and retargeted for each render. It has to be:
 * `EffectComposer.dispose()` frees only its own two render targets, not the
 * ones its passes allocate, so building a fresh chain per frame leaks a few
 * hundred megabytes of render target every time and runs the process out of
 * memory long before a full set of renders is done.
 */
let CHAIN = null;

export function renderFrame(renderer, scene, camera, width, height, { aoRadius = 0.28, mode } = {}) {
  if (!CHAIN || CHAIN.width !== width || CHAIN.height !== height) {
    if (CHAIN) CHAIN.dispose();

    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const ao = new GTAOPass(scene, camera, width, height);
    ao.blendIntensity = 1.2;
    ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 3, samples: 24 });
    composer.addPass(ao);

      /*
     * Bloom, tuned high-threshold and low-strength so that only genuinely
     * blown highlights lift — the glazing, a lamp, a specular on chrome.
     * Interior photography always has some of this and its absence reads as
     * synthetic; too much of it reads as a video game.
     */
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.2, 0.7, 0.88);
    composer.addPass(bloom);

    composer.addPass(new OutputPass());

    // A photographic finish: a gentle S-curve, a little warmth in the
    // highlights, a corner falloff, and just enough grain to break up the
    // flat gradients a renderer produces.
    const grade = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        amount: { value: 1 },
        seed: { value: Math.random() * 100 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float seed;
        varying vec2 vUv;
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453);
        }
        void main() {
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          // Contrast S-curve around mid grey.
          c = mix(c, c * c * (3.0 - 2.0 * c), 0.14 * amount);
          // Warm the highlights, cool the shadows very slightly.
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          c *= mix(vec3(0.996, 0.999, 1.006), vec3(1.016, 1.004, 0.976), l);
          // Vignette.
          vec2 d = vUv - 0.5;
          c *= 1.0 - 0.1 * amount * dot(d, d) * 1.9;
          // Grain, a touch stronger in the shadows as on film.
          float g = (hash(vUv * 1024.0) - 0.5) * 0.016 * amount * (1.25 - l);
          gl_FragColor = vec4(clamp(c + g, 0.0, 1.0), 1.0);
        }`,
    });
    composer.addPass(grade);

    const smaa = new SMAAPass(width, height);
    composer.addPass(smaa);

    CHAIN = {
      width,
      height,
      composer,
      renderPass,
      ao,
      bloom,
      smaa,
      radius: null,
      mode: null,
      dispose() {
        this.ao.dispose();
        this.bloom.dispose?.();
        this.smaa.dispose?.();
        this.renderPass.dispose?.();
        this.composer.dispose();
      },
    };
  }

  const chain = CHAIN;
  chain.renderPass.scene = scene;
  chain.renderPass.camera = camera;
  chain.ao.scene = scene;
  chain.ao.camera = camera;

  // Recompiling the AO shader is only needed when these actually change.
  const wantMode = mode === 'ao' ? GTAOPass.OUTPUT.Denoise : GTAOPass.OUTPUT.Default;
  if (chain.mode !== wantMode) {
    chain.ao.output = wantMode;
    chain.mode = wantMode;
  }
  if (chain.radius !== aoRadius) {
    chain.ao.updateGtaoMaterial({
      radius: aoRadius,
      distanceExponent: 1.0,
      thickness: 1.0,
      scale: 1.0,
      samples: 32,
      distanceFallOff: 1,
      screenSpaceRadius: false,
    });
    chain.radius = aoRadius;
  }

  chain.composer.render();
}
