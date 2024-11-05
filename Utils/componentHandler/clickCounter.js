/** @type {import('.').clickCounter}*/
module.exports = async function clickCounter(lang, count) {
  lang.__boundArgs__[0].backupPath = 'commands.minigames.clickcounter';

  const
    embed = this.message.embeds[0].data,
    button = this.message.components[0].components[0].data;

  count = Number(count) + 1;

  /* eslint-disable camelcase, sonarjs/sonar-no-magic-numbers -- `-1` is last item */
  embed.description = embed.description.split(':').toSpliced(-1, 1, count).join(': ');
  embed.footer = { text: lang('embedFooterText', this.member.displayName), icon_url: this.member.displayAvatarURL() };

  button.custom_id = this.customId.split('.').toSpliced(-1, 1, count).join('.');
  /* eslint-enable camelcase, sonarjs/sonar-no-magic-numbers */

  return this.update({ embeds: this.message.embeds, components: this.message.components });
};