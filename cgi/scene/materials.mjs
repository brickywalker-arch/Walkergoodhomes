import * as THREE from 'three';
import { viewTexture, surface, plankCanvas, carpetCanvas, tileCanvas, boardCanvas } from './stage.mjs';

/**
 * Finish palettes.
 *
 * The three buyer-selectable groups (kitchen units, wall paint, internal doors)
 * carry the same ids and swatches the website offers, so a render can be keyed
 * off exactly the selection the visitor made.
 */
export const WALL_PAINT = {
  chalk: { color: '#efece4', roughness: 0.94 },
  clay: { color: '#d8c8b4', roughness: 0.94 },
  slate: { color: '#9aa6ad', roughness: 0.92 },
};

export const DOOR_FINISH = {
  white: { color: '#f2f2ef', roughness: 0.42, metalness: 0.0 },
  oak: { color: '#b1855a', roughness: 0.56, metalness: 0.0 },
  grey: { color: '#4c5257', roughness: 0.44, metalness: 0.0 },
};

export const KITCHEN_FINISH = {
  graphite: { color: '#3d4348', roughness: 0.38 },
  sage: { color: '#7e8b73', roughness: 0.44 },
  oak: { color: '#c49a63', roughness: 0.52 },
  ivory: { color: '#e6dfd0', roughness: 0.42 },
};

/**
 * Floor coverings, chosen as one scheme for the whole house.
 *
 * `board` is what goes down on the ground floor and the landings and `carpet`
 * what goes down in the bedrooms, picked as a pair so the two read together on
 * the stairs between them. The wet rooms take their floor from TILE_FINISH
 * instead, because there the floor tile is the tile choice.
 */
export const FLOOR_FINISH = {
  oak: {
    board: { color: '#b08a5f', roughness: 0.55, grain: 1, mottle: 0 },
    carpet: { color: '#bdb6a9', roughness: 1.0 },
  },
  smoked: {
    board: { color: '#7c5c3e', roughness: 0.52, grain: 1.15, mottle: 0 },
    carpet: { color: '#aea496', roughness: 1.0 },
  },
  grey: {
    board: { color: '#a8a29a', roughness: 0.58, grain: 0.75, mottle: 0 },
    carpet: { color: '#aaa9a6', roughness: 1.0 },
  },
  stone: {
    // A stone-effect plank, so the grain drops away and the face mottles.
    board: { color: '#c2baae', roughness: 0.4, grain: 0.15, mottle: 1 },
    carpet: { color: '#c0b6a3', roughness: 1.0 },
  },
};

/**
 * Bathroom tiling — the four Al Murad ranges the buyer chooses between.
 *
 * `floor` is the large-format floor tile and `wall` the wall tile, which in
 * each of these ranges is the same stone in the same finish; `vein` and
 * `veining` are what make a marble-effect range read as marble rather than as
 * a flat coloured square.
 */
export const TILE_FINISH = {
  calacatta: {
    floor: { color: '#eeece6', roughness: 0.3 },
    wall: { color: '#f3f1ec', roughness: 0.16 },
    vein: '#aab0b6', veining: 0.95, grout: '#d9d5cd',
  },
  capel: {
    floor: { color: '#e6dcc8', roughness: 0.32 },
    wall: { color: '#ece3d2', roughness: 0.2 },
    vein: '#b49a57', veining: 0.8, grout: '#cfc4ad',
  },
  bardiglio: {
    floor: { color: '#98999a', roughness: 0.3 },
    wall: { color: '#a3a4a5', roughness: 0.18 },
    vein: '#6b6e72', veining: 0.9, grout: '#83858a',
  },
  noir: {
    floor: { color: '#4c4d50', roughness: 0.26 },
    wall: { color: '#55565a', roughness: 0.14 },
    vein: '#2e3035', veining: 0.7, grout: '#3e4044',
  },
};

/**
 * Staircase and balustrade — Howdens stair parts.
 *
 * `kind` is what fills the space between the handrail and the string:
 * `spindle` for turned timber, `glass` for a Richard Burbidge panel. `profile`
 * picks the spindle section, which is the difference between a stop-chamfered
 * spindle and a plain square one.
 */
export const STAIR_FINISH = {
  chamfered: {
    kind: 'spindle', profile: 'chamfered',
    spindle: { color: '#f6f4ef', roughness: 0.46 },
    newel: { color: '#f6f4ef', roughness: 0.46 },
    handrail: { color: '#8a6540', roughness: 0.4 },
    string: { color: '#fbfaf7', roughness: 0.5 },
    tread: 'board',
  },
  oak: {
    kind: 'spindle', profile: 'square',
    spindle: { color: '#b1855a', roughness: 0.48 },
    newel: { color: '#a97e54', roughness: 0.48 },
    handrail: { color: '#9a6f45', roughness: 0.38 },
    string: { color: '#fbfaf7', roughness: 0.5 },
    tread: 'board',
  },
  glass: {
    kind: 'glass',
    spindle: { color: '#b1855a', roughness: 0.48 },
    newel: { color: '#a97e54', roughness: 0.48 },
    handrail: { color: '#9a6f45', roughness: 0.38 },
    string: { color: '#fbfaf7', roughness: 0.5 },
    tread: 'board',
  },
};

/** Fixed materials — everything that is not a buyer choice. */
const FIXED = {
  ceiling: { color: '#f6f5f2', roughness: 0.97 },
  skirting: { color: '#fbfaf7', roughness: 0.5 },
  boarded: { color: '#c3ac8b', roughness: 0.85 },
  worktop: { color: '#2a2d31', roughness: 0.22 },
  worktopLight: { color: '#e9e5dc', roughness: 0.25 },
  steel: { color: '#c8cdd2', roughness: 0.28, metalness: 0.85 },
  brass: { color: '#c0983f', roughness: 0.3, metalness: 0.8 },
  chrome: { color: '#dfe4e8', roughness: 0.12, metalness: 0.95 },
  sanitary: { color: '#fdfdfc', roughness: 0.16 },
  // Real glass carries a reflection of the room and a little colour in
  // the sheet; flat transparency is most of why the old windows read as a
  // hole cut in the wall.
  glass: { color: '#cfe0e6', roughness: 0.02, metalness: 0.08, opacity: 0.16, transparent: true },
  frame: { color: '#34383c', roughness: 0.42 },
  fabricWarm: { color: '#a9a294', roughness: 0.95 },
  fabricDeep: { color: '#4a5560', roughness: 0.95 },
  linen: { color: '#e8e3d8', roughness: 0.96 },
  timberDark: { color: '#4b3a2b', roughness: 0.6 },
  rug: { color: '#7c7364', roughness: 1.0 },
};

/**
 * Mapped surfaces, built once.
 *
 * Floors, tiling, carpet and boarding do not depend on the buyer's selection —
 * only wall paint, door and unit colours do, and those are plain colours. The
 * texture set is therefore cached: drawing the 2048px canvases and deriving
 * their normal maps is the most expensive part of a render, and repeating it
 * for all 162 renders would dominate the run.
 */
const SURFACE_CACHE = new Map();

function cachedSurface(name, build) {
  const hit = SURFACE_CACHE.get(name);
  if (hit) return hit;
  const made = build();
  SURFACE_CACHE.set(name, made);
  return made;
}

export function makeMaterials(finishes, level = 'ground') {
  const std = (spec) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.color),
      roughness: spec.roughness ?? 0.8,
      metalness: spec.metalness ?? 0.0,
      transparent: spec.transparent ?? false,
      opacity: spec.opacity ?? 1,
      envMapIntensity: spec.envMapIntensity ?? 1,
    });

  /** A mapped surface: colour plus the normal map derived from it. */
  const textured = (name, spec, drawCanvas, normalStrength = 1.5) => {
    const { map, normalMap } = cachedSurface(name, () =>
      surface(drawCanvas(), { strength: normalStrength }),
    );
    return new THREE.MeshStandardMaterial({
      map,
      normalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),
      color: 0xffffff,
      roughness: spec.roughness ?? 0.8,
      metalness: spec.metalness ?? 0.0,
    });
  };

  const wall = WALL_PAINT[finishes.walls] ?? WALL_PAINT.chalk;
  const door = DOOR_FINISH[finishes.doors] ?? DOOR_FINISH.white;
  const kitchen = KITCHEN_FINISH[finishes.kitchen] ?? KITCHEN_FINISH.graphite;
  const floorId = FLOOR_FINISH[finishes.floors] ? finishes.floors : 'oak';
  const tileId = TILE_FINISH[finishes.tiles] ? finishes.tiles : 'calacatta';
  const stairId = STAIR_FINISH[finishes.stairs] ? finishes.stairs : 'chamfered';
  const floors = FLOOR_FINISH[floorId];
  const tiles = TILE_FINISH[tileId];
  const stairs = STAIR_FINISH[stairId];

  // The cache key has to carry the scheme. Without it the first render's
  // boards and tiles would be handed to every later render, and a set of
  // floor choices that all look identical is worse than not offering them.
  const board = textured(
    `board:${floorId}`,
    floors.board,
    () => plankCanvas(floors.board.color, { grain: floors.board.grain, mottle: floors.board.mottle }),
    1.4,
  );
  const carpet = textured(`carpet:${floorId}`, floors.carpet, () => carpetCanvas(floors.carpet.color), 0.7);
  const tileFloor = textured(
    `tileFloor:${tileId}`,
    tiles.floor,
    () => tileCanvas(tiles.floor.color, 3, { vein: tiles.vein, veining: tiles.veining, grout: tiles.grout }),
    2.2,
  );
  const tileWall = textured(
    `tileWall:${tileId}`,
    tiles.wall,
    () => tileCanvas(tiles.wall.color, 2, { vein: tiles.vein, veining: tiles.veining, grout: tiles.grout }),
    2.2,
  );

  return {
    board,
    carpet,
    tileFloor,
    tileWall,
    // The staircase's own parts, so a room that draws a balustrade does not
    // have to know which of the three was chosen.
    stair: {
      kind: stairs.kind,
      profile: stairs.profile ?? 'square',
      spindle: std(stairs.spindle),
      newel: std(stairs.newel),
      handrail: std(stairs.handrail),
      string: std(stairs.string),
      tread: board,
      glass: std({ color: '#d5e3e8', roughness: 0.04, metalness: 0.1, opacity: 0.22, transparent: true }),
      clamp: std(FIXED.steel),
    },
    wall: std(wall),
    // Reveals sit a shade darker so the opening reads as depth, not a decal.
    reveal: std({ color: wall.color, roughness: 0.95 }),
    door: std(door),
    doorFrame: std({ color: '#fbfaf7', roughness: 0.5 }),
    kitchenUnit: std(kitchen),
    kitchenWall: std({ ...kitchen, roughness: (kitchen.roughness ?? 0.4) + 0.04 }),
    ceiling: std(FIXED.ceiling),
    skirting: std(FIXED.skirting),
    boarded: textured('boarded', FIXED.boarded, () => boardCanvas(), 1.3),
    worktop: std(finishes.kitchen === 'graphite' ? FIXED.worktopLight : FIXED.worktop),
    steel: std(FIXED.steel),
    brass: std(FIXED.brass),
    chrome: std(FIXED.chrome),
    sanitary: std(FIXED.sanitary),
    glass: std(FIXED.glass),
    frame: std(FIXED.frame),
    fabricWarm: std(FIXED.fabricWarm),
    fabricDeep: std(FIXED.fabricDeep),
    linen: std(FIXED.linen),
    timberDark: std(FIXED.timberDark),
    rug: std(FIXED.rug),
    plant: std({ color: '#5d7050', roughness: 0.85 }),
    // The view out, unlit so the glazing reads as daylight rather than as a
    // surface the interior lighting has to reach.
    sky: new THREE.MeshBasicMaterial({ map: cachedSurface(`view:${level}`, () => viewTexture(level)) }),
    mirror: std({ color: '#c9d6dd', roughness: 0.06, metalness: 0.7 }),
    // Seen through a cased opening into the next room — a lit interior, not
    // the outdoors, so it must not use the view texture.
    interiorBeyond: new THREE.MeshBasicMaterial({ color: new THREE.Color('#b9b2a4') }),
  };
}
