module.exports = {
  id: 'leaveMessage',
  name: 'Leave Message',
  description: 'Set your own leave message or embed!',
  /**@this WebServer*/
  type: function () { return this.formTypes.embedBuilder; },
  position: 4
};