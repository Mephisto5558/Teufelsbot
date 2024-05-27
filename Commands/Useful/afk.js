const { AllowedMentionsTypes } = require('discord.js');

/** @type {command<'both', false>}*/
module.exports = {
  cooldowns: { user: 5000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'set',
      type: 'Subcommand',
      options: [
        {
          name: 'message',
          type: 'String',
          maxLength: 1000
        },
        { name: 'global', type: 'Boolean' }
      ]
    },
    {
      name: 'get',
      type: 'Subcommand',
      options: [{ name: 'target', type: 'User' }]
    }
  ],

  run: async function (lang) {
    if (this.options?.getSubcommand() == 'get') {
      const target = this.options.getMember('target');
      if (target) {
        const { message, createdAt } = this.guild.db.afkMessages?.[this.user.id] ?? this.user.db.afkMessage ?? {};
        if (message) {
          return this.customReply(lang('events.message.afkMsg', {
            member: target.nickname?.startsWith('[AFK] ') ? target.nickname.slice(6) : target.displayName,
            message, timestamp: Math.round(createdAt / 1000)
          }));
        }
        return this.customReply(lang('getNoneFound'));
      }

      const afkMessages = this.guild.members.cache.reduce((acc, e) => {
        const { message, createdAt } = this.guild.db.afkMessages?.[e.user.id] ?? e.user.db.afkMessage ?? {};
        if (message) {
          acc.push('- ' + lang('events.message.afkMsg', {
            member: e.nickname?.startsWith('[AFK] ') ? e.nickname.slice(6) : e.displayName,
            message, timestamp: Math.round(createdAt / 1000)
          }));
        }

        return acc;
      }, []).join('\n');

      if (afkMessages) return this.customReply(afkMessages);
      return this.customReply(lang('getNoneFound'));
    }

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