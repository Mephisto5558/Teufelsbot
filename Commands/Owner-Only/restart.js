const { Command } = require("reconlx");

module.exports = new Command({
  name: 'restart',
  aliases: [],
  description: `restarts the bot`,
  permissions: {client: [], user: []},
  category : "Owner-Only",
  slashCommand: false,
  prefiCommand: true,
  run: async (client, message, interaction) => {
  
    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if(!permissionGranted) return;
    
    console.log(`Restart initiated by user '${message.member.user.tag}'`)
    console.log("Restarting bot...")
    await client.functions.reply("Restarting bot...", message)

    const axios = require('axios')
    var response = {};
    
    try {
      response = await axios({
        method: 'POST',
        url: 'https://teufelswerk-music-bot.mephisto5558.repl.co/restart',
        data: { token: '12FBC2E0DBCD16C3B0D521EC552EE155AC06922AF4849C3D6405ACCB42F19E6F' }
      });
    }
    catch(error) {
      if(error?.response?.status === 502) { errorCode = "its offline" } else { errorCode = "unknown error" };
      await client.functions.reply(`Music Module cannot be restarted, ${errorCode} (${error?.response?.status + ': ' + error?.response?.statusText || 'no error code returned'}), check the console for more information.`, message)
      throw error;
    }
    finally {
      if(response.statusCode == 403) return client.functions.reply("Music Module cannot be restarted, permission denied (403)", message);
      process.exit(0)
    }
  }
})