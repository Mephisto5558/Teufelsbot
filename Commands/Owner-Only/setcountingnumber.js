const { getTargetChannel } = require('../../Utils');

/** @type {command<'prefix'>}*/
module.exports = {
  name: 'setcountingnumber',
  aliases: { prefix: ['setcountingnum'] },
  slashCommand: false,
  prefixCommand: true,

  run: async function (lang) {
    const
      channel = getTargetChannel.call(this, { returnSelf: true }).id,
      number = parseInt(this.args[0] ?? 0);

    if (isNaN(number)) return this.reply(lang('invalidNumber'));

    await this.client.db.update('guildSettings', `${this.guild.id}.counting.${channel}`, { lastNumber: number, lastAuthor: 'setcountingnumber' });
    return this.reply(lang('success', { channel, number }));
  }
};
