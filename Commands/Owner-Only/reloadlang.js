module.exports = new PrefixCommand({
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    log.debug(`Reloading language files, initiated by user ${this.user.tag}`);

    await this.client.i18n.loadAllLocales();
    return this.customReply(lang('success'));
  }
});