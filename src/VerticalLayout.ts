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

    override readjust_groups(): void
    {
        let y = 0;
        for (const group of this.groups)
        {
            const label_y = y;
            const h = group.height * this.$._tile_size.small_h + group.height * this.$._tile_gap;
            y += h;

            // position each tile
            for (const tile of group.tiles)
            {
                const btn_x = tile.x * this.$._tile_size.small_w + tile.x * this.$._tile_gap;
                const btn_y = this.$._label_height + tile.y * this.$._tile_size.small_h + tile.y * this.$._tile_gap;
                tile.button.style.translate = `${btn_x}rem ${btn_y}rem`;
            }

            // position the label
            group.label.style.translate = `0rem ${label_y}rem`;
            group.label.style.width = `100%`;
            group.label.style.height = `${this.$._label_height}rem`;

            // move on to next group
            y += this.$._group_gap + this.$._label_height;
        }
    }
}