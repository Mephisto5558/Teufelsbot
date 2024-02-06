const { gitpull } = require('../../../../../Utils');

/** @type {import('@mephisto5558/bot-website').customPage}*/
module.exports = {
  run: async res => {
    const pulled = await gitpull();
    return res?.sendStatus?.(pulled == 'OK' ? 200 : 500);
  }
};