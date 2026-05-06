const
  { bold, channelLink } = require('discord.js'),
  { Command, CommandType, OptionType } = require('@mephisto5558/command');


module.exports = new Command({
  types: [CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['setcountingnum'] },
  options: [{
    name: 'channel',
    type: OptionType.Channel
  }],

  async run(lang, { command }) {
    const
      channel = command.findOption().getChannel(this, true).id,
      number = Number.parseInt(this.args[0] ?? 0, 10);

    if (!this.guild.db.channelMinigames?.counting) return this.reply(lang('invalidChannel'));
    if (Number.isNaN(number)) return this.reply(lang('invalidNumber'));

    await this.guild.updateDB(`channelMinigames.counting.${channel}`, {
      lastNumber: number, lastAuthor: command
    });
    return this.reply(lang('success', { channel: channelLink(channel), number: bold(number) }));
  }
});