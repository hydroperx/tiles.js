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

    fixme();

    // Trigger Tiles#groupdragstart event
    this.$.dispatchEvent(new CustomEvent("groupdragstart", {
      detail: { group: div },
    }));
  }

  // Drag
  private _drag(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;

    fixme();

    // Trigger Tiles#groupdrag event
    this.$.dispatchEvent(new CustomEvent("groupdrag", {
      detail: { group: div },
    }));
  }

  // Drag end
  private _dragEnd(element: Element, x: number, y: number, event: Event): void {
    // Basics
    const { id } = this;

    fixme();

    // Trigger Tiles#groupdragend event
    this.$.dispatchEvent(new CustomEvent("groupdragend", {
      detail: { group: div },
    }));
  }
}