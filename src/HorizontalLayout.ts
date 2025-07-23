// Local imports
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
}