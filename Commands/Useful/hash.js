const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('crypto'),
  hashOptions = [];

for (let i = 0; i < getHashes().length; i = i + 25) {
  hashOptions.push({
    name: `method${i ? i / 25 + 1 : 1}`,
    description: 'with which method your text should get encrypted (needed only once)',
    type: 'String',
    choices: (_ => {
      const arr = [];
      for (let a = i; a < i + 25 && a < getHashes().length; a++) arr.push({ name: getHashes()[a], value: getHashes()[a] });
      return arr;
    })()
  })
}

module.exports = {
  name: 'hash',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [{
    name: 'input',
    type: 'String',
    required: true,
  }, ...hashOptions],

  run: (interaction, lang) => {
    const
      input = interaction.options.getString('input'),
      method = interaction.options.data.filter(entry => entry.name.includes('method'))?.[0]?.value;

    if (!method) return interaction.editReply(lang('noMethod'));

    const hash = createHash(method).update(input).digest('hex');

    let embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { input: input.length > 500 ? `${input.substring(0, 500)}\n...` : input, method }),
      color: Colors.DarkGold
    });

    interaction.editReply({
      content: lang('text', hash),
      embeds: [embed]
    })
  }
}