import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";

import type { LiveTiles } from ".";
import { TileSizeOfResolution, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";

export abstract class Layout
{
    // sorted groups.
    protected groups: Group[];

    constructor(
        public $: LiveTiles,
        public max_width: number,
        public max_height: number
    ) {
    }

    abstract readjust_groups(): void;
}

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

class Group
{
    // random order tiles
    tiles: Tile[];
    private _width: number = 0;
    private _height: number = 0;

    constructor(
        private $: Layout,
        public id: string,
        public label: HTMLDivElement
    ) {
    }

    /** Width in small tiles. */
    get width() { return this._width; }

    /** Height in small tiles.  */
    get height() { return this._height; }

    add(tile: Tile): boolean
    {
        if (this.$ instanceof HorizontalLayout)
        {
            a: for (;;)
            {
                for (const other of this.tiles)
                {
                    const overlap = getRectangleOverlap(tile, other);
                    if (overlap && overlap.area != 0)
                    {
                        if (tile.y + 1 >= this.$.max_height)
                            tile.x++,
                            tile.y = 0;
                        else tile.y++;
                        continue a;
                    }
                }
                break;
            }
        }
        else
        {
            a: for (;;)
            {
                for (const other of this.tiles)
                {
                    const overlap = getRectangleOverlap(tile, other);
                    if (overlap && overlap.area != 0)
                    {
                        if (tile.x + 1 >= this.$.max_width)
                        {
                            if (tile.y + 1 >= this.$.max_height)
                            {
                                return false;
                            }
                            tile.x = 0;
                            tile.y++;
                        }
                        else tile.x++;
                        continue a;
                    }
                }
                break;
            }
        }

        this.tiles.push(tile);

        // Resize
        this._resize();

        // Move next groups
        this.$.readjust_groups();

        return true;
    }

    remove(tileId: string): boolean
    {
        for (let i = 0, l = this.tiles.length; i !== l; i++)
        {
            if (this.tiles[i].id === tileId)
            {
                this.tiles.splice(i, 1);
                this._resize();
                this.$.readjust_groups();
                return true;
            }
        }
        return false;
    }

    willFit(x: number, y: number, w: number, h: number): boolean
    {
        fixme();
    }

    immediatelyAbove(titleId: string): string[]
    {
        fixme();
    }

    immediatelyBelow(titleId: string): string[]
    {
        fixme();
    }

    private _resize(): void
    {
        this._width = Math.max.apply(null, this.tiles.map(t => t.x + t.width).concat(0));
        this._height = Math.max.apply(null, this.tiles.map(t => t.y + t.height).concat(0));
    }
}

class Tile
{
    constructor(
        public id: string,
        public button: HTMLButtonElement,
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {
    }
}