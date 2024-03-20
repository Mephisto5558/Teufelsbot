const { gitpull } = require('../../../../../Utils');

/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: async res => res.sendStatus(await gitpull() == 'OK' ? 200 : 500)
};