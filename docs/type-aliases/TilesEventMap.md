[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / TilesEventMap

# Type Alias: TilesEventMap

> **TilesEventMap** = `object`

Defined in: [src/Tiles.ts:649](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L649)

Tiles event map.

## Properties

### addedgroup

> **addedgroup**: `CustomEvent`\<\{ `div`: `HTMLDivElement`; `group`: [`LayoutGroup`](../classes/LayoutGroup.md); `labelDiv`: `HTMLDivElement`; `tilesDiv`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:650](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L650)

***

### addedtile

> **addedtile**: `CustomEvent`\<\{ `button`: `HTMLButtonElement`; `contentDiv`: `HTMLDivElement`; `tile`: [`LayoutTile`](../classes/LayoutTile.md); \}\>

Defined in: [src/Tiles.ts:656](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L656)

***

### click

> **click**: `CustomEvent`\<\{ `tile`: `string`; \}\>

Defined in: [src/Tiles.ts:669](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L669)

***

### drag

> **drag**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:663](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L663)

***

### dragend

> **dragend**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:664](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L664)

***

### dragstart

> **dragstart**: `CustomEvent`\<\{ `tile`: `HTMLButtonElement`; \}\>

Defined in: [src/Tiles.ts:662](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L662)

***

### groupdrag

> **groupdrag**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:666](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L666)

***

### groupdragend

> **groupdragend**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:667](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L667)

***

### groupdragstart

> **groupdragstart**: `CustomEvent`\<\{ `group`: `HTMLDivElement`; \}\>

Defined in: [src/Tiles.ts:665](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L665)

***

### selectionchange

> **selectionchange**: `CustomEvent`\<\{ `tiles`: `string`[]; \}\>

Defined in: [src/Tiles.ts:668](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L668)

***

### stateupdate

> **stateupdate**: `CustomEvent`\<[`State`](../classes/State.md)\>

Defined in: [src/Tiles.ts:661](https://github.com/hydroperx/tiles.js/blob/af11a201a74d02cee143046c2bd205f8f79b4904/src/Tiles.ts#L661)
