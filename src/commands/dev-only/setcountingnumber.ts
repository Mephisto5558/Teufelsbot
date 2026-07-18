import { bold, channelLink } from 'discord.js';
import { Command, CommandType, OptionType } from '@mephisto5558/command';


export default new Command({
  types: [CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['setcountingnum'] },
  options: [{
    name: 'channel',
    type: OptionType.Channel
  }],

  async run(lang, { command }) {
    const
      channel = command.findOption().getChannel(this, true).id,
      number = this.args[0] ? Number.parseInt(this.args[0], 10) : 0;

    if (!this.guild.db.channelMinigames?.counting) return this.reply(lang('invalidChannel'));
    if (Number.isNaN(number)) return this.reply(lang('invalidNumber'));

    await this.guild.updateDB(`channelMinigames.counting.${channel}`, {
      lastNumber: number, lastAuthor: this.client.user.id
    });

    return this.reply(lang('success', { channel: channelLink(channel), number: bold(number.toString()) }));
  }
});