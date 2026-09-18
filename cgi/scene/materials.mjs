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

/** Fixed materials — everything that is not a buyer choice. */
const FIXED = {
  ceiling: { color: '#f6f5f2', roughness: 0.97 },
  skirting: { color: '#fbfaf7', roughness: 0.5 },
  oakFloor: { color: '#b08a5f', roughness: 0.55 },
  darkOakFloor: { color: '#8f6c46', roughness: 0.58 },
  tileFloor: { color: '#cdc7bd', roughness: 0.32 },
  tileWall: { color: '#ddd8cf', roughness: 0.26 },
  carpet: { color: '#b9b2a6', roughness: 1.0 },
  boarded: { color: '#c3ac8b', roughness: 0.85 },
  worktop: { color: '#2a2d31', roughness: 0.22 },
  worktopLight: { color: '#e9e5dc', roughness: 0.25 },
  steel: { color: '#c8cdd2', roughness: 0.28, metalness: 0.85 },
  brass: { color: '#c0983f', roughness: 0.3, metalness: 0.8 },
  chrome: { color: '#dfe4e8', roughness: 0.12, metalness: 0.95 },
  sanitary: { color: '#fdfdfc', roughness: 0.16 },
  glass: { color: '#dceaf0', roughness: 0.05, metalness: 0.0, opacity: 0.22, transparent: true },
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

  return {
    wall: std(wall),
    // Reveals sit a shade darker so the opening reads as depth, not a decal.
    reveal: std({ color: wall.color, roughness: 0.95 }),
    door: std(door),
    doorFrame: std({ color: '#fbfaf7', roughness: 0.5 }),
    kitchenUnit: std(kitchen),
    kitchenWall: std({ ...kitchen, roughness: (kitchen.roughness ?? 0.4) + 0.04 }),
    ceiling: std(FIXED.ceiling),
    skirting: std(FIXED.skirting),
    oakFloor: textured('oakFloor', FIXED.oakFloor, () => plankCanvas(FIXED.oakFloor.color), 1.4),
    darkOakFloor: textured('darkOakFloor', FIXED.darkOakFloor, () => plankCanvas(FIXED.darkOakFloor.color), 1.4),
    tileFloor: textured('tileFloor', FIXED.tileFloor, () => tileCanvas(FIXED.tileFloor.color, 3), 2.2),
    tileWall: textured('tileWall', FIXED.tileWall, () => tileCanvas(FIXED.tileWall.color, 2), 2.2),
    carpet: textured('carpet', FIXED.carpet, () => carpetCanvas(FIXED.carpet.color), 0.7),
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
