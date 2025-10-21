const responseList = [
  'c:', 'C:', ':D', 'uwu', 'Wuiiii',
  'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
  'https://tenor.com/view/happy-cat-smile-cat-gif-26239281'
];

let addedEmoji = false;

/** @type {command<'prefix', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  async run() {
    if (!addedEmoji) {
      responseList.push(this.client.application.getEmoji('derp_ball'));
      addedEmoji = true;
    }

    return this.customReply(responseList.random());
  }
};