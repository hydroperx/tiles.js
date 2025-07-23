import * as kiwi from "@lume/kiwi";
import { gsap } from "gsap";
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

  /**
   * Rearranges group tiles.
   */
  public abstract rearrange(): void;
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
  public solver: kiwi.Solver = new kiwi.Solver();

  /**
   * Constructor.
   */
  public constructor(
    public $: Layout,
    public id: string,
    public div: HTMLDivElement,
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

  /**
   * Rearranges group tiles and resizes the group's tiles div.
   */
  public rearrange(): void {
    // Update Cassowary variables
    this.solver.updateVariables();

    // Reposition tiles (update the group's width/height EM together)
    let changed = false;
    let
      tiles_width_em: number = 0,
      tiles_height_em: number = 0;
    if (this.$.$._dir == "vertical") {
      tiles_width_em =
        this.$.$._group_width * this.$.$._small_size +
        (this.$.$._group_width - 1) * this.$.$._tile_gap;
    }
    const to_tween_y_late: { tile: LayoutTile, button: HTMLButtonElement, hEM: number, yEM: number }[] = [];
    for (const tile of this.tiles) {
      const x_em = tile.x.value() * this.$.$._small_size + tile.x.value() * this.$.$._tile_gap;
      const y_em = tile.y.value() * this.$.$._small_size + tile.y.value() * this.$.$._tile_gap;

      const w_em = tile.width * this.$.$._small_size + (tile.width - 1) * this.$.$._tile_gap;
      const h_em = tile.height * this.$.$._small_size + (tile.height - 1) * this.$.$._tile_gap;
      // change tiles size em
      tiles_width_em = Math.max(x_em + w_em, tiles_width_em);
      tiles_height_em = Math.max(y_em + h_em, tiles_height_em);

      // new X/Y state
      const state = this.$.$._state.tiles.get(tile.id);
      if (state) {
        const
          old_x = state.x,
          old_y = state.y;
        state.x = tile.x.value();
        state.y = tile.y.value();
        if (!(old_x == state.x && old_y == state.y)) {
          changed = true;

          // affect button
          if (tile.button) {
            if (tile.positioned) {
              if (tile.tween) {
                tile.tween.kill();
              }
              if (old_x != state.x && old_y != state.y) {
                // change only Y
                tile.button!.style.transform = `translateX(${x_em}em) translateY(-1000em)`;
                to_tween_y_late.push({ tile, button: tile.button!, hEM: h_em, yEM: y_em });
              } else {
                // change either only X or only Y
                tile.tween = gsap.to(tile.button!, {
                  x: x_em + "em",
                  y: y_em + "em",
                  duration: 0.18
                });
              }
            // first position
            } else {
              tile.button!.style.transform = `translateX(${x_em}em) translateY(${y_em}em)`;
              tile.positioned = true;
            }
          }
        }
      }
    }

    // Tween Y from off view
    const middle = tiles_height_em / 2;
    for (const { tile, button, hEM, yEM } of to_tween_y_late) {
      tile.tween = gsap.fromTo(tile.button!,
        {
          y: (yEM + hEM / 2 < middle ? -hEM : tiles_height_em + hEM) + "em",
        },
        {
          y: yEM + "em",
          duration: 0.18
        }
      );
    }

    // Resize groupTiles div
    const group_tiles_div = this.div.getElementsByClassName(this.$.$._class_names.groupTiles)[0] as HTMLElement;
    let min_w = 0;
    if (this.$.$._dir == "horizontal") {
      min_w = 18;
    }
    group_tiles_div.style.width = Math.max(min_w, tiles_width_em) + "em";
    group_tiles_div.style.height = tiles_height_em + "em";

    // State update signal
    if (changed) {
      this.$.$._deferred_state_update_signal();
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
   * Cached tween.
   */
  public tween: null | gsap.core.Tween = null;

  /**
   * Cached indicator for initial position.
   */
  public positioned: boolean = false;

  /**
   * Cosntructor.
   * @param button If `null` indicates this is a placeholder tile.
   * @param x X variable in small tiles.
   * @param y Y variable in small tiles.
   * @param width Width variable in small tiles.
   * @param height Height variable in small tiles.
   */
  public constructor(
    private $: LayoutGroup,
    public readonly id: string,
    public readonly button: null | HTMLButtonElement,
    public readonly x: kiwi.Variable,
    public readonly y: kiwi.Variable,
    public width: number,
    public height: number
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
    for (const c of this.minConstraints) {
      this.$.solver.removeConstraint(c);
    }
    this.minConstraints.length = 0;
    const minXConstraint = new kiwi.Constraint(this.x, kiwi.Operator.Ge, 0);
    const minYConstraint = new kiwi.Constraint(this.y, kiwi.Operator.Ge, 0);
    this.$.solver.addConstraint(minXConstraint);
    this.$.solver.addConstraint(minYConstraint);
    this.minConstraints.push(
      minXConstraint,
      minYConstraint,
    );
  }

  /**
   * Refreshes maximum-X/Y constraints.
   */
  public refreshMaxConstraints(): void {
    if (this.maxXConstraint) {
      this.$.solver.removeConstraint(this.maxXConstraint!);
      this.maxXConstraint = null;
    }
    if (this.maxYConstraint) {
      this.$.solver.removeConstraint(this.maxYConstraint!);
      this.maxYConstraint = null;
    }
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