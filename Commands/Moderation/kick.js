const { Command } = require('@mephisto5558/command');

module.exports = new Command({
  types: ['slash'],
  permissions: { client: ['KickMembers'], user: ['KickMembers'] },
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