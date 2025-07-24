// Third-party
import { OffsetType } from "getoffset";

/**
 * Divides offset in-place, generated originally by
 * `getOffset()` from the `getoffset` module.
 */
export function divideOffsetBy(offset: OffsetType, divisor: number): void {
  offset.x /= divisor;
  offset.y /= divisor;
  offset.left = offset.x;
  offset.top = offset.y;
  offset.width /= divisor;
  offset.height /= divisor;
  offset.w = offset.width;
  offset.h = offset.height;
  offset.bottom /= divisor;
  offset.right /= divisor;
}