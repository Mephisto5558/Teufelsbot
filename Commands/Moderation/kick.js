const { Command, OptionType, Permissions, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { client: [Permissions.KickMembers], user: [Permissions.KickMembers] },
  options: [
    {
      name: 'reason',
      type: OptionType.String,
      required: true
    },
    { name: 'target', type: OptionType.User }
  ],

  run: require('#Utils/combinedCommands').ban_kick_mute
});