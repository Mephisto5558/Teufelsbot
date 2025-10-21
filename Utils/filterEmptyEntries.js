/** @import { filterEmptyEntries } from '.' */

/** @type {filterEmptyEntries} */
module.exports = function filterEmptyEntries(obj) {
  return Object.entries(obj).reduce((acc, /** @type {[string, unknown]} */ [k, v]) => {
    if (v !== null && !(typeof v == 'object' && v.__count__))
      acc[k] = v instanceof Object ? filterEmptyEntries(v) : v;
    return acc;
  }, {});
};