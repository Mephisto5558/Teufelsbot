const
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { maxBanMessageDeleteDays } = require('#Utils').constants;

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { client: [Permissions.BanMembers], user: [Permissions.BanMembers] },
  options: [
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    {
      name: 'delete_days_of_messages',
      type: 'Number',
      minValue: 1,
      maxValue: maxBanMessageDeleteDays
    },
    { name: 'target', type: 'User' }
  ],

  run: require('#Utils/combinedCommands').ban_kick_mute
});