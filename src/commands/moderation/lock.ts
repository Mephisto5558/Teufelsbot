import { Constants } from 'discord.js';
import { Command, CommandType, CooldownType, OptionType, Permission, PermissionType } from '@mephisto5558/command';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  permissions: { [PermissionType.Client]: [Permission.ManageRoles], [PermissionType.User]: [Permission.ManageRoles] },
  cooldowns: { [CooldownType.User]: '1s' },
  options: [
    { name: 'channel', type: OptionType.Channel, channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: OptionType.String }
  ],

  run: require('#utils/combinedCommands').lock_unlock
});