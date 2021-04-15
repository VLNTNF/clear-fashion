const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const db = require('./db');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/id/:id', async (request, response) => {
  request.query._id=request.params.id;
  let result = await db.find(request.query);
  if(result.results.length > 0){
    response.send(result.results);
  } else {
    response.send({'ack': 'ID not found'});
  }
});

app.get('/products/search', async (request, response) => {
  let result = await db.find(request.query);
  console.log(result);
  response.send(result);
});

app.get('/products/brands', async (request, response) => {
  let result = await db.distinct('brand');
  console.log(result);
  response.send(result);
});

app.get('/products/types', async (request, response) => {
  let result = await db.distinct('brand');
  console.log(result);
  response.send(result);
});

app.listen(PORT);
console.log(`Running on port ${PORT}`);
