const axios = require('axios');
const cheerio = require('cheerio');
const {parseDomain, fromUrl} = require('parse-domain');

//type in url
const typeSite = ["women", "men", "kids"];
//type in our list
const typeName = ["women", "men", "kids"];

//to put at the end of urls to load every products
const expander = '#page=999';

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
      const name = $('a span', element).text();
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

  return $('.js-productPreviewContainer.category-list .productList')
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
      const link = `${url}${$(element)
        .find('.productList-link')
        .attr('href')}`;
      const images = [];
      $(element)
        .find('img')
        .each((i, image) =>{
          images.push($(image).attr('src'));
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
