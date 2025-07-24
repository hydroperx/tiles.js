// Third-party imports
import getOffset from "getoffset";

// Local imports
import * as PaddingUtils from "./utils/PaddingUtils";
import * as ScaleUtils from "./utils/ScaleUtils";
import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile, GridSnapResult } from "./Layout";

/**
 * Horizontal layout.
 */
export class HorizontalLayout extends Layout {
  /**
   * Constructor.
   */
  public constructor($: Tiles) {
    super($);
  }

  /**
   * Rearranges group tiles.
   */
  public override rearrange(): void {
    let x_em = 0;
    let parent_w_em = this.groups.length == 0 ? 0 : (this.groups.length - 1) * this.$._group_gap;
    let parent_h_em = this.$._height;

    // Rearrange group tiles and reposition groups
    for (const group of this.groups) {
      group.rearrange();

      // Reposition group
      group.div.style.transform = `translateX(${x_em}) translateY(0)`;
      const width_em = ((group.div.getBoundingClientRect().width / ScaleUtils.getScale(group.div).x) / this.$._em);
      parent_w_em += width_em;
      x_em += width_em + this.$._group_gap;
    }

    // Set parent size
    this.$._container.style.width = parent_w_em + "em";
    this.$._container.style.height = parent_h_em + "em";
  }

  /**
   * Snaps location to grid.
   */
  public override snapToGrid(tile: HTMLButtonElement): null | GridSnapResult {
    const offset = getOffset(tile, this.$._container)!;
    offset.x /= this.$._em;
    offset.y /= this.$._em;
    offset.left = offset.x;
    offset.top = offset.y;
    offset.width /= this.$._em;
    offset.height /= this.$._em;
    offset.w = offset.width;
    offset.h = offset.height;
    offset.bottom /= this.$._em;
    offset.right /= this.$._em;
    let accX = 0, accY = 0, resultX = 0, resultY = 0;

    // resultY
    const tiles_h_em = this.$._height*this.$._small_size + (this.$._height - 1)*this.$._tile_gap;
    const full_h_em = tiles_h_em + this.$._label_height + this.$._tile_gap;
    // skip label
    accY += this.$._label_height;
    // skip gap between the label and tile divs.
    accY += this.$._tile_gap;
    // resultY check 1
    if (offset.y + offset.h / 2 < accY) {
      return null;
    }
    const v_start_em = accY;
    for (; accY < full_h_em; resultY++) {
      fixme();
      if (accY != v_start_em) {
        accY += this.$._tile_gap;
      }
      accY += this.$._small_size;
    }
    if (offset.y + offset.h / 2 > accY) {
      return null;
    }

    // resultX
    for (const group of this.$._layout.groups) {
      //
    }

    fixme();
  }
}