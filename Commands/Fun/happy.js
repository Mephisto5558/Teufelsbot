const responseList = [
  'c:', 'C:', ':D', 'uwu', 'Wuiiii',
  '<:derp_ball:1265275872630407199>',
  'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
  'https://tenor.com/view/happy-cat-smile-cat-gif-26239281',
  'https://i.redd.it/goq4k091vrdc1.jpeg'
];

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function () { return this.customReply(responseList.random()); }
};