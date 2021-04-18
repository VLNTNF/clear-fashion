'use strict';
//const api_url = 'https://server-clear-fashion.vercel.app';
const api_url = 'https://022b06307c81.ngrok.io';

/**
 * Current
 */
let currentNumber = 0;
let currentMore = 20;
let currentProducts = [];
let currentFilters = [];

/**
 * Selectors
 */
const searchButton = document.getElementById('search-button');
const selectSort = document.getElementById('sort-select');
const selectBrand = document.getElementById('brand-select');
const selectType = document.getElementById('type-select');
const sectionProducts = document.getElementById('products');
const sectionLoad = document.getElementById('load-more-container');
const topButton = document.getElementById("top-button");
const menStyle = document.getElementById("men-style");
const womenStyle = document.getElementById("women-style");
const kidsStyle = document.getElementById("kids-style");
const loaderDiv = document.getElementById("loader");
const textMin = document.getElementById("min-text");
const textMax = document.getElementById("max-text");

/**
 * Set
 */
const setFilters = () => {
  var style = "men";
  if (womenStyle.checked) {
    style = "women";
  } else if (kidsStyle.checked) {
    style = "kids";
  }
  // [0] brand, [1] sort, [2] style, [3] type, [4] min, [5] max
  currentFilters = [selectBrand.value, selectSort.value, style, selectType.value, textMin.value.replace(/\D/g, ""), textMax.value.replace(/\D/g, "")];
};

/**
 * Load
 */
const preload = async () => {
  await renderTypes();
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
    let sort = '';
    if (currentFilters[1] == 'des') {
      sort = `&sort=des`;
    }
    let style = '';
    if (currentFilters[2]) {
      style = `&style=${currentFilters[2]}`;
    }
    let type = '';
    if (currentFilters[3] != 'All') {
      type = `&type=${currentFilters[3]}`;
    }
    let min = '';
    if (currentFilters[4] != "") {
      min = `&min=${currentFilters[4]}`;
    }
    let max = '';
    if (currentFilters[5] != "") {
      max = `&max=${currentFilters[5]}`;
    }
    const response = await fetch(`${api_url}/products/search?limit=0${brand}${sort}${style}${type}${min}${max}`);
    const body = await response.json();
    if (!body.results) {
      console.error(body);
    }
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
    sectionLoad.style.display = "flex";
  } else {
    sectionLoad.style.display = "none";
  }
};

const loadMore = () => {
  if (currentProducts.length > currentNumber + currentMore) {
    renderProducts(currentProducts.slice(currentNumber, currentNumber + currentMore));
  } else {
    renderProducts(currentProducts.slice(currentNumber, currentProducts.length));
  }
  currentNumber += currentMore;
  renderLoad();
};

const brandInfo = (b) => {
  let brand = brands[b.toLowerCase()];
  if (brand) {
    return brand;
  }
  return { "link": "", "overview": "unknown", "rating": 0 };
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
    sectionProducts.innerHTML = '<div class="no-result"><span>No results!</span><img src="images/sad-white.png"></div>';
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

const renderTypes = async () => {
  let types = [];
  try {
    const response = await fetch(
      `${api_url}/products/types?style=${currentFilters[2]}`
    );
    types = await response.json();
  } catch (error) {
    console.error(error);
  }
  var unique_types = [];
  types.forEach(x => {
    let type = x.replace(/.*\//ig, '');
    if (!unique_types.includes(type)) {
      unique_types.push(type);
    }
  });
  unique_types.sort();
  const options = Array.from(
    ['All'].concat(unique_types), x => `<option value="${x}">${x.charAt(0).toUpperCase() + x.replaceAll('-', ' ').slice(1)}</option>`
  ).join('');
  selectType.innerHTML = options;
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
menStyle.addEventListener('change', event => {
  setFilters();
  renderTypes();
});

womenStyle.addEventListener('change', event => {
  setFilters();
  renderTypes();
});

kidsStyle.addEventListener('change', event => {
  setFilters();
  renderTypes();
});

textMin.addEventListener('change', event => {
  setFilters();
});

textMax.addEventListener('change', event => {
  setFilters();
});

selectType.addEventListener('change', event => {
  setFilters();
});

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