const
  Mongoose = require('mongoose').default,
  { Collection } = require('discord.js');

module.exports = class DB {
  constructor(dbConnectionString) {
    if (Mongoose.connection.readyState !== 1) {
      if (!dbConnectionString) throw new Error('A Connection String is required!');
      Mongoose.connect(dbConnectionString);
    }

    this.ready();
  }

  async ready() {
    await this.schema.find({}).then(data => data.forEach(({ key, value }) => this.collection.set(key, value)));
    return this;
  }

  schema = Mongoose.model('db-collection', new Mongoose.Schema({
    key: String,
    value: Mongoose.SchemaTypes.Mixed
  }));

  collection = new Collection();

  get = key => this.collection.get(key);

  set(key, value) {
    if (!key || !value) return;

    this.schema.findOne({ key }, async (err, data) => {
      if (err) throw err;
      if (data) data.value = value;
      else data = new this.schema({ key, value });

      data.save();
      this.collection.set(key, value);
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

  push(key, ...pushValue) {
    const data = this.collection.get(key);
    const values = pushValue.flat();

    if (!Array.isArray(data)) throw Error(`You cant push data to a ${typeof data} value!`);
    data.push(pushValue);

    this.schema.findOne({ key }, (_, res) => {
      res.value = [...res.value, ...values];
      res.save();
    });
  }
}