import {
  TileSizeMap,
  getWidth,
  getHeight,
  TileSize,
} from "./enum/TileSize";
import * as RectangleUtils from "./utils/RectangleUtils";
import { TileDraggableBehavior } from "./TileDraggableBehavior";
import type { Tiles, AddTileParams } from "./Tiles";

/**
 * Tile factory.
 */
export class TileFactory {
  // Constructor
  public constructor(private $: Tiles) {
    //
  }

  // Adds a tile.
  public add(params: AddTileParams): HTMLButtonElement {
    fixme();
  }

  // Removes a tile.
  public remove(id: string) {
    fixme();
  }
}