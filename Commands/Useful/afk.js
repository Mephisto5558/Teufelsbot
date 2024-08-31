const { getAfkStatus, listAfkStatuses, setAfkStatus } = require('#Utils').afk;

module.exports = new MixedCommand({
  cooldowns: { user: 5000 },
  dmPermission: true,
  options: [
    new CommandOption({
      name: 'set',
      type: 'Subcommand',
      options: [
        new CommandOption({
          name: 'message',
          type: 'String',
          maxLength: 1000
        }),
        new CommandOption({ name: 'global', type: 'Boolean' })
      ]
    }),
    new CommandOption({
      name: 'get',
      type: 'Subcommand',
      options: [new CommandOption({ name: 'target', type: 'User' })]
    })
  ],

  run: function (lang) {
    if (this.options?.getSubcommand() == 'get') {
      const target = this.inGuild() ? this.options.getMember('target') : this.options.getUser('target') ?? this.user;
      if (target) return getAfkStatus.call(this, target, lang);

      return listAfkStatuses.call(this, lang);
    }

    const global = this.options?.getBoolean('global') ?? this.args?.[0] == 'global';
    return setAfkStatus.call(this, lang, global, this.options?.getString('message') ?? this.content?.slice(global ? 7 : 0, 1000));
  }
});