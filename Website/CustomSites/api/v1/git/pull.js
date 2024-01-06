const { gitpull } = require('../../../../../Utils');

console.log('Git auto pull is running');

module.exports = {
  /**@param {Res?}res*/
  run: async res => {
    const pulled = await gitpull();
    return res?.sendStatus?.(pulled == 'OK' ? 200 : 500);
  }
};