const
  { codeBlock } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { constants: { JSON_SPACES } } = require('#Utils');

module.exports = new Command({
  types: ['slash'],
  usage: { examples: 'database a.b.c\n{prefix}{cmdName} database a.<thisguild>.b.<thischannel>.<thisuser>' },
  dmPermission: true,
  options: [
    {
      name: 'database',
      type: 'String',
      required: true
    },
    { name: 'key', type: 'String' }
  ],
  beta: true,

  async run(lang) {
    const
      path = this.args[1]
        ?.replaceAll(/<thisguild>/gi, this.guild.id)
        .replaceAll(/<thischannel>/gi, this.channel.id)
        .replaceAll(/<this(?:member|user)>/gi, this.user.id),
      result = this.client.db.get(this.args[0], path);

    return this.customReply(result ? codeBlock('json', JSON.stringify(result, undefined, JSON_SPACES)) : lang('notFound'));
  }
});