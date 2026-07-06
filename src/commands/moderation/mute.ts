const
  { Command, CommandType, CooldownType, OptionType, Permission, PermissionType } = require('@mephisto5558/command'),
  { timeValidator } = require('#utils');

module.exports = new Command({
  types: [CommandType.Slash],
  aliases: { [CommandType.Slash]: ['timeout'], [CommandType.Prefix]: ['timeout'] },
  permissions: { [PermissionType.Client]: [Permission.MuteMembers], [PermissionType.User]: [Permission.MuteMembers] },
  cooldowns: { [CooldownType.User]: '100ms' },
  options: [
    {
      name: 'target',
      type: OptionType.User,
      required: true
    },
    {
      name: 'reason',
      type: OptionType.String,
      required: true
    },
    {
      name: 'duration',
      type: OptionType.String,
      required: true,
      autocompleteOptions: timeValidator,
      strictAutocomplete: true
    }
  ],

  run: require('#utils/combinedCommands').ban_kick_mute
});