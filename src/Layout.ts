// Third-party imports
import { gsap } from "gsap";

// Local imports
import * as Attributes from "./Attributes";
import type { Tiles } from "./Tiles";
import { BaseLayout } from "./BaseLayout";

/**
 * Layout.
 */
export abstract class Layout {
  /**
   * Tiles back-reference.
   */
  public readonly $: Tiles;

  /**
   * Ordered groups.
   */
  public readonly groups: LayoutGroup[] = [];

  /**
   * Constructor.
   */
  public constructor($: Tiles) {
    this.$ = $;
  }

  /**
   * Rearranges group tiles.
   */
  public abstract rearrange(): void;

  /**
   * Snaps location to grid.
   */
  public abstract snapToGrid(tile: HTMLButtonElement): null | GridSnapResult;
}

/**
 * Grid snap result.
 */
export type GridSnapResult = {
  /**
   * Group ID.
   *
   * If none, requests an anonymous group.
   */
  group?: string,
  /**
   * X coordinate in small tiles.
   */
  x: number,
  /**
   * Y coordinate in small tiles.
   */
  y: number,
};

/**
 * Group.
 */
export class LayoutGroup {
  /**
   * Unordered tiles.
   * @hidden
   */
  public readonly _tiles: Map<string, LayoutTile> = new Map();

  /**
   * A structure with fine-grained control over tiles.
   * @hidden
   */
  public _layout: BaseLayout;

  /**
   * Constructor.
   */
  public constructor(
    public $: Layout,
    public id: string,
    public div: HTMLDivElement,
    width: undefined | number,
    height: undefined | number
  ) {
    this._layout = new BaseLayout({ width, height });
  }

  /**
   * Returns an immutable unordered list of the contained tiles.
   */
  public getTiles(): LayoutTile[] {
    return [...this._tiles.values()];
  }

  /**
   * Returns a specific tile.
   */
  public getTile(id: string): null | LayoutTile {
    return this._tiles.get(id) ?? null;
  }

  /**
   * Returns whether a tile exists in this group.
   */
  public hasTile(id: string): boolean {
    return this._tiles.has(id);
  }

  /**
   * Returns whether the group is empty or not.
   */
  public isEmpty(): boolean {
    return this._tiles.size == 0;
  }

  /**
   * Layout size in small tiles unit (1x1).
   */
  public getLayoutSize(): { width: number; height: number } {
    return this._layout.getLayoutSize();
  }

  /**
   * Rearranges group tiles and resizes the group's tiles div.
   */
  public rearrange(): void {
    // Reposition tiles (update the group's width/height EM together)
    let changed = false;
    let
      tiles_width_em: number = 0,
      tiles_height_em: number = 0;
    if (this.$.$._dir == "vertical") {
      tiles_width_em =
        this.$.$._group_width*this.$.$._small_size +
        (this.$.$._group_width-1)*this.$.$._tile_gap;
    } else {
      tiles_height_em =
        this.$.$._height*this.$.$._small_size +
        (this.$.$._height-1)*this.$.$._tile_gap;
    }
    const to_tween_y_late: { tile: LayoutTile, button: HTMLButtonElement, hEM: number, yEM: number }[] = [];
    for (const [, tile] of this._tiles) {
      const x_em = tile.x * this.$.$._small_size + tile.x * this.$.$._tile_gap;
      const y_em = tile.y * this.$.$._small_size + tile.y * this.$.$._tile_gap;

      const w_em = tile.width * this.$.$._small_size + (tile.width - 1) * this.$.$._tile_gap;
      const h_em = tile.height * this.$.$._small_size + (tile.height - 1) * this.$.$._tile_gap;

      // change tiles size em
      tiles_width_em = Math.max(x_em + w_em, tiles_width_em);
      tiles_height_em = Math.max(y_em + h_em, tiles_height_em);

      // new X/Y state
      const state = this.$.$._state.tiles.get(tile.id);
      if (state) {
        const
          old_x = state.x,
          old_y = state.y;
        state.x = tile.x;
        state.y = tile.y;

        // state change
        if (!(old_x == state.x && old_y == state.y)) {
          changed = true;
        }

        // affect button
        if (tile.button && tile.button.getAttribute(Attributes.ATTR_DRAGGING) != "true") {
          if (tile.positioned) {
            if (tile.tween) {
              tile.tween.kill();
            }
            if (old_x != state.x && old_y != state.y) {
              // change only Y
              tile.button!.style.transform = `translateX(${x_em}em) translateY(-1000em)`;
              to_tween_y_late.push({ tile, button: tile.button!, hEM: h_em, yEM: y_em });
            } else {
              // change either only X or only Y
              tile.tween = gsap.to(tile.button!, {
                x: x_em + "em",
                y: y_em + "em",
                duration: 0.18
              });
            }
          // first position
          } else {
            tile.button!.style.transform = `translateX(${x_em}em) translateY(${y_em}em)`;
            tile.positioned = true;
          }
        }
      }
    }

    // Tween Y from off view
    const middle = tiles_height_em / 2;
    for (const { tile, button, hEM, yEM } of to_tween_y_late) {
      tile.tween = gsap.fromTo(tile.button!,
        {
          y: (yEM + hEM / 2 < middle ? -hEM : tiles_height_em + hEM) + "em",
        },
        {
          y: yEM + "em",
          duration: 0.18
        }
      );
    }

    // Resize groupTiles div
    const group_tiles_div = this.div.getElementsByClassName(this.$.$._class_names.groupTiles)[0] as HTMLElement;
    let min_w = 0;
    if (this.$.$._dir == "horizontal") {
      min_w = 18;
    }
    group_tiles_div.style.width = Math.max(min_w, tiles_width_em) + "em";
    group_tiles_div.style.height = tiles_height_em + "em";

    // State update signal
    if (changed) {
      this.$.$._deferred_state_update_signal();
    }
  }
}

/**
 * Tile.
 */
export class LayoutTile {
  /**
   * Cached tween.
   */
  public tween: null | gsap.core.Tween = null;

  /**
   * Cached indicator for initial position.
   */
  public positioned: boolean = false;

  /**
   * Parent layout group.
   */
  public $: null | LayoutGroup = null;

  /**
   * Cosntructor.
   * @param button If `null` indicates this is a placeholder tile.
   */
  public constructor(
    public readonly id: string,
    public button: null | HTMLButtonElement
  ) {
  }

  /**
   * Attempts to contributes the tile to the layout.
   * If `x` and `y` are both given as `null`, then the
   * method is guaranteed to always succeed, contributing
   * the tile to the best last position.
   */
  public addTo($: LayoutGroup, x: null | number, y: null | number, width: number, height: number): boolean {
    if ($._layout.addTile(this.id, x, y, width, height)) {
      $._tiles.set(this.id, this);
      this.$ = $;
      return true;
    }
    return false;
  }

  /**
   * Removes the tile from the parent `LayoutGroup`.
   * This method does not, however, remove the tile
   * from the overall state.
   */
  public remove(): void {
    this.positioned = false;
    this.$!._layout.removeTile(this.id);
    this.$!._tiles.delete(this.id);
  }

  /**
   * X coordinate in small tiles.
   */
  public get x(): number {
    return this.$!._layout.tiles.get(this.id)!.x;
  }

  /**
   * Y coordinate in small tiles.
   */
  public get y(): number {
    return this.$!._layout.tiles.get(this.id)!.y;
  }

  /**
   * Width in small tiles.
   */
  public get width(): number {
    return this.$!._layout.tiles.get(this.id)!.width;
  }

  /**
   * Height in small tiles.
   */
  public get height(): number {
    return this.$!._layout.tiles.get(this.id)!.height;
  }

  /**
   * Moves position.
   */
  public move(x: number, y: number): boolean {
    return this.$!._layout.moveTile(this.id, x, y);
  }

  /**
   * Resizes tile.
   */
  public resize(width: number, height: number): boolean {
    return this.$!._layout.resizeTile(this.id, width, height);
  }
}