/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const index = require('./index');
const brands = require('../server/brands.json');

const shopScrape = async (eshop, debug = false) => {
  try {
    console.log(`Browsing ${eshop}`);
    if (debug) {
      console.log('\n/ DEBUG ON\n');
    }
    const res = await index(eshop, debug);
    if (debug) {
      console.log(res);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const allScrape = async () => {
  var json = [];
  try {
    for (let i = 0; i < brands.length; i++) {
      let eshop = brands[i].brand
      let url = brands[i].link;
      console.log(`Browsing ${eshop}`);
      let res = await index(url, false);
      if (res != null) {
        json = json.concat(res);
      }
    }
    /*
    const file = JSON.stringify({ data: json }, null, 4);
    fs.writeFileSync("./sources/$all.json", file);
    */
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// uuid, name, brand, link, price, categories, images

//shopScrape('https://www.dedicatedbrand.com');
//shopScrape('https://mudjeans.eu');
//shopScrape('https://adresse.paris');

//shopScrape('https://www.dedicatedbrand.com/en/men/t-shirts', true);
//shopScrape('https://mudjeans.eu/collections/men', true);
//shopScrape('https://adresse.paris/630-toute-la-collection?id_category=630&n=109', true);

//allScrape();

const [, , eshop] = process.argv;