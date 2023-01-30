module.exports = {
  name: 'afk',
  cooldowns: { user: 20 },
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'message',
      type: 'String',
      maxLength: 1000
    },
    { name: 'global', type: 'Boolean' }
  ],

  run: function (lang) {
    const
      global = this.options?.getBoolean('global') ?? this.args?.[0] == 'global',
      message = this.options?.getString('message') || this.content?.substring(global ? 7 : 0, 1000) || 'AFK',
      createdAt = Math.round(this.createdTimestamp / 1000).toString();

    if (global) this.client.db.update('userSettings', `${this.user.id}.afkMessage`, { message, createdAt });
    else this.client.db.update('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`, { message, createdAt });

    if (this.member.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(`[AFK] ${this.member.displayName}`);

    this.customReply(global ? lang('globalSuccess', message) : lang('success', message));
  }
};