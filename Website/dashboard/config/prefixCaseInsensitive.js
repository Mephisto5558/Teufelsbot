const { formTypes } = require('discord-dashboard');

module.exports = {
  id: 'prefixCaseInsensitive',
  name: 'Case insensitive',
  description: "Make the prefix work for uppercase and lowercase letters",
  position: 3,

  type: formTypes.switch()
}