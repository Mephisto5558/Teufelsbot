const { setAfkPrefix } = require('#Utils').afk;

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) {
    void setAfkPrefix(this.member);

    await this.user.updateDB('afkMessage', { message: lang('afkMessage'), createdAt: this.createdAt });
    return this.customReply(lang('responseList', {
      user: this.member.displayName,
      emoji: [this.client.application.getEmoji('angel'), this.client.application.getEmoji('derp_ball')].random()
    }));
  }
};