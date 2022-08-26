const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { readFileSync } = require('fs'),
  { Invite, Dashboard, PrivacyPolicy } = require('../../config.json').Website;

module.exports = new Command({
  name: 'info',
  aliases: { prefix: [], slash: [] },
  description: 'shows some stats of the bot',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 50 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, lang, client) => {
    const
      startTime = Math.round(client.startTime / 1000),
      startCount = readFileSync('./Logs/startCount.log', 'utf8') || 0,
      owner = client.application.owner.tag || client.application.owner.owner.tag,
      description =
        `${lang('dev')}: ${owner}\n` +
        `${lang('shard')}: \`${message.guild.shardId}\`\n` +
        `${lang('global.guild')}: \`${client.db.get('guildSettings')[message.guild.id]?.position || 0}\n\`` +
        `${lang('starts')}: \`${startCount}\`\n` +
        `${lang('lastStart')}: <t:${startTime}> (<t:${startTime}:R>)\n` +
        lang('links', Invite, Dashboard, PrivacyPolicy),

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: description,
        color: Colors.DarkGold,
        footer: { text: lang('embedFooterText') }
      });

    message.customreply({ embeds: [embed] });
  }
})