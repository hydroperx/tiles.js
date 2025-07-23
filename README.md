# @hydroperx/tiles

Base layout implementation for Windows 8 like live tiles in HTML5.

## Documentation

### Specifications

<blockquote>

**Positioning style**: cascading `translate`

**Group-label element tag**: `div`

**Group-label element attribute** `data-id`: the group ID.

**Tile element tag**: `button`

**Tile element attribute** `Tiles.ATTR_ID`: the tile ID.

**Tile element attribute** `Tiles.ATTR_SIZE`: the tile size (`small`, `medium`, `wide` or `large`).

**Tile element attribute** `Tiles.ATTR_DRAGGING`: false or true.

**Tile size**: supports small (1x1), medium (2x2), wide (4x2) and large tiles (4x4).

**Transition style**: Overrides the `transition` style in tile elements.

</blockquote>

### Getting started

```ts
import { Tiles } from "@hydroperx/tiles";

const tiles = new Tiles({
    // Container.
    element,
    // The direction of the tile container.
    direction: "horizontal",
    // Custom class names.
    classNames: {
        // Groups.
        group: "group",
        // Group labels.
        groupLabel: "group-label",
        // Group tiles.
        groupTiles: "group-tiles",
        // Tile buttons.
        tile: "tile",
        // Tile content.
        tileContent: "tile-content",
    },
    // The size of small tiles, in cascading "rem" units.
    smallSize: 3.625,
    // Gap between tiles, in cascading "rem" units.
    tileGap: 0.6,
    // Gap between groups, in cascading "rem" units.
    groupGap: 9,
});

// Disposal
tiles.destroy();
```

### Events

#### addedgroup

Dispatched when a new group is added. Event is given a `CustomEvent<{ group: Group, label: HTMLDivElement }>` object. This is also dispatched when automatic groups are created (such as when a tile is dropped far away in no existing group).

```ts
tiles.addEventListener("addedgroup", ({ detail: { group, label } }) => {
    //
});
```

#### addedtile

Dispatched when a new tile is added. Event is given a `CustomEvent<{ tile: Tile, button: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("addedtile", ({ detail: { tile, button } }) => {
    //
});
```

#### stateupdate

Dispatched whenever the state is updated. Event is given a `CustomEvent<State>` object.

```ts
tiles.addEventListener("stateupdate", ({ detail: state }) => {
    //
});
```

#### dragstart

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("dragstart", ({ detail: { tile } }) => {
    //
});
```

#### drag

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("drag", ({ detail: { tile } }) => {
    //
});
```

#### dragend

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.addEventListener("dragend", ({ detail: { tile } }) => {
    //
});
```

## License

Apache 2.0