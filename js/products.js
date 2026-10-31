/**
 * Fiona Florist by Dhanika - Products Catalog Data
 * "Flowers That Never Fade"
 * All prices in Indian Rupees (INR)
 * Authentic Handcrafted Pipe-Cleaner Blooms & Accessories
 */

const DEFAULT_PRODUCTS_CATALOG = [
  {
    id: "special-bouquet",
    name: "Special Floral Bouquet",
    category: "bouquets",
    type: "bouquet",
    badge: "Bestseller",
    description: "Grand handcrafted pipe-cleaner floral bouquet with multiple exquisite blooms, wrapped in frosted floral wrap with a satin ribbon.",
    image: "assets/images/Speical bouquant 550.jpeg",
    prices: {
      single: 550,
      double: 1050,
      triple: 1550
    },
    originalPrices: {
      single: 680,
      double: 1280,
      triple: 1880
    },
    rating: 5.0,
    reviewsCount: 72
  },
  {
    id: "birthday-quotes-bouquet",
    name: "Birthday Quotes Keepsake Bouquet",
    category: "bouquets",
    type: "bouquet",
    badge: "Special Edition",
    description: "Heartfelt birthday celebration floral arrangement featuring cheerful pipe-cleaner blooms and an inspiring birthday quote card.",
    image: "assets/images/birthday quaoutes 500.jpeg",
    prices: {
      single: 500,
      double: 950,
      triple: 1400
    },
    originalPrices: {
      single: 620,
      double: 1150,
      triple: 1700
    },
    rating: 4.9,
    reviewsCount: 58
  },
  {
    id: "mini-bouquet",
    name: "Mini Everlasting Bouquet",
    category: "bouquets",
    type: "bouquet",
    badge: "Popular",
    description: "Adorable compact pipe-cleaner floral bouquet in pastel wrapper. The perfect little desk accent or sweet friendly gift.",
    image: "assets/images/mini boquant 120.jpeg",
    prices: {
      single: 120,
      double: 230,
      triple: 330
    },
    originalPrices: {
      single: 150,
      double: 280,
      triple: 400
    },
    rating: 4.8,
    reviewsCount: 41
  },
  {
    id: "red-rose",
    name: "Classic Velvet Red Rose",
    category: "roses",
    type: "single",
    badge: "Romantic",
    description: "Intricately twisted crimson chenille petals with natural green stem and leaves. The everlasting symbol of love that never wilts.",
    image: "assets/images/rose 120.jpeg",
    prices: {
      single: 120,
      double: 230,
      triple: 330
    },
    originalPrices: {
      single: 150,
      double: 280,
      triple: 400
    },
    rating: 4.9,
    reviewsCount: 64
  },
  {
    id: "pink-rose",
    name: "Pastel Pink Rose",
    category: "roses",
    type: "single",
    badge: "Trending",
    description: "Delicate baby-pink handcrafted pipe-cleaner rose blooming with sweetness and elegance. Soft to the touch and permanently fresh.",
    image: "assets/images/pink rose 120.jpeg",
    prices: {
      single: 120,
      double: 230,
      triple: 330
    },
    originalPrices: {
      single: 150,
      double: 280,
      triple: 400
    },
    rating: 4.9,
    reviewsCount: 49
  },
  {
    id: "sunflower-stem",
    name: "Radiant Sunflower",
    category: "sunflowers",
    type: "single",
    badge: "Bestseller",
    description: "Cheerful handmade pipe-cleaner sunflower with textured dark chocolate seed center and radiant golden-yellow petals.",
    image: "assets/images/sunflower 150.jpeg",
    prices: {
      single: 150,
      double: 280,
      triple: 390
    },
    originalPrices: {
      single: 190,
      double: 350,
      triple: 480
    },
    rating: 5.0,
    reviewsCount: 53
  },
  {
    id: "hair-sunflower",
    name: "Sunflower Hair Accessory",
    category: "accessories",
    type: "accessory",
    badge: "New Arrival",
    description: "Charming handcrafted sunflower hair accessory crafted with velvety chenille stems. A joyful floral touch for any hairstyle.",
    image: "assets/images/hair sunflower 150.jpeg",
    prices: {
      single: 150,
      double: 280,
      triple: 390
    },
    originalPrices: {
      single: 190,
      double: 350,
      triple: 480
    },
    rating: 4.8,
    reviewsCount: 27
  },
  {
    id: "white-lily",
    name: "Pure White Lily",
    category: "flowers",
    type: "single",
    badge: "Artisanal",
    description: "Graceful white pipe-cleaner lily with elongated flared petals and delicate stamen accents, symbolizing peace and purity.",
    image: "assets/images/white 150.jpeg",
    prices: {
      single: 150,
      double: 280,
      triple: 390
    },
    originalPrices: {
      single: 190,
      double: 350,
      triple: 480
    },
    rating: 4.8,
    reviewsCount: 33
  },
  {
    id: "pink-blossom",
    name: "Blush Pink Blossom",
    category: "flowers",
    type: "single",
    badge: "Handcrafted",
    description: "Sweet pink floral stem handcrafted with fluffy pipe cleaners and leafy green sepals. Ideal for single bud vases or bouquets.",
    image: "assets/images/pink flower 120.jpeg",
    prices: {
      single: 120,
      double: 230,
      triple: 330
    },
    originalPrices: {
      single: 150,
      double: 280,
      triple: 400
    },
    rating: 4.7,
    reviewsCount: 26
  },
  {
    id: "red-blossom",
    name: "Scarlet Red Blossom",
    category: "flowers",
    type: "single",
    badge: "Vibrant",
    description: "Striking scarlet floral stem shaped with rich velvety chenille stems, creating a bold, charming everlasting accent.",
    image: "assets/images/red flower 130.jpeg",
    prices: {
      single: 130,
      double: 250,
      triple: 360
    },
    originalPrices: {
      single: 160,
      double: 300,
      triple: 440
    },
    rating: 4.8,
    reviewsCount: 31
  },
  {
    id: "butterfly-keychain",
    name: "Butterfly Charm Keychain",
    category: "keychains",
    type: "keychain",
    badge: "Handmade Charm",
    description: "Whimsical handcrafted butterfly keychain sculpted with colorful craft stems and durable key ring. A delightful bag charm.",
    image: "assets/images/butterfly key chain 70.jpeg",
    prices: {
      single: 70,
      double: 130,
      triple: 185
    },
    originalPrices: {
      single: 95,
      double: 170,
      triple: 240
    },
    rating: 4.9,
    reviewsCount: 45
  },
  {
    id: "flower-keychain",
    name: "Floral Blossom Keychain",
    category: "keychains",
    type: "keychain",
    badge: "Cute Gift",
    description: "Miniature handcrafted flower keychain that keeps a lovely everlasting bloom attached to your keys or backpack.",
    image: "assets/images/flower key chain 60.jpeg",
    prices: {
      single: 60,
      double: 110,
      triple: 160
    },
    originalPrices: {
      single: 85,
      double: 150,
      triple: 220
    },
    rating: 4.8,
    reviewsCount: 38
  },
  {
    id: "spider-keychain",
    name: "Spider Charm Keychain",
    category: "keychains",
    type: "keychain",
    badge: "Unique",
    description: "Creative handmade spider keychain crafted with flexible chenille stems and sturdy keyring. A playful novelty accessory.",
    image: "assets/images/spider key chan 60.jpeg",
    prices: {
      single: 60,
      double: 110,
      triple: 160
    },
    originalPrices: {
      single: 85,
      double: 150,
      triple: 220
    },
    rating: 4.7,
    reviewsCount: 22
  },
  {
    id: "pastel-keychain",
    name: "Handcrafted Pastel Keychain",
    category: "keychains",
    type: "keychain",
    badge: "Artisanal",
    description: "Artisanal handmade keychain with soft chenille detailing. Sturdy hardware attached, ready to accessorize your daily carry.",
    image: "assets/images/key chain 50.jpeg",
    prices: {
      single: 50,
      double: 95,
      triple: 135
    },
    originalPrices: {
      single: 70,
      double: 130,
      triple: 185
    },
    rating: 4.8,
    reviewsCount: 36
  },
  {
    id: "heart-keychain",
    name: "Sweet Heart Keychain",
    category: "keychains",
    type: "keychain",
    badge: "Pocket Love",
    description: "Cute handmade plush heart keychain in pastel tones. Light, soft, and a thoughtful little token of affection.",
    image: "assets/images/heart key chain 40 .jpeg",
    prices: {
      single: 40,
      double: 75,
      triple: 110
    },
    originalPrices: {
      single: 60,
      double: 110,
      triple: 160
    },
    rating: 4.9,
    reviewsCount: 54
  }
];

// Global dynamic catalog
let PRODUCTS_DATA = [...DEFAULT_PRODUCTS_CATALOG];

// ==========================================================================
// CATEGORIES DATA & SYNC
// ==========================================================================
const DEFAULT_CATEGORIES = [
  { id: "bouquets", name: "Bouquets", icon: "💐", isDefault: true },
  { id: "roses", name: "Roses", icon: "🌹", isDefault: true },
  { id: "sunflowers", name: "Sunflowers", icon: "🌻", isDefault: true },
  { id: "flowers", name: "Flowers / Stems", icon: "🌸", isDefault: true },
  { id: "keychains", name: "Keychains", icon: "✨", isDefault: true },
  { id: "accessories", name: "Accessories", icon: "🎀", isDefault: true }
];

function getCategories() {
  try {
    const raw = localStorage.getItem("fiona_admin_categories_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const defaultMap = new Map(DEFAULT_CATEGORIES.map(c => [c.id, c]));
        parsed.forEach(c => defaultMap.set(c.id, { ...(defaultMap.get(c.id) || {}), ...c }));
        return Array.from(defaultMap.values());
      }
    }
  } catch (err) {
    console.error("Error reading categories from localStorage:", err);
  }
  return [...DEFAULT_CATEGORIES];
}

function saveCategories(categoriesList) {
  try {
    localStorage.setItem("fiona_admin_categories_v1", JSON.stringify(categoriesList));
  } catch (err) {
    console.error("Error saving categories to localStorage:", err);
  }
}

function getStoredProducts() {
  try {
    const raw = localStorage.getItem("fiona_admin_products_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading custom products from localStorage:", err);
  }
  return [...DEFAULT_PRODUCTS_CATALOG];
}

function syncProductsData() {
  PRODUCTS_DATA = getStoredProducts();
  return PRODUCTS_DATA;
}

function saveProductsData(productsList) {
  PRODUCTS_DATA = productsList;
  try {
    localStorage.setItem("fiona_admin_products_v1", JSON.stringify(productsList));
  } catch (err) {
    console.error("Error saving products to localStorage:", err);
  }
}

function resetProductsToDefault() {
  saveProductsData([...DEFAULT_PRODUCTS_CATALOG]);
  return PRODUCTS_DATA;
}

// Initial sync on load
syncProductsData();

// Helper to look up a product by ID
function getProductById(id) {
  if (!PRODUCTS_DATA || PRODUCTS_DATA.length === 0) syncProductsData();
  return PRODUCTS_DATA.find(p => p.id === id);
}

function getAllProducts() {
  if (!PRODUCTS_DATA || PRODUCTS_DATA.length === 0) syncProductsData();
  return PRODUCTS_DATA;
}
