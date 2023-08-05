module.exports = {
  name: 'motherweight',
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'target', type: 'User' }],

  run: function (lang) {
    const
      target = this.options?.getMember('target') || this.mentions?.members.first() || this.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.tag, e.nickname].some(e => [...(this.args || []), this.content].includes(e))),
      weight = Math.round(Math.random() * 1000);

    return this.customReply(lang(`responses${target ? 'Other' : 'Self'}.${(weight / 100).toFixed()}`, { user: target?.displayName }) + lang('weight', weight));
  }
};