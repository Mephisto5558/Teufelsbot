const
  { Command } = require('reconlx'),
  responseList = [
    'ist müde und geht jetzt schlafen :3',
    'geht jetzt ins Bettchen <:engelchen:725458214044303371>',
    'schläft jetzt, hoffentlich schnarcht er/sie nicht <:gucken:725670318164672543>'
  ];

module.exports = new Command({
  name: 'sleep',
  aliases: { prefix: [], slash: [] },
  description: 'sends a sleep messsage',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: (message, _, { functions }) => functions.reply(`${message.member.displayName} ${responseList.random()}`, message)
})