module.exports = {
  id: 'joinMessage',
  name: 'Welcome Message',
  description: 'Set your own welcome message or embed!',
  /**@this WebServer*/
  type: function () { return this.formTypes.embedBuilder; },
  position: 2
};