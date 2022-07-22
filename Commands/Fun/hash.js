const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('crypto'),
  hashOptions = [];

for (let i = 0; i < getHashes().length; i = i + 25) {
  hashOptions.push({
    name: `method${i ? i / 25 + 1 : 1}`,
    description: 'with which method your text should get encrypted (needed only once)',
    type: 'String',
    required: false,
    choices: (_ => {
      const arr = [];
      for (let a = i; a < i + 25 && a < getHashes().length; a++) arr.push({ name: getHashes()[a], value: getHashes()[a] });
      return arr;
    })()
  })
}

module.exports = new Command({
  name: 'hash',
  aliases: { prefix: [], slash: [] },
  description: 'encrypt or decrypt your text with various methods',
  usage: 'SLASH Command: You only need to provide one method option.',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [{
    name: 'input',
    description: 'the text you want to encrypt or decrypt',
    type: 'String',
    required: true,
  }, ...hashOptions],

  run: (_, __, interaction) => {
    const
      input = interaction.options.getString('input'),
      method = interaction.options.data.filter(entry => entry.name.includes('method'))?.[0]?.value;

    if (!method) return interaction.editReply('You need to provide one of the method options!');

    const hash = createHash(method).update(input).digest('hex');

    let embed = new EmbedBuilder({
      title: 'Hash Function',
      description:
        `Your input: \`${input.length > 500 ? `${input.substring(0, 500)}\n...` : input}\`\n` +
        `Hash method: \`${method}\``,
      color: Colors.DarkGold
    });

    interaction.editReply({
      content:
        `Your hashed string:\n` +
        `\`${hash}\``,
      embeds: [embed]
    })
  }
})