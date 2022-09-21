module.exports = {
  name: 'globalsync',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async function (lang, client) {
    client.log('Syncing Slash Commands globally...');

    for (const guild of client.guilds.cache) await client.application.commands.set([], guild[0]);

    await require('../../Handlers/slash_command_handler.js').call(client, '*');

    this.customReply(lang('success'));
  }
}