module.exports = {
  name: 'sleep',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    this.customReply(lang('responseList', this.member.customName));
    this.client.db.update('userSettings', `${this.user.id}.afkMessage`, { message: lang('afkMessage'), createdAt: Math.round(this.createdTimestamp / 1000).toString() });

    if (this.member.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] ')) return this.member.setNickname(`[AFK] ${this.member.displayName}`);
  }
};