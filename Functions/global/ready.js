const { Status } = require('discord.js');

module.exports = async function ready() {
  while (this.ws.status != Status.Ready) await this.functions.sleep(10);
  return this.application.name ? this.application : this.application.fetch();
};