const
  fetch = require('node-fetch').default,
  { EmbedBuilder, Collection } = require('discord.js'),
  embed = new EmbedBuilder({ title: 'Image' }).setColor('Random'),
  endpoints = new Collection([
    ['threats', { url: 'Image URL to add to template.' }],
    ['baguette', { url: 'Any image URL to generate, can be user avatar or anything.' }],
    ['clyde', { string: 'Text to clydify.' }],
    ['ship', { user1: 'User 1\'s avatar', user2: 'User 2\'s avatar' }],
    ['captcha', { url: 'Any image URL to generate, can be user avatar or anything.', string: 'Username or or any other string to show up.' }],
    ['whowouldwin', { user1: 'User 1\'s avatar', user2: 'User 2\'s avatar' }],
    ['changemymind', { text: 'Change my mind text.' }],
    ['ddlc', { character: 'Can be either monika, yuri, natsuki, sayori or m, y, n , s', background: 'Background of the image, types: `bedroom`, `class`, `closet`, `club`, `corridor`, `house`, `kitchen`, `residential`, `sayori_bedroom`', body: 'Body of the character, there is only 1 or 2 for monika and 1, 1b, 2, 2b for the rest', face: 'Face of the character to go with the body, is best to just see all the types at https://github.com/hibikidesu/NekoBot/blob/master/modules/fun.py#L14 (line 14 to 34)', text: 'Text for the character to say, max length of 140' }],
    ['lolice', { url: 'Lolice chief' }],
    ['kannagen', { text: 'Text to kannafy' }],
    ['iphonex', { url: 'Image to fill into an iphone.' }],
    ['kms', { url: 'Image URL' }],
    ['trap', { name: 'User to trap', author: 'Author trapping user', image: 'Avatar’s URL to trap.' }],
    ['trumptweet', { text: 'Text to TrumpTweet' }],
    ['tweet', { text: 'Text ot tweet', username: 'Twitter username without the @' }],
    ['kidnap', { image: 'The image of the user, profile picture preferred.' }],
    ['deepfry', { image: 'Image URL to deepfry' }],
    ['blurpify', { image: 'Image URL to blurpify' }],
    ['phcomment', { image: 'Users image', text: 'text to comment', username: 'user\'s username' }],
    ['magik', { image: 'Image to magikify', intensity: 'number from 1 to 10' }]
  ]),
  options = Array.from(endpoints).map(([name, b]) => ({
    name, options: Object.entries(b).filter(([a]) => a != 'info').map(([name, description]) => ({ name, description, type: 'String' }))
  }));

/**@type {command}*/
module.exports = {
  name: 'image',
  cooldowns: { user: 500 },
  slashCommand: false,
  prefixCommand: true,
  options: [{
    name: 'type',
    type: 'String',
    autocompleteOptions: endpoints.keys(),
    strictAutocomplete: true
  }],
  beta: true,

  /**@this GuildMessage*/
  run: async function (lang) {
    const
      cmdName = this.args?.shift() || this.options?.getString('type'),
      args = this.args?.map(e => e.replace(/[<@>]/g, '')),
      option = options.find(e => e.name == cmdName);

    let data;

    embed.data.footer = { text: this.user.tag };

    if (!endpoints.get(cmdName?.toLowerCase())) return this.customReply((cmdName ? lang('notFound') : '') + lang('validOptions', options.map(e => e.name).join('`, `')));
    else if ((args?.length || 0) < option.options.length) return this.customReply(lang('requiresArgs', option.options.map(e => `> \`${e.name}\`: ${e.description}`).join('\n')));

    const
      msg = await this.customReply(lang('global.loading')),
      url = args.reduce((acc, e, i) => option.options[i] ? `${acc}${option.options[i].name}=${e}&` : acc, `https://nekobot.xyz/api/imagegen?type=${cmdName}&`);

    try { data = await fetch(encodeURI(url)).then(res => res.json()); }
    catch (err) { data = err; }

    if (!data.success) return msg.edit(lang('error', data.message));
    return msg.edit({ content: '', embeds: [embed.setImage(data.message)] });
  }
};