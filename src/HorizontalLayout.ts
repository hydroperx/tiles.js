import type { Tiles } from "./Tiles";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";

/**
 * Horizontal layout.
 */
export class HorizontalLayout extends Layout {
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