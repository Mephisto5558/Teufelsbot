/**@this import('discord.js').ThreadChannel*/
module.exports = function threadCreate() {
  if (this.joinable) this.join();
};