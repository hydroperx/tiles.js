import getRectangleOverlap from "rectangle-overlap";
import { mouse } from "getoffset";

import { Group, Layout } from "./Layout";
import type { LiveTiles } from ".";
import { get_size_height_small, get_size_width_small } from "./enum/TileSize";
import { random_hex_large } from "./utils/random";

export class HorizontalLayout extends Layout
{
    constructor(
        $: LiveTiles,
        max_width: number,
        max_height: number
    ) {
        super($, max_width, max_height);
    }

    override snap_to_grid(tile: string, event: Event): void
    {
        const { clientX: pointer_x, clientY: pointer_y } = event as MouseEvent;
        const prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == tile));
        const tile_data = prev_group.tiles.find(t => t.id == tile);

        let x = this.client_x_to_x(pointer_x),
            y = this.client_y_to_y(pointer_y);
        
        if (!x)
            x = this.forced_client_x_to_x(pointer_x);

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
                prev_group.remove(tile);
                tile_data.x = x.x;
                tile_data.y = y.y;
                new_group.add(tile_data);
            }
            else
            {
                const new_group = this.groups.find(g => g.id == x.group);
                if (new_group.is_area_available(x.x, y.y, tile_data.width, tile_data.height))
                {
                    prev_group.remove(tile);
                    tile_data.x = x.x;
                    tile_data.y = y.y;
                    new_group.add(tile_data);
                }
            }
        }

        this.$._readjust_groups_delayed();
    }

    override client_x_to_x(x: number): { group: string, x: number } | null
    {
        [x] = mouse({ clientX: x, clientY: 0 }, this.$._container, this.$._scroll_node);
        let group_x = 0;
        const radius = this.$._small_size * this.$._rem;
        const small_w = this.$._small_size * this.$._rem;
        const tile_gap = this.$._tile_gap * this.$._rem;
        const group_gap = this.$._group_gap * this.$._rem;

        for (const group of this.groups)
        {
            const w = Math.max(
                this.$._tile_size.small_w * this.$._rem,
                group.width * (this.$._tile_size.small_w * this.$._rem) + group.width * (this.$._tile_gap * this.$._rem)
            );

            if (x < group_x - radius) return null;
            if (x > group_x + w + radius) continue;

            for (let gx = group_x, j = 0, lim = group_x + w; gx < lim; j++)
            {
                if (x < gx + small_w / 2) return { group: group.id, x: j };
                if (j != 0) gx += tile_gap;
                gx += small_w;
            }

            // move on to next group
            group_x += group_gap + w;
        }

        return null;
    }

    override client_y_to_y(y: number): { group: string, y: number } | null
    {
        [, y] = mouse({ clientX: 0, clientY: y }, this.$._container, this.$._scroll_node);
        const group_y = this.$._label_height * this.$._rem;
        const radius = this.$._small_size * this.$._rem;
        const small_h = this.$._small_size * this.$._rem;
        const tile_gap = this.$._tile_gap * this.$._rem;

        if (y < group_y - radius) return null;
        const h = this.max_height == 0 ? 0 : (this.max_height * small_h) * ((this.max_height - 1) * tile_gap);
        if (y > group_y + h + radius) return null;

        for (let gy = group_y, j = 0, lim = group_y + h; gy < lim; j++)
        {
            if (y < gy + small_h / 2) return { group: "", y: j };
            if (j != 0) gy += tile_gap;
            gy += small_h;
        }
        return { group: "", y: this.max_height };
    }

    override forced_client_x_to_x(x: number): { group: string, x: number } | null
    {
        [x] = mouse({ clientX: x, clientY: 0 }, this.$._container, this.$._scroll_node);
        let group_x = 0;
        const radius = this.$._small_size * this.$._rem;
        const small_w = this.$._small_size * this.$._rem;
        const tile_gap = this.$._tile_gap * this.$._rem;
        const group_gap = this.$._group_gap * this.$._rem;

        for (const group of this.groups)
        {
            const w = Math.max(
                this.$._tile_size.small_w * this.$._rem,
                group.width * (this.$._tile_size.small_w * this.$._rem) + group.width * (this.$._tile_gap * this.$._rem)
            );

            if (x < group_x - radius) return null;

            for (let gx = group_x, j = 0, lim = group_x + w; gx < lim; j++)
            {
                if (x < gx + small_w / 2) return { group: group.id, x: j };
                if (j != 0) gx += tile_gap;
                gx += small_w;
            }

            // move on to next group
            group_x += group_gap + w;
        }

        // New group
        for (let gx = group_x, j = 0; gx < 0x7FFFFFFF; j++)
        {
            if (x < gx + small_w / 2) return { group: "", x: j };
            if (j != 0) gx += tile_gap;
            gx += small_w;
        }

        return null;
    }

    override forced_client_y_to_y(y: number): { group: string, y: number } | null
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
            const w = Math.max(this.$._tile_size.small_w, group.width * this.$._tile_size.small_w + group.width * this.$._tile_gap);

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
            group.label.style.translate = `${label_x}rem ${y}rem`;
            group.label.style.width = `${w}rem`;
            group.label.style.height = `${this.$._label_height}rem`;

            // move on to next group
            x += w + this.$._group_gap;
        }
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
                    group.add(to_shift_tile);
                    place_taker_state.group = this.$._state.tiles.get(to_shift).group;

                    // remove from previous group and insert into new group
                    const place_taker_new_x = to_shift_state.x;
                    const place_taker_prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == place_taker));
                    const place_taker_tile = place_taker_prev_group.tiles.find(t => t.id == place_taker);
                    place_taker_prev_group?.remove(place_taker);
                    place_taker_tile.x = place_taker_new_x;
                    place_taker_tile.y = to_shift_state.y;
                    group.add(place_taker_tile);
                }
                else if (shift_to == "right")
                {
                    // shift tile to right
                    group.clear_area(to_shift_state.x, to_shift_state.y, to_shift_w, to_shift_h);
                    to_shift_tile.x = to_shift_state.x + place_taker_w;
                    to_shift_tile.y = to_shift_state.y;
                    group.add(to_shift_tile);

                    // remove from previous group and insert into new group
                    const place_taker_new_x = to_shift_state.x;
                    const place_taker_prev_group = this.groups.find(g => !!g.tiles.find(t => t.id == place_taker));
                    const place_taker_tile = place_taker_prev_group.tiles.find(t => t.id == place_taker);
                    place_taker_prev_group?.remove(place_taker);
                    place_taker_tile.x = place_taker_new_x;
                    place_taker_tile.y = to_shift_state.y;
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
                place_taker_tile.x = x;
                place_taker_tile.y = y;
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
        group.add(t1_data);
    }
}