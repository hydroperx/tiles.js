import { Layout } from "./Layout";
import type { Tiles } from ".";

export class VerticalLayout extends Layout
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
        throw new Error("not implemented");
    }

    override offset_x_to_x(x: number): { group: string, x: number } | null
    {
        throw new Error("not implemented");
    }

    override offset_y_to_y(y: number): { group: string, y: number } | null
    {
        throw new Error("not implemented");
    }

    override forced_offset_x_to_x(x: number): { group: string, x: number } | null
    {
        throw new Error("does not make sense");
    }

    override forced_offset_y_to_y(y: number): { group: string, y: number } | null
    {
        throw new Error("not implemented");
    }

    override readjust_groups(): void
    {
        let y = 0;
        for (const group of this.groups)
        {
            const label_y = y;
            y += this.$._label_height
            const h = Math.max(this.$._tile_size.large_h, group.height == 0 ? 0 : group.height * this.$._tile_size.small_h + (group.height - 1) * this.$._tile_gap)
                + this.$._group_gap;

            // position each tile
            for (const tile of group.tiles)
            {
                // ... or not if being dragged.
                if (tile.button.getAttribute("data-dragging") === "true") continue;

                const btn_x = tile.x * this.$._tile_size.small_w + tile.x * this.$._tile_gap;
                const btn_y = y + this.$._label_height + tile.y * this.$._tile_size.small_h + tile.y * this.$._tile_gap;
                tile.button.style.translate = `${btn_x}rem ${btn_y}rem`;
            }

            // position the label
            group.label.style.translate = `0rem ${label_y}rem`;
            group.label.style.width = `100%`;
            group.label.style.height = `${this.$._label_height}rem`;

            // move on to next group
            y += h;
        }

        y += this.$._group_gap * 2;
        this.total_offset_height = y;
        this.$._resize_container();
    }

    override shift(to_shift: string, place_taker: string, place_side: "left" | "top" | "right" | "bottom"): void
    {
        throw new Error("not implemented");
    }
}