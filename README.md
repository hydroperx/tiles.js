# @hydroperx/tiles

<p align="center">
  <a href="./docs/globals.md"><img src="https://img.shields.io/badge/TypeScript%20API%20Documentation-gray"></a>
</p>

Base layout implementation for Windows 8 like live tiles in HTML5.

## Documentation

### Structure

Positioning style:

- Cascading `transform: translateX(...) translateY(...)`
- Uses the cascading `em` unit for measurement everywhere (which means the (?inherited) `font-size`).

Group element tag:

- `div`

Group element attribute:

- `Tiles.ATTR_ID`: the group ID.

Group element attribute:

- `Tiles.ATTR_DRAGGING`: false or true.

Group element:

- Consists of:
  - A group label div (contains a group label text div)
  - A group tiles div (where the tiles float).

Tile element tag:

- A `button`, consisting of a content div where the user may apply custom transforms such as tilting.

Tile element attribute:

- `Tiles.ATTR_ID`: the tile ID.

Tile element attribute

- `Tiles.ATTR_SIZE`: the tile size (`small`, `medium`, `wide` or `large`).

Tile element attribute

- `Tiles.ATTR_DRAGGING`: false or true.

Tile element attribute:

- `Tiles.ATTR_CHECKED`: false or true.

Tile size:

- Supports small (1x1), medium (2x2), wide (4x2) and large tiles (4x4).

### Getting started

```ts
import { Tiles } from "@hydroperx/tiles";

// Create a Tiles layout.
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
        // Group label text.
        groupLabelText: "group-label-text",
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
    // Group label height, in cascading "rem units".
    labelHeight: 3.5,
    // Work to do before removing a group from the DOM.
    // This is typically used for tweening the group view (e.g. the scale).
    groupRemovalWork: async (div) => {},
    // Work to do before removing a tile from the DOM.
    // This is typically used for tweening the tile view (e.g. the scale).
    tileRemovalWork: async (button) => {},
});

// Disposal
tiles.destroy();
```

### Events

#### addedgroup

Dispatched when a new group is added. Event is given a `CustomEvent<{ group: Group, div: HTMLDivElement, labelDiv: HTMLDivElement, labelTextDiv: HTMLDivElement, tilesDiv: HTMLDivElement }>` object. This is also dispatched when automatic groups are created (such as when a tile is dropped far away in no existing group).

```ts
tiles.on("addedgroup", ({ detail: { group, div, labelDiv, labelTextDiv, tilesDiv } }) => {
    //
});
```

#### addedtile

Dispatched when a new tile is added. Event is given a `CustomEvent<{ tile: Tile, button: HTMLButtonElement, contentDiv: HTMLDivElement }>` object.

```ts
tiles.on("addedtile", ({ detail: { tile, button, contentDiv } }) => {
    //
});
```

#### stateupdate

Dispatched whenever the state is updated. Event is given a `CustomEvent<State>` object.

```ts
tiles.on("stateupdate", ({ detail: state }) => {
    //
});
```

#### dragstart

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.on("dragstart", ({ detail: { tile } }) => {
    //
});
```

#### drag

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.on("drag", ({ detail: { tile } }) => {
    //
});
```

#### dragend

Event is given a `CustomEvent<{ tile: HTMLButtonElement }>` object.

```ts
tiles.on("dragend", ({ detail: { tile } }) => {
    //
});
```

#### groupdragstart

Event is given a `CustomEvent<{ group: HTMLDivElement }>` object.

```ts
tiles.on("groupdragstart", ({ detail: { group } }) => {
    //
});
```

#### groupdrag

Event is given a `CustomEvent<{ group: HTMLDivElement }>` object.

```ts
tiles.on("groupdrag", ({ detail: { group } }) => {
    //
});
```

#### groupdragend

Event is given a `CustomEvent<{ group: HTMLDivElement }>` object.

```ts
tiles.on("groupdragend", ({ detail: { group } }) => {
    //
});
```

#### selectionchange

Event is given a `CustomEvent<{ tiles: string[] }>` object.

```ts
tiles.on("selectionchange", ({ detail: { tiles } }) => {
    //
});
```

#### click

Event is given a `CustomEvent<{ tile: string }>` object.

```ts
tiles.on("click", ({ detail: { tile } }) => {
    //
});
```

### Style recommendations

- Do not add border, margin, padding or scale to `classNames.group` to avoid inconsistencies in grid-snapping.
- Do not add border, margin, padding or scale to `classNames.groupTiles` to avoid inconsistencies in grid-snapping.
- Do not add margin or scale to `classNames.tile`. Scale may be used in `classNames.tileContent`.

## License

Apache 2.0