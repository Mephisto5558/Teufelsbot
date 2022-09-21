module.exports = {
  name: 'unmute',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
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
      errorMsg = lang('noPerm', lang('global.you'));
    else if (!target.moderatable) errorMsg = lang('noPerm', lang('global.i'));

    if (errorMsg) return this.editReply(errorMsg);

    await target.disableCommunicationUntil(null, `${reason}, moderator ${this.user.tag}`);
    this.editReply(lang('success', target.user.tag));
  }
}