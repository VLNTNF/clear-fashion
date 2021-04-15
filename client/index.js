'use strict';
const api_url = 'https://server-clear-fashion.vercel.app';

// current products on the page
/*
let currentProducts = [];
let currentFilters = ['All', 'price-asc'];
*/
let currentNumber = 0;
let currentMore = 20;
let currentProducts = [];
let currentFilters = [];


/**
 * Inititiate selectors
 */
const searchButton = document.getElementById('search-button');
const selectSort = document.getElementById('sort-select');
const selectBrand = document.getElementById('brand-select');
const sectionProducts = document.getElementById('products');
const sectionLoad = document.getElementById('load-more-container');
const topButton = document.getElementById("top-button");
const menStyle = document.getElementById("men-style");
const womenStyle = document.getElementById("women-style");
const kidsStyle = document.getElementById("kids-style");
const loaderDiv = document.getElementById("loader");

/**
 * Set
 */
const setFilters = () => {
  currentFilters = [selectBrand.value, selectSort.value];
};

/**
 * Load
 */
const preload = async () => {
  await renderBrands();
  await load();
};

const load = async () => {
  loaderDiv.style.display = "flex";
  reset();
  setFilters();
  const products = await fetchProducts();
  if (products) {
    currentProducts = products;
  }
  loadMore();
  loaderDiv.style.display = "none";
};

/**
 * Fetch from API
 */
const fetchProducts = async () => {
  try {
    let brand = '';
    if (currentFilters[0] != 'All') {
      brand = `&brand=${currentFilters[0]}`;
    }
    console.log(currentFilters[0]);
    console.log(brand);
    let sort = '';
    if (currentFilters[1] == 'des') {
      sort = `&sort=des`;
    }
    const response = await fetch(`${api_url}/products/search?limit=0${brand}${sort}`);
    const body = await response.json();
    if (!body.results) {
      console.error(body);
    }
    // change current products
    //setCurrentProducts(body.results);
    return body.results;
  } catch (error) {
    console.error(error);
  }
  return false;
};


/**
 * Renders
 */
const reset = () => {
  currentNumber = 0;
  currentProducts = [];
  sectionProducts.innerHTML = "";
  sectionLoad.innerHTML = '';
};

const renderLoad = () => {
  if (currentProducts.length > 10) {
    if (currentNumber < currentProducts.length) {
      sectionLoad.innerHTML = '<input type="button" name="load more" id="load-more" value="Load more..." onclick="loadMore()"></input>';
      sectionLoad.innerHTML += `<div class="pagination tile"><span>${currentNumber} / ${currentProducts.length}</span></div>`;
      sectionLoad.innerHTML += '<input type="button" class="top-button" onclick="topFunction()" id="top-button" value="▲"></input>';
    } else {
      sectionLoad.innerHTML = '<input type="button" class="top-button" onclick="topFunction()" id="top-button" value="▲"></input>';
    }
  } else {
    sectionLoad.innerHTML = '';
  }
};

const loadMore = () => {
  if (currentProducts.length > currentNumber + currentMore) {
    console.log(currentProducts.slice(currentNumber, currentNumber + currentMore));
    renderProducts(currentProducts.slice(currentNumber, currentNumber + currentMore));
  } else {
    renderProducts(currentProducts.slice(currentNumber, currentProducts.length));
  }
  currentNumber += currentMore;
  renderLoad();
};

const brandInfo = (b) => {
  let brand = brands[b.toLowerCase()];
  if(brand) {
    return brand;
  }
  return {"link": "","overview": "unknown","rating": 0};
};

const renderProducts = (products) => {
  if (products.length != 0) {
    const template = products
      .map(product => {
        let info = brandInfo(product.brand);
        return `<div class="product" id=${product._id}>
        <a class="product-img" href="${product.link}">
          <img
            src="${product.images[0]}"
            alt="${product.name}">
          <img
            src="${product.images[1]}"
            class="img-two" alt="">
        </a>
        <div class="product-info">
          <a class="product-brand" href="${info.link}">${product.brand}</a>
          <span class="product-name">${product.name}</span>
          <div class="additional-container">
            <div class="price-container tile">
              <span class="product-price">${product.price}€</span>
            </div>
            <div class="quality-container tile">
              <div class="quality-indicator ${info.overview.replace(" ", "-")}"></div>
              <div class="quality-name"><span>${info.overview}</span></div>
            </div>
          </div>
        </div>
      </div>`;
      }).join('');
    let space = '<div class="product"></div>'.repeat(3);
    sectionProducts.innerHTML = sectionProducts.innerHTML.replace(space, "") + template + space;
  } else {
    const noresults = document.createElement('span');
    noresults.innerHTML = "No results !";
    sectionProducts.appendChild(noresults);
  }
};

const renderBrands = async () => {
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
};

const renderSelect = async (values) => {
  const options = Array.from(
    values, x => `<option value="${x.code_UAI}">${x.nom_ets}</option>`
  ).join('');
  selectSelect.innerHTML = options;
};

/**
 * Back to top button
 */
const topFunction = () => {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

/**
 * Listeners
 */
selectSort.addEventListener('change', event => {
  setFilters();
});

selectBrand.addEventListener('change', event => {
  setFilters();
});

searchButton.addEventListener('click', event => {
  load();
});

document.addEventListener('DOMContentLoaded', () => {
  preload();
});