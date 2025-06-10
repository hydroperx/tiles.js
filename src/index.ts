import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";
import { TypedEventTarget } from "@hydroperx/event";

// local imports
import { RootFontObserver } from "./utils/RootFontObserver";
import {
  TileResolution,
  get_size_width_small,
  get_size_height_small,
  TileSize,
} from "./enum/TileSize";
import { State } from "./State";
import * as RectangleUtils from "./utils/RectangleUtils";
import { Group, Layout, Tile } from "./Layout";
import { HorizontalLayout } from "./HorizontalLayout";
import { VerticalLayout } from "./VerticalLayout";

export { type TileSize } from "./enum/TileSize";
export * from "./State";

export class Tiles extends (EventTarget as TypedEventTarget<TilesEventMap>) {
  static readonly ATTR_ID = "data-id";
  static readonly ATTR_SIZE = "data-size";
  static readonly ATTR_DRAGGING = "data-dragging";

  /** @hidden */ _state: State;
  /** @hidden */ _draggables: WeakMap<HTMLButtonElement, Draggable> = new WeakMap();

  /** @hidden */ public _container: HTMLElement;
  /** @hidden */ public _dir: "horizontal" | "vertical";
  /** @hidden */ public _class_names: {
    label: string,
    tile: string,
    tileContent: string,
    placeholder: string,
  };
  /** @hidden */ public _small_size: number;
  /** @hidden */ public _tile_gap: number;
  /** @hidden */ public _group_gap: number;
  /** @hidden */ public _label_height: number;
  /** @hidden */ public _max_width: number;
  /** @hidden */ public _max_height: number;
  /** @hidden */ public _tile_transition: string;

  private _placeholder_element: HTMLDivElement | null = null;

  /** @hidden */ public _root_font_observer: RootFontObserver;
  /** @hidden */ public _rem: number = 16;

  /** @hidden */ public _layout: Layout;
  /** @hidden */ public _buttons: Map<string, HTMLButtonElement> = new Map();

  /** @hidden */ public _resize_observer: ResizeObserver | null = null;

  public _tile_size: TileResolution = {
    small: { w: 0, h: 0 },
    medium: { w: 0, h: 0 },
    wide: { w: 0, h: 0 },
    large: { w: 0, h: 0 },
  };

  private _readjust_timeout = -1;

  constructor(options: {
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
       * Class name used for identifying group labels.
       */
      label: string;
      /**
       * Class name used for identifying tiles.
       */
      tile: string;
      /**
       * Class name used for identifying tile contents.
       */
      tileContent: string;
      /**
       * Class name used for identifying a special tiled called the "placeholder",
       * which is created/removed during dragging a tile where the tile may be dropped.
       */
      placeholder: string;
    },
    /**
     * The size of small tiles, in cascading "rem" units.
     */
    smallSize: number;
    /**
     * Gap between tiles, in cascading "rem" units.
     */
    tileGap: number;
    /**
     * Gap between groups, in cascading "rem" units.
     */
    groupGap: number;
    /**
     * The height of group labels, in cascading "rem" units.
     */
    labelHeight: number;
    /**
     * Maximum width in small tiles, effective only
     * in vertical containers (must be >= 4).
     */
    maxWidth?: number;
    /**
     * Maximum height in small tiles, effective only
     * in horizontal containers (must be >= 4).
     */
    maxHeight?: number;
    /**
     * Transition function(s) to contribute to tiles.
     */
    tileTransition?: string;
  }) {
    super();

    assert(
      options.direction == "horizontal",
      "Vertical direction not supported currently.",
    );
    assert(
      options.direction == "horizontal" ? (options.maxHeight ?? 0) >= 4 : true,
      "maxHeight must be specified and be >= 4.",
    );

    this._container = options.element as HTMLElement;
    this._dir = options.direction;
    this._class_names = {
      label: options.classNames.label,
      tile: options.classNames.tile,
      tileContent: options.classNames.tileContent,
      placeholder: options.classNames.placeholder,
    };
    this._small_size = options.smallSize;
    this._tile_gap = options.tileGap;
    this._group_gap = options.groupGap;
    this._label_height = options.labelHeight;
    this._max_width = options.maxWidth ?? Infinity;
    this._max_height = options.maxHeight ?? Infinity;
    this._tile_transition = options.tileTransition ?? "";

    this._container.style.position = "relative";

    this._tile_size.small.w = this._small_size;
    this._tile_size.small.h = this._small_size;
    this._tile_size.medium.w = this._small_size * 2 + this._tile_gap;
    this._tile_size.medium.h = this._tile_size.medium.w;
    this._tile_size.wide.w = this._tile_size.medium.w * 2 + this._tile_gap;
    this._tile_size.wide.h = this._tile_size.medium.w;
    this._tile_size.large.w = this._tile_size.wide.w;
    this._tile_size.large.h = this._tile_size.wide.w;

    this._container.style.minWidth = "100%";
    this._container.style.height =
      this._max_height * this._small_size +
      this._max_height * this._tile_gap +
      this._label_height +
      "rem";

    // Observe the "rem" unit size
    this._root_font_observer = new RootFontObserver((val) => {
      this._rem = val;
    });

    // Set state
    this._state = new State();

    // Initial layout
    this._layout =
      this._dir == "horizontal"
        ? new HorizontalLayout(this, this._max_width, this._max_height)
        : new VerticalLayout(this, this._max_width, this._max_height);

    if (typeof window !== "undefined") {
      this._resize_observer = new ResizeObserver(() => {
        this._resize_container();
      });
      this._resize_observer.observe(this._container);
    }
  }

  /**
   * Destroys the `Tiles` instance, disposing
   * of any observers and removing the container from the DOM.
   */
  destroy() {
    for (const btn of Array.from(
      this._container.querySelectorAll("." + this._class_names.tile),
    ) as HTMLButtonElement[]) {
      const draggable = this._draggables.get(btn);
      if (draggable) draggable.destroy();
      this._draggables.delete(btn);
    }
    this._root_font_observer.cleanup();
    this._resize_observer?.disconnect();
    this._container.remove();
  }

  /** @hidden */
  _trigger_state_update() {
    this.dispatchEvent(
      new CustomEvent("stateupdate", { detail: this._state }),
    );
  }
}

export type TilesEventMap = {
  addedgroup: CustomEvent<{ group: Group; label: HTMLDivElement }>;
  addedtile: CustomEvent<{ tile: Tile; button: HTMLButtonElement }>;
  stateupdate: CustomEvent<State>;
  dragstart: CustomEvent<{ tile: HTMLButtonElement }>;
  drag: CustomEvent<{ tile: HTMLButtonElement }>;
  dragend: CustomEvent<{ tile: HTMLButtonElement }>;
};