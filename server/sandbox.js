/* eslint-disable no-console, no-process-exit */
const index = require('./index');

async function shopScrape (eshop) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop}`);

    const products = await index(eshop);
    console.log(products);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;


//shopScrape('https://www.dedicatedbrand.com');
//shopScrape('https://mudjeans.eu');


