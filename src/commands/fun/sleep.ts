import { AllContexts, Command, CommandType } from '@mephisto5558/command';
import { setAfkPrefix } from '#utils';.afk;

export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,

  async run(lang) {
    void setAfkPrefix(this.member);

    await this.user.updateDB('afkMessage', { message: lang('afkMessage'), createdAt: this.createdAt });
    return this.customReply(lang('responseList', {
      user: this.member.displayName,
      emoji: [this.client.application.getEmoji('angel'), this.client.application.getEmoji('derp_ball')].random()
    }));
  }
});