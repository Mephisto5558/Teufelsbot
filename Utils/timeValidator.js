const
  { getMilliseconds, humanize } = require('better-ms'),
  validItems = ['y', 'mth', 'w', 'd', 'h', 'min', 's', 'ms'];

/**@param {string}t a time string, e.g. 3w2d @returns {string[]}array of valid values*/
module.exports = function timeValidator(t) {
  if (!t) return [];

  const
    split = t.split(/(\d)/).filter(e => e),
    last = split.pop() ?? '',
    found = validItems.filter(e => e.includes(last));

  if (found.length) return found.map(e => split.join('') + e);

  const ms = getMilliseconds(t);
  if (typeof ms != 'number') return validItems.map(e => t + e);

  return [humanize(ms.limit({ min: -62492231808e5, max: 62492231808e5 }))]; //200000y
};