/**
 * Computes the direct padding of an element as pixels.
 * @returns Pixel values.
 */
export function padding(el: HTMLElement): { left: number, right: number, top: number, bottom: number } {
  const c = window.getComputedStyle(el);
  return {
    left: parseFloat(c.paddingLeft.replace("px", "")),
    right: parseFloat(c.paddingRight.replace("px", "")),
    top: parseFloat(c.paddingTop.replace("px", "")),
    bottom: parseFloat(c.paddingBottom.replace("px", "")),
  };
}