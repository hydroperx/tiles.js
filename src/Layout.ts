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

    abstract snap_to_grid(tile: string, el: HTMLElement): void;

    abstract shift(to_shift: string, place_taker: string, place_side: "left" | "top" | "right" | "bottom"): void;

    abstract offset_x_to_x(x: number): { group: string, x: number } | null;
    abstract offset_y_to_y(y: number): { group: string, y: number } | null;
    abstract forced_offset_x_to_x(x: number): { group: string, x: number } | null;
    abstract forced_offset_y_to_y(y: number): { group: string, y: number } | null;
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
            return false;

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

        // Trigger state update
        this.$.$._trigger_state_update();

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
                this.$.$._trigger_state_update();
                return true;
            }
        }
        return false;
    }

    auto_self_removal()
    {
        if (this.tiles.length == 0)
            this.self_removal();
    }

    self_removal()
    {
        const i = this.$.groups.indexOf(this);
        if (i == -1) return;
        this.label.remove();
        this.$.groups.splice(i, 1);
        this.$.$._state.groups.delete(this.id);
        this.$.$._keep_groups_sequential();
        this.$.$._trigger_state_update();
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

    last_tile_position(): [number, number]
    {
        let max_horizontal_tiles: Tile[] = [];
        t: for (const tile of this.tiles)
        {
            for (const other of max_horizontal_tiles)
            {
                if (tile.x > other.x)
                    max_horizontal_tiles.length = 0,
                    max_horizontal_tiles.push(tile);
                else if (tile.x == other.x)
                    max_horizontal_tiles.push(tile);
                else continue t;
            }
        }
        const x = max_horizontal_tiles.length == 0 ? 0 : max_horizontal_tiles[max_horizontal_tiles.length - 1].x;
        const y = Math.max.apply(null, max_horizontal_tiles.map(t => t.y).concat(0));
        return [x, y];
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