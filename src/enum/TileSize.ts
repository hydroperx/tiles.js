/**
 * Tile size.
 */
export type TileSize = "small" | "medium" | "wide" | "large";

/**
 * Returns tile width as small tile units.
 */
export function getWidth(size: TileSize): number {
  return size == "large" ? 4 : size == "wide" ? 4 : size == "medium" ? 2 : 1;
}

/**
 * Returns tile height as small tile units.
 */
export function getHeight(size: TileSize): number {
  return size == "large" ? 4 : size == "wide" ? 2 : size == "medium" ? 2 : 1;
}

export type TileResolution = {
  small: TileResolutionPair;
  medium: TileResolutionPair;
  wide: TileResolutionPair;
  large: TileResolutionPair;
};

export type TileResolutionPair = { w: number, h: number };