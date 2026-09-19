import * as THREE from 'three';
import {
  box, boxAt, rbox, cyl, group, wall, glazing, door, skirting, tiledWalls,
  sofa, bed, table, chair, unitRun, panelOnWall, pendant, plant, rug, stair, bulkhead,
  balustrade, mediaWall, coffeeTable, throwOver,
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
    width: 2.0, depth: 3.61, height: GROUND_H, floor: 'board',
    // From just inside the front door, looking the length of the hall with
    // the flight climbing across the frame — the view you actually get when
    // the door opens, and the one that shows the balustrade. Kept close to
    // level: a wide lens tilted down makes the walls lean, and a hall this
    // narrow shows it more than any other room.
    camera: { pos: [1.7, 1.5, 0.7], target: [0.74, 1.3, 3.4], fov: 68 },
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

      /*
       * The stair.
       *
       * It rises against the external side wall, away from the front door,
       * and carries on through all three floors — the plan's defining move
       * and the thing a visitor walks into. Nine treads are in the room; the
       * rest pass up through the trimmed opening in the floor over, which the
       * soffit below stands in for.
       *
       * The balustrade is the buyer's choice, so it is not drawn here: the
       * flight builds whichever of the three sets of Howdens parts was
       * selected, and the landing balustrade above matches it.
       */
      const STEPS = 9;
      const RISE = 0.19;
      const GOING = 0.235;
      const s = stair(m, { steps: STEPS, rise: RISE, going: GOING, width: 0.88 });
      s.position.set(0.06, 0, 1.18);
      g.add(s);

      // The stairwell above: the trimmed opening the flight climbs into, and
      // the raking soffit of the flight continuing over it.
      const topZ = 1.18 + STEPS * GOING;
      const topY = STEPS * RISE;
      g.add(box(1.0, 0.16, r.depth - topZ, m.ceiling, 0.02, r.height - 0.16, topZ));
      const soffit = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.05, Math.hypot(r.height - topY, r.depth - topZ)),
        m.ceiling,
      );
      soffit.position.set(0.52, (topY + r.height) / 2 + 0.28, (topZ + r.depth) / 2);
      soffit.rotation.x = -Math.atan2(r.height - topY, r.depth - topZ);
      g.add(soffit);

      // Understairs cupboard, in the triangle the first four treads leave.
      g.add(box(0.04, 1.28, 0.62, m.door, 0.94, 0, 1.3));
      g.add(cyl(0.016, 0.1, m.steel, 0.985, 0.78, 1.82, 10));

      // Door through to the kitchen.
      g.add(door({ side: 'right', room: r, u: 0.45, width: 0.82, materials: m, open: 0.55 }));

      // Console table against the party wall with a mirror over it, set far
      // enough down the hall to be in the picture rather than beside the
      // camera, where it was doing nothing.
      const c = table(m, { width: 0.84, depth: 0.31, height: 0.78 });
      c.position.set(1.15, 0, 2.26);
      g.add(c);
      g.add(rbox(0.22, 0.026, 0.15, m.timberDark, 1.3, 0.78, 2.34, 0.004));
      g.add(cyl(0.058, 0.22, m.linen, 1.76, 0.89, 2.4, 14));
      g.add(panelOnWall('right', r, m, { u: 2.4, sill: 1.04, width: 0.66, height: 0.88, material: m.mirror }));
      g.add(rug(m, 1.08, 0.5, 0.76, 1.5));
      g.add(plant(m, 1.74, 3.26, { height: 1.05 }));

      // Coat hooks on the end wall, and boots under them.
      g.add(rbox(0.62, 0.09, 0.03, m.timberDark, 1.22, 1.58, r.depth - 0.03, 0.005));
      [0.09, 0.24, 0.39, 0.54].forEach((u) =>
        g.add(cyl(0.011, 0.07, m.steel, 1.22 + u, 1.6, r.depth - 0.06, 8)),
      );
      g.add(rbox(0.15, 0.25, 0.1, m.fabricDeep, 1.26, 0, r.depth - 0.14, 0.02));
      g.add(rbox(0.15, 0.25, 0.1, m.fabricDeep, 1.45, 0, r.depth - 0.16, 0.02));

      g.add(pendant(m, 1.45, 1.2, r.height, { drop: 0.62, radius: 0.13 }));
      g.add(bulkhead(m, 1.3, 2.9, r.height));
      return g;
    },
  },

  kitchen: {
    width: 2.81, depth: 3.61, height: GROUND_H, floor: 'board',
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
    width: 3.79, depth: 1.68, height: GROUND_H, floor: 'board',
    // Looks through the cased opening and on out at the garden doors, which
    // is what the open middle band actually gives you.
    // From the head of the table, looking down it and out at the doors.
    camera: { pos: [0.42, 1.58, 0.1], target: [2.25, 1.02, 4.6], fov: 76 },
    walls: (r, m) => [
      // Doors D03 / D04 off the hall, and a wide cased opening through to
      // the living room at the rear — the plan's open middle band.
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.3, w: 0.8, sill: 0, h: 2.0, kind: 'door' }] }),
      // No wall here at all — the plan spans this side with a steel beam,
      // so the only thing over the gap is the downstand.
      wall({ side: 'back', ...r, material: m.wall, openings: [{ u: 0.18, w: r.width - 0.36, sill: 0, h: 2.24, kind: 'door' }] }),
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
      const BW = 4.95;                 // and its full width
      const BX = -(BW - r.width) / 2;  // centred on the opening
      g.add(box(BW, 0.02, BEYOND, m.board, BX, 0, r.depth));
      g.add(box(BW, 0.06, BEYOND, m.ceiling, BX, r.height, r.depth));
      g.add(box(0.03, r.height, BEYOND, m.wall, BX, 0, r.depth));
      g.add(box(0.03, r.height, BEYOND, m.wall, BX + BW - 0.03, 0, r.depth));
      // The downstand the beam sits in, expressed across the opening.
      g.add(box(r.width, 0.16, 0.2, m.ceiling, 0, r.height - 0.16, r.depth - 0.1));
      // The rear wall of the living room, with D01 in it.
      const beyondRoom = { width: BW, depth: r.depth + BEYOND, height: r.height };
      const bw = wall({ side: 'back', ...beyondRoom, material: m.wall, openings: [
        { u: 2.6, w: 1.75, sill: 0, h: 2.1 },
        { u: 0.45, w: 1.4, sill: 0.9, h: 1.2 },
      ] });
      bw.position.x = BX;
      g.add(bw);
      for (const op of [{ u: 2.6, w: 1.75, sill: 0, h: 2.1 }, { u: 0.45, w: 1.4, sill: 0.9, h: 1.2 }]) {
        const gl = glazing({ side: 'back', room: beyondRoom, materials: m, opening: op });
        gl.position.x = BX;
        g.add(gl);
      }
      // A sofa glimpsed in the living room, to the left of those doors.
      const beyondSofa = sofa(m, { width: 1.9, depth: 0.85 });
      beyondSofa.position.set(BX + 2.95, 0, r.depth + BEYOND - 0.98);
      g.add(beyondSofa);
      g.add(door({ side: 'front', room: r, u: 0.3, width: 0.8, materials: m, open: 0.6 }));

      // Drawn with its long axis running toward the opening, so the table
      // looks down the open band and out at the garden doors, with chairs
      // down both long sides.
      const t = table(m, { width: 0.92, depth: 1.62, height: 0.75 });
      t.position.set(1.24, 0, 0.12);
      g.add(t);
      // Tucked in, with the front of each seat under the edge of the top.
      [0.38, 1.0, 1.62].forEach((z) => {
        const l = chair(m);
        l.rotation.y = Math.PI / 2;
        l.position.set(1.05, 0, z);
        g.add(l);
        const rr = chair(m);
        rr.rotation.y = -Math.PI / 2;
        rr.position.set(2.35, 0, z);
        g.add(rr);
      });
      // Sideboard against the outer wall.
      const sb = unitRun(m, { length: 1.3, height: 0.72, depth: 0.4, doorMat: m.timberDark, count: 3, plinth: 0.06 });
      sb.position.set(3.2, 0, 0.06);
      g.add(sb);
      g.add(panelOnWall('front', r, m, { u: 2.5, sill: 1.05, width: 0.9, height: 0.66, material: m.fabricDeep }));
      // Kept short so it lights the table without blocking the through view.
      g.add(pendant(m, 1.7, 0.95, r.height, { drop: 0.4, radius: 0.17 }));

      return g;
    },
  },

  living: {
    width: 4.95, depth: 3.23, height: GROUND_H, floor: 'board',
    // Stands in the front corner and looks diagonally across, which is the
    // only way this room gives you the glazing and the wall opposite the
    // seating in one frame. The order the client fixed still holds: the sofa
    // reads to the left of the garden doors.
    camera: { pos: [4.15, 1.56, 0.22], target: [1.55, 1.06, 2.85], fov: 80 },
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

      /*
       * Laid out as drawn: the three-seater sits against the rear wall under
       * W01, immediately to the left of the D01 garden doors, facing back
       * into the room. It is on the same wall as the glazing, not down a
       * side wall.
       */
      const s = sofa(m, { width: 2.25, depth: 0.9 });
      s.position.set(2.62, 0, 2.24);
      g.add(s);
      // A throw over the arm nearest the room, which is the one detail that
      // most reliably stops a sofa reading as a showroom piece.
      const th = throwOver(m, { armW: 0.19, width: 0.62, drop: 0.4 });
      th.position.set(2.62, 0.62, 2.34);
      g.add(th);

      /*
       * The media wall, on the return wall opposite the seating.
       *
       * The rear wall of this room is all glazing and the front wall is the
       * cased opening through to the dining room, so the return is the only
       * wall a television and a fire can go on — which is where they go in a
       * room this shape anyway. It is drawn as a 130 mm applied panel because
       * that is what it would be: the drawings show no chimney and none is
       * claimed here.
       */
      const mw = mediaWall(m, { width: 2.3, tv: 1.25 });
      mw.rotation.y = Math.PI / 2;
      mw.position.set(0.02, 0, 2.86);
      g.add(mw);

      // Armchair turned in toward the fire and the sofa both.
      const arm = sofa(m, { width: 0.9, depth: 0.82 });
      arm.position.set(0.92, 0, 0.78);
      arm.rotation.y = 0.58;
      g.add(arm);

      const ct = coffeeTable(m, { width: 1.12, depth: 0.62, height: 0.4 });
      ct.position.set(2.32, 0, 1.32);
      g.add(ct);

      // A rug big enough to sit under the front of the sofa and reach the
      // fire, which is what pulls the seating into one group.
      g.add(rug(m, 1.24, 1.0, 2.7, 1.58));

      g.add(plant(m, 0.95, 2.82, { height: 1.3 }));
      // Floor lamp in the corner by the window.
      g.add(cyl(0.035, 1.45, m.frame, 4.66, 0.72, 2.4, 10));
      g.add(cyl(0.16, 0.26, m.linen, 4.66, 1.55, 2.4, 16));
      return g;
    },
  },

  /* ------------------------------------------------------------------- FIRST */
  master: {
    // 3745 wide, which is the figure dimensioned inside the room on sheet 03;
    // it was modelled 3640. D10 is in the front wall at the landing end.
    width: 3.745, depth: 2.76, height: FIRST_H, floor: 'carpet',
    camera: { pos: [3.52, 1.64, 0.3], target: [1.55, 1.0, 2.62], fov: 72 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.16, w: 0.82, sill: 0, h: 2.0, kind: 'door' }] }),
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
      b.rotation.y = Math.PI;
      b.position.set(2.56, 0, 2.02);
      g.add(b);
      [[0.78, 0.06], [2.68, 0.06]].forEach(([x, z]) => {
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
      g.add(door({ side: 'front', room: r, u: 0.16, width: 0.82, materials: m, open: 0 }));
      g.add(rug(m, 0.82, 0.16, 1.9, 0.8, m.carpet));
      return g;
    },
  },

  ensuite: {
    // 1100 wide: the rear band is 4945 internal and the master is dimensioned
    // 3745, which leaves 1100 once the 100 dividing wall is taken out. The
    // published 1210 does not reconcile with the master's own figure.
    width: 1.1, depth: 2.76, height: FIRST_H, floor: 'tileFloor',
    camera: { pos: [0.86, 1.52, 2.62], target: [0.5, 1.0, 0.3], fov: 80 },
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
    /*
     * The family bathroom, laid out as sheet 26/1362/03 draws it.
     *
     * 2795 x 1700 off the plan's own dimension strings — the 2795 in the
     * front string and the 1700 dimensioned across the room. The long rear
     * wall carries the W/C at the landing end and the basin beside it, and a
     * 1500 bath sits hard against the party wall across the far end with 100
     * clear at each end, which is what makes 1700 the room's depth. D11 is in
     * the landing wall at the front corner.
     *
     * The earlier model had this backwards: a bath down the long wall at the
     * landing end and the W/C at the party wall, in a room half a metre too
     * wide.
     */
    width: 2.795, depth: 1.7, height: FIRST_H, floor: 'tileFloor',
    // From just inside D11, which is where you stand when the door opens:
    // sanitaryware down the right-hand wall, bath across the end.
    camera: { pos: [0.22, 1.52, 0.25], target: [2.3, 0.95, 1.35], fov: 84 },
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall }),
      // D11, in the landing wall at the front end. On a left-hand wall the
      // opening runs back from the rear corner, so u is measured from there.
      wall({ side: 'left', ...r, material: m.wall, openings: [{ u: 0.84, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(tiledWalls(r, m, 2.1));
      const REAR = r.depth;

      // W/C at the landing end of the rear wall: back-to-wall pan in front of
      // a boxed cistern duct, with the plate on the duct face.
      g.add(box(0.46, 0.9, 0.2, m.tileWall, 0.21, 0, REAR - 0.2));
      g.add(rbox(0.36, 0.4, 0.52, m.sanitary, 0.27, 0, REAR - 0.72, 0.05));
      g.add(rbox(0.37, 0.035, 0.46, m.sanitary, 0.265, 0.4, REAR - 0.68, 0.014));
      g.add(box(0.22, 0.13, 0.016, m.chrome, 0.33, 0.96, REAR - 0.216));

      // Basin beside it on the same wall, wall-hung over a bottle trap.
      g.add(rbox(0.54, 0.13, 0.44, m.sanitary, 0.92, 0.79, REAR - 0.44, 0.03));
      g.add(rbox(0.42, 0.045, 0.32, m.tileWall, 0.98, 0.83, REAR - 0.39, 0.02));
      g.add(cyl(0.032, 0.2, m.chrome, 1.19, 0.68, REAR - 0.24, 12));
      g.add(cyl(0.016, 0.2, m.chrome, 1.19, 0.98, REAR - 0.12, 10));
      g.add(panelOnWall('back', r, m, { u: 1.305, sill: 1.08, width: 0.6, height: 0.76, material: m.mirror }));

      /*
       * The bath: 1500 long across the far end, hard against the party wall,
       * 100 clear at each end. The shower is over the tap end, which the plan
       * marks at the rear, with a fixed glazed screen there.
       */
      const BX = r.width - 0.7;
      g.add(rbox(0.7, 0.56, 1.5, m.sanitary, BX, 0, 0.1, 0.03));
      g.add(rbox(0.6, 0.05, 1.4, m.tileFloor, BX + 0.05, 0.4, 0.15, 0.02));
      // Panel to the room, set back under the rim so the rim reads as a lip.
      g.add(box(0.03, 0.54, 1.5, m.tileWall, BX - 0.012, 0, 0.1));
      // Taps and the shower riser at the rear end.
      g.add(cyl(0.02, 0.05, m.chrome, BX + 0.24, 0.585, REAR - 0.2, 12));
      g.add(cyl(0.02, 0.05, m.chrome, BX + 0.46, 0.585, REAR - 0.2, 12));
      g.add(cyl(0.014, 0.16, m.chrome, BX + 0.35, 0.63, REAR - 0.2, 10));
      g.add(cyl(0.017, 1.0, m.chrome, BX + 0.35, 1.5, REAR - 0.05, 10));
      g.add(cyl(0.055, 0.025, m.chrome, BX + 0.35, 2.02, REAR - 0.12, 16));
      // Fixed screen at the shower end.
      g.add(box(0.66, 1.45, 0.016, m.glass, BX, 0.56, REAR - 0.86));

      // Heated towel rail on the front wall, the one wall the plan leaves
      // clear, and downlights over.
      g.add(box(0.028, 0.78, 0.028, m.chrome, 1.44, 0.9, 0.035));
      g.add(box(0.028, 0.78, 0.028, m.chrome, 1.89, 0.9, 0.035));
      [0.95, 1.14, 1.33, 1.52].forEach((y) =>
        g.add(box(0.478, 0.022, 0.022, m.chrome, 1.44, y, 0.038)),
      );
      return g;
    },
  },

  bed3: {
    /*
     * 2795 x 2950 off sheet 03: the 2795 comes from the front dimension
     * string and the 2950 is dimensioned down the room. It was modelled 3750
     * wide, which is nearly a metre too much.
     *
     * D12 is in the landing wall at the rear end, beside the bathroom door —
     * not in the rear wall, where it was.
     */
    width: 2.795, depth: 2.95, height: FIRST_H, floor: 'carpet',
    camera: { pos: [0.46, 1.54, 2.62], target: [1.95, 1.02, 0.4], fov: 76 },
    walls: (r, m) => [
      // W16 to the front, centred. W17 lights the landing beside this room,
      // not bedroom 3 itself.
      wall({ side: 'front', ...r, material: m.wall, openings: [
        { u: 0.605, w: 1.585, sill: 0.9, h: 1.2 },
      ] }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall, openings: [{ u: 0.1, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      wall({ side: 'right', ...r, material: m.wall }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 0.605, w: 1.585, sill: 0.9, h: 1.2 } }));
      // Bed along the party wall, head to the rear, which is the only way a
      // double sits in a 2795 room with the door in the other long wall.
      const b = bed(m, { width: 1.35, length: 1.95 });
      b.rotation.y = Math.PI / 2;
      b.position.set(0.845, 0, 2.25);
      g.add(b);
      const t = unitRun(m, { length: 0.4, height: 0.5, depth: 0.36, doorMat: m.timberDark, count: 1, plinth: 0.05 });
      t.position.set(2.36, 0, 0.42);
      g.add(t);
      g.add(cyl(0.1, 0.19, m.linen, 2.56, 0.6, 0.6, 14));
      // Desk under the window.
      const d = table(m, { width: 1.1, depth: 0.5, height: 0.74 });
      d.position.set(0.55, 0, 0.06);
      g.add(d);
      const c = chair(m);
      c.position.set(0.93, 0, 0.64);
      c.rotation.y = Math.PI;
      g.add(c);
      // Wardrobe against the rear wall, clear of the door's swing.
      const wr = unitRun(m, { length: 1.2, height: 2.1, depth: 0.55, doorMat: m.door, count: 2 });
      wr.position.set(1.5, 0, r.depth - 0.55);
      g.add(wr);
      g.add(door({ side: 'left', room: r, u: 0.1, width: 0.76, materials: m, open: 0.4 }));
      g.add(rug(m, 0.35, 0.95, 1.1, 1.1, m.carpet));
      return g;
    },
  },

  landing: {
    /*
     * 2000 x 5935 off sheet 03's dimension strings — the same 2000 band the
     * entrance hall occupies below it, which is the point: the stair runs up
     * this side of the house through all three storeys.
     *
     * It was modelled 1110 wide, which is a corridor, and it made the landing
     * contradict the hall directly beneath it. At 2000 the flight, the
     * stairwell and the doors off it all fit as drawn.
     */
    width: 2.0, depth: 5.935, height: FIRST_H, floor: 'board',
    // From the head of the stair looking down the landing to W17 at the
    // front, with the well and its balustrade running away on the left.
    camera: { pos: [1.46, 1.62, 5.72], target: [0.95, 1.18, 0.55], fov: 68 },
    walls: (r, m) => [
      // W17 lights the landing at its front end; the side wall is solid on
      // this plot — W13 is plot 2's stair window.
      wall({ side: 'front', ...r, material: m.wall, openings: [{ u: 0.5, w: 0.775, sill: 0.9, h: 1.2 }] }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall }),
      // Doors off the landing, at the positions the rooms behind them put
      // them: bedroom 3 at the rear of its band, the bathroom at the front
      // of its, and the master beyond the far end.
      wall({ side: 'right', ...r, material: m.wall, openings: [
        { u: 2.09, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
        { u: 3.19, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
        { u: 5.04, w: 0.76, sill: 0, h: 2.0, kind: 'door' },
      ] }),
    ],
    build: (r, m) => {
      const g = new THREE.Group();
      g.add(glazing({ side: 'front', room: r, materials: m, opening: { u: 0.5, w: 0.775, sill: 0.9, h: 1.2 } }));
      [2.09, 3.19, 5.04].forEach((u, i) =>
        g.add(door({ side: 'right', room: r, u, width: 0.76, materials: m, open: i === 1 ? 0.5 : 0 })),
      );

      /*
       * The stairwell. The flight from the hall arrives here, so the floor is
       * trimmed out over its run and guarded on the landing side by the same
       * balustrade the flight carries. The flight on up to the second floor
       * starts from the rear of the opening.
       */
      const WELL_Z0 = 1.3;
      const WELL_Z1 = 3.62;
      g.add(box(0.94, 0.04, WELL_Z1 - WELL_Z0, m.ceiling, 0.02, -0.06, WELL_Z0));
      const bal = balustrade(m, { run: WELL_Z1 - WELL_Z0, height: 0.9, newels: 'both' });
      bal.position.set(0.98, 0, WELL_Z0);
      g.add(bal);
      // The head of the flight below, arriving at floor level.
      [0, 1].forEach((i) => {
        g.add(rbox(0.88, 0.045, 0.235, m.stair.tread, 0.06, -0.19 * (i + 1), WELL_Z0 - 0.235 * (i + 1)));
      });
      // Flight on up to the second floor, against the same wall.
      const up = stair(m, { steps: 5, rise: 0.19, going: 0.235, width: 0.88, balustrade: false });
      up.position.set(0.06, 0, WELL_Z1);
      g.add(up);
      const upBal = balustrade(m, { run: 5 * 0.235, height: 0.9, rake: 5 * 0.19, newels: 'end' });
      upBal.position.set(0.96, 0.1, WELL_Z1);
      g.add(upBal);

      // The fitted cupboard marked Cup'd, at the rear end past the master door.
      const cup = unitRun(m, { length: 1.1, height: 2.15, depth: 0.55, doorMat: m.door, count: 2 });
      cup.position.set(0.05, 0, r.depth - 0.55);
      g.add(cup);

      g.add(rug(m, 1.06, 0.55, 0.8, 1.6));
      g.add(panelOnWall('back', r, m, { u: 1.2, sill: 1.2, width: 0.5, height: 0.64, material: m.fabricDeep }));
      g.add(bulkhead(m, 1.4, 1.1, r.height));
      g.add(bulkhead(m, 1.4, 4.5, r.height));
      return g;
    },
  },

  /* ------------------------------------------------------------------ SECOND */
  bed2: {
    /*
     * 3930 x 5695, both dimensioned inside the room on sheet 03. This is the
     * figure the published copy carried a query against: the plan graphic had
     * it 2560 x 4890 and the room description 3930, and neither was right
     * about the depth. It starts 1810 back from the front wall.
     */
    width: 3.93, depth: 5.695, y0: 1.81, pitched: true, floor: 'carpet',
    camera: { pos: [3.6, 1.52, 5.3], target: [1.55, 1.12, 0.7], fov: 72 },
    // RL01 only, near the rear of the room. RL02 is plot 2's rooflight.
    rooflights: [{ u: 1.5, along: 5.09 }],
    walls: (r, m) => [
      wall({ side: 'front', ...r, material: m.wall }),
      wall({ side: 'back', ...r, material: m.wall }),
      wall({ side: 'left', ...r, material: m.wall, openings: [{ u: 1.905, w: 0.76, sill: 0, h: 2.0, kind: 'door' }] }),
      // Both side walls are internal here: the party wall one side, the
      // landing and en-suite the other. W18 is plot 2's top-landing window.
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
      g.add(door({ side: 'left', room: r, u: 1.905, width: 0.76, materials: m, open: 0.4 }));
      g.add(rug(m, 1.15, 2.7, 1.9, 1.5, m.carpet));
      g.add(plant(m, 0.55, 4.6, { height: 1.05 }));
      return g;
    },
  },

  ensuite2: {
    // 975 x 2610, both dimensioned on sheet 03 — the second of the figures
    // the published copy queried. It was carried as 1210 x 1900.
    width: 0.975, depth: 2.61, y0: 2.92, pitched: true, floor: 'tileFloor',
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
    width: 0.98, depth: 4.89, y0: 1.75, pitched: true, floor: 'board',
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
      // Stair arriving from the first floor, with the matching balustrade
      // to the void beside it.
      const bal = balustrade(m, { run: 1.9, height: 0.9, newels: 'both' });
      bal.position.set(0.06, 0, 2.6);
      g.add(bal);
      const s = stair(m, { steps: 5, rise: 0.19, going: 0.235, width: 0.78, balustrade: false });
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
