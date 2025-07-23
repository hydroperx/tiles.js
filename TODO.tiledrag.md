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

# Drag move

- [ ] In a horizontal container, if dragging tile far orthogonal axis, then switch to far view.
  - [ ] After that, if dragging the tile back to the center, switch back to near view and scroll smoothly to the closest group (look at the Tiles container's nearest horizontally-scrollable parent).
- [ ] Placeholder 
  - [ ] Insert ghost tile without button at the layout
  - [ ] Suggest a strong-strength value for X/Y of that tile
  - [ ] `.refreshNonOverlappingConstraints()`

# Drag end

- [ ] Put pointer events enabled back for the entire Tiles container.
- [ ] Set `.style.pointerEvents = "";` for the tile's button itself.

# ETC...

- Figure out grid-snapping plans.
- Figure out shifting plans.