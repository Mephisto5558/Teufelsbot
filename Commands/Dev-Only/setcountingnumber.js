const
  { bold, channelLink } = require('discord.js'),
  { Command, CommandType } = require('@mephisto5558/command'),
  { getTargetChannel } = require('#Utils');


module.exports = new Command({
  types: [CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['setcountingnum'] },

  async run(lang) {
    const
      channel = getTargetChannel(this, { returnSelf: true }).id,
      number = Number.parseInt(this.args[0] ?? 0, 10);

    if (!this.guild.db.channelMinigames?.counting) return this.reply(lang('invalidChannel'));
    if (Number.isNaN(number)) return this.reply(lang('invalidNumber'));

    await this.guild.updateDB(`channelMinigames.counting.${channel}`, {
      lastNumber: number, lastAuthor: this.client.commandManager.get(this.commandName)
    });
    return this.reply(lang('success', { channel: channelLink(channel), number: bold(number) }));
  }
});