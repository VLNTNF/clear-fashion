const axios = require('axios');
const cheerio = require('cheerio');
const { parseDomain, fromUrl } = require('parse-domain');
const fs = require('fs');
const clothDict = require('../clothdict.json');

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
}

const pagesLoad = (url, data) => {
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
}

const productsLoad = (url, data, type = 'unisex') => {
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

      return { uuid, name, brand, link, price, categories, images };
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
      fs.writeFileSync("./sources/$adresse.json", file);
      console.log('JSON saved');
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}