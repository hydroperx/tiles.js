[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / AddTileParams

# Type Alias: AddTileParams

> **AddTileParams** = `object`

Defined in: [src/Tiles.ts:681](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L681)

Parameters for adding a tile.

## Properties

### group?

> `optional` **group**: `string`

Defined in: [src/Tiles.ts:691](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L691)

Group to attach tile to. If unspecified,
tile is attached to either the last group (if unlabeled)
or a new last anonymous group.

***

### id

> **id**: `string`

Defined in: [src/Tiles.ts:685](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L685)

Tile ID.

***

### size?

> `optional` **size**: [`TileSize`](TileSize.md)

Defined in: [src/Tiles.ts:705](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L705)

Tile size.

#### Default

```ts
medium
```

***

### x?

> `optional` **x**: `number`

Defined in: [src/Tiles.ts:695](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L695)

Horizontal position in small tiles.

***

### y?

> `optional` **y**: `number`

Defined in: [src/Tiles.ts:699](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L699)

Vertical position in small tiles.
