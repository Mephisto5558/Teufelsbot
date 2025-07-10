/** @typedef {import('.')['toMs']} toMs */

const { msInSecond, secsInMinute, minutesInHour, hoursInDay, daysInYear } = require('./timeFormatter');

/** @type {toMs['secToMs']} */ const secToMs = secs => secs * msInSecond;
/** @type {toMs['minToMs']} */ const minToMs = mins => secToMs(mins * secsInMinute);
/** @type {toMs['hourToMs']} */ const hourToMs = hours => minToMs(hours * minutesInHour);
/** @type {toMs['dayToMs']} */ const dayToMs = days => hourToMs(days * hoursInDay);
/** @type {toMs['yearToMs']} */ const yearToMs = years => dayToMs(years * daysInYear);

module.exports = { secToMs, minToMs, hourToMs, dayToMs, yearToMs };