import { AllContexts, Command, CommandType } from '@mephisto5558/command';


const
  responseList = [
    'c:', 'C:', ':D', 'uwu', 'Wuiiii',
    'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147',
    'https://tenor.com/view/happy-cat-smile-cat-gif-26239281'
  ],
  state = { addedEmoji: false };

export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,

  async run() {
    if (!state.addedEmoji) {
      const emoji = this.client.application.getEmoji('derp_ball');
      if (emoji) responseList.push(emoji);

      state.addedEmoji = true;
    }

    return this.customReply(responseList.random()!);
  }
});