const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  embedConfig = require('../../Settings/embed.json').colors,
  year = new Date().getFullYear();

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
  if (bd[1] < (now.getMonth() + 1) || (bd[1] == (now.getMonth() + 1) && bd[2] < now.getDate())) return year - bd[0] + 1;
  else return year - bd[0];
}

module.exports = new Command({
  name: 'birthday',
  alias: [],
  description: 'save your birthday and get a I will send a message on your birthday',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'set',
      description: 'set your own birthday',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'day',
          description: 'The day you was born in.',
          type: 'NUMBER',
          max_value: 31,
          required: true
        },
        {
          name: 'month',
          description: 'The month you was born in.',
          type: 'NUMBER',
          max_value: 12,
          required: true
        },
        {
          name: 'year',
          description: 'The year you was born in.',
          type: 'NUMBER',
          min_value: 1900,
          max_value: year,
          required: true
        }
      ]
    },
    {
      name: 'get',
      description: 'get a list of the next birthdays',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'target',
          description: `whose birthday do you want to get? Leave this empty to get the next 10 birthdays.`,
          type: 'USER',
          required: false
        },
        {
          name: 'dont_hide',
          description: `don't hide the response to other users`,
          type: 'BOOLEAN',
          required: false
        }
      ]
    },
    {
      name: 'remove',
      description: 'deletes your birthday from the database',
      type: 'SUB_COMMAND'
    }
  ],

  run: async (client, _, interaction) => {

    let
      command = interaction.options.getSubcommand(),
      birthday = [
        interaction.options.getNumber('year'),
        interaction.options.getNumber('month')?.toString().padStart(2, '0'),
        interaction.options.getNumber('day')?.toString().padStart(2, '0')
      ],
      target = interaction.options.getUser('target'),
      dontHide = interaction.options.getBoolean('dont_hide'),
      oldData = await client.db.get('birthdays'),
      newData = '';

    switch (command) {
      case 'set':
        if (birthday[0] > year) return interaction.editReply(
          'Are you sure you put the right year in?\n' +
          `It seems like you will be born in ${birthday[0] - year} years :face_with_raised_eyebrow:`
        );

        newData = Object.assign({}, oldData, { [interaction.user.id]: birthday.join('/') });
        await client.db.set('birthdays', newData);

        interaction.editReply('Your birthday has been saved.' /*maybe add "your birthday is in <d> days"*/);
        break;

      case 'remove':
        newData = {};
        for (let entry of Object.entries(oldData)) {
          if (entry[0] == interaction.user.id) continue;
          newData[entry[0]] = entry[1];
        }

        await client.db.set('birthdays', newData);
        interaction.editReply('Your birthday has been deleted.');
        break;

      case 'get':
        i = 0;
        newData = '';
        let embed = new MessageEmbed();

        if (target) {
          embed.setTitle(`${target.tag}'s Birthday`);
          let data = oldData[target.id]?.split('/')
          if (data) {
            let age = getAge(data);
            newData = `This user has birthday on **${formatMonthName(data[1])} ${data[2]}**.\n`;
            if (age < year) newData += `He/she will turn **${age}** on this day.`;
          }
          else newData = 'This user has no birthday :(';
        }
        else {
          embed.setTitle('The next birthdays');
          let data = Object.entries(oldData);
          let filterList = [];

          for (let entry of data) {
            try { await interaction.guild.members.fetch(entry[0]) }
            catch {
              filterList.push(entry[0]);
              continue;
            }

            let output = entry[1].split('/');
            output.push(output.shift());

            entry[1] = output;
          }

          data = data.filter(item => !filterList.includes(item[0]));

          data.sort(([, a], [, b]) => {
            const time = new Date().getTime();

            for (item of [a, b]) {
              item = new Date(year, item[0] - 1, item[1] + 1);
              if (item < time) item.setFullYear(year + 1);
            }

            return (a - time) - (b - time);
          });

          data = data.slice(0, 10);

          for (entry of data) {
            let date = `**${formatMonthName(entry[1][0])} ${entry[1][1]}**\n`;
            let age = getAge([entry[1][2], entry[1][0], entry[1][1]])
            if (age >= year) age = undefined;
            else age = `(${age})`;

            let bd = `> <@${entry[0]}> ${age}\n`;

            if (newData.includes(date)) newData += bd;
            else newData += `\n${date}${bd}`;
          }
        }

        embed
          .setTitle('The next birthdays')
          .setDescription(newData || 'nobody has a birthday set...')
          .setColor(embedConfig.discord.BURPLE)
          .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.member.displayAvatarURL()
          });

        if (dontHide) {
          interaction.channel.send({ embeds: [embed] });
          interaction.editReply('Message sent!');
        }
        else interaction.editReply({ embeds: [embed] });
        break;
    }

  }
})