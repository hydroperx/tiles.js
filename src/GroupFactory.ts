// third-party imports
import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";

// local imports
import {
  TileSizeMap,
  getWidth,
  getHeight,
  TileSize,
} from "./enum/TileSize";
import * as RectangleUtils from "./utils/RectangleUtils";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";
import type { Tiles, AddGroupParams } from "./Tiles";
import * as Attributes from "./Attributes";

/**
 * Group factory.
 */
export class GroupFactory {
  // Constructor
  public constructor(private $: Tiles) {
    //
  }

  // Adds a group.
  public add(params: AddGroupParams) {
    let { id, label } = params;

    // Enforce non-duplicate ID
    assert(!this.$._state.groups.has(id), "Duplicate group ID: " + id);

    // Keep groups contiguous
    this.$._keep_groups_contiguous();

    // Default label = empty
    label ??= "";

    // State + index
    const existing_indices = Array.from(this.$._state.groups.values()).map(g => g.index);
    const index = existing_indices.length == 0 ?
      0 : Math.max.apply(null, existing_indices) + 1;
    this.$._state.groups.set(id, { index, label });

    // Group div
    const div = document.createElement("div");
    div.setAttribute(Attributes.ATTR_ID, id);
    div.setAttribute(Attributes.ATTR_DRAGGING, id);
    div.classList.add(this.$._class_names.group);
    div.style.position = "absolute";
    this.$._container.appendChild(div);

    // Group's label div
    const labelDiv = document.createElement("div");
    labelDiv.classList.add(this.$._class_names.groupLabel);
    labelDiv.innerText = label;
    div.appendChild(labelDiv);

    // Group's tiles div
    const tilesDiv = document.createElement("div");
    tilesDiv.classList.add(this.$._class_names.groupTiles);
    tilesDiv.style.position = "relative";
    tilesDiv.style.overflow = "hidden";
    div.appendChild(tilesDiv);

    // Layout group
    const layout_group = new LayoutGroup(this.$._layout, id, div);
    this.$._layout.groups.push(layout_group);
    this.$._deferred_rearrange();

    // addedgroup signal
    this.$.dispatchEvent(
      new CustomEvent("addedgroup", {
        detail: { group: layout_group, div, labelDiv, tilesDiv },
      }),
    );

    // State update signal
    this.$._state_update_signal();
  }

  // Removes a group.
  public remove(id: string) {
    fixme();
  }
}