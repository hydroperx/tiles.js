# Drag start

- [x] Disable `.style.pointerEvents = "none";` for the entire Tiles container.
- [x] Set `.style.pointerEvents = "auto";` for the tile's button itself.
- [x] Set `.style.zIndex = "999999999";` for the tile's button.
- [x] Save drag start (offset, old state and layoutIndex)
- [x] While the tile is being dragged, it is moved out of the group div temporarily and appears a direct child of the Tiles container.
- [x] Remove the tile from the layout.
- [x] Reset ghost tile caches
- [x] Reset grid snap caches
- [x] Set the `ATTR_DRAGGING` attribute to `"true"`.
- [x] Trigger Tiles drag start event

# Drag move

- [x] If the tile is removed while dragging
  - [x] Exit
- [x] Patch the draggable position using `draggable.set(x, y)`
- [ ] In a horizontal container, if dragging tile far orthogonal axis, then switch to far view.
  - [ ] After that, if dragging the tile back to the center, switch back to near view and scroll smoothly to the closest group (look at the Tiles container's nearest horizontally-scrollable parent).
- [x] Grid snap
  - [x] Copy the logic for grid snapping from the previous version for determining at which group and X/Y a tile is dragging/dropping over. Cache the grid snap result.
  - [x] If grid snap resolves successfully to an existing area
    - [x] If ghost tile has already been created
      - [x] Require a X/Y change threshold (of 1 small tile) to continue procedures from here on
      - [x] Execute the procedure below for *Reverting a ghost tile*
    - [x] Insert a ghost tile without button at the layout
    - [x] Suggest a strong-strength value for the X/Y of that ghost tile
    - [x] `._deferred_rearrange()`
  - [x] Else
    - [x] If ghost tile has been created
      - [x] Execute the procedure below for *Reverting a ghost tile*
      - [x] `._deferred_rearrange()`
- [x] Trigger Tiles drag event (regardless of ghost X/Y threshold)

*Reverting a ghost tile*

- [x] Remove it from the layout
- [x] Update every tile to reflect the old state, keeping any other new tiles as they are (e.g. reflecting the current state).
  - [x] Use weak-suggestions for each tile's X/Y.
- [x] Clear the ghost tile cache.

# Drag end

- [x] If `ATTR_DRAGGING` is not `"true"`
  - Return.
- [x] Set `.style.pointerEvents = "";` for the entire Tiles container.
- [x] Set `.style.pointerEvents = "";` for the tile's button itself.
- [x] Set `.style.zIndex = "";` for the tile's button.
- [x] Remove the `ATTR_DRAGGING` attribute.
- [x] If the tile has been removed from the DOM
  - [x] Uninstall draggable behavior
  - [x] Remove from state
  - [x] Remove from `$._buttons`
  - [x] If checked, trigger selection change event.
  - [x] If there is a ghost tile
    - [x] Execute the procedure above for *Reverting a ghost tile*
  - [x] `._deferred_rearrange()`
  - [x] Trigger Tiles drag end event
  - [x] `._deferred_state_update_signal()`
  - [x] Return
- [x] If grid snap resolves successfully to an existing area
  - [x] Remove the ghost tile from the layout
  - [x] Put the tile in the new layout group
  - [x] Move the tile to the new group's tilesDiv DOM.
  - [x] Set `button.style.inset = "";`.
  - [x] Set the tile state's group field.
  - [x] For each other tile in the layout group
    - [x] Suggest X/Y weakly reflecting the current state.
  - [x] Suggest X/Y weakly for the layout tile
- [x] Else if grid snap resolves successfully to a blank area
  - [x] Let group = anonymous auto-generated ID
  - [x] Create new group `group`
  - [x] Put the tile in the new layout group
  - [x] Put the tile at the new group's tilesDiv DOM.
  - [x] Set `button.style.inset = "";`.
  - [x] Set the tile state's group field.
  - [x] Suggest X/Y weakly for the layout tile
  - [x] If the previous group is empty, remove it (from state/layout/DOM).
  - [x] Else call `._deferred_rearrange()` and `._deferred_state_update_signal()`
- [x] Else
  - [x] Move the tile to the DOM back in the group it was.
  - [x] Put the tile back at the initial respective layout group (at the initial index it was (`drag_start.layoutIndex`)).
  - [x] Set `button.style.inset = "";`.
  - [x] If there is a ghost tile
    - [x] Execute the procedure above for *Reverting a ghost tile*
  - [x] Update every tile to reflect the old state, keeping any other new tiles as they are (e.g. reflecting the current state).
    - [x] Use weak-suggestions for each tile's X/Y.
  - [x] `._deferred_rearrange()`
  - [x] `._deferred_state_update_signal()`
- [x] Trigger Tiles drag end event