[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / Layout

# Class: `abstract` Layout

Defined in: [src/Layout.ts:12](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Layout.ts#L12)

Layout.

## Constructors

### Constructor

> **new Layout**(`$`): `Layout`

Defined in: [src/Layout.ts:26](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Layout.ts#L26)

Constructor.

#### Parameters

##### $

[`Tiles`](Tiles.md)

#### Returns

`Layout`

## Properties

### $

> `readonly` **$**: [`Tiles`](Tiles.md)

Defined in: [src/Layout.ts:16](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Layout.ts#L16)

Tiles back-reference.

***

### groups

> `readonly` **groups**: [`LayoutGroup`](LayoutGroup.md)[] = `[]`

Defined in: [src/Layout.ts:21](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Layout.ts#L21)

Ordered groups.

## Methods

### rearrange()

> `abstract` **rearrange**(): `void`

Defined in: [src/Layout.ts:33](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Layout.ts#L33)

Rearranges group tiles.

#### Returns

`void`

***

### snapToGrid()

> `abstract` **snapToGrid**(`tile`): `null` \| [`GridSnapResult`](../type-aliases/GridSnapResult.md)

Defined in: [src/Layout.ts:38](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Layout.ts#L38)

Snaps location to grid.

#### Parameters

##### tile

`HTMLButtonElement`

#### Returns

`null` \| [`GridSnapResult`](../type-aliases/GridSnapResult.md)
