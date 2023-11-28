const { AllowedMentionsTypes } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'afk',
  cooldowns: { user: 5000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'message',
      type: 'String',
      maxLength: 1000
    },
    { name: 'global', type: 'Boolean' }
  ],

  run: async function (lang) {
    const
      global = this.options?.getBoolean('global') ?? this.args?.[0] == 'global',
      message = this.options?.getString('message') || this.content?.substring(global ? 7 : 0, 1000) || 'AFK',
      createdAt = Math.round(this.createdTimestamp / 1000);

    if (global || !this.guildId) await this.client.db.update('userSettings', `${this.user.id}.afkMessage`, { message, createdAt });
    else await this.client.db.update('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`, { message, createdAt });

    if (this.member?.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(`[AFK] ${this.member.displayName}`);

    return this.customReply({ content: lang(global || !this.guildId ? 'globalSuccess' : 'success', message), allowedMentions: { parse: [AllowedMentionsTypes.User] } });
  }
};
