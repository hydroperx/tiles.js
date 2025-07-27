import { Tiles } from "@hydroperx/tiles";

const container = document.querySelector("#container")!;

const tiles = new Tiles({
  element: container,
  direction: "horizontal",
  classNames: {
    group: "group",
    groupLabel: "group-label",
    groupLabelText: "group-label-text",
    groupTiles: "group-tiles",
    tile: "tile",
    tileContent: "tile-content",
  },
  smallSize: 3.625,
  tileGap: 0.6,
  groupGap: 3,
  labelHeight: 2,
  height: 6,
});

tiles.on("click", ({ detail: { tile } }) => {
  if (tile == "tile1") {
    alert("red!");
  }
});

tiles.on("addedtile", ({ detail: { tile, button, contentDiv } }) => {
  switch (tile.id) {
    case "tile1": {
      button.style.background = "red";
      break;
    }
    case "tile2": {
      button.style.background = "green";
      break;
    }
    case "tile3": {
      button.style.background = "blue";
      break;
    }
    case "tile4": {
      button.style.background = "yellow";
      break;
    }
  }
  if (tile.id.startsWith("purple")) {
    button.style.background = "purple";
  }
  button.style.outline = "0.5em solid yellow";
});

tiles.addGroup({
  id: "group1",
  label: "Group 1",
});

tiles.addTile({
  id: "tile1",
  group: "group1",
  size: "large",
});

tiles.addTile({
  id: "tile2",
  group: "group1",
  size: "wide",
});

tiles.addGroup({
  id: "group2",
  label: "Group 2",
});

tiles.addTile({
  id: "tile3",
  group: "group2",
  size: "small",
});

tiles.addTile({
  id: "tile4",
  group: "group2",
  size: "small",
});

tiles.addGroup({
  id: "group5",
  label: "Group 5",
});

tiles.addTile({
  id: "purple1",
  group: "group5",
  size: "large",
});

tiles.addTile({
  id: "purple2",
  group: "group5",
  size: "wide",
});

tiles.addGroup({
  id: "group6",
  label: "Group 6",
});

tiles.addTile({
  id: "purple3",
  group: "group6",
  size: "large",
});

tiles.addTile({
  id: "purple4",
  group: "group6",
  size: "small",
});