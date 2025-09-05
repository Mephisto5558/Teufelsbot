/** @type {import('.').getTargetChannel} */
module.exports = function getTargetChannel(interaction, { targetOptionName = 'channel', returnSelf } = {}) {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- will be fixed when commands are moved to their own lib */
  let target = interaction.options.getChannel(targetOptionName, false) ?? interaction.mentions?.channels.first();

  if (!target && interaction.content)
    target = interaction.guild.channels.cache.find(e => [e.id, e.name].some(e => [...interaction.args ?? [], interaction.content].includes(e)));
  if (target) return target;
  if (returnSelf) return interaction.channel;
};