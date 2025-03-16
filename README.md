# TileExpert

Base implementation for Windows 8 like live tiles in HTML5. Features:

- Custom minimum tile sizes
- Floating tiles
- Groups
- Drag-n-drop

Specifications:

- Group label element tag: `input[type="text"]`
- Group label element attribute `data-id`: the group ID.
- Tile element tag: `button`
- Tile element attribute `data-id`: the tile ID.
- Tile size: supports small (1x1), medium (2x2), wide (4x2) and large tiles (4x4).
- Overrides the `transition` style in tile elements.

## Getting started

```ts
import { TileExpert } from "com.hydroper.tileexpert";

const tile_expert = new TileExpert({
    // Container. The cascading "position" is automatically set to "relative",
    // as tiles are positioned through the "left" and "top" properties.
    element,
    // The direction of the tile container.
    direction: "horizontal",
    // Whether a right-to-left layout is used or not.
    rtl: false,
    // Class name used for identifying group labels.
    labelClassName: "label",
    // Class name used for identifying tiles.
    tileClassName: "tile",
    // The size of small tiles, in cascading "rem" units.
    smallSize: 2,
    // Gap between tiles, in cascading "rem" units.
    tileGap: 0.9,
    // Gap between groups, in cascading "rem" units.
    groupGap: 2,
    // The height of group labels, in cascading "rem" units.
    groupLabelHeight: 2,
    // Maximum width in small tiles.
    maxWidth: undefined,
    // Maximum height in small tiles.
    maxHeight: 6,
    // Transition function(s) to contribute to tiles.
    tileTransition: "",
});

// Adding groups
const label_input = tile_expert.addGroup({
    id: "group1",
    index: 0,
    label: "Group 1",
});

// Adding tiles
const button = tile_expert.addTile({
    id: "tile1",
    group: "group1",
    // Horizontal position in small tiles.
    x: 0,
    // Vertical position in small tiles.
    y: 0,

    size: "large",
});

// Disposal
tile_expert.destroy();
```