/**@type {command}*/
module.exports = {
  name: 'setcountingnumber',
  aliases: { prefix: ['setcountingnum'] },
  slashCommand: false,
  prefixCommand: true,
  dmPermission: false,

  /**@this GuildMessage*/
  run: async function (lang) {
    const
      channel = this.args[1] ?? this.channel.id,
      number = parseInt(this.args[0] ?? 0);

    if (isNaN(number)) return this.reply(lang('invalidNumber'));
    if (!this.guild.channels.cache.get(channel)) return this.reply(lang('unknownChannel'));

    await this.client.db.update('guildSettings', `${this.guild.id}.counting.${channel}`, { lastNumber: number, lastAuthor: 'setcountingnumber' });
    return this.reply(lang('success', { channel, number }));
  }
};
