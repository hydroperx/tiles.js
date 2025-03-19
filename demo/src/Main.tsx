import { LiveTiles } from "com.hydroper.livetiles.base";

const container = document.querySelector("#container")!;

const live_tiles = new LiveTiles({
    element: container,
    direction: "horizontal",
    labelClassName: "label",
    tileClassName: "tile",
    smallSize: 3.625,
    tileGap: 0.6,
    groupGap: 3,
    labelHeight: 2,
    maxHeight: 6,
    scrollNode: undefined,
});

live_tiles.addGroup({
    id: "group1",
    index: 0,
    label: "Group 1",
});

const tile1 = live_tiles.addTile({
    id: "tile1",
    group: "group1",
    x: 0,
    y: 0,
    size: "large",
});
tile1.style.background = "red";

const tile2 = live_tiles.addTile({
    id: "tile2",
    group: "group1",
    x: 0,
    y: 4,
    size: "wide",
});
tile2.style.background = "green";

live_tiles.addGroup({
    id: "group2",
    index: 1,
    label: "Group 2",
});

const tile3 = live_tiles.addTile({
    id: "tile3",
    group: "group2",
    x: 0,
    y: 0,
    size: "small",
});
tile3.style.background = "blue";