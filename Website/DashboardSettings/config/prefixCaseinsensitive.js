module.exports = {
  id: 'prefixCaseinsensitive',
  name: 'Case insensitive',
  description: 'Make the prefix work for uppercase and lowercase letters',
  /**@this WebServer*/
  type: function () { return this.formTypes.switch(); },
  position: 3
};