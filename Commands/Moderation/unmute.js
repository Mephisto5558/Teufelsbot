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

    if (!target) return this.editReply(lang('notFound'));
    else if (!target.isCommunicationDisabled()) return this.editReply(lang('notMuted'));
    else if (target.roles.highest.comparePositionTo(this.member.roles.highest) > -1 && this.guild.ownerId != this.user.id)
      return this.editReply(lang('global.noPermUser'));
    else if (!target.moderatable) return this.editReply(lang('global.noPermBot'));

    await target.disableCommunicationUntil(null, `${reason}, moderator ${this.user.tag}`);
    return this.editReply(lang('success', target.user.id));
  }
};