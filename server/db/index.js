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

module.exports.findID = async r => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    var find = {};
    if (r._id) {
      find._id = r._id;
    } else {
      find._id = 0;
    }
    const req = await collection.find(find).toArray();
    return req;
  } catch (error) {
    console.error('DB > collection.find...', error);
    return null;
  }
};

module.exports.distinct = async key => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.distinct(key);
    return result;
  } catch (error) {
    console.error('DB > collection.distinct...', error);
    return null;
  }
};

module.exports.types = async r => {
  try {
    var reg = '(^men|^unisex)';
    if (r.style) {
      if (r.style == 'women') {
        reg = '(^women|^unisex)';
      } else if (r.style == 'kids') {
        reg = '^kids';
      }
    }
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    var agg = [{ '$unwind': { 'path': '$categories' } }, { '$group': { '_id': '$categories' } }, { '$match': { '_id': { '$regex': reg } } }];
    const result = await collection.aggregate(agg).toArray();
    var arr = [];
    result.forEach(x => {
      arr.push(x._id);
    });
    return arr;
  } catch (error) {
    console.error('DB > collection.aggregate...', error);
    return null;
  }
};

module.exports.search = async r => {
  // [{'$unwind':{'path':'$categories'}},{'$match':{'categories':{'$regex':'(^men|^unisex)\/bottoms'},'price':{'$lte':100}}},{'$sort':{'price':-1}},{'$limit':10}]
  try {
    var res = {};
    var match = {};
    if (r.brand) {
      match.brand = r.brand;
    }
    var style = '(^men|^unisex)';
    if (r.style) {
      if (r.style == 'women') {
        style = '(^women|^unisex)';
      } else if (r.style == 'kids') {
        style = '^kids';
      }
    }
    var type = '';
    if (r.type) {
      type = `\/${r.type}`;
    }
    match.categories = { '$regex': style + type };
    if (r.min && !r.max) {
      match.price = { $gte: parseInt(r.min) };
    } else if (!r.min && r.max) {
      match.price = { $lte: parseInt(r.max) };
    } else if (r.min && r.max) {
      match.price = { $gte: parseInt(r.min), $lte: parseInt(r.max) };
    }
    var agg = [{ '$unwind': { 'path': '$categories' } }, { '$match': match }];
    if (r.sort === 'des') {
      agg.push({ '$sort': { 'price': -1 } });
    } else {
      agg.push({ '$sort': { 'price': 1 } });
    }
    if (r.limit) {
      res.limit = parseInt(r.limit);
      if (r.limit > 0) {
        agg.push({ '$limit': res.limit });
      }
    } else {
      res.limit = 12;
      agg.push({ '$limit': 12 });
    }
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const req = await collection.aggregate(agg).toArray();
    res.total = req.length;
    res.results = req;
    return res;
  } catch (error) {
    console.error('DB > collection.aggregate...', error);
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