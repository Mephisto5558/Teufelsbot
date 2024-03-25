const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getTargetMember, getAge } = require('../../Utils'),
  currentYear = new Date().getFullYear(),

  /** @type {Record<string, (this: GuildInteraction, lang: lang) => Promise<Message>>} */
  birthdayMainFunctions = {
    set: async function set(lang) {
      const
        month = this.options.getInteger('month', true),
        day = this.options.getInteger('day', true),
        today = new Date(),
        nextBirthday = new Date(today.getFullYear(), month - 1, day);

      if (today > nextBirthday) nextBirthday.setFullYear(today.getFullYear() + 1);
      const diffDays = Math.ceil(Math.abs(nextBirthday - today) / 864e5); // ms -> days

      await this.client.db.update('userSettings', `${this.user.id}.birthday`, new Date(this.options.getInteger('year', true), month - 1, day));
      return this.editReply(lang('saved', diffDays));
    },

    remove: async function remove(lang) {
      await this.client.db.delete('userSettings', `${this.user.id}.birthday`);
      return this.editReply(lang('removed'));
    },

    get: async function get(lang) {
      const
        target = getTargetMember(this),
        doNotHide = this.options.getBoolean('do_not_hide'),
        embed = new EmbedBuilder({
          color: Colors.Blurple,
          footer: {
            text: this.user.tag,
            iconURL: this.member.displayAvatarURL()
          }
        });

      if (target) {
        embed.data.title = lang('getUser.embedTitle', target.user.customName);

        const birthday = target.user.db.birthday;
        if (birthday) {
          const age = getAge(birthday) + 1;
          embed.data.description = lang('getUser.date', { user: target.customName, month: lang(`months.${birthday.getMonth() + 1}`), day: birthday.getDate() });
          if (age < currentYear) embed.data.description += lang('getUser.newAge', age);
        }
        else embed.data.description = lang('getUser.notFound', target.customName);
      }
      else {
        embed.data.title = lang('getAll.embedTitle');

        const
          guildMembers = new Set((await this.guild.members.fetch()).map(e => e.id)),
          currentTime = Date.now(),

          /** @type {[import('discord.js').Snowflake, Date][]} */
          data = Object.entries(this.client.db.get('userSettings'))
            .reduce((acc, [k, { birthday }]) => {
              if (birthday && guildMembers.has(k)) acc.push([k, birthday]);
              return acc;
            }, [])
            .sort(([, a], [, b]) => {
              const dates = [new Date(a.getTime()), new Date(b.getTime())];
              if (dates[0] < currentTime) dates[0].setFullYear(currentYear);
              if (dates[1] < currentTime) dates[1].setFullYear(currentYear);

              return dates[0] - dates[1];
            })
            .slice(0, 10);

        embed.data.description = data.length ? '' : lang('getAll.notFound');
        for (const [id, date] of data) {
          const
            dateStr = lang('getAll.date', { month: lang(`months.${date.getMonth() + 1}`), day: date.getDate() }),
            age = getAge(date) + 1,
            msg = `> <@${id}>${age < currentYear ? ' (' + age + ')' : ''}\n`;

          embed.data.description += embed.data.description.includes(dateStr) ? msg : `\n${dateStr}${msg}`;
        }
      }

      if (!doNotHide) return this.editReply({ embeds: [embed] });

      await this.channel.send({ embeds: [embed] });
      return this.editReply(lang('global.messageSent'));
    }
  };

/** @type {command<'slash', false>}*/
module.exports = {
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: false,
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
          maxValue: 31
        },
        {
          name: 'month',
          type: 'Integer',
          required: true,
          minValue: 1,
          maxValue: 12
        },
        {
          name: 'year',
          type: 'Integer',
          required: true,
          minValue: 1900,
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

  run: function (lang) {
    return birthdayMainFunctions[this.options.getSubcommand()].call(this, lang);
  }
};