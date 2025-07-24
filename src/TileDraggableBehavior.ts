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