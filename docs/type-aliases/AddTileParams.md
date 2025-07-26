[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / AddTileParams

# Type Alias: AddTileParams

> **AddTileParams** = `object`

Defined in: [src/Tiles.ts:691](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L691)

Parameters for adding a tile.

## Properties

### group?

> `optional` **group**: `string`

Defined in: [src/Tiles.ts:701](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L701)

Group to attach tile to. If unspecified,
tile is attached to either the last group (if unlabeled)
or a new last anonymous group.

***

### id

> **id**: `string`

Defined in: [src/Tiles.ts:695](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L695)

Tile ID.

***

### size?

> `optional` **size**: [`TileSize`](TileSize.md)

Defined in: [src/Tiles.ts:715](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L715)

Tile size.

#### Default

```ts
medium
```

***

### x?

> `optional` **x**: `number`

Defined in: [src/Tiles.ts:705](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L705)

Horizontal position in small tiles.

***

### y?

> `optional` **y**: `number`

Defined in: [src/Tiles.ts:709](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L709)

Vertical position in small tiles.
