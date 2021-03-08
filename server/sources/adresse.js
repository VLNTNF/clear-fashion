const axios = require('axios');
const cheerio = require('cheerio');
const { parseDomain, fromUrl } = require('parse-domain');
const clothDict = require('../clothdict.json');
const { 'v5': uuidv5 } = require('uuid');

//to put at the end of urls to load every products
const expander = '?n=999';

const searchDict = (str, arr, gender = 'unisex', dict = clothDict) => {
  Object.keys(dict).forEach(key => {
    let matchers = dict[key];
    if (matchers.some(matcher => {
      return str.match(new RegExp(matcher, "g")) != null;
    })) {
      arr.push(`${gender}/${key}`);
    }
  });
};

const productsLoad = (url, data, type = 'unisex') => {
  const $ = cheerio.load(data);

  return $('.product_list .product-container')
    .map((i, element) => {
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

      const _id = uuidv5(link, uuidv5.URL);

      const price = parseInt(
        $(element)
          .find('.price.product-price')
          .text()
      );

      const categories = [];
      searchDict(name, categories, type);
      if (categories.length == 0) {
        searchDict(link.replace(`https://${fromUrl(link)}`, ''), categories, type);
      }
      if (categories.length == 0) {
        categories.push(`${type}/bottoms`);
      }

      const images = [];
      $(element)
        .find('.product-image-container .product_img_link')
        .map((i, image) => {
          images.push($(image)
            .find('.img_0')
            .attr('data-original'));
          images.push($(image)
            .find('.img_1')
            .attr('data-rollover'));
        });

      return { _id, name, brand, link, price, categories, images };
    })
    .get();
};

const scraping = async url => {
  const response = await axios(url);
  const { data, status } = response;
  if (status >= 200 && status < 300) {
    return data;
  } else {
    console.error(status);
    return null;
  }
};

module.exports.pages = async url => {
  const data = await scraping(url);
  const $ = cheerio.load(data);
  return $('.cbp-hrmenu .cbp-hrmenu-tab.cbp-hrmenu-tab-5')
    .map((i, element) => {
      const link = `${$('a', element).attr('href')}`;
      const name = $('a', element)
        .find('.cbp-tab-title')
        .text()
        .trim();
      return { type: 'unisex', name, link: link + expander };
    })
    .get();
};

module.exports.scrape = async page => {
  var json = [];
  let pageData = await scraping(page.link);
  let pageType = page.type;
  let shorturl = `https://${fromUrl(page.link)}`;
  let products = productsLoad(shorturl, pageData, pageType);
  json = json.concat(products);
  return json;
};