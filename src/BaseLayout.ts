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

  /**
   * Checks whetehr two tiles intersect.
   */
  public intersects(other: BaseTile): boolean {
    return !(
      this.x + this.width <= other.x ||
      this.x >= other.x + other.width ||
      this.y + this.height <= other.y ||
      this.y >= other.y + other.height
    );
  }

  /**
   * Clones tile data.
   */
  public clone(): BaseTile {
    return new BaseTile(this.x, this.y, this.width, this.height);
  }
}

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
   * Constructor.
   * 
   * - A `width` may be specified to limit how far tiles can go horizontally.
   * - A `height` may be specified to limit how far tiles can go vertically.
   */
  public constructor({ width, height }: { width?: number; height?: number }) {
    this.maxWidth = width;
    this.maxHeight = height;
  }

  /**
   * Returns whether a specific tile exists.
   */
  public hasTile(id: string): boolean {
    return this.tiles.has(id);
  }

  /**
   * Returns the size of the layout in small tile units (1x1).
   */
  public getLayoutSize(): { width: number; height: number } {
    let maxX = 0;
    let maxY = 0;
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
   * @throws A TypeError if either x or y are null, but not both are null.
   * @returns `true` if there was no unsolvable conflict, and `false` otherwise.
   */
  public addTile(id: string, x: number | null, y: number | null, width: number, height: number): boolean {
    const newTile = new BaseTile(x ?? 0, y ?? 0, width, height);
    if (x === null || y === null) {
      if ((x === null && y !== null) || (x !== null && y === null)) {
        throw new TypeError("If either x or y are null, then both must be null.");
      }
      const best = this.findBestPosition(width, height);
      newTile.x = best.x;
      newTile.y = best.y;
    }

    const originalState = this.snapshot();
    this.tiles.set(id, newTile);

    if (this.resolveConflicts(id)) return true;

    this.restoreSnapshot(originalState);
    return false;
  }

  /**
   * Attempts to move a tile, shifting overlapping tiles as needed.
   *
   * @param x X coordinate in small tiles unit (1x1).
   * @param y Y coordinate in small tiles unit (1x1).
   * @returns `true` if there was no unsolvable conflict, and `false` otherwise.
   */
  public moveTile(id: string, x: number, y: number): boolean {
    const tile = this.tiles.get(id);
    if (!tile) return false;

    const originalState = this.snapshot();
    tile.x = x;
    tile.y = y;

    if (this.resolveConflicts(id)) return true;

    this.restoreSnapshot(originalState);
    return false;
  }

  /**
   * Attempts to resize a tile, shifting overlapping tiles as needed.
   *
   * @returns `true` if there was no unsolvable conflict, and `false` otherwise.
   */
  public resizeTile(id: string, width: number, height: number): boolean {
    const tile = this.tiles.get(id);
    if (!tile) return false;

    const originalState = this.snapshot();
    tile.width = width;
    tile.height = height;

    if (this.resolveConflicts(id)) return true;

    this.restoreSnapshot(originalState);
    return false;
  }

  /**
   * Removes a tile, pushing any bottom-located neighbours at fitting horizontal line
   * towards the removed tile.
   */
  public removeTile(id: string): void {
    const removed = this.tiles.get(id);
    if (!removed) return;
    this.tiles.delete(id);

    // Push horizontally-fitting bottom neighbours.
    for (const [tid, tile] of this.tiles) {
      if (tile.y > removed.y && tile.x >= removed.x && tile.x + tile.width <= removed.x + removed.width) {
        tile.y = Math.max(0, tile.y - removed.height);
      }
    }
  }

  /**
   * Clears everything.
   */
  public clear(): void {
    this.tiles.clear();
  }

  // Resolve overlapping tiles of a target tile by shifting them
  // somewhere else around the original position,
  // and ensures the target tile is within bounds.
  private resolveConflicts(targetId: string): boolean {
    const toCheck = [targetId];

    while (toCheck.length > 0) {
      const id = toCheck.pop()!;
      const tile = this.tiles.get(id)!;

      for (const [otherId, otherTile] of this.tiles) {
        if (id === otherId /* || moved.has(otherId) */) continue;

        const isIntersecting = tile.intersects(otherTile);
        const isOutOfBounds =
          otherTile.x < 0 ||
          otherTile.y < 0 ||
          (this.maxWidth !== undefined && otherTile.x + otherTile.width > this.maxWidth) ||
          (this.maxHeight !== undefined && otherTile.y + otherTile.height > this.maxHeight);

        if (isIntersecting || isOutOfBounds) {
          let foundPos = this.findAvailableNearbyPosition(
            otherTile,
            otherId,
            otherTile.x,
            otherTile.y
          );

          if (!foundPos) {
            foundPos = this.findAvailablePositionFor(otherTile, otherId);
          }

          if (!foundPos) return false;

          const movedTile = otherTile.clone();
          movedTile.x = foundPos.x;
          movedTile.y = foundPos.y;
          this.tiles.set(otherId, movedTile);

          toCheck.push(otherId);
        }
      }

      const isOutOfBounds =
        tile.x < 0 ||
        tile.y < 0 ||
        (this.maxWidth !== undefined && tile.x + tile.width > this.maxWidth) ||
        (this.maxHeight !== undefined && tile.y + tile.height > this.maxHeight);

      if (isOutOfBounds) {
        let foundPos = this.findAvailableNearbyPosition(tile, id, tile.x, tile.y);
        if (!foundPos) {
          foundPos = this.findAvailablePositionFor(tile, id);
        }
        if (!foundPos) return false;
        tile.x = foundPos.x;
        tile.y = foundPos.y;
      }
    }

    return true;
  }

  // Finds a best last position.
  private findBestPosition(width: number, height: number): { x: number; y: number } {
    let y = 0;
    while (true) {
      for (let x = 0; !this.maxWidth || x + width <= this.maxWidth; x++) {
        const testTile = new BaseTile(x, y, width, height);
        if (![...this.tiles.values()].some(t => t.intersects(testTile))) {
          return { x, y };
        }
      }
      y++;
      if (this.maxHeight && y + height > this.maxHeight) break;
    }
    return { x: 0, y: 0 }; // fallback
  }

  // Method used in conflict resolution.
  private findAvailableNearbyPosition(
    tile: BaseTile,
    excludeId: string,
    originX: number,
    originY: number,
    maxRadius: number = 10
  ): { x: number; y: number } | null {
    const layoutWidth = this.maxWidth ?? Infinity;
    const layoutHeight = this.maxHeight ?? Infinity;

    for (let radius = 0; radius <= maxRadius; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) + Math.abs(dy) !== radius) continue;

          const x = originX + dx;
          const y = originY + dy;

          if (x < 0 || y < 0 || x + tile.width > layoutWidth || y + tile.height > layoutHeight) continue;

          const testTile = new BaseTile(x, y, tile.width, tile.height);
          const overlaps = [...this.tiles.entries()].some(
            ([id, other]) => id !== excludeId && testTile.intersects(other)
          );

          if (!overlaps) return { x, y };
        }
      }
    }

    return null;
  }

  // Method used in conflict resolution.
  private findAvailablePositionFor(tile: BaseTile, excludeId: string): { x: number; y: number } | null {
    const layoutWidth = this.maxWidth ?? Infinity;
    const layoutHeight = this.maxHeight ?? Infinity;

    for (let y = 0; y + tile.height <= layoutHeight; y++) {
      for (let x = 0; x + tile.width <= layoutWidth; x++) {
        const testTile = new BaseTile(x, y, tile.width, tile.height);
        const overlaps = [...this.tiles.entries()].some(
          ([id, other]) => id !== excludeId && testTile.intersects(other)
        );
        if (!overlaps) {
          return { x, y };
        }
      }
    }

    return null;
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