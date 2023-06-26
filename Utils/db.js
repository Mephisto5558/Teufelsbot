const
  Mongoose = require('mongoose').default.set('strictQuery', true),
  { Collection } = require('discord.js');

if (!log) log = { debug: console.debug, setType: () => console }; //log is a global var in the bot code

module.exports = class DB {
  /**@param {string}dbConnectionString MongoDB connection string*/
  constructor(dbConnectionString) {
    if (Mongoose.connection.readyState != 1) {
      if (!dbConnectionString) throw new Error('A Connection String is required!');
      Mongoose.connect(dbConnectionString);
    }

    this.fetchAll();
  }

  schema = Mongoose.model('db-collection', new Mongoose.Schema({
    key: String,
    value: Mongoose.SchemaTypes.Mixed
  }));

  /**@type {Collection<string,any>} The cache will be updated automatically*/
  cache = new Collection();

  /**@returns {Promise<DB>}DB*/
  async fetchAll() {
    for (const { key, value } of await this.schema.find().exec()) this.cache.set(key, value);
    return this;
  }

  /**@returns value of collection*/
  async fetch(db) {
    const { value } = await this.schema.findOne({ key: db }).exec() || {};
    this.cache.set(db, value);
    return value;
  }

  /**@param {boolean}overwrite overwrite existing collection, default: `false`*/
  async generate(overwrite = false) {
    log.setType('DB').debug(`generating db files, ${overwrite ? 'overwriting existing data' : ''}`).setType();
    for (const { key, value } of require('../Templates/db_collections.json')) await this.set(key, value, overwrite);
  }

  reduce = () => this.cache.reduce((acc, value, key) => acc.push({ key, value }) && acc, []);

  /**@param {string}db@param {string}key*/
  get(db, key) {
    let data = this.cache.get(db);
    if (key) for (const objKey of key.split('.')) {
      data = data?.[objKey];
      if (data === undefined) return data;
    }

    return data;
  }

  /**@param {string}key@param {boolean}overwrite overwrite existing collection, default: `false`@returns {value}value*/
  async set(db, value, overwrite = false) {
    if (!db) return;

    log.setType('DB').debug(`setting collection ${db}, ${overwrite ? 'overwriting existing data' : ''}`).setType();

    const update = { $set: { value } };
    if (!overwrite) update.$setOnInsert = { key: db };

    const data = await this.schema.findOneAndUpdate({ key: db }, update, { new: true, upsert: true }).exec();
    this.cache.set(db, data.value);
    return data.value;
  }

  /**@param {string}db@param {string}key@returns {value}value*/
  async update(db, key, value) {
    if (!key) return;

    log.setType('DB').debug(`updating ${db}.${key}`).setType();

    const data = await this.schema.findOneAndUpdate({ key: db }, { $set: { [`value.${key}`]: value } }, { new: true, upsert: true }).exec();
    this.cache.set(db, data.value);
    return data.value;
  }

  /**@param {string}db@param {string}key@param pushValue supports [1, 2, 3] as well as 1, 2, 3@returns {value}value*/
  async push(db, key, ...pushValue) {
    const values = pushValue.length == 1 && Array.isArray(pushValue[0]) ? pushValue[0] : pushValue;

    if (!db || !values.length) return;
    if (!Array.isArray(values)) throw Error('You can\'t push an empty or non-array value!');

    log.setType('DB').debug(`pushing data to ${db}.${key}`).setType();

    const data = await this.schema.findOneAndUpdate({ key: db }, { $push: { [`value.${key}`]: { $each: values } } }, { new: true, upsert: true }).exec();
    this.cache.set(key, data.value);
    return data.value;
  }

  /**@param {string}db@param {string}key if no key is provided, the whole db gets deleted@returns true if the element existed or the key param is provied and false if the element did not exist*/
  async delete(db, key) {
    if (!db) return false;
    if (key) {
      log.setType('DB').debug(`deleting ${db}.${key}`).setType();

      const data = await this.schema.findOneAndUpdate({ key: db }, { $unset: { [`value.${key}`]: '' } }, { new: true, upsert: true }).exec();
      this.cache.set(db, data.value);
      return true;
    }

    log.setType('DB').debug(`deleting ${db}`).setType();

    await this.schema.deleteOne({ key: db }).exec();
    return this.cache.delete(db);
  }
};