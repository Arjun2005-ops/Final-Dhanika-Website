/**
 * Fiona Florist by Dhanika - Scroll Animations & UI Polish
 * Adds IntersectionObserver-based fade-in animations and smooth micro-interactions.
 * Loaded on every page via the shared script tag in each HTML file.
 */

(function () {
  "use strict";

  // =========================================================================
  // 1. INTERSECTION OBSERVER — Scroll-Triggered Fade Animations
  // =========================================================================
  const ANIMATION_CLASS = "ff-animate-in";
  const ANIMATION_DONE_CLASS = "ff-animated";

  // Add base CSS for animation targets via JS to avoid FOUC
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .ff-fade-up {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
                  transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .ff-fade-left {
      opacity: 0;
      transform: translateX(-28px);
      transition: opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
                  transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .ff-fade-right {
      opacity: 0;
      transform: translateX(28px);
      transition: opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
                  transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .ff-scale-in {
      opacity: 0;
      transform: scale(0.92);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .ff-animated {
      opacity: 1 !important;
      transform: none !important;
    }
    /* Staggered delay helpers */
    .ff-delay-1 { transition-delay: 0.1s; }
    .ff-delay-2 { transition-delay: 0.2s; }
    .ff-delay-3 { transition-delay: 0.3s; }
    .ff-delay-4 { transition-delay: 0.4s; }
    .ff-delay-5 { transition-delay: 0.5s; }

    /* Navbar scroll shadow enhancement */
    .navbar-wrapper.scrolled {
      box-shadow: 0 4px 24px rgba(75, 16, 38, 0.12);
    }

    /* Active state for mobile nav links */
    .mobile-nav-links a:hover {
      color: var(--color-burgundy);
      transform: translateX(6px);
      display: block;
    }

    /* Cart count pop animation */
    @keyframes cartPop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.4); }
      100% { transform: scale(1); }
    }
    .cart-count-pop {
      animation: cartPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Product card shimmer loading placeholder */
    .card-placeholder {
      background: linear-gradient(90deg, #f9e5e8 25%, #fff4f4 50%, #f9e5e8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 14px;
      height: 400px;
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }

    /* Smooth image hover zoom in product cards */
    .product-card .card-image-box {
      overflow: hidden;
    }

    /* WhatsApp floating bubble (optional, appended below) */
    .wa-float-btn {
      position: fixed;
      bottom: 82px;
      right: 25px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: #25D366;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
      z-index: 890;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      cursor: pointer;
      border: none;
    }
    .wa-float-btn:hover {
      transform: translateY(-4px) scale(1.08);
      box-shadow: 0 10px 28px rgba(37, 211, 102, 0.55);
    }
    .wa-float-btn svg {
      width: 26px;
      height: 26px;
    }

    /* Responsive image lazy-load fade */
    img[loading="lazy"] {
      transition: opacity 0.4s ease;
    }
  `;
  document.head.appendChild(styleSheet);

  // =========================================================================
  // 2. AUTO-ASSIGN ANIMATION CLASSES TO PAGE ELEMENTS
  // =========================================================================
  function assignAnimations() {
    const config = [
      { selector: ".section-header", cls: "ff-fade-up" },
      { selector: ".product-card",   cls: "ff-fade-up" },
      { selector: ".feature-box",    cls: "ff-fade-up" },
      { selector: ".faq-item",       cls: "ff-fade-up" },
      { selector: ".about-content",  cls: "ff-fade-right" },
      { selector: ".about-image-wrapper", cls: "ff-fade-left" },
      { selector: ".contact-info-card",   cls: "ff-fade-up" },
      { selector: ".guide-step",          cls: "ff-fade-left" },
      { selector: ".step-card",           cls: "ff-fade-left" },
      { selector: ".form-card",           cls: "ff-fade-up" },
      { selector: ".hero-content",        cls: "ff-fade-left" },
      { selector: ".hero-image-container",cls: "ff-fade-right" },
      { selector: ".value-item",          cls: "ff-fade-up" },
    ];

    config.forEach(({ selector, cls }) => {
      document.querySelectorAll(selector).forEach((el, idx) => {
        if (!el.classList.contains("ff-animated")) {
          el.classList.add(cls);
          // Stagger children in grid/list groups
          const delay = Math.min(idx % 4, 5);
          if (delay > 0) el.classList.add(`ff-delay-${delay}`);
        }
      });
    });
  }

  // =========================================================================
  // 3. INTERSECTION OBSERVER INSTANCE
  // =========================================================================
  function initScrollObserver() {
    const animatedEls = document.querySelectorAll(
      ".ff-fade-up, .ff-fade-left, .ff-fade-right, .ff-scale-in"
    );

    if (!("IntersectionObserver" in window) || animatedEls.length === 0) {
      // Fallback: just show everything immediately
      animatedEls.forEach(el => el.classList.add(ANIMATION_DONE_CLASS));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(ANIMATION_DONE_CLASS);
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    animatedEls.forEach(el => observer.observe(el));
  }

  // =========================================================================
  // 4. NAVBAR SCROLL SHADOW
  // =========================================================================
  function initNavbarScroll() {
    const navbar = document.querySelector(".navbar-wrapper");
    if (!navbar) return;

    const onScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // =========================================================================
  // 5. FLOATING WHATSAPP BUBBLE BUTTON
  // =========================================================================
  function injectWhatsAppBubble() {
    // Don't show on contact page (already has prominent WA button)
    if (window.location.pathname.includes("contact.html")) return;

    const btn = document.createElement("button");
    btn.className = "wa-float-btn";
    btn.setAttribute("aria-label", "Chat on WhatsApp");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>`;

    btn.addEventListener("click", () => {
      if (typeof openWhatsAppChat === "function") {
        openWhatsAppChat("Hello Dhanika! I'm browsing Fiona Florist and have a quick question about your handmade flowers. 🌸");
      }
    });

    document.body.appendChild(btn);
  }

  // =========================================================================
  // 6. SMOOTH ACTIVE LINK HIGHLIGHTING (based on current page)
  // =========================================================================
  function highlightActiveNavLink() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link, .mobile-nav-links a").forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.split("?")[0] === current) {
        link.classList.add("active");
      }
    });
  }

  // =========================================================================
  // 7. LAZY IMAGE LOADING OBSERVER (enhanced)
  // =========================================================================
  function initLazyImages() {
    if (!("IntersectionObserver" in window)) return;

    const lazyImages = document.querySelectorAll("img[loading='lazy']");
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.opacity = "1";
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: "100px" });

    lazyImages.forEach(img => {
      img.style.opacity = "0";
      imgObserver.observe(img);
    });
  }

  // =========================================================================
  // 8. KEYBOARD ACCESSIBILITY — Close Menus on Escape Key
  // =========================================================================
  function initKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Close mobile nav
        const mobileNav = document.querySelector(".mobile-nav");
        const backdrop = document.querySelector(".mobile-nav-backdrop");
        const hamburger = document.querySelector(".hamburger-btn");
        if (mobileNav && mobileNav.classList.contains("open")) {
          mobileNav.classList.remove("open");
          if (backdrop) backdrop.classList.remove("open");
          if (hamburger) hamburger.classList.remove("active");
          document.body.style.overflow = "";
        }

        // Close search modal
        const searchModal = document.querySelector(".search-modal");
        if (searchModal && searchModal.classList.contains("open")) {
          searchModal.classList.remove("open");
        }
      }
    });
  }

  // =========================================================================
  // 9. INITIALIZE ALL
  // =========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    assignAnimations();

    // Small delay so DOM is fully painted before observing
    setTimeout(initScrollObserver, 100);

    initNavbarScroll();
    injectWhatsAppBubble();
    highlightActiveNavLink();
    initLazyImages();
    initKeyboardNav();
  });

})();
