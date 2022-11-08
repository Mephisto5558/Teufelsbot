module.exports = {
  name: 'globalsync',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang, client) {
    client.log('Syncing Slash Commands globally...');

    for (const guild of client.guilds.cache) await client.application.commands.set([], guild[0]);

    await require('../../Handlers/slash_command_handler.js').call(client, '*');

    this.customReply(lang('success'));
  }
};