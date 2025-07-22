import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";

/**
 * Vertical layout.
 */
export class VerticalLayout extends Layout {
  /**
   * Tiles back-reference.
   */
  private readonly $: Tiles;

  /**
   * Constructor.
   */
  public constructor($: Tiles) {
    super();
    this.$ = $;
  }
}