[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / AddTileParams

# Type Alias: AddTileParams

> **AddTileParams** = `object`

Defined in: [src/Tiles.ts:718](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L718)

Parameters for adding a tile.

## Properties

### group?

> `optional` **group**: `string`

Defined in: [src/Tiles.ts:728](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L728)

Group to attach tile to. If unspecified,
tile is attached to either the last group (if unlabeled)
or a new last anonymous group.

***

### id

> **id**: `string`

Defined in: [src/Tiles.ts:722](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L722)

Tile ID.

***

### size?

> `optional` **size**: [`TileSize`](TileSize.md)

Defined in: [src/Tiles.ts:742](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L742)

Tile size.

#### Default

```ts
medium
```

***

### x?

> `optional` **x**: `number`

Defined in: [src/Tiles.ts:732](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L732)

Horizontal position in small tiles.

***

### y?

> `optional` **y**: `number`

Defined in: [src/Tiles.ts:736](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L736)

Vertical position in small tiles.
