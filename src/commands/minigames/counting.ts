import { Constants } from 'discord.js';
import { Command, CommandType, CooldownType, OptionType, Permission, PermissionType } from '@mephisto5558/command';
import { setupMinigameChannel } from '#utils/combinedCommands';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  permissions: { [PermissionType.User]: [Permission.ManageChannels] },
  cooldowns: { [CooldownType.Channel]: '1s' },
  options: [{
    name: 'channel',
    type: OptionType.Channel,
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
});