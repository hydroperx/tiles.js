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
  // Debounce timer for rearrange/state update
  private _debounceTimer: any = null;
  private _DEBOUNCE_MS = 24; // ~1.5 frames at 60Hz
  private _MIN_OVERLAP_AREA = 32; // px^2, tweak as needed
  private _startIndices: null | { group: string, index: number }[] = null;
  private _lastBestGroup: string = "";
  private _ghostGroup: null | string = null;
  private _lastIntendedIdx: number = -1;

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
    const arr = this.$._layout.groups;
    const group = arr.find(g => g.id === id);
    if (!group) return;
    const div = group.div!;
    // Move group visually
    if (div.style.zIndex !== "999999999") div.style.zIndex = "999999999";

    // Find best candidate group to swap with using rectangle overlap.
    let bestIdx = -1;
    let bestArea = 0;
    const rect = div.getBoundingClientRect();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id || arr[i].id === this._ghostGroup) continue;
      const otherDiv = arr[i].div;
      if (!otherDiv) continue;
      const otherRect = otherDiv.getBoundingClientRect();
      const overlap = getRectangleOverlap(rect, otherRect);
      if (overlap && overlap.area > bestArea) {
        bestArea = overlap.area;
        bestIdx = i;
      }
    }

    let shouldUpdate = false;
    let intendedIdx = -1;
    let best_group = null;
    if (bestIdx !== -1 && bestArea >= this._MIN_OVERLAP_AREA) {
      const draggedIdx = arr.findIndex(g => g.id === id);
      best_group = arr[bestIdx];
      // Intended ghost index based on mouse position relative to best group center
      let newBestIdx = arr.indexOf(best_group);
      intendedIdx = newBestIdx + (draggedIdx > newBestIdx ? 0 : 1);

      // Only update if intendedIdx or best_group changes
      if (draggedIdx !== intendedIdx && (this._lastIntendedIdx !== intendedIdx || this._lastBestGroup !== best_group.id)) {
        shouldUpdate = true;
      }
      this._lastIntendedIdx = intendedIdx;
      this._lastBestGroup = best_group.id;
    } else {
      this._lastIntendedIdx = -1;
      this._lastBestGroup = "";
    }

    if (shouldUpdate && best_group) {
      // Remove previous ghost group if needed
      let ghostIdx = this._ghostGroup ? arr.findIndex(g => g.id === this._ghostGroup) : -1;
      if (this._ghostGroup && ghostIdx !== -1) {
        arr.splice(ghostIdx, 1);
      }
      // Create ghost group id if needed
      if (!this._ghostGroup) {
        this._ghostGroup = "__anonymous$" + RandomUtils.hexLarge();
      }
      // Insert ghost group at intended index
      const layoutGhostGroup = new LayoutGroup(this.$._layout, this._ghostGroup!, null, undefined, undefined);
      arr.splice(intendedIdx, 0, layoutGhostGroup);
      // Update state of best group
      this.$._state.groups.get(id)!.index = intendedIdx;
      this.$._state.groups.get(best_group.id)!.index = arr.indexOf(best_group);
      this.$._keep_groups_contiguous();
      // Debounce rearrange/state update
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this.$._deferred_rearrange();
        this.$._deferred_state_update_signal();
      }, this._DEBOUNCE_MS);
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

    // Forget last best group and intended index
    this._lastBestGroup = "";
    this._lastIntendedIdx = -1;

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