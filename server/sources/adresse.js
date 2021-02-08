const axios = require('axios');
const cheerio = require('cheerio');

//to put at the end of urls to load every products
const expander = '?n=999';

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */


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
      const name = $(element)
        .find('.product-name')
        .first()
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.price.product-price')
          .text()
      );
      const link = $(element)
        .find('.product-name')
        .attr('href');
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
      return products(url, data);
    } else {
      return pages(url, data);
    }
  }

  console.error(status);

  return null;
};