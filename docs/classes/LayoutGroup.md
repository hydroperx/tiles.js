[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / LayoutGroup

# Class: LayoutGroup

Defined in: [src/Layout.ts:64](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L64)

Group.

## Constructors

### Constructor

> **new LayoutGroup**(`$`, `id`, `div`, `width`, `height`): `LayoutGroup`

Defined in: [src/Layout.ts:80](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L80)

Constructor.

#### Parameters

##### $

[`Layout`](Layout.md)

##### id

`string`

##### div

`null` | `HTMLDivElement`

##### width

`undefined` | `number`

##### height

`undefined` | `number`

#### Returns

`LayoutGroup`

## Properties

### $

> **$**: [`Layout`](Layout.md)

Defined in: [src/Layout.ts:81](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L81)

***

### div

> **div**: `null` \| `HTMLDivElement`

Defined in: [src/Layout.ts:83](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L83)

***

### id

> **id**: `string`

Defined in: [src/Layout.ts:82](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L82)

## Methods

### getLayoutSize()

> **getLayoutSize**(): `object`

Defined in: [src/Layout.ts:121](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L121)

Layout size in small tiles unit (1x1).

#### Returns

`object`

##### height

> **height**: `number`

##### width

> **width**: `number`

***

### getTile()

> **getTile**(`id`): `null` \| [`LayoutTile`](LayoutTile.md)

Defined in: [src/Layout.ts:100](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L100)

Returns a specific tile.

#### Parameters

##### id

`string`

#### Returns

`null` \| [`LayoutTile`](LayoutTile.md)

***

### getTiles()

> **getTiles**(): [`LayoutTile`](LayoutTile.md)[]

Defined in: [src/Layout.ts:93](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L93)

Returns an immutable unordered list of the contained tiles.

#### Returns

[`LayoutTile`](LayoutTile.md)[]

***

### hasTile()

> **hasTile**(`id`): `boolean`

Defined in: [src/Layout.ts:107](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L107)

Returns whether a tile exists in this group.

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [src/Layout.ts:114](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L114)

Returns whether the group is empty or not.

#### Returns

`boolean`

***

### rearrange()

> **rearrange**(): `void`

Defined in: [src/Layout.ts:128](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L128)

Rearranges group tiles and resizes the group's tiles div.

#### Returns

`void`
