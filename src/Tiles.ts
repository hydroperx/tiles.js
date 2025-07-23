import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";
import { TypedEventTarget } from "@hydroperx/event";

// local imports
import { EMObserver } from "./utils/EMObserver";
import {
  TileSizeMap,
  getWidth,
  getHeight,
  TileSize,
} from "./enum/TileSize";
import { State } from "./State";
import * as RectangleUtils from "./utils/RectangleUtils";
import { Layout, LayoutGroup, LayoutTile } from "./Layout";
import { HorizontalLayout } from "./HorizontalLayout";
import { VerticalLayout } from "./VerticalLayout";

/**
 * Tiles layout.
 */
export class Tiles extends (EventTarget as TypedEventTarget<TilesEventMap>) {
  /**
   * Attribute name used for identifying a tile's ID.
   */
  static readonly ATTR_ID = "data-id";
  /**
   * Attribute name used for indicating a tile's size.
   */
  static readonly ATTR_SIZE = "data-size";
  /**
   * Attribute name used for indicating that a tile is actively in drag.
   */
  static readonly ATTR_DRAGGING = "data-dragging";

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
  public _resize_observer: ResizeObserver | null = null;

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
z     * in horizontal containers (must be >= 4).
     * @default 6
     */
    height?: number;
    /**
     * Transition function(s) to contribute to tiles.
     */
    tileTransition?: string;
  }) {
    super();

    this._container = params.element as HTMLElement;
    this._dir = params.direction;
    this._class_names = {
      group: params.classNames.group,
      groupLabel: params.classNames.groupLabel,
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

    // dragEnabled
    this._drag_enabled = params.dragEnabled ?? true;

    // selectionEnabled
    this._selection_enabled = params.selectionEnabled ?? true;

    this._group_width = params.groupWidth ?? 6;
    this._inline_groups = params.inlineGroups ?? 1;
    this._height = params.height ?? 6;

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
  }

  /**
   * Destroys the `Tiles` instance, disposing
   * of any observers and removing the container from the DOM.
   */
  destroy() {
    this._em_observer.cleanup();
    this._resize_observer?.disconnect();
    this._container.remove();
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

  /** @hidden */
  _state_update_signal() {
    this.dispatchEvent(
      new CustomEvent("stateupdate", { detail: this._state }),
    );
  }
}

export type TilesEventMap = {
  addedgroup: CustomEvent<{ group: LayoutGroup; label: HTMLDivElement }>;
  addedtile: CustomEvent<{ tile: LayoutTile; button: HTMLButtonElement }>;
  stateupdate: CustomEvent<State>;
  dragstart: CustomEvent<{ tile: HTMLButtonElement }>;
  drag: CustomEvent<{ tile: HTMLButtonElement }>;
  dragend: CustomEvent<{ tile: HTMLButtonElement }>;
};