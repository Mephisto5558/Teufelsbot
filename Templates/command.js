/**@type {command}*/
module.exports = {
  name: '',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
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
    choices: [''],
  }],

  run: function (lang) {

  }
};

//strictAutocomplete makes it like choices but without max. options
//subcommand groups and subcommands can have cooldowns as well (subcommand group, subcommand and normal command cooldown are checked)
const options = [{
  name: '',
  type: 'Subcommand',
  cooldowns: { guild: 0, user: 0 },
  options: []
}];


//Possible typing infos for run. These are defined in globals.d.ts
/**@this Message @param {lang}lang*/
/**@this GuildMessage @param {lang}lang*/

/**@this Interaction @param {lang}lang*/
/**@this GuildInteraction @param {lang}lang*/

/**@this Interaction|Message @param {lang}lang*/
/**@this GuildInteraction|GuildMessage @param {lang}lang*/