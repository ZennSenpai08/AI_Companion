/** @typedef {{x:number,y:number,width:number,height:number}} Rect */
/** Clamp a saved window to a currently connected work area, retaining negative monitors.
 * @param {unknown} saved @param {Rect[]} areas @returns {Rect} */
function recoverBounds(saved, areas) {
  if (!areas.length) throw new Error('No monitor work area');
  const raw = saved && typeof saved === 'object' ? saved : {};
  /** @param {string} key @param {number} fallback */
  const value = (key, fallback) => {
    const candidate = Reflect.get(raw, key);
    return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : fallback;
  };
  const box = { x: value('x', areas[0].x + 24), y: value('y', areas[0].y + 24),
    width: value('width', 320), height: value('height', 460) };
  const area = areas.find(a => box.x >= a.x && box.x < a.x + a.width &&
    box.y >= a.y && box.y < a.y + a.height) ?? areas[0];
  const width = Math.round(Math.min(Math.max(box.width, 240), Math.min(800, area.width)));
  const height = Math.round(Math.min(Math.max(box.height, 300), Math.min(1000, area.height)));
  return { width, height,
    x: Math.round(Math.max(area.x, Math.min(box.x, area.x + area.width - width))),
    y: Math.round(Math.max(area.y, Math.min(box.y, area.y + area.height - height))) };
}
module.exports = { recoverBounds };
