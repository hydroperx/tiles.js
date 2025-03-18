import { Layout } from "./Layout";
import type { LiveTiles } from ".";

export class VerticalLayout extends Layout
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
        throw new Error("not implemented");
    }

    override client_x_to_x(x: number): { group: string, x: number } | null
    {
        throw new Error("not implemented");
    }

    override client_y_to_y(y: number): { group: string, y: number } | null
    {
        throw new Error("not implemented");
    }

    override forced_client_x_to_x(x: number): { group: string, x: number } | null
    {
        throw new Error("does not make sense");
    }

    override forced_client_y_to_y(y: number): { group: string, y: number } | null
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
            const h = Math.max(this.$._tile_size.small_h, group.height * this.$._tile_size.small_h + group.height * this.$._tile_gap);

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
            y += h + this.$._group_gap;
        }

        this.total_offset_height = y;
        this.$._resize_container();
    }

    override shift(to_shift: string, place_taker: string, place_side: "left" | "top" | "right" | "bottom"): void
    {
        throw new Error("not implemented");
    }
}