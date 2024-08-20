const { AllowedMentionsTypes, Message } = require('discord.js');

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
      if (this instanceof Message) return; // typeguard

      const target = this.inGuild() ? this.options.getMember('target') : this.options.getUser('target') ?? this.user;
      if (target) {
        const { message, createdAt } = this.guild?.db.afkMessages?.[target.id] ?? ('user' in target ? target.user : target).db.afkMessage ?? {};
        if (!message) return this.customReply(lang('getNoneFound'));

        return this.customReply(lang('events.message.afkMsg', {
          member: target.displayName.replace(/^\[AFK] /, ''), message, timestamp: Math.round(createdAt / 1000)
        }));
      }

      if (!this.inGuild()) return; // typeguard
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
      /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional */
      message = this.options?.getString('message') ?? (this.content?.slice(global ? 7 : 0, 1000) || 'AFK');

    await (global || !this.inGuild()
      ? this.user.updateDB('afkMessage', { message, createdAt: this.createdAt })
      : this.guild.updateDB(`afkMessages.${this.user.id}`, { message, createdAt: this.createdAt }));

    if (this.member?.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] '))
      void this.member.setNickname(`[AFK] ${this.member.displayName}`);

    return this.customReply({ content: lang(global || !this.guildId ? 'globalSuccess' : 'success', message), allowedMentions: { parse: [AllowedMentionsTypes.User] } });
  }
};