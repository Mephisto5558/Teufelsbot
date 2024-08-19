/** @type {import('.').shellExec} */
const shellExec = require('./shellExec.js');

/** @type {import('.').gitpull}*/
module.exports = async function gitpull() {
  let data;

  try { data = await shellExec('git pull', { maxBuffer: 614_400 }); }
  catch (err) {
    log.error(`GIT PULL\nExec error: ${err}`);
    return err;
  }

  log(
    'GIT PULL\n'
    + (data.stdout ? `out: ${data.stdout.trim()}\n` : '')
    + (data.stderr ? `err: ${data.stderr.trim()}\n` : '')
  );

  return 'OK';
};