// Third-party imports
import getOffset from "getoffset";

// Local imports
import * as OffsetUtils from "./utils/OffsetUtils";
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
    let parent_h_em = this.$._height*this.$._small_size + (this.$._height-1)*this.$._tile_gap;

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
    // Base offset
    const offset = getOffset(tile, this.$._container)!;
    OffsetUtils.divideOffsetBy(offset, this.$._em);
  
    // Basics
    let accX = 0, accY = 0, resultX = 0, resultY = 0;

    // resultY
    const tilesHeight = this.$._height*this.$._small_size + (this.$._height - 1)*this.$._tile_gap;
    const fullHeight = tilesHeight + this.$._label_height + this.$._tile_gap;
    // skip label
    accY += this.$._label_height;
    // skip gap between the label and tile divs.
    accY += this.$._tile_gap;
    // offset-Y check 1
    const offset_middle_y = offset.y + offset.h/2;
    if (offset_middle_y < accY) {
      return null;
    }
    const vertical_start = accY;
    for (; accY < fullHeight; resultY++) {
      if (offset_middle_y < accY) {
        break;
      }
      if (accY != vertical_start) {
        accY += this.$._tile_gap;
      }
      accY += this.$._small_size;
    }
    if (offset.y > accY) {
      return null;
    }

    let resultGroup: undefined | string = undefined;

    // resultX
    const offset_center_x = offset.x + offset.w / 2;
    if (offset_center_x < 0) {
      return null;
    }
    for (const group of this.$._layout.groups) {
      const w = ((group.div.getBoundingClientRect().width / ScaleUtils.getScale(group.div).x) / this.$._em);
      const endX = accX + w;
      const group_horizontal_start = accX;
      resultGroup = group.id;
      for (resultX = 0; accX < endX; resultX++) {
        if (offset_center_x < accX) {
          break;
        }
        if (accX != group_horizontal_start) {
          accX += this.$._tile_gap;
        }
        accX += this.$._small_size;
      }
      if (accX != 0) {
        accX += this.$._group_gap;
      }
      accX += w;
    }
    if (offset.x > accX) {
      // Request anonymous group
      return {
        group: undefined,
        createGroups: undefined,
        x: 0,
        y: resultY,
      };
    }

    // Result
    return {
      group: resultGroup,
      createGroups: undefined,
      x: resultX,
      y: resultY,
    };
  }
}