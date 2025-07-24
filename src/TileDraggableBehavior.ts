// Third-party imports
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";

// Local imports
import * as RandomUtils from "./utils/RandomUtils";
import * as RectangleUtils from "./utils/RectangleUtils";
import * as TranslateUtils from "./utils/TranslateUtils";
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
    const button = this.$._buttons.get(id)!;

    // Drag end handler
    const drag_end = this._dragEnd.bind(this);
    this.$._tile_drag_end_handlers.set(button, drag_end);

    // Setup Draggable
    this.$._tile_draggables.set(button, new Draggable(button, {
      threshold: "1em",
      onDragStart: this._dragStart.bind(this),
      onDrag: this._drag.bind(this),
      onDragEnd: drag_end,
    }));
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

  // Drag start
  private _dragStart(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const button = this.$._buttons.get(id)!;

    // Disable pointer interaction on whole parent
    this.$._container.style.pointerEvents = "none";
    // ... however allow it in that specific tile.
    button.style.pointerEvents = "auto";

    // Display tile over everything
    button.style.zIndex = "999999999";

    // While the tile is being dragged, it is moved out of the group div temporarily and
    // appears a direct child of the Tiles container.
    button.remove();
    this.$._container.appendChild(button);

    // Patch the initial draggable position.
    const t = TranslateUtils.ownTranslate(button);
    fixme();

    //
    fixme();
  }

  // Drag
  private _drag(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const button = this.$._buttons.get(id)!;

    //
    fixme();
  }

  // Drag end
  private _dragEnd(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const button = this.$._buttons.get(id)!;

    //
    fixme();
  }
}