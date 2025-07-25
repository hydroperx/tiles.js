export type BaseTile = {
  x: number;
  y: number;
  width: number;
  height: number;
};

class Tile implements BaseTile {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  intersects(other: Tile): boolean {
    return !(
      this.x + this.width <= other.x ||
      this.x >= other.x + other.width ||
      this.y + this.height <= other.y ||
      this.y >= other.y + other.height
    );
  }

  clone(): Tile {
    return new Tile(this.x, this.y, this.width, this.height);
  }
}

export class BaseLayout {
  public tiles: Map<string, Tile> = new Map();
  private maxWidth?: number;
  private maxHeight?: number;

  constructor({ width, height }: { width?: number; height?: number }) {
    this.maxWidth = width;
    this.maxHeight = height;
  }

  hasTile(id: string): boolean {
    return this.tiles.has(id);
  }

  getLayoutSize(): { width: number; height: number } {
    let maxX = 0;
    let maxY = 0;
    for (const tile of this.tiles.values()) {
      maxX = Math.max(maxX, tile.x + tile.width);
      maxY = Math.max(maxY, tile.y + tile.height);
    }
    return { width: maxX, height: maxY };
  }

  addTile(id: string, x: number | null, y: number | null, width: number, height: number): boolean {
    const newTile = new Tile(x ?? 0, y ?? 0, width, height);
    if (x === null || y === null) {
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

  moveTile(id: string, x: number, y: number): boolean {
    const tile = this.tiles.get(id);
    if (!tile) return false;

    const originalState = this.snapshot();
    tile.x = x;
    tile.y = y;

    if (this.resolveConflicts(id)) return true;

    this.restoreSnapshot(originalState);
    return false;
  }

  resizeTile(id: string, width: number, height: number): boolean {
    const tile = this.tiles.get(id);
    if (!tile) return false;

    const originalState = this.snapshot();
    tile.width = width;
    tile.height = height;

    if (this.resolveConflicts(id)) return true;

    this.restoreSnapshot(originalState);
    return false;
  }

  removeTile(id: string): void {
    const removed = this.tiles.get(id);
    if (!removed) return;
    this.tiles.delete(id);

    for (const [tid, tile] of this.tiles) {
      if (tile.y > removed.y) {
        tile.y = Math.max(0, tile.y - removed.height);
      }
    }
  }

  clear(): void {
    this.tiles.clear();
  }

  private resolveConflicts(targetId: string): boolean {
    const toCheck = [targetId];
    const moved = new Set<string>();

    while (toCheck.length > 0) {
      const id = toCheck.pop()!;
      const tile = this.tiles.get(id)!;

      for (const [otherId, otherTile] of this.tiles) {
        if (id === otherId || moved.has(otherId)) continue;
        if (tile.intersects(otherTile)) {
          const movedTile = otherTile.clone();
          movedTile.y += tile.height;

          if (
            movedTile.x < 0 ||
            movedTile.y < 0 ||
            (this.maxWidth && movedTile.x + movedTile.width > this.maxWidth) ||
            (this.maxHeight && movedTile.y + movedTile.height > this.maxHeight)
          ) {
            return false;
          }

          this.tiles.set(otherId, movedTile);
          moved.add(otherId);
          toCheck.push(otherId);
        }
      }
    }

    return true;
  }

  private findBestPosition(width: number, height: number): { x: number; y: number } {
    let y = 0;
    while (true) {
      for (let x = 0; !this.maxWidth || x + width <= this.maxWidth; x++) {
        const testTile = new Tile(x, y, width, height);
        if (![...this.tiles.values()].some(t => t.intersects(testTile))) {
          return { x, y };
        }
      }
      y++;
      if (this.maxHeight && y + height > this.maxHeight) break;
    }
    return { x: 0, y: 0 }; // fallback
  }

  private snapshot(): Map<string, Tile> {
    return new Map(
      [...this.tiles.entries()].map(([id, tile]) => [id, tile.clone()])
    );
  }

  private restoreSnapshot(snapshot: Map<string, Tile>): void {
    this.tiles = new Map(snapshot);
  }
}

export default BaseLayout;