const { Constants } = require('discord.js');

module.exports = new MixedCommand({
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: 1000 },
  options: [
    new CommandOption({ name: 'channel', type: 'Channel', channelTypes: Constants.GuildTextBasedChannelTypes }),
    new CommandOption({ name: 'reason', type: 'String' })
  ],

  run: require('#Utils/combinedCommands').lock_unlock
});