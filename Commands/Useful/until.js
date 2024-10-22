const
  { timeFormatter } = require('#Utils'),

  // TODO: document why this is needed
  DATE_START = 1900;

/**
 * @this {Message|Interaction}
 * @param {string}name
 * @param {number?}defaultNum
 * @returns {number}*/
function getInteger(name, defaultNum = 0) {
  const
    position = module.exports.options.findIndex(e => e.name == name),
    num = Number.parseInt(this.args?.[position]);

  return this.options?.getInteger(name) ?? (Number.isNaN(num) ? defaultNum : num);
}

/**
 * @param {number}year
 * @param {number}month
 * @param {number}day
 * @param {number[]}args*/
function getTime(year, month, day, ...args) {
  const
    allowedYearStart = -1, // "-1" to include "0"
    allowedYearEnd = 101;

  return year.inRange(allowedYearStart, allowedYearEnd) ? new Date(year - DATE_START, month, day, ...args).setFullYear(year) : new Date(year, month, day, ...args).getTime();
}

/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'day',
      type: 'Integer',
      minValue: 1,
      maxValue: 31
    },
    {
      name: 'month',
      type: 'Integer',
      minValue: 1,
      maxValue: 12
    },
    {
      name: 'year',
      type: 'Integer',
      minValue: 0,
      maxValue: 2e5
    },
    {
      name: 'hour',
      type: 'Integer',
      minValue: 0,
      maxValue: 23
    },
    {
      name: 'minute',
      type: 'Integer',
      minValue: 0,
      maxValue: 59
    },
    {
      name: 'second',
      type: 'Integer',
      minValue: 0,
      maxValue: 59
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
      date = day || month || year ? getTime(year, month, day, hour, minute, second) : new Date().setHours(hour, minute, second),
      { formatted, negative } = timeFormatter({ sec: (date - Date.now()) / 1000, lang });

    return this.customReply(lang(negative ? 'untilNeg' : 'until', formatted));
  }
};