import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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

/**
 * Rounded box, for anything that is not architecture.
 *
 * Real joinery and furniture have a radius or an arris on every edge; a
 * perfectly sharp one is the single most reliable giveaway that an interior is
 * computer-generated. Walls and floors stay sharp (they meet in a caulked
 * line), but everything you could put a hand on goes through here.
 */
export const rbox = (w, h, d, material, x = 0, y = 0, z = 0, radius = 0.006) => {
  const r = Math.max(0.0005, Math.min(radius, Math.min(w, h, d) / 2.2));
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), material);
  mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

/** Centre-anchored rounded box. */
export const rboxAt = (w, h, d, material, cx, cy, cz, radius = 0.006) => {
  const r = Math.max(0.0005, Math.min(radius, Math.min(w, h, d) / 2.2));
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), material);
  mesh.position.set(cx, cy, cz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
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
    const leaf = panelDoor(dw, dh, materials.door);
    const pivot = new THREE.Group();
    pivot.add(leaf);
    const at = onWall(side, room, u, 0.02);
    pivot.position.set(at.x, 0, at.z);
    pivot.rotation.y = at.rotY + open;
    g.add(pivot);
    // Lever on a rose, at the standard 1.04 m.
    const lever = new THREE.Group();
    lever.add(cyl(0.026, 0.012, materials.steel, dw - 0.07, 1.04, 0.03, 14));
    lever.add(rboxAt(0.02, 0.018, 0.1, materials.steel, dw - 0.07, 1.04, 0.085, 0.008));
    pivot.add(lever);
  } else {
    // Closed leaf, set into the lining.
    const at = onWall(side, room, u, 0.02);
    const leaf = panelDoor(dw, dh, materials.door);
    leaf.position.set(at.x, 0, at.z);
    leaf.rotation.y = at.rotY;
    g.add(leaf);
    const lever = new THREE.Group();
    lever.add(cyl(0.026, 0.012, materials.steel, dw - 0.07, 1.04, 0.03, 14));
    lever.add(rboxAt(0.02, 0.018, 0.09, materials.steel, dw - 0.07, 1.04, 0.08, 0.008));
    lever.position.set(at.x, 0, at.z);
    lever.rotation.y = at.rotY;
    g.add(lever);
  }
  return g;
}

/**
 * Skirting run around the room. The door linings sit proud of it, so the runs
 * are drawn unbroken and the joinery reads over the top.
 */
export function skirting(room, materials, { height = 0.119 } = {}) {
  const { width, depth } = room;
  const t = 0.018;
  const g = new THREE.Group();
  // Board plus a proud top bead, so the run catches a highlight along its
  // length instead of reading as a painted stripe.
  const run = (w, h, d, x, y, z) => {
    g.add(box(w, h, d, materials.skirting, x, y, z));
    if (w > d) g.add(rbox(w, 0.012, d + 0.004, materials.skirting, x, y + h - 0.012, z - 0.002, 0.004));
    else g.add(rbox(w + 0.004, 0.012, d, materials.skirting, x - 0.002, y + h - 0.012, z, 0.004));
  };
  run(width, height, t, 0, 0, 0);
  run(width, height, t, 0, 0, depth - t);
  run(t, height, depth, 0, 0, 0);
  run(t, height, depth, width - t, 0, 0);
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
  const arm = 0.19;
  // Frame, back and arms, all with a generous radius.
  g.add(rbox(w, seatH - 0.1, d, materials.fabricDeep, 0, 0.1, 0, 0.03));
  g.add(rbox(w, 0.56, 0.17, materials.fabricDeep, 0, seatH - 0.1, d - 0.17, 0.05));
  g.add(rbox(arm, 0.3, d, materials.fabricDeep, 0, seatH - 0.1, 0, 0.07));
  g.add(rbox(arm, 0.3, d, materials.fabricDeep, w - arm, seatH - 0.1, 0, 0.07));

  const cushions = Math.max(2, Math.round(w / 0.72));
  const cw = (w - arm * 2 - 0.04) / cushions;
  for (let i = 0; i < cushions; i += 1) {
    const x = arm + 0.02 + i * cw;
    // Seat cushion, plumped: a rounded box that sags very slightly.
    g.add(rbox(cw - 0.026, 0.135, d - 0.25, materials.fabricWarm, x, seatH - 0.1, 0.06, 0.05));
    // Back cushion, leaning into the back.
    const back = rbox(cw - 0.05, 0.42, 0.15, materials.fabricWarm, 0, 0, 0, 0.055);
    back.position.set(x + (cw - 0.05) / 2, seatH + 0.14, d - 0.24);
    back.rotation.x = -0.12;
    g.add(back);
  }
  // A scatter cushion, set on the angle a real one falls at.
  const scatter = rbox(0.4, 0.4, 0.13, materials.linen, 0, 0, 0, 0.05);
  scatter.position.set(arm + 0.3, seatH + 0.22, d - 0.3);
  scatter.rotation.set(-0.18, 0.22, 0.14);
  g.add(scatter);

  [0.11, w - 0.15].forEach((x) => {
    g.add(cyl(0.022, 0.1, materials.timberDark, x, 0.05, 0.11, 10));
    g.add(cyl(0.022, 0.1, materials.timberDark, x, 0.05, d - 0.13, 10));
  });
  return g;
}

/** A made bed: divan, mattress, duvet, pillows and a headboard. */
export function bed(materials, { width: w = 1.5, length: l = 2.0 } = {}) {
  const g = new THREE.Group();
  g.add(rbox(w, 0.28, l, materials.fabricWarm, 0, 0.06, 0, 0.012)); // divan base
  g.add(rbox(w, 0.24, l, materials.linen, 0, 0.34, 0, 0.022));       // mattress
  // Duvet over the lower two-thirds, draping over the sides, with a
  // turned-down sheet at the head and a fold across the foot.
  g.add(rbox(w + 0.06, 0.14, l * 0.66, materials.fabricWarm, -0.03, 0.555, 0, 0.055));
  const fold = rbox(w + 0.05, 0.075, 0.26, materials.fabricWarm, 0, 0, 0, 0.035);
  fold.position.set((w + 0.05) / 2 - 0.025, 0.7, l * 0.2);
  fold.rotation.x = 0.06;
  g.add(fold);
  g.add(rbox(w + 0.045, 0.055, 0.22, materials.linen, -0.022, 0.655, l * 0.66, 0.025));
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
  // Top with an eased edge, and a rail set in from the legs — a slab on four
  // posts reads as a block, which is what it looked like before.
  g.add(rbox(w, 0.038, d, mat, 0, h - 0.038, 0, 0.005));
  const inset = 0.085;
  const legT = 0.055;
  g.add(rbox(w - inset * 2, 0.055, legT, mat, inset, h - 0.11, inset + 0.01, 0.004));
  g.add(rbox(w - inset * 2, 0.055, legT, mat, inset, h - 0.11, d - inset - legT - 0.01, 0.004));
  [
    [inset, inset],
    [w - inset - legT, inset],
    [inset, d - inset - legT],
    [w - inset - legT, d - inset - legT],
  ].forEach(([x, z]) => g.add(rbox(legT, h - 0.038, legT, mat, x, 0, z, 0.005)));
  return g;
}

export function chair(materials, { seatH = 0.45 } = {}) {
  const g = new THREE.Group();
  const w = 0.44;
  const d = 0.45;
  g.add(rbox(w, 0.032, d, materials.timberDark, 0, seatH, 0, 0.005));
  g.add(rbox(w - 0.05, 0.062, d - 0.06, materials.fabricWarm, 0.025, seatH + 0.032, 0.03, 0.02));
  // Back: two stiles and a shaped rail, leaning back slightly.
  const back = new THREE.Group();
  back.add(rbox(0.042, 0.5, 0.032, materials.timberDark, 0, 0, 0, 0.006));
  back.add(rbox(0.042, 0.5, 0.032, materials.timberDark, w - 0.042, 0, 0, 0.006));
  back.add(rbox(w, 0.16, 0.038, materials.timberDark, 0, 0.32, -0.003, 0.008));
  back.add(rbox(w - 0.1, 0.085, 0.032, materials.timberDark, 0.05, 0.095, 0, 0.006));
  back.position.set(0, seatH + 0.035, d - 0.05);
  back.rotation.x = -0.1;
  g.add(back);
  [[0.02, 0.02], [w - 0.062, 0.02], [0.02, d - 0.062], [w - 0.062, d - 0.062]].forEach(([x, z]) =>
    g.add(rbox(0.042, seatH, 0.042, materials.timberDark, x, 0, z, 0.005)),
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

/**
 * A Shaker cabinet door: stiles and rails around a recessed centre panel.
 *
 * The fit-out is Howdens, whose volume kitchen ranges are either a Shaker
 * (rails and stiles, e.g. Chilcomb / Fairford) or a handleless slab
 * (e.g. Greenwich). A slab door is one rounded box; this is the Shaker, and
 * the difference between the two is one of the largest single realism gains
 * available, because the frame gives every door a shadow line.
 */
export function shakerDoor(w, h, material, { rail = 0.058, depth: d = 0.019 } = {}) {
  const g = new THREE.Group();
  const r = Math.min(rail, Math.min(w, h) / 3.2);
  // Frame: two stiles, two rails.
  g.add(rbox(r, h, d, material, 0, 0, 0, 0.0025));
  g.add(rbox(r, h, d, material, w - r, 0, 0, 0.0025));
  g.add(rbox(w - r * 2, r, d, material, r, 0, 0, 0.0025));
  g.add(rbox(w - r * 2, r, d, material, r, h - r, 0, 0.0025));
  // Recessed centre panel, set back so the frame casts onto it.
  g.add(rbox(w - r * 2, h - r * 2, d * 0.5, material, r, r, 0, 0.0015));
  return g;
}

/**
 * A four-panel moulded internal door — Howdens' volume internal door, and
 * what a development of this kind is overwhelmingly likely to fit.
 */
export function panelDoor(w, h, material, { depth: d = 0.044 } = {}) {
  const g = new THREE.Group();
  g.add(rbox(w, h, d * 0.62, material, 0, 0, d * 0.19, 0.003));

  const stile = Math.min(0.105, w / 5);
  const bottomRail = Math.min(0.185, h / 9);
  const midRail = Math.min(0.13, h / 12);
  const topRail = stile;

  const panelW = (w - stile * 3) / 2;
  const lowerH = (h - bottomRail - midRail - topRail) * 0.56;
  const upperH = (h - bottomRail - midRail - topRail) - lowerH;

  // Four recessed panels: two tall over two short, with a moulded surround.
  const panel = (px, py, pw, ph) => {
    if (pw <= 0.02 || ph <= 0.02) return;
    g.add(rbox(pw, ph, d * 0.34, material, px, py, d * 0.1, 0.004));
    g.add(rbox(pw - 0.026, ph - 0.026, d * 0.2, material, px + 0.013, py + 0.013, d * 0.06, 0.003));
  };
  panel(stile, bottomRail, panelW, lowerH);
  panel(stile * 2 + panelW, bottomRail, panelW, lowerH);
  panel(stile, bottomRail + lowerH + midRail, panelW, upperH);
  panel(stile * 2 + panelW, bottomRail + lowerH + midRail, panelW, upperH);
  return g;
}

/** Flat-panel joinery run: carcasses, doors with a shadow gap, and handles. */
export function unitRun(materials, {
  length, height, depth: d, doorMat, count, handle = 'bar', plinth = 0.09, style = 'shaker',
}) {
  const g = new THREE.Group();
  // Plinth set back, so the run reads as standing off the floor.
  g.add(box(length, plinth, d - 0.055, materials.frame, 0, 0, 0.055));
  const bodyH = height - plinth;
  const n = count ?? Math.max(1, Math.round(length / 0.6));
  const cw = length / n;

  for (let i = 0; i < n; i += 1) {
    const dw = cw - 0.006;
    const dh = bodyH - 0.006;
    const x = i * cw + 0.003;
    const y = plinth + 0.003;
    if (style === 'shaker') {
      const leaf = shakerDoor(dw, dh, doorMat, { depth: Math.min(0.019, d * 0.5) });
      leaf.position.set(x, y, d - 0.019);
      g.add(leaf);
    } else {
      g.add(rbox(dw, dh, 0.019, doorMat, x, y, d - 0.019, 0.003));
    }
    if (handle === 'bar') {
      // Bar handle on two small stand-offs, not floating on the face.
      const hw = Math.min(cw * 0.46, 0.28);
      const hx = i * cw + (cw - hw) / 2;
      const hy = plinth + bodyH - 0.1;
      g.add(rboxAt(hw, 0.014, 0.014, materials.steel, hx + hw / 2, hy, d + 0.026, 0.006));
      [hx + 0.02, hx + hw - 0.02].forEach((sx) => {
        g.add(rboxAt(0.011, 0.011, 0.026, materials.steel, sx, hy, d + 0.013, 0.004));
      });
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

/**
 * Floor plant — a tapered pot and a set of broad leaves.
 *
 * Spherical foliage masses on a stem read as a lollipop tree, which is one of
 * the most recognisably computer-generated objects you can put in a room.
 * Individual flattened leaves on their own stems read as a houseplant.
 */
export function plant(materials, cx, cz, { height: h = 0.95 } = {}) {
  const g = new THREE.Group();

  // Tapered pot with a rim.
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.115, 0.3, 24),
    materials.frame,
  );
  pot.position.set(cx, 0.15, cz);
  pot.castShadow = true;
  pot.receiveShadow = true;
  g.add(pot);
  g.add(cyl(0.158, 0.022, materials.frame, cx, 0.3, cz, 24));
  // Compost, so the pot is not an empty tube.
  g.add(cyl(0.142, 0.02, materials.timberDark, cx, 0.3, cz, 20));

  const leaves = 16;
  for (let i = 0; i < leaves; i += 1) {
    const a = (i / leaves) * Math.PI * 2 * 1.618;
    const t = i / (leaves - 1);
    const stemH = h * (0.2 + t * 0.34);
    const lean = 0.3 + t * 0.4;
    const reach = 0.07 + t * 0.14;
    const sx = cx + Math.cos(a) * reach;
    const sz = cz + Math.sin(a) * reach;

    // Stem, leaning outward from the pot.
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, stemH, 8), materials.timberDark);
    stem.position.set((cx + sx) / 2, 0.3 + stemH / 2, (cz + sz) / 2);
    stem.rotation.set(Math.sin(a) * lean * 0.7, 0, -Math.cos(a) * lean * 0.7);
    stem.castShadow = true;
    g.add(stem);

    // Broad leaf: a flattened sphere, tilted and turned.
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 9), materials.plant);
    const size = 0.2 + t * 0.12;
    // Flattened and elongated: a broad leaf, not a ball.
    leaf.scale.set(size * 0.54, size * 0.07, size);
    leaf.position.set(sx + Math.cos(a) * size * 0.52, 0.3 + stemH, sz + Math.sin(a) * size * 0.52);
    leaf.rotation.set(Math.sin(a) * 0.42 - 0.3, -a, Math.cos(a) * 0.42);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    g.add(leaf);
  }
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
  const g = new THREE.Group();
  g.add(rbox(w, 0.016, d, mat, x, 0.002, z, 0.006));
  // Bound edge, a shade darker, which is what gives a rug its outline.
  const edge = (materials.timberDark ?? mat);
  g.add(rbox(w + 0.012, 0.012, 0.028, edge, x - 0.006, 0.002, z - 0.014, 0.005));
  g.add(rbox(w + 0.012, 0.012, 0.028, edge, x - 0.006, 0.002, z + d - 0.014, 0.005));
  g.add(rbox(0.028, 0.012, d, edge, x - 0.014, 0.002, z, 0.005));
  g.add(rbox(0.028, 0.012, d, edge, x + w - 0.014, 0.002, z, 0.005));
  return g;
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
