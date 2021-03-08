/* eslint-disable no-console, no-process-exit */
const db = require('./db');
const { parseDomain, fromUrl } = require('parse-domain');
const sources = require('require-all')(`${__dirname}/sources`);

async function sandbox(link) {
  try {
    let products = [];
    const { 'domain': source } = parseDomain(fromUrl(link));
    const pages = await sources[source].pages(link);

    console.log(`\nSC > browsing ${pages.length} pages:\n`);
    console.log(pages);

    const promises = pages.map(page => sources[source].scrape(page));
    const results = await Promise.all(promises);

    console.log(`\nSC > ${results.length} results of promises found`);
    console.log(`SC > ${results.flat().length} products found`);

    products.push(results.flat());
    products = products.flat();

    console.log(`SC > ${products.length} total of products found\n`);

    const result = await db.insert(products);

    console.log(`DB > ${result.insertedCount} inserted products\n`);

    /*
    console.log('\n');
    console.log('DB > Find Loom products only');
    const loomOnly = await db.find({'brand': 'loom'});
    console.log(loomOnly);
    */

    db.close();
  } catch (e) {
    console.error(e);
  }
}

sandbox('https://adresse.paris/');