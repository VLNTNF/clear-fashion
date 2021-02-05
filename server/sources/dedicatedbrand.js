const axios = require('axios');
const cheerio = require('cheerio');

//type in url
const typeSite = ["women", "men", "kids"];
//type in our list
const typeName = ["women", "men", "kids"];

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */


const pages = (url, data) => { 
  const $ = cheerio.load(data);

  return $('.mainNavigation-link-subMenu .mainNavigation-link-subMenu-link')
    .map((i, element) => {
      const link = `${url}${$('a', element).attr('href')}`;
      const name = `${$('a span', element).text()}`;
      for (let i = 0; i < typeSite.length; i++) {
        if(link.toLowerCase().includes(typeSite[i])){
          return {type:`${typeName[i]}`, name, link};
        }
      }
    })
    .get();
}

const parse = data => {
  const $ = cheerio.load(data);

  return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );

      return {name, price};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return pages(url, data);
  }

  console.error(status);

  return null;
};
