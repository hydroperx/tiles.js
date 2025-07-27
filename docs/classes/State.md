[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / State

# Class: State

Defined in: [src/State.ts:7](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L7)

The state of a `Tiles` component, containing positions and labels.

## Constructors

### Constructor

> **new State**(): `State`

#### Returns

`State`

## Properties

### groups

> **groups**: `Map`\<`string`, \{ `index`: `number`; `label`: `string`; \}\>

Defined in: [src/State.ts:8](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L8)

***

### tiles

> **tiles**: `Map`\<`string`, \{ `group`: `string`; `size`: [`TileSize`](../type-aliases/TileSize.md); `x`: `number`; `y`: `number`; \}\>

Defined in: [src/State.ts:9](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L9)

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/State.ts:64](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L64)

#### Returns

`void`

***

### clone()

> **clone**(): `State`

Defined in: [src/State.ts:86](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L86)

#### Returns

`State`

***

### groupExists()

> **groupExists**(`id`): `boolean`

Defined in: [src/State.ts:92](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L92)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### set()

> **set**(`state`): `void`

Defined in: [src/State.ts:69](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L69)

#### Parameters

##### state

`State`

#### Returns

`void`

***

### tileExists()

> **tileExists**(`id`): `boolean`

Defined in: [src/State.ts:96](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L96)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### toJSON()

> **toJSON**(): `any`

Defined in: [src/State.ts:41](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L41)

Returns a plain object (**not** a string).

#### Returns

`any`

***

### fromJSON()

> `static` **fromJSON**(`object`): `State`

Defined in: [src/State.ts:16](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/State.ts#L16)

Constructs `State` from JSON. The `object` argument
may be a JSON serialized string or a plain object.

#### Parameters

##### object

`any`

#### Returns

`State`
