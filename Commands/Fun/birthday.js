const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  currentYear = new Date().getFullYear();

function getAge(bd) {
  //bd[0] = year; bd[1] = month; bd[2] = day
  let now = new Date()
  if (bd[1] < (now.getMonth() + 1) || (bd[1] == (now.getMonth() + 1) && bd[2] < now.getDate())) return currentYear - bd[0] + 1;
  else return currentYear - bd[0];
}

module.exports = new Command({
  name: 'birthday',
  aliases: { prefix: [], slash: [] },
  description: 'save your birthday and I will send a message on your birthday',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'set',
      description: 'set your own birthday',
      type: 'Subcommand',
      options: [
        {
          name: 'day',
          description: 'The day you was born in.',
          type: 'Number',
          maxValue: 31,
          required: true
        },
        {
          name: 'month',
          description: 'The month you was born in.',
          type: 'Number',
          maxValue: 12,
          required: true
        },
        {
          name: 'year',
          description: 'The year you was born in.',
          type: 'Number',
          minValue: 1900,
          maxValue: currentYear,
          required: true
        }
      ]
    },
    {
      name: 'get',
      description: 'get a list of the next birthdays',
      type: 'Subcommand',
      options: [
        {
          name: 'target',
          description: `whose birthday do you want to get? Leave this empty to get the next 10 birthdays.`,
          type: 'User',
          required: false
        },
        {
          name: 'do_not_hide',
          description: `don't hide the response to other users`,
          type: 'Boolean',
          required: false
        }
      ]
    },
    {
      name: 'remove',
      description: 'deletes your birthday from the database',
      type: 'Subcommand'
    }
  ],

  run: async (interaction, lang, { db }) => {
    const
      cmd = interaction.options.getSubcommand(),
      target = interaction.options.getUser('target'),
      doNotHide = interaction.options.getBoolean('do_not_hide'),
      oldData = await db.get('userSettings'),
      birthday = [
        Math.abs(interaction.options.getNumber('year')),
        Math.abs(interaction.options.getNumber('month') || '')?.toString().padStart(2, '0'),
        Math.abs(interaction.options.getNumber('day') || '')?.toString().padStart(2, '0')
      ];

    function formatMonthName(input) {
      switch (input) {
        case '01': return lang('months.January');
        case '02': return lang('months.February');
        case '03': return lang('months.March');
        case '04': return lang('months.April');
        case '05': return lang('months.May');
        case '06': return lang('months.June');
        case '07': return lang('months.July');
        case '08': return lang('months.August');
        case '09': return lang('months.September');
        case '10': return lang('months.October');
        case '11': return lang('months.November');
        case '12': return lang('months.December');
        default: throw new SyntaxError(`invalid month, must be in range 01-12, got ${input}`);
      }
    }

    switch (cmd) {
      case 'set': {
        const newData = Object.merge(oldData, { [interaction.user.id]: { birthday: birthday.join('/') } });
        await db.set('userSettings', newData);

        interaction.editReply(lang('saved')); //maybe add "your birthday is in <d> days"
        break;
      }

      case 'remove': {
        delete oldData[interaction.user.id].birthday;

        await db.set('userSettings', oldData);

        interaction.editReply(lang('removed'));
        break;
      }

      case 'get': {
        let newData = '';
        const embed = new EmbedBuilder({
          color: Colors.Blurple,
          footer: {
            text: interaction.user.tag,
            iconURL: interaction.member.displayAvatarURL()
          }
        });

        if (target) {
          embed.data.title = lang('getUser.embedTitle', target.tag);

          const data = oldData[target.id]?.birthday?.split('/');

          if (!data) newData = lang('getUser.notFound');
          else {
            const age = getAge(data);
            newData = lang('getUser.date', { month: formatMonthName(data[1]), day: data[2] });
            if (age < currentYear) newData += lang('getUser.newAge', age);
          }
        }
        else {
          embed.data.title = lang('getAll.embedTitle');

          const guildMembers = (await interaction.guild.members.fetch()).map(e => e.id);
          const currentTime = new Date().getTime();

          const data = Object.entries(oldData)
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
            const date = lang('getAll.date', { month: formatMonthName(month), day: parseInt(day) });
            const age = getAge([year, month, day]);
            const msg = `> <@${id}>${age < currentYear ? ` (${age})` : ''}\n`;

            if (newData?.includes(date)) newData += msg;
            else newData += `\n${date}${msg}`;
          }
        }

        embed.data.description = newData || lang('getAll.notFound');

        if (doNotHide) {
          interaction.channel.send({ embeds: [embed] });
          interaction.editReply(lang('general.messageSent'));
        }
        else interaction.editReply({ embeds: [embed] });
        break;
      }
    }

  }
})