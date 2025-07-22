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

      // Reposition
      const column = i % this.$._inline_groups;
      fixme();
    }
  }
}