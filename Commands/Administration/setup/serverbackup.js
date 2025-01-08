const backup = new Map(['creator', 'owner', 'creator+owner', 'admins'].map((e, i) => [e, i]));

/** @type {import('.')} */
module.exports = {
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
};