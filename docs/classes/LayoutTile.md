[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / LayoutTile

# Class: LayoutTile

Defined in: [src/Layout.ts:231](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L231)

Tile.

## Constructors

### Constructor

> **new LayoutTile**(`id`, `button`): `LayoutTile`

Defined in: [src/Layout.ts:251](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L251)

Cosntructor.

#### Parameters

##### id

`string`

##### button

If `null` indicates this is a placeholder tile.

`null` | `HTMLButtonElement`

#### Returns

`LayoutTile`

## Properties

### $

> **$**: `null` \| [`LayoutGroup`](LayoutGroup.md) = `null`

Defined in: [src/Layout.ts:245](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L245)

Parent layout group.

***

### button

> **button**: `null` \| `HTMLButtonElement`

Defined in: [src/Layout.ts:253](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L253)

If `null` indicates this is a placeholder tile.

***

### id

> `readonly` **id**: `string`

Defined in: [src/Layout.ts:252](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L252)

***

### positioned

> **positioned**: `boolean` = `false`

Defined in: [src/Layout.ts:240](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L240)

Cached indicator for initial position.

***

### tween

> **tween**: `null` \| `Tween` = `null`

Defined in: [src/Layout.ts:235](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L235)

Cached tween.

## Accessors

### height

#### Get Signature

> **get** **height**(): `number`

Defined in: [src/Layout.ts:307](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L307)

Height in small tiles.

##### Returns

`number`

***

### width

#### Get Signature

> **get** **width**(): `number`

Defined in: [src/Layout.ts:300](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L300)

Width in small tiles.

##### Returns

`number`

***

### x

#### Get Signature

> **get** **x**(): `number`

Defined in: [src/Layout.ts:286](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L286)

X coordinate in small tiles.

##### Returns

`number`

***

### y

#### Get Signature

> **get** **y**(): `number`

Defined in: [src/Layout.ts:293](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L293)

Y coordinate in small tiles.

##### Returns

`number`

## Methods

### addTo()

> **addTo**(`$`, `x`, `y`, `width`, `height`): `boolean`

Defined in: [src/Layout.ts:263](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L263)

Attempts to contributes the tile to the layout.
If `x` and `y` are both given as `null`, then the
method is guaranteed to always succeed, contributing
the tile to the best last position.

#### Parameters

##### $

[`LayoutGroup`](LayoutGroup.md)

##### x

`null` | `number`

##### y

`null` | `number`

##### width

`number`

##### height

`number`

#### Returns

`boolean`

***

### move()

> **move**(`x`, `y`): `boolean`

Defined in: [src/Layout.ts:314](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L314)

Moves position.

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`boolean`

***

### remove()

> **remove**(): `void`

Defined in: [src/Layout.ts:277](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L277)

Removes the tile from the parent `LayoutGroup`.
This method does not, however, remove the tile
from the overall state.

#### Returns

`void`

***

### resize()

> **resize**(`width`, `height`): `boolean`

Defined in: [src/Layout.ts:321](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Layout.ts#L321)

Resizes tile.

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`boolean`
