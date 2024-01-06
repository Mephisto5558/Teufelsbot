module.exports = {
  id: 'dmEnable',
  name: 'Enable dm messages',
  description: 'DM the member on his/her birthday with a custom message',
  /**@this WebServer*/
  type: function () { return this.formTypes.switch(); },
  position: 4
};