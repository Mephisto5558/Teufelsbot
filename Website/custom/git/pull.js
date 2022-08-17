const exec = require('util').promisify(require('child_process').exec);

console.log('Git auto pull is running');

module.exports = {
  type: 'renderHtml',
  path: '/git/pull',

  run: async _ => {
    let data;
    
    try { data = await exec('git pull', { maxBuffer: 1024 * 600 }) }
    catch (err) { return console.error(`GIT PULL\nExec error: ${err}`) }

    console.log(
      'GIT PULL\n',
      `out: ${data.stdout?.trim() || 'none'}\n`,
      `err: ${data.stderr?.trim() || 'none'}\n`
    );

    return 'OK';
  }
}
