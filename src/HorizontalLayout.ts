import * as ScaleUtils from "./utils/ScaleUtils";
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
    let x_em = 0;

    // Rearrange group tiles and reposition groups
    for (const group of this.groups) {
      group.rearrange();

      // Reposition group
      group.div.style.left = x_em + "em";
      group.div.style.top = "0";
      const width_em = ((group.div.getBoundingClientRect().width / ScaleUtils.getScale(group.div).x) / this.$._em);
      x_em += width_em + this.$._tile_gap;
    }
  }
}