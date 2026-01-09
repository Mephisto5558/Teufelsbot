const
  { Command } = require('@mephisto5558/command'),
  responseList = [
    'c:', 'C:', ':D', 'uwu', 'Wuiiii',
    'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
    'https://tenor.com/view/happy-cat-smile-cat-gif-26239281'
  ];

let addedEmoji = false;

module.exports = new Command({
  types: ['prefix'],
  dmPermission: true,

  async run() {
    if (!addedEmoji) {
      responseList.push(this.client.application.getEmoji('derp_ball'));
      addedEmoji = true;
    }

    return this.customReply(responseList.random());
  }
});