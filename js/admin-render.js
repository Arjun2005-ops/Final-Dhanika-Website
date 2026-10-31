/**
 * Fiona Florist by Dhanika — Admin Content Renderer
 * Reads admin-saved data from localStorage and applies it live to the website frontend.
 * This file is included on all public-facing pages (AFTER products.js, auth.js, main.js).
 */

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // 1. SYNC DYNAMIC PRODUCTS DATA (from admin edits)
  // ============================================================
  if (typeof syncProductsData === "function") {
    syncProductsData();
  }

  // ============================================================
  // 2. APPLY ANNOUNCEMENT BAR EDITS
  // ============================================================
  (function applyAnnouncements() {
    try {
      const raw = localStorage.getItem("fiona_admin_announcements_v1");
      if (!raw) return;
      const data = JSON.parse(raw);
      const topBar = document.querySelector(".top-announcement");
      if (!topBar) return;

      const spans = topBar.querySelectorAll("span");
      const texts = [data.text1, data.text2, data.text3].filter(Boolean);
      if (texts.length === 0) return;

      // Replace span texts in order (spans 1, 3, 5 are text; 2, 4 are separators "•")
      let textIdx = 0;
      spans.forEach(span => {
        if (span.textContent.trim() === "•") return;
        if (textIdx < texts.length) {
          span.textContent = texts[textIdx];
          textIdx++;
        }
      });
    } catch (e) {
      // silent
    }
  })();

  // ============================================================
  // 3. APPLY HERO SECTION EDITS
  // ============================================================
  (function applyHero() {
    try {
      const raw = localStorage.getItem("fiona_admin_hero_v1");
      if (!raw) return;
      const data = JSON.parse(raw);

      const heroSection = document.querySelector(".hero");
      if (!heroSection) return;

      if (data.heading) {
        const h1 = heroSection.querySelector(".heading-primary, h1");
        if (h1) h1.textContent = data.heading;
      }

      if (data.subheading) {
        const desc = heroSection.querySelector(".hero-description, .text-lg");
        if (desc) desc.textContent = data.subheading;
      }

      if (data.badge) {
        const badge = heroSection.querySelector(".hero-badge span, .hero-badge");
        if (badge) badge.textContent = data.badge;
      }

      if (data.btn1Text) {
        const btn1 = heroSection.querySelector(".btn-primary, .hero-cta .btn-primary");
        if (btn1) {
          btn1.textContent = data.btn1Text + " →";
          if (data.btn1Link) btn1.setAttribute("href", data.btn1Link);
        }
      }

      if (data.btn2Text) {
        const btns = heroSection.querySelectorAll(".btn");
        if (btns.length > 1) {
          btns[1].textContent = data.btn2Text;
          if (data.btn2Link) btns[1].setAttribute("href", data.btn2Link);
        }
      }
    } catch (e) {
      // silent
    }
  })();

  // ============================================================
  // 4. INJECT CUSTOM ADMIN SECTIONS (into homepage only)
  // ============================================================
  (function injectCustomSections() {
    // Only inject on index.html / homepage
    const isHomePage = window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("/");

    if (!isHomePage) return;

    try {
      const raw = localStorage.getItem("fiona_admin_sections_v1");
      if (!raw) return;
      const sections = JSON.parse(raw);
      if (!Array.isArray(sections) || sections.length === 0) return;

      const footer = document.querySelector("footer");
      if (!footer) return;

      const wrapper = document.createElement("div");
      wrapper.id = "admin-custom-sections";

      sections.forEach((sec, i) => {
        const section = document.createElement("section");
        section.className = "admin-custom-section";
        section.id = `custom-section-${i}`;
        section.style.cssText = `
          background-color: ${sec.bgColor || "#F9E5E8"};
          color: ${sec.textColor || "#4B1026"};
          padding: 4rem 1.5rem;
          text-align: center;
        `;

        let innerHTML = "";

        if (sec.image) {
          innerHTML += `<div style="margin-bottom:1.5rem;"><img src="${sec.image}" alt="${sec.title}" style="max-width:100%;max-height:320px;border-radius:16px;object-fit:cover;box-shadow:0 8px 32px rgba(0,0,0,0.15);"></div>`;
        }

        innerHTML += `
          <div style="max-width:720px;margin:0 auto;">
            <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2.2rem);font-weight:700;margin-bottom:1rem;">${sec.title}</h2>
        `;

        if (sec.content) {
          innerHTML += `<p style="font-size:1rem;line-height:1.8;opacity:0.88;margin-bottom:1.5rem;">${sec.content}</p>`;
        }

        if (sec.btnText) {
          const link = sec.btnLink || "shop.html";
          innerHTML += `
            <a href="${link}" style="
              display:inline-block;
              padding:0.8rem 2rem;
              background:${sec.textColor || "#4B1026"};
              color:${sec.bgColor || "#F9E5E8"};
              border-radius:999px;
              font-weight:700;
              font-size:0.95rem;
              text-decoration:none;
              transition:transform 0.2s;
              box-shadow:0 4px 16px rgba(0,0,0,0.15);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">${sec.btnText}</a>
          `;
        }

        innerHTML += `</div>`;

        section.innerHTML = innerHTML;
        wrapper.appendChild(section);
      });

      footer.parentNode.insertBefore(wrapper, footer);
    } catch (e) {
      console.error("Error injecting custom sections:", e);
    }
  })();

  // ============================================================
  // 5. SYNC CATEGORY FILTER TABS (Shop & Homepage)
  // ============================================================
  (function syncCategories() {
    try {
      const container = document.querySelector(".category-tabs");
      if (!container) return;

      const categories = typeof getCategories === "function" ? getCategories() : [];
      if (!categories || categories.length === 0) return;

      // Update total products count on "All Items"
      const allBtn = container.querySelector('[data-category="all"]');
      if (allBtn && typeof getAllProducts === "function") {
        const total = getAllProducts().length;
        allBtn.textContent = `All Items (${total})`;
      }

      // Collect existing category tabs in DOM
      const existing = new Set();
      container.querySelectorAll(".filter-btn").forEach(btn => {
        const cat = btn.getAttribute("data-category");
        if (cat) existing.add(cat.toLowerCase());
      });

      // Append new custom categories
      categories.forEach(c => {
        if (!existing.has(c.id.toLowerCase())) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "filter-btn";
          btn.setAttribute("data-category", c.id);
          btn.textContent = (c.icon ? c.icon + " " : "") + c.name;
          container.appendChild(btn);
        }
      });
    } catch (e) {
      console.error("Error syncing categories to filter tabs:", e);
    }
  })();

});

