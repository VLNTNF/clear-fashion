'use strict';

const api_url = 'https://server-clear-fashion.vercel.app';

// current products on the page
let currentProducts = [];
let currentFilters = ['All', 'price-asc'];

// inititiate selectors
const selectBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const selectSort = document.querySelector('#sort-select');
const spanNbProducts = document.querySelector('#nbProducts');


/**
 * Set global value
 */
const setCurrentProducts = result => {
  currentProducts = result;
};
const setCurrentFilters = result => {
  currentFilters = result;
};


/**
 * Load products and render
 */
const loader = async () => {
  await fetchProducts();
  await render();
}


/**
 * Fetch from API
 */
const fetchProducts = async () => {
  try {
    let brand = '';
    if (currentFilters[0] !== 'All') {
      brand = `&brand=${currentFilters[0]}`
    }
    let sort = '';
    if (currentFilters[1] === 'price-desc') {
      brand = `&sort=des`
    }
    const response = await fetch(`${api_url}/products/search?limit=0${brand}${sort}`);
    const body = await response.json();
    if (!body.results) {
      console.error(body);
    }
    // change current products
    //setCurrentProducts(body.results);
    currentProducts = body.results;
  } catch (error) {
    console.error(error);
  }
};


/**
 * Declaration of all renders
 */
const render = () => {
  renderProducts(currentProducts);
  renderIndicators(currentProducts);
  renderBrands(currentFilters);
  renderSort(currentFilters);
};

const renderProducts = (products) => {
  const fragment = document.createDocumentFragment();
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
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

const renderBrands = async (filters) => {
  let brands = [];
  try {
    const response = await fetch(
      `${api_url}/products/brands`
    );
    brands = await response.json();
  } catch (error) {
    console.error(error);
  }
  const unique_brands = ['All'].concat(brands);
  const options = Array.from(
    unique_brands, x => `<option value="${x}">${x}</option>`
  ).join('');

  selectBrand.innerHTML = options;
  selectBrand.selectedIndex = unique_brands.indexOf(filters[0]);
};

const renderSort = filters => {
  if (filters[1] === 'price-asc') {
    selectSort.innerHTML = "Ascending";
  } else {
    selectSort.innerHTML = "Descending";
  }
};

const renderIndicators = products => {
  spanNbProducts.innerHTML = products.length;
};


/**
 * Declaration of all listeners
 */
selectBrand.addEventListener('change', event => {
  currentFilters[0] = event.target.value;
  loader();
});

selectSort.addEventListener('click', event => {
  if (selectSort.innerHTML === "Ascending") {
    currentFilters[1] = "price-desc";
  } else {
    currentFilters[1] = "price-asc";
  }
  loader();
});

document.addEventListener('DOMContentLoaded', () =>
  loader()
);