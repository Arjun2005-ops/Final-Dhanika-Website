FIONA FLORIST BY DHANIKA
"Flowers That Never Fade"
Handmade Pipe Cleaner Flower Boutique — Maharashtra, India
=============================================================

FOLDER STRUCTURE
----------------
fiona-florist/
├── index.html            — Homepage (Hero, Shop Preview, About, Custom Banner, FAQs)
├── shop.html             — Full Flower Catalog with Filters & Search
├── about.html            — About Dhanika, Brand Story & Care Instructions
├── custom-order.html     — Bespoke Bouquet Request Form (WhatsApp Integration)
├── cart.html             — Shopping Bag (localStorage Persisted, Quantity Management)
├── checkout.html         — Delivery Details & WhatsApp Order Confirmation
├── contact.html          — Contact Info, Maharashtra Shipping Guide, FAQ, Contact Form
│
├── css/
│   ├── style.css         — Core Design System (Colors, Typography, All Components)
│   └── responsive.css    — Mobile-First Responsive Breakpoints (992px, 768px, 480px)
│
├── js/
│   ├── products.js       — Product Catalog Data (Prices, Variants, Images, Descriptions)
│   ├── main.js           — Shared Global Logic (Cart, Toast, Mobile Nav, WhatsApp, FAQ)
│   ├── shop.js           — Flower Shop Rendering, Filtering, Search, Cart Integration
│   ├── cart.js           — Cart Page: Render Items, Qty Update, Remove, Shipping Totals
│   ├── checkout.js       — Checkout Validation + WhatsApp Order Message Generator
│   └── custom-order.js   — Custom Bouquet Form Validation + WhatsApp Request Builder
│
└── assets/
    ├── images/           — Authentic handmade product & section photos (.jpeg)
    │   ├── Speical bouquant 550.jpeg    — Special Handcrafted Bouquet (₹550)
    │   ├── birthday quaoutes 500.jpeg   — Birthday Quotes Keepsake Bouquet (₹500)
    │   ├── mini boquant 120.jpeg        — Mini Everlasting Bouquet (₹120)
    │   ├── rose 120.jpeg                — Classic Velvet Red Rose (₹120)
    │   ├── pink rose 120.jpeg           — Pastel Pink Rose (₹120)
    │   ├── sunflower 150.jpeg           — Radiant Sunflower (₹150)
    │   ├── hair sunflower 150.jpeg      — Sunflower Hair Accessory (₹150)
    │   ├── white 150.jpeg               — Pure White Lily (₹150)
    │   ├── pink flower 120.jpeg         — Blush Pink Blossom (₹120)
    │   ├── red flower 130.jpeg          — Scarlet Red Blossom (₹130)
    │   ├── butterfly key chain 70.jpeg  — Butterfly Charm Keychain (₹70)
    │   ├── flower key chain 60.jpeg     — Floral Blossom Keychain (₹60)
    │   ├── heart key chain 40 .jpeg     — Sweet Heart Keychain (₹40)
    │   ├── spider key chan 60.jpeg      — Spider Charm Keychain (₹60)
    │   └── key chain 50.jpeg            — Handcrafted Pastel Keychain (₹50)
    ├── icons/            — Reserved for future custom SVG icons
    └── logo/             — Brand logo (logo.jpeg) used in header, mobile drawer, footer & favicon


HOW TO RUN LOCALLY
------------------
1. Make sure all files are in the same folder (do not move or rename subfolders).
2. Double-click index.html to open it in any modern web browser (Chrome, Edge, Firefox).
3. Navigate all pages using the navigation bar — no server setup required!
4. Cart items are stored in your browser's localStorage and will persist across page refreshes.
5. WhatsApp buttons open wa.me links with prefilled order details.

Note: Images load from the assets/images/ folder using relative paths.
      Keep the folder structure intact for images to display correctly.


CUSTOMIZING THE WHATSAPP NUMBER
---------------------------------
Open:  js/main.js

Find:  const STORE_CONFIG = {
         ...
         whatsappNumber: "919876543210",   <-- Change this to your real number
         ...
       }

Format: Country code + number, WITHOUT the + symbol.
        Example: India (+91) 98765 43210 → "919876543210"

This one variable controls ALL WhatsApp buttons across the entire website.


CUSTOMIZING PRICES & PRODUCTS
------------------------------
Open:  js/products.js

All 15 products are defined in the PRODUCTS_DATA array.
Each product has:
  - name, category, type, badge, description
  - prices: { single, double, triple }  ← in Indian Rupees (₹)
  - originalPrices: { single, double, triple }  ← shown as strikethrough
  - image: path to image in assets/images/

To add a new product: add a new object to the PRODUCTS_DATA array.
To change a price: update the relevant property in the prices object.


CUSTOMIZING BUSINESS DETAILS (Phone, Email, Location)
------------------------------------------------------
Open: js/main.js

Update the STORE_CONFIG object:
  - whatsappNumber: "91XXXXXXXXXX"  (required for WhatsApp integration)
  - businessPhone: "+91 XXXXX XXXXX"
  - businessEmail: "your@email.com"
  - location: "Your City, Maharashtra"
  - shippingInfo: (description shown to customers)
  - deliveryFee: 49  (flat delivery charge in ₹)
  - freeDeliveryThreshold: 500  (orders above this get free delivery)


PUBLISHING THE WEBSITE (Free Static Hosting)
--------------------------------------------
Option 1 — GitHub Pages (Recommended, Free):
  1. Create a free account at github.com
  2. Create a new repository named "fiona-florist" or similar
  3. Upload all project files (maintain folder structure)
  4. Go to Settings → Pages → Source: main branch / root
  5. Your site goes live at: https://yourusername.github.io/fiona-florist

Option 2 — Netlify (Drag & Drop Deployment, Free):
  1. Visit app.netlify.com and create a free account
  2. Drag and drop the entire "fiona-florist" project folder onto Netlify
  3. Site goes live instantly with a Netlify URL
  4. Optionally connect a custom domain (e.g., fionaflorist.in)

Option 3 — Vercel (Free):
  1. Visit vercel.com and sign in with GitHub
  2. Import the repository and deploy (zero config needed)
  3. Auto-HTTPS and CDN included

All three options are completely FREE for a static HTML/CSS/JS website.


IMPORTANT NOTES & LIMITATIONS
------------------------------
• This is a FRONTEND-ONLY website (no backend server, no database).
• Cart items are saved in the browser's localStorage (device-specific, not synced).
• WhatsApp links open wa.me with a prefilled order summary for Dhanika to review.
• Payments are handled directly via UPI/WhatsApp — not through the website.
• The website does NOT claim to securely store orders; all confirmations go via WhatsApp.
• Customer accounts, shared inventory sync and live payment gateways are outside scope.
• Phone number +91 98765 43210 and email are PLACEHOLDER values. 
  Update them in js/main.js (STORE_CONFIG) before publishing.


PRODUCT PRICES (INR ₹) - Default Configuration
-----------------------------------------------
| Product          | Single | Double | Triple |
|------------------|--------|--------|--------|
| Rose             | ₹90    | ₹179   | ₹250   |
| Rose Bouquet     | ₹120   | ₹209   | ₹280   |
| Sunflower        | ₹120   | ₹250   | ₹350   |
| Sunflower Bouquet| ₹150   | ₹280   | ₹380   |
| Tulip            | ₹90    | ₹179   | ₹250   |
| Tulip Bouquet    | ₹120   | ₹209   | ₹280   |
| Lily             | ₹120   | ₹250   | ₹350   |
| Lily Bouquet     | ₹150   | ₹280   | ₹380   |

Single = 1 handcrafted stem
Double = 2 bundled stems  
Triple = 3 lush arrangement


TECHNOLOGY STACK
----------------
• HTML5 (Semantic structure)
• CSS3 (Custom Design System with CSS Variables, Grid, Flexbox, Animations)
• Vanilla JavaScript (localStorage, DOM manipulation, event listeners)
• Google Fonts: Playfair Display (headings) + Plus Jakarta Sans (body)
• WhatsApp Web API via wa.me click-to-chat links
• Unsplash stock photos (free for personal & commercial use)

NO FRAMEWORKS USED:
• No React, Vue, Angular
• No Bootstrap, Tailwind CSS
• No jQuery
• No Node.js, Express, or any backend


BROWSER COMPATIBILITY
---------------------
✓ Google Chrome 90+
✓ Mozilla Firefox 88+
✓ Microsoft Edge 90+
✓ Safari 14+ (iOS & macOS)
✓ Samsung Internet 14+


CREDITS
-------
• Handmade flower concept & brand: Dhanika
• AI bouquet images: Generated by Google Antigravity / Gemini AI
• Stock photography: Unsplash (unsplash.com)
• Fonts: Google Fonts (fonts.google.com)
• Built with: Antigravity IDE by Google DeepMind


=============================================================
© 2026 Fiona Florist by Dhanika. "Flowers That Never Fade."
All rights reserved. Maharashtra, India.
=============================================================
