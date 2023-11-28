/**@type {command}*/
module.exports = {
  name: 'setchangelog',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  /**@this Message*/
  run: async function (lang) {
    await this.client.db.update('botSettings', 'changelog', this.content?.replaceAll('/n', '\n'));
    return this.reply(lang('success'));
  }
};