module.exports = {
  name: 'unmute',
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'target',
      type: 'User',
      required: true,
    },
    { name: 'reason', type: 'String' }
  ],

  run: async function (lang) {
    const
      target = this.options.getMember('target'),
      reason = this.options.getString('reason') || lang('noReason');

    let errorMsg;

    if (!target) errorMsg = lang('notFound');
    else if (!target.isCommunicationDisabled()) errorMsg = lang('notMuted');
    else if (target.roles.highest.comparePositionTo(this.member.roles.highest) > -1 && this.guild.ownerId != this.user.id)
      errorMsg = lang('global.noPermUser');
    else if (!target.moderatable) errorMsg = lang('global.noPermBot');

    if (errorMsg) return this.editReply(errorMsg);

    await target.disableCommunicationUntil(null, `${reason}, moderator ${this.user.tag}`);
    this.editReply(lang('success', target.user.id));
  }
};