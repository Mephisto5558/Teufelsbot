const { getTargetMember } = require('../../Utils');

/** @type {command<'prefix', false>}*/
module.exports = {
  aliases: { prefix: ['blacklist'] },
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'target', type: 'String', required: true }],
  beta: true,

  run: async function (lang) {
    const target = getTargetMember.call(this)?.id;
    if (this.args[0] == 'off') {
      if (!this.client.settings.blacklist?.includes(target)) return this.customReply(lang('notFound'));

      await this.client.db.update('botSettings', 'blacklist', this.client.settings.blacklist.filter(e => e != target));
      return this.customReply(lang('removed', target));
    }

    if (target == this.client.application.owner.id) return this.customReply(lang('cantBlacklistOwner'));

    await this.client.db.pushToSet('botSettings', 'blacklist', target);
    return this.customReply(lang('saved', target));
  }
};