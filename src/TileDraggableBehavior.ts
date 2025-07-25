// Third-party imports
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";
import getOffset from "getoffset";
import * as kiwi from "@lume/kiwi";

// Local imports
import { TileSize, getWidth, getHeight } from "./enum/TileSize";
import * as RandomUtils from "./utils/RandomUtils";
import * as RectangleUtils from "./utils/RectangleUtils";
import * as TranslateUtils from "./utils/TranslateUtils";
import type { Tiles } from "./Tiles";
import type { State } from "./State";
import * as Attributes from "./Attributes";
import { Layout, LayoutGroup, LayoutTile, GridSnapResult } from "./Layout";

/**
 * Drag-n-drop behavior for tiles.
 */
export class TileDraggableBehavior {
  private _startX: number = 0;
  private _startY: number = 0;
  private _startLayoutIndex: number = 0;
  private _startState: null | State = null;
  private _gridSnap: null | GridSnapResult = null;
  private _ghostTile: null | LayoutTile = null;

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
    this._ghostTile = null;

    // Reset grid snap caches
    this._gridSnap = null;

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

    // Track last grid snap
    const oldGridSnap = this._gridSnap!;

    // Try snapping to grid
    this._gridSnap = this.$._layout.snapToGrid(button);

    // If grid snap resolves successfully to an existing area
    if (this._gridSnap!.group) {
      let thresholdMet = true;

      // If ghost tile has already been created
      if (this._ghostTile) {
        // Require a X/Y change threshold (of 1 small tile) to
        // continue procedures from here on.
        thresholdMet =
          Math.abs(oldGridSnap.x - this._gridSnap!.x) >= 1 ||
          Math.abs(oldGridSnap.y - this._gridSnap!.y) >= 1;

        // Revert ghost tile
        if (thresholdMet) {
          this._revertGhostTile();
        }
      }

      // If thresold is met
      if (thresholdMet) {
        // Insert a ghost tile without button at the layout
        const layout_group = this.$._layout.groups.find(g => g.id == this._gridSnap!.group)!;
        const xVar = new kiwi.Variable();
        const yVar = new kiwi.Variable();
        const size = button.getAttribute(Attributes.ATTR_SIZE) as TileSize;
        const w = getWidth(size);
        const h = getHeight(size);
        this._ghostTile = new LayoutTile(layout_group, "__anonymous$" + RandomUtils.hexLarge(), null, xVar, yVar, w, h);
        layout_group.tiles.push(this._ghostTile!);
        layout_group.solver.addEditVariable(xVar, kiwi.Strength.strong);
        layout_group.solver.addEditVariable(yVar, kiwi.Strength.strong);
        layout_group.solver.suggestValue(xVar, this._gridSnap!.x);
        layout_group.solver.suggestValue(yVar, this._gridSnap!.y);
        layout_group.refreshNonOverlappingConstraints();
        this.$._deferred_rearrange();
      }
    // Otherwise if a ghost tile has been created
    } else if (this._ghostTile) {
      const layout_group = this._ghostTile!.$;
      this._revertGhostTile();
      layout_group.refreshNonOverlappingConstraints();
      this.$._deferred_rearrange();
    }

    // Trigger Tiles#drag event
    this.$.dispatchEvent(new CustomEvent("drag", {
      detail: { tile: button },
    }));
  }

  // Drag end
  private _dragEnd(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const button = this.$._buttons.get(id)!;

    // Proceed only if still dragging.
    if (button.getAttribute(Attributes.ATTR_DRAGGING) != "true") {
      return;
    }

    // Re-enable pointer events on Tiles container
    this.$._container.style.pointerEvents = "";
    
    // Reset pointer events setting on the tile's button
    button.style.pointerEvents = "";

    // Reset Z-index
    button.style.zIndex = "";

    // Remove dragging indicator
    button.removeAttribute(Attributes.ATTR_DRAGGING);

    //
    fixme();
  }

  // Reverts the ghost tile created automatically from grid snapping.
  private _revertGhostTile(): void {
    const layout_group = this._ghostTile!.$;
    // Remove it from the layout
    layout_group.tiles.splice(layout_group.tiles.indexOf(this._ghostTile!), 1);
    // Recreate the Cassowary solver for the respective group
    layout_group.solver = new kiwi.Solver();
    // Update every tile to reflect the old state;
    // also refresh min/max constraints.
    for (const tile of layout_group.tiles) {
      tile.refreshMinConstraints();
      tile.refreshMaxConstraints();
      layout_group.solver.addEditVariable(tile.x, kiwi.Strength.weak);
      layout_group.solver.addEditVariable(tile.y, kiwi.Strength.weak);
      const oldTileState = this._startState!.tiles.get(tile.id);
      if (oldTileState) {
        layout_group.solver.suggestValue(tile.x, oldTileState.x);
        layout_group.solver.suggestValue(tile.y, oldTileState.y);
      } else {
        // Keep any new tiles as they are, reflecting the current state.
        const s = this.$._state.tiles.get(tile.id);
        layout_group.solver.suggestValue(tile.x, s?.x ?? 0);
        layout_group.solver.suggestValue(tile.y, s?.y ?? 0);
      }
    }
    // Refresh non-overlapping constraints
    layout_group.refreshNonOverlappingConstraints();

    // Clear cache
    this._ghostTile = null;
  }
}