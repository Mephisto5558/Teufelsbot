const { checkTargetManageable } = require('#Utils');

/** @type {command<'slash'>}*/
module.exports = {
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'target',
      type: 'User',
      required: true
    },
    { name: 'reason', type: 'String' }
  ],

  run: async function (lang) {
    const

      /** @type {import('discord.js').GuildMember?} */
      target = this.options.getMember('target'),
      reason = this.options.getString('reason') ?? lang('noReason');

    if (!target) return this.editReply(lang('notFound'));
    if (!target.isCommunicationDisabled()) return this.editReply(lang('notMuted'));

    const err = checkTargetManageable.call(this, target);
    if (err) return this.editReply(lang(err));

    /* eslint-disable-next-line unicorn/no-null -- `null` must be used here. */
    await target.disableCommunicationUntil(null, `${reason} | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`);
    return this.editReply(lang('success', target.user.id));
  }
};