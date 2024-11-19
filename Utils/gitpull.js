/** @type {import('.').shellExec} */
const
  shellExec = require('./shellExec.js'),
  origin = /'(?<branch>.*)'/.exec((await shellExec('git status').catch(() => { /** empty */ }))?.stdout.split('\n')[1] ?? '')?.groups.branch;

/** @type {import('.').gitpull}*/
module.exports = async function gitpull() {
  let data;

  try { data = await shellExec('git pull'); }
  catch (err) {
    log.error(`GIT PULL\nExec error: ${err}`);
    return err;
  }

  if (origin && !data.stderr.includes(`-> ${origin}`)) return 'OK';

  log(
    'GIT PULL\n'
    + (data.stdout ? `out: ${data.stdout.trim()}\n` : '')
    + (data.stderr ? `err: ${data.stderr.trim()}\n` : '')
  );

  return 'OK';
};