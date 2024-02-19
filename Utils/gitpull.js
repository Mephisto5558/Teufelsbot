const exec = require('node:util').promisify(require('node:child_process').exec);

/** @returns {Promise<Error|'OK'>}*/
module.exports = async () => {
  let data;

  try { data = await exec('git pull', { maxBuffer: 614_400 }); }
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