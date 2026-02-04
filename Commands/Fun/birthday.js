const
  { Colors, EmbedBuilder, bold, userMention } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { getTargetMembers, getAge, timeFormatter: { msInSecond, secsInDay, daysInMonthMax, daysInYear, monthsInYear } } = require('#Utils'),

  currentYear = new Date().getFullYear(),
  MIN_YEAR = 1900;

/**
 * @param {Date | number} a
 * @param {Date | number | undefined} b
 * @returns {number} negative if `a > b`, positive if `a < b`, `0` otherwise */
function sortDates(a, b = Date.now()) {
  const
    todayMs = new Date().setHours(0, 0, 0, 0),
    diffA = new Date(a).setFullYear(currentYear) - todayMs,
    diffB = new Date(b).setFullYear(currentYear) - todayMs;

  if (diffA * diffB >= 0) return diffA - diffB; // both are positive (or 0) OR both are negative (or 0)
  return diffA <= 0 && diffB >= 0 ? 1 : -1;
}

/** @type {Record<string, (this: GuildInteraction, lang: lang) => Promise<Message>>} */
const birthdayMainFunctions = {
  set: async function set(lang) {
    const
      month = this.options.getInteger('month', true),
      day = this.options.getInteger('day', true),
      today = new Date(),
      nextBirthday = new Date(today.getFullYear(), month - 1, day);

    if (today > nextBirthday) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.floor((nextBirthday - today) / (secsInDay * msInSecond));

    await this.user.updateDB('birthday', new Date(this.options.getInteger('year', true), month - 1, day));
    return this.editReply(lang('saved', diffDays));
  },

  remove: async function remove(lang) {
    await this.user.deleteDB('birthday');
    return this.editReply(lang('removed'));
  },

  get: async function get(lang) {
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
        birthday.setHours(0, 0, 0, 0);

        const
          daysUntil = Math.round(
            Math.abs(new Date().setHours(0, 0, 0, 0) - new Date(birthday).setFullYear(sortDates(birthday) < 0 ? currentYear : currentYear + 1))
            / (secsInDay * msInSecond) * 2
          ) / 2 % daysInYear, // * 2) / 2 rounds it to the nearest .5
          age = getAge(birthday) + (daysUntil > 0 ? 1 : 0);

        embed.data.description = lang('getUser.date', {
          user: target.displayName,
          monthName: lang(`months.${birthday.getMonth() + 1}`), day: birthday.getDate(),
          daysUntil: bold(daysUntil)
        });

        if (age < currentYear) embed.data.description += `\n${lang('getUser.newAge', bold(age))}`;
      }
      else embed.data.description = lang('getUser.notFound', target.displayName);
    }
    else {
      embed.data.title = lang('getAll.embedTitle');

      const
        guildMembers = new Set((await this.guild.members.fetch()).map(e => e.id)),
        today = new Date(),

        /** @type {[Snowflake, Date][]} */
        data = Object.entries(this.client.db.get('userSettings'))
          .reduce((acc, [k, { birthday }]) => {
            if (birthday && guildMembers.has(k)) acc.push([k, birthday]);
            return acc;
          }, [])
          .toSorted(([, a], [, b]) => sortDates(a, b))
          .slice(0, 10);

      embed.data.description = data.length ? '' : lang('getAll.notFound');
      for (const [id, date] of data) {
        const
          dateStr = bold(
            date.getMonth() == today.getMonth() && date.getDate() == today.getDate()
              ? `${lang('getAll.today')} 🎉`
              : lang('getAll.date', { monthName: lang(`months.${date.getMonth() + 1}`), day: date.getDate() })
          ),
          age = getAge(date) + 1,
          msg = '> ' + userMention(id) + (age < currentYear ? ` (${age})` : '') + '\n';

        embed.data.description += embed.data.description.includes(dateStr) ? msg : `\n${dateStr}\n${msg}`;
      }
    }

    if (!doNotHide) return this.editReply({ embeds: [embed] });

    await this.channel.send({ embeds: [embed] });
    return this.editReply(lang('global.messageSent'));
  }
};

module.exports = new Command({
  types: [commandTypes.slash],
  cooldowns: { user: '1s' },
  ephemeralDefer: true,
  options: [
    {
      name: 'set',
      type: 'Subcommand',
      options: [
        {
          name: 'day',
          type: 'Integer',
          required: true,
          minValue: 1,
          maxValue: daysInMonthMax
        },
        {
          name: 'month',
          type: 'Integer',
          required: true,
          minValue: 1,
          maxValue: monthsInYear
        },
        {
          name: 'year',
          type: 'Integer',
          required: true,
          minValue: MIN_YEAR,
          maxValue: currentYear
        }
      ]
    },
    {
      name: 'get',
      type: 'Subcommand',
      options: [
        { name: 'target', type: 'User' },
        { name: 'do_not_hide', type: 'Boolean' }
      ]
    },
    { name: 'remove', type: 'Subcommand' }
  ],

  async run(lang) {
    return birthdayMainFunctions[this.options.getSubcommand()].call(this, lang);
  }
});