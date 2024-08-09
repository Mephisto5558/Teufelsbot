const { timeFormatter } = require('#Utils');

/**
 * @this {Message|Interaction}
 * @param {string}name
 * @param {number?}i
 * @param {number?}defaultNum
 * @returns {number}*/
function getInteger(name, i, defaultNum = 0) {
  return this.options?.getInteger(name) ?? (Number.parseInt(this.args?.[i]) || defaultNum);
}

/**
 * @param {number}year
 * @param {number}month
 * @param {number}day
 * @param {number[]}args*/
function getTime(year, month, day, ...args) {
  return year < 0 || year > 100 ? new Date(year, month, day, ...args).getTime() : new Date(year - 1900, month, day, ...args).setFullYear(year);
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

  run: async function (lang) {
    const
      getInt = getInteger.bind(this),
      day = getInt('day', 0),
      month = getInt('month', 1, 1) - 1,
      year = getInt('year', 2),
      hour = getInt('hour', 3),
      minute = getInt('minute', 4),
      second = getInt('second', 5),
      date = day || month || year ? getTime(year, month, day, hour, minute, second) : new Date().setHours(hour, minute, second),
      { formatted, negative } = timeFormatter((date - Date.now()) / 1000, lang);

    return this.customReply(lang(negative ? 'untilNeg' : 'until', formatted));
  }
};