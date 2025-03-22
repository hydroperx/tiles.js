import getRectangleOverlap from "rectangle-overlap";
import getOffset from "getoffset";

import { Group, Layout, Tile } from "./Layout";
import type { Tiles } from ".";
import { get_size_height_small, get_size_width_small } from "./enum/TileSize";
import { random_hex_large } from "./utils/random";

export class HorizontalLayout extends Layout
{
    constructor(
        $: Tiles,
        max_width: number,
        max_height: number
    ) {
        super($, max_width, max_height);
    }

    override snap_to_grid(tile: string, el: HTMLElement): void
    {
        let { x: dropped_x, y: dropped_y } = getOffset(el, this.$._scroll_node);
        dropped_x = dropped_x / this.$._rem;
        dropped_y = dropped_y / this.$._rem;
        const prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == tile));
        const tile_state = this.$._state.tiles.get(tile);
        const tile_data = (prev_group ? prev_group.tiles.find(t => t.id == tile) : null)
            ?? new Tile(tile, el as HTMLButtonElement, tile_state.x, tile_state.y, get_size_width_small(tile_state.size), get_size_height_small(tile_state.size));

        let x = this.offset_x_to_x(dropped_x),
            y = this.offset_y_to_y(dropped_y);
        
        if (!x)
            x = this.forced_offset_x_to_x(dropped_x);

        if (x && y)
        {
            if (x.group == "")
            {
                // insert new group
                const group_id = "auto$" + random_hex_large();
                this.$.addGroup({
                    id: group_id,
                    index: -1,
                    label: "",
                });
                const new_group = this.groups.find(g => g.id == group_id);

                // Insert tile
                if (new_group.is_area_available(x.x, y.y, tile_data.width, tile_data.height))
                {
                    if (prev_group)
                        prev_group.remove(tile),
                        prev_group.auto_self_removal();
                    tile_data.x = x.x;
                    tile_data.y = y.y;

                    tile_state.x = x.x;
                    tile_state.y = y.y;
                    tile_state.group = group_id;

                    new_group.add(tile_data);
                }
            }
            else
            {
                const new_group = this.groups.find(g => g.id == x.group);
                if (prev_group)
                    prev_group.remove(tile);
                if (new_group.is_area_available(x.x, y.y, tile_data.width, tile_data.height))
                {
                    if (new_group !== prev_group)
                        prev_group.auto_self_removal();

                    tile_data.x = x.x;
                    tile_data.y = y.y;

                    tile_state.x = x.x;
                    tile_state.y = y.y;
                    tile_state.group = x.group;

                    new_group.add(tile_data);
                }
                else if (prev_group)
                    prev_group.add(tile_data);
            }
        }

        this.$._readjust_groups_delayed();
    }

    override offset_x_to_x(x: number): { group: string, x: number } | null
    {
        let group_x = 0;
        const small_w = this.$._small_size;
        const r = small_w / 2;
        const tile_gap = this.$._tile_gap;
        const group_gap = this.$._group_gap;

        for (const group of this.groups)
        {
            const w = Math.max(this.$._tile_size.large_w, group.width == 0 ? 0 : group.width * small_w + (group.width - 1) * tile_gap)
                + group_gap;

            if (x < group_x - r) return null;
            if (x > group_x + w) continue;

            for (let gx = group_x, j = 0, lim = group_x + w - r; gx < lim; j++)
            {
                if (x < gx + small_w / 2) return { group: group.id, x: j };
                gx += tile_gap + small_w;
            }

            // move on to next group
            group_x += w;
        }

        return null;
    }

    override offset_y_to_y(y: number): { group: string, y: number } | null
    {
        const group_y = this.$._label_height;
        const radius = this.$._small_size;
        const small_h = this.$._small_size;
        const tile_gap = this.$._tile_gap;

        if (y < group_y - radius) return null;
        const h = this.max_height == 0 ? 0 : (this.max_height * small_h) * ((this.max_height - 1) * tile_gap);
        if (y > group_y + h + radius) return null;

        for (let gy = group_y, j = 0, lim = group_y + h; gy < lim; j++)
        {
            if (y < gy + small_h / 2) return { group: "", y: j };
            gy += tile_gap + small_h;
        }
        return { group: "", y: this.max_height };
    }

    override forced_offset_x_to_x(x: number): { group: string, x: number } | null
    {
        let group_x = 0;
        const small_w = this.$._small_size;
        const r = small_w / 2;
        const tile_gap = this.$._tile_gap;
        const group_gap = this.$._group_gap;

        for (const group of this.groups)
        {
            const w = Math.max(this.$._tile_size.large_w, group.width == 0 ? 0 : group.width * small_w + (group.width - 1) * tile_gap)
                + group_gap;

            if (x < group_x - r) return null;

            for (let gx = group_x, j = 0, lim = group_x + w - r; gx < lim; j++)
            {
                if (x < gx + small_w / 2) return { group: group.id, x: j };
                gx += tile_gap + small_w;
            }

            // move on to next group
            group_x += w;
        }

        // New group
        for (let gx = group_x, j = 0; gx < 0x7FFFFFFF; j++)
        {
            if (x < gx + small_w / 2) return { group: "", x: j };
            gx += tile_gap;
            gx += small_w;
        }

        return null;
    }

    override forced_offset_y_to_y(y: number): { group: string, y: number } | null
    {
        throw new Error("does not make sense");
    }

    override readjust_groups(): void
    {
        let x = 0,
            y = this.$._label_height;
        for (const group of this.groups)
        {
            const label_x = x;
            const w = Math.max(this.$._tile_size.large_w, group.width == 0 ? 0 : group.width * this.$._tile_size.small_w + (group.width - 1) * this.$._tile_gap)
                + this.$._group_gap;
            // position each tile
            for (const tile of group.tiles)
            {
                // ... or not if being dragged.
                if (tile.button.getAttribute("data-dragging") === "true") continue;

                const btn_x = x + tile.x * this.$._tile_size.small_w + tile.x * this.$._tile_gap;
                const btn_y = y + tile.y * this.$._tile_size.small_h + tile.y * this.$._tile_gap;
                tile.button.style.translate = `${btn_x}rem ${btn_y}rem`;
            }

            // position the label
            group.label.style.translate = `${label_x}rem ${y - this.$._label_height}rem`;
            group.label.style.width = `${w}rem`;
            group.label.style.height = `${this.$._label_height}rem`;

            // move on to next group
            x += w;
        }

        x += this.$._group_gap * 2;
        this.total_offset_width = x;
        this.$._resize_container();
    }

    override shift(to_shift: string, place_taker: string, place_side: "left" | "top" | "right" | "bottom"): void
    {
        const group = this.groups.find(g => !!g.tiles.find(t => t.id == to_shift))!;

        const shifting_tile_button = group.tiles.find(t => t.id == to_shift);
        if (!shifting_tile_button) return;

        // Make sure to insert place_taker into the group that
        // the tile to be shifted is part from.
        const place_taker_state = this.$._state.tiles.get(place_taker);

        // Misc vars
        const place_taker_w = get_size_width_small(place_taker_state.size);
        const place_taker_h = get_size_height_small(place_taker_state.size);
        const to_shift_state = this.$._state.tiles.get(to_shift);
        const to_shift_tile = group.tiles.find(t => t.id == to_shift)!;
        const { width: to_shift_w, height: to_shift_h } = to_shift_tile;

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
                        group.is_area_available(to_shift_state.x + place_taker_w, to_shift_state.y, to_shift_w, to_shift_h) &&
                        to_shift_state.x + place_taker_w + to_shift_w < group.width
                    ) {
                        right_available = true;
                    }
                    if (group.is_area_available(to_shift_state.x - to_shift_w, to_shift_state.y, to_shift_w, to_shift_h))
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
                    group.clear_area(to_shift_state.x, to_shift_state.y, to_shift_w, to_shift_h);
                    to_shift_tile.x = to_shift_state.x - to_shift_w;
                    to_shift_tile.y = to_shift_state.y;
                    to_shift_state.x = to_shift_tile.x;
                    to_shift_state.y = to_shift_tile.y;
                    group.add(to_shift_tile);
                    place_taker_state.group = this.$._state.tiles.get(to_shift).group;

                    // remove from previous group and insert into new group
                    const place_taker_new_x = to_shift_state.x;
                    const place_taker_prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == place_taker));
                    const place_taker_tile = place_taker_prev_group.tiles.find(t => t.id == place_taker);
                    place_taker_prev_group?.remove(place_taker);
                    place_taker_prev_group?.auto_self_removal();
                    place_taker_tile.x = place_taker_new_x;
                    place_taker_tile.y = to_shift_state.y;

                    place_taker_state.x = place_taker_tile.x;
                    place_taker_state.y = place_taker_tile.y;
                    place_taker_state.group = group.id;

                    group.add(place_taker_tile);
                }
                else if (shift_to == "right")
                {
                    // shift tile to right
                    group.clear_area(to_shift_state.x, to_shift_state.y, to_shift_w, to_shift_h);
                    to_shift_tile.x = to_shift_state.x + place_taker_w;
                    to_shift_tile.y = to_shift_state.y;
                    to_shift_state.x = to_shift_tile.x;
                    to_shift_state.y = to_shift_tile.y;
                    group.add(to_shift_tile);

                    // remove from previous group and insert into new group
                    const place_taker_new_x = to_shift_state.x;
                    const place_taker_prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == place_taker));
                    const place_taker_tile = place_taker_prev_group.tiles.find(t => t.id == place_taker);
                    place_taker_prev_group?.remove(place_taker);
                    place_taker_prev_group?.auto_self_removal();
                    place_taker_tile.x = place_taker_new_x;
                    place_taker_tile.y = to_shift_state.y;

                    place_taker_state.x = place_taker_tile.x;
                    place_taker_state.y = place_taker_tile.y;
                    place_taker_state.group = group.id;

                    group.add(place_taker_tile);
                }

                break;
            }
            case "top":
            {
                // shift tiles to bottom recursively.
                let x = to_shift_state.x,
                    y = to_shift_state.y;
                if (y + place_taker_h >= this.max_height)
                {
                    return;
                }

                // remove from previous group and insert into new group
                const place_taker_prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == place_taker));
                const place_taker_tile = place_taker_prev_group.tiles.find(t => t.id == place_taker);
                place_taker_prev_group?.remove(place_taker);
                place_taker_prev_group?.auto_self_removal();
                place_taker_tile.x = x;
                place_taker_tile.y = y;

                place_taker_state.x = place_taker_tile.x;
                place_taker_state.y = place_taker_tile.y;
                place_taker_state.group = group.id;

                group.add(place_taker_tile);

                // Initial previously taken size is that of place_taker
                const prev_taken_h = place_taker_h;

                this.shift_bottom(to_shift, prev_taken_h, [place_taker], group);
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

        this.readjust_groups();
    }

    /**
     * @param t1 Tile to shift.
     * @param prev_taken_h Previously taken height
     */
    private shift_bottom(
        t1: string,
        prev_taken_h: number,
        prev: string[],
        group: Group
    ): void {

        // vars
        const t1_data = group.tiles.find(t => t.id == t1)!;
        const t1_state = this.$._state.tiles.get(t1)!;
        const { width: t1_w, height: t1_h } = t1_data;

        // shift t1 (x, y)
        let t1_new_x = t1_data.x,
            t1_new_y = t1_data.y + prev_taken_h;

        if (!group.is_area_available(t1_new_x, t1_new_y, t1_data.width, t1_data.height))
        {
            if (t1_new_y + t1_h >= this.max_height)
            {
                t1_new_x += t1_w;
                t1_new_y = 0;
            }
            if (!group.is_area_available(t1_new_x, t1_new_y, t1_data.width, t1_data.height))
            {
                // find the next tile(s) to shift bottom.
                // here it may be like a group of small tiles
                // to shift together, or one large tile.
                // (do not look for tiles that are being actively dragged or
                // tiles that are being shifted already.)
                const next_tiles: string[] = [];
                for (const tile of group.tiles)
                {
                    const overlap = getRectangleOverlap(
                        { x: t1_new_x, y: t1_new_y, width: t1_w, height: t1_h },
                        { x: tile.x, y: tile.y, width: tile.width, height: tile.height }
                    );
                    if (overlap && overlap.area != 0 && tile.button.getAttribute("data-dragging") != "true" && prev.indexOf(tile.id) == -1)
                    {
                        next_tiles.push(tile.id);
                    }
                }
                for (const t2 of next_tiles)
                {
                    const new_prev = prev.slice(0);
                    new_prev.push(t1);
                    this.shift_bottom(
                        t2,
                        t1_h,
                        new_prev,
                        group
                    );
                }
            }
        }
        group.remove(t1);
        t1_data.x = t1_new_x;
        t1_data.x = t1_new_y;
        t1_state.x = t1_data.x;
        t1_state.y = t1_data.y;
        group.add(t1_data);
    }
}