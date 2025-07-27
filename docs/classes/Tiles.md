[**@hydroperx/tiles**](../README.md)

***

[@hydroperx/tiles](../globals.md) / Tiles

# Class: Tiles

Defined in: [src/Tiles.ts:26](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L26)

Tiles layout.

## Extends

- `IntermediateEventTarget`\<[`TilesEventMap`](../type-aliases/TilesEventMap.md), `this`\>

## Constructors

### Constructor

> **new Tiles**(`params`): `Tiles`

Defined in: [src/Tiles.ts:121](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L121)

#### Parameters

##### params

###### classNames

\{ `group`: `string`; `groupLabel`: `string`; `groupLabelText`: `string`; `groupTiles`: `string`; `tile`: `string`; `tileContent`: `string`; \}

Customisable class names.

###### classNames.group

`string`

Class name used for identifying groups.

###### classNames.groupLabel

`string`

Class name used for identifying group labels.

###### classNames.groupLabelText

`string`

Class name used for identifying group label texts.

###### classNames.groupTiles

`string`

Class name used for identifying the group tiles container.

###### classNames.tile

`string`

Class name used for identifying tiles.

###### classNames.tileContent

`string`

Class name used for identifying tile contents.

###### direction

`"horizontal"` \| `"vertical"`

The direction of the tile container.

###### dragEnabled?

`boolean`

Whether drag-n-drop is enabled.

**Default**

```ts
true
```

###### element

`Element`

Container.

###### groupGap

`number`

Gap between groups, in cascading `em` units.

###### groupRemovalWork?

(`div`) => `Promise`\<`void`\>

Work to do before removing a group from the DOM.
This is typically used for tweening the group view.

###### groupWidth?

`number`

Group width in small tiles, effective only
in vertical containers (must be >= 4).

**Default**

```ts
6
```

###### height?

`number`

Height in small tiles, effective only
in horizontal containers (must be >= 4).

**Default**

```ts
6
```

###### inlineGroups?

`number`

Number of inline groups, effective only
in vertical containers (must be >= 1).

**Default**

```ts
1
```

###### labelHeight

`number`

Group label height in the cascading `em` unit.

###### selectionEnabled?

`boolean`

Whether tile selection is enabled.

**Default**

```ts
true
```

###### smallSize

`number`

The size of small tiles, in cascading `em` units.

###### tileGap

`number`

Gap between tiles, in cascading `em` units.

###### tileRemovalWork?

(`button`) => `Promise`\<`void`\>

Work to do before removing a tile from the DOM.
This is typically used for tweening the tile view.

#### Returns

`Tiles`

#### Overrides

`(EventTarget as TypedEventTarget<TilesEventMap>).constructor`

## Properties

### ATTR\_CHECKED

> `readonly` `static` **ATTR\_CHECKED**: `"data-checked"` = `Attributes.ATTR_CHECKED`

Defined in: [src/Tiles.ts:42](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L42)

Attribute name used for indicating that a tile is checked.

***

### ATTR\_DRAGGING

> `readonly` `static` **ATTR\_DRAGGING**: `"data-dragging"` = `Attributes.ATTR_DRAGGING`

Defined in: [src/Tiles.ts:38](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L38)

Attribute name used for indicating that a tile is actively in drag.

***

### ATTR\_ID

> `readonly` `static` **ATTR\_ID**: `"data-id"` = `Attributes.ATTR_ID`

Defined in: [src/Tiles.ts:30](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L30)

Attribute name used for identifying a tile's ID.

***

### ATTR\_SIZE

> `readonly` `static` **ATTR\_SIZE**: `"data-size"` = `Attributes.ATTR_SIZE`

Defined in: [src/Tiles.ts:34](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L34)

Attribute name used for indicating a tile's size.

## Accessors

### inlineGroups

#### Get Signature

> **get** **inlineGroups**(): `number`

Defined in: [src/Tiles.ts:586](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L586)

Indicates the number of inline groups in a vertical layout.

##### Throws

If not in a vertical layout.

##### Returns

`number`

#### Set Signature

> **set** **inlineGroups**(`val`): `void`

Defined in: [src/Tiles.ts:589](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L589)

##### Parameters

###### val

`number`

##### Returns

`void`

***

### state

#### Get Signature

> **get** **state**(): [`State`](State.md)

Defined in: [src/Tiles.ts:286](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L286)

The overall tiles state.

##### Returns

[`State`](State.md)

## Methods

### addEventListener()

#### Call Signature

> **addEventListener**\<`K`\>(`type`, `callback`, `options?`): `void`

Defined in: node\_modules/@hydroperx/event/dist/index.d.ts:5

Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener)

##### Type Parameters

###### K

`K` *extends* keyof [`TilesEventMap`](../type-aliases/TilesEventMap.md)

##### Parameters

###### type

`K`

###### callback

(`event`) => [`TilesEventMap`](../type-aliases/TilesEventMap.md)\[`K`\] *extends* `Event` ? `void` : `never`

###### options?

`boolean` | `AddEventListenerOptions`

##### Returns

`void`

##### Inherited from

`(EventTarget as TypedEventTarget<TilesEventMap>).addEventListener`

#### Call Signature

> **addEventListener**(`type`, `callback`, `options?`): `void`

Defined in: node\_modules/@hydroperx/event/dist/index.d.ts:6

Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener)

##### Parameters

###### type

`string`

###### callback

`null` | `EventListenerOrEventListenerObject`

###### options?

`boolean` | `EventListenerOptions`

##### Returns

`void`

##### Inherited from

`(EventTarget as TypedEventTarget<TilesEventMap>).addEventListener`

***

### addGroup()

> **addGroup**(`params`): `void`

Defined in: [src/Tiles.ts:357](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L357)

Adds a group to the end and returns its `div` element.

#### Parameters

##### params

[`AddGroupParams`](../type-aliases/AddGroupParams.md)

#### Returns

`void`

#### Throws

If group ID is duplicate.

***

### addTile()

> **addTile**(`params`): `boolean`

Defined in: [src/Tiles.ts:381](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L381)

Attempts to add a tile.

If both `x` and `y` are null, this method always succeeds,
adding the tile to the best position available.

#### Parameters

##### params

[`AddTileParams`](../type-aliases/AddTileParams.md)

#### Returns

`boolean`

`true` if successfully added tile; `false` otherwise.
It can fail depending on the `x` and `y` parameters.

#### Throws

If tile ID is duplicate.

#### Throws

If group is specified and does not exist.

#### Throws

If either of `x` and `y` are `null`, but not both.

***

### checkedTiles()

> **checkedTiles**(): `string`[]

Defined in: [src/Tiles.ts:489](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L489)

Returns which tiles are checked.

#### Returns

`string`[]

***

### clear()

> **clear**(): `void`

Defined in: [src/Tiles.ts:293](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L293)

Clears everything.

#### Returns

`void`

***

### destroy()

> **destroy**(`removeFromDOM`): `void`

Defined in: [src/Tiles.ts:330](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L330)

Destroys the `Tiles` instance, disposing
of any observers and removing the container from the DOM.

#### Parameters

##### removeFromDOM

`boolean` = `true`

#### Returns

`void`

***

### dispatchEvent()

> **dispatchEvent**(`event`): `boolean`

Defined in: node\_modules/typescript/lib/lib.dom.d.ts:8309

Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent)

#### Parameters

##### event

`Event`

#### Returns

`boolean`

#### Inherited from

`(EventTarget as TypedEventTarget<TilesEventMap>).dispatchEvent`

***

### getChecked()

> **getChecked**(`tile`): `boolean`

Defined in: [src/Tiles.ts:502](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L502)

Returns whether a tile is checked or not.

#### Parameters

##### tile

`string`

#### Returns

`boolean`

***

### inlineGroupsAvailable()

> **inlineGroupsAvailable**(`width`): `number`

Defined in: [src/Tiles.ts:561](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L561)

Returns the number of inline groups available for
the given width (either in `px` or `em`).
*Applies to vertical layouts only.*

#### Parameters

##### width

`string`

#### Returns

`number`

#### Throws

If not in a vertical layout.

***

### moveTile()

> **moveTile**(`id`, `x`, `y`): `boolean`

Defined in: [src/Tiles.ts:458](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L458)

Attempts to move a tile.

#### Parameters

##### id

`string`

##### x

`number`

X coordinate in small tiles unit (1x1).

##### y

`number`

Y coordinate in small tiles unit (1x1).

#### Returns

`boolean`

***

### off()

#### Call Signature

> **off**\<`K`\>(`type`, `listenerFn`, `options?`): `void`

Defined in: [src/Tiles.ts:548](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L548)

Shorthand to `removeEventListener()`.

##### Type Parameters

###### K

`K` *extends* keyof [`TilesEventMap`](../type-aliases/TilesEventMap.md)

##### Parameters

###### type

`K`

###### listenerFn

(`event`) => `void`

###### options?

`EventListenerOptions`

##### Returns

`void`

#### Call Signature

> **off**(`type`, `listenerFn`, `options?`): `void`

Defined in: [src/Tiles.ts:549](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L549)

Shorthand to `removeEventListener()`.

##### Parameters

###### type

`string`

###### listenerFn

(`event`) => `void`

###### options?

`EventListenerOptions`

##### Returns

`void`

***

### on()

#### Call Signature

> **on**\<`K`\>(`type`, `listenerFn`, `options?`): `void`

Defined in: [src/Tiles.ts:539](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L539)

Shorthand to `addEventListener()`.

##### Type Parameters

###### K

`K` *extends* keyof [`TilesEventMap`](../type-aliases/TilesEventMap.md)

##### Parameters

###### type

`K`

###### listenerFn

(`event`) => `void`

###### options?

`AddEventListenerOptions`

##### Returns

`void`

#### Call Signature

> **on**(`type`, `listenerFn`, `options?`): `void`

Defined in: [src/Tiles.ts:540](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L540)

Shorthand to `addEventListener()`.

##### Parameters

###### type

`string`

###### listenerFn

(`event`) => `void`

###### options?

`AddEventListenerOptions`

##### Returns

`void`

***

### rearrange()

> **rearrange**(): `void`

Defined in: [src/Tiles.ts:601](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L601)

Rearranges the layout.

This call may be necessary if the container is scaled to zero, usable
after the scale is greater than zero.

#### Returns

`void`

***

### rearrangeOverMinimumScale()

> **rearrangeOverMinimumScale**(): `AbortController`

Defined in: [src/Tiles.ts:611](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L611)

Rearranges the layout when the minimum scale to make it work
is reached.

This call may be necessary if the container is initially scaled to zero.

#### Returns

`AbortController`

***

### removeEventListener()

#### Call Signature

> **removeEventListener**\<`K`\>(`type`, `callback`, `options?`): `void`

Defined in: node\_modules/@hydroperx/event/dist/index.d.ts:7

Removes the event listener in target's event listener list with the same type, callback, and options.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/removeEventListener)

##### Type Parameters

###### K

`K` *extends* keyof [`TilesEventMap`](../type-aliases/TilesEventMap.md)

##### Parameters

###### type

`K`

###### callback

(`event`) => [`TilesEventMap`](../type-aliases/TilesEventMap.md)\[`K`\] *extends* `Event` ? `void` : `never`

###### options?

`boolean` | `EventListenerOptions`

##### Returns

`void`

##### Inherited from

`(EventTarget as TypedEventTarget<TilesEventMap>).removeEventListener`

#### Call Signature

> **removeEventListener**(`type`, `callback`, `options?`): `void`

Defined in: node\_modules/@hydroperx/event/dist/index.d.ts:8

Removes the event listener in target's event listener list with the same type, callback, and options.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/removeEventListener)

##### Parameters

###### type

`string`

###### callback

`null` | `EventListenerOrEventListenerObject`

###### options?

`boolean` | `EventListenerOptions`

##### Returns

`void`

##### Inherited from

`(EventTarget as TypedEventTarget<TilesEventMap>).removeEventListener`

***

### removeGroup()

> **removeGroup**(`id`): `void`

Defined in: [src/Tiles.ts:365](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L365)

Removes a group.

#### Parameters

##### id

`string`

#### Returns

`void`

#### Throws

If the group does not exist.

***

### removeTile()

> **removeTile**(`id`): `void`

Defined in: [src/Tiles.ts:389](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L389)

Removes a tile.

#### Parameters

##### id

`string`

#### Returns

`void`

#### Throws

If the tile does not exist.

***

### renameGroup()

> **renameGroup**(`id`, `label`): `void`

Defined in: [src/Tiles.ts:396](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L396)

Renames a group.

#### Parameters

##### id

`string`

##### label

`string`

#### Returns

`void`

***

### resizeTile()

> **resizeTile**(`id`, `size`): `boolean`

Defined in: [src/Tiles.ts:418](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L418)

Attempts to resize a tile.

#### Parameters

##### id

`string`

##### size

[`TileSize`](../type-aliases/TileSize.md)

#### Returns

`boolean`

***

### setChecked()

> **setChecked**(`tile`, `value`): `void`

Defined in: [src/Tiles.ts:511](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L511)

Sets whether a tile is checked or not.

#### Parameters

##### tile

`string`

##### value

`boolean`

#### Returns

`void`

***

### toggleChecked()

> **toggleChecked**(`tile`): `void`

Defined in: [src/Tiles.ts:532](https://github.com/hydroperx/tiles.js/blob/c540bb46b4dec8fde37584a136a0fe29b84e5d4a/src/Tiles.ts#L532)

Toggles whether a tile is checked or not.

#### Parameters

##### tile

`string`

#### Returns

`void`
