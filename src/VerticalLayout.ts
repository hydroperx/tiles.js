// Third-party imports
import getOffset from "getoffset";

// Local imports
import * as OffsetUtils from "./utils/OffsetUtils";
import * as PaddingUtils from "./utils/PaddingUtils";
import * as ScaleUtils from "./utils/ScaleUtils";
import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile, GridSnapResult } from "./Layout";

/**
 * Vertical layout.
 */
export class VerticalLayout extends Layout {
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
    // Column Y in EM
    const column_y = new Map<number, number>();
    // Parent width in EM
    const parent_w = this.$._inline_groups*(this.$._group_width*this.$._small_size + (this.$._group_width-1)*this.$._tile_gap) + (this.$._inline_groups-1)*this.$._group_gap;
    // Parent height in EM
    let parent_h = 0;
    let max_rows_found = new Map<number, number>();

    // Rearrange group tiles and reposition groups
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      group.rearrange();

      // Reposition group
      const column = i % this.$._inline_groups;
      const left = (column * this.$._group_width + column * this.$._group_gap);
      const top = column_y.get(column)!;
      group.div.style.transform = `translateX(${left}em) translateY(${top}em)`;
      const h = ((group.div.getBoundingClientRect().height / ScaleUtils.getScale(group.div).y) / this.$._em);
      parent_h += h;
      column_y.set(column, h + this.$._group_gap);
      max_rows_found.set(column, (max_rows_found.get(column) ?? 0) + 1);
    }

    // Set parent size
    const max_rows = Math.max(...Array.from(max_rows_found.values()));
    parent_h += max_rows == 0 ? 0 : (max_rows - 1) * this.$._group_gap;
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
    let resultX = 0, resultY = 0, accX = 0;
    const columnY = new Map<number, number>();
    let column = 0;

    // resultX
    const groupWidth = this.$._group_width*this.$._small_size + (this.$._group_width-1)*this.$._tile_gap;
    const groupsWidth = this.$._inline_groups*groupWidth + (this.$._inline_groups-1)*this.$._group_gap;
    const offset_center_x = offset.x + offset.w/2;
    if (offset_center_x < 0) {
      return null;
    }
    for (; accX < groupsWidth; column++) {
      const groupStartX = accX;
      const groupEndX = accX + groupWidth;
      for (resultX = 0; accX < groupEndX; resultX++) {
        if (offset.x < accX + this.$._small_size/2) {
          break;
        }
        accX += this.$._small_size + this.$._tile_gap;
      }
      accX += this.$._group_gap;
    }
    if (offset.x > accX) {
      return null;
    }

    // resultY
    const offset_middle_y = offset.y + offset.h/2;
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      const column = i % this.$._inline_groups;
      const groupStartY = columnY.get(column) ?? 0;
      let accY = groupStartY + this.$._label_height + this.$._tile_gap;
      const groupInnerStartY = accY;
      const h = ((group.div.getBoundingClientRect().height / ScaleUtils.getScale(group.div).y) / this.$._em);
      const groupEndY = groupStartY + h;
      for (; accY < groupEndY; resultY++) {
        if (offset.y < accY + this.$._small_size/2) {
          return {
            group: group.id,
            x: resultX,
            y: resultY,
          };
        }
        accY += this.$._small_size + this.$._tile_gap;
      }
      columnY.set(column, groupStartY + h + this.$._group_gap);
    }

    // Request an anonymous group
    return {
      group: undefined,
      x: 0,
      y: 0,
    };
  }
}