import * as THREE from 'three';

/**
 * Building kit.
 *
 * Everything is modelled in metres with the room's front-left floor corner at
 * the origin: +x across the room, +y up, +z into the room. Openings are cut by
 * composing the wall from segments rather than by CSG — cheaper, and it gives
 * us the reveals for free.
 */

export const box = (w, h, d, material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

/** Centre-positioned box, for furniture where the centre is the natural anchor. */
export const boxAt = (w, h, d, material, cx, cy, cz) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(cx, cy, cz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

export const cyl = (r, h, material, cx, cy, cz, seg = 20) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), material);
  mesh.position.set(cx, cy, cz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

export const group = (...children) => {
  const g = new THREE.Group();
  children.flat().filter(Boolean).forEach((c) => g.add(c));
  return g;
};

const T = 0.1; // nominal internal wall thickness shown in the render

/**
 * A wall with rectangular openings punched through it.
 *
 * `side` names which face of the room the wall is: 'front' (z = 0),
 * 'back' (z = depth), 'left' (x = 0) or 'right' (x = width). Openings are
 * given along the wall's own horizontal axis as { u, w, sill, h }, measured
 * left-to-right when facing the wall from inside the room.
 */
export function wall({ side, width, depth, height, material, openings = [], thickness = T }) {
  const g = new THREE.Group();
  const span = side === 'front' || side === 'back' ? width : depth;

  // Sort and clamp so overlapping or out-of-range openings cannot produce
  // negative-width segments (which render as inside-out boxes).
  const cuts = openings
    .map((o) => ({
      u: Math.max(0, Math.min(span, o.u)),
      w: Math.max(0, Math.min(span - Math.max(0, o.u), o.w)),
      sill: Math.max(0, o.sill),
      h: Math.max(0, Math.min(height - Math.max(0, o.sill), o.h)),
      kind: o.kind ?? 'window',
      reveal: o.reveal,
    }))
    .filter((o) => o.w > 0.001 && o.h > 0.001)
    .sort((a, b) => a.u - b.u);

  const pieces = [];
  let cursor = 0;
  for (const o of cuts) {
    if (o.u > cursor) pieces.push({ u: cursor, w: o.u - cursor, sill: 0, h: height });
    // under and over the opening
    if (o.sill > 0) pieces.push({ u: o.u, w: o.w, sill: 0, h: o.sill });
    const headY = o.sill + o.h;
    if (headY < height) pieces.push({ u: o.u, w: o.w, sill: headY, h: height - headY });
    cursor = Math.max(cursor, o.u + o.w);
  }
  if (cursor < span) pieces.push({ u: cursor, w: span - cursor, sill: 0, h: height });

  for (const p of pieces) {
    let mesh;
    if (side === 'front') mesh = box(p.w, p.h, thickness, material, p.u, p.sill, -thickness);
    else if (side === 'back') mesh = box(p.w, p.h, thickness, material, width - p.u - p.w, p.sill, depth);
    else if (side === 'left') mesh = box(thickness, p.h, p.w, material, -thickness, p.sill, depth - p.u - p.w);
    else mesh = box(thickness, p.h, p.w, material, width, p.sill, p.u);
    g.add(mesh);
  }

  g.userData.openings = cuts.map((o) => ({ ...o, side }));
  return g;
}

/**
 * Places a mesh against a wall, converting the wall-local (u, v) coordinate
 * into room coordinates. Returns { x, z, rotY } for the caller to apply.
 */
export function onWall(side, { width, depth }, u, inset = 0) {
  switch (side) {
    case 'front':
      return { x: u, z: inset, rotY: 0 };
    case 'back':
      return { x: width - u, z: depth - inset, rotY: Math.PI };
    case 'left':
      return { x: inset, z: depth - u, rotY: Math.PI / 2 };
    default:
      return { x: width - inset, z: u, rotY: -Math.PI / 2 };
  }
}

/** Window glazing, reveals and a bright plane of sky behind it. */
export function glazing({ side, opening, room, materials, thickness = T }) {
  const g = new THREE.Group();
  const { u, w, sill, h } = opening;
  const { width, depth } = room;
  const frameW = 0.055;

  const place = (mesh) => g.add(mesh);

  const panel = (localU, localW, localSill, localH, depthPos, mat) => {
    if (side === 'front') return box(localW, localH, 0.02, mat, localU, localSill, depthPos);
    if (side === 'back') return box(localW, localH, 0.02, mat, width - localU - localW, localSill, depth - depthPos - 0.02);
    if (side === 'left') return box(0.02, localH, localW, mat, depthPos, localSill, depth - localU - localW);
    return box(0.02, localH, localW, mat, width - depthPos - 0.02, localSill, localU);
  };

  // Glass sits mid-wall; sky sits just outside it.
  place(panel(u, w, sill, h, -thickness * 0.55, materials.glass));
  place(panel(u, w, sill, h, -thickness * 1.6, materials.sky));

  // Frame: head, cill and two jambs, plus one central mullion on wide openings.
  place(panel(u, w, sill, frameW, -thickness * 0.5, materials.frame));
  place(panel(u, w, sill + h - frameW, frameW, -thickness * 0.5, materials.frame));
  place(panel(u, frameW, sill, h, -thickness * 0.5, materials.frame));
  place(panel(u + w - frameW, frameW, sill, h, -thickness * 0.5, materials.frame));
  if (w > 1.1) place(panel(u + w / 2 - frameW / 2, frameW, sill, h, -thickness * 0.5, materials.frame));

  // Reveals — the returns of the opening, which give the wall its thickness.
  place(panel(u, w, sill - 0.03, 0.03, -thickness, materials.reveal));
  return g;
}

/** A door in its lining, optionally shown ajar. */
export function door({ side, room, u, width: dw = 0.76, height: dh = 2.0, materials, open = 0 }) {
  const g = new THREE.Group();
  const { width, depth } = room;
  const lining = 0.06;

  const panel = (localU, localW, localSill, localH, depthPos, mat) => {
    if (side === 'front') return box(localW, localH, 0.045, mat, localU, localSill, depthPos);
    if (side === 'back') return box(localW, localH, 0.045, mat, width - localU - localW, localSill, depth - depthPos - 0.045);
    if (side === 'left') return box(0.045, localH, localW, mat, depthPos, localSill, depth - localU - localW);
    return box(0.045, localH, localW, mat, width - depthPos - 0.045, localSill, localU);
  };

  // Architrave around the opening.
  g.add(panel(u - lining, lining, 0, dh + lining, 0.005, materials.doorFrame));
  g.add(panel(u + dw, lining, 0, dh + lining, 0.005, materials.doorFrame));
  g.add(panel(u - lining, dw + lining * 2, dh, lining, 0.005, materials.doorFrame));

  if (open > 0.02) {
    // Swing the leaf on its hinge edge.
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, 0.045), materials.door);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    leaf.position.set(dw / 2, dh / 2, 0);
    const pivot = new THREE.Group();
    pivot.add(leaf);
    const at = onWall(side, room, u, 0.02);
    pivot.position.set(at.x, 0, at.z);
    pivot.rotation.y = at.rotY + open;
    g.add(pivot);
  } else {
    g.add(panel(u, dw, 0, dh, 0.02, materials.door));
    const handleU = u + dw - 0.1;
    g.add(panel(handleU, 0.04, 1.02, 0.04, 0.06, materials.steel));
  }
  return g;
}

/**
 * Skirting run around the room. The door linings sit proud of it, so the runs
 * are drawn unbroken and the joinery reads over the top.
 */
export function skirting(room, materials, { height = 0.115 } = {}) {
  const { width, depth } = room;
  const t = 0.018;
  const g = new THREE.Group();
  g.add(box(width, height, t, materials.skirting, 0, 0, 0));
  g.add(box(width, height, t, materials.skirting, 0, 0, depth - t));
  g.add(box(t, height, depth, materials.skirting, 0, 0, 0));
  g.add(box(t, height, depth, materials.skirting, width - t, 0, 0));
  return g;
}

/** Large-format wall tiling to a given height. */
export function tiledWalls(room, materials, height = 1.2, sides = ['front', 'back', 'left', 'right']) {
  const { width, depth } = room;
  const t = 0.012;
  const g = new THREE.Group();
  // One texture tile per 1.2 m so a 600 mm format reads at the same size on
  // every wall, whatever the room.
  const faced = (span) => {
    const mat = materials.tileWall.clone();
    if (mat.map) {
      mat.map = mat.map.clone();
      mat.map.needsUpdate = true;
      mat.map.repeat.set(Math.max(1, span / 1.2), Math.max(1, height / 1.2));
    }
    return mat;
  };
  if (sides.includes('front')) g.add(box(width, height, t, faced(width), 0, 0, 0));
  if (sides.includes('back')) g.add(box(width, height, t, faced(width), 0, 0, depth - t));
  if (sides.includes('left')) g.add(box(t, height, depth, faced(depth), 0, 0, 0));
  if (sides.includes('right')) g.add(box(t, height, depth, faced(depth), width - t, 0, 0));
  return g;
}

/** A simple upholstered seat: base, back, arms and cushions. */
export function sofa(materials, { width: w = 2.1, depth: d = 0.88, seatH = 0.42 } = {}) {
  const g = new THREE.Group();
  const arm = 0.18;
  g.add(box(w, seatH - 0.1, d, materials.fabricDeep, 0, 0.1, 0));
  g.add(box(w, 0.55, 0.16, materials.fabricDeep, 0, seatH - 0.1, d - 0.16));
  g.add(box(arm, 0.28, d, materials.fabricDeep, 0, seatH - 0.1, 0));
  g.add(box(arm, 0.28, d, materials.fabricDeep, w - arm, seatH - 0.1, 0));
  const cushions = Math.max(2, Math.round(w / 0.72));
  const cw = (w - arm * 2 - 0.04) / cushions;
  for (let i = 0; i < cushions; i += 1) {
    g.add(box(cw - 0.03, 0.13, d - 0.24, materials.fabricWarm, arm + 0.02 + i * cw, seatH - 0.1, 0.06));
  }
  [0.1, w - 0.14].forEach((x) => {
    g.add(box(0.06, 0.1, 0.06, materials.timberDark, x, 0, 0.08));
    g.add(box(0.06, 0.1, 0.06, materials.timberDark, x, 0, d - 0.14));
  });
  return g;
}

/** A made bed: divan, mattress, duvet, pillows and a headboard. */
export function bed(materials, { width: w = 1.5, length: l = 2.0 } = {}) {
  const g = new THREE.Group();
  g.add(box(w, 0.28, l, materials.fabricWarm, 0, 0.06, 0));      // divan base
  g.add(box(w, 0.24, l, materials.linen, 0, 0.34, 0));            // mattress
  // Duvet over the lower two-thirds, with a turned-down sheet at the head.
  g.add(box(w + 0.05, 0.13, l * 0.66, materials.fabricWarm, -0.025, 0.56, 0));
  g.add(box(w + 0.04, 0.05, 0.2, materials.linen, -0.02, 0.66, l * 0.66));
  const pw = (w - 0.14) / 2;
  [0.045, 0.095 + pw].forEach((px) => {
    const pillow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 10), materials.linen);
    pillow.scale.set(pw, 0.14, 0.4);
    pillow.position.set(px + pw / 2, 0.64, l - 0.34);
    pillow.castShadow = true;
    pillow.receiveShadow = true;
    g.add(pillow);
  });
  g.add(box(w + 0.08, 0.78, 0.07, materials.fabricDeep, -0.04, 0, l));
  return g;
}

/** Dining or work table with legs. */
export function table(materials, { width: w = 1.6, depth: d = 0.9, height: h = 0.75, top } = {}) {
  const g = new THREE.Group();
  const mat = top ?? materials.timberDark;
  g.add(box(w, 0.045, d, mat, 0, h - 0.045, 0));
  const inset = 0.09;
  [[inset, inset], [w - inset - 0.06, inset], [inset, d - inset - 0.06], [w - inset - 0.06, d - inset - 0.06]].forEach(
    ([x, z]) => g.add(box(0.06, h - 0.045, 0.06, mat, x, 0, z)),
  );
  return g;
}

export function chair(materials, { seatH = 0.45 } = {}) {
  const g = new THREE.Group();
  const w = 0.44;
  const d = 0.45;
  g.add(box(w, 0.035, d, materials.timberDark, 0, seatH, 0));
  g.add(box(w - 0.06, 0.055, d - 0.07, materials.fabricWarm, 0.03, seatH + 0.035, 0.035));
  // Back: two stiles and a shaped rail, leaning back slightly.
  const back = new THREE.Group();
  back.add(box(0.045, 0.5, 0.035, materials.timberDark, 0, 0, 0));
  back.add(box(0.045, 0.5, 0.035, materials.timberDark, w - 0.045, 0, 0));
  back.add(box(w, 0.15, 0.04, materials.timberDark, 0, 0.33, -0.004));
  back.add(box(w - 0.1, 0.08, 0.035, materials.timberDark, 0.05, 0.1, 0));
  back.position.set(0, seatH + 0.035, d - 0.05);
  back.rotation.x = -0.1;
  g.add(back);
  [[0.02, 0.02], [w - 0.065, 0.02], [0.02, d - 0.065], [w - 0.065, d - 0.065]].forEach(([x, z]) =>
    g.add(box(0.045, seatH, 0.045, materials.timberDark, x, 0, z)),
  );
  return g;
}

/** Surface-mounted bulkhead light for rooms the drawings give no window. */
export function bulkhead(materials, cx, cz, ceilingH) {
  const g = new THREE.Group();
  g.add(cyl(0.11, 0.06, materials.skirting, cx, ceilingH - 0.03, cz, 18));
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.02, 18),
    new THREE.MeshBasicMaterial({ color: '#fff6e2' }),
  );
  lens.position.set(cx, ceilingH - 0.07, cz);
  g.add(lens);
  return g;
}

/** Flat-panel joinery run: carcasses, doors with a shadow gap, and handles. */
export function unitRun(materials, { length, height, depth: d, doorMat, count, handle = 'bar', plinth = 0.09 }) {
  const g = new THREE.Group();
  g.add(box(length, plinth, d - 0.05, materials.frame, 0, 0, 0.05));
  const bodyH = height - plinth;
  const n = count ?? Math.max(1, Math.round(length / 0.6));
  const cw = length / n;
  for (let i = 0; i < n; i += 1) {
    g.add(box(cw - 0.006, bodyH - 0.006, d, doorMat, i * cw + 0.003, plinth + 0.003, 0));
    if (handle === 'bar') {
      g.add(box(cw * 0.5, 0.018, 0.022, materials.steel, i * cw + cw * 0.25, plinth + bodyH - 0.1, d));
    }
  }
  return g;
}

/** A framed picture or mirror on a wall. */
export function panelOnWall(side, room, materials, { u, sill, width: w, height: h, material }) {
  const { width, depth } = room;
  const t = 0.03;
  if (side === 'front') return box(w, h, t, material, u, sill, 0.01);
  if (side === 'back') return box(w, h, t, material, width - u - w, sill, depth - t - 0.01);
  if (side === 'left') return box(t, h, w, material, 0.01, sill, depth - u - w);
  return box(t, h, w, material, width - t - 0.01, sill, u);
}

/** Pendant light: flex, shade and a small emissive disc. */
export function pendant(materials, cx, cz, ceilingH, { drop = 0.85, radius = 0.15 } = {}) {
  const g = new THREE.Group();
  g.add(cyl(0.006, drop, materials.frame, cx, ceilingH - drop / 2, cz, 8));
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(radius, 0.18, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.5, side: THREE.DoubleSide }),
  );
  shade.position.set(cx, ceilingH - drop, cz);
  shade.rotation.x = Math.PI;
  g.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 10),
    new THREE.MeshBasicMaterial({ color: '#fff3d8' }),
  );
  bulb.position.set(cx, ceilingH - drop - 0.06, cz);
  g.add(bulb);
  return g;
}

/** Potted plant — a pot and a couple of foliage masses. */
export function plant(materials, cx, cz, { height: h = 0.9 } = {}) {
  const g = new THREE.Group();
  g.add(cyl(0.17, 0.32, materials.frame, cx, 0.16, cz, 16));
  g.add(cyl(0.028, h * 0.4, materials.timberDark, cx, 0.32 + h * 0.2, cz, 8));
  const masses = [
    { r: h * 0.3, y: 0.34 + h * 0.52, dx: 0, dz: 0 },
    { r: h * 0.21, y: 0.34 + h * 0.36, dx: h * 0.16, dz: h * 0.1 },
    { r: h * 0.18, y: 0.34 + h * 0.68, dx: -h * 0.12, dz: -h * 0.08 },
  ];
  masses.forEach((m) => {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(m.r, 1), materials.plant);
    blob.position.set(cx + m.dx, m.y, cz + m.dz);
    blob.scale.set(1, 0.86, 1);
    blob.castShadow = true;
    blob.receiveShadow = true;
    g.add(blob);
  });
  return g;
}

/** A rug lying just above the floor so it never z-fights. */
export function rug(materials, x, z, w, d, material) {
  const mat = (material ?? materials.rug).clone();
  if (mat.map) {
    mat.map = mat.map.clone();
    mat.map.needsUpdate = true;
    mat.map.repeat.set(Math.max(1, w / 1.4), Math.max(1, d / 1.4));
  }
  return box(w, 0.014, d, mat, x, 0.003, z);
}

/** Straight stair flight with treads, risers and a balustrade. */
export function stair(materials, { steps = 13, rise = 0.19, going = 0.24, width: w = 0.9 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < steps; i += 1) {
    g.add(box(w, 0.045, going, materials.oakFloor, 0, i * rise, i * going));
    g.add(box(w, rise - 0.045, 0.02, materials.skirting, 0, i * rise + 0.045, i * going));
  }
  const runH = steps * rise;
  const runD = steps * going;
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, Math.hypot(runH, runD)), materials.timberDark);
  rail.position.set(w - 0.03, runH / 2 + 0.95, runD / 2);
  rail.rotation.x = -Math.atan2(runH, runD);
  rail.castShadow = true;
  g.add(rail);
  for (let i = 0; i < steps; i += 2) {
    g.add(box(0.03, 0.9, 0.03, materials.skirting, w - 0.045, i * rise + 0.045, i * going + going / 2));
  }
  return g;
}
