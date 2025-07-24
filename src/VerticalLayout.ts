// Local imports
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
    const column_y_em = new Map<number, number>();
    let parent_w_em = this.$._inline_groups * this.$._group_width + (this.$._inline_groups - 1) * this.$._group_gap;
    let parent_h_em = 0;
    let max_rows_found = new Map<number, number>();

    // Rearrange group tiles and reposition groups
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      group.rearrange();

      // Reposition group
      const column = i % this.$._inline_groups;
      const left = (column * this.$._group_width + column * this.$._group_gap) + "em";
      const top = column_y_em.get(column)! + "em";
      group.div.style.transform = `translateX(${left}) translateY(${top})`;
      const h = ((group.div.getBoundingClientRect().height / ScaleUtils.getScale(group.div).y) / this.$._em);
      parent_h_em += h;
      column_y_em.set(column, h + this.$._group_gap);
      max_rows_found.set(column, (max_rows_found.get(column) ?? 0) + 1);
    }

    // Set parent size
    const max_rows = Math.max(...Array.from(max_rows_found.values()));
    parent_h_em += max_rows == 0 ? 0 : (max_rows - 1) * this.$._group_gap;
    this.$._container.style.width = parent_w_em + "em";
    this.$._container.style.height = parent_h_em + "em";
  }

  /**
   * Snaps location to grid.
   */
  public override snapToGrid(rect: DOMRect): null | GridSnapResult {
    fixme();
  }
}