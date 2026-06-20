/** @import { getAge } from '.' */

/** @type {getAge} */
module.exports = function getAge(birthday) {
  return birthday.until(Temporal.Now.plainDateISO(), { largestUnit: 'years' }).years;
};