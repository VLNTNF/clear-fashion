const axios = require('axios');
const cheerio = require('cheerio');
const {parseDomain, fromUrl} = require('parse-domain');
const fs = require('fs');


/*
//type in url
const typeSite = ["women", "men", "kids"];
//type in our list
const typeName = ["women", "men", "kids"];

//to put at the end of urls to load every products
const expander = '#page=999';



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

*/

// uuid, name, brand, link, price, categories, images

module.exports.scrape = async (url, productsScrape = true) => {
  const response = await axios(`${url}/en/loadfilter`);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    var categories = data.filter.categories;
    var products = data.products;
    var json = [];

    products.forEach(product => {
      if(!Array.isArray(product) && product.price.soldout == false){
        let p = {};
        p.uuid =null;
        p.name = product.name;
        p.brand = "DEDICATED";
        p.link = `${url}${product.canonicalUri}`;
        p.price = product.price.priceAsNumber;
        p.categories = [];
        Object.keys(categories).forEach(key =>{
          let k = (key.match(new RegExp("/", "g")) || []).length;
          if(categories[key].includes(product.id) && k==1){
            p.categories.push(key);
          }
        });
        p.images = product.image;
        json.push(p);
      }
    });
    const file = JSON.stringify({data:json}, null, 4);
    try{
      fs.writeFileSync("dedicated.json", file);
      console.log('JSON saved');
    } catch(err){
      console.error(err);
    }
  }
  else{
    console.error(status);
  }
};