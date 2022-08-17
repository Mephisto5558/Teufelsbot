const { exec } = require('child_process');
const pull = _ => exec('git pull', { maxBuffer: 1024 * 600 }, (err, stdout, stderr) => {
  if (err) client.error(`GIT PULL\nexec error: ${err}`);
  console.log(
    'GIT PULL\n',
    `out: ${stdout || 'none'}`,
    `err: ${stderr || 'none'}\n`
  );
});

console.log('Git auto pull is running');
pull();

module.exports = {
  type: 'renderHtml',
  path: '/git/pull',

  run: _ => {
    pull();
    return 'OK';
  }
}
