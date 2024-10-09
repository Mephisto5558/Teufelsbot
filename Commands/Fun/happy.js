const responseList = [
  'c:', 'C:', ':D', 'uwu', 'Wuiiii',
  'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
  'https://tenor.com/view/happy-cat-smile-cat-gif-26239281',
  'https://i.redd.it/goq4k091vrdc1.jpeg'
];

let addedEmoji = false;

module.exports = new PrefixCommand({
  dmPermission: true,

  run: async function () {
    if (!addedEmoji) {
      responseList.push(getEmoji('derp_ball'));
      addedEmoji = true;
    }

    return this.customReply(responseList.random());
  }
});