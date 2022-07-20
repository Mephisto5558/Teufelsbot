const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { readFileSync } = require('fs');

module.exports = new Command({
  name: 'info',
  aliases: { prefix: [], slash: [] },
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
      owner = client.application.owner.tag || client.application.owner.owner.tag,
      description =
        `Developer: ${owner}\n` +
        `Shard: ${message.guild.shardId}\n` +
        `Starts: ${startCount}\n` +
        `Last start: <t:${Math.round(new Date(client.startTime) / 1000)}>\n` +
        `Unique guild members: \`${new Set([].concat(...client.guilds.cache.map(g => g.members).map(m => m._cache).map(u => Array.from(u).map(u => u[0])))).size}\`\n` +
        `[Dashboard](https://teufelsbot.mephisto5558.repl.co/)\n` +
        `[Privacy Policy](https://teufelsbot.mephisto5558.repl.co/privacy)`,

      embed = new EmbedBuilder({
        title: 'Stats',
        description: description,
        colors: Colors.DarkGold,
        footer: { text: 'More stats are coming soon!' }
      });

    client.functions.reply({ embeds: [embed] }, message);
  }
})