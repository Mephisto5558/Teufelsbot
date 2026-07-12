import { Command, CommandType, OptionType, Permission, PermissionType } from '@mephisto5558/command';
import { maxBanMessageDeleteDays } from '#utils');.constants;

export default new Command({
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

  run: require('#utils/combinedCommands').ban_kick_mute
});