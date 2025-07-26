// third-party imports
import assert from "assert";
import { TypedEventTarget } from "@hydroperx/event";
import Draggable from "@hydroperx/draggable";

// local imports
import { EMObserver } from "./utils/EMObserver";
import {
  TileSizeMap,
  getWidth,
  getHeight,
  TileSize,
} from "./enum/TileSize";
import { State } from "./State";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";
import { HorizontalLayout } from "./HorizontalLayout";
import { VerticalLayout } from "./VerticalLayout";
import { GroupFactory } from "./GroupFactory";
import { TileFactory } from "./TileFactory";
import * as Attributes from "./Attributes";

/**
 * Tiles layout.
 */
export class Tiles extends (EventTarget as TypedEventTarget<TilesEventMap>) {
  /**
   * Attribute name used for identifying a tile's ID.
   */
  public static readonly ATTR_ID = Attributes.ATTR_ID;
  /**
   * Attribute name used for indicating a tile's size.
   */
  public static readonly ATTR_SIZE = Attributes.ATTR_SIZE;
  /**
   * Attribute name used for indicating that a tile is actively in drag.
   */
  public static readonly ATTR_DRAGGING = Attributes.ATTR_DRAGGING;
  /**
   * Attribute name used for indicating that a tile is checked.
   */
  public static readonly ATTR_CHECKED = Attributes.ATTR_CHECKED;

  /** @hidden */
  public _state: State;

  /** @hidden */
  public _container: HTMLElement;
  /** @hidden */
  public _dir: "horizontal" | "vertical";
  /** @hidden */
  public _class_names: {
    group: string,
    groupLabel: string,
    groupLabelText: string,
    groupTiles: string,
    tile: string,
    tileContent: string,
  };
  /** @hidden */
  public _small_size: number;
  /** @hidden */
  public _tile_gap: number;
  /** @hidden */
  public _group_gap: number;

  /** @hidden */
  public _group_width: number;
  /** @hidden */
  public _inline_groups: number;
  /** @hidden */
  public _height: number;
  /** @hidden */
  public _label_height: number;

  /** @hidden */
  public _rearrange_timeout: number = -1;
  /** @hidden */
  public _state_update_timeout: number = -1;

  /** @hidden */
  public _drag_enabled: boolean;
  /** @hidden */
  public _selection_enabled: boolean;

  /** @hidden */
  public _em_observer: EMObserver;
  /** @hidden */
  public _em: number = 16;

  /** @hidden */
  public _layout: Layout;
  /** @hidden */
  public _buttons: Map<string, HTMLButtonElement> = new Map();
  /** @hidden */
  public _group_draggables: Map<HTMLDivElement, Draggable> = new Map();
  /** @hidden */
  public _tile_draggables: Map<HTMLButtonElement, Draggable> = new Map();
  /** @hidden */
  public _tile_drag_end_handlers: WeakMap<HTMLButtonElement, (element: Element, x: number, y: number, event: Event) => void> = new WeakMap();

  /** @hidden */
  public _resize_observer: ResizeObserver | null = null;

  /** @hidden */
  public _tile_removal_work: undefined | ((button: HTMLButtonElement) => Promise<void>);
  /** @hidden */
  public _group_removal_work: undefined | ((div: HTMLDivElement) => Promise<void>);

  /**
   * Tile sizes in the cascading `em` unit.
   * @hidden
   */
  public _tile_em: TileSizeMap = {
    small: { w: 0, h: 0 },
    medium: { w: 0, h: 0 },
    wide: { w: 0, h: 0 },
    large: { w: 0, h: 0 },
  };

  constructor(params: {
    /**
     * Container.
     */
    element: Element;
    /**
     * The direction of the tile container.
     */
    direction: "horizontal" | "vertical";
    /**
     * Customisable class names.
     */
    classNames: {
      /**
       * Class name used for identifying groups.
       */
      group: string;
      /**
       * Class name used for identifying group labels.
       */
      groupLabel: string;
      /**
       * Class name used for identifying group label texts.
       */
      groupLabelText: string;
      /**
       * Class name used for identifying the group tiles container.
       */
      groupTiles: string;
      /**
       * Class name used for identifying tiles.
       */
      tile: string;
      /**
       * Class name used for identifying tile contents.
       */
      tileContent: string;
    };
    /**
     * Whether drag-n-drop is enabled.
     * @default true
     */
    dragEnabled?: boolean;
    /**
     * Whether tile selection is enabled.
     * @default true
     */
    selectionEnabled?: boolean;
    /**
     * The size of small tiles, in cascading `em` units.
     */
    smallSize: number;
    /**
     * Gap between tiles, in cascading `em` units.
     */
    tileGap: number;
    /**
     * Gap between groups, in cascading `em` units.
     */
    groupGap: number;
    /**
     * Group width in small tiles, effective only
     * in vertical containers (must be >= 4).
     * @default 6
     */
    groupWidth?: number;
    /**
     * Number of inline groups, effective only
     * in vertical containers (must be >= 1).
     * @default 1
     */
    inlineGroups?: number;
    /**
     * Height in small tiles, effective only
     * in horizontal containers (must be >= 4).
     * @default 6
     */
    height?: number;
    /**
     * Group label height in the cascading `em` unit.
     */
    labelHeight: number,
    /**
     * Work to do before removing a group from the DOM.
     * This is typically used for tweening the group view.
     */
    groupRemovalWork?: (div: HTMLDivElement) => Promise<void>;
    /**
     * Work to do before removing a tile from the DOM.
     * This is typically used for tweening the tile view.
     */
    tileRemovalWork?: (button: HTMLButtonElement) => Promise<void>;
  }) {
    super();

    this._container = params.element as HTMLElement;
    this._dir = params.direction;
    this._class_names = {
      group: params.classNames.group,
      groupLabel: params.classNames.groupLabel,
      groupLabelText: params.classNames.groupLabelText,
      groupTiles: params.classNames.groupTiles,
      tile: params.classNames.tile,
      tileContent: params.classNames.tileContent,
    };
    this._small_size = params.smallSize;
    this._tile_gap = params.tileGap;
    this._group_gap = params.groupGap;

    this._container.style.position = "relative";

    this._tile_em.small.w = this._small_size;
    this._tile_em.small.h = this._small_size;
    this._tile_em.medium.w = this._small_size * 2 + this._tile_gap;
    this._tile_em.medium.h = this._tile_em.medium.w;
    this._tile_em.wide.w = this._tile_em.medium.w * 2 + this._tile_gap;
    this._tile_em.wide.h = this._tile_em.medium.w;
    this._tile_em.large.w = this._tile_em.wide.w;
    this._tile_em.large.h = this._tile_em.wide.w;

    // Removal works
    this._tile_removal_work = params.tileRemovalWork;
    this._group_removal_work = params.groupRemovalWork;

    // dragEnabled
    this._drag_enabled = params.dragEnabled ?? true;

    // selectionEnabled
    this._selection_enabled = params.selectionEnabled ?? true;

    this._group_width = params.groupWidth ?? 6;
    this._inline_groups = params.inlineGroups ?? 1;
    this._height = params.height ?? 6;
    this._label_height = params.labelHeight;

    // Height >= 4 assertion
    assert(this._dir == "horizontal" ? this._height >= 4 : true, "Tiles.height must be >= 4.");

    // Group width >= 4 assertion
    assert(this._dir == "vertical" ? this._group_width >= 4 : true, "Tiles.groupWidth must be >= 4.");

    // Inline groups assertion
    assert(this._dir == "vertical" ? this._inline_groups >= 1 : true, "Tiles.inlineGroups must be >= 1.");

    // Observe the `em` unit size
    this._em_observer = new EMObserver(this._container, (val) => {
      this._em = val;
    });

    // Set state
    this._state = new State();

    // Initial layout
    this._layout =
      this._dir == "horizontal"
        ? new HorizontalLayout(this)
        : new VerticalLayout(this);

    // Rearrange
    this._layout.rearrange();
  }

  /**
   * The overall tiles state.
   */
  get state(): State {
    return this._state;
  }

  /**
   * Clears everything.
   */
  clear() {
    // Clear state
    this.state.clear();

    // Clear layout measurements
    this._layout.groups.length = 0;

    // Discard draggables
    for (const [, draggable] of this._group_draggables) {
      draggable.destroy();
    }
    for (const [, draggable] of this._tile_draggables) {
      draggable.destroy();
    }
    this._group_draggables.clear();
    this._tile_draggables.clear();

    // Clear button mappings
    this._buttons.clear();

    // Remove children
    for (const child of Array.from(this._container.children)) {
      if (child.classList.contains(EMObserver.CLASS)) {
        continue;
      }
      child.remove();
    }

    // Rearrange layout
    this._deferred_rearrange();
  }

  /**
   * Destroys the `Tiles` instance, disposing
   * of any observers and removing the container from the DOM.
   */
  destroy() {
    this._em_observer.cleanup();
    this._resize_observer?.disconnect();
    this._container.remove();

    // Discard draggables
    for (const [, draggable] of this._group_draggables) {
      draggable.destroy();
    }
    for (const [, draggable] of this._tile_draggables) {
      draggable.destroy();
    }
    this._group_draggables.clear();
    this._tile_draggables.clear();

    // Discard deferred rearrange
    if (this._rearrange_timeout != -1) {
      window.clearTimeout(this._rearrange_timeout);
    }
  }

  /**
   * Adds a group to the end and returns its `div` element.
   * @throws If group ID is duplicate.
   */
  addGroup(params: AddGroupParams) {
    new GroupFactory(this).add(params);
  }

  /**
   * Removes a group.
   * @throws If the group does not exist.
   */
  removeGroup(id: string) {
    new GroupFactory(this).remove(id);
  }

  /**
   * Attempts to add a tile.
   *
   * If both `x` and `y` are null, this method always succeeds,
   * adding the tile to the best position available.
   *
   * @throws If tile ID is duplicate.
   * @throws If group is specified and does not exist.
   * @throws If either of `x` and `y` are `null`, but not both.
   * @returns `true` if successfully added tile; `false` otherwise.
   * It can fail depending on the `x` and `y` parameters.
   */
  addTile(params: AddTileParams): boolean {
    return new TileFactory(this).add(params);
  }

  /**
   * Removes a tile.
   * @throws If the tile does not exist.
   */
  removeTile(id: string) {
    new TileFactory(this).remove(id);
  }

  /**
   * Renames a group.
   */
  renameGroup(id: string, label: string): void {
    // Affect state
    const group_state = this._state.groups.get(id);
    assert(!!group_state, "Group '"+id+"' not found.");
    group_state!.label = label;

    // Affect the DOM
    const layout_group = this._layout.groups.find(group => group.id == id);
    assert(!!layout_group, "Group '"+id+"' not found.");
    const textElement = layout_group.div
      .getElementsByClassName(this._class_names.groupLabelText)[0] as HTMLElement;
    textElement.innerText = label;

    // State update signal
    this._deferred_state_update_signal();
  }

  /**
   * Attempts to resize a tile.
   */
  resizeTile(id: string, size: TileSize): boolean {
    // Fail if currently dragging a tile.
    const tiles_dragging = Array.from(this._container.getElementsByClassName(this._class_names.tile))
      .some(button => button.getAttribute(Attributes.ATTR_DRAGGING) == "true");
    if (tiles_dragging) {
      return false;
    }

    // Layout tile
    const layout_group = this._layout.groups.find(group => group.hasTile(id));
    assert(!!layout_group, "Tile '"+id+"' not found.");
    const layout_tile = layout_group!.getTile(id)!;

    // Attempt resize
    if (!layout_tile.resize(getWidth(size), getHeight(size))) {
      return false;
    }

    // Update state
    const tile_state = this._state.tiles.get(id);
    assert(!!tile_state, "Tile '"+id+"' not found.");
    tile_state.size = size;

    // Update size attribute
    layout_tile.button?.setAttribute(Attributes.ATTR_SIZE, size);

    // Rearrange
    this._deferred_rearrange();

    // State update signal
    this._deferred_state_update_signal();

    return true;
  }

  /**
   * Attempts to move a tile.
   * @param x X coordinate in small tiles unit (1x1).
   * @param y Y coordinate in small tiles unit (1x1).
   */
  moveTile(id: string, x: number, y: number): boolean {
    // Fail if currently dragging a tile.
    const tiles_dragging = Array.from(this._container.getElementsByClassName(this._class_names.tile))
      .some(button => button.getAttribute(Attributes.ATTR_DRAGGING) == "true");
    if (tiles_dragging) {
      return false;
    }

    // Layout tile
    const layout_group = this._layout.groups.find(group => group.hasTile(id));
    assert(!!layout_group, "Tile '"+id+"' not found.");
    const layout_tile = layout_group!.getTile(id)!;

    // Attempt resize
    if (!layout_tile.move(x, y)) {
      return false;
    }

    // Update state
    const tile_state = this._state.tiles.get(id);
    assert(!!tile_state, "Tile '"+id+"' not found.");

    // Rearrange
    this._deferred_rearrange();

    return true;
  }

  /**
   * Shorthand to `addEventListener()`.
   */
  on<K extends keyof TilesEventMap>(type: K, listenerFn: (event: TilesEventMap[K]) => void, options?: AddEventListenerOptions): void;
  on(type: string, listenerFn: (event: Event) => void, options?: AddEventListenerOptions): void;
  on(type: any, listenerFn: any, options?: AddEventListenerOptions): void {
    this.addEventListener(type, listenerFn, options);
  }

  /**
   * Shorthand to `removeEventListener()`.
   */
  off<K extends keyof TilesEventMap>(type: K, listenerFn: (event: TilesEventMap[K]) => void, options?: EventListenerOptions): void;
  off(type: string, listenerFn: (event: Event) => void, options?: EventListenerOptions): void;
  off(type: any, listenerFn: any, options?: EventListenerOptions): void {
    this.removeEventListener(type, listenerFn, options);
  }

  /**
   * Returns the number of inline groups available for
   * the given width (either in `px` or `em`).
   * *Applies to vertical layouts only.*
   * 
   * @throws If not in a vertical layout.
   */
  inlineGroupsAvailable(width: string): number {
    assert(this._dir == "vertical", "Tiles.inlineGroupsAvailable() can only be called on vertical layouts.");
    const unitMatch = width.match(/(px|em)$/i);
    assert(!!unitMatch, "Tiles.inlineGroupsAvailable() takes a width with a 'px' or 'em' unit.");
    const unit = unitMatch[1].toLowerCase();
    let w = parseFloat(width);
    // convert px to em
    if (unit == "px") {
      w /= this._em;
    }
    let r: number = 0;
    for (let acc: number = 0; acc < w; r++) {
      if (acc != 0) {
        acc += this._group_gap;
      }
      acc += this._group_width*this._small_size + (this._group_width-1)*this._group_gap;
    }
    return r;
  }

  /**
   * Indicates the number of inline groups in a vertical layout.
   *
   * @throws If not in a vertical layout.
   */
  get inlineGroups(): number {
    return this._inline_groups;
  }
  set inlineGroups(val) {
    assert(this._dir == "vertical", "Tiles.inlineGroups can only be changed on vertical layouts.");
    this._inline_groups = val;
    this._deferred_rearrange();
  }

  /** @hidden */
  _keep_groups_contiguous(): void {
    const sorted_groups = Array.from(this._state.groups.entries()).sort(
      (a, b) => a[1].index - b[1].index,
    );
    let changed = false;
    for (let i = 0; i < sorted_groups.length; i++) {
      const group = sorted_groups[i][1];
      if (group.index != i) changed = true;
      group.index = i;
    }
    if (changed) this._deferred_state_update_signal();
  }

  /** @hidden */
  _deferred_rearrange() {
    if (this._rearrange_timeout != -1) {
      window.clearTimeout(this._rearrange_timeout);
    }
    this._rearrange_timeout = window.setTimeout(() => {
      this._layout.rearrange();
    }, 0);
  }

  /** @hidden */
  _deferred_state_update_signal() {
    if (this._state_update_timeout != -1) {
      window.clearTimeout(this._state_update_timeout);
    }
    this._state_update_timeout = window.setTimeout(() => {
      this._state_update_signal();
    }, 0);
  }

  /** @hidden */
  _state_update_signal() {
    this.dispatchEvent(
      new CustomEvent("stateupdate", { detail: this._state }),
    );
  }
}

/**
 * Tiles event map.
 */
export type TilesEventMap = {
  addedgroup: CustomEvent<{
    group: LayoutGroup;
    div: HTMLDivElement;
    labelDiv: HTMLDivElement;
    tilesDiv: HTMLDivElement;
  }>;
  addedtile: CustomEvent<{
    tile: LayoutTile;
    button: HTMLButtonElement;
    contentDiv: HTMLDivElement;
  }>;
  stateupdate: CustomEvent<State>;
  dragstart: CustomEvent<{ tile: HTMLButtonElement }>;
  drag: CustomEvent<{ tile: HTMLButtonElement }>;
  dragend: CustomEvent<{ tile: HTMLButtonElement }>;
  groupdragstart: CustomEvent<{ group: HTMLDivElement }>;
  groupdrag: CustomEvent<{ group: HTMLDivElement }>;
  groupdragend: CustomEvent<{ group: HTMLDivElement }>;
  selectionchange: CustomEvent<{ tiles: string[] }>;
  click: CustomEvent<{ tile: string }>;
};

/**
 * Parameters for adding a group.
 */
export type AddGroupParams = {
  /**
   * Unique group ID.
   */
  id: string,

  /**
   * Initial label to display for the group.
   * @default ""
   */
  label?: string,
};

/**
 * Parameters for adding a tile.
 */
export type AddTileParams = {
  /**
   * Tile ID.
   */
  id: string;
  /**
   * Group to attach tile to. If unspecified,
   * tile is attached to either the last group (if unlabeled)
   * or a new last anonymous group.
   */
  group?: string;
  /**
   * Horizontal position in small tiles.
   */
  x?: number;
  /**
   * Vertical position in small tiles.
   */
  y?: number;

  /**
   * Tile size.
   * @default medium
   */
  size?: TileSize;
};