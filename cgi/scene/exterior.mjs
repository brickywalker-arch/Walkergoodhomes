import * as THREE from 'three';
import { box, boxAt, cyl } from './kit.mjs';
import { surface, stoneCanvas, slateCanvas, grassCanvas, skyTexture } from './stage.mjs';
import { SECTION } from './rooms.mjs';

/**
 * The pair as drawn on sheets 26/1362/03 and /05.
 *
 * Overall block 10.94 m wide × 9.49 m deep: two dwellings of 5.47 m each,
 * handed about a central party wall. The site falls across the frontage, so
 * plot 2 sits a course or two down from plot 1 with the step in roof level
 * the elevations call out ("stepped lead flashings at step in roof level").
 */
export const BLOCK = {
  width: 10.94,
  depth: SECTION.depth,
  unitWidth: 5.47,
  wallPlate: SECTION.wallPlate,
  pitchDeg: SECTION.pitchDeg,
  /** Plot 2 steps down the slope by this much. */
  step: 0.58,
};

const TAN = Math.tan((BLOCK.pitchDeg * Math.PI) / 180);
const RISE = (BLOCK.depth / 2) * TAN;

function stoneMaterial() {
  const { map, normalMap } = surface(stoneCanvas(), { repeat: [4, 3], strength: 2.4 });
  return new THREE.MeshStandardMaterial({
    map,
    normalMap,
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughness: 0.95,
  });
}

/** One dwelling: stone shell, gabled 40° roof, openings and rainwater goods. */
function dwelling(materials, { x, base, handed }) {
  const g = new THREE.Group();
  const w = BLOCK.unitWidth;
  const d = BLOCK.depth;
  const h = BLOCK.wallPlate;

  const stone = materials.stone;
  g.add(box(w, h, 0.32, stone, 0, 0, 0));            // front
  g.add(box(w, h, 0.32, stone, 0, 0, d - 0.32));     // rear
  g.add(box(0.32, h, d, stone, handed ? w - 0.32 : 0, 0, 0)); // outer flank

  // Gable infill above the wall plate on the flank, following the pitch.
  //
  // The shape is drawn in XY and extruded along +z, so it is rotated by -PI/2
  // to lay it in the z-y plane: local +x then runs along +z (the 9.49 m depth)
  // and the extrusion runs back along -x (the 320 mm wall thickness). That
  // makes the anchor the wall's *outer* face.
  const gable = new THREE.Shape();
  gable.moveTo(0, 0);
  gable.lineTo(d, 0);
  gable.lineTo(d / 2, RISE);
  gable.lineTo(0, 0);
  const gableMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(gable, { depth: 0.32, bevelEnabled: false }),
    stone,
  );
  gableMesh.rotation.y = -Math.PI / 2;
  gableMesh.position.set(handed ? w : 0.32, h, 0);
  gableMesh.castShadow = true;
  gableMesh.receiveShadow = true;
  g.add(gableMesh);

  // Roof: two planes meeting at a ridge that runs across the width, so the
  // slopes fall to the front and the rear as the second-floor plan shows.
  const slopeLen = Math.hypot(d / 2, RISE);
  const slate = surface(slateCanvas(), { repeat: [3, 4], strength: 2.0 });
  const roofMat = new THREE.MeshStandardMaterial({
    map: slate.map,
    normalMap: slate.normalMap,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughness: 0.78,
  });
  [-1, 1].forEach((sign) => {
    const plane = new THREE.Mesh(new THREE.BoxGeometry(w + 0.34, 0.16, slopeLen + 0.3), roofMat);
    plane.position.set(w / 2, h + RISE / 2 + 0.02, d / 2 + (sign * d) / 4);
    plane.rotation.x = sign * Math.atan2(RISE, d / 2);
    plane.castShadow = true;
    plane.receiveShadow = true;
    g.add(plane);
  });
  // Ridge and eaves fascia.
  g.add(boxAt(w + 0.36, 0.1, 0.16, materials.frame, w / 2, h + RISE + 0.06, d / 2));
  g.add(boxAt(w + 0.36, 0.2, 0.05, materials.frame, w / 2, h - 0.06, -0.14));
  g.add(boxAt(w + 0.36, 0.2, 0.05, materials.frame, w / 2, h - 0.06, d + 0.14));

  /** Punches an opening and drops glazing into it. */
  const opening = (side, u, sill, ow, oh, kind = 'window') => {
    // Entrance doors are solid; the garden doors D01/D02 are glazed.
    const mat = kind === 'door' ? materials.extDoor : materials.glass;
    // Glazing is recessed 60 mm into the reveal; cills and lintels project.
    if (side === 'front') {
      g.add(boxAt(ow, oh, 0.12, mat, u + ow / 2, sill + oh / 2, 0.06));
      g.add(boxAt(ow + 0.14, 0.09, 0.2, materials.cill, u + ow / 2, sill - 0.045, -0.02));
      g.add(boxAt(ow + 0.12, 0.11, 0.16, materials.lintel, u + ow / 2, sill + oh + 0.055, 0.0));
    } else if (side === 'back') {
      g.add(boxAt(ow, oh, 0.12, mat, u + ow / 2, sill + oh / 2, d - 0.06));
      g.add(boxAt(ow + 0.14, 0.09, 0.2, materials.cill, u + ow / 2, sill - 0.045, d + 0.02));
      g.add(boxAt(ow + 0.12, 0.11, 0.16, materials.lintel, u + ow / 2, sill + oh + 0.055, d));
    } else {
      const glassX = handed ? w - 0.06 : 0.06;
      const cillX = handed ? w + 0.02 : -0.02;
      g.add(boxAt(0.12, oh, ow, mat, glassX, sill + oh / 2, u + ow / 2));
      g.add(boxAt(0.2, 0.09, ow + 0.14, materials.cill, cillX, sill - 0.045, u + ow / 2));
      g.add(boxAt(0.16, 0.11, ow + 0.12, materials.lintel, handed ? w : 0, sill + oh + 0.055, u + ow / 2));
    }
  };

  // Storey datums off the section: 0 / 2.695 / 5.39.
  const L1 = 0;
  const L2 = SECTION.storeyClear + SECTION.floorZone;
  const L3 = L2 * 2;

  // Front elevation: entrance door D07 plus the kitchen and hall windows.
  opening('front', handed ? w - 1.35 : 0.45, L1, 0.95, 2.08, 'door');
  opening('front', handed ? w - 3.1 : 1.7, L1 + 0.9, 1.0, 1.2);
  opening('front', handed ? w - 4.55 : 3.15, L1 + 0.9, 1.0, 1.2);
  // First floor front: bedroom 3, W16 / W17.
  opening('front', handed ? w - 2.2 : 1.05, L2 + 0.9, 1.05, 1.2);
  opening('front', handed ? w - 4.3 : 3.15, L2 + 0.9, 1.05, 1.2);

  // Rear elevation: garden doors D01/D02, window W01, master windows above.
  opening('back', handed ? w - 2.6 : 0.85, L1, 1.75, 2.1);
  opening('back', handed ? w - 4.35 : 2.85, L1 + 0.9, 1.5, 1.2);
  opening('back', handed ? w - 2.1 : 0.95, L2 + 0.9, 1.1, 1.2);
  opening('back', handed ? w - 4.2 : 2.6, L2 + 0.9, 1.1, 1.2);

  // Flank gable: one window per storey, as the side elevations show.
  opening('flank', 2.1, L1 + 0.9, 1.0, 1.2);
  opening('flank', 2.1, L2 + 0.9, 1.0, 1.2);
  opening('flank', 2.1, L3 + 0.6, 0.9, 1.1);

  // Rooflights RL01 / RL02, set into the rear slope.
  [w * 0.36, w * 0.66].forEach((rx) => {
    const along = d / 2 + d * 0.16;
    const y = h + (d / 2 - (along - d / 2)) * TAN;
    const rl = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.07, 0.95), materials.glass);
    rl.position.set(rx, y + 0.11, along);
    rl.rotation.x = Math.atan2(RISE, d / 2);
    rl.castShadow = true;
    g.add(rl);
  });

  // Rainwater goods and the soil vent pipe noted on the block plan.
  const rwpX = handed ? w - 0.14 : 0.14;
  g.add(cyl(0.05, h, materials.frame, rwpX, h / 2, -0.12, 10));
  g.add(cyl(0.055, h, materials.frame, rwpX, h / 2, d + 0.12, 10));

  g.position.set(x, base, 0);
  return g;
}

/** Sky dome, ground, boundary walls, drive and planting. */
function setting(materials) {
  const g = new THREE.Group();

  // Sky dome. A flat background colour gives the hero shot no horizon and no
  // cloud, which reads as a studio backdrop rather than a Pennine hillside.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(190, 48, 32),
    new THREE.MeshBasicMaterial({
      map: skyTexture(),
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  sky.position.set(BLOCK.width / 2, -10, BLOCK.depth / 2);
  g.add(sky);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), materials.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(BLOCK.width / 2, -0.02, BLOCK.depth / 2);
  ground.receiveShadow = true;
  g.add(ground);

  // Block-paved drive and parking to the front, per sheet 06.
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 8.5), materials.paving);
  drive.rotation.x = -Math.PI / 2;
  drive.position.set(BLOCK.width / 2, 0.005, -4.6);
  drive.receiveShadow = true;
  g.add(drive);

  // Rear terrace off the garden doors.
  const terrace = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 3.4), materials.paving);
  terrace.rotation.x = -Math.PI / 2;
  terrace.position.set(BLOCK.width / 2, 0.005, BLOCK.depth + 1.7);
  terrace.receiveShadow = true;
  g.add(terrace);

  // Coursed stone boundary walls to the plot edges.
  g.add(box(0.35, 1.1, 22, materials.stone, -3.2, -0.3, -7));
  g.add(box(0.35, 1.0, 22, materials.stone, BLOCK.width + 2.9, -0.55, -7));
  g.add(box(16, 0.95, 0.35, materials.stone, -3.2, -0.5, BLOCK.depth + 5.2));

  // Trees at the boundary, as the front elevation shows beside the pair.
  const tree = (x, z, h) => {
    const t = new THREE.Group();
    t.add(cyl(0.16, h * 0.42, materials.trunk, x, h * 0.21, z, 8));
    [0.58, 0.78, 0.95].forEach((f, i) => {
      const crown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(h * (0.34 - i * 0.07), 1),
        materials.foliage,
      );
      crown.position.set(x + (i - 1) * 0.28, h * f, z + (i % 2 ? 0.3 : -0.25));
      crown.castShadow = true;
      t.add(crown);
    });
    return t;
  };
  g.add(tree(BLOCK.width + 5.2, 8.4, 5.8));
  g.add(tree(-5.0, 11.0, 5.0));
  g.add(tree(-7.5, 17.5, 4.4));

  // A car on the drive gives the massing its scale.
  const car = new THREE.Group();
  car.add(boxAt(1.82, 0.62, 4.3, materials.carBody, 0, 0.55, 0));
  car.add(boxAt(1.64, 0.5, 2.3, materials.carGlass, 0, 1.06, -0.18));
  [[-0.86, 1.42], [0.86, 1.42], [-0.86, -1.42], [0.86, -1.42]].forEach(([wx, wz]) => {
    const wheel = cyl(0.33, 0.22, materials.frame, wx, 0.33, wz, 16);
    wheel.rotation.z = Math.PI / 2;
    car.add(wheel);
  });
  car.position.set(BLOCK.width * 0.3, 0, -3.1);
  car.rotation.y = 0.16;
  g.add(car);

  return g;
}

export function buildExterior(materials) {
  const mats = {
    stone: stoneMaterial(),
    frame: new THREE.MeshStandardMaterial({ color: '#3a3f44', roughness: 0.5 }),
    glass: new THREE.MeshStandardMaterial({ color: '#7f9db0', roughness: 0.08, metalness: 0.5 }),
    extDoor: new THREE.MeshStandardMaterial({ color: '#2f3a33', roughness: 0.45 }),
    cill: new THREE.MeshStandardMaterial({ color: '#bdb6a8', roughness: 0.8 }),
    lintel: new THREE.MeshStandardMaterial({ color: '#b5ada0', roughness: 0.85 }),
    grass: (() => {
      const { map, normalMap } = surface(grassCanvas(), { repeat: [130, 130], strength: 0.9 });
      return new THREE.MeshStandardMaterial({
        map,
        normalMap,
        normalScale: new THREE.Vector2(0.4, 0.4),
        roughness: 1,
        color: 0xcfd2c4,
      });
    })(),
    paving: new THREE.MeshStandardMaterial({ color: '#8e8b85', roughness: 0.92 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#4d4034', roughness: 0.95 }),
    foliage: new THREE.MeshStandardMaterial({ color: '#4e6640', roughness: 0.96 }),
    carBody: new THREE.MeshStandardMaterial({ color: '#1f2a33', roughness: 0.32, metalness: 0.5 }),
    carGlass: new THREE.MeshStandardMaterial({ color: '#20262b', roughness: 0.12, metalness: 0.6 }),
    ...materials,
  };

  const g = new THREE.Group();
  g.add(dwelling(mats, { x: 0, base: 0, handed: false }));
  g.add(dwelling(mats, { x: BLOCK.unitWidth, base: -BLOCK.step, handed: true }));
  g.add(setting(mats));
  return g;
}

/** Exterior lighting: a low Yorkshire sun with a cool sky fill. */
export function lightExterior(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const hemi = new THREE.HemisphereLight(0xbcd9f0, 0x53523f, 0.42);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.1);
  sun.position.set(-9.5, 21, -18);
  sun.target.position.set(BLOCK.width / 2, 2.5, BLOCK.depth / 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.028;
  sun.shadow.radius = 2;
  scene.add(sun);
  scene.add(sun.target);
  return sun;
}

/**
 * Named exterior views. Positions are in metres in block coordinates.
 *
 * `aspect` is the frame the view is rendered at, so a view that will be shown
 * in a portrait card is composed as a portrait rather than cropped out of a
 * landscape render.
 */
export const EXTERIOR_VIEWS = {
  hero: { pos: [-10.4, 4.2, -12.4], target: [6.0, 3.4, 2.6], fov: 46, aspect: [16, 9], near: 0.5, far: 260 },
  'plot-1': { pos: [-9.6, 3.4, -12.5], target: [2.6, 3.2, 1.6], fov: 40, aspect: [16, 9], near: 0.5, far: 260 },
  'plot-2': { pos: [21.5, 3.7, -12.0], target: [8.0, 3.2, 1.8], fov: 38, aspect: [16, 9], near: 0.5, far: 260 },
  frontage: { pos: [5.4, 3.4, -23.0], target: [5.4, 3.6, 4.0], fov: 38, aspect: [16, 9], near: 0.5, far: 260 },
  garden: { pos: [16.5, 4.2, 22.0], target: [5.0, 3.0, 6.0], fov: 40, aspect: [16, 9], near: 0.5, far: 260 },
  street: { pos: [-15.0, 2.2, -17.5], target: [4.6, 3.8, 1.8], fov: 52, aspect: [16, 9], near: 0.5, far: 260 },
  // Portrait compositions for the two plot cards on the development section.
  'plot-1-card': { pos: [-6.6, 3.0, -12.4], target: [2.6, 3.6, 1.4], fov: 44, aspect: [4, 5], near: 0.5, far: 260 },
  'plot-2-card': { pos: [16.8, 3.0, -13.2], target: [8.4, 3.6, 1.5], fov: 44, aspect: [4, 5], near: 0.5, far: 260 },
};
