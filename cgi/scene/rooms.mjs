import * as THREE from 'three';
import {
  box, boxAt, cyl, group, wall, glazing, door, skirting, tiledWalls,
  sofa, bed, table, chair, unitRun, panelOnWall, pendant, plant, rug, stair, bulkhead,
} from './kit.mjs';

/**
 * Room sets.
 *
 * Dimensions are the plan sizes off dwg 26/1362/03 converted to metres.
 * Second-floor rooms carry `y0` — their distance from the front external wall
 * — because the ceiling there follows the 40° rafters and its height depends
 * on where in the 9.49 m depth you are standing.
 */

/** Building section constants, off dwg 26/1362/04. */
export const SECTION = {
  storeyClear: 2.49,
  floorZone: 0.205,
  wallPlate: 5.47,   // above ground-floor FFL
  secondFFL: 5.39,
  depth: 9.49,
  pitchDeg: 40,
};

const TAN_PITCH = Math.tan((SECTION.pitchDeg * Math.PI) / 180);
const EAVES_ABOVE_FFL = SECTION.wallPlate - SECTION.secondFFL; // 0.08 m
const RIDGE_Y = SECTION.depth / 2;

/** Ceiling height above second-floor FFL at distance `y` from the front wall. */
export function pitchedHeightAt(y) {
  return EAVES_ABOVE_FFL + Math.min(y, SECTION.depth - y) * TAN_PITCH;
}

/** Sloping ceiling planes that follow the rafters across a room. */
function pitchedCeiling(room, materials, y0) {
  const g = new THREE.Group();
  const { width: w, depth: d } = room;
  const y1 = y0 + d;
  const t = 0.05;

  const plane = (zA, zB) => {
    const hA = pitchedHeightAt(y0 + zA);
    const hB = pitchedHeightAt(y0 + zB);
    const run = zB - zA;
    const len = Math.hypot(run, hB - hA);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, t, len), materials.ceiling);
    mesh.position.set(w / 2, (hA + hB) / 2 + t / 2, (zA + zB) / 2);
    mesh.rotation.x = -Math.atan2(hB - hA, run);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    g.add(mesh);
  };

  if (y0 < RIDGE_Y && y1 > RIDGE_Y) {
    plane(0, RIDGE_Y - y0);
    plane(RIDGE_Y - y0, d);
  } else {
    plane(0, d);
  }
  return g;
}

/** Flat ceiling slab. */
function flatCeiling(room, materials, height) {
  return box(room.width, 0.05, room.depth, materials.ceiling, 0, height, 0);
}

const GROUND_H = SECTION.storeyClear;
const FIRST_H = SECTION.storeyClear;

/**
 * Each entry describes one room: its size, how it is enclosed, what is in it
 * and where the camera stands. `build` receives the room box, the material set
 * and the resolved finishes.
 */
export const ROOM_SETS = {
  /* ------------------------------------------------------------------ GROUND */
  hall: {
    width: 2.0, depth: 3.61, height: GROUND_H, floor: 'oakFloor',
    camera: { pos: [1.62, 1.6, 0.62], target: [0.62, 1.05, 3.1], fov: 70 },
    walls: (r, m) => [
      // W07 and the front door D07 side by side, as drawn: window to the
      // outer corner, door beside it.
      wall({ side: 'front', ...r, material: m.wall, openings: [
        { u: 0.12, w: 0.72, sill: 0.9, h: 1.2 },
        { u: 1.0, w: 0.95, sill: 0, h: 2.08, kind: 'door' },
      ] }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall, openings: [{ u: 0.45, w: 0.82, sill: 0, h: 2.0, kind: 'door' }] }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      // W07, then the external door leaf with a glazed panel over.
      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 0.12, w: 0.72, sill: 0.9, h: 1.2 } }));
      g.add(box(0.95, 2.08, 0.06, m.timberDark, 1.0, 0, -0.03));
      g.add(box(0.5, 0.9, 0.02, m.sky, 1.22, 0.85, -0.055));
      g.add(box(0.05, 0.05, 0.05, m.brass, 1.84, 1.02, -0.06));
      // Stair rising against the left wall, away from the door.
      const s = stair(m, { steps: 9, rise: 0.19, going: 0.235, width: 0.88 });
      s.position.set(0.06, 0, 1.3);
      g.add(s);
      // Door through to the kitchen.
      g.add(door({ side: 'right', room: r, u: 0.45, width: 0.82, materials: m, open: 0.55 }));
      // Console table, mirror and a runner.
      const c = table(m, { width: 0.85, depth: 0.32, height: 0.78 });
      c.position.set(1.05, 0, 0.42);
      g.add(c);
      g.add(panelOnWall('left', r, m, { u: 0.4, sill: 0.95, width: 0.5, height: 0.95, material: m.mirror }));
      g.add(rug(m, 1.0, 0.25, 0.85, 1.1));
      g.add(plant(m, 1.7, 3.28, { height: 0.95 }));
      g.add(bulkhead(m, 1.0, 1.0, r.height));
      return g;
    },
  },

  kitchen: {
    width: 2.81, depth: 3.61, height: GROUND_H, floor: 'oakFloor',
    // From the doorway looking down the gangway, which is the only view that
    // shows all three legs of the U at once.
    camera: { pos: [1.32, 1.58, 3.46], target: [1.62, 1.02, 0.25], fov: 76 },
    walls: (r, m) => [
      // W06, a single 1585 opening centred on the front wall. W05 is the
      // matching window in plot 2's kitchen, not a second one in this room.
      wall({ side: 'front', ...r, material: m.wall, openings: [
        { u: 0.61, w: 1.585, sill: 0.9, h: 1.2 },
      ] }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall, openings: [{ u: 2.3, w: 0.82, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    /*
     * A U on three walls, opening to the door in the back of the left wall.
     *
     * The room is 2810 wide. Two 600 deep runs facing each other leave a
     * 1610 gangway, which is a working kitchen. An island does not fit and
     * never did: it would have left about 370 between its worktop and the
     * opposite run, so the earlier layout was not buildable.
     */
    build: (r, m) => {
      const g = new THREE.Group();
      const D = 0.6;          // base unit depth
      const WT = 0.64;        // worktop depth, 40 proud of the doors
      const H = 0.87;         // worktop height, clear of the 900 window sills
      const DOOR_U = 2.3;     // door starts here along the left wall

      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 0.61, w: 1.585, sill: 0.9, h: 1.2 } }));

      // Head of the U: across the front wall under W05 and W06, with the
      // sink centred between them.
      const front = unitRun(m, { length: r.width, height: H, depth: D, doorMat: m.kitchenUnit, count: 4 });
      front.position.set(0, 0, 0);
      g.add(front);
      g.add(box(r.width, 0.04, WT, m.worktop, 0, H, 0));
      // Stops at the 900 sill so it does not cross W05/W06.
      g.add(box(r.width - 0.02, 0.9 - (H + 0.04), 0.02, m.tileWall, 0.01, H + 0.04, 0));
      g.add(box(0.44, 0.02, 0.38, m.steel, 0.94, H + 0.015, 0.12));
      g.add(cyl(0.018, 0.3, m.chrome, 1.16, H + 0.19, 0.06, 10));
      g.add(box(0.2, 0.02, 0.03, m.chrome, 1.0, H + 0.33, 0.075));

      // Right leg, on the party wall: base units from the window end back to
      // the tall housing, which sits at the far end nearest the door — where
      // the plan draws it.
      const TALL = 0.6;
      const rightLen = r.depth - D - TALL;
      const right = unitRun(m, { length: rightLen, height: H, depth: D, doorMat: m.kitchenUnit, count: 3 });
      right.rotation.y = -Math.PI / 2;
      right.position.set(r.width, 0, D);
      g.add(right);
      g.add(box(WT, 0.04, rightLen, m.worktop, r.width - WT, H, D));
      g.add(box(0.02, 0.5, rightLen - 0.02, m.tileWall, r.width - 0.02, H + 0.04, D + 0.01));
      g.add(box(0.52, 0.01, 0.46, m.frame, r.width - 0.58, H + 0.045, 1.0));

      const tall = unitRun(m, { length: TALL, height: 2.15, depth: D, doorMat: m.kitchenUnit, count: 1 });
      tall.rotation.y = -Math.PI / 2;
      tall.position.set(r.width, 0, D + rightLen);
      g.add(tall);
      g.add(box(0.04, 0.58, 0.52, m.frame, r.width - D, 0.92, D + rightLen + 0.04));
      g.add(box(0.03, 0.06, 0.46, m.steel, r.width - D + 0.03, 1.16, D + rightLen + 0.07));

      // Left leg, on the hall wall: runs the full depth up to the door.
      const leftLen = DOOR_U - D;
      const left = unitRun(m, { length: leftLen, height: H, depth: D, doorMat: m.kitchenUnit, count: 3 });
      left.rotation.y = Math.PI / 2;
      left.position.set(0, 0, D + leftLen);
      g.add(left);
      g.add(box(WT, 0.04, leftLen, m.worktop, 0, H, D));
      g.add(box(0.02, 0.5, leftLen - 0.02, m.tileWall, 0, H + 0.04, D + 0.01));

      // Wall units over both legs, kept off the window reveals.
      const wallRight = unitRun(m, { length: 1.3, height: 0.72, depth: 0.34, doorMat: m.kitchenWall, count: 2, plinth: 0 });
      wallRight.rotation.y = -Math.PI / 2;
      wallRight.position.set(r.width, 1.48, 1.3);
      g.add(wallRight);
      const wallLeft = unitRun(m, { length: 1.2, height: 0.72, depth: 0.34, doorMat: m.kitchenWall, count: 2, plinth: 0 });
      wallLeft.rotation.y = Math.PI / 2;
      wallLeft.position.set(0, 1.48, 2.1);
      g.add(wallLeft);

      // No island, so the light is a pair down the middle of the gangway.
      g.add(pendant(m, r.width / 2, 1.25, r.height, { drop: 0.7, radius: 0.13 }));
      g.add(pendant(m, r.width / 2, 2.45, r.height, { drop: 0.7, radius: 0.13 }));
      g.add(door({ side: 'left', room: r, u: DOOR_U, width: 0.82, materials: m, open: 0.7 }));
      return g;
    },
  },

  wc: {
    width: 1.06, depth: 1.68, height: GROUND_H, floor: 'tileFloor',
    camera: { pos: [0.82, 1.5, 1.5], target: [0.45, 1.0, 0.2], fov: 74 },
    walls: (r, m) => [
      // W08 obs is in the external side wall, the long one, not the end.
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 0.15, w: 0.72, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall, openings: [{ u: 0.52, w: 0.62, sill: 1.35, h: 0.7 }] }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(tiledWalls(r, m, 1.15));
      // Obscure-glazed W08: the sky plane sits behind a milky pane.
      g.add(glazing({ side: 'left', room: r, materials: m, opening: { u: 0.52, w: 0.62, sill: 1.35, h: 0.7 } }));
      // Back-to-wall W/C with a concealed cistern, and a small basin.
      g.add(box(0.55, 0.42, 0.22, m.tileWall, 0.25, 0, 0.02));
      g.add(boxAt(0.37, 0.4, 0.56, m.sanitary, 0.52, 0.2, 0.46));
      g.add(box(0.42, 0.04, 0.5, m.sanitary, 0.31, 0.4, 0.2));
      g.add(box(0.5, 0.12, 0.34, m.sanitary, 0.28, 0.8, r.depth - 0.36));
      g.add(cyl(0.015, 0.2, m.chrome, 0.53, 1.0, r.depth - 0.18, 10));
      g.add(panelOnWall('back', r, m, { u: 0.3, sill: 1.15, width: 0.44, height: 0.6, material: m.mirror }));
      g.add(box(0.06, 0.7, 0.06, m.chrome, r.width - 0.14, 0.75, 0.75));
      return g;
    },
  },

  dining: {
    width: 3.79, depth: 1.68, height: GROUND_H, floor: 'oakFloor',
    // Looks through the cased opening and on out at the garden doors, which
    // is what the open middle band actually gives you.
    camera: { pos: [1.72, 1.42, 0.1], target: [1.7, 1.12, 4.9], fov: 70 },
    walls: (r, m) => [
      // Doors D03 / D04 off the hall, and a wide cased opening through to
      // the living room at the rear — the plan's open middle band.
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.3, w: 0.8, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 1.0, w: 2.2, sill: 0, h: 2.1, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      /*
       * Open plan. The plan carries a steel beam over this wall rather than
       * a wall, so the dining room looks straight through the opening into
       * the living room and out at the garden doors beyond. That through
       * view is built here rather than faked with a flat panel.
       */
      const BEYOND = 3.23;             // the living room's depth
      g.add(box(r.width, 0.02, BEYOND, m.oakFloor, 0, 0, r.depth));
      g.add(box(r.width, 0.06, BEYOND, m.ceiling, 0, r.height, r.depth));
      g.add(box(0.03, r.height, BEYOND, m.wall, 0, 0, r.depth));
      g.add(box(0.03, r.height, BEYOND, m.wall, r.width - 0.03, 0, r.depth));
      // The rear wall of the living room, with D01 in it.
      const beyondRoom = { width: r.width, depth: r.depth + BEYOND, height: r.height };
      g.add(wall({ side: 'back', ...beyondRoom, material: m.wall, openings: [
        { u: 0.85, w: 1.75, sill: 0, h: 2.1 },
      ] }));
      g.add(glazing({ side: 'back', room: beyondRoom, materials: m,
        opening: { u: 0.85, w: 1.75, sill: 0, h: 2.1 } }));
      // A sofa glimpsed in the living room, to the left of those doors.
      const beyondSofa = sofa(m, { width: 1.9, depth: 0.85 });
      beyondSofa.rotation.y = Math.PI / 2;
      beyondSofa.position.set(3.46, 0, r.depth + 0.85);
      g.add(beyondSofa);
      g.add(door({ side: 'front', room: r, u: 0.3, width: 0.8, materials: m, open: 0.6 }));

      const t = table(m, { width: 1.7, depth: 0.88, height: 0.75 });
      t.position.set(1.05, 0, 0.4);
      g.add(t);
      [[0.95, 0.02], [1.55, 0.02], [0.95, 1.22], [1.55, 1.22]].forEach(([x, z], i) => {
        const c = chair(m);
        c.position.set(x, 0, z);
        if (i > 1) c.rotation.y = Math.PI;
        g.add(c);
      });
      // Sideboard against the outer wall.
      const sb = unitRun(m, { length: 1.3, height: 0.72, depth: 0.4, doorMat: m.timberDark, count: 3, plinth: 0.06 });
      sb.position.set(2.3, 0, 0.04);
      g.add(sb);
      g.add(panelOnWall('front', r, m, { u: 2.5, sill: 1.05, width: 0.9, height: 0.66, material: m.fabricDeep }));
      // Kept short so it lights the table without blocking the through view.
      g.add(pendant(m, 1.9, 0.72, r.height, { drop: 0.42, radius: 0.17 }));
      g.add(rug(m, 0.7, 0.18, 2.4, 1.32));
      return g;
    },
  },

  living: {
    width: 4.95, depth: 3.23, height: GROUND_H, floor: 'oakFloor',
    // Faces the garden doors, with the sofa in frame to the left of them.
    camera: { pos: [0.6, 1.6, 0.32], target: [2.85, 1.02, 2.55], fov: 82 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 1.2, w: 2.2, sill: 0, h: 2.1, kind: 'door' }] }),
      // Rear wall as drawn: W01 nearest the outer corner, garden doors D01
      // toward the party wall.
      wall({ side: 'back', ...r, material: m.wall, openings: [
        { u: 0.45, w: 1.4, sill: 0.9, h: 1.2 },
        { u: 2.6, w: 1.75, sill: 0, h: 2.1 },
      ] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(glazing({ side: 'back', room: r, materials: m, opening: { u: 0.45, w: 1.4, sill: 0.9, h: 1.2 } }));
      g.add(glazing({ side: 'back', room: r, materials: m, opening: { u: 2.6, w: 1.75, sill: 0, h: 2.1 } }));
      // Steel beam over, encased and expressed as a shallow downstand.
      g.add(box(r.width, 0.16, 0.22, m.ceiling, 0, r.height - 0.16, r.depth - 0.34));

      // The sofa sits to the left of the garden doors and faces them, which
      // is how the room is used: the doors are the view, not a back wall.
      const s = sofa(m, { width: 2.3, depth: 0.9 });
      s.rotation.y = Math.PI / 2;
      s.position.set(r.width - 0.85, 0, 0.5);
      g.add(s);
      const arm = sofa(m, { width: 0.98, depth: 0.86 });
      arm.rotation.y = Math.PI;
      arm.position.set(0.82, 0.0, 0.92);
      g.add(arm);
      const ct = table(m, { width: 1.05, depth: 0.58, height: 0.38 });
      ct.position.set(2.18, 0, 1.28);
      g.add(ct);
      g.add(box(0.26, 0.03, 0.19, m.linen, 2.59, 0.38, 1.47));
      g.add(rug(m, 1.45, 0.78, 2.0, 1.45));

      // Low shelving on the far wall, and planting by the doors.
      const shelf = unitRun(m, { length: 1.5, height: 0.52, depth: 0.4, doorMat: m.timberDark, count: 3, plinth: 0.05 });
      shelf.rotation.y = Math.PI / 2;
      shelf.position.set(0.04, 0, 0.95);
      g.add(shelf);
      g.add(box(0.04, 0.58, 1.02, m.frame, 0.08, 0.82, 1.2));
      g.add(plant(m, 2.6, 2.78, { height: 1.3 }));
      // Floor lamp in the corner by the window.
      g.add(cyl(0.035, 1.45, m.frame, 4.53, 0.72, 2.85, 10));
      g.add(cyl(0.16, 0.26, m.linen, 0.42, 1.55, 2.85, 16));
      return g;
    },
  },

  /* ------------------------------------------------------------------- FIRST */
  master: {
    width: 3.64, depth: 2.76, height: FIRST_H, floor: 'carpet',
    camera: { pos: [3.45, 1.66, 0.28], target: [1.5, 1.0, 2.62], fov: 70 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.4, w: 0.82, sill: 0, h: 2.0, kind: 'door' }] }),
      // W10 over the garden. W11 is plot 2's master window, not a second
      // one in this room.
      wall({ side: 'back', ...r, material: m.wall, openings: [
        { u: 0.92, w: 1.79, sill: 0.9, h: 1.2 },
      ] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(glazing({ side: 'back', room: r, materials: m, opening: { u: 0.92, w: 1.79, sill: 0.9, h: 1.2 } }));
      const b = bed(m, { width: 1.5, length: 2.0 });
      b.position.set(1.02, 0, 0.12);
      g.add(b);
      [[0.6, 0.55], [2.62, 0.55]].forEach(([x, z]) => {
        const t = unitRun(m, { length: 0.42, height: 0.5, depth: 0.38, doorMat: m.timberDark, count: 1, plinth: 0.05 });
        t.position.set(x - 0.21, 0, z);
        g.add(t);
        g.add(cyl(0.11, 0.2, m.linen, x, 0.62, z + 0.19, 14));
      });
      // Wardrobe run against the left wall.
      const wr = unitRun(m, { length: 2.0, height: 2.15, depth: 0.6, doorMat: m.door, count: 3 });
      wr.rotation.y = Math.PI / 2;
      wr.position.set(0.04, 0, 2.55);
      g.add(wr);
      g.add(door({ side: 'front', room: r, u: 0.4, width: 0.82, materials: m, open: 0 }));
      g.add(rug(m, 0.82, 0.16, 1.9, 0.8, m.carpet));
      return g;
    },
  },

  ensuite: {
    width: 1.21, depth: 2.76, height: FIRST_H, floor: 'tileFloor',
    camera: { pos: [0.95, 1.55, 2.5], target: [0.5, 1.05, 0.25], fov: 72 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.3, w: 0.55, sill: 1.3, h: 0.75 }] }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 0.22, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(tiledWalls(r, m, 2.1));
      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 0.3, w: 0.55, sill: 1.3, h: 0.75 } }));
      // Walk-in shower at the window end behind a glazed screen.
      g.add(box(r.width, 0.03, 1.0, m.tileFloor, 0, 0.005, 0.02));
      g.add(box(0.02, 2.0, 0.75, m.glass, r.width - 0.32, 0.03, 1.0));
      g.add(cyl(0.11, 0.03, m.chrome, 0.6, 2.06, 0.5, 16));
      g.add(cyl(0.016, 0.42, m.chrome, 0.6, 1.85, 0.5, 10));
      g.add(box(0.44, 0.14, 0.34, m.sanitary, 0.38, 0.82, 1.55));
      g.add(cyl(0.014, 0.18, m.chrome, 0.6, 1.0, 1.78, 10));
      g.add(panelOnWall('right', r, m, { u: 1.4, sill: 1.15, width: 0.5, height: 0.68, material: m.mirror }));
      g.add(boxAt(0.36, 0.4, 0.55, m.sanitary, 0.55, 0.2, 2.35));
      g.add(box(0.06, 0.8, 0.06, m.chrome, 0.06, 0.9, 1.5));
      return g;
    },
  },

  bath: {
    width: 3.75, depth: 1.7, height: FIRST_H, floor: 'tileFloor',
    camera: { pos: [3.4, 1.52, 1.42], target: [1.2, 0.95, 0.6], fov: 72 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 0.35, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(tiledWalls(r, m, 2.1));
      // Bath along the front wall with an overhead shower.
      // Bath: panel, rim and a recessed inner surface.
      g.add(box(1.7, 0.56, 0.72, m.sanitary, 0.22, 0, 0.05));
      g.add(box(1.7, 0.03, 0.09, m.sanitary, 0.22, 0.56, 0.05));
      g.add(box(1.7, 0.03, 0.09, m.sanitary, 0.22, 0.56, 0.68));
      g.add(box(0.09, 0.03, 0.72, m.sanitary, 0.22, 0.56, 0.05));
      g.add(box(0.09, 0.03, 0.72, m.sanitary, 1.83, 0.56, 0.05));
      g.add(box(1.52, 0.04, 0.54, m.tileFloor, 0.31, 0.4, 0.14));
      g.add(cyl(0.1, 0.03, m.chrome, 1.07, 2.0, 0.28, 16));
      g.add(cyl(0.015, 0.45, m.chrome, 1.07, 1.78, 0.28, 10));
      g.add(box(0.02, 1.35, 0.7, m.glass, 1.92, 0.56, 0.06));
      g.add(cyl(0.016, 0.16, m.chrome, 0.32, 0.64, 0.4, 10));
      // Vanity and W/C along the run.
      g.add(unitRun(m, { length: 0.9, height: 0.8, depth: 0.45, doorMat: m.door, count: 2, plinth: 0.06 }).translateX(2.25));
      g.add(box(0.96, 0.05, 0.48, m.worktop, 2.22, 0.8, 0));
      g.add(box(0.44, 0.12, 0.3, m.sanitary, 2.48, 0.85, 0.06));
      g.add(cyl(0.014, 0.2, m.chrome, 2.7, 1.0, 0.32, 10));
      g.add(panelOnWall('front', r, m, { u: 2.35, sill: 1.1, width: 0.7, height: 0.7, material: m.mirror }));
      g.add(boxAt(0.37, 0.4, 0.56, m.sanitary, 3.4, 0.2, 0.42));
      g.add(box(0.5, 0.42, 0.2, m.tileWall, 3.15, 0, 0.02));
      g.add(box(0.06, 0.85, 0.06, m.chrome, 3.62, 0.9, 1.15));
      return g;
    },
  },

  bed3: {
    width: 3.75, depth: 2.95, height: FIRST_H, floor: 'carpet',
    camera: { pos: [3.4, 1.55, 2.62], target: [1.5, 1.1, 0.3], fov: 66 },
    walls: (r, m) => [
      // W16 to the front. W17 lights the landing beside this room, not
      // bedroom 3 itself.
      wall({ side: 'front', ...r, material: m.wall, openings: [
        { u: 1.08, w: 1.585, sill: 0.9, h: 1.2 },
      ] }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 0.4, w: 0.82, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 1.08, w: 1.585, sill: 0.9, h: 1.2 } }));
      const b = bed(m, { width: 1.35, length: 1.95 });
      b.rotation.y = Math.PI / 2;
      b.position.set(0.12, 0, 0.55);
      g.add(b);
      const t = unitRun(m, { length: 0.4, height: 0.5, depth: 0.36, doorMat: m.timberDark, count: 1, plinth: 0.05 });
      t.position.set(0.18, 0, 2.05);
      g.add(t);
      g.add(cyl(0.1, 0.19, m.linen, 0.38, 0.6, 2.23, 14));
      // Desk under the second window.
      const d = table(m, { width: 1.2, depth: 0.55, height: 0.74 });
      d.position.set(2.1, 0, 0.1);
      g.add(d);
      const c = chair(m);
      c.position.set(2.5, 0, 0.72);
      c.rotation.y = Math.PI;
      g.add(c);
      const wr = unitRun(m, { length: 1.1, height: 2.1, depth: 0.58, doorMat: m.door, count: 2 });
      wr.position.set(1.35, 0, r.depth - 0.58);
      g.add(wr);
      g.add(rug(m, 1.5, 1.35, 1.4, 1.05, m.carpet));
      return g;
    },
  },

  landing: {
    width: 1.11, depth: 6.035, height: FIRST_H, floor: 'oakFloor',
    camera: { pos: [0.24, 1.64, 5.75], target: [0.95, 1.05, 0.9], fov: 76 },
    walls: (r, m) => [
      // W17 lights the landing at its front end; the side wall is solid on
      // this plot — W13 is plot 2's stair window.
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.18, w: 0.75, sill: 0.9, h: 1.2 }] }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall }),
      // Doors off the landing: bedroom 3, bathroom, cupboard, master.
      wall({ side: 'right', ...r, material: m.wall, openings: [
        { u: 0.55, w: 0.8, sill: 0, h: 2.0, kind: 'door' },
        { u: 1.9, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
        { u: 3.2, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
        { u: 4.6, w: 0.82, sill: 0, h: 2.0, kind: 'door' },
      ] }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 0.18, w: 0.75, sill: 0.9, h: 1.2 } }));
      [0.55, 1.9, 3.2, 4.6].forEach((u, i) =>
        g.add(door({ side: 'right', room: r, u, width: i === 0 || i === 3 ? 0.82 : 0.76, materials: m, open: i === 1 ? 0.5 : 0 })),
      );
      // Stair void with a balustrade down the middle of the run.
      g.add(box(0.06, 0.95, 2.3, m.skirting, 0.02, 0, 2.3));
      g.add(box(0.1, 0.06, 2.3, m.timberDark, 0.0, 0.95, 2.3));
      g.add(rug(m, 0.14, 4.6, 0.82, 1.2));
      g.add(panelOnWall('back', r, m, { u: 0.3, sill: 1.2, width: 0.5, height: 0.64, material: m.fabricDeep }));
      g.add(bulkhead(m, 0.55, 1.4, r.height));
      g.add(bulkhead(m, 0.55, 4.6, r.height));
      return g;
    },
  },

  /* ------------------------------------------------------------------ SECOND */
  bed2: {
    width: 3.93, depth: 4.89, y0: 1.75, pitched: true, floor: 'carpet',
    camera: { pos: [3.55, 1.5, 4.5], target: [1.6, 1.15, 0.6], fov: 68 },
    // RL01 only. RL02 is plot 2's rooflight.
    rooflights: [{ u: 1.5, along: 1.4 }],
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall, openings: [{ u: 3.6, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      // Both side walls are internal here: the party wall one side, the
      // landing the other. W18 is plot 2's top-landing window.
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      const b = bed(m, { width: 1.6, length: 2.05 });
      b.position.set(1.1, 0, 0.35);
      g.add(b);
      [[0.78, 0.8], [2.92, 0.8]].forEach(([x, z]) => {
        const t = unitRun(m, { length: 0.4, height: 0.48, depth: 0.36, doorMat: m.timberDark, count: 1, plinth: 0.05 });
        t.position.set(x - 0.2, 0, z);
        g.add(t);
        g.add(cyl(0.1, 0.18, m.linen, x, 0.58, z + 0.18, 14));
      });
      // Low chest tucked where the ceiling comes down at the rear.
      const chest = unitRun(m, { length: 1.3, height: 0.8, depth: 0.45, doorMat: m.door, count: 3, plinth: 0.06 });
      chest.position.set(1.3, 0, r.depth - 0.46);
      g.add(chest);
      g.add(door({ side: 'left', room: r, u: 3.6, width: 0.76, materials: m, open: 0.4 }));
      g.add(rug(m, 1.15, 2.55, 1.9, 1.35, m.carpet));
      g.add(plant(m, 0.55, 3.9, { height: 1.05 }));
      return g;
    },
  },

  ensuite2: {
    width: 1.21, depth: 1.9, y0: 1.75, pitched: true, floor: 'tileFloor',
    camera: { pos: [0.95, 1.45, 1.72], target: [0.5, 1.0, 0.2], fov: 74 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 0.22, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(tiledWalls(r, m, 1.5));
      g.add(box(r.width, 0.03, 0.9, m.tileFloor, 0, 0.005, 0.02));
      g.add(box(0.02, 1.9, 0.7, m.glass, r.width - 0.3, 0.03, 0.9));
      g.add(cyl(0.1, 0.03, m.chrome, 0.6, 1.95, 0.45, 16));
      g.add(cyl(0.015, 0.4, m.chrome, 0.6, 1.74, 0.45, 10));
      g.add(box(0.42, 0.13, 0.32, m.sanitary, 0.4, 0.82, 1.1));
      g.add(cyl(0.014, 0.17, m.chrome, 0.61, 1.0, 1.32, 10));
      g.add(panelOnWall('right', r, m, { u: 1.0, sill: 1.1, width: 0.42, height: 0.56, material: m.mirror }));
      g.add(boxAt(0.35, 0.4, 0.54, m.sanitary, 0.55, 0.2, 1.62));
      // Soil and vent pipe alongside, as noted on the plan.
      g.add(cyl(0.055, 1.9, m.skirting, 0.12, 0.95, 1.75, 12));
      return g;
    },
  },

  landing2: {
    width: 0.98, depth: 4.89, y0: 1.75, pitched: true, floor: 'oakFloor',
    camera: { pos: [0.49, 1.52, 4.6], target: [0.49, 1.02, 0.35], fov: 72 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall, openings: [
        { u: 0.6, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
        { u: 2.4, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
      ] }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      [0.6, 2.4].forEach((u, i) =>
        g.add(door({ side: 'right', room: r, u, width: 0.76, materials: m, open: i === 0 ? 0.45 : 0 })),
      );
      // Stair arriving from the first floor, with a balustrade to the void.
      g.add(box(0.06, 0.95, 1.9, m.skirting, 0.02, 0, 2.6));
      g.add(box(0.1, 0.06, 1.9, m.timberDark, 0.0, 0.95, 2.6));
      const s = stair(m, { steps: 5, rise: 0.19, going: 0.235, width: 0.78 });
      s.rotation.y = Math.PI;
      s.position.set(0.88, -0.95, 4.6);
      g.add(s);
      // Low access door into the front eaves store.
      g.add(box(0.72, 0.95, 0.04, m.door, 0.14, 0, 0.03));
      g.add(bulkhead(m, 0.49, 1.6, 2.2));
      return g;
    },
  },

  store: {
    width: 4.945, depth: 1.3, y0: 0.35, pitched: true, floor: 'boarded',
    camera: { pos: [4.7, 0.78, 0.66], target: [0.25, 0.4, 0.66], fov: 66 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 1.9, w: 0.76, sill: 0, h: 1.0, kind: 'door' }] }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      // Boarded-out eaves with shelving and stored boxes — the space the
      // 40° pitch leaves behind the second-floor rooms.
      g.add(box(2.3, 0.035, 0.42, m.boarded, 0.45, 0.46, 0.1));
      [[0.55, 0.16, 'a'], [1.18, 0.2, 'b'], [1.78, 0.14, 'a']].forEach(([x, z, k]) => {
        g.add(box(0.34, 0.24, 0.28, k === 'b' ? m.timberDark : m.fabricWarm, x, 0.5, z));
      });
      g.add(box(0.4, 0.3, 0.32, m.fabricWarm, 3.15, 0, 0.16));
      g.add(box(0.34, 0.24, 0.28, m.timberDark, 3.18, 0.3, 0.2));
      g.add(box(0.42, 0.26, 0.3, m.fabricWarm, 3.72, 0, 0.22));
      g.add(box(0.55, 0.42, 0.05, m.timberDark, 4.2, 0, 0.42));
      g.add(bulkhead(m, 2.3, 0.62, 1.08));
      // Light spilling in from the top landing through door D18.
      g.add(box(0.76, 0.98, 0.02, m.interiorBeyond, 1.9, 0, r.depth + 0.02));
      return g;
    },
  },

  store2: {
    width: 4.945, depth: 1.45, y0: 7.695, pitched: true, floor: 'boarded',
    camera: { pos: [4.7, 0.84, 0.78], target: [0.25, 0.42, 0.78], fov: 66 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 1.9, w: 0.76, sill: 0, h: 1.05, kind: 'door' }] }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(box(2.4, 0.035, 0.46, m.boarded, 0.52, 0.52, 0.76));
      [[0.66, 0.82, 'a'], [1.28, 0.86, 'b'], [1.9, 0.8, 'a']].forEach(([x, z, k]) => {
        g.add(box(0.36, 0.26, 0.3, k === 'b' ? m.timberDark : m.fabricWarm, x, 0.56, z));
      });
      g.add(box(0.42, 0.32, 0.34, m.fabricWarm, 3.2, 0, 0.88));
      g.add(box(0.36, 0.26, 0.3, m.timberDark, 3.23, 0.32, 0.9));
      g.add(box(0.44, 0.28, 0.32, m.fabricWarm, 3.8, 0, 0.92));
      g.add(box(0.6, 0.44, 0.05, m.timberDark, 4.25, 0, 0.9));
      // Air admittance valve within the eaves, as noted on sheet 03.
      g.add(cyl(0.05, 0.5, m.skirting, 0.22, 0.25, 1.15, 10));
      g.add(bulkhead(m, 2.4, 0.85, 1.16));
      // Light spilling in from the top landing through door D21.
      g.add(box(0.76, 1.03, 0.02, m.interiorBeyond, 1.9, 0, -0.02));
      return g;
    },
  },
};

/** Assembles one room: shell, openings, fit-out and lighting rig. */
export function buildRoom(key, materials) {
  const set = ROOM_SETS[key];
  if (!set) throw new Error(`No room set for "${key}"`);

  // Under the pitch there is no single ceiling height, so the walls are built
  // to the tallest point the room reaches and the sloping ceiling planes cut
  // across them. Anything above the slope is hidden from inside the room.
  const peak = set.pitched
    ? Math.max(
        pitchedHeightAt(set.y0),
        pitchedHeightAt(set.y0 + set.depth),
        set.y0 < RIDGE_Y && set.y0 + set.depth > RIDGE_Y ? pitchedHeightAt(RIDGE_Y) : 0,
      )
    : set.height;
  const room = { width: set.width, depth: set.depth, height: Math.max(peak, 1.0) };

  const g = new THREE.Group();
  const floorMat = materials[set.floor].clone();
  if (floorMat.map) {
    // One texture tile per 2 m of floor, so board and tile sizes stay
    // consistent from the 1.06 m W/C to the 4.95 m living room.
    floorMat.map = floorMat.map.clone();
    floorMat.map.needsUpdate = true;
    floorMat.map.repeat.set(Math.max(1, room.width / 2), Math.max(1, room.depth / 2));
  }
  g.add(box(room.width, 0.04, room.depth, floorMat, 0, -0.04, 0));
  set.walls(room, materials).forEach((w) => g.add(w));

  if (set.pitched) {
    g.add(pitchedCeiling(room, materials, set.y0));
    // Rooflights let daylight down the slope where the drawings show them.
    (set.rooflights ?? []).forEach((rl) => {
      const h = pitchedHeightAt(set.y0 + rl.along);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.9), materials.sky);
      pane.position.set(rl.u, h - 0.03, rl.along);
      pane.rotation.x = -((SECTION.pitchDeg * Math.PI) / 180);
      g.add(pane);
    });
  } else {
    g.add(flatCeiling(room, materials, room.height));
    g.add(skirting(room, materials));
  }

  g.add(set.build(room, materials));
  return { group: g, room, set };
}
