// Third-party imports
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";

// Local imports
import * as RandomUtils from "./utils/RandomUtils";
import * as RectangleUtils from "./utils/RectangleUtils";
import type { Tiles } from "./Tiles";
import * as Attributes from "./Attributes";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";

/**
 * Drag-n-drop behavior for tiles.
 */
export class TileDraggableBehavior {
  // Constructor
  public constructor(private $: Tiles, private id: string) {
    //
  }

  // Installs drag-n-drop behavior.
  public install() {
    const { id } = this;
    const button = this.$._buttons.get(id);

    fixme();
  }

  // Uninstalls drag-n-drop behavior.
  public uninstall() {
    const { id } = this;
    const button = this.$._buttons.get(id);
    if (button) {
      this.$._tile_draggables.get(button)?.destroy();
      this.$._tile_draggables.delete(button);
    }
  }
}