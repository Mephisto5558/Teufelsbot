const { Command } = require('reconlx');

module.exports = new Command({
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

  run: async interaction => {
    const
      target = interaction.options.getMember('target'),
      reason = interaction.options.getString('reason') || 'no reason specified';

    let errorMsg;

    if (!target) errorMsg = 'I cannot find that user.';
    else if (!target.isCommunicationDisabled()) errorMsg = 'This user is not timed out.'
    else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
      errorMsg = `You don't have the permission to do that!`;
    else if (!target.moderatable) errorMsg = `I don't have the permission to do that!`;

    if (errorMsg) return interaction.editReply(errorMsg);

    await target.disableCommunicationUntil(null, `${reason}, moderator ${interaction.user.tag}`);
    interaction.editReply(`Removed timeout for user ${target.user.tag}`);
  }
})