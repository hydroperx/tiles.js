import { TileSize } from "./enum/TileSize";

/**
 * The state of a `Tiles` component, containing positions and labels.
 */
export class TileExpertState
{
    groups: Map<string, { index: number, label: string }> = new Map();
    tiles: Map<string, { size: TileSize, x: number, y: number, group: string }> = new Map();

    /**
     * Constructs `TileExpertState` from JSON. The `object` argument
     * may be a JSON serialized string or a plain object.
     */
    static fromJSON(object: any): TileExpertState
    {
        object = typeof object === "string" ? JSON.parse(object) : object;
        const r = new TileExpertState();
        for (const id in object.groups)
        {
            const o1 = object.groups[id];
            r.groups.set(id, {
                index: Number(o1.index),
                label: String(o1.label),
            });
        }
        for (const id in object.tiles)
        {
            const o1 = object.tiles[id];
            r.tiles.set(id, {
                size: String(o1.size) as TileSize,
                x: Number(o1.x),
                y: Number(o1.y),
                group: String(o1.group),
            });
        }
        return r;
    }

    /**
     * Returns a plain object (**not** a string).
     */
    toJSON(): any
    {
        const groups: any = {};
        for (const [id, g] of this.groups)
        {
            groups[id] = {
                index: g.index,
                label: g.label,
            };
        }
        const tiles: any = {};
        for (const [id, t] of this.tiles)
        {
            tiles[id] = {
                size: t.size,
                x: t.x,
                y: t.y,
                group: t.group,
            };
        }
        return {
            groups,
            tiles,
        };
    }
    
    clear(): void
    {
        this.groups.clear();
        this.tiles.clear();
    }

    set(state: TileExpertState): void
    {
        for (const [id, group] of state.groups)
        {
            this.groups.set(id, {
                index: group.index,
                label: group.label,
            });
        }
        for (const [id, tile] of state.tiles)
        {
            this.tiles.set(id, {
                size: tile.size,
                x: tile.x,
                y: tile.y,
                group: tile.group,
            });
        }
    }

    clone(): TileExpertState
    {
        const r = new TileExpertState();
        r.set(this);
        return r;
    }
}