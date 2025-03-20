import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";

import type { Tiles } from ".";
import { TileSizeOfResolution, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";

export abstract class Layout
{
    total_offset_width: number = 0;
    total_offset_height: number = 0;

    // sorted groups.
    groups: Group[] = [];

    horizontal: boolean;

    constructor(
        public $: Tiles,
        public max_width: number,
        public max_height: number
    ) {
        this.horizontal = $._dir == "horizontal";
    }

    abstract readjust_groups(): void;

    abstract snap_to_grid(tile: string, event: Event): void;

    abstract shift(to_shift: string, place_taker: string, place_side: "left" | "top" | "right" | "bottom"): void;

    abstract client_x_to_x(x: number): { group: string, x: number } | null;
    abstract client_y_to_y(y: number): { group: string, y: number } | null;
    abstract forced_client_x_to_x(x: number): { group: string, x: number } | null;
    abstract forced_client_y_to_y(y: number): { group: string, y: number } | null;
}

export class Group
{
    // random order tiles
    tiles: Tile[] = [];
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
        if (tile.x < 0 || tile.x + tile.width > this.$.max_width || tile.y < 0 || tile.y + tile.height > this.$.max_height)
            return console.log("here, x:", tile.x, "y:", tile.y, "w:", tile.width, "h:", tile.height), false;

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
        
        // Update state's position
        const state = this.$.$._state.tiles.get(tile.id);
        state.x = tile.x;
        state.y = tile.y;

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

    clear_area(x: number, y: number, w: number, h: number): void
    {
        for (const other of this.tiles)
        {
            const overlap = getRectangleOverlap({ x, y, width: w, height: h }, other);
            if (overlap && overlap.area != 0)
            {
                this.remove(other.id);
            }
        }
    }

    is_area_available(x: number, y: number, w: number, h: number): boolean
    {
        if (x < 0 || x + w > this.$.max_width || y < 0 || y + h > this.$.max_height)
            return false;

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

    private _resize(): void
    {
        this._width = Math.max.apply(null, this.tiles.map(t => t.x + t.width).concat(0));
        this._height = Math.max.apply(null, this.tiles.map(t => t.y + t.height).concat(0));
    }
}

export class Tile
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