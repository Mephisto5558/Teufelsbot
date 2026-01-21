const { Command, Permissions, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { client: [Permissions.KickMembers], user: [Permissions.KickMembers] },
  options: [
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    { name: 'target', type: 'User' }
  ],

  run: require('#Utils/combinedCommands').ban_kick_mute
});