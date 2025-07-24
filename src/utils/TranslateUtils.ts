/**
 * Computes the direct cascading translate X/Y of an element as pixels.
 */
export function ownTranslate(el: HTMLElement): { x: number, y: number } {
  // Get computed style
  const computed_style = window.getComputedStyle(el);

  // Try looking at translate
  const { translate } = computed_style;
  if (translate && translate !== "none") {
    const values = translate.split(/\s+/).map(s => parseFloat(s.replace(/[a-z_]+$/i, "")));
    return { x: values[0], y: values.length > 1 ? values[1] : values[0] };
  }

  // Try looking at transform
  const { transform } = computed_style;
  if (transform && transform !== "none") {
    const match = transform.match(/^matrix\((.+)\)$/);
    if (match) {
      const values = match[1].split(",").map(parseFloat);
      // 2D matrix: a, b, c, d, e, f
      // translateX = e, translateY = f
      const e = values[4], f = values[5];
      return { x: e, y: f };
    }

    const match3d = transform.match(/^matrix3d\((.+)\)$/);
    if (match3d) {
      const values = match3d[1].split(",").map(parseFloat);
      return { x: values[12], y: values[13] };
    }
  }

  return { x: 0, y: 0 };
}