const
  { EmbedBuilder, Colors } = require('discord.js'),
  { readFileSync } = require('fs'),
  { Invite, Dashboard, PrivacyPolicy } = require('../../config.json').Website;

module.exports = {
  name: 'info',
  cooldowns: { user: 50 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang, client) {
    const
      startTime = Math.round(Date.now() / 1000 - process.uptime()),
      startCount = readFileSync('./Logs/startCount.log', 'utf8') || 0,
      owner = client.application.owner || client.application.owner.owner,
      description =
        `${lang('dev')}: [${owner.tag}](https://discord.com/users/${owner.id})\n` +
        `${lang('shard')}: \`${this.guild.shardId}\`\n` +
        `${lang('global.guild')}: \`${client.db.get('guildSettings')[this.guild.id]?.position || 0}\`\n` +
        `${lang('commands')}: \`${new Set(client.prefixCommands.filter(e => !e.aliasOf), client.slashCommands.filter(e => !e.aliasOf)).size}\`\n` +
        `${lang('starts')}: \`${startCount}\`\n` +
        `${lang('lastStart')}: <t:${startTime}> (<t:${startTime}:R>)\n` +
        lang('translation', { de: '[.̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558](https://discord.com/users/691550551825055775) & [Koikarpfen#4992](https://discord.com/users/636196723852705822)', en: '[.̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558](https://discord.com/users/691550551825055775)' }) +
        lang('links', { Invite, Dashboard, PrivacyPolicy }),

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: description,
        color: Colors.DarkGold,
        footer: { text: lang('embedFooterText') }
      });

    this.customReply({ embeds: [embed] });
  }
};