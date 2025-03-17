import { Layout } from "./Layout";
import type { LiveTiles } from ".";

export class HorizontalLayout extends Layout
{
    constructor(
        $: LiveTiles,
        max_width: number,
        max_height: number
    ) {
        super($, max_width, max_height);
    }

    override readjust_groups(): void
    {
        let x = 0,
            y = this.$._label_height;
        for (const group of this.groups)
        {
            const label_x = x;
            const w = group.width * this.$._tile_size.small_w + group.width * this.$._tile_gap;
            x += w;

            // position each tile
            for (const tile of group.tiles)
            {
                const btn_x = tile.x * this.$._tile_size.small_w + tile.x * this.$._tile_gap;
                const btn_y = y + tile.y * this.$._tile_size.small_h + tile.y * this.$._tile_gap;
                tile.button.style.translate = `${btn_x}rem ${btn_y}rem`;
            }

            // position the label
            group.label.style.translate = `${label_x}rem ${y}rem`;
            group.label.style.width = `${w}rem`;
            group.label.style.height = `${this.$._label_height}rem`;

            // move on to next group
            x += this.$._group_gap;
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
                    place_taker_state.group = this.$._state.tiles.get(to_shift).group;
                    // remove from previous group and insert into group
                    fixme();
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
                else place_taker_state.group = k_place_taker_group;

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

                place_taker_state.group = k_place_taker_group;
                break;
            }
        }

        this.readjust_groups();
    }
}