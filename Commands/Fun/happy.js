const responseList = [
  'c:', 'C:', ':D', 'uwu', 'Wuiiii',
  '<:gucken:725670318164672543>',
  'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
  'https://tenor.com/view/happy-cat-smile-cat-gif-26239281'
];

/**@type {command}*/
module.exports = {
  name: 'happy',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  /**@this Message*/
  run: function () { return this.customReply(responseList.random()); }
};
