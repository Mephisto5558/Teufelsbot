const
  { userMention } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { checkTargetManageable } = require('#Utils');

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { client: [Permissions.MuteMembers], user: [Permissions.MuteMembers] },
  cooldowns: { user: '100ms' },
  options: [
    {
      name: 'target',
      type: 'User',
      required: true
    },
    { name: 'reason', type: 'String' }
  ],

  async run(lang) {
    const
      target = this.options.getMember('target'),
      reason = this.options.getString('reason') ?? lang('noReason');

    if (!target) return this.editReply(lang('notFound'));
    if (!target.isCommunicationDisabled()) return this.editReply(lang('notMuted'));

    const err = checkTargetManageable.call(this, target);
    if (err) return this.editReply(lang(err));

    /* eslint-disable-next-line unicorn/no-null -- `null` must be used here. */
    await target.disableCommunicationUntil(null, `${reason} | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`);
    return this.editReply(lang('success', userMention(target.user.id)));
  }
});