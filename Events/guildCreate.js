module.exports = function guildCreate() {
  if (this.client.botType == 'dev') return;

  const newData = this.client.db.get('guildSettings').fMerge({ [this.id]: { position: (Object.values(this.client.db.get('guildSettings')).sort((a, b) => b?.position - a?.position)[0].position || 0) + 1 } });
  this.db.set('guildSettings', newData);
};