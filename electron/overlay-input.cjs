/** Explicit click through overrides all regions; transparent space never captures input.
 * @param {boolean} clickThrough @param {boolean} interactive */
function ignoreOverlayMouse(clickThrough, interactive) { return clickThrough || !interactive; }
module.exports = { ignoreOverlayMouse };
