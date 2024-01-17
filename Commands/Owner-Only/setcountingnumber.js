const { getTargetChannel } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'setcountingnumber',
  aliases: { prefix: ['setcountingnum'] },
  slashCommand: false,
  prefixCommand: true,

  /**@this GuildMessage*/
  run: async function (lang) {
    const
      /**@type {import('discord.js').Snowflake}*/
      channel = getTargetChannel.call(this, { returnSelf: true }).id,
      number = parseInt(this.args[0] ?? 0);

    if (isNaN(number)) return this.reply(lang('invalidNumber'));

    await this.client.db.update('guildSettings', `${this.guild.id}.counting.${channel}`, { lastNumber: number, lastAuthor: 'setcountingnumber' });
    return this.reply(lang('success', { channel, number }));
  }
};
