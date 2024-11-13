const { maxBanMessageDeleteDays } = require('#Utils').constants;

/** @type {command<'slash'>}*/
module.exports = {
  permissions: { client: ['BanMembers'], user: ['BanMembers'] },
  slashCommand: true,
  prefixCommand: false,
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
};