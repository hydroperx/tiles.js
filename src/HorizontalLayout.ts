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
}