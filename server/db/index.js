require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_DB_NAME = `${process.env.DB_NAME}`;
const MONGODB_COLLECTION = `${process.env.DB_COLLECTION}`;
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}?retryWrites=true&writeConcern=majority`;

let client = null;
let database = null;

const getDB = module.exports.getDB = async () => {
  try {
    if (database) {
      return database;
    }

    client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
    database = client.db(MONGODB_DB_NAME);

    console.log('\nDB > Connected');

    return database;
  } catch (error) {
    console.error('DB > MongoClient.connect...', error);
    return null;
  }
};

module.exports.insert = async products => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.insertMany(products, { 'ordered': false });

    return result;
  } catch (error) {
    console.error('DB > collection.insertMany...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    console.log('\nDB > JSON locally saved');
    return {
      'insertedCount': error.result.nInserted
    };
  }
};

module.exports.find = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).toArray();

    return result;
  } catch (error) {
    console.error('DB > collection.find...', error);
    return null;
  }
};

module.exports.aggregate = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.aggregate(query).toArray();
    return result;
  } catch (error) {
    console.error('DB > collection.find...', error);
    return null;
  }
};

module.exports.close = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('DB > MongoClient.close...', error);
  }
};