const { timeValidator } = require('#Utils');

/** @type {command<'slash'>}*/
module.exports = {
  aliases: { prefix: ['timeout'], slash: ['timeout'] },
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: false,
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
      autocompleteOptions: function () { return timeValidator(this.focused.value); },
      strictAutocomplete: true
    }
  ],

  run: require('#Utils/combinedCommands').ban_kick_mute
};