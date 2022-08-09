const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  currentYear = new Date().getFullYear();

function formatMonthName(input) {
  switch (input) {
    case '01': return 'January';
    case '02': return 'February';
    case '03': return 'March';
    case '04': return 'April';
    case '05': return 'May';
    case '06': return 'June';
    case '07': return 'July';
    case '08': return 'August';
    case '09': return 'September';
    case '10': return 'October';
    case '11': return 'November';
    case '12': return 'December';
    default: throw new SyntaxError(`invalid month, must be in range 01-12, got ${input}`);
  }
}

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

  run: async (interaction, { db }) => {
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

    switch (cmd) {
      case 'set': {
        const newData = Object.merge(oldData, { [interaction.user.id]: { birthday: birthday.join('/') } });
        await db.set('userSettings', newData);

        interaction.editReply('Your birthday has been saved.' /*maybe add "your birthday is in <d> days"*/);
        break;
      }

      case 'remove': {
        delete oldData[interaction.user.id].birthday;

        await db.set('userSettings', oldData);

        interaction.editReply('Your birthday has been deleted.');
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
          embed.data.title = `${target.tag}'s Birthday`;

          const data = oldData[target.id]?.birthday?.split('/');

          if (!data) newData = 'This user has no birthday :(';
          else {
            const age = getAge(data);
            newData = `This user has birthday on **${formatMonthName(data[1])} ${data[2]}**.\n`;
            if (age < currentYear) newData += `He/she will turn **${age}** on this day.`;
          }
        }
        else {
          embed.data.title = 'The next birthdays';

          const guildMembers = (await interaction.guild.members.fetch()).map(e => e.id);
          const currentTime = new Date().getTime();

          const data = Object.entries(oldData)
            .filter(([k]) => guildMembers.includes(k))
            .map(([k, v]) => [k, ...v.birthday.split('/')])
            .sort(([, , month1, day1], [, , month2, day2]) => {
              const time = [new Date(currentYear, month1 - 1, day1), new Date(currentYear, month2 - 1, day2)];

              if (time[0] < currentTime) time[0].setFullYear(currentYear + 1, month1 - 1, day1);
              if (time[1] < currentTime) time[1].setFullYear(currentYear + 1, month2 - 1, day2);

              return time[0] - time[1];
            })
            .slice(0, 10);

          for (const [id, year, month, day] of data) {
            const date = `**${formatMonthName(month)} ${parseInt(day)}**\n`;
            const age = getAge([year, month, day]);
            const msg = `> <@${id}>${age < currentYear ? ` (${age})` : ''}\n`;

            if (newData?.includes(date)) newData += msg;
            else newData += `\n${date}${msg}`;
          }
        }

        embed.data.description = newData || 'nobody has a birthday set...';

        if (doNotHide) {
          interaction.channel.send({ embeds: [embed] });
          interaction.editReply('Message sent!');
        }
        else interaction.editReply({ embeds: [embed] });
        break;
      }
    }

  }
})