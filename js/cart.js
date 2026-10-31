/**
 * Fiona Florist by Dhanika - Shopping Cart Page Logic
 * Renders stored cart items, calculates subtotals & shipping, handles updates & deletions.
 */

document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cart-items-container");
  const cartSummaryBox = document.getElementById("cart-summary-box");
  const emptyCartState = document.getElementById("empty-cart-state");
  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const totalEl = document.getElementById("cart-total");
  const cartTotalItemsCount = document.getElementById("cart-total-items-count");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const quickWaBtn = document.getElementById("quick-wa-cart-btn");

  function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
      if (cartContainer) cartContainer.innerHTML = "";
      if (cartSummaryBox) cartSummaryBox.style.display = "none";
      if (emptyCartState) emptyCartState.style.display = "block";
      if (cartTotalItemsCount) cartTotalItemsCount.textContent = "0 items";
      return;
    }

    if (emptyCartState) emptyCartState.style.display = "none";
    if (cartSummaryBox) cartSummaryBox.style.display = "block";

    let subtotal = 0;
    let totalItems = 0;

    if (cartContainer) {
      cartContainer.innerHTML = cart.map((item, index) => {
        const itemSubtotal = item.unitPrice * item.quantity;
        subtotal += itemSubtotal;
        totalItems += item.quantity;

        return `
          <div class="cart-item-row" data-index="${index}">
            <div class="cart-item-thumb">
              <img src="${item.image}" alt="${item.name}">
            </div>
            
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <span class="cart-item-variant">${capitalize(item.variant)} Arrangement</span>
              <div class="cart-item-unit-price">₹${item.unitPrice} each</div>
            </div>

            <div class="qty-control">
              <button type="button" class="qty-btn btn-cart-minus" data-index="${index}">−</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly>
              <button type="button" class="qty-btn btn-cart-plus" data-index="${index}">+</button>
            </div>

            <div class="cart-item-subtotal">₹${itemSubtotal}</div>

            <button type="button" class="btn-remove-item" data-index="${index}" title="Remove item" aria-label="Remove item">
              &times;
            </button>
          </div>
        `;
      }).join("");
    }

    if (cartTotalItemsCount) {
      cartTotalItemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (totalEl) totalEl.textContent = `₹${subtotal}`;

    attachCartListeners();
  }

  function attachCartListeners() {
    if (!cartContainer) return;

    // Quantity Decrement
    cartContainer.querySelectorAll(".btn-cart-minus").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const cart = getCart();
        if (cart[index]) {
          if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            saveCart(cart);
            renderCart();
          } else {
            // Confirm removal
            if (confirm(`Remove "${cart[index].name}" from your bag?`)) {
              cart.splice(index, 1);
              saveCart(cart);
              renderCart();
              showToast("Item removed from your bag.", "info");
            }
          }
        }
      });
    });

    // Quantity Increment
    cartContainer.querySelectorAll(".btn-cart-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const cart = getCart();
        if (cart[index]) {
          cart[index].quantity += 1;
          saveCart(cart);
          renderCart();
        }
      });
    });

    // Item Removal
    cartContainer.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const cart = getCart();
        if (cart[index]) {
          const removedName = cart[index].name;
          cart.splice(index, 1);
          saveCart(cart);
          renderCart();
          showToast(`Removed "${removedName}" from your bag.`, "info");
        }
      });
    });
  }

  // Clear Cart Button
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) return;
      if (confirm("Are you sure you want to empty your shopping bag?")) {
        saveCart([]);
        renderCart();
        showToast("Your shopping bag is now empty.");
      }
    });
  }

  // Quick Order from Cart via WhatsApp
  if (quickWaBtn) {
    quickWaBtn.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        showToast("Your shopping bag is empty!", "error");
        return;
      }

      let subtotal = 0;
      let orderItemsText = "";

      cart.forEach((item, i) => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        orderItemsText += `${i + 1}. *${item.name}* (${capitalize(item.variant)})\n   Qty: ${item.quantity} × ₹${item.unitPrice} = ₹${itemTotal}\n`;
      });

      const message = `*🌸 INQUIRY / QUICK ORDER — FIONA FLORIST 🌸*\n\n` +
        `Hello Dhanika! I would like to order the following handmade flowers:\n\n` +
        orderItemsText +
        `\n*Total:* ₹${subtotal}\n\n` +
        `Please confirm flower availability and delivery timeline for Maharashtra. Thank you!`;

      openWhatsAppChat(message);
    });
  }

  // Initial cart render
  renderCart();
});
