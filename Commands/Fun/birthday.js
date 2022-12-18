const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getAge } = require('../../Utils'),
  currentYear = new Date().getFullYear();

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
          type: 'Number',
          minValue: 1,
          maxValue: 31,
          required: true
        },
        {
          name: 'month',
          type: 'Number',
          minValue: 1,
          maxValue: 12,
          required: true
        },
        {
          name: 'year',
          type: 'Number',
          minValue: 1900,
          maxValue: currentYear,
          required: true
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

  run: async function (lang) {
    const
      target = this.options.getMember('target'),
      doNotHide = this.options.getBoolean('do_not_hide'),
      birthday =
        Math.abs(this.options.getNumber('year')) + '/' +
        Math.abs(this.options.getNumber('month') || '')?.toString().padStart(2, '0') + '/' +
        Math.abs(this.options.getNumber('day') || '')?.toString().padStart(2, '0');

    switch (this.options.getSubcommand()) {
      case 'set': {
        this.client.db.update('userSettings', `${this.user.id}.birthday`, birthday);

        this.editReply(lang('saved')); //maybe add "your birthday is in <d> days"
        break;
      }

      case 'remove': {
        this.client.db.update('userSettings', `${this.user.id}.birthday`, null);

        this.editReply(lang('removed'));
        break;
      }

      case 'get': {
        let newData = '';
        const embed = new EmbedBuilder({
          color: Colors.Blurple,
          footer: {
            text: this.user.tag,
            iconURL: this.member.displayAvatarURL()
          }
        });

        if (target) {
          embed.data.title = lang('getUser.embedTitle', target.user.tag);

          const data = target.user.db.birthday?.split('/');

          if (data) {
            const age = getAge(data) + 1;
            newData = lang('getUser.date', { user: target.displayName, month: lang(`months.${data[1]}`), day: data[2] });
            if (age < currentYear) newData += lang('getUser.newAge', age);
          }
          else newData = lang('getUser.notFound', target.displayName);
        }
        else {
          embed.data.title = lang('getAll.embedTitle');

          const guildMembers = (await this.guild.members.fetch()).map(e => e.id);
          const currentTime = new Date().getTime();

          const data = Object.entries(this.client.db.get('userSettings') || {})
            .filter(([k, { birthday } = {}]) => guildMembers.includes(k) && birthday)
            .map(([k, { birthday }]) => [k, ...birthday.split('/')])
            .sort(([, , month1, day1], [, , month2, day2]) => {
              const time = [new Date(currentYear, month1 - 1, day1), new Date(currentYear, month2 - 1, day2)];

              if (time[0] < currentTime) time[0].setFullYear(currentYear + 1, month1 - 1, day1);
              if (time[1] < currentTime) time[1].setFullYear(currentYear + 1, month2 - 1, day2);

              return time[0] - time[1];
            })
            .slice(0, 10);

          for (const [id, year, month, day] of data) {
            const date = lang('getAll.date', { month: lang(`months.${month}`), day: parseInt(day) });
            const age = getAge([year, month, day]) + 1;
            const msg = `> <@${id}>${age < currentYear ? ' (' + age + ')' : ''}\n`;

            newData += newData?.includes(date) ? msg : `\n${date}${msg}`;
          }
        }

        embed.data.description = newData || lang('getAll.notFound');

        if (!doNotHide) return this.editReply({ embeds: [embed] });

        this.channel.send({ embeds: [embed] });
        return this.editReply(lang('global.messageSent'));
      }
    }
  }
};
