const axios = require('axios');
const cheerio = require('cheerio');
const clothDict = require('../clothdict.json');

//to put at the end of urls to load every products
const expander = '?n=999';
//type in url
const clothSite = ['blouson', 'imperméable', 'veste', 'manteau', 'parka', 'sweat'];
//type in our list
const clothName = ['jackets', 'jackets', 'jackets', 'jackets', 'jackets', 'sweats'];

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */

const search = (str, arr, gender = 'unisex', dict = clothDict) => {
  Object.keys(dict).forEach(key => {
    let matchers = dict[key];
    if(matchers.some(matcher => {
      return str.match(new RegExp(matcher, "g")) != null;
    })){
      arr.push(`${gender}/${key}`);
    }
  });
}

const pages = (url, data) => { 
  const $ = cheerio.load(data);

  return $('.cbp-hrmenu .cbp-hrmenu-tab.cbp-hrmenu-tab-5')
    .map((i, element) => {
      const link = `${$('a', element).attr('href')}`;
      const name = $('a', element)
      .find('.cbp-tab-title')
      .text()
      .trim();
      return {type:'unisex', name, link:link+expander};
    })
    .get();
}

const products = (url, data) => {
  const $ = cheerio.load(data);

  return $('.product_list .product-container')
    .map((i, element) => {
      const uuid = null;

      const name = $(element)
        .find('.product-name')
        .first()
        .text()
        .trim()
        .replace(/\s/g, ' ');
      
      const brand = $(element)
        .find('.manuleft')
        .text()
        .trim()
      
      const link = $(element)
        .find('.product-name')
        .attr('href');

      const price = parseInt(
        $(element)
          .find('.price.product-price')
          .text()
      );

      const categories = [];
      search(name, categories);
      if(categories.length == 0){
        search(link, categories)
      }
      
      const images = [];
      $(element)
        .find('.product-image-container .product_img_link')
        .map((i, image)=>{
          images.push($(image)
          .find('.img_0')
          .attr('data-original'));
          images.push($(image)
          .find('.img_1')
          .attr('data-rollover'));
        });

        return {uuid, name, brand, link, price, categories, images};
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
      return products(url, data);
    } else {
      return pages(url, data);
    }
  }

  console.error(status);

  return null;
};