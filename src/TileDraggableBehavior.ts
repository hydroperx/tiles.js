import getRectangleOverlap from "rectangle-overlap";

import type { Tiles } from "./Tiles";

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