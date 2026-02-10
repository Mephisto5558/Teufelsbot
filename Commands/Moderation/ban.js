const
  { Command, OptionType, Permissions, commandTypes } = require('@mephisto5558/command'),
  { maxBanMessageDeleteDays } = require('#Utils').constants;

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { client: [Permissions.BanMembers], user: [Permissions.BanMembers] },
  options: [
    {
      name: 'reason',
      type: OptionType.String,
      required: true
    },
    {
      name: 'delete_days_of_messages',
      type: OptionType.Number,
      minValue: 1,
      maxValue: maxBanMessageDeleteDays
    },
    { name: 'target', type: OptionType.User }
  ],

  run: require('#Utils/combinedCommands').ban_kick_mute
});