export default graphic => {
  graphic.origin.x = -0.5 * graphic.width;
  graphic.origin.y = -0.5 * graphic.height;
  return graphic;
}
