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
  public constraints: kiwi.Constraint[] = [];
  public maxXConstraint: null | kiwi.Constraint = null;
  public maxYConstraint: null | kiwi.Constraint = null;

  /**
   * Cosntructor.
   */
  constructor(
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
    this.constraints.push(
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
   * Refreshes maximum-X constraint.
   */
  refreshMaxXConstraint(): void {
    if (this.maxXConstraint) {
      this.$.solver.removeConstraint(this.maxXConstraint!);
    }
    this.maxXConstraint = new kiwi.Constraint(this.x.plus(this.width), kiwi.Operator.Le, this.$.$._group_width - 1);
    this.$.solver.addConstraint(this.maxXConstraint!);
  }

  /**
   * Refreshes maximum-Y constraint.
   */
  refreshMaxYConstraint(): void {
    if (this.maxYConstraint) {
      this.$.solver.removeConstraint(this.maxYConstraint!);
    }
    this.maxYConstraint = new kiwi.Constraint(this.y.plus(this.height), kiwi.Operator.Le, this.$.$._height - 1);
    this.$.solver.addConstraint(this.maxYConstraint!);
  }
}