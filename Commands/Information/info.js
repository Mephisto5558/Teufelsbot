const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Invite, Dashboard, PrivacyPolicy } = require('../../config.json')?.Website ?? {};

/** @type {command<'both', false>}*/
module.exports = {
  name: 'info',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const
      startTime = Math.round(Date.now() / 1000 - process.uptime()),
      owner = this.client.application.owner.owner ?? this.client.application.owner,
      description =
        `${lang('dev')}: [${owner.tag}](https://discord.com/users/${owner.id})\n`
        + `${lang('shard')}: \`${this.guild.shardId}\`\n`
        + `${lang('guild')}: \`${this.guild.db.position ?? 0}\`\n`
        + `${lang('guilds')}: \`${this.client.guilds.cache.size}\`\n`
        + `${lang('commands')}: \`${new Set(this.client.prefixCommands.filter(e => !e.aliasOf), this.client.slashCommands.filter(e => !e.aliasOf)).size}\`\n`
        + `${lang('starts')}: \`${this.client.settings.startCount[this.client.botType] ?? 0}\`\n`
        + `${lang('lastStart')}: <t:${startTime}> (<t:${startTime}:R>)\n`
        + lang('translation', { de: '[Mephisto5558](https://discord.com/users/691550551825055775) & [Koikarpfen1907](https://discord.com/users/636196723852705822)', en: '[Mephisto5558](https://discord.com/users/691550551825055775) & [PenguinLeo](https://discord.com/users/740930989798195253)' }),

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: description,
        color: Colors.DarkGold,
        footer: { text: lang('embedFooterText') }
      });

    if (Invite && Dashboard && PrivacyPolicy) embed.data.description += lang('links', { Invite, Dashboard, PrivacyPolicy });

    return this.customReply({ embeds: [embed] });
  }
};