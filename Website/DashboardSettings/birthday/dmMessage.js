module.exports = {
  id: 'dmMsg',
  name: 'DM Message',
  description: 'The message the member will get, if enabled',
  /**@this WebServer*/
  type: function () { return this.formTypes.embedBuilder; },
  position: 5
};