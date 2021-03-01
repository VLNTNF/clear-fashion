'use strict';
require('dotenv').config();

const { MongoClient } = require('mongodb');
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}?retryWrites=true&writeConcern=majority`;
const MONGODB_DB_NAME = 'clearfashion';
const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
var db;

async function insert() {
    const json = require('./sources/$adresse.json');
    const products = json.data;

    const collection = db.collection('products');
    const result = await collection.insertMany(products);
    console.log(result);
}

async function searchBrand(brand) {
    const collection = db.collection('products');
    const products = await collection.find({ brand }).toArray();;
    console.log(products);
}

async function searchPrice(p) {
    const collection = db.collection('products');
    const products = await collection.find({ price: { $lt: p } }).toArray();;
    console.log(products);
}

async function sortByPrice() {
    const collection = db.collection('products');
    const products = await collection.aggregate([{ $sort: { price: 1 } }]).toArray();
    console.log(products);
}

async function run() {
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    //await searchBrand('ADRESSE');
    //await searchPrice(100);
    await sortByPrice();
    await client.close();
}

run();