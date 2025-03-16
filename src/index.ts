import { RemObserver } from "./utils/RemObserver";
import { TileSize$widthheight, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";
import { random_hex_large } from "./utils/random";
import { Rows } from "./Rows";
import { TileExpertState } from "./TileExpertState";
import assert from "assert";

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
         * Maximum width in small tiles.
         */
        maxWidth?: number,

        /**
         * Maximum height in small tiles.
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

    private contribute_calc_tile(button: HTMLButtonElement, state: TileExpertState)
    {
        const id = button.getAttribute("data-id");
        const tile_state = state.tiles.get(id);
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