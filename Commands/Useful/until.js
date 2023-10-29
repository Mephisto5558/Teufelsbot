const
  { timeFormatter } = require('../../Utils');
function createDate(year, month, day, ...args) {
  return year < 0 || year > 100 ? new Date(year, month, day, ...args) : new Date(new Date(year - 1900, month, day, ...args).setFullYear(year));
}

module.exports = {
  name: 'until',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true, beta: true,
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

  /**@this Interaction|Message @param {lang}lang*/
  run: function (lang) {
    const
      getInt = (k, i) => {
        const num = this.options?.getInteger(k) ?? parseInt(this.args?.[i]) ?? null;
        return isNaN(num) ? null : num;
      },
      day = getInt('day', 0),
      month = getInt('month', 1) - 1,
      year = getInt('year', 2),
      hour = getInt('hour', 3),
      minute = getInt('minute', 4),
      second = getInt('second', 5),
      date = (day ?? month ?? year) ? createDate(year, month, day, hour, minute, second) : new Date(null, null, null, hour, minute, second),
      { formatted, negative } = timeFormatter((date.getTime() - Date.now()) / 1000, lang);

    return this.reply(lang(negative ? 'untilNeg' : 'until', formatted));
  }
};