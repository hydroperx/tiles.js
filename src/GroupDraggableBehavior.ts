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
  private _ghostGroup: null | string = null;

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
    const div = group.div!;
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
    const div = group.div!;
    // Move group visually
    div.style.zIndex = "999999999";

    // Find closest group to swap with
    let closestIdx = -1;
    let minDist = Infinity;
    const rect = div.getBoundingClientRect();
    for (let i = 0; i < this.$._layout.groups.length; i++) {
      if (this.$._layout.groups[i].id === id) continue;
      const otherDiv = this.$._layout.groups[i].div;
      if (!otherDiv) continue;
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
    // Always show ghost group if dragged group is not at intended index
    if (closestIdx !== -1) {
      const arr = this.$._layout.groups;
      const draggedIdx = arr.findIndex(g => g.id === id);
      const closest_group = arr[closestIdx];
      // Intended ghost index based on mouse position relative to closest group center
      let newClosestIdx = arr.indexOf(closest_group);
      let insertAfter = false;
      if (closest_group.div) {
        const otherRect = closest_group.div.getBoundingClientRect();
        // Detect vertical layout by class name or type
        const isVertical = this.$._dir == "vertical";
        if (isVertical) {
          // Vertical: use y
          insertAfter = (rect.top + rect.height/2) > (otherRect.top + otherRect.height/2);
        } else {
          // Horizontal: use x
          insertAfter = (rect.left + rect.width/2) > (otherRect.left + otherRect.width/2);
        }
      }
      let intendedIdx = insertAfter ? newClosestIdx + 1 : newClosestIdx;
      // Only show ghost group if dragged group is not at intended index
      if (draggedIdx === intendedIdx) {
        // Remove ghost group if present
        const ghostIdx = arr.findIndex(g => g.id === this._ghostGroup);
        if (ghostIdx !== -1) arr.splice(ghostIdx, 1);
        return;
      }
      // If ghost group is already at intended position, do nothing
      const ghostIdx = arr.findIndex(g => g.id === this._ghostGroup);
      if (ghostIdx === intendedIdx) return;
      // Remove any previous ghost group
      if (ghostIdx !== -1) arr.splice(ghostIdx, 1);
      // Create ghost group if needed
      if (!this._ghostGroup || ghostIdx === -1) {
        this._ghostGroup = "__anonymous$" + RandomUtils.hexLarge();
      }
      const layoutGhostGroup = new LayoutGroup(this.$._layout, this._ghostGroup!, null, undefined, undefined);
      arr.splice(intendedIdx, 0, layoutGhostGroup);
      // Update state of closest group
      this.$._state.groups.get(id)!.index = intendedIdx;
      this.$._state.groups.get(closest_group.id)!.index = arr.indexOf(closest_group);
      this.$._keep_groups_contiguous();
      this.$._deferred_rearrange();
      this.$._deferred_state_update_signal();
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
    const div = group.div!;
    // Remove dragging attribute
    div.setAttribute(Attributes.ATTR_DRAGGING, "false");
    // Undo drag position
    div.style.inset = "";
    // Reset transform and zIndex
    div.style.transform = "";
    div.style.zIndex = "";

    // Enable pointer events back
    this.$._container.style.pointerEvents = "";
    div.style.pointerEvents = "";
    (div.getElementsByClassName(this.$._class_names.groupTiles)[0] as HTMLElement)
      .style.pointerEvents = "";
    
    // Take place of ghost group.
    if (this._ghostGroup) {
      const arr = this.$._layout.groups;
      const ghostGroupIndex = arr.findIndex(group => group.id == this._ghostGroup!);
      if (ghostGroupIndex !== -1) {
        // Remove ghost group and insert dragged group at its place
        arr.splice(ghostGroupIndex, 1);
        const draggedIdx = arr.findIndex(g => g.id === id);
        const [draggedGroup] = arr.splice(draggedIdx, 1);
        arr.splice(ghostGroupIndex, 0, draggedGroup);
        this.$._state.groups.get(id)!.index = ghostGroupIndex;
        this.$._keep_groups_contiguous();
        this.$._deferred_state_update_signal();
      }
      this._ghostGroup = null;
    }

    // Rearrange
    this.$._deferred_rearrange();

    // Trigger Tiles#groupdragend event
    this.$.dispatchEvent(new CustomEvent("groupdragend", {
      detail: { group: div },
    }));
  }
}