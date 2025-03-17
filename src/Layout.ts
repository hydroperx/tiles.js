import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";

import type { LiveTiles } from ".";
import { TileSizeOfResolution, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";

export abstract class Layout
{
    // sorted groups.
    public groups: Group[];

    public horizontal: boolean;

    constructor(
        public $: LiveTiles,
        public max_width: number,
        public max_height: number
    ) {
        this.horizontal = $._dir == "horizontal";
    }

    abstract readjust_groups(): void;
}

export class Group
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
        if (this.$.horizontal)
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

    will_fit(x: number, y: number, w: number, h: number): boolean
    {
        for (const other of this.tiles)
        {
            const overlap = getRectangleOverlap({ x, y, width: w, height: h }, other);
            if (overlap && overlap.area != 0)
            {
                return false;
            }
        }
        return true;
    }

    immediately_above(titleId: string): string[]
    {
        fixme();
    }

    immediately_below(titleId: string): string[]
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