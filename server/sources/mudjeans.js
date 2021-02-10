const axios = require('axios');
const cheerio = require('cheerio');
const { parseDomain, fromUrl } = require('parse-domain');
const fs = require('fs');
const clothDict = require('../clothdict.json');

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
}

const pagesLoad = (url, data) => {
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
}

const productsLoad = (url, data, type = 'unisex') => {
  const $ = cheerio.load(data);
  return $('.shopify-section.collection__landing .col.col-xs-6.col-md-3')
    .map((i, element) => {
      const uuid = null;

      const name = $(element)
        .find('.product-title a')
        .text()
        .trim()
        .replace(/\s/g, ' ');

      const brand = 'MUD Jeans';

      const link = `${url}${$(element)
        .find('.product-title a')
        .attr('href')}`;

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

      return { uuid, name, brand, link, price, categories, images };
    })
    .get();
}

const scraping = async url => {
  const response = await axios(url);
  const { data, status } = response;
  if (status >= 200 && status < 300) {
    return data;
  } else {
    console.error(status);
    return null;
  }
}

module.exports.scrape = async (url, debug) => {
  const shorturl = `https://${fromUrl(url)}`;
  if (debug) {
    const pageData = await scraping(url);
    const productsData = await scraping(url);
    const pages = pagesLoad(shorturl, pageData);
    const products = productsLoad(shorturl, productsData);
    return pages.concat(products);
  } else {
    var json = [];
    const data = await scraping(url);
    const pages = pagesLoad(shorturl, data);
    for (let i = 0; i < pages.length; i++) {
      let pageData = await scraping(pages[i].link);
      let pageType = pages[i].type;
      let products = productsLoad(shorturl, pageData, pageType);
      json = json.concat(products);
    }
    const file = JSON.stringify({ data: json }, null, 4);
    try {
      fs.writeFileSync("./sources/$mudjeans.json", file);
      console.log('JSON saved');
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}