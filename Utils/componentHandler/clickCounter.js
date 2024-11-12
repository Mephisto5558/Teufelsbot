/** @type {import('.').clickCounter}*/
module.exports = async function clickCounter(lang, count) {
  lang.__boundArgs__[0].backupPath = 'commands.minigames.clickcounter';

  const
    embed = this.message.embeds[0].data,
    button = this.message.components[0].components[0].data;

  count = Number(count) + 1;

  embed.description = embed.description.split(':').toSpliced(-1, 1, count).join(': ');
  embed.footer = { text: lang('embedFooterText', this.member.displayName), icon_url: this.member.displayAvatarURL() }; /* eslint-disable-line camelcase */
  button.custom_id = this.customId.split('.').toSpliced(-1, 1, count).join('.'); /* eslint-disable-line camelcase */

  return this.update({ embeds: this.message.embeds, components: this.message.components });
};