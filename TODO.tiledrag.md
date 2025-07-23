- [ ] Finish TileDraggableBehavior (contribute to `_tile_draggables`)
- [ ] Use threshold for Draggable (`"1em"`)
- [ ] Tile placeholders have strong-strength suggestions.
- [ ] Tiles restored from old state have medium-strength suggestions.
  - [ ] For restoring, reset the Cassowary solver for the respective group.
  - [ ] Note that restoring needs to take care of newly added tiles as well.
- [ ] Set the `ATTR_DRAGGING` attribute where appropriate.

# Drag start

- [ ] Disable pointer events for the entire Tiles container.
- [ ] Set `.style.pointerEvents = "auto";` for the tile's button itself.
- [ ] While the tile is being dragged, it is moved out of the group div temporarily and appears a direct child of the Tiles container.
- [ ] Cache current state (the "old state")

# Drag move

- [ ] In a horizontal container, if dragging tile far orthogonal axis, then switch to far view.
  - [ ] After that, if dragging the tile back to the center, switch back to near view and scroll smoothly to the closest group (look at the Tiles container's nearest horizontally-scrollable parent).
- [ ] Grid snap
  - [ ] Copy the logic for grid snapping from the previous version for determining at which group and X/Y a tile is dragging/dropping over.
  - [ ] If ghost tile has already been created
    - [ ] Require a X/Y change threshold (of 2 small tiles) to continue procedures from here on
    - [ ] Execute the procedure below for *Reverting a ghost tile*
  - [ ] Insert a ghost tile without button at the layout
  - [ ] Suggest a strong-strength value for the X/Y of that ghost tile
  - [ ] `.refreshNonOverlappingConstraints()`
  - [ ] `._deferred_rearrange()`

*Reverting a ghost tile*

- [ ] Remove it from the layout
- [ ] Recreate the Cassowary solver for the respective group
- [ ] Update every tile to reflect the old state, keeping any other new tiles as they are (e.g. reflecting the current state).
  - [ ] Use strong-suggestions for each tile's X/Y.

# Drag end

- [ ] Put pointer events enabled back for the entire Tiles container.
- [ ] Set `.style.pointerEvents = "";` for the tile's button itself.