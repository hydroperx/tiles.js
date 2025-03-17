import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";
import getOffset from "getoffset";
import Draggable from "com.hydroper.domdraggable";

import { RemObserver } from "./utils/RemObserver";
import { TileSize$widthheight, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";
import { random_hex_large } from "./utils/random";
import { Rows } from "./Rows";
import { TileExpertState } from "./TileExpertState";
import { getRectHitSide } from "./utils/rect";

export { type TileSize } from "./enum/TileSize";
export * from "./TileExpertState";

export class TileExpert
{
    private m_state: TileExpertState;
    private m_draggables: WeakMap<HTMLButtonElement, Draggable> = new WeakMap();

    private m_container: HTMLElement;
    private m_dir: "horizontal" | "vertical";
    private m_label_class_name: string;
    private m_tile_class_name: string;
    private m_small_size: number;
    private m_tile_gap: number;
    private m_group_gap: number;
    private m_label_height: number;
    private m_max_width: number;
    private m_max_height: number;
    private m_tile_transition: string;
    private m_scroll_node: HTMLElement;

    private m_rem_observer: RemObserver;
    private m_rem: number;

    private m_tile_widthheight_rem: TileSize$widthheight = {
        small_w: 0, small_h: 0,
        medium_w: 0, medium_h: 0,
        wide_w: 0, wide_h: 0,
        large_w: 0, large_h: 0,
    };
    private m_tile_widthheight_px: TileSize$widthheight = {
        small_w: 0, small_h: 0,
        medium_w: 0, medium_h: 0,
        wide_w: 0, wide_h: 0,
        large_w: 0, large_h: 0,
    };
    private m_tile_gap_px: number = 0;
    private m_group_gap_px: number = 0;

    private m_rearrange_timeout: number = -1;

    // variables used when rearranging
    private m_group_x: number;
    private m_group_y: number;
    private m_rows: Rows | null = null;
    // tiles with their width and height as small tiles
    private m_tiles: Map<string, { button: HTMLButtonElement, size: TileSize, w: number, h: number, x: number, y: number }> = new Map();

    constructor(options: {
        /**
         * Container.
         */
        element: Element,
        /**
         * The direction of the tile container.
         */
        direction: "horizontal" | "vertical",
        /**
         * Class name used for identifying group labels.
         */
        labelClassName: string,
        /**
         * Class name used for identifying tiles.
         */
        tileClassName: string,
        /**
         * The size of small tiles, in cascading "rem" units.
         */
        smallSize: number,
        /**
         * Gap between tiles, in cascading "rem" units.
         */
        tileGap: number,
        /**
         * Gap between groups, in cascading "rem" units.
         */
        groupGap: number,
        /**
         * The height of group labels, in cascading "rem" units.
         */
        labelHeight: number,

        /**
         * Maximum width in small tiles, effective only
         * in vertical containers.
         */
        maxWidth?: number,

        /**
         * Maximum height in small tiles, effective only
         * in horizontal containers.
         */
        maxHeight?: number,

        /**
         * Transition function(s) to contribute to tiles.
         */
        tileTransition?: string,

        /**
         * Scroll node to resolve offsets from.
         */
        scrollNode?: Element,
    }) {
        assert(options.direction == "horizontal", "Vertical direction not supported currently.");

        this.m_container = options.element as HTMLElement;
        this.m_dir = options.direction;
        this.m_label_class_name = options.labelClassName;
        this.m_tile_class_name = options.tileClassName;
        this.m_small_size = options.smallSize;
        this.m_tile_gap = options.tileGap;
        this.m_group_gap = options.groupGap;
        this.m_label_height = options.labelHeight;
        this.m_max_width = options.maxWidth ?? Infinity;
        this.m_max_height = options.maxHeight ?? Infinity;
        this.m_tile_transition = options.tileTransition ?? "";
        this.m_scroll_node = options.scrollNode as HTMLElement;

        this.m_container.style.position = "relative";

        this.m_tile_widthheight_rem.small_w = this.m_small_size;
        this.m_tile_widthheight_rem.small_h = this.m_small_size;
        this.m_tile_widthheight_rem.medium_w = this.m_small_size * 2 + this.m_tile_gap;
        this.m_tile_widthheight_rem.medium_h = this.m_tile_widthheight_rem.medium_w;
        this.m_tile_widthheight_rem.wide_w = this.m_tile_widthheight_rem.medium_w * 2 + this.m_tile_gap;
        this.m_tile_widthheight_rem.wide_h = this.m_tile_widthheight_rem.medium_w;
        this.m_tile_widthheight_rem.large_w = this.m_tile_widthheight_rem.wide_w;
        this.m_tile_widthheight_rem.large_h = this.m_tile_widthheight_rem.wide_w;

        // Observe the "rem" unit size
        this.m_rem_observer = new RemObserver(val => {
            this.m_rem = val;
            this.update_px();
        });
        this.m_rearrange_timeout = -1;

        // Set state
        this.m_state = new TileExpertState();

        // Update pixel measurements
        this.update_px();
    }

    /**
     * Destroys the `TileExpert` instance disposing
     * of any observers and removing the container from the DOM.
     */
    destroy()
    {
        for (const btn of Array.from(this.m_container.querySelectorAll("." + this.m_tile_class_name)) as HTMLButtonElement[])
        {
            const draggable = this.m_draggables.get(btn);
            if (draggable) draggable.destroy();
            this.m_draggables.delete(btn);
        }
        this.m_rem_observer.cleanup();
        this.m_container.remove();
    }

    /**
     * Loads a state in the `TileExpert` instance.
     */
    load(state: TileExpertState): void
    {
        for (const [id, group] of state.groups)
        {
            this.addGroup({
                id,
                index: group.index,
                label: group.label,
            });
        }
        for (const [id, tile] of state.tiles)
        {
            this.addTile({
                id,
                size: tile.size,
                x: tile.x,
                y: tile.y,
                group: tile.group,
            });
        }
    }

    /**
     * Returns the state of the `TileExpert` instance.
     */
    save(): TileExpertState
    {
        return this.m_state.clone();
    }

    /**
     * Adds a group and returns its label's `div` element.
     */
    addGroup({
        id,
        index,
        label,
    }: {
        id: string,
        index?: number,
        label?: string,
    }): HTMLDivElement
    {
        index ??= -1;
        label ??= "";
        assert(!this.m_state.groups.has(id), "Duplicate group ID: " + id);
        const existing_indices = Array.from(this.m_state.groups.values()).map(g => g.index);
        if (index === -1)
        {
            index = Math.max.apply(null, existing_indices.concat(0)) + 1;
        }
        assert(existing_indices.indexOf(index) == -1, `Group at index ${index} already exists.`);
        this.m_state.groups.set(id, { index, label });

        const div = document.createElement("div");
        div.setAttribute("data-id", id);
        div.classList.add(this.m_label_class_name);
        div.style.position = "absolute";
        this.m_container.appendChild(div);

        // Rearrange
        this.rearrange_delayed();

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
        id: string,
        /**
         * Group to attach tile to.
         */
        group: string,
        /**
         * Horizontal position in small tiles.
         */
        x?: number,
        /**
         * Vertical position in small tiles.
         */
        y?: number,

        /**
         * Tile size.
         */
        size?: TileSize,
    }): HTMLButtonElement
    {
        assert(this.m_state.groups.has(group), `Group ${group} does not exist.`);
        assert(!this.m_state.tiles.has(id), `Duplicate tile ID: ${id}.`);
        size ??= "small";
        x ??= 0;
        y ??= 0;
        this.m_state.tiles.set(id, {
            size,
            x,
            y,
            group,
        });

        const normal_transition = `${this.m_tile_transition} translate 0.2s ease-out`;
        const dragging_transition = `${this.m_tile_transition}`;

        const [w_rem, h_rem] = this.get_tile_size_rem(size);
        const button = document.createElement("button");
        button.setAttribute("data-id", id);
        button.classList.add(this.m_tile_class_name);
        button.style.position = "absolute";
        button.style.width = `${w_rem}rem`;
        button.style.height = `${h_rem}rem`;
        button.style.transition = normal_transition;
        this.m_container.appendChild(button);

        // Drag vars
        let drag_start: [number, number] | null = null;
        let previous_state: TileExpertState | null = null;
        let active_tiles_hit = false;

        // Setup draggable
        const draggable = new Draggable(button, {
            onDragStart: (el, x, y, evt) =>
            {
                drag_start = [x, y];
                previous_state = this.m_state.clone();
                button.style.transition = dragging_transition;
            },
            onDrag: (el, x, y, evt) =>
            {
                if (drag_start === null)
                {
                    button.style.transition = normal_transition;
                    button.style.inset = "";
                    return;
                }
        
                const diff_x = drag_start[0] - x
                    , diff_y = drag_start[1] - y;
                if (diff_x > -5 && diff_x <= 5 && diff_y > -5 && diff_y <= 5)
                {
                    return;
                }
                set_dragging(true);
        
                // Shift tiles as needed.
                const hit = hits_another_tile();
                if (hit)
                {
                    this.rearrange_immediate({ shift: true, to_shift: hit.tile, place_taker: id, place_side: hit.side});
                    active_tiles_hit = true;
                }
                else
                {
                    this.m_state.clear();
                    this.m_state.set(previous_state);
                    this.rearrange_immediate({ restore: true, restore_except: id });
                    active_tiles_hit = false;
                }
            },
            onDragEnd: (el, x, y, evt) =>
            {
                if (drag_start === null)
                {
                    button.style.inset = "";
                    return;
                }
        
                drag_start = null;
                set_dragging(false);
                button.style.transition = normal_transition;

                // Move tile properly
                if (active_tiles_hit)
                {
                    button.style.inset = "";
                    this.rearrange_immediate();
                }
                else
                {
                    // Snap tile to free space.
                    this.rearrange_immediate({ grid_snap: true, grid_snap_tile: id });
        
                    button.style.inset = "";
                }
            },
        });
        this.m_draggables.set(button, draggable);

        // Set dragging state
        const set_dragging = (value: boolean): void =>
        {
            button.setAttribute("data-dragging", value.toString());
        };

        // Detect whether this tile hits another
        const hits_another_tile = (): { tile: string, side: "left" | "right" | "top" | "bottom" } | null =>
        {
            const { small_w } = this.m_tile_widthheight_px;
            const tiles = Array.from(this.m_container.querySelectorAll("." + this.m_tile_class_name)) as HTMLButtonElement[];
            const i = tiles.indexOf(button);
            if (i == -1) return null;
            tiles.splice(i, 1);
            const r = button.getBoundingClientRect();
            for (const tile of tiles)
            {
                const rect = tile.getBoundingClientRect();
                const place_side = getRectHitSide(rect, r);
                if (place_side === null)
                {
                    continue;
                }

                // Only hits if a large enough area overlaps.
                const overlap = getRectangleOverlap(rect, r);
                if (overlap && overlap.area < (small_w * 1.5))
                {
                    continue;
                }

                if (overlap) return { tile: tile.getAttribute("data-id"), side: place_side };
            }
            return null;
        };

        // Rearrange
        this.rearrange_delayed();

        return button;
    }

    private get_tile_size_rem(size: TileSize): [number, number]
    {
        const r = this.m_tile_widthheight_rem;
        switch (size)
        {
            case "small": return [r.small_w, r.small_h];
            case "medium": return [r.medium_w, r.medium_h];
            case "wide": return [r.wide_w, r.wide_h];
            case "large": return [r.large_w, r.large_h];
        }
    }

    // Updates pixel measurements.
    private update_px()
    {
        const rem = this.m_rem;
        this.m_tile_widthheight_px.small_w = this.m_tile_widthheight_rem.small_w * rem;
        this.m_tile_widthheight_px.small_h = this.m_tile_widthheight_px.small_w;
        this.m_tile_widthheight_px.medium_w = this.m_tile_widthheight_rem.medium_w * rem;
        this.m_tile_widthheight_px.medium_h = this.m_tile_widthheight_rem.medium_h * rem;
        this.m_tile_widthheight_px.wide_w = this.m_tile_widthheight_rem.wide_w * rem;
        this.m_tile_widthheight_px.wide_h = this.m_tile_widthheight_rem.wide_h * rem;
        this.m_tile_widthheight_px.large_w = this.m_tile_widthheight_rem.large_w * rem;
        this.m_tile_widthheight_px.large_h = this.m_tile_widthheight_px.large_h * rem;
        this.m_tile_gap_px = this.m_tile_gap * rem;
        this.m_group_gap_px = this.m_group_gap * rem;
    }

    private rearrange_delayed(options: RearrangeOptions = {}): void
    {
        if (this.m_rearrange_timeout != -1)
            window.clearTimeout(this.m_rearrange_timeout);
        this.m_rearrange_timeout = window.setTimeout(this.rearrange_immediate.bind(this), 10);
    }

    private rearrange_immediate(rearrange_options: RearrangeOptions = {}) {
        if (this.m_rearrange_timeout != -1)
            window.clearTimeout(this.m_rearrange_timeout);
        this.m_rearrange_timeout = -1;

        // Group-label divs
        const label_divs: HTMLDivElement[] = Array.from(this.m_container.querySelectorAll("." + this.m_label_class_name)) as HTMLDivElement[];

        // Sort label divs
        label_divs.sort((a, b) => {
            const a_pos = this.m_state.groups.get(a.getAttribute("data-id")).index;
            const b_pos = this.m_state.groups.get(b.getAttribute("data-id")).index;

            return a_pos < b_pos ? -1 : a_pos > b_pos ? 1 : 0;
        });

        // Initialize layout calculus
        this.m_rows = new Rows(this.m_dir == "horizontal" ? Infinity : this.m_max_width, this.m_dir == "horizontal" ? this.m_max_height : Infinity);
        this.m_group_x = 0;
        this.m_group_y = this.m_label_height * this.m_rem;

        // Retrieve tile buttons
        const tiles = Array.from(this.m_container.querySelectorAll("." + this.m_tile_class_name)) as HTMLButtonElement[];

        // Shifting parameters
        const shift_params = rearrange_options?.shift ?
            {
                to_shift: rearrange_options.to_shift,
                place_taker: rearrange_options.place_taker,
                place_side: rearrange_options.place_side,
            } : null;

        // Restore parameters
        const restore_params = rearrange_options?.restore ?
            {
                except: rearrange_options.restore_except,
            } : null;

        // Grid snap parameters
        const grid_snap_params = rearrange_options?.grid_snap ?
            {
                tile: rearrange_options.grid_snap_tile,
            } : null;
        let grid_snap_tile_button: HTMLButtonElement | null = null,
            grid_snap_offset: { x: number, y: number } = null;
        if (grid_snap_params)
        {
            grid_snap_tile_button = tiles.find(t => t.getAttribute("data-id") == grid_snap_params.tile);
            grid_snap_offset = getOffset(grid_snap_tile_button, this.m_scroll_node ?? this.m_container);
        }

        const last_label_div =  label_divs[label_divs.length - 1];

        // Position labels and tiles
        for (const label_div of label_divs)
        {
            const group_id = label_div.getAttribute("data-id");

            // Determine whether to shift tiles at this group
            let shifting = false;
            if (shift_params && this.m_state.tiles.has(shift_params.to_shift) &&
                this.m_state.tiles.get(shift_params.to_shift).group == group_id)
            {
                shifting = true;
            }

            const this_group_tiles: HTMLButtonElement[] = [];

            // Populate tile calculus
            this.m_tiles.clear();
            this.populate_tiles(tiles);

            // Position and size tiles
            for (const tile of tiles)
            {
                const tile_id = tile.getAttribute("data-id");
                let tile_state = this.m_state.tiles.get(tile_id)!;
                const tile_group_id = tile_state.group;
                if (tile_group_id != group_id)
                {
                    continue;
                }

                this_group_tiles.push(tile);

                // Position tile
                if (tile.getAttribute("data-dragging") != "true")
                {
                    const h    = tile_state.x
                        , v    = tile_state.y
                        , size = tile_state?.size
                    const { new_x, new_y } = this.put_tile(size, h, v);
                    this.set_real_position(tile_id, new_x, new_y);

                    if (!tile_state)
                    {
                        tile_state = { group: "", size: "small", x: 0, y: 0 };
                        this.m_state.tiles.set(tile_id, tile_state);
                    }
                    tile_state.group = tile_group_id;
                    tile_state.size = size;
                    tile_state.x = new_x;
                    tile_state.y = new_y;
                }
            }

            // Shift tiles
            if (shifting)
            {
                const place_taker_button = tiles.find(t => t.getAttribute("data-id") == shift_params.place_taker);
                this.shift(
                    this_group_tiles,
                    shift_params.to_shift,
                    shift_params.place_taker,
                    place_taker_button,
                    shift_params.place_side
                );
            }

            // Grid snapping
            if (grid_snap_offset)
            {
                let x: number = this.page_x_to_x(grid_snap_offset.x),
                    y: number = this.page_y_to_y(grid_snap_offset.y);
                if (x !== -1 && y !== -1)
                {
                    const state = this.m_state.tiles.get(grid_snap_params.tile);
                    if (this.m_rows.sizeFreeAt(x, y, state.size))
                    {
                        const btn = grid_snap_tile_button;
                        const { new_x, new_y } = this.put_tile(state.size, x, y);
                        this.set_real_position(grid_snap_params.tile, new_x, new_y);

                        state.group = group_id;
                        state.x = new_x;
                        state.y = new_y;
                    }
                    grid_snap_offset = null;
                }
            }

            // Position and size group label
            const { x, y, width } = this.put_label();
            label_div.style.translate = `${x / this.m_rem}rem ${y / this.m_rem}rem`;
            label_div.style.width = `${width / this.m_rem}rem`;
            label_div.style.height = `${this.m_label_height}rem`;

            const group_state = this.m_state.groups.get(group_id);

            // Enter label text
            label_div.innerText = group_state.label;
        }

        // Grid snapping (new group)
        if (grid_snap_offset)
            {
                let x: number = this.page_x_to_x(grid_snap_offset.x),
                    y: number = this.page_y_to_y(grid_snap_offset.y);
                if (x === -1  && this.m_dir == "horizontal")
                    x = this.forced_page_x_to_x(grid_snap_offset.x);
                if (y === -1 && this.m_dir == "vertical")
                    y = this.forced_page_y_to_y(grid_snap_offset.x);
                if (x !== -1 && y !== -1)
                {
                    const state = this.m_state.tiles.get(grid_snap_params.tile);
                    if (this.m_rows.sizeFreeAt(x, y, state.size))
                    {
                        const btn = grid_snap_tile_button;
                        const { new_x, new_y } = this.put_tile(state.size, x, y);
                        this.set_real_position(grid_snap_params.tile, new_x, new_y);

                        // Group ID
                        const group_id = "auto$" + random_hex_large();

                        // Create label div
                        const label_div = this.addGroup({
                            id: group_id,
                            index: -1,
                            label: "",
                        });

                        state.group = group_id;
                        state.x = new_x;
                        state.y = new_y;

                        // Position and size group label
                        const { x: label_x, y: label_y, width: label_w } = this.put_label();
                        label_div.style.translate = `${label_x / this.m_rem}rem ${label_y / this.m_rem}rem`;
                        label_div.style.width = `${label_w / this.m_rem}rem`;
                        label_div.style.height = `${this.m_label_height}rem`;
                        label_divs.push(label_div);

                        const group_state = this.m_state.groups.get(group_id);

                        // Enter label text
                        label_div.innerText = group_state.label;
                    }
                    grid_snap_offset = null;
                }
            }

        this.m_tiles.clear();
        this.m_rows = null;
    }

    private populate_tiles(tile_buttons: HTMLButtonElement[]): void
    {
        for (const button of tile_buttons)
        {
            const id = button.getAttribute("data-id");
            const tile_state = this.m_state.tiles.get(id);
            assert(tile_state !== undefined, "Invalidated tile state.");
            const size = tile_state.size;
            this.m_tiles.set(id, {
                button,
                size,
                w: get_size_width_small(size),
                h: get_size_height_small(size),
                x: tile_state.x,
                y: tile_state.y,
            });
        }
    }

    private contribute_calc_tile(button: HTMLButtonElement)
    {
        const id = button.getAttribute("data-id");
        const tile_state = this.m_state.tiles.get(id);
        assert(tile_state !== undefined, "Invalidated tile state.");
        const size = tile_state.size;
        this.m_tiles.set(id, {
            button,
            size,
            w: get_size_width_small(size),
            h: get_size_height_small(size),
            x: tile_state.x,
            y: tile_state.y,
        });
    }

    private set_real_position(id: string, x: number, y: number): void
    {
        const { m_rem: rem, m_tile_gap: tile_gap_rem } = this;
        const { small_w, small_h } = this.m_tile_widthheight_rem;
        const tile_state = this.m_state.tiles.get(id);

        tile_state.x = x;
        tile_state.y = y;

        const t = this.m_tiles.get(id);
        if (t)
        {
            t.x = x;
            t.y = y;
        }

        const button = this.m_tiles.get(id)?.button;
        if (button && button.getAttribute("data-dragging") != "true")
        {
            const real_x = (this.m_group_x / rem) + (x * small_w) + (x * tile_gap_rem);
            const real_y = (this.m_group_y / rem) + (y * small_h) + (y * tile_gap_rem);
            button.style.translate = `${real_x}rem ${real_y}rem`;
        }
    }

    private put_tile(size: TileSize, x: number, y: number): { new_x: number, new_y: number }
    {
        if (this.m_dir == "horizontal")
            return this.horizontal_container_put_tile(size, x, y);
        else
            throw new Error("not implemented");
    }

    private horizontal_container_put_tile(size: TileSize, x: number, y: number): { new_x: number, new_y: number }
    {
        const { max_height } = this.m_rows;

        for (;;)
        {
            for (; y < max_height; y++)
            {
                if (this.m_rows.sizeFreeAt(x, y, size))
                {
                    this.m_rows.fillSize(x, y, size);
                    return {
                        new_x: x, new_y: y
                    };
                }
            }
            y = 0;
            x++;
            assert(x <= 0x7FFFFF, "Horizontal tiles too large.");
        }
    }

    /**
     * Puts a label after all tiles of a group have been positioned,
     * moving to the next group.
     */
    private put_label(): { x: number, y: number, width: number }
    {
        if (this.m_dir)
            return this.horizontal_container_put_label();
        else
            throw new Error("not implemented");
    }

    private horizontal_container_put_label(): { x: number, y: number, width: number }
    {
        // Measurements
        const { m_tile_gap_px: tile_gap_px, m_group_gap_px: group_gap_px } = this;
        const { small_w, wide_w } = this.m_tile_widthheight_px;

        // Result vars
        const this_group_x = this.m_group_x;
        const minimum_width = wide_w;
        let width = this.m_rows.width == 0 ? 0 : (this.m_rows.width * small_w) + ((this.m_rows.width - 1) * tile_gap_px);
        width = Math.max(width, minimum_width);

        // Move to the next group
        this.m_group_x += width + group_gap_px;
        this.m_rows = new Rows(Infinity, this.m_max_height);

        // Result
        return { x: this_group_x, y: 0, width };
    }

    private shift(
        tiles: HTMLButtonElement[],
        to_shift: string,
        place_taker: string,
        place_taker_button: HTMLButtonElement,
        place_side: "left" | "top" | "right" | "bottom"
    ): void
    {
        if (this.m_dir == "horizontal")
            this.horizontal_container_shift(tiles, to_shift, place_taker, place_taker_button, place_side);
        else
            throw new Error("not implemented");
    }

    private horizontal_container_shift(
        tiles: HTMLButtonElement[],
        to_shift: string,
        place_taker: string,
        place_taker_button: HTMLButtonElement,
        place_side: "left" | "top" | "right" | "bottom"
    ): void
    {
        const shifting_tile_button = tiles.find(t => t.getAttribute("data-id") == to_shift);
        if (!shifting_tile_button) return;

        this.contribute_calc_tile(place_taker_button);

        // Make sure to insert place_taker into the group that
        // the tile to be shifted is part from.
        const place_taker_state = this.m_state.tiles.get(place_taker);
        place_taker_state.group = this.m_state.tiles.get(shifting_tile_button.getAttribute("data-id")).group;

        // Misc vars
        const place_taker_w = get_size_width_small(place_taker_state.size);
        const place_taker_h = get_size_height_small(place_taker_state.size);
        const to_shift_state = this.m_state.tiles.get(to_shift);
        const { w: to_shift_w, h: to_shift_h } = this.m_tiles.get(to_shift);

        switch (place_side)
        {
            case "left":
            case "right":
            {
                // Move tile to either left or right if there is
                // space available.
                let shift_to: "left" | "right" | null = null;
                let left_available = false, right_available = false;
                if (!(place_taker_w > to_shift_w || place_taker_h > to_shift_h))
                {
                    if (
                        this.m_rows.sizeFreeAt(to_shift_state.x + place_taker_w, to_shift_state.y, to_shift_state.size) &&
                        to_shift_state.x + place_taker_w + to_shift_w < this.m_rows.width
                    ) {
                        right_available = true;
                    }
                    if (this.m_rows.sizeFreeAt(to_shift_state.x - to_shift_w, to_shift_state.y, to_shift_state.size))
                    {
                        left_available = true;
                    }
                }

                if (place_side == "left")
                    shift_to = right_available ? "right" : null;
                else shift_to = left_available ? "left" : null;

                if (shift_to == "left")
                {
                    // shift tile to left
                    const place_taker_new_horizontal = to_shift_state.x;
                    this.m_rows.clearSize(to_shift_state.x, to_shift_state.y, to_shift_state.size);
                    this.m_rows.fillSize(to_shift_state.x - to_shift_w, to_shift_state.y, to_shift_state.size);
                    this.set_real_position(to_shift, to_shift_state.x - to_shift_w, to_shift_state.y);
                    this.set_real_position(place_taker, place_taker_new_horizontal, to_shift_state.y);
                }
                else if (shift_to == "right")
                {
                    // shift tile to right
                    const place_taker_new_horizontal = to_shift_state.x;
                    this.m_rows.clearSize(to_shift_state.x, to_shift_state.y, to_shift_state.size);
                    this.m_rows.fillSize(to_shift_state.x + place_taker_w, to_shift_state.y, to_shift_state.size);
                    this.set_real_position(to_shift, to_shift_state.x + place_taker_w, to_shift_state.y);
                    this.set_real_position(place_taker, place_taker_new_horizontal, to_shift_state.y);
                }

                break;
            }
            case "top":
            {
                // shift tiles to bottom recursively.
                let x = to_shift_state.x,
                    y = to_shift_state.y;
                if (y + place_taker_h >= this.m_rows.max_height)
                {
                    return;
                }
                this.set_real_position(place_taker, x, y);

                // Set previously taken size to that of place_taker
                const prev_taken_h = place_taker_h;

                this.horizontal_container_shift_bottom(
                    to_shift,
                    prev_taken_h,
                    [place_taker]
                );
                break;
            }
            case "bottom":
            {
                // Ignore bottom-to-top shift for now.
                //
                // in case it is implemented in the future:
                //
                // detection: here it may be impossible to shift to top
                // in circumstances where there is no free space
                // (consequently the take placer may also not take any space).
                break;
            }
        }
    }

    /**
     * @param t1 Tile to shift.
     * @param prev_taken_h Previously taken height
     */
    private horizontal_container_shift_bottom(
        t1: string,
        prev_taken_h: number,
        prev: string[]
    ): void {

        // vars
        const t1_s = this.m_state.tiles.get(t1);
        const { w: t1_w, h: t1_h } = this.m_tiles.get(t1);

        // shift t1 (x, y)
        let t1_new_x = t1_s.x,
            t1_new_y = t1_s.y + prev_taken_h;

        if (!this.m_rows.sizeFreeAt(t1_new_x, t1_new_y, t1_s.size))
        {
            if (t1_new_y + t1_h >= this.m_rows.max_height)
            {
                t1_new_x += t1_w;
                t1_new_y = 0;
            }
            if (!this.m_rows.sizeFreeAt(t1_new_x, t1_new_y, t1_s.size))
            {
                // find the next tile(s) to shift bottom.
                // here it may be like a group of small tiles
                // to shift together, or one large tile.
                // (do not look for tiles that are being actively dragged or
                // tiles that are being shifted already.)
                const next_tiles: string[] = [];
                for (const [tile, tile_p] of this.m_tiles)
                {
                    const overlap = getRectangleOverlap(
                        { x: t1_new_x, y: t1_new_y, width: t1_w, height: t1_h },
                        { x: tile_p.x, y: tile_p.y, width: tile_p.w, height: tile_p.h }
                    );
                    if (overlap && tile_p.button.getAttribute("data-dragging") != "true" && prev.indexOf(tile) == -1)
                    {
                        next_tiles.push(tile);
                    }
                }
                for (const t2 of next_tiles)
                {
                    const new_prev = prev.slice(0);
                    new_prev.push(t1);
                    this.horizontal_container_shift_bottom(
                        t2,
                        t1_h,
                        new_prev,
                    );
                }
            }
        }
        this.set_real_position(t1, t1_new_x, t1_new_y);
    }

    private page_x_to_x(x: number): number {
        if (this.m_dir == "horizontal")
            return this.horizontal_container_page_x_to_x(x);
        else
            throw new Error("not implemented");
    }

    private page_y_to_y(y: number): number {
        if (this.m_dir == "horizontal")
            return this.horizontal_container_page_y_to_y(y);
        else
            throw new Error("not implemented");
    }

    private forced_page_x_to_x(x: number): number {
        if (this.m_dir == "horizontal")
            return this.horizontal_container_forced_page_x_to_x(x);
        else
            throw new Error("does not make sense");
    }

    private forced_page_y_to_y(y: number): number {
        if (this.m_dir == "horizontal")
            throw new Error("does not make sense");
        else
            throw new Error("not implemented");
    }

    private horizontal_container_page_x_to_x(x: number): number
    {
        // return -1 if not fitting
        const { m_group_x: group_x } = this;
        const { m_tile_gap_px: tile_gap_px } = this;
        const { small_w, wide_w } = this.m_tile_widthheight_px;
        const radius = small_w / 2;
        if (x < group_x - radius) return -1;
        let w = this.m_rows.width == 0 ? 0 : (this.m_rows.width * small_w) + ((this.m_rows.width - 1) * tile_gap_px);
        w = Math.max(w, wide_w);
        if (x > group_x + w + radius) return -1;
        for (let gx = group_x, j = 0, lim = group_x + w; gx < lim; j++)
        {
            if (x < gx + small_w / 2) return j;
            if (j != 0) gx += tile_gap_px;
            gx += small_w;
        }
        return this.m_rows.width;
    }

    private horizontal_container_forced_page_x_to_x(x: number): number
    {
        // return -1 if not fitting
        const { m_group_x: group_x } = this;
        const { m_tile_gap_px: tile_gap_px } = this;
        const { small_w } = this.m_tile_widthheight_px;
        const radius = small_w / 2;
        if (x < group_x - radius) return -1;
        for (let gx = group_x, j = 0; gx < 0x7FFFFF; j++)
        {
            if (x < gx + small_w / 2) return j;
            if (j != 0) gx += tile_gap_px;
            gx += small_w;
        }
        return -1;
    }

    private horizontal_container_page_y_to_y(y: number): number
    {
        // return -1 if not fitting
        const { m_tile_gap_px: tile_gap_px } = this;
        const { small_h } = this.m_tile_widthheight_px;
        const group_y = this.m_label_height * this.m_rem;
        const radius = small_h / 2;
        if (y < group_y - radius) return -1;
        const h = this.m_rows.max_height == 0 ? 0: (this.m_rows.max_height * small_h) * ((this.m_rows.max_height - 1) * tile_gap_px);
        if (y > group_y + h + radius) return -1;
        for (let gy = group_y, j = 0, lim = group_y + h; gy < lim; j++)
        {
            if (y < gy + small_h / 2) return j;
            if (j != 0) gy += tile_gap_px;
            gy += small_h;
        }
        return this.m_rows.height;
    }
}

type RearrangeOptions = {
    restore?: boolean,
    /** Tile ID. */
    restore_except?: string,

    shift?: boolean,
    /** Tile ID. */
    to_shift?: string,
    /** Tile ID. */
    place_taker?: string,
    place_side?: "left" | "right" | "top" | "bottom",

    grid_snap?: boolean,
    /** Tile ID. */
    grid_snap_tile?: string,
};