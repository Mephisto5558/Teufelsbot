module.exports = {
  name: '',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: false,
  disabled: false,
  hideInHelp: false,
  noDefer: false,
  ephemeralDefer: false,
  requireEconomy: false,
  options: [{
    name: '',
    type: '',
    autocompleteOptions: [],
    required: false,
    choices: [{ value: '' }],
  }],

  run: function (lang) {

  }
};

//subcommand groups and subcommands can have cooldowns as well (subcommand group, subcommand and normal command cooldown are checked)
const options = [{
  name: '',
  type: 'Subcommand',
  cooldowns: { guild: 0, user: 0 },
  options: []
}];