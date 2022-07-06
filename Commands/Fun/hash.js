const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json'),
  { getHashes, createHash } = require('crypto'),
  hashOptions = getHashes()
    .map(entry => { return { name: entry, value: entry } })

let command = new Command({
  name: 'hash',
  aliases: { prefix: [], slash: [] },
  description: 'encrypt or decrypt your text with various methods',
  usage: 'SLASH Command: You only need to provide one method option.',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [{
    name: 'input',
    description: 'the text you want to encrypt or decrypt',
    type: 'STRING',
    required: true,
  }],

  run: (_, __, interaction) => {
    const
      input = interaction.options.getString('input'),
      method = interaction.options.data.filter(entry => entry.name.includes('method'))?.[0]?.value;

    if (!method) return interaction.editReply('You need to provide one of the method options!');

    const hash = createHash(method).update(input).digest('hex');

    let embed = new MessageEmbed({
      title: 'Hash Function',
      description:
        `Your input: \`${input.length > 500 ? `${input.substring(0, 500)}\n...` : input}\`\n` +
        `Hash method: \`${method}\``,
      color: colors.DARK_GOLD
    });

    interaction.editReply({
      content:
        `Your hashed string:\n` +
        `\`${hash}\``,
      embeds: [embed]
    })
  }
});

for (let i = 0; i < hashOptions.length; i += 25) {
  command.options.push({
    name: `method${i ? i / 25 + 1 : 1}`,
    description: 'with which method your text should get encrypted (needed only once)',
    type: 'STRING',
    required: false,
    choices: hashOptions.slice(i, i + 25)
  })
}

module.exports = command;