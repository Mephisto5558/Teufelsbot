import { writeFile } from 'node:fs/promises';
import fetch from 'node-fetch';
import { JSON_SPACES } from './constants.ts';

/** Writes all error codes to a file. */
export default async function getAllErrorCodes(): Promise<void> {
  const
    res = await fetch('https://gist.githubusercontent.com/Dziurwa14/de2498e5ee28d2089f095aa037957cbb/raw/codes.md').then(async e => e.text()),
    codes = res.split('\n').reduce((acc, line) => {
      const [code, description] = line.replaceAll(/^\|\s|\|$|[',`’]|[(.:].*/g, '').split(' | ');

      if (Number(code) && description) {
        const name = description.trim().replaceAll('/', 'Or').split(/[\s\-_]+/)
          .reduce((nameAcc, word) => nameAcc + word.at(0).toUpperCase() + (
            /^[ A-Z_]+$/.test(description) ? word.slice(1).toLowerCase() : word.slice(1)
          ), '');
        acc[name] = Number(code);
      }

      return acc;
    }, {});

  return writeFile('./Utils/DiscordAPIErrorCodes.json', JSON.stringify(codes, undefined, JSON_SPACES));
}