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
    // Group width in EM
    const group_w = this.$._group_width*this.$._small_size + (this.$._group_width-1)*this.$._tile_gap;
    // Parent width in EM
    const parent_w = this.$._inline_groups*group_w + (this.$._inline_groups-1)*this.$._group_gap;
    // Parent height in EM
    let parent_h = 0;
    let max_rows_found = new Map<number, number>();

    // Rearrange group tiles and reposition groups
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      group.rearrange();

      // Reposition group
      const column = i % this.$._inline_groups;
      const left = column*group_w + column*this.$._group_gap;
      const top = column_y.get(column) ?? 0;
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
    let resultX = 0, resultY = 0;
    const columnY = new Map<number, number>();

    // resultX: Find group and tile index
    const groupWidth = this.$._group_width*this.$._small_size + (this.$._group_width-1)*this.$._tile_gap;
    if (offset.x < -this.$._small_size * 2) {
      return null;
    }
    let groupIdx = -1;
    let groupColumn = -1;
    let groupStartX = 0;
    for (let col = 0; col < this.$._inline_groups; col++) {
      const startX = col * groupWidth + col * this.$._group_gap;
      const endX = startX + groupWidth;
      if (offset.x >= startX - this.$._small_size/2 && offset.x < endX + this.$._small_size/2) {
        groupColumn = col;
        groupStartX = startX;
        break;
      }
    }
    if (groupColumn === -1) {
      return null;
    }
    // Find groupIdx in this.groups for this column
    for (let i = 0, col = 0; i < this.groups.length; i++, col = i % this.$._inline_groups) {
      if (col === groupColumn) {
        groupIdx = i;
        break;
      }
    }
    // Find tile index within group
    let tileX = 0;
    let tileStartX = groupStartX;
    for (; tileX < this.$._group_width; tileX++) {
      if (offset.x < tileStartX + this.$._small_size/2) {
        break;
      }
      tileStartX += this.$._small_size + this.$._tile_gap;
    }
    resultX = tileX;
    // resultY
    let foundY = false;
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      const column = i % this.$._inline_groups;
      if (column !== groupColumn) continue;
      const groupStartY = columnY.get(column) ?? 0;
      let accY = groupStartY + this.$._label_height + this.$._tile_gap;
      const h = ((group.div.getBoundingClientRect().height / ScaleUtils.getScale(group.div).y) / this.$._em);
      const groupEndY = groupStartY + h;
      let tileY = 0;
      for (; accY < groupEndY; tileY++) {
        if (offset.y < accY + this.$._small_size/2) {
          resultY = tileY;
          foundY = true;
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