/**
 * Fiona Florist by Dhanika - Global JavaScript
 * "Flowers That Never Fade"
 */

// ==========================================================================
// 1. BUSINESS CONFIGURATION (Easily configurable by the store owner)
// ==========================================================================
const STORE_CONFIG = {
  brandName: "Fiona Florist by Dhanika",
  tagline: "Flowers That Never Fade",
  // Verified WhatsApp Business Number in international format without '+' (e.g. 919876543210 for India)
  whatsappNumber: "919307744537",
  businessPhone: "+91 93077 44537",
  businessEmail: "fionaflorist.dhanika@gmail.com",
  instagramUrl: "https://www.instagram.com/fiona_florist._?psln=YWNibWF6cTd3ajV5",
  location: "Maharashtra, India",
  shippingInfo: "Handcrafted & dispatched across Maharashtra (Pune, Mumbai, Nashik, Nagpur & all PIN codes)",
  deliveryFee: 0,
  freeDeliveryThreshold: 0,
  currencySymbol: "₹"
};

// ==========================================================================
// 2. LOCALSTORAGE CART HELPERS
// ==========================================================================
const CART_STORAGE_KEY = "fiona_florist_cart_v1";

function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadges();
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
}

function getCartTotalCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function updateCartBadges() {
  const count = getCartTotalCount();
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach(badge => {
    badge.textContent = count;
    // Tiny pop animation
    badge.style.transform = "scale(1.3)";
    setTimeout(() => {
      badge.style.transform = "scale(1)";
    }, 200);
  });
}

/**
 * Add product with variant to cart
 * Item key is combination of id and variant (e.g. "rose-single_single")
 */
function addToCart(productId, variant = "single", quantity = 1) {
  const product = typeof getProductById === "function" ? getProductById(productId) : null;
  if (!product) {
    showToast("Product details could not be found.", "error");
    return;
  }

  const validVariant = ["single", "double", "triple"].includes(variant) ? variant : "single";
  const unitPrice = product.prices[validVariant] || product.prices.single;
  const cart = getCart();

  const existingIndex = cart.findIndex(
    item => item.productId === productId && item.variant === validVariant
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += Number(quantity);
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      variant: validVariant,
      unitPrice: unitPrice,
      quantity: Number(quantity),
      image: product.image
    });
  }

  saveCart(cart);
  showToast(`Added ${quantity} × ${product.name} (${capitalize(validVariant)}) to your bag! 🌸`);
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================================================
// 3. TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" ? "🌸" : "⚠️";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Trigger entrance transition
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

// ==========================================================================
// 4. WHATSAPP LINK GENERATOR
// ==========================================================================
function openWhatsAppChat(customMessage = "") {
  const text = customMessage || `Hello Fiona Florist! I would like to inquire about your handmade everlasting flowers. 🌸`;
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedText}`;
  window.open(url, "_blank");
}

// ==========================================================================
// 5. DOM INITIALIZATION & EVENT LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Sync cart badge count immediately
  updateCartBadges();

  // Mobile Navigation Toggle
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".mobile-nav");
  const backdrop = document.querySelector(".mobile-nav-backdrop");
  const closeMobileNavBtn = document.querySelector(".close-mobile-nav");

  function openMobileMenu() {
    if (hamburgerBtn) hamburgerBtn.classList.add("active");
    if (mobileNav) mobileNav.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    if (hamburgerBtn) hamburgerBtn.classList.remove("active");
    if (mobileNav) mobileNav.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      if (mobileNav && mobileNav.classList.contains("open")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (closeMobileNavBtn) {
    closeMobileNavBtn.addEventListener("click", closeMobileMenu);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeMobileMenu);
  }

  // Back-to-Top Button
  const backToTopBtn = document.querySelector(".back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // FAQ Accordion Toggle
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (questionBtn) {
      questionBtn.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");
        
        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove("active");
            const ans = other.querySelector(".faq-answer");
            if (ans) ans.style.maxHeight = null;
          }
        });

        if (!isOpen) {
          item.classList.add("active");
          const ans = item.querySelector(".faq-answer");
          if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
        } else {
          item.classList.remove("active");
          const ans = item.querySelector(".faq-answer");
          if (ans) ans.style.maxHeight = null;
        }
      });
    }
  });

  // Global search modal open/close
  const searchTriggers = document.querySelectorAll(".search-trigger-btn");
  const searchModal = document.querySelector(".search-modal");
  const closeSearchBtn = document.querySelector(".close-modal-btn");
  const searchModalInput = document.querySelector(".search-modal-input");

  if (searchModal) {
    searchTriggers.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        searchModal.classList.add("open");
        if (searchModalInput) {
          setTimeout(() => searchModalInput.focus(), 150);
        }
      });
    });

    if (closeSearchBtn) {
      closeSearchBtn.addEventListener("click", () => {
        searchModal.classList.remove("open");
      });
    }

    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove("open");
      }
    });

    if (searchModalInput) {
      searchModalInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const query = searchModalInput.value.trim();
          if (query) {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  }

  // Floating WhatsApp button listeners
  const waButtons = document.querySelectorAll(".trigger-whatsapp-btn");
  waButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const customMsg = btn.getAttribute("data-message") || "";
      openWhatsAppChat(customMsg);
    });
  });

  // Inject Floating WhatsApp Quick-Chat Widget globally
  if (!document.querySelector(".whatsapp-float")) {
    const waFloat = document.createElement("a");
    waFloat.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}`;
    waFloat.target = "_blank";
    waFloat.rel = "noopener noreferrer";
    waFloat.className = "whatsapp-float trigger-whatsapp-btn";
    waFloat.setAttribute("aria-label", "Chat with Dhanika on WhatsApp");
    waFloat.innerHTML = `
      <span class="whatsapp-tooltip">Chat with Dhanika on WhatsApp 🌸</span>
      <svg viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;
    waFloat.addEventListener("click", (e) => {
      e.preventDefault();
      openWhatsAppChat();
    });
    document.body.appendChild(waFloat);
  }
});
