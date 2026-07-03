/** @import { serverbackup_hasPerm, serverbackup_createProxy } from '.' */

/** @type {serverbackup_hasPerm} */
module.exports.hasPerm = function hasPerm(backup) {
  const creator = backup?.metadata[this.guild.db.serverbackup?.allowedToLoad ?? this.client.defaultSettings.serverbackup.allowedToLoad];
  return Array.isArray(creator) ? creator.includes(this.user.id) : creator == this.user.id;
};

/** @type {serverbackup_createProxy} */
module.exports.createProxy = function createProxy(interaction, embed, lang, langKeys) {
  return new Proxy({ status: undefined }, {
    set(obj, prop, value) {
      obj[prop] = value;
      void interaction.editReply({ embeds: [embed.setDescription(lang(value, langKeys))] });
      return true;
    }
  });
};