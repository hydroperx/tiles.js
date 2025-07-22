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
}