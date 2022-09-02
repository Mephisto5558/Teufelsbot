module.exports = {
  name: 'unmute',
  aliases: { prefix: [], slash: [] },
  description: 'lifts the timeout of a member',
  usage: '',
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'target',
      description: 'who you want to unmute',
      type: 'User',
      required: true,
    },
    {
      name: 'reason',
      description: 'why you want to unmute the target',
      type: 'String',
      required: false
    }
  ],

  run: async (interaction, lang) => {
    const
      target = interaction.options.getMember('target'),
      reason = interaction.options.getString('reason') || lang('noReason');

    let errorMsg;

    if (!target) errorMsg = lang('notFound');
    else if (!target.isCommunicationDisabled()) errorMsg = lang('notMuted');
    else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
      errorMsg = lang('noPerm', lang('global.you'));
    else if (!target.moderatable) errorMsg = lang('noPerm', lang('global.i'));

    if (errorMsg) return interaction.editReply(errorMsg);

    await target.disableCommunicationUntil(null, `${reason}, moderator ${interaction.user.tag}`);
    interaction.editReply(lang('success', target.user.tag));
  }
}