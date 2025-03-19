import { TileSize } from "./enum/TileSize";

/**
 * Small tile rows of columns (occupied entries).
 */
export class Rows {
    private m_rows: boolean[][] = [];
    private m_width: number = 0;
    private m_height: number = 0;

    /**
     * @param max_width Maximum number of horizontal tiles. May be `Infinity`.
     * @param max_height Maximum number of vertical tiles. May be `Infinity`.
     */
    constructor(public readonly max_width: number, public readonly max_height: number)
    {
    }

    /**
     * Number of horizontal small tiles.
     */
    get width(): number
    {
        return this.m_width;
    }

    /**
     * Number of vertical small tiles.
     */
    get height(): number
    {
        return this.m_height;
    }

    /**
     * Whether a small tile is occupied or not.
     */
    get(horizontal: number, vertical: number): boolean
    {
        if (vertical < 0 || vertical >= this.max_height || horizontal < 0 || horizontal >= this.max_width)
        {
            return true;
        }
        if (vertical < this.m_rows.length)
        {
            const columns = this.m_rows[vertical];
            if (horizontal < columns.length)
            {
                return columns[horizontal];
            }
        }
        return false;
    }

    sizeFreeAt(horizontal: number, vertical: number, size: TileSize): boolean
    {
        switch (size)
        {
            case "small":
                return !this.get(horizontal, vertical);
            case "medium":
                return !this.get(horizontal, vertical)
                    && !this.get(horizontal + 1, vertical)
                    && !this.get(horizontal, vertical + 1)
                    && !this.get(horizontal + 1, vertical + 1);
            case "wide":
                return this.sizeFreeAt(horizontal, vertical, "medium")
                    && this.sizeFreeAt(horizontal + 2, vertical, "medium");
            case "large":
                return this.sizeFreeAt(horizontal, vertical, "wide")
                    && this.sizeFreeAt(horizontal, vertical + 2, "wide");
        }
    }

    /**
     * Sets whether a small tile is available or not.
     */
    put(horizontal: number, vertical: number, value: boolean)
    {
        if (vertical < 0 || vertical >= this.max_height || horizontal < 0 || horizontal >= this.max_width)
        {
            return;
        }
        if (value)
        {
            while (vertical >= this.m_rows.length)
            {
                this.m_rows.push([]);
                this.m_height = this.m_rows.length;
            }
            const columns = this.m_rows[vertical];
            while (horizontal >= columns.length)
            {
                columns.push(false);
                this.m_width = columns.length > this.m_width ? columns.length : this.m_width;
            }
            columns[horizontal] = true;
        }
        else if (vertical < this.m_rows.length)
        {
            const columns = this.m_rows[vertical];
            if (horizontal < columns.length) {
                columns[horizontal] = false;
                // Re-adjust size
                this.m_width = 0;
                for (let i = 0, l = this.m_rows.length; i < l; i++)
                {
                    const columns = this.m_rows[i];
                    let j = columns.indexOf(true);
                    if (j++ !== -1)
                    {
                        this.m_width = j < this.m_width ? this.m_width : j;
                    }
                }
                this.m_height = 0;
                for (let i = this.m_rows.length; --i >= 0;)
                {
                    const columns = this.m_rows[i];
                    const j = columns.indexOf(true);
                    if (j !== -1)
                    {
                        this.m_height = i + 1;
                        break;
                    }
                }
            }
        }
    }

    fillSize(horizontal: number, vertical: number, size: TileSize): void
    {
        switch (size)
        {
            case "small":
                this.put(horizontal, vertical, true);
                break;
            case "medium":
                this.put(horizontal, vertical, true);
                this.put(horizontal + 1, vertical, true);
                this.put(horizontal, vertical + 1, true);
                this.put(horizontal + 1, vertical + 1, true);
                break;
            case "wide":
                this.fillSize(horizontal, vertical, "medium");
                this.fillSize(horizontal + 2, vertical, "medium");
                break;
            case "large":
                this.fillSize(horizontal, vertical, "wide");
                this.fillSize(horizontal, vertical + 2, "wide");
                break;
        }
    }

    clearSize(horizontal: number, vertical: number, size: TileSize): void
    {
        switch (size)
        {
            case "small":
                this.put(horizontal, vertical, false);
                break;
            case "medium":
                this.put(horizontal, vertical, false);
                this.put(horizontal + 1, vertical, false);
                this.put(horizontal, vertical + 1, false);
                this.put(horizontal + 1, vertical + 1, false);
                break;
            case "wide":
                this.clearSize(horizontal, vertical, "medium");
                this.clearSize(horizontal + 2, vertical, "medium");
                break;
            case "large":
                this.clearSize(horizontal, vertical, "wide");
                this.clearSize(horizontal, vertical + 2, "wide");
                break;
        }
    }
}