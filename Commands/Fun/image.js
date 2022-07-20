const
  { Command } = require('reconlx'),
  { get } = require('axios').default,
  { EmbedBuilder } = require('discord.js'),
  embed = new EmbedBuilder({ title: 'Image', color: 'RANDOM', description: ' ' }),
  endpoints = new Map([
    ['abandon', { text: 'Text to show on the generated image' }],
    ['aborted', { avatars: 'Image URL' }],
    ['affect', { avatars: 'Image URL' }],
    ['airpods', { avatars: 'Image URL' }],
    ['america', { avatars: 'Image URL' }],
    ['armor', { text: 'Text to show on the generated image' }],
    ['balloon', { text: 'Text to show on the generated image' }],
    ['bed', { avatars: 'Image URL', avatar2: 'Image URL' }],
    ['bongocat', { avatars: 'Image URL' }],
    ['boo', { text: 'Text to show on the generated image' }],
    ['brain', { text: 'Text to show on the generated image' }],
    ['brazzers', { avatars: 'Image URL' }],
    ['byemom', { avatars: 'Image URL', usernames: 'Username for the first user', text: 'Text to show on the generated image' }],
    ['cancer', { avatars: 'Image URL' }],
    ['changemymind', { text: 'Text to show on the generated image' }],
    ['cheating', { text: 'Text to show on the generated image' }],
    ['citation', { text: 'Text to show on the generated image' }],
    ['communism', { avatars: 'Image URL' }],
    ['confusedcat', { text: 'Text to show on the generated image' }],
    ['corporate', { avatars: 'Image URL' }],
    ['crab', { text: 'Text to show on the generated image', info: ['returns mp4', '1 request per 30 seconds'] }],
    ['cry', { text: 'Text to show on the generated image' }],
    ['dab', { avatars: 'Image URL' }],
    ['dank', { avatars: 'Image URL' }],
    ['deepfry', { avatars: 'Image URL' }],
    ['delete', { avatars: 'Image URL' }],
    ['disability', { avatars: 'Image URL' }],
    ['doglemon', { text: 'Text to show on the generated image' }],
    ['door', { avatars: 'Image URL' }],
    ['egg', { avatars: 'Image URL' }],
    ['excuseme', { text: 'Text to show on the generated image' }],
    ['expanddong', { text: 'Text to show on the generated image' }],
    ['expandingwwe', { text: 'Text to show on the generated image' }],
    ['facts', { text: 'Text to show on the generated image' }],
    ['failure', { avatars: 'Image URL' }],
    ['fakenews', { avatars: 'Image URL' }],
    ['farmer', { text: 'Text to show on the generated image' }],
    ['fedora', { avatars: 'Image URL' }],
    ['floor', { avatars: 'Image URL', text: 'Text to show on the generated image' }],
    ['fuck', { text: 'Text to show on the generated image' }],
    ['garfield', { text: 'Text to show on the generated image', avatars: 'Image URL' }],
    ['gay', { avatars: 'Image URL' }],
    ['godwhy', { text: 'Text to show on the generated image' }],
    ['goggles', { avatars: 'Image URL' }],
    ['hitler', { avatars: 'Image URL' }],
    ['humansgood', { text: 'Text to show on the generated image' }],
    ['inator', { text: 'Text to show on the generated image' }],
    ['invert', { avatars: 'Image URL' }],
    ['ipad', { avatars: 'Image URL' }],
    ['jail', { avatars: 'Image URL' }],
    ['justpretending', { text: 'Text to show on the generated image' }],
    ['keepurdistance', { text: 'Text to show on the generated image' }],
    ['kimborder', { avatars: 'Image URL' }],
    ['knowyourlocation', { text: 'Text to show on the generated image' }],
    ['kowalski', { text: 'Text to show on the generated image', info: ['returns mp4', '1 request per 30 seconds'] }],
    ['laid', { avatars: 'Image URL' }],
    ['letmein', { text: 'Text to show on the generated image', info: ['returns mp4', '1 request per 30 seconds'] }],
    ['lick', { text: 'Text to show on the generated image' }],
    ['madethis', { avatars: 'Image URL', avatar2: 'Image URL' }],
    ['magik', { avatars: 'Image URL' }],
    ['master', { text: 'Text to show on the generated image' }],
    ['meme', { avatars: 'Image URL', top_text: null, bottom_text: null, color: 'HEX codes', font: 'Supports arial, arimobold, impact, robotomedium, robotoregular, sans, segoeuireg, tahoma, verdana', info: ['default is Impact in white'] }],
    ['note', { text: 'Text to show on the generated image' }],
    ['nothing', { text: 'Text to show on the generated image' }],
    ['obama', { text: 'Text to show on the generated image' }],
    ['ohno', { text: 'Text to show on the generated image' }],
    ['piccolo', { text: 'Text to show on the generated image' }],
    ['plan', { text: 'Text to show on the generated image' }],
    ['presentation', { text: 'Text to show on the generated image' }],
    ['quote', { avatars: 'Image URL', usernames: 'Username for the first user', text: 'Text to show on the generated image' }],
    ['radialblur', { avatars: 'Image URL' }],
    ['rip', { avatars: 'Image URL' }],
    ['roblox', { avatars: 'Image URL' }],
    ['salty', { avatars: 'Image URL' }],
    ['satan', { avatars: 'Image URL' }],
    ['savehumanity', { text: 'Text to show on the generated image' }],
    ['screams', { avatars: 'Image URL', avatar2: 'Image URL' }],
    ['shit', { text: 'Text to show on the generated image' }],
    ['sickban', { avatars: 'Image URL' }],
    ['slap', { avatars: 'Image URL', avatar2: 'Image URL' }],
    ['slapsroof', { text: 'Text to show on the generated image' }],
    ['sneakyfox', { text: 'Text to show on the generated image' }],
    ['spank', { avatars: 'Image URL', avatar2: 'Image URL' }],
    ['stroke', { text: 'Text to show on the generated image' }],
    ['surprised', { text: 'Text to show on the generated image' }],
    ['sword', { text: 'Text to show on the generated image', usernames: 'Username for the first user' }],
    ['theoffice', { text: 'Text to show on the generated image' }],
    ['thesearch', { text: 'Text to show on the generated image' }],
    ['trash', { avatars: 'Image URL' }],
    ['trigger', { avatars: 'Image URL' }],
    ['tweet', { avatars: 'Image URL', usernames: 'Username for the first user', text: 'Text to show on the generated image', username2: 'Username for the second user', altstyle: 'Endpoint specific parameter' }],
    ['ugly', { avatars: 'Image URL' }],
    ['unpopular', { avatars: 'Image URL', text: 'Text to show on the generated image' }],
    ['violence', { text: 'Text to show on the generated image' }],
    ['violentsparks', { text: 'Text to show on the generated image' }],
    ['vr', { text: 'Text to show on the generated image' }],
    ['walking', { text: 'Text to show on the generated image' }],
    ['wanted', { avatars: 'Image URL' }],
    ['warp', { avatars: 'Image URL' }],
    ['whodidthis', { avatars: 'Image URL' }],
    ['whothisis', { avatars: 'Image URL', text: 'Text to show on the generated image' }],
    ['youtube', { avatars: 'Image URL', usernames: 'Username for the first user', text: 'Text to show on the generated image' }],
  ]),
  options = Array.from(endpoints).map(([a, b]) => ({
    name: a,
    description: ' ',
    type: 'Subcommand',
    options: Object.entries(b).filter(([a]) => a != 'info').map(([a, b]) => ({ name: a, description: b, type: 'String' }))
  }));

module.exports = new Command({
  name: 'image',
  aliases: { prefix: [], slash: [] },
  description: 'Image manipulation',
  usage: 'PREFIX COMMAND: image <subcommand | "help"> <args>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 500 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  beta: true,
  options: options,

  run: async (client, message) => {
    const cmdName = message.args.shift();
    const args = message.args.map(e => e.replace(/[<@>]/g, ''));
    const cmd = endpoints.get(cmdName?.toLowerCase());
    const option = options.find(e => e.name == cmdName);
    const headers = {};
    let errorMsg;

    if (!cmd) errorMsg = `This is not a valid option. Valid options are:\n\`${options.map(e => e.name).join('`, `')}\``;
    else if (!args || args.length < option.options.length) errorMsg = `This command requires the following args (in order):\n\n${option.options.map(e => `> \`${e.name}\`: ${e.description}`).join('/n')}`;

    if (errorMsg) return client.functions.reply(errorMsg, message);

    try {
      args.map((e, i) => { if (option.options[i]) headers[option.options[i].name] = e });

      const data = await get(`https://imgen.herokuapp.com/${cmdName}`, { headers: headers });
      embed.setImage('data:image/png;base64,' + Buffer.from(data.data).toString('base64'));
      embed.footer = { text: message.author.tag };

      message.channel.send({ embeds: [embed]}, message);
    }
    catch (err) { throw err }
  }
})