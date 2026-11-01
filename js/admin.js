/**
 * Fiona Florist by Dhanika — Admin Panel Core Logic
 * Admin credentials are stored as SHA-256 hashes — never as plain text.
 * Admin ID and Password are NEVER exposed in the UI or readable source.
 */

// ==========================================================================
// 1. ADMIN AUTH — CREDENTIAL VERIFICATION (hash-only, no plaintext stored)
// ==========================================================================

const ADMIN_CFG = {
  // SHA-256 hash of admin username
  _h1: "71948b926f0b62d460c82a515c1ccd547f46152f45363c82262da39d89e758e9",
  // SHA-256 hash of admin password
  _h2: "f08a723d52b6dc68c1aabd9a973065cc2de0f5bd8ec467ceb254368b330c46a5",
  SESSION_KEY: "fiona_admin_session_v1",
  SECTIONS_KEY: "fiona_admin_sections_v1",
  HERO_KEY: "fiona_admin_hero_v1",
  ANNOUNCEMENTS_KEY: "fiona_admin_announcements_v1",
  CATEGORIES_KEY: "fiona_admin_categories_v1"
};

// SHA-256 using Web Crypto API (async, browser-native)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyAdminCredentials(inputId, inputPwd) {
  const hId = await sha256(inputId.trim());
  const hPwd = await sha256(inputPwd);
  return hId === ADMIN_CFG._h1 && hPwd === ADMIN_CFG._h2;
}

function setAdminSession() {
  const token = "adm_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  sessionStorage.setItem(ADMIN_CFG.SESSION_KEY, token);
}

function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_CFG.SESSION_KEY);
}

function isAdminLoggedIn() {
  return !!sessionStorage.getItem(ADMIN_CFG.SESSION_KEY);
}

// ==========================================================================
// 2. CUSTOM SECTIONS STORAGE
// ==========================================================================

function getCustomSections() {
  try {
    const raw = localStorage.getItem(ADMIN_CFG.SECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomSections(sections) {
  localStorage.setItem(ADMIN_CFG.SECTIONS_KEY, JSON.stringify(sections));
}

function getHeroData() {
  try {
    const raw = localStorage.getItem(ADMIN_CFG.HERO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveHeroData(data) {
  localStorage.setItem(ADMIN_CFG.HERO_KEY, JSON.stringify(data));
}

function getAnnouncements() {
  try {
    const raw = localStorage.getItem(ADMIN_CFG.ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveAnnouncements(data) {
  localStorage.setItem(ADMIN_CFG.ANNOUNCEMENTS_KEY, JSON.stringify(data));
}

// ==========================================================================
// 3. TOAST (reuse from main.js or fallback)
// ==========================================================================

function adminToast(msg, type = "success") {
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "⚠️";
  const existing = document.querySelector(".admin-toast-wrap");
  let wrap = existing;
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "admin-toast-wrap";
    document.body.appendChild(wrap);
  }
  const toast = document.createElement("div");
  toast.className = `admin-toast admin-toast-${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  wrap.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// ==========================================================================
// 4. IMAGE ENCODING HELPER (Base64 for localStorage)
// ==========================================================================

function encodeFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

// ==========================================================================
// 5. PRODUCT MANAGEMENT (CRUD)
// ==========================================================================

function renderAdminProducts() {
  const grid = document.getElementById("admin-products-grid");
  if (!grid) return;

  const products = typeof syncProductsData === "function" ? syncProductsData() : [];

  if (products.length === 0) {
    grid.innerHTML = `<div class="admin-empty-state">No products yet. Add your first product below! 🌸</div>`;
    return;
  }

  grid.innerHTML = products.map((p, idx) => `
    <div class="admin-product-card" data-id="${p.id}">
      <div class="admin-product-thumb">
        ${p.video
          ? `<video src="${p.video}" class="admin-product-img" muted playsinline loop></video>`
          : `<img src="${p.image || 'assets/logo/logo.jpeg'}" alt="${p.name}" class="admin-product-img">`
        }
        ${p.badge ? `<span class="admin-badge-pill">${p.badge}</span>` : ""}
      </div>
      <div class="admin-product-info">
        <h4>${p.name}</h4>
        <span class="admin-tag">${p.category} · ${p.type}</span>
        <div class="admin-price-row">
          <span>Single: ₹${p.prices.single}</span>
          <span>Double: ₹${p.prices.double}</span>
          <span>Triple: ₹${p.prices.triple}</span>
        </div>
        <p class="admin-desc-preview">${(p.description || "").slice(0, 80)}${(p.description || "").length > 80 ? "…" : ""}</p>
      </div>
      <div class="admin-product-actions">
        <button type="button" class="admin-btn-edit" onclick="openEditProductModal('${p.id}')">✏️ Edit</button>
        <button type="button" class="admin-btn-delete" onclick="deleteProduct('${p.id}')">🗑️ Delete</button>
      </div>
    </div>
  `).join("");
}

function deleteProduct(productId) {
  if (!confirm(`Delete this product? This cannot be undone.`)) return;
  const products = syncProductsData();
  const updated = products.filter(p => p.id !== productId);
  saveProductsData(updated);
  renderAdminProducts();
  adminToast("Product deleted.", "error");
}

function generateProductId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
}

// ==========================================================================
// 5B. CATEGORY MANAGEMENT
// ==========================================================================

function populateCategorySelect(selectedId = null) {
  const sel = document.getElementById("pf-category");
  if (!sel) return;
  const categories = typeof getCategories === "function" ? getCategories() : [];
  sel.innerHTML = categories.map(c => `
    <option value="${c.id}" ${selectedId && selectedId.toLowerCase() === c.id.toLowerCase() ? "selected" : ""}>
      ${c.icon ? c.icon + " " : ""}${c.name}
    </option>
  `).join("");
}

function renderAdminCategories() {
  const listEl = document.getElementById("admin-categories-list");
  const countEl = document.getElementById("cat-count");
  if (!listEl) return;

  const categories = typeof getCategories === "function" ? getCategories() : [];
  const products = typeof syncProductsData === "function" ? syncProductsData() : [];

  if (countEl) countEl.textContent = categories.length;

  if (categories.length === 0) {
    listEl.innerHTML = `<div class="admin-empty-state">No categories found.</div>`;
    return;
  }

  // Count items per category
  const counts = {};
  products.forEach(p => {
    const cat = (p.category || "").toLowerCase();
    counts[cat] = (counts[cat] || 0) + 1;
  });

  listEl.innerHTML = categories.map(c => {
    const count = counts[c.id.toLowerCase()] || 0;
    return `
      <div class="admin-cat-card" data-cat-id="${c.id}">
        <div class="admin-cat-main">
          <div class="admin-cat-icon">${c.icon || "🌸"}</div>
          <div class="admin-cat-details">
            <h4>
              ${c.name}
              ${c.isDefault ? `<span class="admin-badge-default">Default</span>` : `<span class="admin-badge-default" style="background:rgba(143,23,60,0.2);color:var(--adm-accent);">Custom</span>`}
            </h4>
            <span class="admin-cat-slug">#${c.id}</span>
          </div>
        </div>
        <div class="admin-cat-meta">
          <span class="admin-cat-count">${count} ${count === 1 ? "product" : "products"}</span>
          ${!c.isDefault ? `
            <button type="button" class="admin-btn-delete" style="padding:0.35rem 0.65rem;font-size:0.75rem;" onclick="deleteCustomCategory('${c.id}')" title="Delete category">🗑️</button>
          ` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("cf-name");
  const iconInput = document.getElementById("cf-icon");
  const slugInput = document.getElementById("cf-slug");

  const name = nameInput ? nameInput.value.trim() : "";
  const icon = iconInput ? iconInput.value.trim() : "";
  let slug = slugInput ? slugInput.value.trim().toLowerCase() : "";

  if (!name) { adminToast("Category name is required.", "error"); return; }

  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  } else {
    slug = slug.replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
  }

  if (!slug) { adminToast("Invalid category slug.", "error"); return; }

  const categories = typeof getCategories === "function" ? getCategories() : [];

  // Check for duplicate slug
  if (categories.some(c => c.id.toLowerCase() === slug.toLowerCase())) {
    adminToast(`A category with slug "${slug}" already exists.`, "error");
    return;
  }

  const newCat = {
    id: slug,
    name: name,
    icon: icon || "🌸",
    isDefault: false
  };

  categories.push(newCat);
  if (typeof saveCategories === "function") {
    saveCategories(categories);
  }

  // Clear form
  if (nameInput) nameInput.value = "";
  if (iconInput) iconInput.value = "";
  if (slugInput) slugInput.value = "";

  renderAdminCategories();
  populateCategorySelect(newCat.id);
  adminToast(`Category "${name}" created successfully! 🌸`);
}

function deleteCustomCategory(catId) {
  const categories = typeof getCategories === "function" ? getCategories() : [];
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;

  if (cat.isDefault) {
    adminToast("Default categories cannot be deleted.", "error");
    return;
  }

  const products = typeof syncProductsData === "function" ? syncProductsData() : [];
  const assigned = products.filter(p => (p.category || "").toLowerCase() === catId.toLowerCase());

  let confirmMsg = `Delete category "${cat.name}"?`;
  if (assigned.length > 0) {
    confirmMsg += `\n\n⚠️ Warning: ${assigned.length} product(s) currently belong to this category!`;
  }

  if (!confirm(confirmMsg)) return;

  const updated = categories.filter(c => c.id !== catId);
  if (typeof saveCategories === "function") {
    saveCategories(updated);
  }

  renderAdminCategories();
  populateCategorySelect();
  adminToast(`Category "${cat.name}" deleted.`, "error");
}

function quickAddCategoryPrompt() {
  const name = prompt("Enter new Category Name (e.g. Tulips, Gift Hampers):");
  if (!name || !name.trim()) return;

  const cleanName = name.trim();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const categories = typeof getCategories === "function" ? getCategories() : [];
  const existing = categories.find(c => c.id.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    adminToast(`Category "${existing.name}" already exists. Selected!`);
    populateCategorySelect(existing.id);
    return;
  }

  const newCat = {
    id: slug,
    name: cleanName,
    icon: "🌸",
    isDefault: false
  };

  categories.push(newCat);
  if (typeof saveCategories === "function") {
    saveCategories(categories);
  }

  renderAdminCategories();
  populateCategorySelect(slug);
  adminToast(`Category "${cleanName}" created and selected! 🌸`);
}

// ==========================================================================
// 6. ADD / EDIT PRODUCT MODAL
// ==========================================================================

function openAddProductModal() {
  const modal = document.getElementById("admin-product-modal");
  if (!modal) return;
  document.getElementById("product-modal-title").textContent = "➕ Add New Product";
  document.getElementById("product-form").reset();
  document.getElementById("pf-product-id").value = "";
  populateCategorySelect();
  document.getElementById("pf-img-preview").src = "";
  document.getElementById("pf-img-preview").style.display = "none";
  document.getElementById("pf-video-preview").src = "";
  document.getElementById("pf-video-preview").style.display = "none";
  document.getElementById("pf-current-media").textContent = "";
  modal.classList.add("open");
}

function openEditProductModal(productId) {
  const modal = document.getElementById("admin-product-modal");
  if (!modal) return;
  const p = syncProductsData().find(pr => pr.id === productId);
  if (!p) { adminToast("Product not found", "error"); return; }

  document.getElementById("product-modal-title").textContent = "✏️ Edit Product";
  document.getElementById("pf-product-id").value = p.id;
  document.getElementById("pf-name").value = p.name || "";
  populateCategorySelect(p.category || "bouquets");
  document.getElementById("pf-type").value = p.type || "bouquet";
  document.getElementById("pf-badge").value = p.badge || "";
  document.getElementById("pf-description").value = p.description || "";
  document.getElementById("pf-price-single").value = p.prices?.single || "";
  document.getElementById("pf-price-double").value = p.prices?.double || "";
  document.getElementById("pf-price-triple").value = p.prices?.triple || "";
  document.getElementById("pf-orig-single").value = p.originalPrices?.single || "";
  document.getElementById("pf-orig-double").value = p.originalPrices?.double || "";
  document.getElementById("pf-orig-triple").value = p.originalPrices?.triple || "";

  // Show existing media
  const preview = document.getElementById("pf-img-preview");
  const vidPreview = document.getElementById("pf-video-preview");
  const currentMedia = document.getElementById("pf-current-media");
  if (p.video) {
    vidPreview.src = p.video;
    vidPreview.style.display = "block";
    preview.style.display = "none";
    currentMedia.textContent = "Current: video attached";
  } else if (p.image) {
    preview.src = p.image;
    preview.style.display = "block";
    vidPreview.style.display = "none";
    currentMedia.textContent = "Current: " + (p.image.startsWith("data:") ? "uploaded image" : p.image);
  } else {
    preview.style.display = "none";
    vidPreview.style.display = "none";
    currentMedia.textContent = "";
  }

  modal.classList.add("open");
}

function closeProductModal() {
  const modal = document.getElementById("admin-product-modal");
  if (modal) modal.classList.remove("open");
}

async function handleProductFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("pf-product-id").value.trim();
  const name = document.getElementById("pf-name").value.trim();
  const category = document.getElementById("pf-category").value;
  const type = document.getElementById("pf-type").value;
  const badge = document.getElementById("pf-badge").value.trim();
  const description = document.getElementById("pf-description").value.trim();
  const priceSingle = parseFloat(document.getElementById("pf-price-single").value) || 0;
  const priceDouble = parseFloat(document.getElementById("pf-price-double").value) || 0;
  const priceTriple = parseFloat(document.getElementById("pf-price-triple").value) || 0;
  const origSingle = parseFloat(document.getElementById("pf-orig-single").value) || priceSingle;
  const origDouble = parseFloat(document.getElementById("pf-orig-double").value) || priceDouble;
  const origTriple = parseFloat(document.getElementById("pf-orig-triple").value) || priceTriple;

  if (!name) { adminToast("Product name is required.", "error"); return; }
  if (!priceSingle) { adminToast("Single price is required.", "error"); return; }
  if (!description) { adminToast("Description is required.", "error"); return; }

  const products = syncProductsData();
  const submitBtn = document.getElementById("pf-submit-btn");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Saving…"; }

  let imageData = null;
  let videoData = null;

  // Process image upload
  const imgFile = document.getElementById("pf-image").files[0];
  if (imgFile) {
    try {
      imageData = await encodeFileToBase64(imgFile);
    } catch (err) {
      adminToast("Image upload failed. Try a smaller file.", "error");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save Product"; }
      return;
    }
  }

  // Process video upload
  const vidFile = document.getElementById("pf-video").files[0];
  if (vidFile) {
    try {
      videoData = await encodeFileToBase64(vidFile);
    } catch (err) {
      adminToast("Video upload failed. Try a smaller file.", "error");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save Product"; }
      return;
    }
  }

  if (id) {
    // EDIT existing
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) { adminToast("Product not found.", "error"); return; }
    const existing = products[idx];
    products[idx] = {
      ...existing,
      name, category, type, badge, description,
      prices: { single: priceSingle, double: priceDouble || priceSingle * 1.9, triple: priceTriple || priceSingle * 2.7 },
      originalPrices: { single: origSingle, double: origDouble, triple: origTriple },
      ...(imageData ? { image: imageData, video: null } : {}),
      ...(videoData ? { video: videoData, image: existing.image } : {}),
    };
    adminToast(`"${name}" updated! ✅`, "success");
  } else {
    // ADD new
    const newId = generateProductId(name);
    const existingProduct = products.find(p => p.name === name);
    if (existingProduct) { adminToast("A product with this name already exists.", "error"); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save Product"; } return; }

    const newProduct = {
      id: newId,
      name, category, type,
      badge: badge || null,
      description,
      image: imageData || "assets/logo/logo.jpeg",
      video: videoData || null,
      prices: { single: priceSingle, double: priceDouble || Math.round(priceSingle * 1.9), triple: priceTriple || Math.round(priceSingle * 2.7) },
      originalPrices: { single: origSingle, double: origDouble || Math.round(origSingle * 1.9), triple: origTriple || Math.round(origSingle * 2.7) },
      rating: 4.8,
      reviewsCount: 0,
      addedByAdmin: true
    };
    products.push(newProduct);
    adminToast(`"${name}" added! 🌸`, "success");
  }

  saveProductsData(products);
  closeProductModal();
  renderAdminProducts();
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save Product"; }
}

// ==========================================================================
// 7. CUSTOM SECTIONS MANAGEMENT
// ==========================================================================

function renderCustomSections() {
  const container = document.getElementById("admin-sections-list");
  if (!container) return;
  const sections = getCustomSections();
  if (sections.length === 0) {
    container.innerHTML = `<div class="admin-empty-state">No custom sections added yet.</div>`;
    return;
  }
  container.innerHTML = sections.map((sec, i) => `
    <div class="admin-section-card" data-idx="${i}">
      <div class="admin-section-info">
        <h4>${sec.title}</h4>
        <span class="admin-tag">${sec.type === "banner" ? "🖼️ Banner/Promo" : sec.type === "text" ? "📝 Info Block" : sec.type === "media" ? "🎬 Media Showcase" : "📦 Custom"}</span>
        <p>${(sec.content || "").slice(0, 80)}${(sec.content || "").length > 80 ? "…" : ""}</p>
      </div>
      <div class="admin-product-actions">
        <button type="button" class="admin-btn-edit" onclick="editCustomSection(${i})">✏️ Edit</button>
        <button type="button" class="admin-btn-delete" onclick="deleteCustomSection(${i})">🗑️ Delete</button>
      </div>
    </div>
  `).join("");
}

function deleteCustomSection(idx) {
  if (!confirm("Delete this section?")) return;
  const sections = getCustomSections();
  sections.splice(idx, 1);
  saveCustomSections(sections);
  renderCustomSections();
  adminToast("Section deleted.", "error");
}

function editCustomSection(idx) {
  const sections = getCustomSections();
  const sec = sections[idx];
  if (!sec) return;
  openSectionModal(sec, idx);
}

function openSectionModal(data = null, editIdx = null) {
  const modal = document.getElementById("admin-section-modal");
  if (!modal) return;
  const form = document.getElementById("section-form");
  form.reset();
  document.getElementById("section-edit-idx").value = editIdx !== null ? editIdx : "";
  document.getElementById("section-modal-title").textContent = editIdx !== null ? "✏️ Edit Section" : "➕ Add New Section";

  if (data) {
    document.getElementById("sf-title").value = data.title || "";
    document.getElementById("sf-type").value = data.type || "banner";
    document.getElementById("sf-content").value = data.content || "";
    document.getElementById("sf-btn-text").value = data.btnText || "";
    document.getElementById("sf-btn-link").value = data.btnLink || "";
    document.getElementById("sf-bg-color").value = data.bgColor || "#F9E5E8";
    document.getElementById("sf-text-color").value = data.textColor || "#4B1026";
  }
  modal.classList.add("open");
}

function closeSectionModal() {
  const modal = document.getElementById("admin-section-modal");
  if (modal) modal.classList.remove("open");
}

async function handleSectionFormSubmit(e) {
  e.preventDefault();
  const editIdx = document.getElementById("section-edit-idx").value;
  const title = document.getElementById("sf-title").value.trim();
  const type = document.getElementById("sf-type").value;
  const content = document.getElementById("sf-content").value.trim();
  const btnText = document.getElementById("sf-btn-text").value.trim();
  const btnLink = document.getElementById("sf-btn-link").value.trim();
  const bgColor = document.getElementById("sf-bg-color").value;
  const textColor = document.getElementById("sf-text-color").value;

  if (!title) { adminToast("Section title required.", "error"); return; }

  let imageData = null;
  const imgFile = document.getElementById("sf-image").files[0];
  if (imgFile) {
    try {
      imageData = await encodeFileToBase64(imgFile);
    } catch (err) {
      adminToast("Image upload failed.", "error"); return;
    }
  }

  const sections = getCustomSections();
  const secObj = {
    title, type, content, btnText, btnLink, bgColor, textColor,
    ...(imageData ? { image: imageData } : {}),
    updatedAt: new Date().toISOString()
  };

  if (editIdx !== "") {
    sections[parseInt(editIdx)] = { ...sections[parseInt(editIdx)], ...secObj };
    adminToast("Section updated! ✅");
  } else {
    sections.push(secObj);
    adminToast("Section added! 🌸");
  }

  saveCustomSections(sections);
  closeSectionModal();
  renderCustomSections();
}

// ==========================================================================
// 8. HERO & ANNOUNCEMENTS EDIT
// ==========================================================================

function renderHeroEditor() {
  const data = getHeroData();
  if (!data) return;
  const el = id => document.getElementById(id);
  if (el("he-heading")) el("he-heading").value = data.heading || "";
  if (el("he-subheading")) el("he-subheading").value = data.subheading || "";
  if (el("he-badge")) el("he-badge").value = data.badge || "";
  if (el("he-btn1-text")) el("he-btn1-text").value = data.btn1Text || "";
  if (el("he-btn1-link")) el("he-btn1-link").value = data.btn1Link || "";
  if (el("he-btn2-text")) el("he-btn2-text").value = data.btn2Text || "";
  if (el("he-btn2-link")) el("he-btn2-link").value = data.btn2Link || "";
}

function handleHeroFormSubmit(e) {
  e.preventDefault();
  const el = id => document.getElementById(id);
  const data = {
    heading: el("he-heading").value.trim(),
    subheading: el("he-subheading").value.trim(),
    badge: el("he-badge").value.trim(),
    btn1Text: el("he-btn1-text").value.trim(),
    btn1Link: el("he-btn1-link").value.trim(),
    btn2Text: el("he-btn2-text").value.trim(),
    btn2Link: el("he-btn2-link").value.trim(),
  };
  saveHeroData(data);
  adminToast("Hero section updated! 🌸");
}

function handleAnnouncementSubmit(e) {
  e.preventDefault();
  const el = id => document.getElementById(id);
  const data = {
    text1: el("ann-text1").value.trim(),
    text2: el("ann-text2").value.trim(),
    text3: el("ann-text3").value.trim(),
  };
  saveAnnouncements(data);
  adminToast("Announcement bar updated! 🌸");
}

function renderAnnouncementEditor() {
  const data = getAnnouncements();
  if (!data) return;
  const el = id => document.getElementById(id);
  if (el("ann-text1")) el("ann-text1").value = data.text1 || "";
  if (el("ann-text2")) el("ann-text2").value = data.text2 || "";
  if (el("ann-text3")) el("ann-text3").value = data.text3 || "";
}

// ==========================================================================
// 9. TAB NAVIGATION
// ==========================================================================

function switchAdminTab(tabName) {
  document.querySelectorAll(".admin-tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
  const panel = document.getElementById(`admin-panel-${tabName}`);
  const btn = document.querySelector(`[data-admintab="${tabName}"]`);
  if (panel) panel.classList.add("active");
  if (btn) btn.classList.add("active");

  // Refresh respective panel
  if (tabName === "products") renderAdminProducts();
  if (tabName === "categories") renderAdminCategories();
  if (tabName === "sections") renderCustomSections();
  if (tabName === "hero") renderHeroEditor();
  if (tabName === "announcements") renderAnnouncementEditor();
}

// ==========================================================================
// 10. LOGIN PAGE LOGIC
// ==========================================================================

async function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const idInput = document.getElementById("admin-login-id");
  const pwdInput = document.getElementById("admin-login-pwd");
  const errBox = document.getElementById("admin-login-error");
  const btn = document.getElementById("admin-login-btn");

  const inputId = idInput ? idInput.value : "";
  const inputPwd = pwdInput ? pwdInput.value : "";

  if (errBox) { errBox.textContent = ""; errBox.style.display = "none"; }
  if (btn) { btn.disabled = true; btn.textContent = "Verifying…"; }

  try {
    const ok = await verifyAdminCredentials(inputId, inputPwd);
    if (ok) {
      setAdminSession();
      window.location.href = "admin.html#dashboard";
      window.location.reload();
    } else {
      if (errBox) {
        errBox.textContent = "Incorrect credentials. Access denied.";
        errBox.style.display = "block";
      }
      adminToast("Access denied. Incorrect credentials.", "error");
    }
  } catch (err) {
    console.error("Login error:", err);
    if (errBox) { errBox.textContent = "Login error. Try again."; errBox.style.display = "block"; }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "🔐 Enter Admin Panel"; }
    if (idInput) idInput.value = "";
    if (pwdInput) pwdInput.value = "";
  }
}

function adminLogout() {
  clearAdminSession();
  adminToast("Logged out from Admin Panel.", "error");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

// ==========================================================================
// 11. LIVE PREVIEW - image/video selection
// ==========================================================================

function previewMedia(inputId, imgPreviewId, vidPreviewId) {
  const input = document.getElementById(inputId);
  const imgEl = document.getElementById(imgPreviewId);
  const vidEl = document.getElementById(vidPreviewId);
  if (!input || !input.files || !input.files[0]) return;

  const file = input.files[0];
  const url = URL.createObjectURL(file);

  if (file.type.startsWith("video/")) {
    if (vidEl) { vidEl.src = url; vidEl.style.display = "block"; }
    if (imgEl) imgEl.style.display = "none";
  } else {
    if (imgEl) { imgEl.src = url; imgEl.style.display = "block"; }
    if (vidEl) vidEl.style.display = "none";
  }
}

// ==========================================================================
// 12. DOM READY — BOOT
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // If on admin.html
  if (!document.getElementById("admin-root")) return;

  // Check if ?logout=1 in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("logout") === "1") {
    clearAdminSession();
  }

  // Guard: if not logged in, show login screen, hide dashboard
  const loginScreen = document.getElementById("admin-login-screen");
  const dashScreen = document.getElementById("admin-dashboard");

  if (!isAdminLoggedIn()) {
    if (loginScreen) loginScreen.style.display = "flex";
    if (dashScreen) dashScreen.style.display = "none";
    const idInput = document.getElementById("admin-login-id");
    if (idInput) setTimeout(() => idInput.focus(), 150);
  } else {
    if (loginScreen) loginScreen.style.display = "none";
    if (dashScreen) dashScreen.style.display = "block";

    // Init first tab
    switchAdminTab("products");

    // Tab button listeners
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-admintab");
        if (tab) switchAdminTab(tab);
      });
    });

    // Product form
    const productForm = document.getElementById("product-form");
    if (productForm) productForm.addEventListener("submit", handleProductFormSubmit);

    // Category form
    const categoryForm = document.getElementById("category-form");
    if (categoryForm) categoryForm.addEventListener("submit", handleCategoryFormSubmit);

    // Auto-generate slug from name input
    const cfName = document.getElementById("cf-name");
    const cfSlug = document.getElementById("cf-slug");
    if (cfName && cfSlug) {
      cfName.addEventListener("input", () => {
        if (!cfSlug.dataset.manual) {
          cfSlug.value = cfName.value.toLowerCase().trim()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
      });
      cfSlug.addEventListener("input", () => {
        cfSlug.dataset.manual = "true";
      });
    }

    // Populate category dropdown initially
    populateCategorySelect();

    // Section form
    const sectionForm = document.getElementById("section-form");
    if (sectionForm) sectionForm.addEventListener("submit", handleSectionFormSubmit);

    // Hero form
    const heroForm = document.getElementById("hero-form");
    if (heroForm) heroForm.addEventListener("submit", handleHeroFormSubmit);

    // Announcement form
    const annForm = document.getElementById("announcement-form");
    if (annForm) annForm.addEventListener("submit", handleAnnouncementSubmit);

    // Media preview listeners
    const imgInput = document.getElementById("pf-image");
    if (imgInput) imgInput.addEventListener("change", () => previewMedia("pf-image", "pf-img-preview", "pf-video-preview"));

    const vidInput = document.getElementById("pf-video");
    if (vidInput) vidInput.addEventListener("change", () => previewMedia("pf-video", "pf-img-preview", "pf-video-preview"));

    const sfImg = document.getElementById("sf-image");
    if (sfImg) sfImg.addEventListener("change", () => previewMedia("sf-image", "sf-img-preview", null));

    // Logout
    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", adminLogout);

    // Reset products to default
    const resetBtn = document.getElementById("admin-reset-products-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset ALL products to original defaults? This will remove all admin-added products!")) {
          resetProductsToDefault();
          renderAdminProducts();
          adminToast("Products reset to defaults.", "error");
        }
      });
    }
  }

  // Login form
  const loginForm = document.getElementById("admin-login-form");
  if (loginForm) loginForm.addEventListener("submit", handleAdminLoginSubmit);

  // Password toggle on login screen
  const togglePwd = document.getElementById("admin-pwd-toggle");
  if (togglePwd) {
    togglePwd.addEventListener("click", () => {
      const pwd = document.getElementById("admin-login-pwd");
      if (pwd) {
        pwd.type = pwd.type === "password" ? "text" : "password";
        togglePwd.textContent = pwd.type === "password" ? "👁️" : "🙈";
      }
    });
  }
});
