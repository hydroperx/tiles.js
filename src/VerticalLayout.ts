import * as ScaleUtils from "./utils/ScaleUtils";
import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";

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

    // Rearrange group tiles and reposition groups
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      group.rearrange();

      // Reposition group
      const column = i % this.$._inline_groups;
      group.div.style.left = (column * this.$._small_size + column * this.$._tile_gap) + "em";
      group.div.style.top = column_y_em.get(column)! + "em";
      column_y_em.set(column, ((group.div.getBoundingClientRect().height / ScaleUtils.getScale(group.div).y) / this.$._em) + this.$._tile_gap);
    }
  }
}