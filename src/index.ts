import assert from "assert";
import getRectangleOverlap from "rectangle-overlap";
import getOffset from "getoffset";
import Draggable from "com.hydroper.domdraggable";

import { RemObserver } from "./utils/RemObserver";
import { TileSizeOfResolution, get_size_width_small, get_size_height_small, TileSize } from "./enum/TileSize";
import { random_hex_large } from "./utils/random";
import { State } from "./State";
import { draggableHitSide } from "./utils/rect";
import { Layout } from "./Layout";
import { HorizontalLayout } from "./HorizontalLayout";
import { VerticalLayout } from "./VerticalLayout";

export { type TileSize } from "./enum/TileSize";
export * from "./State";

export class LiveTiles
{
    /** @private */ _state: State;
    /** @private */ _draggables: WeakMap<HTMLButtonElement, Draggable> = new WeakMap();

    /** @private */ public _container: HTMLElement;
    /** @private */ public _dir: "horizontal" | "vertical";
    /** @private */ public _label_class_name: string;
    /** @private */ public _tile_class_name: string;
    /** @private */ public _small_size: number;
    /** @private */ public _tile_gap: number;
    /** @private */ public _group_gap: number;
    /** @private */ public _label_height: number;
    /** @private */ public _max_width: number;
    /** @private */ public _max_height: number;
    /** @private */ public _tile_transition: string;
    /** @private */ public _scroll_node: HTMLElement;

    /** @private */ public _rem_observer: RemObserver;
    /** @private */ public _rem: number;

    /** @private */
    public _layout: Layout;

    public _tile_size: TileSizeOfResolution = {
        small_w: 0, small_h: 0,
        medium_w: 0, medium_h: 0,
        wide_w: 0, wide_h: 0,
        large_w: 0, large_h: 0,
    };

    constructor(options: {
        /**
         * Container.
         */
        element: Element,
        /**
         * The direction of the tile container.
         */
        direction: "horizontal" | "vertical",
        /**
         * Class name used for identifying group labels.
         */
        labelClassName: string,
        /**
         * Class name used for identifying tiles.
         */
        tileClassName: string,
        /**
         * The size of small tiles, in cascading "rem" units.
         */
        smallSize: number,
        /**
         * Gap between tiles, in cascading "rem" units.
         */
        tileGap: number,
        /**
         * Gap between groups, in cascading "rem" units.
         */
        groupGap: number,
        /**
         * The height of group labels, in cascading "rem" units.
         */
        labelHeight: number,
        /**
         * Maximum width in small tiles, effective only
         * in vertical containers.
         */
        maxWidth: number,
        /**
         * Maximum height in small tiles, effective
         * in horizontal and vertical containers.
         */
        maxHeight: number,
        /**
         * Transition function(s) to contribute to tiles.
         */
        tileTransition?: string,
        /**
         * Scroll node to resolve offsets from.
         */
        scrollNode?: Element,
    }) {
        assert(options.direction == "horizontal", "Vertical direction not supported currently.");
        assert(options.direction == "horizontal" ? (options.maxHeight ?? 0) > 0 : true, "maxHeight must be specified and be > 0.");

        this._container = options.element as HTMLElement;
        this._dir = options.direction;
        this._label_class_name = options.labelClassName;
        this._tile_class_name = options.tileClassName;
        this._small_size = options.smallSize;
        this._tile_gap = options.tileGap;
        this._group_gap = options.groupGap;
        this._label_height = options.labelHeight;
        this._max_width = options.maxWidth ?? Infinity;
        this._max_height = options.maxHeight ?? Infinity;
        this._tile_transition = options.tileTransition ?? "";
        this._scroll_node = options.scrollNode as HTMLElement;

        this._container.style.position = "relative";

        this._tile_size.small_w = this._small_size;
        this._tile_size.small_h = this._small_size;
        this._tile_size.medium_w = this._small_size * 2 + this._tile_gap;
        this._tile_size.medium_h = this._tile_size.medium_w;
        this._tile_size.wide_w = this._tile_size.medium_w * 2 + this._tile_gap;
        this._tile_size.wide_h = this._tile_size.medium_w;
        this._tile_size.large_w = this._tile_size.wide_w;
        this._tile_size.large_h = this._tile_size.wide_w;

        // Observe the "rem" unit size
        this._rem_observer = new RemObserver(val => {
            this._rem = val;
        });

        // Set state
        this._state = new State();

        // Initial layout
        this._layout = this._dir == "horizontal" ?
            new HorizontalLayout(this, this._max_width, this._max_height) :
            new VerticalLayout(this, this._max_width, this._max_height);
    }

    /**
     * Destroys the `LiveTiles` instance, disposing
     * of any observers and removing the container from the DOM.
     */
    destroy()
    {
        for (const btn of Array.from(this._container.querySelectorAll("." + this._tile_class_name)) as HTMLButtonElement[])
        {
            const draggable = this._draggables.get(btn);
            if (draggable) draggable.destroy();
            this._draggables.delete(btn);
        }
        this._rem_observer.cleanup();
        this._container.remove();
    }

    /**
     * Loads a state in the `LiveTiles` instance.
     */
    load(state: State): void
    {
        for (const [id, group] of state.groups)
        {
            this.addGroup({
                id,
                index: group.index,
                label: group.label,
            });
        }
        for (const [id, tile] of state.tiles)
        {
            this.addTile({
                id,
                size: tile.size,
                x: tile.x,
                y: tile.y,
                group: tile.group,
            });
        }
    }

    /**
     * Returns the state of the `LiveTiles` instance.
     */
    save(): State
    {
        return this._state.clone();
    }
}