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
 * Drag-n-drop behavior for groups.
 */
export class GroupDraggableBehavior {
  private _startIndices: null | { group: string, index: number }[] = null;

  // Constructor
  public constructor(private $: Tiles, private id: string) {
    //
  }

  // Installs drag-n-drop behavior.
  public install() {
    // Basics
    const { id } = this;
    const div = this.$._layout.groups.find(group => group.id == id)?.div ?? null;
    if (!div) return;
    const label = div.getElementsByClassName(this.$._class_names.groupLabel)[0];

    // Drag end handler
    const drag_end = this._dragEnd.bind(this);

    // Setup Draggable
    this.$._group_draggables.set(div!, new Draggable(div!, {
      filterTarget: () => label.matches(":hover"),
      setPosition: false,
      threshold: "0.5em",
      onDragStart: this._dragStart.bind(this),
      onDrag: this._drag.bind(this),
      onDragEnd: drag_end,
    }));
  }

  // Uninstalls drag-n-drop behavior.
  public uninstall() {
    const { id } = this;
    const div = this.$._layout.groups.find(group => group.id == id)?.div ?? null;
    if (div) {
      this.$._group_draggables.get(div)?.destroy();
      this.$._group_draggables.delete(div);
    }
  }

  // Drag start
  private _dragStart(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const group = this.$._layout.groups.find(g => g.id === id);
    if (!group) return;
    const div = group.div;
    // Set dragging attribute
    div.setAttribute(Attributes.ATTR_DRAGGING, "true");
    // Store start indices
    this._startIndices = this.$._layout.groups.map((g, idx) => ({ group: g.id, index: idx }));
    // Trigger Tiles#groupdragstart event
    this.$.dispatchEvent(new CustomEvent("groupdragstart", {
      detail: { group: div },
    }));
    // Disable pointer events
    this.$._container.style.pointerEvents = "none";
    // ... except for the group
    div.style.pointerEvents = "auto";
    // ... but not within tiles
    (div.getElementsByClassName(this.$._class_names.groupTiles)[0] as HTMLElement)
      .style.pointerEvents = "none";
  }

  // Drag
  private _drag(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const group = this.$._layout.groups.find(g => g.id === id);
    if (!group) return;
    const div = group.div;
    // Move group visually
    div.style.zIndex = "999999999";

    // Find closest group to swap with
    let closestIdx = -1;
    let minDist = Infinity;
    const rect = div.getBoundingClientRect();
    for (let i = 0; i < this.$._layout.groups.length; i++) {
      if (this.$._layout.groups[i].id === id) continue;
      const otherDiv = this.$._layout.groups[i].div;
      const otherRect = otherDiv.getBoundingClientRect();
      // Use center distance
      const dx = (rect.left + rect.width/2) - (otherRect.left + otherRect.width/2);
      const dy = (rect.top + rect.height/2) - (otherRect.top + otherRect.height/2);
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }
    // If within threshold, swap indices (only once per drag event)
    if (closestIdx !== -1 && minDist < 2 * this.$._em) {
      const draggedIdx = this.$._layout.groups.findIndex(g => g.id === id);
      if (draggedIdx !== closestIdx) {
        // Closest group
        const closest_group = this.$._layout.groups[closestIdx];

        // Remove dragged group from array
        const arr = this.$._layout.groups;
        const [draggedGroup] = arr.splice(draggedIdx, 1);
        // Insert at new position
        closestIdx = this.$._layout.groups.indexOf(closest_group);
        arr.splice(closestIdx, 0, draggedGroup);
        this.$._keep_groups_contiguous();

        // Update state
        const dragged_group_state = this.$._state.groups.get(id)!;
        dragged_group_state.index = closestIdx;
        const closest_group_state = this.$._state.groups.get(closest_group.id)!;
        closest_group_state.index = closestIdx + 1;

        // Rearrange
        this.$._deferred_rearrange();
        // State update signal
        this.$._deferred_state_update_signal();
      }
    }
    // Trigger Tiles#groupdrag event
    this.$.dispatchEvent(new CustomEvent("groupdrag", {
      detail: { group: div },
    }));
  }

  // Drag end
  private _dragEnd(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;
    const group = this.$._layout.groups.find(g => g.id === id);
    if (!group) return;
    const div = group.div;
    // Remove dragging attribute
    div.setAttribute(Attributes.ATTR_DRAGGING, "false");
    // Undo drag position
    div.style.inset = "";
    // Reset transform and zIndex
    div.style.transform = "";
    div.style.zIndex = "";
    // Update state
    this.$._deferred_state_update_signal();
    this.$._deferred_rearrange();

    // Enable pointer events back
    this.$._container.style.pointerEvents = "";
    div.style.pointerEvents = "";
    (div.getElementsByClassName(this.$._class_names.groupTiles)[0] as HTMLElement)
      .style.pointerEvents = "";

      // Trigger Tiles#groupdragend event
    this.$.dispatchEvent(new CustomEvent("groupdragend", {
      detail: { group: div },
    }));
  }
}