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
import { TileDraggableBehavior } from "./TileDraggableBehavior";
import { GroupDraggableBehavior } from "./GroupDraggableBehavior";

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
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.position = "absolute";
    div.style.transition = "transform 0.2s ease";
    this.$._container.appendChild(div);

    // Group's label div
    const labelDiv = document.createElement("div");
    labelDiv.classList.add(this.$._class_names.groupLabel);
    labelDiv.style.height = this.$._label_height + "em";
    div.appendChild(labelDiv);

    // Group label's text div
    const labelTextDiv = document.createElement("div");
    labelTextDiv.classList.add(this.$._class_names.groupLabelText);
    labelTextDiv.style.wordBreak = "keep-all";
    labelTextDiv.innerText = label;
    labelDiv.appendChild(labelTextDiv);

    // Group's tiles div
    const tilesDiv = document.createElement("div");
    tilesDiv.classList.add(this.$._class_names.groupTiles);
    tilesDiv.style.overflow = "hidden";
    tilesDiv.style.padding = this.$._tile_gap*2 + "em";
    div.appendChild(tilesDiv);

    // Layout group
    const layout_group = new LayoutGroup(
      this.$._layout, id, div,
      this.$._dir == "vertical" ? this.$._group_width : undefined,
      this.$._dir == "horizontal" ? this.$._height : undefined
    );
    this.$._layout.groups.push(layout_group);
    this.$._deferred_rearrange();

    // Install draggable behavior
    if (this.$._drag_enabled) {
      new GroupDraggableBehavior(this.$, id).install();
    }

    // addedgroup signal
    this.$.dispatchEvent(
      new CustomEvent("addedgroup", {
        detail: { group: layout_group, div, labelDiv, labelTextDiv, tilesDiv },
      }),
    );

    // State update signal
    this.$._state_update_signal();
  }

  // Removes a group.
  public remove(id: string) {
    // Do nothing if dragging a tile.
    const tiles_dragging = Array.from(this.$._container.getElementsByClassName(this.$._class_names.tile))
      .some(button => button.getAttribute(Attributes.ATTR_DRAGGING) == "true");
    if (tiles_dragging) {
      return;
    }

    // Do nothing if dragging a group.
    const groups_dragging = Array.from(this.$._container.getElementsByClassName(this.$._class_names.group))
      .some(div => div.getAttribute(Attributes.ATTR_DRAGGING) == "true");
    if (groups_dragging) {
      return;
    }

    // Delete from state
    this.$._state.groups.delete(id);

    // Delete from layout
    const layout_group = this.$._layout.groups.find(group => group.id == id);
    assert(!!layout_group, "Group '"+id+"' not found.");
    this.$._layout.groups.splice(this.$._layout.groups.indexOf(layout_group!), 1);

    // Discard draggable
    new GroupDraggableBehavior(this.$, id).uninstall();

    // Remove from DOM
    if (layout_group!.div) {
      if (this.$._group_removal_work) {
        this.$._group_removal_work(layout_group!.div).then(() => {
          layout_group!.div!.remove();
        });
      } else {
        layout_group!.div.remove();
      }
    }

    // If any tile is checked, trigger selection change event.
    if (layout_group.div) {
      const any_checked = [...layout_group.div.getElementsByClassName(this.$._class_names.tile)]
        .some(button => button.getAttribute(Attributes.ATTR_CHECKED) == "true");
      if (any_checked) {
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
    }

    // Remove tiles efficiently
    const tiles_to_remove: string[] = [];
    for (const [tile, tile_state] of this.$._state.tiles) {
      if (tile_state.group == id) {
        tiles_to_remove.push(tile);
      }
    }
    for (const tile of tiles_to_remove) {
      this.$._state.tiles.delete(tile);
      if (this.$._drag_enabled) {
        new TileDraggableBehavior(this.$, tile).uninstall();
      }
      this.$._buttons.get(tile)?.remove();
      this.$._buttons.delete(tile);
    }

    // Keep groups contiguous
    this.$._keep_groups_contiguous();
    // Rearrange
    this.$._deferred_rearrange();
    // State update signal
    this.$._deferred_state_update_signal();
  }
}