// third-party imports
import assert from "assert";

// local imports
import {
  TileSizeMap,
  getWidth,
  getHeight,
  TileSize,
} from "./enum/TileSize";
import * as RandomUtils from "./utils/RandomUtils";
import * as RectangleUtils from "./utils/RectangleUtils";
import { TileDraggableBehavior } from "./TileDraggableBehavior";
import type { Tiles, AddTileParams } from "./Tiles";
import * as Attributes from "./Attributes";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";
import { BaseLayout } from "./BaseLayout";

/**
 * Tile factory.
 */
export class TileFactory {
  // Constructor
  public constructor(private $: Tiles) {
    //
  }

  // Adds a tile.
  public add(params: AddTileParams): boolean {
    // First assertions
    if (params.group) {
      assert(this.$._state.groups.has(params.group), `Group ${params.group} does not exist.`);
    }
    assert(!this.$._state.tiles.has(params.id), `Duplicate tile ID: ${params.id}.`);

    // Group (create/reuse if unspecified)
    let group = "";
    if (params.group) {
      group = params.group!;
    } else {
      const groups = Array.from(this.$._state.groups.entries());
      groups.sort((a, b) => a[1].index - b[1].index);
      const last_group = groups.length == 0 ? null : groups[groups.length - 1];
      if (last_group && !last_group[1].label) {
        // reuse
        group = last_group[0];
      } else {
        group = "__anonymous$" + RandomUtils.hexLarge();
        this.$.addGroup({
          id: group,
        });
      }
    }

    // Size
    const size = params.size ?? "medium";

    const button = document.createElement("button");
    button.classList.add(this.$._class_names.tile);
    button.setAttribute(Attributes.ATTR_ID, params.id);
    button.setAttribute(Attributes.ATTR_DRAGGING, "false");
    button.setAttribute(Attributes.ATTR_SIZE, size);
    button.style.position = "absolute";
    button.style.fontSize = "inherit";
    button.style.boxSizing = "border-box";
    button.style.width = this.$._tile_em[size].w + "em";
    button.style.height = this.$._tile_em[size].h + "em";

    // Contribute to layout
    const layout_group = this.$._layout.groups.find(g => g.id == group)!;
    const layout_tile = new LayoutTile(
      params.id, // tile ID
      button
    );
    if (!layout_tile.addTo(
      layout_group, // LayoutGroup
      params.x ?? null,
      params.y ?? null,
      getWidth(size), // width
      getHeight(size) // height
    )) {
      return false;
    }

    // Group div
    const group_div = Array.from(this.$._container.getElementsByClassName(this.$._class_names.group))
      .find(div => div.getAttribute(Attributes.ATTR_ID) == group)! as HTMLDivElement;
    const group_tiles_div = group_div.getElementsByClassName(this.$._class_names.groupTiles)[0];

    // Contribute button
    group_tiles_div.appendChild(button);
    this.$._buttons.set(params.id, button);

    // Tile content div
    const content_div = document.createElement("div");
    content_div.classList.add(this.$._class_names.tileContent);
    content_div.style.boxSizing = "border-box";
    content_div.style.width = "100%";
    content_div.style.height = "100%";
    content_div.style.overflow = "hidden";
    button.appendChild(content_div);

    // Contribute to overall state
    this.$._state.tiles.set(params.id, {
      size,
      x: params.x ?? 0,
      y: params.y ?? 0,
      group,
    });

    // Install Draggable behavior
    if (this.$._drag_enabled) {
      new TileDraggableBehavior(this.$, params.id).install();
    }

    // State update
    this.$._deferred_state_update_signal();

    // Rearrange
    this.$._deferred_rearrange();

    // addedtile signal
    this.$.dispatchEvent(
      new CustomEvent("addedtile", {
        detail: { tile: layout_tile, button, contentDiv: content_div },
      }),
    );

    // Result
    return true;
  }

  // Removes a tile.
  public remove(id: string) {
    // Button
    const button = this.$._buttons.get(id);
    assert(!!button, "Tile '"+id+"' not found.");

    // Set ATTR_REMOVING to true
    button.setAttribute(Attributes.ATTR_REMOVING, "true");

    // Disable pointer events
    button.style.pointerEvents = "none";

    // If the tile is being dragged, cancel the drag.
    if (button.getAttribute(Attributes.ATTR_DRAGGING) == "true") {
      // Nullify the LayoutTile's `button`
      const layout_tile = this.$._layout.groups.find(group => group.hasTile(id))?.getTile(id);
      if (layout_tile) layout_tile.button = null;

      // Trigger drag end with a fake parameter
      this.$._tile_drag_end_handlers.get(button)!(button, 0, 0, new Event("noevent"));

      // Exit
      return;
    }

    // Remove tile from the DOM
    if (this.$._tile_removal_work) {
      this.$._tile_removal_work(button).then(() => {
        button.remove();
      });
    } else {
      button.remove();
    }

    // Uninstall draggable behavior
    new TileDraggableBehavior(this.$, id).uninstall();

    // Remove from state
    this.$._state.tiles.delete(id);

    // Remove from layout
    this.$._layout.groups.find(group => group.hasTile(id))
      ?.getTile(id)?.remove();

    // Remove from `Tiles#_buttons`
    this.$._buttons.delete(id);

    // Rearrange
    this.$._deferred_rearrange();

    // State update signal
    this.$._deferred_state_update_signal();
  }
}