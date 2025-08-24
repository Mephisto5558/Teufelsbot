const { inlineCode } = require('discord.js');

/** @type {import('.')} */
module.exports = {
  options: [{
    name: 'module',
    type: 'String',
    required: true,
    choices: ['gatekeeper', 'birthday']
  }],

  async run(lang) {
    const
      module = this.options.getString('module', true),
      setting = this.guild.db[module]?.enable; // TODO: document and probably sth like `this.guild.db.modules[module]` for better typing

    await this.guild.updateDB(`${module}.enable`, !setting);
    return this.editReply(lang('success', { name: inlineCode(module), state: lang(setting ? 'global.disabled' : 'global.enabled') }));
  }
};