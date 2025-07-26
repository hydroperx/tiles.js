[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / TilesEventMap

# Type Alias: TilesEventMap

> **TilesEventMap** = `object`

Defined in: [src/Tiles.ts:636](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L636)

Tiles event map.

## Properties

### addedgroup

> **addedgroup**: `CustomEvent`\<\{ `div`: `HTMLDivElement`; `group`: [`LayoutGroup`](../classes/LayoutGroup.md); `labelDiv`: `HTMLDivElement`; `tilesDiv`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:637](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L637)

***

### addedtile

> **addedtile**: `CustomEvent`\<\{ `button`: `HTMLButtonElement`; `contentDiv`: `HTMLDivElement`; `tile`: [`LayoutTile`](../classes/LayoutTile.md); \}\>

Defined in: [src/Tiles.ts:643](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L643)

***

### click

> **click**: `CustomEvent`\<\{ `tile`: `string`; \}\>

Defined in: [src/Tiles.ts:656](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L656)

***

### drag

> **drag**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:650](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L650)

***

### dragend

> **dragend**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:651](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L651)

***

### dragstart

> **dragstart**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:649](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L649)

***

### groupdrag

> **groupdrag**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:653](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L653)

***

### groupdragend

> **groupdragend**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:654](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L654)

***

### groupdragstart

> **groupdragstart**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:652](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L652)

***

### selectionchange

> **selectionchange**: `CustomEvent`\<\{ `tiles`: `string`[]; \}\>

Defined in: [src/Tiles.ts:655](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L655)

***

### stateupdate

> **stateupdate**: `CustomEvent`\<[`State`](../classes/State.md)\>

Defined in: [src/Tiles.ts:648](https://github.com/hydroperx/tiles.js/blob/6f7ee08513ccd02bdcfad3a542e4d910ec6e8908/src/Tiles.ts#L648)
