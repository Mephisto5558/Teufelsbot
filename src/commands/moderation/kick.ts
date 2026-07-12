import { Command, CommandType, OptionType, Permission, PermissionType } from '@mephisto5558/command';

export default new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.Client]: [Permission.KickMembers], [PermissionType.User]: [Permission.KickMembers] },
  options: [
    {
      name: 'reason',
      type: OptionType.String,
      required: true
    },
    { name: 'target', type: OptionType.User }
  ],

  run: require('#utils/combinedCommands').ban_kick_mute
});