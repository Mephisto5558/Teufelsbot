const { inlineCode } = require('discord.js');

/** @type {import('.').default} */
module.exports = {
  options: [{
    name: 'confirmation',
    type: 'String',
    required: true
  }],

  async run(lang, oldData) {
    if (this.options.getString('confirmation', true).toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));
    if (!oldData.__count__) return this.editReply(lang('noneFound'));

    await this.guild.deleteDB('triggers');
    return this.editReply(lang('deletedAll', inlineCode(oldData.__count__)));
  }
};