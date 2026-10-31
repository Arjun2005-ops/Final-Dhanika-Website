/**
 * Fiona Florist by Dhanika - Flower Shop Logic
 * Handles product rendering, variant selection, live price updates, category filtering, and search.
 */

document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("products-grid");
  const searchInput = document.getElementById("shop-search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("shop-sort-select");

  let currentCategory = "all";
  let searchQuery = "";
  let currentSort = "default";

  // Check URL query parameters (e.g. ?search=rose or ?category=tulips)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("search")) {
    searchQuery = urlParams.get("search").trim().toLowerCase();
    if (searchInput) searchInput.value = searchQuery;
  }
  if (urlParams.has("category")) {
    currentCategory = urlParams.get("category").toLowerCase();
  }

  // Update active filter button state
  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      if (btn.getAttribute("data-category") === currentCategory) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }

      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-category");
        renderProducts();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  /**
   * Filter and sort products according to user interaction
   */
  function getFilteredProducts() {
    if (typeof PRODUCTS_DATA === "undefined") return [];

    return PRODUCTS_DATA.filter(product => {
      // Category match
      let matchCategory = true;
      if (currentCategory === "bouquets") {
        matchCategory = product.type === "bouquet" || product.category === "bouquets";
      } else if (currentCategory === "roses") {
        matchCategory = product.category === "roses";
      } else if (currentCategory === "sunflowers") {
        matchCategory = product.category === "sunflowers" || product.id.includes("sunflower");
      } else if (currentCategory === "flowers") {
        matchCategory = product.category === "flowers" || product.category === "lilies";
      } else if (currentCategory === "keychains") {
        matchCategory = product.category === "keychains" || product.type === "keychain";
      } else if (currentCategory === "accessories") {
        matchCategory = product.category === "accessories" || product.type === "accessory";
      } else if (currentCategory === "singles") {
        matchCategory = product.type === "single";
      } else if (currentCategory !== "all") {
        matchCategory = product.category === currentCategory || product.type === currentCategory;
      }

      // Search query match
      const matchSearch = searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery);

      return matchCategory && matchSearch;
    }).sort((a, b) => {
      if (currentSort === "price-low") {
        return a.prices.single - b.prices.single;
      } else if (currentSort === "price-high") {
        return b.prices.single - a.prices.single;
      } else if (currentSort === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default order
    });
  }

  /**
   * Render products cards into the DOM
   */
  function renderProducts() {
    if (!productsContainer) return;

    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div class="no-results-icon" style="font-size: 3rem; margin-bottom: 1rem;">🌸</div>
          <h3 class="heading-tertiary">No Creations Found</h3>
          <p class="text-muted" style="margin-bottom: 1.5rem;">
            We couldn't find any creations matching "${searchQuery || currentCategory}".
          </p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-filters">
            Show All Creations
          </button>
        </div>
      `;

      const resetBtn = document.getElementById("btn-reset-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          searchQuery = "";
          currentCategory = "all";
          if (searchInput) searchInput.value = "";
          filterButtons.forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-category") === "all");
          });
          renderProducts();
        });
      }
      return;
    }

    productsContainer.innerHTML = filtered.map(product => {
      const singlePrice = product.prices.single;
      const singleOriginal = product.originalPrices.single;
      const isPack = product.type === "keychain" || product.type === "accessory";
      const categoryLabel = product.type === "bouquet" 
        ? "Handcrafted Bouquet" 
        : product.type === "keychain" 
          ? "Handmade Keychain" 
          : product.type === "accessory" 
            ? "Hair Accessory" 
            : "Single Stem Flower";

      const variantLabel = isPack ? "Select Pack Size:" : "Choose Arrangement Size:";
      const opt1 = isPack ? "1 Pc" : "Single";
      const opt2 = isPack ? "2 Pcs" : "Double";
      const opt3 = isPack ? "3 Pcs" : "Triple";
      
      return `
        <article class="product-card" data-product-id="${product.id}">
          ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ""}
          <div class="card-image-box">
            <img src="${encodeURI(product.image)}" alt="${product.name} - Handmade Pipe Cleaner" loading="lazy">
          </div>
          <div class="card-content">
            <span class="card-category">${categoryLabel}</span>
            <h3 class="card-title">${product.name}</h3>
            <p class="card-description">${product.description}</p>
            
            <div class="variant-selector">
              <span class="variant-label">${variantLabel}</span>
              <div class="variant-options">
                <button type="button" class="variant-btn active" data-variant="single">${opt1}</button>
                <button type="button" class="variant-btn" data-variant="double">${opt2}</button>
                <button type="button" class="variant-btn" data-variant="triple">${opt3}</button>
              </div>
            </div>

            <div class="card-bottom">
              <div class="price-quantity-row">
                <div>
                  <span class="product-price">₹<span class="price-val">${singlePrice}</span></span>
                  <span class="product-price-strike">₹<span class="orig-price-val">${singleOriginal}</span></span>
                </div>
                <div class="qty-control">
                  <button type="button" class="qty-btn btn-qty-minus" aria-label="Decrease quantity">−</button>
                  <input type="text" class="qty-input" value="1" readonly aria-label="Quantity">
                  <button type="button" class="qty-btn btn-qty-plus" aria-label="Increase quantity">+</button>
                </div>
              </div>

              <button type="button" class="btn btn-add-cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Add to Bag
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachCardEventListeners();
  }

  /**
   * Bind variant selection, quantity increment/decrement, and add to bag buttons
   */
  function attachCardEventListeners() {
    const cards = productsContainer.querySelectorAll(".product-card");

    cards.forEach(card => {
      const productId = card.getAttribute("data-product-id");
      const product = getProductById(productId);
      if (!product) return;

      const variantButtons = card.querySelectorAll(".variant-btn");
      const priceVal = card.querySelector(".price-val");
      const origPriceVal = card.querySelector(".orig-price-val");
      const qtyInput = card.querySelector(".qty-input");
      const btnMinus = card.querySelector(".btn-qty-minus");
      const btnPlus = card.querySelector(".btn-qty-plus");
      const btnAddCart = card.querySelector(".btn-add-cart");

      let currentVariant = "single";

      // Variant Buttons
      variantButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          variantButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentVariant = btn.getAttribute("data-variant");

          // Update Price
          const newPrice = product.prices[currentVariant];
          const newOrig = product.originalPrices[currentVariant];
          if (priceVal) priceVal.textContent = newPrice;
          if (origPriceVal) origPriceVal.textContent = newOrig;
        });
      });

      // Quantity controls
      if (btnMinus && qtyInput) {
        btnMinus.addEventListener("click", () => {
          let val = parseInt(qtyInput.value, 10) || 1;
          if (val > 1) {
            qtyInput.value = val - 1;
          }
        });
      }

      if (btnPlus && qtyInput) {
        btnPlus.addEventListener("click", () => {
          let val = parseInt(qtyInput.value, 10) || 1;
          if (val < 20) {
            qtyInput.value = val + 1;
          }
        });
      }

      // Add to Cart
      if (btnAddCart && qtyInput) {
        btnAddCart.addEventListener("click", () => {
          const qty = parseInt(qtyInput.value, 10) || 1;
          addToCart(productId, currentVariant, qty);
        });
      }
    });
  }

  // Initial render
  renderProducts();
});
