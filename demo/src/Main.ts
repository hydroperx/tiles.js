import { Tiles } from "@hydroper/tiles";

const container = document.querySelector("#container")!;

const tiles = new Tiles({
    element: container,
    direction: "horizontal",
    labelClassName: "label",
    placeholderClassName: "placeholder",
    tileClassName: "tile",
    smallSize: 3.625,
    tileGap: 0.6,
    groupGap: 9,
    labelHeight: 2,
    maxHeight: 6,
});

tiles.addGroup({
    id: "group1",
    label: "Group 1",
});

const tile1 = tiles.addTile({
    id: "tile1",
    group: "group1",
    x: 0,
    y: 0,
    size: "large",
});
tile1.style.background = "red";

const tile2 = tiles.addTile({
    id: "tile2",
    group: "group1",
    x: 0,
    y: 4,
    size: "wide",
});
tile2.style.background = "green";

tiles.addGroup({
    id: "group2",
    label: "Group 2",
});

const tile3 = tiles.addTile({
    id: "tile3",
    group: "group2",
    x: 0,
    y: 0,
    size: "small",
});
tile3.style.background = "blue";