import { Colors, EmbedBuilder, bold, userMention } from 'discord.js';
import { Command, CommandType, CooldownType, OptionType } from '@mephisto5558/command';
import { getAge, getTargetMembers } from '#utils';
import { daysInMonthMax, monthsInYear } from '#utils/timeFormatter';


const MIN_YEAR = 1900;

/** @returns see {@link Array.sort}'s compareFn */
function sortDates(a: Temporal.PlainDate, b = Temporal.Now.plainDateISO()): number {
  const
    today = Temporal.Now.plainDateISO(),
    dateA = a.with({ year: today.year }),
    dateB = b.with({ year: today.year }),
    isPastA = Temporal.PlainDate.compare(dateA, today) < 0,
    isPastB = Temporal.PlainDate.compare(dateB, today) < 0;

  if (isPastA === isPastB) return Temporal.PlainDate.compare(dateB, dateA);
  return isPastA ? 1 : -1;
}

const birthdayMainFunctions = {
  set: async function set(lang): Promise<Message> {
    const
      month = this.options.getInteger('month', true),
      day = this.options.getInteger('day', true),
      year = this.options.getInteger('year', true),
      today = Temporal.Now.plainDateISO();

    let nextBirthday = Temporal.PlainDate.from({ year: today.year, month, day });
    if (Temporal.PlainDate.compare(today, nextBirthday) > 0)
      nextBirthday = nextBirthday.with({ year: today.year + 1 });

    const diffDays = today.until(nextBirthday, { largestUnit: 'days' }).days;

    await this.user.updateDB('birthday', Temporal.PlainDate.from({ year, month, day }));
    return this.editReply(lang('saved', diffDays));
  },

  remove: async function remove(lang): Promise<Message> {
    await this.user.deleteDB('birthday');
    return this.editReply(lang('removed'));
  },

  get: async function get(lang): Promise<Message> {
    const
      target = getTargetMembers(this),
      doNotHide = this.options.getBoolean('do_not_hide'),
      embed = new EmbedBuilder({
        color: Colors.Blurple,
        footer: {
          text: this.user.tag,
          iconURL: this.member.displayAvatarURL()
        }
      });

    if (target) {
      embed.data.title = lang('getUser.embedTitle', target.displayName);

      const { birthday } = target.user.db;
      if (birthday) {
        const
          today = Temporal.Now.plainDateISO(),
          targetYear = sortDates(birthday) < 0 ? today.year : today.year + 1,
          nextBirthday = birthday.with({ year: targetYear }),

          daysUntil = today.until(nextBirthday, { largestUnit: 'days' }).days,
          age = getAge(birthday) + (daysUntil > 0 ? 1 : 0);

        embed.data.description = lang('getUser.date', {
          user: target.displayName,
          monthName: lang(`months.${birthday.month}`),
          day: birthday.day,
          daysUntil: bold(daysUntil)
        });

        if (age < today.year) embed.data.description += `\n${lang('getUser.newAge', bold(age))}`;
      }
      else embed.data.description = lang('getUser.notFound', target.displayName);
    }
    else {
      embed.data.title = lang('getAll.embedTitle');

      const
        guildMembers = new Set((await this.guild.members.fetch()).map(e => e.id)),
        today = Temporal.Now.plainDateISO(),
        data = Object.entries(this.client.db.get('userSettings'))
          .reduce<[Snowflake, Temporal.PlainDate][]>((acc, [k, { birthday }]) => {
            if (birthday && guildMembers.has(k)) acc.push([k, birthday]);
            return acc;
          }, [])
          .toSorted(([, a], [, b]) => sortDates(a, b))
          .slice(0, 10);

      embed.data.description = data.length ? '' : lang('getAll.notFound');
      for (const [id, birthday] of data) {
        const
          dateStr = bold(
            birthday.month == today.month && birthday.day == today.day
              ? `${lang('getAll.today')} 🎉`
              : lang('getAll.date', { monthName: lang(`months.${birthday.month}`), day: birthday.day })
          ),
          age = getAge(birthday) + 1,
          msg = '> ' + userMention(id) + (age < today.year ? ` (${age})` : '') + '\n';

        embed.data.description += embed.data.description.includes(dateStr) ? msg : `\n${dateStr}\n${msg}`;
      }
    }

    if (!doNotHide) return this.editReply({ embeds: [embed] });

    await this.channel.send({ embeds: [embed] });
    return this.editReply(lang('global.messageSent'));
  }
} satisfies Record<string, (this: GuildInteraction, lang: lang) => Promise<Message>>;

export default new Command({
  types: [CommandType.Slash],
  cooldowns: { [CooldownType.User]: '1s' },
  ephemeralDefer: true,
  options: [
    {
      name: 'set',
      type: OptionType.Subcommand,
      options: [
        {
          name: 'day',
          type: OptionType.Integer,
          required: true,
          minValue: 1,
          maxValue: daysInMonthMax
        },
        {
          name: 'month',
          type: OptionType.Integer,
          required: true,
          minValue: 1,
          maxValue: monthsInYear
        },
        {
          name: 'year',
          type: OptionType.Integer,
          required: true,
          minValue: MIN_YEAR,
          maxValue: Temporal.Now.plainDateISO().year
        }
      ]
    },
    {
      name: 'get',
      type: OptionType.Subcommand,
      options: [
        { name: 'target', type: OptionType.User },
        { name: 'do_not_hide', type: OptionType.Boolean }
      ]
    },
    { name: 'remove', type: OptionType.Subcommand }
  ],

  async run(lang) {
    return birthdayMainFunctions[this.options.getSubcommand()].call(this, lang);
  }
});