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
   * Ordered groups.
   */
  public readonly groups: LayoutGroup[] = [];

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
  /**
   * Unordered tiles.
   */
  public readonly tiles: LayoutTile[] = [];

  /**
   * Cassowary constrant solver for tiles.
   */
  public readonly solver: kiwi.Solver = new kiwi.Solver();

  /**
   * Group's width in cascading `rem` units.
   */
  public widthREM: number = 0;

  /**
   * Group's height in cascading `rem` units.
   */
  public heightREM: number = 0;

  /**
   * Constructor.
   */
  public constructor(
    public $: Layout,
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
        this.solver.removeConstraint(c);
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

        this.solver.addConstraint(xConstraint);
        this.solver.addConstraint(xConstraint);

        a.nonOverlappingConstraints.push(xConstraint, yConstraint);
      }
    }
  }
}

/**
 * Tile.
 */
export class LayoutTile {
  /**
   * Minimum X/Y constraints.
   */
  public minConstraints: kiwi.Constraint[] = [];
  /**
   * Maximum X constraint.
   */
  public maxXConstraint: null | kiwi.Constraint = null;
  /**
   * Maximum Y constraint.
   */
  public maxYConstraint: null | kiwi.Constraint = null;
  /**
   * Non-overlapping constraint.
   */
  public nonOverlappingConstraints: kiwi.Constraint[] = [];

  /**
   * X variable in small tiles.
   */
  public readonly x: kiwi.Variable = new kiwi.Variable();

  /**
   * Y variable in small tiles.
   */
  public readonly y: kiwi.Variable = new kiwi.Variable();

  /**
   * Width variable in small tiles.
   */
  public readonly width: kiwi.Variable = new kiwi.Variable();

  /**
   * Height variable in small tiles.
   */
  public readonly height: kiwi.Variable = new kiwi.Variable();

  /**
   * Cosntructor.
   * @param button If `null` indicates this is a placeholder tile.
   */
  public constructor(
    private $: LayoutGroup,
    public readonly id: string,
    public readonly button: null | HTMLButtonElement
  ) {
    // Refresh min/max constraints
    this.refreshMinConstraints();
    this.refreshMaxConstraints();
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
   * Clears constraints.
   */
  public clearConstraints(): void {
    for (const c of this.constraints) {
      this.$.solver.removeConstraint(c);
    }
    this.minConstraints.length = 0;
    this.nonOverlappingConstraints.length = 0;
    this.maxXConstraint = null;
    this.maxYConstraint = null;
  }

  /**
   * Refreshes minimum-X/Y constraints.
   */
  public refreshMinConstraints(): void {
    const minXConstraint = new kiwi.Constraint(this.x, kiwi.Operator.Ge, 0);
    const minYConstraint = new kiwi.Constraint(this.y, kiwi.Operator.Ge, 0);
    this.$.solver.addConstraint(minXConstraint);
    this.$.solver.addConstraint(minYConstraint);
    this.minConstraints.push(
      minXConstraint,
      minYConstraint,
    );
  }

  public refreshMaxConstraints(): void {
    // maximum X/Y constraint
    if (this.$.$.$._dir == "horizontal") {
      this.refreshMaxYConstraint();
    } else {
      this.refreshMaxXConstraint();
    }
  }

  /**
   * Refreshes maximum-X constraint.
   */
  public refreshMaxXConstraint(): void {
    if (this.maxXConstraint) {
      this.$.solver.removeConstraint(this.maxXConstraint!);
    }
    this.maxXConstraint = new kiwi.Constraint(this.x.plus(this.width), kiwi.Operator.Le, this.$.$.$._group_width - 1);
    this.$.solver.addConstraint(this.maxXConstraint!);
  }

  /**
   * Refreshes maximum-Y constraint.
   */
  public refreshMaxYConstraint(): void {
    if (this.maxYConstraint) {
      this.$.solver.removeConstraint(this.maxYConstraint!);
    }
    this.maxYConstraint = new kiwi.Constraint(this.y.plus(this.height), kiwi.Operator.Le, this.$.$.$._height - 1);
    this.$.solver.addConstraint(this.maxYConstraint!);
  }
}