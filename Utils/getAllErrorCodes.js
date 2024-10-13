const
  fetch = require('node-fetch').default,
  { writeFile } = require('node:fs/promises');

/** Writes all error codes to a file*/
module.exports = async function fetchAndProcess() {
  const res = await fetch('https://gist.githubusercontent.com/Dziurwa14/de2498e5ee28d2089f095aa037957cbb/raw/codes.md').then(e => e.text());
  const codes = res.split('\n').reduce((acc, line) => {
    const [code, description] = line.slice(2, -2).replaceAll(/[',`’]|[(.:].*/g, '').split(' | ');

    if (Number(code) && description) {
      const name = description.trim().split(/[\s\-_]+/)
        .reduce((nameAcc, word) => nameAcc + word[0].toUpperCase() + (/^[ A-Z_]+$/.test(description) ? word.slice(1).toLowerCase() : word.slice(1)), '');
      acc[name] = Number(code);
    }

    return acc;
  }, {});

  return writeFile('./Utils/DiscordAPIErrorCodes.json', JSON.stringify(codes, undefined, 2));
};