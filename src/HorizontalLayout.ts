// Third-party imports
import getOffset from "getoffset";

// Local imports
import * as OffsetUtils from "./utils/OffsetUtils";
import * as ScaleUtils from "./utils/ScaleUtils";
import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile, GridSnapResult } from "./Layout";
import * as Attributes from "./Attributes";

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
    // Current X in the cascading EM unit
    let x = 0;
    let parent_w = this.groups.length == 0 ? 0 : (this.groups.length - 1) * this.$._group_gap;
    let parent_h = this.$._label_height + this.$._tile_gap + this.$._height*this.$._small_size + (this.$._height-1)*this.$._tile_gap;

    // Rearrange group tiles and reposition groups
    for (const group of this.groups) {
      group.rearrange();

      // ignore from layout any group being dragged.
      if (group.div?.getAttribute(Attributes.ATTR_DRAGGING) == "true") {
        continue;
      }

      // Reposition group
      let width = 0;
      if (group.div) {
        group.div.style.transform = `translateX(${x}em) translateY(0)`;
        width = ((group.div.getBoundingClientRect().width / ScaleUtils.getScale(group.div).x) / this.$._em);
      } else {
        width = this.$._small_size*4;
      }
      parent_w += width;
      x += width + this.$._group_gap;
    }

    // parent width has some additional increase
    parent_w += this.$._small_size*2;

    // Set parent size
    this.$._container.style.width = parent_w + "em";
    this.$._container.style.height = parent_h + "em";
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
    const r = this.$._small_size/2;

    // resultY
    const tilesHeight = this.$._height*this.$._small_size + (this.$._height - 1)*this.$._tile_gap;
    const fullHeight = tilesHeight + this.$._label_height + this.$._tile_gap;
    // skip label
    accY += this.$._label_height;
    // skip gap between label and tilesDiv
    accY += this.$._tile_gap;
    // offset-Y check 1
    const offset_middle_y = offset.y + offset.h/2;
    if (offset_middle_y < accY) {
      return null;
    }
    const vertical_start = accY;
    for (; accY < fullHeight; resultY++) {
      if (offset.y < accY + this.$._small_size/2) {
        break;
      }
      accY += this.$._small_size + this.$._tile_gap;
    }
    if (offset.y > accY + this.$._small_size) {
      return null;
    }

    let resultGroup: undefined | string = undefined;

    // resultX
    const offset_center_x = offset.x + offset.w/2;
    if (offset_center_x < 0) {
      return null;
    }
    for (const group of this.$._layout.groups) {
      let w = 0;
      if (group.div) {
        w = ((group.div.getBoundingClientRect().width / ScaleUtils.getScale(group.div).x) / this.$._em);
      } else {
        w = this.$._small_size*4;
      }
      const endX = accX + w;
      const group_horizontal_start = accX;
      resultGroup = group.id;
      if (offset.x < group_horizontal_start - r) {
        return null;
      }
      if (offset.x > group_horizontal_start + w + this.$._small_size / 2) {
        // move on to the next group
        accX += w + this.$._group_gap;
        continue;
      }
      for (resultX = 0; accX < endX; resultX++) {
        if (offset.x < accX + this.$._small_size/2) {
          return { group: resultGroup, x: resultX, y: resultY };
        }
        accX += this.$._small_size + this.$._tile_gap;
      }
      return { group: resultGroup, x: resultX, y: resultY };
    }
    // Request anonymous group
    return {
      group: undefined,
      x: 0,
      y: resultY,
    };
  }
}