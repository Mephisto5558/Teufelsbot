const
  { Command, CommandType, OptionType, Permission, PermissionType } = require('@mephisto5558/command'),
  { maxBanMessageDeleteDays } = require('#Utils').constants;

module.exports = new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.Client]: [Permission.BanMembers], [PermissionType.User]: [Permission.BanMembers] },
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