# @hydroperx/tiles

Base layout implementation for Windows 8 like live tiles in HTML5.

## Specifications

<blockquote>

Used positioning style: cascading `translate`

Group-label element tag: `div`

Group-label element attribute `data-id`: the group ID.

Tile element tag: `button`

Tile element attribute `data-id`: the tile ID.

Tile element attribute `data-size`: the tile size (`small`, `medium`, `wide` or `large`).

Tile element attribute `data-dragging`: false or true.

Tile size: supports small (1x1), medium (2x2), wide (4x2) and large tiles (4x4).

Overrides the `transition` style in tile elements.

</blockquote>

## Getting started

```ts
import { Tiles } from "@hydroperx/tiles";

const tiles = new Tiles({
    // Container.
    element,
    // The direction of the tile container.
    direction: "horizontal",
    // Class name used for identifying group labels.
    labelClassName: "label",
    // Class name used for identifying tiles.
    tileClassName: "tile",
    // Class name used for identifying tile content.
    tileContentClassName: "tile-content",
    // Class name used for identifying the tile placeholder when dragging
    // a tile.
    placeholderClassName: "placeholder",
    // The size of small tiles, in cascading "rem" units.
    smallSize: 3.625,
    // Gap between tiles, in cascading "rem" units.
    tileGap: 0.6,
    // Gap between groups, in cascading "rem" units.
    groupGap: 9,
    // The height of group labels, in cascading "rem" units.
    labelHeight: 2,
    // Maximum width in small tiles.
    // Effective only in vertical containers.
    // Must be >= 4 for vertical containers.
    maxWidth: undefined,
    // Maximum height in small tiles.
    // Effective only in horizontal containers.
    // Must be >= 4 for horizontal containers.
    maxHeight: 6,
    // Transition function(s) to contribute to tiles.
    tileTransition: "",
});

// Disposal
tiles.destroy();
```

## Events

### addedGroup

Dispatched when a new group is added. Event is given a `CustomEvent<{ group: Group, label: HTMLDivElement }>` object. This is also dispatched when automatic groups are created (such as when a tile is dropped far away in no existing group).

```ts
tiles.addEventListener("addedGroup", ({ detail: { group, label } }) => {
    //
});
```

### addedTile

Dispatched when a new tile is added. Event is given a `CustomEvent<{ tile: Tile, button: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("addedTile", ({ detail: { tile, button } }) => {
    //
});
```

### stateUpdated

Dispatched whenever the state is updated. Event is given a `CustomEvent<State>` object.

```ts
tiles.addEventListener("stateUpdated", ({ detail: state }) => {
    //
});
```

### dragStart

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("dragStart", ({ detail: { tile } }) => {
    //
});
```

### drag

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("drag", ({ detail: { tile } }) => {
    //
});
```

### dragEnd

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("dragEnd", ({ detail: { tile } }) => {
    //
});
```