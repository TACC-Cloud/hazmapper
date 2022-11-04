// TODO: Adjust for case where color is not reversible to original
// (minimize percentage or eliminate)
export const adjustBrightness = (color: string, percent: number) => {
  const hex = parseInt(color.replace('#', ''), 16);
  const adjustment = Math.round(2.55 * percent);
  const R = (hex >> 16) + adjustment;
  const B = ((hex >> 8) & 0x00ff) + adjustment;
  const G = (hex & 0x0000ff) + adjustment;

  const adjusted = (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)
  )
    .toString(16)
    .slice(1);

  return '#' + adjusted;
};
