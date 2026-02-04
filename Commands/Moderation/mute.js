const
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { timeValidator } = require('#Utils');

module.exports = new Command({
  types: [commandTypes.slash],
  aliases: { [commandTypes.slash]: ['timeout'], [commandTypes.prefix]: ['timeout'] },
  permissions: { client: [Permissions.MuteMembers], user: [Permissions.MuteMembers] },
  cooldowns: { user: '100ms' },
  options: [
    {
      name: 'target',
      type: 'User',
      required: true
    },
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    {
      name: 'duration',
      type: 'String',
      required: true,
      autocompleteOptions(query) { return timeValidator(query); },
      strictAutocomplete: true
    }
  ],

  run: require('#Utils/combinedCommands').ban_kick_mute
});