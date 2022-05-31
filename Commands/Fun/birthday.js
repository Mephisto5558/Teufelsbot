const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  embedConfig = require('../../Settings/embed.json').colors,
  year = new Date().getFullYear();

function formatMonthName(input) {
  let output;
  switch (input) {
    case '01': output = 'January'; break;
    case '02': output = 'February'; break;
    case '03': output = 'March'; break;
    case '04': output = 'April'; break;
    case '05': output = 'May'; break;
    case '06': output = 'June'; break;
    case '07': output = 'July'; break;
    case '08': output = 'August'; break;
    case '09': output = 'September'; break;
    case '10': output = 'October'; break;
    case '11': output = 'November'; break;
    case '12': output = 'December'; break;
    default: throw new SyntaxError(`invalid month, must be in range 01-12, got ${input}`);
  }
  return output;
}

function getAge(input) {
  if (input < (new Date().getMonth() + 1)) return year - input + 1;
  else return year - input;
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
  beta: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'set',
      description: 'set your own birthday',
      type: 'SUB_COMMAND',
      options: [{
        name: 'date',
        description: 'when do you have birthday? The valid format is YYYY/MM/DD. "/" can also be ".", "-" or ":".',
        type: 'STRING',
        required: true
      }]
    },
    {
      name: 'remove',
      description: 'deletes your birthday from the database',
      type: 'SUB_COMMAND'
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
    }
  ],

  run: async (client, _, interaction) => {

    let
      command = interaction.options.getSubcommand(),
      birthday = interaction.options.getString('date'),
      target = interaction.options.getUser('target'),
      dontHide = interaction.options.getBoolean('dont_hide'),
      oldData = await client.db.get('birthdays'),
      newData = '';

    switch (command) {
      case 'set':
        let regex = /^(?:\d{4}[\/.:-](?:0\d|1[0-2])[\/.:-]\d\d)$/g; //checks YYYY<./:>MM<./:>/DD
        let check = regex.test(birthday);

        if (!check) {
          let embed = new MessageEmbed()
            .setTitle('Invalid Input')
            .setDescription(
              'The provided birthday format was not recognized by the bot.\n' +
              'Your birthday must be formated like this: `YYYY/MM/DD`.\n' +
              'Example: `2001/09/25`\n' +
              'The delimiter can be `/`, `.`, `-` or `:`.'
            )
            .setColor(embedConfig.discord.RED);
          return interaction.editReply({ embeds: [embed] });
        }

        birthday = birthday.replace(/[:.-]/g, '/');

        newData = Object.assign({}, oldData, { [interaction.user.id]: birthday });
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
            newData =
              `This user has birthday on **${formatMonthName(data[1])} ${data[2]}**.\n` +
              `He/she will turn **${getAge(data[0])}** on this day.`
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

            let time1 = new Date(`${year}-${a[0]}-${a[1]}`).setHours(0);
            let time2 = new Date(`${year}-${b[0]}-${b[1]}`).setHours(0);

            return (time1 - time) - (time2 - time);
          });

          data = data.slice(0, 10);

          for (entry of data) {
            let date = `**${formatMonthName(entry[1][0])} ${entry[1][1]}**\n`;
            let bd = `> <@${entry[0]}> (${getAge(entry[1][2])})\n`;

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

        if(dontHide) {
          interaction.channel.send({ embeds: [embed] });
          interaction.editReply('👍');
        }
        else interaction.editReply({ embeds: [embed] });
        break;
    }

  }
})