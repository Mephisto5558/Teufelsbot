import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';
import { daysInMonthMax, hoursInDay, minutesInHour, monthsInYear, secsInHour, timeFormatter } from '#utils/timeFormatter.ts';

const MAX_YEARS = 2e5;

function getInteger(this: Message | Interaction, name: string, defaultNum = 0): number {
  const position = command.options.findIndex(e => e.name == name);

  let num = Number.parseInt(this.args?.[position], 10);
  if ('options' in this) num = this.options.getInteger(name) ?? num;

  return Number.isNaN(num) ? defaultNum : num;
}

const command = new Command({
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
export default command;