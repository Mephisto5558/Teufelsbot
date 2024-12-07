/** @type {command<'both'>}*/
module.exports = {
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, channel: 0, user: 0 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: false,
  disabled: false,
  disabledReason: '',
  noDefer: false,
  ephemeralDefer: false,
  options: [{
    name: '',
    type: '',
    autocompleteOptions: [],
    strictAutocomplete: false,
    required: false,
    choices: ['']
  }],

  run(lang) {

  }
};

/* do not copy anything below, that are just explanations.
   strictAutocomplete makes it like choices but without max. options
   subcommand groups and subcommands can have cooldowns as well (subcommand group, subcommand and normal command cooldown are checked)*/
/** @type {commandOptions[]}*/
const options = [{
  name: '',
  type: 'Subcommand',
  cooldowns: { guild: 0, channel: 0, user: 0 },
  dmPermission: false,
  options: []
}];