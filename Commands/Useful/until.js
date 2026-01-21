const
  { Command, commandTypes } = require('@mephisto5558/command'),
  { timeFormatter, daysInMonthMax, monthsInYear, secsInHour, hoursInDay, minutesInHour } = require('#Utils').timeFormatter,

  /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#interpretation_of_two-digit_years */
  DATE_START = 1900,
  MAX_YEARS = 2e5;

/**
 * @this {Message | Interaction}
 * @param {string} name
 * @param {number?} defaultNum
 * @returns {number} */
function getInteger(name, defaultNum = 0) {
  const
    position = module.exports.options.findIndex(e => e.name == name),
    num = Number.parseInt(this.args?.[position]);

  return this.options?.getInteger(name) ?? (Number.isNaN(num) ? defaultNum : num);
}

/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {number[]} args */
function getTime(year, month, day, ...args) {
  const
    allowedYearStart = -1, // "-1" to include "0"
    allowedYearEnd = 101;

  return year.inRange(allowedYearStart, allowedYearEnd)
    ? new Date(year - DATE_START, month, day, ...args).setFullYear(year)
    : new Date(year, month, day, ...args).getTime();
}

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  dmPermission: true,
  usage: {
    usage: '[dd] [MM] [yyyy] [hh] [mm] [ss]',
    examples: '3 3 2022 7 35 2 (= 2025-03-03 07:35:02)'
  },
  options: [
    {
      name: 'day',
      type: 'Integer',
      minValue: 1,
      maxValue: daysInMonthMax
    },
    {
      name: 'month',
      type: 'Integer',
      minValue: 1,
      maxValue: monthsInYear
    },
    {
      name: 'year',
      type: 'Integer',
      minValue: 0,
      maxValue: MAX_YEARS
    },
    {
      name: 'hour',
      type: 'Integer',
      minValue: 0,
      maxValue: hoursInDay - 1
    },
    {
      name: 'minute',
      type: 'Integer',
      minValue: 0,
      maxValue: minutesInHour - 1
    },
    {
      name: 'second',
      type: 'Integer',
      minValue: 0,
      maxValue: secsInHour - 1
    }
  ],

  async run(lang) {
    const
      getInt = getInteger.bind(this),
      day = getInt('day'),
      month = getInt('month', 1) - 1,
      year = getInt('year'),
      hour = getInt('hour'),
      minute = getInt('minute'),
      second = getInt('second'),
      ms = day || month || year ? getTime(year, month, day, hour, minute, second) : new Date().setHours(hour, minute, second),
      { formatted, negative } = timeFormatter(ms, lang);

    return this.customReply(lang(negative ? 'untilNeg' : 'until', formatted));
  }
});