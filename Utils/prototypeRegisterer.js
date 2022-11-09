const
  { Status, Message, CommandInteraction, AutocompleteInteraction, BaseClient } = require('discord.js'),
  { randomInt } = require('crypto'),
  { readdirSync } = require('fs'),
  customReply = require('./customReply.js');

global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).filter(e => e.isDirectory()).map(directory => directory.name);
global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

Array.prototype.random = function random() { return this[randomInt(this.length)]; };
Number.prototype.limit = function limit({ min = -Infinity, max = Infinity } = {}) { return Math.min(Math.max(Number(this), min), max); };
Object.prototype.fMerge = function fMerge(obj, mode, { ...output } = { ...this }) {
  if (`${{}}` != this || `${{}}` != obj) return output;
  for (const key of Object.keys({ ...this, ...obj })) {
    if (`${{}}` == this[key]) output[key] = key in obj ? this[key].fMerge(obj[key], mode) : this[key];
    else if (Array.isArray(this[key])) {
      if (key in obj) {
        if (mode == 'overwrite') output[key] = obj[key];
        else if (mode == 'push') for (const e of obj[key]) output[key].push(e);
        else for (let i = 0; i < this[key].length || i < obj[key].length; i++) output[key][i] = i in obj[key] ? obj[key][i] : this[key][i];
      }
      else output[key] = this[key];
    }
    else output = { ...output, [key]: key in obj ? obj[key] : this[key] };
  }
  return output;
};
Object.prototype.filterEmpty = function filterEmpty() { return Object.fromEntries(Object.entries(this).flatMap(([k, v]) => ((val = Object(v) !== v ? v : v.filterEmpty()) => !(val == null || (Object(val) === val && Object.keys(val).length == 0)) ? [[k, val]] : [])())); };
Function.prototype.bBind = function bBind(thisArg, ...args) {
  const bound = this.bind(thisArg, ...args);
  bound.__targetFunction__ = this;
  bound.__boundThis__ = thisArg;
  bound.__boundArgs__ = args;
  return bound;
};
CommandInteraction.prototype.customReply = customReply;
Message.prototype.customReply = customReply;
BaseClient.prototype.awaitReady = async function awaitReady() {
  while (this.ws.status != Status.Ready) await sleep(10);
  return this.application.name ? this.application : this.application.fetch();
};
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', { get() { return this.options.getFocused(true); } });