/**@type {command}*/
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

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      target = this.options.getMember('target'),
      reason = this.options.getString('reason') || lang('noReason');

    if (!target) return this.editReply(lang('notFound'));
    if (!target.isCommunicationDisabled()) return this.editReply(lang('notMuted'));
    if (this.member.roles.highest.position > target.roles.highest.position || this.user.id == this.guild.ownerId)
      return this.editReply(lang('global.noPermUser'));
    if (!target.moderatable) return this.editReply(lang('global.noPermBot'));

    await target.disableCommunicationUntil(null, `${reason} | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`);
    return this.editReply(lang('success', target.user.id));
  }
};