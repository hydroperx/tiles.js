// Third-party imports
import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";
import getOffset from "getoffset";

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
      threshold: "0.7em",
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
    const layout_group = this.$._layout.groups.find(g => g.hasTile(id))!;
    const layout_tile = layout_group.getTile(id)!;

    // Parent group-tiles-div
    const group_tiles_div = button.parentElement!;

    // Save drag start (since the container will change, save offset too)
    const group_tiles_offset = getOffset(group_tiles_div, this.$._container)!;
    const group_tiles_inner_left = group_tiles_offset.left + group_tiles_div.clientLeft;
    const group_tiles_inner_top = group_tiles_offset.top + group_tiles_div.clientTop;
    const tile_offset = getOffset(button, group_tiles_div)!;
    // this._startX = group_tiles_inner_left + tile_offset.x;
    // this._startY = group_tiles_inner_top + tile_offset.y;
    this._startX = group_tiles_inner_left;
    this._startY = group_tiles_inner_top;
    this._startState = this.$._state.clone();

    // While the tile is being dragged, it is moved out of the group div temporarily and
    // appears a direct child of the Tiles container.
    button.remove();
    this.$._container.appendChild(button);

    // Remove the tile from the layout group.
    layout_tile.remove();

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

    // Rearrange
    this.$._deferred_rearrange();
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
    if (!!this._gridSnap && this._gridSnap!.group) {
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
        const size = button.getAttribute(Attributes.ATTR_SIZE) as TileSize;
        const { x, y } = this._gridSnap!;
        const w = getWidth(size);
        const h = getHeight(size);

        // Limit ghost tile to a certain extent,
        // so that dragging the tile doesn't keep infinitely
        // growing the same group.
        let extentLimit = false;
        const layoutSize = layout_group.getLayoutSize();
        if (this.$._dir == "horizontal") {
          const r = w == 1 ? 2 : w == 2 ? 4 : 6;
          if (x + w > layoutSize.width + r) {
            extentLimit = true;
          }
        } else {
          const r = h == 1 ? 2 : h == 2 ? 4 : 6;
          if (y + h > layoutSize.height + r) {
            extentLimit = true;
          }
        }

        if (extentLimit) {
          this._gridSnap = null;
        } else {
          this._ghostTile = new LayoutTile("__anonymous$" + RandomUtils.hexLarge(), null);
          // If can't add ghost tile, cancel it.
          if (!this._ghostTile!.addTo(layout_group, x, y, w, h)) {
            this._ghostTile = null;
            this._gridSnap = null;
          }
        }
        this.$._deferred_rearrange();
      } else {
        this.$._deferred_rearrange();
      }
    // Otherwise if a ghost tile has been created
    } else if (this._ghostTile) {
      this._revertGhostTile();
      this.$._deferred_rearrange();
    // Or just rearrange.
    } else {
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
    
    // Basics
    const tile_state = this.$._state.tiles.get(id)!;
    const old_layout_group = this.$._layout.groups.find(group => group.id == tile_state.group)!;

    // If the tile is about to be removed
    if (button.getAttribute(Attributes.ATTR_REMOVING) == "true") {
      // Remove tile from the DOM
      if (this.$._tile_removal_work) {
        this.$._tile_removal_work(button).then(() => {
          button.remove();
        });
      } else {
        button.remove();
      }

      // Uninstall draggable behavior
      this.uninstall();

      // Remove from state
      this.$._state.tiles.delete(id);

      // Remove from `Tiles#_buttons`
      this.$._buttons.delete(id);

      // If checked, trigger selection change event.
      if (button.getAttribute(Attributes.ATTR_CHECKED)) {
        const all_buttons = [
          ...this.$._container.getElementsByClassName(this.$._class_names.tile),
        ].map(btn => [
          btn.getAttribute(Attributes.ATTR_ID),
          btn.getAttribute(Attributes.ATTR_CHECKED) === "true",
        ]);
        // Emit selectionchange event
        this.$.dispatchEvent(new CustomEvent("selectionchange", {
          detail: {
            tiles: all_buttons.filter(([, y]) => y).map(([id]) => id as string),
          }
        }));
      }

      // If there is a ghost tile, revert it.
      if (this._ghostTile) this._revertGhostTile();

      // Rearrange
      this.$._deferred_rearrange();

      // Trigger Tiles#dragend event
      this.$.dispatchEvent(new CustomEvent("dragend", {
        detail: { tile: button },
      }));

      // State update signal
      this.$._deferred_state_update_signal();

      // Clear start state
      this._startState = null;

      // Finish
      return;
    }

    // If grid snap resolves successfully to an existing area
    if (!!this._gridSnap && !!this._gridSnap!.group) {
      // Remove the ghost tile from the layout
      this._ghostTile!.remove();

      // New layout group
      const layout_group = this.$._layout.groups.find(group => group.id == this._gridSnap!.group)!;

      // Create LayoutTile
      const size = tile_state.size;
      const w = getWidth(size);
      const h = getHeight(size);
      const layout_tile = new LayoutTile(id, button);

      // Put the tile in the snap-match layout group
      assert(
        layout_tile.addTo(layout_group, this._gridSnap!.x, this._gridSnap!.y, w, h),
        "Grid snapping failure."
      );

      // Move the tile to the snap-match group's tilesDiv DOM.
      button.remove();
      if (layout_group.div) {
        layout_group.div!
          .getElementsByClassName(this.$._class_names.groupTiles)[0]
          .appendChild(button);
      }
      
      // Undo drag position
      button.style.inset = "";

      // Set the tile state's group field.
      tile_state.group = this._gridSnap!.group;

      // Iterate tiles
      for (const tile_2 of layout_group.getTiles()) {
        // For any other tile
        if (layout_tile != tile_2) {
          // Move X/Y reflecting the current state.
          const tile_state = this.$._state.tiles.get(tile_2.id)!;
          if (tile_state) {
            tile_2.move(tile_state!.x, tile_state!.y);
          }
        }
      }

      // If the previous group is empty, remove it.
      if (old_layout_group.isEmpty()) {
        this.$.removeGroup(old_layout_group.id);
      // Rearrange/state update
      } else {
        this.$._deferred_rearrange();
        this.$._deferred_state_update_signal();
      }
    // If the grid snap resolves successfully to a blank area
    } else if (!!this._gridSnap) {
      // Let group = anonymous auto-generated ID
      const group = "__anonymous$" + RandomUtils.hexLarge();
      // Create new group
      this.$.addGroup({ id: group });
      // Find layout group
      const layout_group = this.$._layout.groups.find(groupA => groupA.id == group)!;

      // Create LayoutTile
      const size = tile_state.size;
      const w = getWidth(size);
      const h = getHeight(size);
      const layout_tile = new LayoutTile(id, button);

      // Put the tile in the new layout group
      assert(
        layout_tile.addTo(layout_group, this._gridSnap!.x,this._gridSnap!.y, w, h),
        "Grid-snapping failed."
      );

      // Move the tile to the new group's tilesDiv DOM.
      button.remove();
      if (layout_group.div) {
        layout_group.div!
          .getElementsByClassName(this.$._class_names.groupTiles)[0]
          .appendChild(button);
      }

      // Undo drag position
      button.style.inset = "";

      // Set the tile state's group field.
      tile_state.group = group;

      // If the previous group is empty, remove it.
      if (old_layout_group.isEmpty()) {
        this.$.removeGroup(old_layout_group.id);
      // Rearrange/state update
      } else {
        this.$._deferred_rearrange();
        this.$._deferred_state_update_signal();
      }
    // If grid snap failed
    } else {
      // Move the tile to the DOM back in the group it was.
      button.remove();
      if (old_layout_group.div) {
        old_layout_group.div!
          .getElementsByClassName(this.$._class_names.groupTiles)[0]
          .appendChild(button);
      }

      const w = getWidth(tile_state.size);
      const h = getHeight(tile_state.size);
      const layout_tile = new LayoutTile(id, button);
      const old_tile_state = this._startState?.tiles.get(id)!;

      // Put the tile back at the initial respective layout group.
      // If it fails, insert it at the last position then.
      if (!layout_tile.addTo(old_layout_group, old_tile_state.x, old_tile_state.y, w, h)) {
        layout_tile.addTo(old_layout_group, null, null, w, h);
      }

      // Undo drag position
      button.style.inset = "";

      // If there is a ghost tile, revert it.
      if (this._ghostTile) this._revertGhostTile();

      // Update every tile to reflect the old state.
      for (const tile of old_layout_group.getTiles()) {
        const oldTileState = this._startState?.tiles.get(tile.id);
        if (oldTileState) {
          tile.move(oldTileState.x, oldTileState.y);
        } else {
          // Keep any new tiles as they are, reflecting the current state.
          const s = this.$._state.tiles.get(tile.id);
          tile.move(s?.x ?? 0, s?.y ?? 0);
        }
      }

      // Rearrange
      this.$._deferred_rearrange();
      // State update signal
      this.$._deferred_state_update_signal();
    }

    // Clear start state
    this._startState = null;

    // Trigger Tiles#dragend event
    this.$.dispatchEvent(new CustomEvent("dragend", {
      detail: { tile: button },
    }));
  }

  // Reverts the ghost tile created automatically from grid snapping.
  private _revertGhostTile(): void {
    const layout_group = this._ghostTile!.$!;
    // Remove it from the layout
    this._ghostTile!.remove();
    // Update every tile to reflect the old state.
    for (const tile of layout_group.getTiles()) {
      const oldTileState = this._startState?.tiles.get(tile.id);
      if (oldTileState) {
        tile.move(oldTileState.x, oldTileState.y);
      } else {
        // Keep any new tiles as they are, reflecting the current state.
        const s = this.$._state.tiles.get(tile.id);
        tile.move(s?.x ?? 0, s?.y ?? 0);
      }
    }

    // Clear cache
    this._ghostTile = null;
  }
}