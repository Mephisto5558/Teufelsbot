const { Command } = require('reconlx');

module.exports = new Command({
  name: 'reloadlang',
  aliases: { prefix: [], slash: [] },
  description: 'Reloads all language files.',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, client) => {
    const msg = await message.reply(lang('global.loading'));
    client.log(`Reloading language files, initiated by user ${message.author.tag}`);

    await require('../../Handlers/2_localisation_handler.js')(client);

    msg.edit(lang('success'));
  }
})