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
}