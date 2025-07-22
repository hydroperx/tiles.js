import * as kiwi from "@lume/kiwi";
import type { Tiles } from "./Tiles";

/**
 * Layout.
 */
export abstract class Layout {
  /**
   * Tiles back-reference.
   */
  public readonly $: Tiles;

  /**
   * Cassowary constrant solver.
   */
  public solver: kiwi.Solver = new kiwi.Solver();

  /**
   * Constructor.
   */
  public constructor($: Tiles) {
    this.$ = $;
  }
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
  public constructor(
    private $: Layout,
    public id: string,
    public label: HTMLDivElement,
  ) {}

  /**
   * Refreshes Cassowary non-overlapping constraints.
   */
  public refreshNonOverlappingConstraints() {
    const l = this.tiles.length;
    for (const t of this.tiles) {
      for (const c of t.nonOverlappingConstraints) {
        this.$.solver.removeConstraint(c);
      }
      t.nonOverlappingConstraints.length = 0;
    }
    for (let i = 0; i < l; i++) {
      const a = this.tiles[i];
      for (let j = 0; j < l; j++) {
        const b = this.tiles[j];

        // Skip identity
        if (a === b) continue;

        // a.x + a.width >= b.x
        const xConstraint = new kiwi.Constraint(a.x.plus(a.width), kiwi.Operator.Ge, b.x);
        // a.y + a.height >= b.y
        const yConstraint = new kiwi.Constraint(a.y.plus(a.height), kiwi.Operator.Ge, b.y);

        this.$.solver.addConstraint(xConstraint);
        this.$.solver.addConstraint(xConstraint);

        a.nonOverlappingConstraints.push(xConstraint, yConstraint);
      }
    }
  }
}

/**
 * Tile.
 */
export class LayoutTile {
  public minConstraints: kiwi.Constraint[] = [];
  public maxXConstraint: null | kiwi.Constraint = null;
  public maxYConstraint: null | kiwi.Constraint = null;
  public nonOverlappingConstraints: kiwi.Constraint[] = [];

  /**
   * Cosntructor.
   */
  public constructor(
    private $: Layout,
    public id: string,
    public button: HTMLButtonElement,
    public x: kiwi.Variable,
    public y: kiwi.Variable,
    public width: kiwi.Variable,
    public height: kiwi.Variable
  ) {
    const minXConstraint = new kiwi.Constraint(x, kiwi.Operator.Ge, 0);
    const minYConstraint = new kiwi.Constraint(y, kiwi.Operator.Ge, 0);
    $.solver.addConstraint(minXConstraint);
    $.solver.addConstraint(minYConstraint);
    this.minConstraints.push(
      minXConstraint,
      minYConstraint,
    );

    // maximum X/Y constraint
    if (this.$.$._dir == "horizontal") {
      this.refreshMaxYConstraint();
    } else {
      this.refreshMaxXConstraint();
    }
  }

  /**
   * All present Cassowary constraints.
   */
  public get constraints(): kiwi.Constraint[] {
    return [
      ...this.minConstraints,
      ...this.nonOverlappingConstraints,
      ...(this.maxXConstraint ? [this.maxXConstraint!] : []),
      ...(this.maxYConstraint ? [this.maxYConstraint!] : [])
    ];
  }

  /**
   * Refreshes maximum-X constraint.
   */
  public refreshMaxXConstraint(): void {
    if (this.maxXConstraint) {
      this.$.solver.removeConstraint(this.maxXConstraint!);
    }
    this.maxXConstraint = new kiwi.Constraint(this.x.plus(this.width), kiwi.Operator.Le, this.$.$._group_width - 1);
    this.$.solver.addConstraint(this.maxXConstraint!);
  }

  /**
   * Refreshes maximum-Y constraint.
   */
  public refreshMaxYConstraint(): void {
    if (this.maxYConstraint) {
      this.$.solver.removeConstraint(this.maxYConstraint!);
    }
    this.maxYConstraint = new kiwi.Constraint(this.y.plus(this.height), kiwi.Operator.Le, this.$.$._height - 1);
    this.$.solver.addConstraint(this.maxYConstraint!);
  }
}