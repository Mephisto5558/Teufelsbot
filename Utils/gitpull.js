const
  /** @type {import('.').shellExec} */ shellExec = require('./shellExec'),
  /** @type {Promise<string>} */ origin = shellExec('git status')
    .catch(() => { /** empty */ })
    .then(e => /'(?<branch>.*)'/.exec(e?.stdout.split('\n')[1])?.groups.branch);

/** @type {import('.').gitpull} */
module.exports = async function gitpull() {
  let data;

  try { data = await shellExec('git pull'); }
  catch (err) {
    /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
    log.error(`GIT PULL\nExec error: ${err.toString()}`);
    return err;
  }

  if (!data.stderr.includes(`-> ${await origin}`)) return { message: 'OK' };

  log(
    'GIT PULL\n'
    + (data.stdout ? `out: ${data.stdout.trim()}\n` : '')
    + (data.stderr ? `err: ${data.stderr.trim()}\n` : '')
  );

  return { message: 'OK' };
};