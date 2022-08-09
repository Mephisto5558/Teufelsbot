const { Command } = require('reconlx');
const responseList = [
  'c:', 'C:', ':D', 'uwu',
  '<:gucken:725670318164672543>',
  'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147'
];

module.exports = new Command({
  name: 'happy',
  aliases: { prefix: [], slash: [] },
  description: 'make the bot send a happy message',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: (message, { functions }) => functions.reply(responseList.random(), message)
})