/** @import { findPaths } from '.' */

/** @type {findPaths} */
module.exports = function findPaths(obj, targetKey, keys = [], values = [], currKey = '') {
  for (const [k, v] of Object.entries(obj)) {
    if (k == targetKey) keys.push(currKey);

    const newKey = currKey ? `${currKey}.${k}` : k;
    if (v == targetKey) values.push(newKey);
    else if (typeof v == 'object' && v !== null) findPaths(v, targetKey, keys, values, newKey);
  }

  return { keys, values };
};