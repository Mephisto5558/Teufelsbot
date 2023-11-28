const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getTarget, getAge } = require('../../Utils'),
  currentYear = new Date().getFullYear();

/**@type {command}*/
module.exports = {
  name: 'birthday',
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

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      target = getTarget.call(this),
      doNotHide = this.options.getBoolean('do_not_hide');

    switch (this.options.getSubcommand()) {
      case 'set': {
        await this.client.db.update('userSettings', `${this.user.id}.birthday`, `${this.options.getInteger('year')}/${String(this.options.getInteger('month')).padStart(2, '0')}/${String(this.options.getInteger('day')).padStart(2, '0')}`);
        return this.editReply(lang('saved')); //Todo: maybe add "your birthday is in <d> days"
      }

      case 'remove': {
        await this.client.db.delete('userSettings', `${this.user.id}.birthday`);
        return this.editReply(lang('removed'));
      }

      case 'get': {
        const embed = new EmbedBuilder({
          color: Colors.Blurple,
          footer: {
            text: this.user.tag,
            iconURL: this.member.displayAvatarURL()
          }
        });

        if (target) {
          embed.data.title = lang('getUser.embedTitle', target.user.customTag);

          const data = target.user.db.birthday?.split('/');
          if (data) {
            const age = getAge(data) + 1;
            embed.data.description = lang('getUser.date', { user: target.customName, month: lang(`months.${data[1]}`), day: data[2] });
            if (age < currentYear) embed.data.description += lang('getUser.newAge', age);
          }
          else embed.data.description = lang('getUser.notFound', target.customName);
        }
        else {
          embed.data.title = lang('getAll.embedTitle');

          const
            guildMembers = (await this.guild.members.fetch()).map(e => e.id),
            currentTime = new Date().getTime(),
            data = Object.entries(this.client.db.get('userSettings') || {})
              .reduce((acc, [k, { birthday } = {}]) => {
                if (birthday && guildMembers.includes(k)) acc.push([k, ...birthday.split('/')]);
                return acc;
              }, [])
              .sort(([, , month1, day1], [, , month2, day2]) => {
                const time = [new Date(currentYear, month1 - 1, day1), new Date(currentYear, month2 - 1, day2)];
                if (time[0] < currentTime) time[0].setFullYear(currentYear + 1, month1 - 1, day1);
                if (time[1] < currentTime) time[1].setFullYear(currentYear + 1, month2 - 1, day2);

                return time[0] - time[1];
              })
              .slice(0, 10);

          embed.data.description = data.length ? '' : lang('getAll.notFound');
          for (const [id, year, month, day] of data) {
            const
              date = lang('getAll.date', { month: lang(`months.${month}`), day }),
              age = getAge([year, month, day]) + 1,
              msg = `> <@${id}>${age < currentYear ? ' (' + age + ')' : ''}\n`;

            embed.data.description += embed.data.description.includes(date) ? msg : `\n${date}${msg}`;
          }
        }

        if (!doNotHide) return this.editReply({ embeds: [embed] });

        await this.channel.send({ embeds: [embed] });
        return this.editReply(lang('global.messageSent'));
      }
    }
  }
};
