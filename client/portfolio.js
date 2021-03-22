'use strict';

const api_url = 'https://server-clear-fashion-git-master-vlntnf.vercel.app';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentFilters = [];

// inititiate selectors
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
const setCurrentProducts = ({ result, filters }) => {
  currentProducts = result;
  currentFilters = filters;
};

/**
 * Fetch from API
 */
const fetchProducts = async (filters = ['all', 'no-sort', false]) => {
  try {
    let brand = '';
    if (filters[0] !== 'all') {
      brand = `&brand=${filters[0]}`
    }
    const response = await fetch(`${api_url}/products/search?limit=0${brand}`);
    const body = await response.json();
    if (!body.results) {
      console.error(body);
      return { currentProducts, currentFilters };
    }
    //body.data.filters = filters;
    let result = body.results;
    return { result, filters };
  } catch (error) {
    console.error(error);
    return { currentProducts, currentFilters };
  }
};

/**
 * Declaration of filters' functions
 */
const filtering = (products, filters) => {
  switch (filters[1]) {
    case 'price-asc':
      sortByKey(products, 'price');
      break;
    case 'price-desc':
      sortByKey(products, 'price', false);
      break;
    default:
      break;
  }
  if (filters[0] != 'all') {
    products = products.filter(x => x.brand === filters[0]);
  }
  if (filters[2]) {
    products = products.filter(x => x.price < 50);
  }
  return [...products];
}

function sortByKey(array, key, increasing = true) {
  return array.sort((a, b) => {
    let x = a[key];
    let y = b[key];
    if (increasing) {
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
  //const template = filtering(products, filters)
  const template = products
    .map(product => {
      return `
      <tr id=${product._idid}>
        <td><a href="${product.link}">${product.name}</a></th>
        <td>${product.brand}</td>
        <td>${product.price}€</td>
      </tr>
    `;
    })
    .join('');
  tbody.innerHTML = template;
  thead.innerHTML = `
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

const renderBrands = async (products, filters) => {
  let brands = [];
  try {
    const response = await fetch(
      `${api_url}/products/brands`
    );
    brands = await response.json();
  } catch (error) {
    console.error(error);
  }
  const unique_brands = ['all'].concat(brands);
  const options = Array.from(
    unique_brands, x => `<option value="${x}">${x}</option>`
  ).join('');

  selectBrand.innerHTML = options;
  selectBrand.selectedIndex = unique_brands.indexOf(filters[0]);
};

const renderSort = filters => {
  const options = ['no-sort', 'price-asc', 'price-desc'];
  selectSort.selectedIndex = options.indexOf(filters[1]);
};

const renderCheck = filters => {
  checkPrice.checked = filters[2];
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

  spanP50.innerHTML = `${filteredProducts[Math.floor(len * .50)]['price']}€`;
  spanP90.innerHTML = `${filteredProducts[Math.floor(len * .90)]['price']}€`;
  spanP95.innerHTML = `${filteredProducts[Math.floor(len * .95)]['price']}€`;

  let filtersReleased = [...filters];
  filtersReleased[1] = 'date-desc';
  spanLastReleased.innerHTML = filtering(products, filtersReleased)[0]['released'];
};

const render = (products, filters) => {
  renderProducts(products, filters);
  renderIndicators(products, filters);
  renderBrands(products, filters);
  renderSort(filters);
  renderCheck(filters);
};

/**
 * Declaration of all listeners
 */

selectBrand.addEventListener('change', event => {
  currentFilters[0] = event.target.value;
  fetchProducts(currentFilters)
    .then(setCurrentProducts)
    .then(() => {
      render(currentProducts, currentFilters);
    });
});

selectSort.addEventListener('change', event => {
  currentFilters[1] = event.target.value;
  render(currentProducts, currentFilters);
});

checkPrice.addEventListener('change', event => {
  currentFilters[2] = event.target.checked;
  render(currentProducts, currentFilters);
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => {
      console.log(currentProducts);
      render(currentProducts, currentFilters);
    })
);