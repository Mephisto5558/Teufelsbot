/**@type {command}*/
module.exports = {
  name: 'sleep',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  /**@this Message*/
  run: async function (lang) {
    if (this.member.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(`[AFK] ${this.member.displayName}`);

    await this.client.db.update('userSettings', `${this.user.id}.afkMessage`, { message: lang('afkMessage'), createdAt: Math.round(this.createdTimestamp / 1000).toString() });
    return this.customReply(lang('responseList', this.member.customName));
  }
};