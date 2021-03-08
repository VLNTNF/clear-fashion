const { parseDomain, fromUrl } = require('parse-domain');
const sources = require('require-all')(`${__dirname}/sources`);

module.exports = async link => {
  const { 'domain': source } = parseDomain(fromUrl(link));
  var res = null;
  try {
    res = await sources[source].scrape(link);
  } catch (err) {
    console.error(err);
  }
  return res;
};