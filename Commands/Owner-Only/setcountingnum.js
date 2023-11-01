module.exports = {
  name: 'setcountingnumber',
  aliases: { prefix: ['setcountingnum'] },
  slashCommand: false,
  prefixCommand: true,
  dmPermission: false,

  /**@this GuildMessage @param {lang}lang*/
  run: async function (lang) {
    const
      channel = this.args[1] ?? this.channel.id,
      number = parseInt(this.args[0] ?? 0);

    if (isNaN(number)) return this.reply(lang('invalidNumber'));
    if (!this.guild.cache.get(channel)) return this.reply(lang('unknownChannel'));

    await this.guild.db.update('guildSettings', `counting.${channel}`, { lastNumber: number, lastAuthor: 'setcountingnumber' });
    return this.reply(lang('success', { channel, number }));
  }
};