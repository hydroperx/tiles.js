/**
 * Determines the side that a moving rectangle hits of another rectangle.
 *
 * @param moving The moving rectangle.
 * @param hitting The rectangle to be hit.
 * @returns The side of `hitted` that `draggable` hits.
 */
export function side(
  moving: { x: number; y: number; width: number; height: number },
  hitting: { x: number; y: number; width: number; height: number },
): "top" | "bottom" | "left" | "right" | null {
  // ChatGPT-based

  let { x: xA, y: yA, width: wA, height: hA } = hitting;
  let { x: xB, y: yB, width: wB, height: hB } = moving;

  // Compute overlap distances
  let leftOverlap = Math.max(0, xA + wA - xB);
  let rightOverlap = Math.max(0, xB + wB - xA);
  let topOverlap = Math.max(0, yA + hA - yB);
  let bottomOverlap = Math.max(0, yB + hB - yA);

  // Find the side with maximum overlap
  let maxOverlap = Math.max(
    leftOverlap,
    rightOverlap,
    topOverlap,
    bottomOverlap,
  );

  if (maxOverlap === leftOverlap) return "left";
  if (maxOverlap === rightOverlap) return "right";
  if (maxOverlap === topOverlap) return "top";
  if (maxOverlap === bottomOverlap) return "bottom";

  return null; // No overlap
}
