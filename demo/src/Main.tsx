import { TileExpert } from "com.hydroper.tileexpert";

const container = document.querySelector("#container")!;

const tile_expert = new TileExpert({
    element: container,
    direction: "horizontal",
    rtl: false,
    labelClassName: "label",
    tileClassName: "tile",
    smallSize: 2,
    tileGap: 0.9,
    groupGap: 2,
    groupLabelHeight: 2,
    maxHeight: 6,
});

tile_expert.addGroup({
    id: "group1",
    index: 0,
    label: "Group 1",
});

const tile1 = tile_expert.addTile({
    id: "tile1",
    group: "group1",
    x: 0,
    y: 0,
    size: "large",
});
tile1.style.background = "red";

const tile2 = tile_expert.addTile({
    id: "tile2",
    group: "group1",
    x: 4,
    y: 0,
    size: "wide",
});
tile2.style.background = "green";

tile_expert.addGroup({
    id: "group2",
    index: 0,
    label: "Group 1",
});

const tile3 = tile_expert.addTile({
    id: "tile3",
    group: "group2",
    x: 0,
    y: 0,
    size: "small",
});
tile3.style.background = "blue";