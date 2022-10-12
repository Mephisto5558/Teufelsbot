const responseList = [
  'c:', 'C:', ':D', 'uwu',
  '<:gucken:725670318164672543>',
  'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
  'https://tenor.com/view/happy-cat-smile-cat-gif-26239281'
];

module.exports = {
  name: 'happy',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function () { this.customReply(responseList.random()); }
};