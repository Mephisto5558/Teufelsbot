/** @type {command<'both'>}*/
module.exports = {
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'channel', type: 'Channel' },
    { name: 'reason', type: 'String' }
  ],

  run: require('../../Utils/combinedCommands').lock_unlock
};