'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentFilters = [];

// inititiate selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const selectSort = document.querySelector('#sort-select');
const checkDate = document.querySelector('#date-checkbox');
const checkPrice = document.querySelector('#price-checkbox');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanLastReleased = document.querySelector('#last-released');

/**
 * Set global value
 */
const setCurrentProducts = ({result, meta, filters}) => {
  currentProducts = result;
  currentPagination = meta;
  currentFilters = filters;
};

/**
 * Fetch from API
 */
const fetchProducts = async (page = 1, size = 12, 
  filters = ['all', 'no-sort', false, false]) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination, currentFilters};
    }
    body.data.filters = filters;
    console.log(body.data);
    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination, currentFilters};
  }
};

/**
 * Declaration of filters' functions
 */
const filtering = (products, filters) =>{
  switch(filters[1]) {
    case 'price-asc':
      sortByKey(products, 'price');
      break;
    case 'price-desc':
      sortByKey(products, 'price', false);
      break;
    case 'date-asc':
      sortByKey(products, 'released');
      break;
    case 'date-desc':
      sortByKey(products, 'released', false);
      break;
    default:
      break;
  }
  if(filters[0] != 'all'){
    products = products.filter(x => x.brand === filters[0]);
  }
  if(filters[2]){
    products = products.filter(x => x.price < 50);
  }
  if(filters[3]){
    products = products.filter(x => {
      let date = new Date(x.released);
      let now = new Date();
      let days = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
      return (days < 14);
    });
  }
  return [...products];
}

function sortByKey(array, key, increasing = true) {
  return array.sort((a, b) => {
    let x = a[key];
    let y = b[key];
    if(increasing){
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

/**
 * Declaration of all renders
 */
const renderProducts = (products, filters) => {
  const fragment = document.createDocumentFragment();
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const template = filtering(products, filters)
    .map(product => {
      return `
      <tr id=${product.uuid}>
        <td><a href="${product.link}">${product.name}</a></th>
        <td>${product.brand}</td>
        <td>${product.price}€</td>
      </tr>
    `;
    })
    .join('');

  tbody.innerHTML = template;
  thead.innerHTML =`
  <tr>
    <th width=70%>Name</th>
    <th width=20%>Brand</th>
    <th width=10%>Price</th>
  </tr>`
  table.appendChild(thead);
  table.appendChild(tbody);
  fragment.appendChild(table);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

const renderBrands = (products, filters) =>{
  const unique_brands = ['all'].concat([...new Set(Array.from(products, x => x.brand))]);
  const options = Array.from(
    unique_brands, x => `<option value="${x}">${x}</option>`
  ).join('');

  selectBrand.innerHTML = options;
  selectBrand.selectedIndex = unique_brands.indexOf(filters[0]);
};

const renderSort = filters =>{
  const options = ['no-sort', 'price-asc', 'price-desc', 'date-asc', 'date-desc'];
  selectSort.selectedIndex = options.indexOf(filters[1]);
};

const renderCheck = filters =>{
  checkPrice.checked = filters[2];
  checkDate.checked = filters[3];
};

const renderIndicators = (products, filters) => {
  let filtersSort = [...filters];
  filtersSort[1] = 'price-asc';
  let filteredProducts = filtering(products, filtersSort);
  let len = filteredProducts.length;
  spanNbProducts.innerHTML = len;

  let filtersNew = [...filters];
  filtersNew[3] = true;
  spanNbNewProducts.innerHTML = filtering(products, filtersNew).length;

  spanP50.innerHTML = `${filteredProducts[Math.floor(len*.50)]['price']}€`;
  spanP90.innerHTML = `${filteredProducts[Math.floor(len*.90)]['price']}€`;
  spanP95.innerHTML = `${filteredProducts[Math.floor(len*.95)]['price']}€`;

  let filtersReleased = [...filters];
  filtersReleased[1] = 'date-desc';
  spanLastReleased.innerHTML = filtering(products, filtersReleased)[0]['released'];
};

const render = (products, pagination, filters) => {
  renderProducts(products, filters);
  renderPagination(pagination);
  renderIndicators(products, filters);
  renderBrands(products, filters);
  renderSort(filters);
  renderCheck(filters);
};

/**
 * Declaration of all listeners
 */
selectShow.addEventListener('change', event => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value), currentFilters)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination, currentFilters));
});

selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), selectShow.value, currentFilters)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination, currentFilters));
});

selectBrand.addEventListener('change', event => {
  currentFilters[0] = event.target.value;
  render(currentProducts, currentPagination, currentFilters);
});

selectSort.addEventListener('change', event => {
  currentFilters[1] = event.target.value;
  render(currentProducts, currentPagination, currentFilters);
});

checkPrice.addEventListener('change', event => {
  currentFilters[2] = event.target.checked;
  render(currentProducts, currentPagination, currentFilters);
});

checkDate.addEventListener('change', event => {
  currentFilters[3] = event.target.checked;
  render(currentProducts, currentPagination, currentFilters);
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination, currentFilters))
);