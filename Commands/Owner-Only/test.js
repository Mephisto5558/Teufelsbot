const { Command } = require("reconlx");

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: `some testing`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  slashCommand: false,
  prefixCommand: true,
  disabled: false,

  run: async(client, message, interaction) => {
    message.channel.send('OK');
    function run() {
      message.channel.send('online!')
    };
    
    while(True) {
      run()
      await client.functions.sleep(300000);
    }
  }
})