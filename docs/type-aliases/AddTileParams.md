[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / AddTileParams

# Type Alias: AddTileParams

> **AddTileParams** = `object`

Defined in: [src/Tiles.ts:678](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L678)

Parameters for adding a tile.

## Properties

### group?

> `optional` **group**: `string`

Defined in: [src/Tiles.ts:688](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L688)

Group to attach tile to. If unspecified,
tile is attached to either the last group (if unlabeled)
or a new last anonymous group.

***

### id

> **id**: `string`

Defined in: [src/Tiles.ts:682](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L682)

Tile ID.

***

### size?

> `optional` **size**: [`TileSize`](TileSize.md)

Defined in: [src/Tiles.ts:702](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L702)

Tile size.

#### Default

```ts
medium
```

***

### x?

> `optional` **x**: `number`

Defined in: [src/Tiles.ts:692](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L692)

Horizontal position in small tiles.

***

### y?

> `optional` **y**: `number`

Defined in: [src/Tiles.ts:696](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L696)

Vertical position in small tiles.
