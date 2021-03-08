const axios = require('axios');
const cheerio = require('cheerio');
const { parseDomain, fromUrl } = require('parse-domain');
const clothDict = require('../clothdict.json');
const { 'v5': uuidv5 } = require('uuid');

//type in url
const typeSite = ["women", "men", "kids"];
//type in our list
const typeName = ["women", "men", "kids"];

//to put at the end of urls to load every products
const expander = '';

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
  return $('.shopify-section.collection__landing .col.col-xs-6.col-md-3')
    .map((i, element) => {
      const name = $(element)
        .find('.product-title a')
        .text()
        .trim()
        .replace(/\s/g, ' ');

      const brand = 'MUD Jeans';

      const link = `${url}${$(element)
        .find('.product-title a')
        .attr('href')}`;

      const _id = uuidv5(link, uuidv5.URL);

      const price = parseInt(
        $(element)
          .find('.product-price')
          .first()
          .text()
          .replaceAll(/[^\d.,-]/g, '')
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
        .find('img')
        .each((i, image) => {
          images.push(`https:${$(image).attr('src')}`);
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
  return $('.header-navigation--primary .header-nav-link.level-1')
    .map((i, element) => {
      const link = `${url}${$(element).attr('href')}`;
      const name = $('span', element).text();
      for (let i = 0; i < typeSite.length; i++) {
        if (link.toLowerCase().includes(typeSite[i])) {
          return { type: typeName[i], name, link: link + expander };
        }
      }
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