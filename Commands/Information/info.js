const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { readFileSync } = require('fs'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'info',
  aliases: [],
  description: 'shows some stats of the bot',
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 50 },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    const
      startCount = readFileSync('./Logs/startCount.log', 'utf8') || 0,
      owner = client.application.owner.tag || client.api.application.owner.owner.tag,
      description =
        `Developer: ${owner}\n` +
        `Shard: ${message.guild.shardId}\n` +
        `Starts: ${startCount}\n` +
        `Last start: <t:${Math.round(new Date(client.startTime) / 1000)}>\n` +
        `[Dashboard](https://teufelsbot.mephisto5558.repl.co/)\n` +
        `[Privacy Policy](https://teufelsbot.mephisto5558.repl.co/privacy)`,

      embed = new MessageEmbed({
        title: 'Stats',
        description: description,
        colors: colors.DARK_GOLD,
        footer: { text: 'More stats are coming soon!' }
      });

    client.functions.reply({ embeds: [embed] }, message);
  }
})