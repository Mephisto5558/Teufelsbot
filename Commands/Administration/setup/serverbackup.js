const
  { CommandOption } = require('@mephisto5558/command'),

  backup = new Map(['creator', 'owner', 'creatorAndOwner', 'admins'].map((e, i) => [e, i]));

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'serverbackup',
  type: 'Subcommand',
  options: [{
    name: 'allowed_to_load',
    type: 'String',
    required: true,
    autocompleteOptions: [...backup.keys()],
    strictAutocomplete: true
  }],

  async run(lang) {
    await this.guild.updateDB('serverbackup.allowedToLoad', Number.parseInt(backup.get(this.options.getString('allowed_to_load', true))));
    return this.editReply(lang('success'));
  }
});