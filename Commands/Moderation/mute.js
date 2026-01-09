const
  { Command } = require('@mephisto5558/command'),
  { timeValidator, timeFormatter: { msInSecond } } = require('#Utils');

module.exports = new Command({
  types: ['slash'],
  aliases: { prefix: ['timeout'], slash: ['timeout'] },
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { user: msInSecond / 10 },
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