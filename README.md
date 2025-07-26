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

const container = document.querySelector("#container")!;

// Create layout
const tiles = new Tiles({
  element: container,
  direction: "horizontal",
  classNames: {
    group: "group",
    groupLabel: "group-label",
    groupLabelText: "group-label-text",
    groupTiles: "group-tiles",
    tile: "tile",
    tileContent: "tile-content",
  },
  smallSize: 3.625,
  tileGap: 0.6,
  groupGap: 3,
  labelHeight: 2,
  height: 6,
});

// Handle click in a tile
tiles.on("click", ({ detail: { tile } }) => {
  if (tile == "purple1") {
    alert("one!");
  }
});

// Handle tile addition
tiles.on("addedtile", ({ detail: { tile, button, contentDiv } }) => {
  if (tile.id.startsWith("purple")) {
    button.style.background = "purple";
  }
});

// Group 1
tiles.addGroup({
  id: "group1",
  label: "Group 1",
});

// Tile 1
tiles.addTile({
  id: "purple1",
  group: "group1",
  size: "large",
});

// Tile 2
tiles.addTile({
  id: "purple2",
  group: "group1",
  size: "wide",
});

// Disposal
tiles.destroy();
```

### Events

#### addedgroup

Dispatched when a new group is added. Event is given a `CustomEvent<{ group: Group, div: HTMLDivElement, labelDiv: HTMLDivElement, tilesDiv: HTMLDivElement }>` object. This is also dispatched when automatic groups are created (such as when a tile is dropped far away in no existing group).

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

### Rearranging

If your container starts at zero scale, then it is necessary to manually call `.rearrange()` for the first time after a very small scale (like when it is 0.01).

For example:

```js
min_scale_timeout.current = window.setTimeout(() => {
    base_tiles.current!.rearrange();
}, TILES_OPEN_DELAY + TILES_OPEN_DELAY / 2.2);
```

## License

Apache 2.0
