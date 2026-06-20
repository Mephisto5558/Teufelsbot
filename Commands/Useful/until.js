const
  { AllContexts, Command, CommandType, OptionType } = require('@mephisto5558/command'),
  { timeFormatter, daysInMonthMax, monthsInYear, secsInHour, hoursInDay, minutesInHour } = require('#Utils').timeFormatter;

const MAX_YEARS = 2e5;

/**
 * @this {Message | Interaction}
 * @param {string} name
 * @param {number?} defaultNum
 * @returns {number} */
function getInteger(name, defaultNum = 0) {
  const position = module.exports.options.findIndex(e => e.name == name);

  let num = Number.parseInt(this.args?.[position], 10);
  if ('options' in this) num = this.options.getInteger(name) ?? num;

  return Number.isNaN(num) ? defaultNum : num;
}

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
  usage: {
    usage: '[dd] [MM] [yyyy] [hh] [mm] [ss]',
    examples: '3 3 2022 7 35 2 (= 2025-03-03 07:35:02)'
  },
  options: [
    {
      name: 'day',
      type: OptionType.Integer,
      minValue: 1,
      maxValue: daysInMonthMax
    },
    {
      name: 'month',
      type: OptionType.Integer,
      minValue: 1,
      maxValue: monthsInYear
    },
    {
      name: 'year',
      type: OptionType.Integer,
      minValue: 0,
      maxValue: MAX_YEARS
    },
    {
      name: 'hour',
      type: OptionType.Integer,
      minValue: 0,
      maxValue: hoursInDay - 1
    },
    {
      name: 'minute',
      type: OptionType.Integer,
      minValue: 0,
      maxValue: minutesInHour - 1
    },
    {
      name: 'second',
      type: OptionType.Integer,
      minValue: 0,
      maxValue: secsInHour - 1
    }
  ],

  async run(lang) {
    const
      now = Temporal.Now.zonedDateTimeISO('UTC'),
      getInt = getInteger.bind(this),
      year = getInt('year', now.year),
      month = getInt('month', now.month),
      day = getInt('day', now.day),
      hour = getInt('hour'),
      minute = getInt('minute'),
      second = getInt('second'),
      ms = Temporal.ZonedDateTime.from({ timeZone: 'UTC', year, month, day, hour, minute, second }).round('second').epochMilliseconds,
      { formatted, negative } = timeFormatter(ms, lang);

    return this.customReply(lang(negative ? 'untilNeg' : 'until', formatted));
  }
});