const moment = require('moment');
void require('moment-precise-range-plugin');

const
  msInSecond = 1000,
  secsInMinute = 60,
  minutesInHour = 60,
  hoursInDay = 24,
  daysInWeek = 7,
  daysInMonthAvg = 30,
  daysInMonthMax = 31,
  daysInYear = 365,
  monthsInYear = 12,
  secsInHour = secsInMinute * minutesInHour,
  secsInDay = secsInHour * hoursInDay,
  secsInWeek = secsInDay * daysInWeek,
  secsInMonth = secsInDay * daysInMonthAvg,
  secsInYear = secsInDay * daysInYear,
  YEAR_STR_LENGTH = 4,
  DATETIME_STR_LENGTH = 2;

/** @type {import('.').timeFormatter['timeFormatter']} */
function timeFormatter(ms, lang) {
  const { years, months, days, hours, minutes, seconds, firstDateWasLater: negative } = moment.preciseDiff(moment(), moment(ms), true);

  let id = 'others.timeFormatter.';
  if (lang) {
    if (years) id += 'ymdhms';
    else if (months) id += 'mdhms';
    else if (days) id += 'dhms';
    else if (hours) id += 'hms';
    else id += minutes ? 'ms' : 's';
  }

  return {
    negative, total: ms,
    formatted: lang?.(id, { years, months, days, hours, minutes, seconds })
      ?? `${years.toString().padStart(YEAR_STR_LENGTH, '0')}-${days.toString().padStart(DATETIME_STR_LENGTH, '0')}, `
      + `${hours.toString().padStart(DATETIME_STR_LENGTH, '0')}:${minutes.toString().padStart(DATETIME_STR_LENGTH, '0')}:${seconds.toString().padStart(DATETIME_STR_LENGTH, '0')}`
  };
}

/**
 * @type {import('.').timeFormatter['timestamp']}
 * @param {Parameters<import('.').timeFormatter['timestamp']>[0]} time
 * @param {Parameters<import('.').timeFormatter['timestamp']>[1] | undefined} code
 * @returns {`<t:${number}>` | `<t:${number}:${NonNullable<code>}>`} *//* eslint-disable-line jsdoc/valid-types -- false positive */
function timestamp(time, code) {
  const date = Math.round(new Date(time).getTime() / msInSecond);
  return code ? `<t:${date}:${code}>` : `<t:${date}>`;
}

module.exports = {
  timeFormatter, timestamp,
  msInSecond, secsInMinute, minutesInHour, hoursInDay, daysInWeek, daysInMonthAvg, daysInMonthMax,
  daysInYear, monthsInYear, secsInHour, secsInDay, secsInWeek, secsInMonth, secsInYear
};