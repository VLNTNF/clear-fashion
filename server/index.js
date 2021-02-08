const {parseDomain, fromUrl} = require('parse-domain');
const sources = require('require-all')(`${__dirname}/sources`);

module.exports = async (link, onlyProducts = false) => {
  const {'domain': source} = parseDomain(fromUrl(link));
  var pages;
  if(onlyProducts){
    pages = await sources[source].scrape(link);
  } else {
    pages = await sources[source].scrape(link, false);
    for(let i = 0; i < pages.length; i++){
      pages[i].products = await sources[source].scrape(pages[i].link);
    }
  }

  return pages;
};
