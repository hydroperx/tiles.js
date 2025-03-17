# LiveTileBase

Base implementation for Windows 8 like live tiles in HTML5.:

Specifications:

- Used positioning style: cascading `translate`
- Group-label element tag: `div`
- Group-label element attribute `data-id`: the group ID.
- Tile element tag: `button`
- Tile element attribute `data-id`: the tile ID.
- Tile element attribute `data-dragging`: false or true.
- Tile size: supports small (1x1), medium (2x2), wide (4x2) and large tiles (4x4).
- Overrides the `transition` style in tile elements.

## Getting started

```ts
import { LiveTileBase } from "com.hydroper.livetilebase";

const live_tile_base = new LiveTileBase({
    // Container.
    element,
    // The direction of the tile container.
    direction: "horizontal",
    // Class name used for identifying group labels.
    labelClassName: "label",
    // Class name used for identifying tiles.
    tileClassName: "tile",
    // The size of small tiles, in cascading "rem" units.
    smallSize: 3.625,
    // Gap between tiles, in cascading "rem" units.
    tileGap: 0.6,
    // Gap between groups, in cascading "rem" units.
    groupGap: 3,
    // The height of group labels, in cascading "rem" units.
    labelHeight: 2,
    // Maximum width in small tiles.
    maxWidth: undefined,
    // Maximum height in small tiles.
    maxHeight: 6,
    // Transition function(s) to contribute to tiles.
    tileTransition: "",
    // Scroll node to resolve offsets from.
    scrollNode: undefined,
});

// Adding groups
const label_div = live_tile_base.addGroup({
    id: "group1",
    index: 0,
    label: "Group 1",
});

// Adding tiles
const button = live_tile_base.addTile({
    id: "tile1",
    group: "group1",
    // Horizontal position in small tiles.
    x: 0,
    // Vertical position in small tiles.
    y: 0,

    size: "large",
});

// Disposal
live_tile_base.destroy();
```