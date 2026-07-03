/* eslint-disable @typescript-eslint/no-magic-numbers -- yes magic numbers */

/** @import { seededHash } from '.' */

/**
 * https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 * @type {seededHash} */
module.exports = function cyrb53(str, seed = 0) {
  let
    h1 = 0xDE_AD_BE_EF ^ seed,
    h2 = 0x41_C6_CE_57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.codePointAt(i);
    h1 = Math.imul(h1 ^ ch, 2_654_435_761);
    h2 = Math.imul(h2 ^ ch, 1_597_334_677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2_246_822_507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3_266_489_909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2_246_822_507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3_266_489_909);

  return 4_294_967_296 * (2_097_151 & h2) + (h1 >>> 0);
};