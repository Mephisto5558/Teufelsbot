const { getMilliseconds } = require('better-ms');

/**@param {String}t a time string eg. `3w2d` @returns {string[]} array of valid values*/
module.exports = function timeValidator(t) {
  if (!t || typeof getMilliseconds(t + 's') != 'number') return [];
  const ms = getMilliseconds(t);
  if (typeof ms != 'number') return [t + 'y', t + 'mth', t + 'w', t + 'd', t + 'h', t + 'm', t + 's'];
  return [getMilliseconds(ms.limit({ min: -6249223180800000, max: 6249223180800000 }) || '0')];  //200000y
};