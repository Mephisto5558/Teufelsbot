/** @type {import('.').clickCounter}*/
module.exports = async function clickCounter(_, count) {
  const
    embed = this.message.embeds[0].data,
    button = this.message.components[0].components[0].data;

  count = Number(count) + 1;

  /* eslint-disable sonarjs/sonar-no-magic-numbers -- `-1` is last item */
  embed.description = embed.description.split(':').toSpliced(-1, 1, count).join(': ');
  /* eslint-disable-next-line camelcase -- not my decision*/
  button.custom_id = this.customId.split('.').toSpliced(-1, 1, count).join('.');
  /* eslint-enable sonarjs/sonar-no-magic-numbers */

  return this.update({ embeds: this.message.embeds, components: this.message.components });
};