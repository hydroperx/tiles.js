/**
 * Tile size.
 */
export type TileSize = "small" | "medium" | "wide" | "large";

export function get_size_width_small(size: TileSize): number
{
    return size == "large" ? 4 : size == "wide" ? 4 : size == "medium" ? 2 : 1;
}

export function get_size_height_small(size: TileSize): number
{
    return size == "large" ? 4 : size == "wide" ? 2 : size == "medium" ? 2 : 1;
}

export type TileSize$widthheight = {
    small_w: number,
    small_h: number,
    medium_w: number,
    medium_h: number,
    wide_w: number,
    wide_h: number,
    large_w: number,
    large_h: number,
};