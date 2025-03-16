import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";

import { RemObserver } from "./utils/RemObserver";
import { TileSize$widthheight, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";
import { random_hex_large } from "./utils/random";
import { Rows } from "./Rows";
import { TileExpertState } from "./TileExpertState";

export { type TileSize } from "./enum/TileSize";
export * from "./TileExpertState";

export class TileExpert
{
    private m_state: TileExpertState;

    private m_container: HTMLElement;
    private m_dir: "horizontal" | "vertical";
    private m_label_class_name: string;
    private m_tile_class_name: string;
    private m_small_size: number;
    private m_tile_gap: number;
    private m_group_gap: number;
    private m_group_label_height: number;
    private m_max_width: number;
    private m_max_height: number;

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
         * Container. The cascading "position" is automatically set to "relative",
         * as tiles are positioned through the "left" and "top" properties.
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
        groupLabelHeight: number,

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
    }) {
        this.m_container = options.element as HTMLElement;
        this.m_dir = options.direction;
        this.m_label_class_name = options.labelClassName;
        this.m_tile_class_name = options.tileClassName;
        this.m_small_size = options.smallSize;
        this.m_tile_gap = options.tileGap;
        this.m_group_gap = options.groupGap;
        this.m_group_label_height = options.groupLabelHeight;
        this.m_max_width = options.maxWidth ?? Infinity;
        this.m_max_height = options.maxHeight ?? Infinity;

        this.m_tile_widthheight_rem.small_w = this.m_small_size;
        this.m_tile_widthheight_rem.small_h = this.m_small_size;
        this.m_tile_widthheight_rem.medium_w = this.m_small_size * 2 + this.m_tile_gap;
        this.m_tile_widthheight_rem.medium_h = this.m_tile_widthheight_rem.medium_w;
        this.m_tile_widthheight_rem.wide_w = this.m_tile_widthheight_rem.medium_w * 2 + this.m_tile_gap;
        this.m_tile_widthheight_rem.wide_h = this.m_tile_widthheight_rem.medium_w;
        this.m_tile_widthheight_rem.large_w = this.m_tile_widthheight_rem.wide_w;
        this.m_tile_widthheight_rem.large_h = this.m_tile_widthheight_rem.wide_h;

        // Observe the "rem" unit size
        this.m_rem_observer = new RemObserver(val => {
            this.m_rem = val;
            this.update_px();
        });
        this.m_rearrange_timeout = -1;

        // Update pixel measurements
        this.update_px();
    }

    destroy()
    {
        this.m_rem_observer.cleanup();
        this.m_container.remove();
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

    private rearrange_delayed(options: RearrangeOptions): void
    {
        if (this.m_rearrange_timeout != -1)
            window.clearTimeout(this.m_rearrange_timeout);
        this.m_rearrange_timeout = window.setTimeout(this.rearrange_immediate.bind(this), 10);
    }

    private rearrange_immediate({
        //
    }: RearrangeOptions) {
        this.m_rearrange_timeout = -1;

        fixme();
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
        if (button.getAttribute("data-dragging") != "true")
        {
            const real_x = (this.m_group_x / rem) + (x * small_w) + (x * tile_gap_rem);
            const real_y = (this.m_group_y / rem) + (y * small_h) + (y * tile_gap_rem);
            button.style.translate = `${real_x}rem ${real_y}rem`;
        }
        button.setAttribute("data-x", x.toString());
        button.setAttribute("data-y", y.toString());
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
        const { small_w } = this.m_tile_widthheight_px;

        // Result vars
        const this_group_x = this.m_group_x;
        const width = this.m_rows.width == 0 ? 0 : (this.m_rows.width * small_w) + ((this.m_rows.width - 1) * tile_gap_px);

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

        // Populate tiles
        this.populate_tiles(tiles);
        this.contribute_calc_tile(place_taker_button);

        // Make sure to insert place_taker into the group that
        // the tile to be shifted is part from.
        const place_taker_state = this.m_state.tiles.get(place_taker);
        place_taker_state.group = shifting_tile_button.getAttribute("data-group");
        place_taker_button.setAttribute("data-group", place_taker_state.group);

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

    page_x_to_x(x: number): number {
        if (this.m_dir == "horizontal")
            return this.horizontal_container_page_x_to_x(x);
        else
            throw new Error("not implemented");
    }

    page_y_to_y(y: number): number {
        if (this.m_dir == "horizontal")
            return this.horizontal_container_page_y_to_y(y);
        else
            throw new Error("not implemented");
    }

    horizontal_container_page_x_to_x(x: number): number
    {
        // return -1 if not fitting
        const { m_group_x: group_x } = this;
        const { m_tile_gap_px: tile_gap_px } = this;
        const { small_w } = this.m_tile_widthheight_px;
        const radius = small_w;
        if (x < group_x - radius) return -1;
        const w = this.m_rows.width == 0 ? 0 : (this.m_rows.width * small_w) + ((this.m_rows.width - 1) * tile_gap_px);
        if (x > group_x + w + radius) return -1;
        for (let gx = group_x, j = 0, lim = group_x + w; gx < lim; j++)
        {
            if (x < gx + small_w / 2) return j;
            if (j != 0) gx += tile_gap_px;
            gx += small_w;
        }
        return this.m_rows.width;
    }

    horizontal_container_page_y_to_y(y: number): number
    {
        // return -1 if not fitting
        const { m_tile_gap_px: tile_gap_px } = this;
        const { small_h } = this.m_tile_widthheight_px;
        const group_y = this.m_group_label_height * this.m_rem;
        if (y < group_y) return -1;
        const h = this.m_rows.max_height == 0 ? 0: (this.m_rows.max_height * small_h) * ((this.m_rows.max_height - 1) * tile_gap_px);
        if (y > group_y + h) return -1;
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