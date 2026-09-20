import manifest from '../../public/assets/cgi/manifest.json';
import photorealManifest from '../../public/assets/photoreal/manifest.json';
import photoManifest from '../../public/assets/photo/manifest.json';
import sheetManifest from '../../public/assets/sheets/manifest.json';
import type { Finishes } from '@/data/interior';

/**
 * Resolves rendered images.
 *
 * The CGIs are rendered from a parametric model of the house built to the
 * dimensions on sheets 26/1362/03 and /04, one image per room per finish
 * combination. `roomImage` therefore returns an exact render of the visitor's
 * own selection where one exists, and falls back to the room's base render if
 * a combination has not been rendered yet.
 */

type SizeMap = Record<string, string>;

type FinishAxis = 'kitchen' | 'walls' | 'doors' | 'floors' | 'carpet' | 'tiles' | 'stairs';

/** The order the axes appear in a manifest key. Must match scripts/render-cgi.mjs. */
const AXES: FinishAxis[] = ['kitchen', 'walls', 'doors', 'floors', 'carpet', 'tiles', 'stairs'];

type CgiManifest = {
  generated: string;
  /** The finish combination each room's base render was made with. */
  defaults?: Finishes;
  /** Which finish axes actually change each room's render. */
  axes?: Record<string, FinishAxis[]>;
  exterior: Record<string, SizeMap>;
  rooms: Record<string, SizeMap>;
  variants: Record<string, SizeMap>;
};

const CGI = manifest as CgiManifest;

const ROOM_WIDTHS = [640, 1000, 1600];
const EXT_WIDTHS = [800, 1280, 2000, 2800];

export type ResolvedImage = {
  src: string;
  srcSet: string;
  /** True when this exact finish combination has its own image. */
  exact: boolean;
  /**
   * How the image was made. A photoreal image is a generated photograph built
   * from the render of this exact selection, so it carries the drawn geometry;
   * a render is the parametric model itself. Both are computer-generated, and
   * the page says so either way.
   */
  kind: 'render' | 'photoreal';
};

function toSrcSet(sizes: SizeMap, widths: number[]): string {
  return widths
    .filter((w) => sizes[String(w)])
    .map((w) => `${sizes[String(w)]} ${w}w`)
    .join(', ');
}

function largest(sizes: SizeMap, widths: number[]): string {
  for (const w of [...widths].reverse()) {
    if (sizes[String(w)]) return sizes[String(w)];
  }
  const any = Object.values(sizes)[0];
  if (!any) throw new Error('CGI manifest entry has no image files');
  return any;
}

/**
 * An asset the page needs is not in the manifest.
 *
 * Better to stop the build with the asset's name than to hand a component an
 * empty src and have it fail somewhere less informative.
 */
function missing(what: string): never {
  throw new Error(
    `CGI asset "${what}" is not in public/assets/cgi/manifest.json. ` +
      'Run `npm run cgi:render` to render the missing images.',
  );
}

/**
 * The manifest key for a room and a selection.
 *
 * Axes that do not change the room are pinned to the render's own default, so
 * choosing sage kitchen units still resolves the exact render for a bedroom —
 * the kitchen colour is simply not visible from in there.
 */
function manifestKey(roomKey: string, finishes: Finishes): string {
  const relevant = CGI.axes?.[roomKey] ?? AXES;
  const pick = (axis: FinishAxis) =>
    relevant.includes(axis) ? finishes[axis] : (CGI.defaults?.[axis] ?? finishes[axis]);
  return [roomKey, ...AXES.map(pick)].join('|');
}

/**
 * Which of the buyer's choices change this room's image.
 *
 * The page uses it to say what the render on screen is actually showing, so a
 * visitor looking at a bedroom is not told their tile choice is in the picture
 * when the nearest tile is two doors away.
 */
export function roomAxes(roomKey: string): FinishAxis[] {
  // A photoreal image, where the room has them, is what the visitor sees, and
  // it varies on fewer axes than the render behind it.
  const live = PHOTOREAL.axes?.[roomKey] ?? CGI.axes?.[roomKey] ?? AXES;
  return AXES.filter((a) => live.includes(a));
}

type PhotorealManifest = {
  generated: string;
  defaults: Finishes;
  axes: Record<string, FinishAxis[]>;
  images: Record<string, SizeMap>;
};

const PHOTOREAL = photorealManifest as PhotorealManifest;

/**
 * The photoreal key for a selection.
 *
 * Photoreal images use coarser axes than the renders — the internal-door
 * colour is barely visible in the six rooms that have them — so the same
 * pinning applies, against the photoreal manifest's own axes.
 */
function photorealKey(roomKey: string, finishes: Finishes): string | null {
  const relevant = PHOTOREAL.axes?.[roomKey];
  if (!relevant) return null;
  const pick = (axis: FinishAxis) =>
    relevant.includes(axis) ? finishes[axis] : (PHOTOREAL.defaults?.[axis] ?? finishes[axis]);
  return [roomKey, ...AXES.map(pick)].join('|');
}

/**
 * The image for a room and a selection.
 *
 * A photoreal image wins where one exists, because it was generated from the
 * render of this exact selection and so carries the same drawn geometry. Where
 * one does not, the render is served — which is what every selection got
 * before the photoreal pass, so a partial set is safe.
 */
export function roomImage(roomKey: string, finishes: Finishes): ResolvedImage {
  const photoKey = photorealKey(roomKey, finishes);
  const photoSizes = photoKey ? PHOTOREAL.images[photoKey] : undefined;
  if (photoSizes) {
    return {
      src: largest(photoSizes, ROOM_WIDTHS),
      srcSet: toSrcSet(photoSizes, ROOM_WIDTHS),
      exact: true,
      kind: 'photoreal',
    };
  }

  const key = manifestKey(roomKey, finishes);
  const exactSizes = CGI.variants[key];
  const sizes = exactSizes ?? CGI.rooms[roomKey];
  if (!sizes) missing(key);
  return {
    src: largest(sizes, ROOM_WIDTHS),
    srcSet: toSrcSet(sizes, ROOM_WIDTHS),
    exact: Boolean(exactSizes),
    kind: 'render',
  };
}

export function exteriorImage(view: string): ResolvedImage {
  const sizes = CGI.exterior[view];
  if (!sizes) missing(`exterior/${view}`);
  return {
    src: largest(sizes, EXT_WIDTHS),
    srcSet: toSrcSet(sizes, EXT_WIDTHS),
    exact: true,
    kind: 'render',
  };
}

/* ------------------------------------------------------ approved exterior */

type PhotoManifest = {
  native: { width: number; height: number };
  images: Record<string, SizeMap>;
};

const PHOTO = photoManifest as PhotoManifest;
const PHOTO_WIDTHS = [442, 864, 884, 1300, 1728];

/**
 * The client's approved exterior visual, prepared by scripts/prepare-photo.mjs.
 *
 * This is the development's primary exterior image and it is locked — the page
 * uses it rather than a render for anything showing the outside of the homes.
 * The CGIs are for the interiors, where they can be built to the drawn
 * geometry and varied per finish selection.
 */
export function photoImage(key: string): ResolvedImage {
  const sizes = PHOTO.images[key];
  if (!sizes) {
    throw new Error(
      `Exterior image "${key}" is not in public/assets/photo/manifest.json. ` +
        'Run `node scripts/prepare-photo.mjs` to prepare it.',
    );
  }
  return {
    src: largest(sizes, PHOTO_WIDTHS),
    srcSet: toSrcSet(sizes, PHOTO_WIDTHS),
    exact: true,
    kind: 'render',
  };
}

/** Native size of the approved exterior plate, before any upscaling. */
export const PHOTO_NATIVE = PHOTO.native;

/* --------------------------------------------------------------- drawings */

type Sheet = {
  slug: string;
  width: number;
  height: number;
  aspect: number;
  full: string;
  sizes: { width: number; file: string }[];
};

const SHEET_IMAGES = sheetManifest as Sheet[];

export function sheetImage(slug: string) {
  const sheet = SHEET_IMAGES.find((s) => s.slug === slug);
  if (!sheet) return null;
  const sorted = [...sheet.sizes].sort((a, b) => a.width - b.width);
  return {
    src: sorted.at(-1)?.file ?? sheet.full,
    srcSet: sorted.map((s) => `${s.file} ${s.width}w`).join(', '),
    aspect: sheet.aspect,
  };
}
