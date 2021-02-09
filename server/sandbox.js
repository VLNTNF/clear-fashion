/* eslint-disable no-console, no-process-exit */
const index = require('./index');

async function shopScrape (eshop, onlyProducts) {
  try {
    console.log(`browsing ${eshop}`);
    const data = await index(eshop, onlyProducts);
    console.log(data);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;


//shopScrape('https://www.dedicatedbrand.com', true);
//shopScrape('https://mudjeans.eu');
//shopScrape('https://adresse.paris');

//shopScrape('https://www.dedicatedbrand.com/en/men/t-shirts', true);
//shopScrape('https://mudjeans.eu/collections/men', true);
shopScrape('https://adresse.paris/630-toute-la-collection?id_category=630&n=109', true);


