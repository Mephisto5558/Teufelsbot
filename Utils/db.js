const
  Mongoose = require('mongoose').default.set('strictQuery', true),
  { Collection } = require('discord.js');

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

  /**Cache*/
  collection = new Collection();

  /**@returns {Promise<DB>}DB*/
  async fetchAll() {
    for (const { key, value } of await this.schema.find()) this.collection.set(key, value);
    return this;
  }

  /**@returns value of collection*/
  async fetch(key) {
    const { value } = await this.schema.findOne({ key }) || {};
    this.collection.set(key, value);
    return value;
  }

  /**@param {boolean}overwrite overwrite existing collections*/
  async generate(overwrite) {
    for (const { key, value } of require('../Templates/db_collections.json'))
      await this.set(key, value, overwrite);
  }

  reduce = () => this.collection.reduce((acc, value, key) => acc.push({ key, value }) && acc, []);

  get = key => this.collection.get(key);

  /**@param {boolean}overwrite overwrite existing collection*/
  async set(key, value, overwrite) {
    if (!key) return;
    let data;

    if (!overwrite) data = await this.schema.findOne({ key });
    if (data) data.value = value;
    else data = new this.schema({ key, value });

    await data.save();
    return this.collection.set(key, value);
  }

  /**@param {string}db@param {string}key*/
  async update(db, key, value) {
    if (!key) return;
    if (typeof key != 'string') throw new Error(`key must be typeof string! Got ${typeof key}.`);

    let data = await this.schema.findOne({ key: db });

    if (!data) data = new this.schema({ key: db, value: {} });
    else if (!data.value) data.value = {};
    else if (typeof data.value != 'object') throw new Error(`data.value in db ${db} must be typeof object! Found ${typeof data.value}.`);

    DB.mergeWithFlat(data.value, key, value);

    data.markModified(`value.${key}`);
    data.save();
    this.collection.set(db, data.value);
  }

  async push(key, ...pushValue) {
    const values = pushValue.flat();
    let dbData = this.collection.get(key);

    if (!dbData) dbData = new this.schema({ key, value: pushValue });
    else if (!data.value) data.value = pushValue;
    else if (!Array.isArray(dbData)) throw Error(`You can't push data to a ${typeof dbData} value!`);
    dbData.push(...pushValue);

    const data = await this.schema.findOne({ key });
    data.value = [...data.value, ...values];
    data.save();
  }

  async delete(key) {
    if (!key) return;

    const data = await this.schema.findOne({ key });
    if (data) await data.delete();

    return this.collection.delete(key);
  }

  /**@param {object}obj gets mutated! @param {string}key@returns reduce return value @example DB.mergeWithFlat({a: {b:1}}, 'a.c', 2)*/
  static mergeWithFlat(obj, key, val) {
    const keys = key.split('.');
    return keys.reduce((acc, e, i) => acc[e] = keys.length - 1 == i ? val : acc[e] ?? {}, obj);
  }
};