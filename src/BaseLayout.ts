import assert from "assert";

/**
 * A tile in the `BaseLayout` class.
 */
export class BaseTile {
  /**
   * @param x X coordinate in small tiles unit (1x1).
   * @param y Y coordinate in small tiles unit (1x1).
   * @param width Width in small tiles unit (1x1).
   * @param height Height in small tiles unit (1x1).
   */
  public constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  get left() {
    return this.x;
  }

  get top() {
    return this.y;
  }

  get right() {
    return this.x + this.width;
  }

  get bottom() {
    return this.y + this.height;
  }

  /**
   * Checks whether two tiles intersect.
   */
  public intersects(other: BaseTile): boolean {
    return !(
      this.x + this.width <= other.x ||
      this.x >= other.x + other.width ||
      this.y + this.height <= other.y ||
      this.y >= other.y + other.height
    );
  }

    intersection(other: BaseTile): null | BaseTile {
      const { x: ax1, y: ay1 } = this;
      const ax2 = this.x + this.width;
      const ay2 = this.y + this.height;
      const { x: bx1, y: by1 } = other;
      const bx2 = other.x + other.width;
      const by2 = other.y + other.height;

      const ix1 = Math.max(ax1, bx1);
      const iy1 = Math.max(ay1, by1);
      const ix2 = Math.min(ax2, bx2);
      const iy2 = Math.min(ay2, by2);

      if (ix1 < ix2 && iy1 < iy2) {
        return new BaseTile(ix1, iy1, ix2 - ix1, iy2 - iy1);
      }
      return null;
  }
  
  /**
   * Determines what side of `other` this tile intersects with.
   */
  public intersectsSideOf(other: BaseTile): null | IntersectionSide {
    // Based on ChatGPT

    const intersection = this.intersection(other);
    if (!intersection) {
      return null;
    }

    // Compute overlap depths
    const overlap_x = intersection!.width;
    const overlap_y = intersection!.height;

    if (overlap_x < overlap_y) {
      // Horizontal penetration is smaller → collision is Left/Right
      let from_left  = Math.abs(this.right - other.left);
      let from_right = Math.abs(other.right - this.left);

      if (from_left < from_right) {
        return "left";
      } else {
        return "right";
      }
    } else {
      // Vertical penetration is smaller → collision is Top/Bottom
      let from_top    = Math.abs(this.bottom - other.top);
      let from_bottom = Math.abs(other.bottom - this.top);

      if (from_top < from_bottom) {
        return "top";
      } else {
        return "bottom";
      }
    }
  }

  /**
   * Clones tile data.
   */
  public clone(): BaseTile {
    return new BaseTile(this.x, this.y, this.width, this.height);
  }
}

/**
 * The side where a tile intersects with another.
 */
export type IntersectionSide =
  | "top"
  | "bottom"
  | "left"
  | "right";

/**
 * A layout mimmicking the Windows 8 or 10's live tile layout.
 *
 * Tiles have a minimum position of (0, 0), and the maximum
 * position is either infinite, or:
 * 
 * - If `width` is given in the constructor, maximum X = `width`.
 * - If `height` is given in the constructor, maximum Y = `height`.
 */
export class BaseLayout {
  /**
   * Tile data.
   */
  public tiles: Map<string, BaseTile> = new Map();

  /**
   * Maximum width.
   */
  private maxWidth?: number;

  /**
   * Maximum height.
   */
  private maxHeight?: number;

  /**
   * A `BaseLayout` is horizontal if there is a set height.
   */
  public get isHorizontal() {
    return this.maxHeight !== undefined;
  }

  /**
   * A `BaseLayout` is vertical if there is a set width.
   */
  public get isVertical() {
    return this.maxWidth !== undefined;
  }

  /**
   * Constructor. Must specify one of `width` and `height`.
   * 
   * - A `width` limits how far tiles can go horizontally.
   *   If specified, must be at least 4.
   * - A `height` limits how far tiles can go vertically.
   *   If specified, must be at least 4.
   */
  public constructor({ width, height }: { width?: number; height?: number }) {
    assert(!(width === undefined && height === undefined), "One of width and height must be specified.");
    assert(!(width !== undefined && height !== undefined), "Width and height are mutually-exclusive.");
    this.maxWidth = width;
    this.maxHeight = height;
    assert(this.maxWidth === undefined || this.maxWidth >= 4, "Width must be >= 4 if specified.");
    assert(this.maxHeight === undefined || this.maxHeight >= 4, "Height must be >= 4 if specified.");
  }

  /**
   * Clones the `BaseLayout`.
   */
  public clone() {
    const r = new BaseLayout({
      width: this.maxWidth,
      height: this.maxHeight,
    });
    r.tiles = new Map(Array.from(this.tiles.entries())
      .map(([id, tile]) => [id, tile.clone()]));
    return r;
  }

  /**
   * Returns whether a specific tile exists.
   */
  public hasTile(id: string): boolean {
    return this.tiles.has(id);
  }

  /**
   * Returns the size of the layout in small tile units (1x1),
   * counting maximum width and maximum height.
   */
  public getLayoutSize(): { width: number; height: number } {
    let maxX = this.maxWidth ?? 0;
    let maxY = this.maxHeight ?? 0;
    for (const tile of this.tiles.values()) {
      maxX = Math.max(maxX, tile.x + tile.width);
      maxY = Math.max(maxY, tile.y + tile.height);
    }
    return { width: maxX, height: maxY };
  }

  /**
   * Attempts to add a tile, shifting any overlapping tiles as needed.
   *
   * If `x` and `y` are given as `null`, then this method always succeeds,
   * as the tile will be added into the best last position.
   * 
   * @param x X coordinate in small tiles unit (1x1), or `null`.
   * @param y Y coordinate in small tiles unit (1x1), or `null`.
   * @throws An `Error` if either x or y are null, but not both are null.
   * @returns `true` if there was no unsolvable conflict, and `false` otherwise.
   */
  public addTile(id: string, x: number | null, y: number | null, width: number, height: number): boolean {
    assert(!this.tiles.has(id), `Tile ${id} already exists.`);
    assert(!((x === null || y === null) && (x !== null || y !== null)), "If any of (x,y) are null, then both must be null.");
    // If both (x, y) are specified, add tile and shift
    // as needed.
    if (x !== null && y !== null) {
      const snapshot = this.snapshot();
      this.tiles.set(id, new BaseTile(x!, y!, width, height));
      this.fitBaseTile(id, tile);
      if (this.resolveConflicts(id)) {
        this.fillMinimumPosition();
        this.compact();
        return true;
      }
      this.restoreSnapshot(snapshot);
      return false;
    // If `x` and `y` are `null`, the tile is positioned at the best *last* position.
    } else {
      let [x, y] = this.findBestLastPosition(width, height);
      // If the resulting (x,y) leave holes between other tile clusters,
      // then snap the resulting (x,y) so there is no hole between other tiles
      // (e.g. ensure they are contiguous).
      const [horizontal_hole, vertical_hole] = this.findHoles(x, y);
      x -= horizontal_hole;
      y -= vertical_hole;
    }
    return true;
  }

  /**
   * Attempts to move a tile, shifting overlapping tiles as needed.
   *
   * @param x X coordinate in small tiles unit (1x1).
   * @param y Y coordinate in small tiles unit (1x1).
   * @returns `true` if there was no unsolvable conflict, and `false` otherwise.
   */
  public moveTile(id: string, x: number, y: number): boolean {
    //
  }

  /**
   * Attempts to resize a tile, shifting overlapping tiles as needed.
   *
   * @returns `true` if there was no unsolvable conflict, and `false` otherwise.
   */
  public resizeTile(id: string, width: number, height: number): boolean {
    //
  }

  /**
   * Removes a tile, pushing any bottom-located neighbours at fitting horizontal line
   * towards the removed tile.
   */
  public removeTile(id: string): void {
    fixme();
  }

  /**
   * Clears everything.
   */
  public clear(): void {
    this.tiles.clear();
  }

  // Intersecting tiles
  private getIntersectingTiles(tile: BaseTile, excludeId: string): string[] {
    const result: string[] = [];
    for (const [id, other] of this.tiles.entries()) {
      if (id !== excludeId && tile.intersects(other)) {
        result.push(id);
      }
    }
    return result;
  }

  // Finds best last position for a tile.
  private findBestLastPosition(width: number, height: number): [number, number] {
    let testTile = new BaseTile(0, 0, width, height);
    if (this.isHorizontal) {
      const layout_height = this.maxHeight!;
      for (let x = 0;; x++) {
        testTile.x = x;
        for (let y = 0; y < layout_height; y++) {
          testTile.y = y;
          if (this.getIntersectingTiles(testTile, "").length === 0) {
            return [x, y];
          }
        }
      }
    } else {
      const layout_width = this.maxWidth!;
      for (let y = 0;; y++) {
        testTile.y = y;
        for (let x = 0; x < layout_width; x++) {
          testTile.x = x;
          if (this.getIntersectingTiles(testTile, "").length === 0) {
            return [x, y];
          }
        }
      }
    }
  }

  // Find holes between a given position and tile clusters.
  private findHoles(x: number, y: number): [number, number] {
    //
  }

  // Returns a copy of the tile data.
  private snapshot(): Map<string, BaseTile> {
    return new Map(
      [...this.tiles.entries()].map(([id, tile]) => [id, tile.clone()])
    );
  }

  // Restore tile data.
  private restoreSnapshot(snapshot: Map<string, BaseTile>): void {
    this.tiles = new Map(snapshot);
  }
}