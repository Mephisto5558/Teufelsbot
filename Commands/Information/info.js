const
  { EmbedBuilder, Colors } = require('discord.js'),
  { readFileSync } = require('fs'),
  { Invite, Dashboard, PrivacyPolicy } = require('../../config.json').Website;

module.exports = {
  name: 'info',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 50 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: function (lang, client) {
    const
      startTime = Math.round(Date.now() / 1000 - process.uptime()),
      startCount = readFileSync('./Logs/startCount.log', 'utf8') || 0,
      owner = client.application.owner.tag || client.application.owner.owner.tag,
      description =
        `${lang('dev')}: ${owner}\n` +
        `${lang('shard')}: \`${this.guild.shardId}\`\n` +
        `${lang('global.guild')}: \`${client.db.get('guildSettings')[this.guild.id]?.position || 0}\n\`` +
        `${lang('starts')}: \`${startCount}\`\n` +
        `${lang('lastStart')}: <t:${startTime}> (<t:${startTime}:R>)\n` +
        lang('translation', { de: '.̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558 & Koikarpfen#4992', en: '.̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558' }) +
        lang('links', { Invite, Dashboard, PrivacyPolicy }),

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: description,
        color: Colors.DarkGold,
        footer: { text: lang('embedFooterText') }
      });

    this.customReply({ embeds: [embed] });
  }
}