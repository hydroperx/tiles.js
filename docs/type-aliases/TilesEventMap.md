[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / TilesEventMap

# Type Alias: TilesEventMap

> **TilesEventMap** = `object`

Defined in: [src/Tiles.ts:639](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L639)

Tiles event map.

## Properties

### addedgroup

> **addedgroup**: `CustomEvent`\<\{ `div`: `HTMLDivElement`; `group`: [`LayoutGroup`](../classes/LayoutGroup.md); `labelDiv`: `HTMLDivElement`; `tilesDiv`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:640](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L640)

***

### addedtile

> **addedtile**: `CustomEvent`\<\{ `button`: `HTMLButtonElement`; `contentDiv`: `HTMLDivElement`; `tile`: [`LayoutTile`](../classes/LayoutTile.md); \}\>

Defined in: [src/Tiles.ts:646](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L646)

***

### click

> **click**: `CustomEvent`\<\{ `tile`: `string`; \}\>

Defined in: [src/Tiles.ts:659](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L659)

***

### drag

> **drag**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:653](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L653)

***

### dragend

> **dragend**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:654](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L654)

***

### dragstart

> **dragstart**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:652](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L652)

***

### groupdrag

> **groupdrag**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:656](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L656)

***

### groupdragend

> **groupdragend**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:657](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L657)

***

### groupdragstart

> **groupdragstart**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:655](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L655)

***

### selectionchange

> **selectionchange**: `CustomEvent`\<\{ `tiles`: `string`[]; \}\>

Defined in: [src/Tiles.ts:658](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L658)

***

### stateupdate

> **stateupdate**: `CustomEvent`\<[`State`](../classes/State.md)\>

Defined in: [src/Tiles.ts:651](https://github.com/hydroperx/tiles.js/blob/30be6d2c8ef62743bc7ae5f73140af2fd89e74b6/src/Tiles.ts#L651)
