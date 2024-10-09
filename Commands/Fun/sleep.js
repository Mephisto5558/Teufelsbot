const { setAfkPrefix } = require('#Utils').afk;

module.exports = new PrefixCommand({
  dmPermission: true,

  run: async function (lang) {
    void setAfkPrefix(this.member, 'set');

    await this.user.updateDB('afkMessage', { message: lang('afkMessage'), createdAt: this.createdAt });
    return this.customReply(lang('responseList', { user: this.member.customName, emoji: [getEmoji('angel'), getEmoji('derp_ball')].random() }));
  }
});