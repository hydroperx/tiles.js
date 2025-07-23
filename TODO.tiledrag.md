- [ ] Finish TileDraggableBehavior (contribute to `_tile_draggables`)
- [ ] Use threshold for Draggable (`"1em"`)
- [ ] Set the `ATTR_DRAGGING` attribute where appropriate.

# Drag start

- [ ] Disable pointer events for the entire Tiles container.
- [ ] Set `.style.pointerEvents = "auto";` for the tile's button itself.
- [ ] While the tile is being dragged, it is moved out of the group div temporarily and appears a direct child of the Tiles container.
- [ ] Remove the tile from the layout.
- [ ] Cache current state (the "old state")
- [ ] Reset ghost tile caches
- [ ] Reset grid snap caches
- [ ] Trigger Tiles drag start event

# Drag move

- [ ] If the tile is removed while dragging
  - [ ] Return
- [ ] In a horizontal container, if dragging tile far orthogonal axis, then switch to far view.
  - [ ] After that, if dragging the tile back to the center, switch back to near view and scroll smoothly to the closest group (look at the Tiles container's nearest horizontally-scrollable parent).
- [ ] Grid snap
  - [ ] Copy the logic for grid snapping from the previous version for determining at which group and X/Y a tile is dragging/dropping over. Cache the grid snap result.
  - [ ] If grid snap resolves successfully
    - [ ] If ghost tile has already been created
      - [ ] Require a X/Y change threshold (of 2 small tiles) to continue procedures from here on
      - [ ] Execute the procedure below for *Reverting a ghost tile*
    - [ ] Insert a ghost tile without button at the layout
    - [ ] Suggest a strong-strength value for the X/Y of that ghost tile
    - [ ] `.refreshNonOverlappingConstraints()`
    - [ ] `._deferred_rearrange()`
  - [ ] Else
    - [ ] If ghost tile has been created
      - [ ] Execute the procedure below for *Reverting a ghost tile*
      - [ ] `.refreshNonOverlappingConstraints()`
      - [ ] `._deferred_rearrange()`
- [ ] Trigger Tiles drag event (regardless of ghost X/Y threshold)

*Reverting a ghost tile*

- [ ] Remove it from the layout
- [ ] Recreate the Cassowary solver for the respective group
- [ ] Update every tile to reflect the old state, keeping any other new tiles as they are (e.g. reflecting the current state).
  - [ ] If the tile to restore has no DOM button, ignore it completely from the procedure.
  - [ ] Use weak-suggestions for each tile's X/Y.

# Drag end

- [ ] Enable pointer events again for the entire Tiles container.
- [ ] Set `.style.pointerEvents = "";` for the tile's button itself.
- [ ] If the tile has been removed from the DOM
  - [ ] Clear constraints from the specified tile.
  - [ ] Uninstall draggable behavior
  - [ ] Remove from state
  - [ ] Remove from layout
  - [ ] If checked, trigger selection change event.
  - [ ] Execute the procedure above for *Reverting a ghost tile*
  - [ ] `.refreshNonOverlappingConstraints()`
  - [ ] `._deferred_rearrange()`
  - [ ] Trigger Tiles drag end event
  - [ ] Return
- [ ] If grid snap resolves to an area in a blank group (e.g. after the last)
  - [ ] ...
- [ ] Else if grid snap resolves correctly
  - [ ] ...
  - [ ] If the previous group is empty, remove it (from state/layout/DOM).
  - [ ] Call `._keep_groups_contiguous()`
  - [ ] `._deferred_rearrange()`
- [ ] Else
  - [ ] Put the tile at the DOM back in the group it was.
  - [ ] Put the tile back at the initial respective layout group.
  - [ ] If there is a ghost tile
    - [ ] Execute the procedure above for *Reverting a ghost tile*
  - [ ] `.refreshNonOverlappingConstraints()`
  - [ ] `._deferred_rearrange()`
- [ ] Trigger Tiles drag end event