const
  { getMilliseconds, humanize } = require('better-ms'),
  validItems = ['y', 'mth', 'w', 'd', 'h', 'min', 's', 'ms'];

/**@param {String}t a time string eg. `3w2d` @returns {string[]} array of valid values*/
module.exports = function timeValidator(t) {
  if (!t) return [];
  const
    split = t.split(/(\d)/).filter(e => e),
    last = split.pop(),
    found = validItems.filter(e => e.includes(last));
  if (found.length) return found.map(e => split.join('') + e);
  if (typeof getMilliseconds(t + 's') != 'number') return [];
  const ms = getMilliseconds(t);
  if (typeof ms != 'number') return [t + 'y', t + 'mth', t + 'w', t + 'd', t + 'h', t + 'min', t + 's'];
  return [humanize(ms.limit({ min: -62492231808e5, max: 62492231808e5 }) || 0)];  //200000y
};