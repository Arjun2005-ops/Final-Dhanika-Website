/**
 * Fiona Florist by Dhanika - Checkout Page Logic
 * Validates shipping address and generates an organized WhatsApp order request.
 */

document.addEventListener("DOMContentLoaded", () => {
  const checkoutItemsContainer = document.getElementById("checkout-items-summary");
  const checkoutSubtotalEl = document.getElementById("checkout-subtotal");
  const checkoutShippingEl = document.getElementById("checkout-shipping");
  const checkoutTotalEl = document.getElementById("checkout-total");
  const checkoutForm = document.getElementById("checkout-form");
  const emptyCartWarning = document.getElementById("checkout-empty-warning");
  const checkoutFormCard = document.getElementById("checkout-form-card");

  function loadCheckoutSummary() {
    const cart = getCart();

    if (cart.length === 0) {
      if (emptyCartWarning) emptyCartWarning.style.display = "block";
      if (checkoutFormCard) checkoutFormCard.style.display = "none";
      return;
    }

    if (emptyCartWarning) emptyCartWarning.style.display = "none";
    if (checkoutFormCard) checkoutFormCard.style.display = "block";

    let subtotal = 0;

    if (checkoutItemsContainer) {
      checkoutItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border-light); font-size: 0.9rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
              <div>
                <strong style="color: var(--color-deep-burgundy);">${item.name}</strong>
                <div style="font-size: 0.78rem; color: var(--color-burgundy);">${capitalize(item.variant)} × ${item.quantity}</div>
              </div>
            </div>
            <span style="font-weight: 700; color: var(--color-text-main);">₹${itemTotal}</span>
          </div>
        `;
      }).join("");
    }

    if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = `₹${subtotal}`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = `₹${subtotal}`;
  }

  // Handle Form Submission
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const cart = getCart();
      if (cart.length === 0) {
        showToast("Your shopping bag is empty. Please add flowers first.", "error");
        return;
      }

      // Read form fields
      const fullName = document.getElementById("cust-name").value.trim();
      const phone = document.getElementById("cust-phone").value.trim();
      const address = document.getElementById("cust-address").value.trim();
      const city = document.getElementById("cust-city").value.trim();
      const pincode = document.getElementById("cust-pincode").value.trim();
      const notes = document.getElementById("cust-notes").value.trim();

      // Form validation
      if (!fullName) {
        showToast("Please enter your full name.", "error");
        document.getElementById("cust-name").focus();
        return;
      }

      // Phone regex check (minimum 10 digits)
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanedPhone = phone.replace(/[\s\-\+]/g, "").slice(-10);
      if (!phoneRegex.test(cleanedPhone)) {
        showToast("Please enter a valid 10-digit Indian mobile number.", "error");
        document.getElementById("cust-phone").focus();
        return;
      }

      if (!address || address.length < 8) {
        showToast("Please provide a complete delivery address.", "error");
        document.getElementById("cust-address").focus();
        return;
      }

      if (!city) {
        showToast("Please enter your city/town.", "error");
        document.getElementById("cust-city").focus();
        return;
      }

      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(pincode)) {
        showToast("Please enter a valid 6-digit PIN code.", "error");
        document.getElementById("cust-pincode").focus();
        return;
      }

      // Calculate totals
      let subtotal = 0;
      let itemsListFormatted = "";
      cart.forEach((item, index) => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        itemsListFormatted += `${index + 1}. *${item.name}* [${capitalize(item.variant)}]\n   • Quantity: ${item.quantity}\n   • Price: ₹${item.unitPrice} each = ₹${itemTotal}\n`;
      });

      // Construct WhatsApp message
      const orderMessage = 
`*🌸 NEW ORDER REQUEST — FIONA FLORIST 🌸*
_“Flowers That Never Fade”_

*Customer Details:*
• *Name:* ${fullName}
• *Phone:* ${phone}
• *Address:* ${address}
• *City:* ${city}
• *PIN Code:* ${pincode}
${notes ? `• *Special Notes / Gift Card Message:* ${notes}\n` : ""}
*Items Ordered:*
${itemsListFormatted}
*Order Pricing Breakdown:*
• *Total Payable Amount:* *₹${subtotal}*

----------------------------------------
_Note: I understand that the seller will confirm bouquet availability, crafting timeline, and shipping confirmation via WhatsApp._`;

      // Prompt to optionally clear cart or keep
      showToast("Redirecting to WhatsApp to complete your order confirmation...", "success");

      setTimeout(() => {
        openWhatsAppChat(orderMessage);
      }, 600);
    });
  }

  loadCheckoutSummary();
});
