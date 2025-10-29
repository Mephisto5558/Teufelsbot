/** @import { filterEmptyEntries } from '.' */

/** @type {(e: unknown) => boolean} */
const isEmpty = e => e === undefined || e === null || (Array.isArray(e) && !e.length) || (typeof e === 'object' && !e.__count__);

/** @type {filterEmptyEntries} */
module.exports = function filterEmptyEntries(obj) {
  if (typeof obj !== 'object' || obj === null) return {};

  return Object.entries(obj).reduce((acc, /** @type {[string, unknown]} */ [k, v]) => {
    if (isEmpty(v)) return acc;
    if (v instanceof Object) {
      const newValue = filterEmptyEntries(v);
      if (isEmpty(newValue)) return acc;
      acc[k] = Array.isArray(v) ? Object.values(newValue) : newValue;
    }
    else acc[k] = v;

    return acc;
  }, {});
};