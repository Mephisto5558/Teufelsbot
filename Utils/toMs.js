/** @import { toMs } from '.' */

const
  { daysInYear, hoursInDay, minutesInHour, msInSecond, secsInMinute } = require('./timeFormatter'),

  /** @type {toMs['secToMs']} */ secToMs = secs => secs * msInSecond,
  /** @type {toMs['minToMs']} */ minToMs = mins => secToMs(mins * secsInMinute),
  /** @type {toMs['hourToMs']} */ hourToMs = hours => minToMs(hours * minutesInHour),
  /** @type {toMs['dayToMs']} */ dayToMs = days => hourToMs(days * hoursInDay),
  /** @type {toMs['yearToMs']} */ yearToMs = years => dayToMs(years * daysInYear);

module.exports = { secToMs, minToMs, hourToMs, dayToMs, yearToMs };