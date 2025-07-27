[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / TilesEventMap

# Type Alias: TilesEventMap

> **TilesEventMap** = `object`

Defined in: [src/Tiles.ts:676](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L676)

Tiles event map.

## Properties

### addedgroup

> **addedgroup**: `CustomEvent`\<\{ `div`: `HTMLDivElement`; `group`: [`LayoutGroup`](../classes/LayoutGroup.md); `labelDiv`: `HTMLDivElement`; `tilesDiv`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:677](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L677)

***

### addedtile

> **addedtile**: `CustomEvent`\<\{ `button`: `HTMLButtonElement`; `contentDiv`: `HTMLDivElement`; `tile`: [`LayoutTile`](../classes/LayoutTile.md); \}\>

Defined in: [src/Tiles.ts:683](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L683)

***

### click

> **click**: `CustomEvent`\<\{ `tile`: `string`; \}\>

Defined in: [src/Tiles.ts:696](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L696)

***

### drag

> **drag**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:690](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L690)

***

### dragend

> **dragend**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:691](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L691)

***

### dragstart

> **dragstart**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:689](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L689)

***

### groupdrag

> **groupdrag**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:693](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L693)

***

### groupdragend

> **groupdragend**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:694](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L694)

***

### groupdragstart

> **groupdragstart**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:692](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L692)

***

### selectionchange

> **selectionchange**: `CustomEvent`\<\{ `tiles`: `string`[]; \}\>

Defined in: [src/Tiles.ts:695](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L695)

***

### stateupdate

> **stateupdate**: `CustomEvent`\<[`State`](../classes/State.md)\>

Defined in: [src/Tiles.ts:688](https://github.com/hydroperx/tiles.js/blob/e7df361dc5db8534367a3ce46e0ae3185d9045cd/src/Tiles.ts#L688)
