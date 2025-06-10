/**
 * Tile size.
 */
export type TileSize = "small" | "medium" | "wide" | "large";

export function get_size_width_small(size: TileSize): number {
  return size == "large" ? 4 : size == "wide" ? 4 : size == "medium" ? 2 : 1;
}

export function get_size_height_small(size: TileSize): number {
  return size == "large" ? 4 : size == "wide" ? 2 : size == "medium" ? 2 : 1;
}

export type TileResolution = {
  small: TileResolutionPair;
  medium: TileResolutionPair;
  wide: TileResolutionPair;
  large: TileResolutionPair;
};

export type TileResolutionPair = { w: number, h: number };