const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { readFileSync } = require('fs'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'info',
  alias: [],
  description: 'shows some stats of the bot',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    const
      startCount = readFileSync('./Logs/startCount.log', 'utf8') || 0,
      startDate = new Date(client.startTime).toLocaleString('en', { hourCycle: 'h24' }),
      owner = await client.users.fetch(client.owner),
      description =
        `Developer: ${owner.tag}\n` +
        `Starts: ${startCount}\n` +
        `Last start: ${startDate}` +
        `[Privacy Policy](https://teufelsbot.mephisto5558.repl.co/privacy)`,

      embed = new MessageEmbed()
        .setTitle('Stats')
        .setDescription(description)
        .setColor(colors.DARK_GOLD)
        .setFooter({ text: 'More stats are coming soon!' });

    client.functions.reply({ embeds: [embed] }, message);
  }
})