// Third-party imports
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";
import getOffset from "getoffset";

// Local imports
import * as RandomUtils from "./utils/RandomUtils";
import * as RectangleUtils from "./utils/RectangleUtils";
import * as TranslateUtils from "./utils/TranslateUtils";
import type { Tiles } from "./Tiles";
import type { State } from "./State";
import * as Attributes from "./Attributes";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";

/**
 * Drag-n-drop behavior for tiles.
 */
export class TileDraggableBehavior {
  private _startX: number = 0;
  private _startY: number = 0;
  private _startLayoutIndex: number = 0;
  private _startState: null | State = null;

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

    // Find the corresponding state, layout group and its index
    const state = this.$._state.tiles.get(id);
    const layout_group = this.$._layout.groups.find(g => !!g.tiles.find(t => t.id == id))!;
    const layout_tile = layout_group.tiles.find(t => t.id == id)!;
    const layout_index = layout_group.tiles.indexOf(layout_tile);

    // Parent group-tiles-div
    const group_tiles_div = button.parentElement!;

    // Save drag start (since the container will change, save offset too)
    const group_tiles_offset = getOffset(group_tiles_div, this.$._container)!;
    const group_tiles_inner_left = group_tiles_offset.left + group_tiles_div.clientLeft;
    const group_tiles_inner_top = group_tiles_offset.top + group_tiles_div.clientTop;
    const tile_offset = getOffset(button, group_tiles_div)!;
    this._startX = group_tiles_inner_left + tile_offset.x;
    this._startY = group_tiles_inner_top + tile_offset.y;
    this._startLayoutIndex = layout_index;
    this._startState = this.$._state.clone();

    // While the tile is being dragged, it is moved out of the group div temporarily and
    // appears a direct child of the Tiles container.
    button.remove();
    this.$._container.appendChild(button);

    // Remove the tile from the layout group.
    layout_group.tiles.splice(layout_index, 1);

    // Reset ghost tile caches
    fixme();

    // Reset grid snap caches
    fixme();

    // Set the `ATTR_DRAGGING` attribute to `"true"`.
    button.setAttribute(Attributes.ATTR_DRAGGING, "true");

    // Trigger Tiles#dragstart event
    this.$.dispatchEvent(new CustomEvent("dragstart", {
      detail: { tile: button },
    }));
  }

  // Drag
  private _drag(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const button = this.$._buttons.get(id)!;
    const draggable = this.$._tile_draggables.get(button)!;

    // Exit if the tile is removed while dragging.
    if (!button.parentElement) {
      return;
    }

    // Patch the draggable position (due to container move).
    const current_pos = draggable.get();
    draggable.set(
      this._startX + current_pos.x, // x
      this._startY + current_pos.y  // y
    );

    // Try snapping to grid
    const grid_snap = this.$._layout.snapToGrid(button);

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