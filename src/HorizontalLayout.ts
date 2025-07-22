import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";

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
    // Rearrange group tiles
    for (const group of this.groups) {
      group.rearrange();
    }

    // Reposition groups
    fixme();
  }
}