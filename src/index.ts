import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";
import Draggable from "@hydroperx/draggable";
import { TypedEventTarget } from "@hydroperx/event";

import { RootFontObserver } from "./utils/RootFontObserver";
import {
  TileSizeOfResolution,
  get_size_width_small,
  get_size_height_small,
  TileSize,
} from "./enum/TileSize";
import { State } from "./State";
import { draggableHitSide } from "./utils/rect";
import { Group, Layout, Tile } from "./Layout";
import { HorizontalLayout } from "./HorizontalLayout";
import { VerticalLayout } from "./VerticalLayout";

export { type TileSize } from "./enum/TileSize";
export * from "./State";

const ENABLE_SHIFT = false;

export class Tiles extends (EventTarget as TypedEventTarget<{
  addedGroup: CustomEvent<{ group: Group; label: HTMLDivElement }>;
  addedTile: CustomEvent<{ tile: Tile; button: HTMLButtonElement }>;
  stateUpdated: CustomEvent<State>;
  dragStart: CustomEvent<{ tile: HTMLButtonElement }>;
  drag: CustomEvent<{ tile: HTMLButtonElement }>;
  dragEnd: CustomEvent<{ tile: HTMLButtonElement }>;
}>) {
  /** @hidden */ _state: State;
  /** @hidden */ _draggables: WeakMap<HTMLButtonElement, Draggable> =
    new WeakMap();

  /** @hidden */ public _container: HTMLElement;
  /** @hidden */ public _dir: "horizontal" | "vertical";
  /** @hidden */ public _label_class_name: string;
  /** @hidden */ public _tile_class_name: string;
  /** @hidden */ public _placeholder_class_name: string;
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
  private _size_only_grows: boolean = false;

  public _tile_size: TileSizeOfResolution = {
    small_w: 0,
    small_h: 0,
    medium_w: 0,
    medium_h: 0,
    wide_w: 0,
    wide_h: 0,
    large_w: 0,
    large_h: 0,
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
     * Class name used for identifying group labels.
     */
    labelClassName: string;
    /**
     * Class name used for identifying tiles.
     */
    tileClassName: string;
    /**
     * Class name used for identifying a special tiled called the "placeholder",
     * which is created/removed during dragging a tile where the tile may be dropped.
     */
    placeholderClassName: string;
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
    this._label_class_name = options.labelClassName;
    this._tile_class_name = options.tileClassName;
    this._placeholder_class_name = options.placeholderClassName;
    this._small_size = options.smallSize;
    this._tile_gap = options.tileGap;
    this._group_gap = options.groupGap;
    this._label_height = options.labelHeight;
    this._max_width = options.maxWidth ?? Infinity;
    this._max_height = options.maxHeight ?? Infinity;
    this._tile_transition = options.tileTransition ?? "";

    this._container.style.position = "relative";

    this._tile_size.small_w = this._small_size;
    this._tile_size.small_h = this._small_size;
    this._tile_size.medium_w = this._small_size * 2 + this._tile_gap;
    this._tile_size.medium_h = this._tile_size.medium_w;
    this._tile_size.wide_w = this._tile_size.medium_w * 2 + this._tile_gap;
    this._tile_size.wide_h = this._tile_size.medium_w;
    this._tile_size.large_w = this._tile_size.wide_w;
    this._tile_size.large_h = this._tile_size.wide_w;

    // this._container.style.minWidth = "100%";
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
      this._container.querySelectorAll("." + this._tile_class_name),
    ) as HTMLButtonElement[]) {
      const draggable = this._draggables.get(btn);
      if (draggable) draggable.destroy();
      this._draggables.delete(btn);
    }
    this._root_font_observer.cleanup();
    this._resize_observer?.disconnect();
    this._container.remove();
  }

  /**
   * Returns the state of the `Tiles` instance.
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
    this._layout.total_offset_width = 0;
    this._layout.total_offset_height = 0;

    // Discard draggables
    for (const [,btn] of this._buttons) {
      this._draggables.get(btn)?.destroy();
      this._draggables.delete(btn);
    }

    // Clear button mappings
    this._buttons.clear();

    // remove tiles
    for (const button of Array.from(this._container.querySelectorAll("." + this._tile_class_name)) as HTMLElement[]) {
      button.remove();
    }

    // remove labels
    for (const label of Array.from(this._container.querySelectorAll("." + this._label_class_name)) as HTMLElement[]) {
      label.remove();
    }

    // remove placeholder
    if (this._placeholder_element) {
      this._placeholder_element.remove();
      this._placeholder_element = null;
    }

    // resize container
    this._resize_container();
  }

  /**
   * Adds a group to the end and returns its label's `div` element.
   */
  addGroup({ id, label }: { id: string; label?: string }): HTMLDivElement {
    // Keep groups sequential
    this._keep_groups_sequential();

    label ??= "";
    assert(!this._state.groups.has(id), "Duplicate group ID: " + id);

    const existing_indices = Array.from(this._state.groups.values()).map(
      (g) => g.index,
    );
    const index =
      existing_indices.length == 0
        ? 0
        : Math.max.apply(null, existing_indices) + 1;
    this._state.groups.set(id, { index, label });

    const div = document.createElement("div");
    div.setAttribute("data-id", id);
    div.classList.add(this._label_class_name);
    div.style.position = "absolute";
    div.innerText = label;
    this._container.appendChild(div);

    const group_data = new Group(this._layout, id, div);
    this._layout.groups.splice(index, 0, group_data);
    this._layout.readjust_groups();

    this.dispatchEvent(
      new CustomEvent("addedGroup", {
        detail: {
          group: group_data,
          label: div,
        },
      }),
    );

    this._trigger_state_update();

    return div;
  }

  addTile({
    id,
    group,
    x,
    y,
    size,
  }: {
    /**
     * Tile ID.
     */
    id: string;
    /**
     * Group to attach tile to.
     */
    group: string;
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
     */
    size?: TileSize;
  }): HTMLButtonElement {
    assert(this._state.groups.has(group), `Group ${group} does not exist.`);
    assert(!this._state.tiles.has(id), `Duplicate tile ID: ${id}.`);
    size ??= "small";

    x ??= -1;
    y ??= -1;
    if (x == -1) {
      let last_group: Group | null =
        this._layout.groups.length == 0
          ? null
          : this._layout.groups[this._layout.groups.length - 1];
      if (last_group) {
        if (y == -1) [x, y] = last_group.last_tile_position();
        else [x] = last_group.last_tile_position();
      } else x = 0;
    } else if (y == -1) {
      let last_group: Group | null =
        this._layout.groups.length == 0
          ? null
          : this._layout.groups[this._layout.groups.length - 1];
      if (last_group) [, y] = last_group.last_tile_position();
      else y = 0;
    }

    this._state.tiles.set(id, {
      size,
      x,
      y,
      group,
    });

    const normal_transition = `${this._tile_transition + (this._tile_transition ? ", " : "")} translate 0.2s ease-out`;
    const dragging_transition = `${this._tile_transition}`;

    const [w, h] = this.get_tile_size(size);
    const button = document.createElement("button");
    button.setAttribute("data-id", id);
    button.setAttribute("data-size", size);
    button.classList.add(this._tile_class_name);
    button.style.position = "absolute";
    button.style.width = `${w}rem`;
    button.style.height = `${h}rem`;
    button.style.transition = normal_transition;
    this._container.appendChild(button);

    // Add to layout's group
    const layout_group = this._layout.groups.find((g) => g.id == group)!;
    const tile_data = new Tile(
      id,
      button,
      x,
      y,
      get_size_width_small(size),
      get_size_height_small(size),
    );
    layout_group.add(tile_data);

    // Drag vars
    let drag_start: [number, number] | null = null;
    let previous_state: State | null = null;
    let active_tiles_hit = false,
      active_tile_hit_side: "top" | "left" | "bottom" | "right" = "top",
      active_tile_hit_id: string = "",
      active_tile_hit_area: {
        x: number;
        y: number;
        width: number;
        height: number;
      } = { x: 0, y: 0, width: 0, height: 0 };

    // Setup draggable
    const draggable = new Draggable(button, {
      setPosition: false,
      onDragStart: (el, x, y, evt) => {
        drag_start = [x, y];
        previous_state = this._state.clone();
        button.style.transition = dragging_transition;
        button.style.zIndex = "999999999";
        this._size_only_grows = true;
        this.dispatchEvent(
          new CustomEvent("dragStart", {
            detail: { tile: el },
          }),
        );
      },
      onDrag: (el, x, y, evt) => {
        const small_w = this._small_size * this._rem;

        if (drag_start === null) {
          button.style.transition = normal_transition;
          button.style.inset = "";
          return;
        }

        const diff_x = drag_start[0] - x,
          diff_y = drag_start[1] - y,
          diff_rad = small_w / 4;
        if (
          diff_x > -diff_rad &&
          diff_x <= diff_rad &&
          diff_y > -diff_rad &&
          diff_y <= diff_rad
        ) {
          return;
        }
        set_dragging(true);

        // Shift tiles as needed.
        const r: DOMRect | null = active_tiles_hit
          ? button.getBoundingClientRect()
          : null;
        const areaOverlap = active_tiles_hit
          ? getRectangleOverlap(r!, active_tile_hit_area)
          : null;
        if (!(areaOverlap && areaOverlap.area != 0) && ENABLE_SHIFT) {
          const hit = hits_another_tile();
          if (hit) {
            // Active hit area
            const hitted_button = Array.from(
              this._container.querySelectorAll("." + this._tile_class_name),
            ).find((btn) => btn.getAttribute("data-id") == hit.tile);
            active_tile_hit_area = hitted_button!.getBoundingClientRect();

            this._restore_state(previous_state!);
            this._layout.shift(hit.tile, id, hit.side);
            active_tile_hit_id = hit.tile;
            active_tile_hit_side = hit.side;
            active_tiles_hit = true;
          } else {
            this._restore_state(previous_state!);
            this._layout.readjust_groups();
            active_tiles_hit = false;
          }
        }

        // Display placeholder
        const snap_preview = this._layout.snap_preview(id, el as HTMLElement);
        if (snap_preview) {
          if (!this._placeholder_element) {
            this._placeholder_element = document.createElement("div");
            this._placeholder_element.classList.add(
              this._placeholder_class_name,
            );
            this._placeholder_element.style.position = "absolute";
            this._placeholder_element.style.zIndex = "999999999";
            this._container.appendChild(this._placeholder_element);
          }
          this._placeholder_element.style.translate = `${snap_preview.x}rem ${snap_preview.y}rem`;
          this._placeholder_element.style.width = snap_preview.w + "rem";
          this._placeholder_element.style.height = snap_preview.h + "rem";
        } else if (this._placeholder_element) {
          this._placeholder_element.remove();
          this._placeholder_element = null;
        }

        this.dispatchEvent(
          new CustomEvent("drag", {
            detail: { tile: el },
          }),
        );
      },
      onDragEnd: (el, x, y, evt) => {
        this._size_only_grows = false;
        button.style.zIndex = "";

        if (drag_start === null) {
          button.style.inset = "";
          return;
        }

        if (this._placeholder_element) {
          this._placeholder_element.remove();
          this._placeholder_element = null;
        }

        drag_start = null;
        previous_state = null;
        set_dragging(false);
        button.style.transition = normal_transition;

        // Snap tile to free space.
        // const r = el.getBoundingClientRect();
        this._layout.snap_to_grid(id, el as HTMLElement);

        button.style.inset = "";
        this._layout.readjust_groups();

        active_tiles_hit = false;

        this.dispatchEvent(
          new CustomEvent("dragEnd", {
            detail: { tile: el },
          }),
        );
      },
    });
    this._draggables.set(button, draggable);

    // Associate button
    this._buttons.set(tile_data.id, button);

    // Set dragging state
    const set_dragging = (value: boolean): void => {
      button.setAttribute("data-dragging", value.toString());
    };

    // Detect whether this tile hits another
    const hits_another_tile = (): {
      tile: string;
      side: "left" | "right" | "top" | "bottom";
    } | null => {
      const small_w = this._small_size * this._rem;
      const tiles = Array.from(
        this._container.querySelectorAll("." + this._tile_class_name),
      ) as HTMLButtonElement[];
      const i = tiles.indexOf(button);
      if (i == -1) return null;
      tiles.splice(i, 1);
      const r = button.getBoundingClientRect();
      for (const tile of tiles) {
        const rect = tile.getBoundingClientRect();
        const place_side = draggableHitSide(r, rect);
        if (place_side === null) {
          continue;
        }

        // Only hits if a large enough area overlaps.
        const overlap = getRectangleOverlap(rect, r);
        if (overlap && overlap.area < small_w * 0.3) {
          continue;
        }

        if (overlap)
          return { tile: tile.getAttribute("data-id")!, side: place_side };
      }
      return null;
    };

    // Rearrange
    this._readjust_groups_delayed();

    // Trigger addedTile event
    this.dispatchEvent(
      new CustomEvent("addedTile", {
        detail: {
          tile: tile_data,
          button,
        },
      }),
    );

    // Trigger state update
    this._trigger_state_update();

    return button;
  }

  resizeTile(id: string, size: TileSize): void {
    const tile_state = this._state.tiles.get(id);
    if (!tile_state) return;
    const group = this._layout.groups.find((g) => g.id == tile_state.group);
    if (!group) return;
    const tile_data = group.tiles.find((t) => t.id == id);
    if (!tile_data) return;
    const button = Array.from(
      this._container.querySelectorAll("." + this._tile_class_name),
    ).find((btn) => btn.getAttribute("data-id") == id) as
      | HTMLButtonElement
      | undefined;
    if (!button) return;

    const w = get_size_width_small(size),
      h = get_size_height_small(size);
    if (!group.is_area_available(tile_state.x, tile_state.y, w, h)) return;

    tile_state.size = size;
    tile_data.width = w;
    tile_data.height = h;

    const [real_w, real_h] = this.get_tile_size(size);
    button.style.width = `${real_w}rem`;
    button.style.height = `${real_h}rem`;
    button.setAttribute("data-size", size);

    this._trigger_state_update();
  }

  removeTile(id: string): void {
    const tile_state = this._state.tiles.get(id);
    if (!tile_state) return;
    const group = this._layout.groups.find((g) => g.id == tile_state.group);
    if (!group) return;
    const tile_data = group.tiles.find((t) => t.id == id);
    if (!tile_data) return;
    const button = Array.from(
      this._container.querySelectorAll("." + this._tile_class_name),
    ).find((btn) => btn.getAttribute("data-id") == id) as
      | HTMLButtonElement
      | undefined;
    if (!button) return;

    const draggable = this._draggables.get(button);
    if (draggable) {
      draggable.destroy();
      this._draggables.delete(button);
    }
    this._buttons.delete(id);
    button.remove();
    group.remove(id);
  }

  renameGroup(id: string, label: string): void {
    const group = this._layout.groups.find((g) => g.id == id);
    if (!group) return;
    const group_state = this._state.groups.get(id);
    if (!group_state) return;

    group.label.innerText = label;
    group_state.label = label;

    this._trigger_state_update();
  }

  removeGroup(id: string): void {
    const group = this._layout.groups.find((g) => g.id == id);
    if (!group) return;
    group.self_removal();
  }

  groupExists(id: string): boolean {
    return this._state.groups.has(id);
  }

  tileExists(id: string): boolean {
    return this._state.tiles.has(id);
  }

  private get_tile_size(size: TileSize): [number, number] {
    const r = this._tile_size;
    switch (size) {
      case "small":
        return [r.small_w, r.small_h];
      case "medium":
        return [r.medium_w, r.medium_h];
      case "wide":
        return [r.wide_w, r.wide_h];
      case "large":
        return [r.large_w, r.large_h];
    }
  }

  /** @hidden */
  _readjust_groups_delayed(): void {
    if (this._readjust_timeout !== -1)
      window.clearTimeout(this._readjust_timeout);
    this._readjust_timeout = window.setTimeout(() => {
      this._layout.readjust_groups();
    }, 10);
  }

  /** @hidden */
  _resize_container(): void {
    if (this._size_only_grows) {
      if (this._dir == "horizontal")
        this._container.style.width =
          this._layout.total_offset_width + "rem";
      else
        this._container.style.height =
          this._layout.total_offset_height + "rem";
      return;
    }

    if (this._dir == "horizontal")
      this._container.style.width =
        this._layout.total_offset_width + "rem";
    else
      this._container.style.height =
        this._layout.total_offset_height + "rem";
  }

  /** @hidden */
  _restore_state(previous_state: State): void {
    this._state.clear();
    this._state.set(previous_state);

    // Restore layout positions and size
    this._layout.groups.length = 0;
    const group_states_sorted = Array.from(this._state.groups.entries()).sort(
      (a, b) => a[1].index - b[1].index,
    );
    const labels = Array.from(
      this._container.querySelectorAll("." + this._label_class_name),
    );
    const tile_buttons = Array.from(
      this._container.querySelectorAll("." + this._tile_class_name),
    );
    for (const [group_id] of group_states_sorted) {
      const label = labels.find(
        (label) => label.getAttribute("data-id") == group_id,
      ) as HTMLDivElement | undefined;
      if (!label) continue;
      const group_data = new Group(this._layout, group_id, label);
      this._layout.groups.push(group_data);

      for (const [tile_id, tile_state] of this._state.tiles) {
        if (tile_state.group !== group_id) continue;

        const tile_button = tile_buttons.find(
          (btn) => btn.getAttribute("data-id") == tile_id,
        ) as HTMLButtonElement | undefined;
        if (!tile_button) continue;
        const w = get_size_width_small(tile_state.size),
          h = get_size_height_small(tile_state.size);
        const tile = new Tile(
          tile_id,
          tile_button,
          tile_state.x,
          tile_state.y,
          w,
          h,
        );
        assert(group_data.add(tile), "Failed restoring state of tile.");
      }
    }
  }

  /** @hidden */
  _keep_groups_sequential(): void {
    const sorted_groups = Array.from(this._state.groups.entries()).sort(
      (a, b) => a[1].index - b[1].index,
    );
    let changed = false;
    for (let i = 0; i < sorted_groups.length; i++) {
      const group = sorted_groups[i][1];
      if (group.index != i) changed = true;
      group.index = i;
    }
    if (changed) this._trigger_state_update();
  }

  /** @hidden */
  _trigger_state_update() {
    this.dispatchEvent(
      new CustomEvent("stateUpdated", { detail: this._state }),
    );
  }
}
