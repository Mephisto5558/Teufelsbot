module.exports = {
  name: 'eval',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  prefixCommand: true,
  slashCommand: false,
  beta: true,

  run: async (message, lang, client) => {
    if (!message.content) return;

    const msg = lang('finished', message.content);

    try {
      await eval(`(async _ => {${message.content}})()`);
      message.customReply(lang('success', msg));
    }
    catch (err) {
      message.customReply(lang('error', { msg, name: err.name, err: err.message }));
    }
    finally {
      client.log(`evaluated command '${message.content}'`);
    }

  }
}