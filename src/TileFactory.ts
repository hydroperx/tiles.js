// third-party imports
import assert from "assert";
import * as kiwi from "@lume/kiwi";

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

/**
 * Tile factory.
 */
export class TileFactory {
  // Constructor
  public constructor(private $: Tiles) {
    //
  }

  // Adds a tile.
  public add(params: AddTileParams) {
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

    // Group div
    const group_div = Array.from(this.$._container.getElementsByClassName(this.$._class_names.group))
      .find(div => div.getAttribute(Attributes.ATTR_ID) == group)! as HTMLDivElement;
    const group_tiles_div = group_div.getElementsByClassName(this.$._class_names.groupTiles)[0];

    // Button
    const button = document.createElement("button");
    button.classList.add(this.$._class_names.tile);
    button.setAttribute(Attributes.ATTR_ID, params.id);
    button.setAttribute(Attributes.ATTR_DRAGGING, "false");
    button.setAttribute(Attributes.ATTR_SIZE, size);
    button.style.position = "absolute";
    button.style.width = this.$._tile_em[size].w + "em";
    button.style.height = this.$._tile_em[size].h + "em";
    button.style.boxSizing = "border-box";
    group_tiles_div.appendChild(button);
    this.$._buttons.set(params.id, button);

    // Tile content div
    const content_div = document.createElement("div");
    content_div.classList.add(this.$._class_names.tileContent);
    content_div.style.width = "100%";
    content_div.style.height = "100%";
    content_div.style.boxSizing = "border-box";
    button.appendChild(content_div);

    // Contribute to overall state
    this.$._state.tiles.set(params.id, {
      size,
      x: params.x ?? 0,
      y: params.y ?? 0,
      group,
    });

    // Contribute to layout
    const layout_group = this.$._layout.groups.find(g => g.id == group)!;
    const x_var = new kiwi.Variable();
    const y_var = new kiwi.Variable();
    const layout_tile = new LayoutTile(
      layout_group, // LayoutGroup
      params.id, // tile ID
      button,
      x_var,
      y_var,
      getWidth(size), // width
      getHeight(size) // height
    );
    layout_group.tiles.push(layout_tile);
    layout_group.solver.addEditVariable(x_var, kiwi.Strength.weak);
    layout_group.solver.addEditVariable(y_var, kiwi.Strength.weak);
    layout_group.solver.suggestValue(x_var, params.x ?? 0);
    layout_group.solver.suggestValue(y_var, params.y ?? 0);
    layout_group.refreshNonOverlappingConstraints();

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
  }

  // Removes a tile.
  public remove(id: string) {
    fixme();
  }
}