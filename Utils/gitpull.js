const exec = require('util').promisify(require('child_process').exec);

module.exports = async () => {
  let data;

  try { data = await exec('git pull', { maxBuffer: 614400 }); }
  catch (err) { return log.error(`GIT PULL\nExec error: ${err}`); }

  log(
    'GIT PULL\n' +
    (data.stdout ? `out: ${data.stdout.trim()}\n` : '') +
    (data.stderr ? `err: ${data.stderr.trim()}\n` : '')
  );

  return 'OK';
};