import type { LiveTiles } from ".";
import { TileSizeOfResolution, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";

export abstract class Layout
{
    // sorted groups.
    protected groups: Group[];

    constructor(
        protected $: LiveTiles,
        protected max_width: number,
        protected max_height: number
    ) {
    }
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
}

class Group
{
    tiles: Tile[];
    private _width: number = 0;
    private _height: number = 0;

    constructor(public label: HTMLDivElement)
    {
    }

    add(tile: Tile): void
    {
        fixme();
    }
}

class Tile
{
    constructor(
        public button: HTMLButtonElement,
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {
    }
}