/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) {
    if (this.member.moderatable && this.member.displayName.length < 26 && !this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(`[AFK] ${this.member.displayName}`);

    await this.user.updateDB('afkMessage', { message: lang('afkMessage'), createdAt: this.createdAt });
    return this.customReply(lang('responseList', this.member.customName));
  }
};