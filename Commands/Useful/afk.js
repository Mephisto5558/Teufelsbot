const { AllowedMentionsTypes } = require('discord.js');

/** @type {command<'both', false>}*/
module.exports = {
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
      message = this.options?.getString('message') ?? (this.content?.slice(global ? 7 : 0, 1000) || 'AFK');

    await (global || !this.inGuild()
      ? this.user.updateDB('afkMessage', { message, createdAt: this.createdAt })
      : this.guild.updateDB(`afkMessages.${this.user.id}`, { message, createdAt: this.createdAt }));

    if (this.member?.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(`[AFK] ${this.member.displayName}`);

    return this.customReply({ content: lang(global || !this.guildId ? 'globalSuccess' : 'success', message), allowedMentions: { parse: [AllowedMentionsTypes.User] } });
  }
};