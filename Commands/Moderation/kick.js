/** @type {command<'slash'>}*/
module.exports = {
  name: 'kick',
  permissions: { client: ['KickMembers'], user: ['KickMembers'] },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    { name: 'target', type: 'User' }
  ],

  run: require('../../Utils/combinedCommands').ban_kick_mute
};
