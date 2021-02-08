const axios = require('axios');
const cheerio = require('cheerio');
const {parseDomain, fromUrl} = require('parse-domain');

//type in url
const typeSite = ["women", "men", "kids"];
//type in our list
const typeName = ["women", "men", "kids"];

//to put at the end of urls to load every products
const expander = '';

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */


const pages = (url, data) => { 
  const $ = cheerio.load(data);
  return $('.header-navigation--primary .header-nav-link.level-1')
    .map((i, element) => {
      const link = `${url}${$(element).attr('href')}`;
      const name = $('span', element).text();
      for (let i = 0; i < typeSite.length; i++) {
        if(link.toLowerCase().includes(typeSite[i])){
          return {type:typeName[i], name, link:link+expander};
        }
      }
    })
    .get();
}

const products = (url, data) => {
  const $ = cheerio.load(data);
  return $('.shopify-section.collection__landing .col.col-xs-6.col-md-3')
    .map((i, element) => {
      const name = $(element)
        .find('.product-title a')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.product-price')
          .first()
          .text()
          .replaceAll(/[^\d.,-]/g, '')
      );
      const link = `${url}${$(element)
        .find('.product-title a')
        .attr('href')}`;
      const images = [];
      $(element)
        .find('img')
        .each((i, image) =>{
          images.push(`https:${$(image).attr('src')}`);
        });
      return {name, link, price, images};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */

module.exports.scrape = async (url, productsScrape = true) => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    if(productsScrape){
      return products(`https://${fromUrl(url)}`, data);
    } else {
      return pages(url, data);
    }
  }

  console.error(status);

  return null;
};