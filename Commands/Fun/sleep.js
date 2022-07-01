const { Command } = require('reconlx');
const responseList = [
  'ist müde und geht jetzt schlafen :3',
  'geht jetzt ins Bettchen <:engelchen:725458214044303371>',
  'schläft jetzt, hoffentlich schnarcht er/sie nicht <:gucken:725670318164672543>'
];

module.exports = new Command({
  name: 'sleep',
  aliases: [],
  description: 'sends a sleep messsage',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: (client, message) => {
    const response = responseList[Math.floor(Math.random() * responseList.length)];
    client.functions.reply(`<@${message.author.id}> ${response}`, message)
  }
})