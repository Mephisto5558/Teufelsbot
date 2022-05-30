const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  embedConfig = require('../../Settings/embed.json').colors;

module.exports = new Command({
  name: 'birthday',
  alias: ['bd'],
  description: 'save your birthday and get a I will send a message on your birthday',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'set',
      description: 'set your own birthday',
      type: 'SUB_COMMAND',
      options: [{
        name: 'date',
        description: 'when do you have birthday? Valid formats are: YYYY/MM/DD, YY/MM/DD. "/" can also be "." or ":".',
        type: 'STRING',
        required: true
      }]
    },
    {
      name: 'get',
      description: 'get a list of the next birthdays',
      type: 'SUB_COMMAND',
      options: [{
        name: 'target',
        description: `whose birthday do you want to get?`,
        type: 'USER',
        required: false
      }]
    }
  ],

  run: async (client, _, interaction) => {

    let
      command = interaction.options.getSubcommand(),
      birthday = interaction.options.getString('date'),
      target = interaction.options.getUser('target'),
      oldData = await client.db.get('birthdays');

    if (command == 'set') {
      let regex = /^(?:(?:\d{4}|\d{2})[\/.:](?:0\d|1[0-2])[\/.:]\d\d)$/g; //checks YYYY<./:>MM<./:>/DD
      let check = regex.test(birthday);

      if (!check) {
        let embed = new MessageEmbed()
          .setTitle('Invalid Input')
          .setDescription(
            'The provided birthday format was not recognized by the bot.\n' +
            'Valid formats are `YYYY/MM/DD` and `YY/MM/DD`.\n' +
            'Example: 2001/09/06\n' +
            'The delimiter can be `/`, `.` or `:`'
          )
        .setColor(embedConfig.discord.RED);
        return interaction.editReply({ embeds: [embed] });
      }

      birthday = birthday.replace(/[:.]/g, '/');

      let newData = Object.assign({}, oldData, { [interaction.user.id]: birthday });
      client.db.set('birthdays', newData);

      return interaction.editReply('Your birthday has been saved.' /*maybe add "your birthday is in <d> days"*/);
    }

    if (command == 'get') {
      let isInGuild;
      i = 0;
      let newData = '';
      let embed = new MessageEmbed();

      if (target) {
        embed.setTitle(`${target.tag}'s Birthday`);
        newData = oldData[target.id] || 'this user has no birthday :(';
      }
      else {
        embed.setTitle('The next birthdays');

        for (entry of Object.entries(oldData)) {
          if (i > 10) break;
          await interaction.guild.members.fetch(entry[0])
            .then(_ => isInGuild = true)
            .catch(_ => isInGuild = false);

          if (!isInGuild) continue;

          newData += `<@${entry[0]}>: ${entry[1]}\n`
          i++
        }
      }

      embed
        .setTitle('The next birthdays')
        .setDescription(newData || 'no one seems to have birthday...')
        .setColor(embedConfig.discord.BURPLE)
        .setFooter({
          text: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL
        });

      return interaction.editReply({ embeds: [embed] });
    }
  }
})