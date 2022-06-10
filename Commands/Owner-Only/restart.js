const { Command } = require('reconlx');
const axios = require('axios');

let response = {};

module.exports = new Command({
  name: 'restart',
  aliases: [],
  description: 'restarts the bot',
  usage: 'PREFIX Command: restart',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    client.log(`Restarting bot, initiated by user '${message.user.tag}'...`);
    await client.functions.reply('Restarting bot...', message);

    try {
      response = await axios.post('https://teufelswerk-music-bot.mephisto5558.repl.co/restart', {
        data: { token: client.keys.webCommandKey }
      })
    }
    catch (err) {
      if (err.response) {
        if (err.response.status == 502) errorCode = 'its offline';
        else if (response.statusCode == 403) throw Error('cannot restart music module, permission denied');
        else errorCode = 'unknown error';

        await client.functions.reply(`Music Module cannot be restarted, ${errorCode} (${err.response.status + ': ' + err.response.statusText || 'no error code returned'}), check the console for more information.`, message)
        throw err;
      }
      else throw err;
    }
    finally {
      
      process.exit(0);
    }
  }
})