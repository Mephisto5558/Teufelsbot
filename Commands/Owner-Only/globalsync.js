module.exports = {
  name: 'globalsync',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    this.client.log('Syncing Slash Commands globally...');

    for (const guild of this.client.guilds.cache) await this.client.application.commands.set([], guild[0]);

    await require('../../Handlers/slash_command_handler.js').call(this.client, '*');

    return this.customReply(lang('success'));
  }
};