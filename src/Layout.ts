/**
 * Layout.
 */
export abstract class Layout {
  //
}

/**
 * Group.
 */
export class LayoutGroup {
  // Random order tiles
  public tiles: LayoutTile[] = [];

  /**
   * Constructor.
   */
  constructor(
    private $: Layout,
    public id: string,
    public label: HTMLDivElement,
  ) {}
}

/**
 * Tile.
 */
export class LayoutTile {
  constructor(
    public id: string,
    public button: HTMLButtonElement,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}
}