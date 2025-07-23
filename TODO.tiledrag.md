- [ ] Finish TileDraggableBehavior (contribute to `_tile_draggables`)
- [ ] Use threshold for Draggable (`"1em"`)

# Drag start

- [ ] Disable pointer events for the entire Tiles container.
- [ ] Set `.style.pointerEvents = "auto";` for the tile's button itself.

# Drag move

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