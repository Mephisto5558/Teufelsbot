const
  Mongoose = require('mongoose').default.set('strictQuery', true),
  { Collection } = require('discord.js');

module.exports = class DB {
  /**@param {string}dbConnectionString MongoDB connection string*/
  constructor(dbConnectionString) {
    if (Mongoose.connection.readyState !== 1) {
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

  get = key => this.collection.get(key);

  set(key, value) {
    if (!key) return;

    this.schema.findOne({ key }, (err, data) => {
      if (err) throw err;
      if (data) data.value = value;
      else data = new this.schema({ key, value });

      data.save();
      this.collection.set(key, value);
    });
  }

  /**@param {string}db@param {string}key*/
  update(db, key, value) {
    if (!key) return;
    if (typeof key != 'string') throw new Error(`key must be typeof string! Got ${typeof key}.`);

    this.schema.findOne({ key: db }, (err, data) => {
      if (err) throw err;
      if (!data) data = new this.schema({ key: db, value: {} });
      else if (!data.value) data.value = {};
      else if (typeof data.value != 'object') throw new Error(`data.value in db must be typeof object! Found ${typeof data.value}.`);

      DB.mergeWithFlat(data.value, key, value);

      data.markModified(`value.${key}`);
      data.save();
      this.collection.set(db, data.value);
    });
  }

  push(key, ...pushValue) {
    const data = this.collection.get(key);
    const values = pushValue.flat();

    if (!Array.isArray(data)) throw Error(`You can't push data to a ${typeof data} value!`);
    data.push(pushValue);

    this.schema.findOne({ key }, (_, res) => {
      res.value = [...res.value, ...values];
      res.save();
    });
  }

  delete(key) {
    if (!key) return;
    this.schema.findOne({ key }, async (err, data) => {
      if (err) throw err;
      if (data) await data.delete();
    });

    this.collection.delete(key);
  }

  /**@param {{}}obj gets mutated! @param {string}key@example DB.mergeWithFlat({a: {b:1}}, 'a.c', 2) @returns reduce return value */
  static mergeWithFlat(obj, key, val) {
    const keys = key.split('.');
    return keys.reduce((acc, e, i) => acc[e] = keys.length - 1 == i ? val : acc[e] ?? {}, obj);
  }
};