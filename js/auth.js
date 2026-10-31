/**
 * Fiona Florist by Dhanika - Authentication & User Management System
 * Features:
 * - User Registration with Name, Phone Number, City, Address, Strong Password.
 * - Password Strength Enforcement (Length, Uppercase, Lowercase, Number, Symbol).
 * - Login restricted to Phone Number only (Alphabets & special characters blocked).
 * - "Add to Bag" gatekeeper: Only logged-in users can add items to cart.
 * - User Profile view and seamless Logout.
 * - Automatic pre-fill of delivery details on Checkout page.
 */

const AUTH_CONFIG = {
  USERS_KEY: "fiona_florist_users_v1",
  CURRENT_USER_KEY: "fiona_florist_current_user_v1",
  PENDING_CART_KEY: "fiona_florist_pending_cart_v1"
};

// ==========================================================================
// 1. DATA ACCESS & STORAGE HELPERS
// ==========================================================================

function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(AUTH_CONFIG.USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error loading users from localStorage:", err);
    return [];
  }
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(AUTH_CONFIG.USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Error saving users to localStorage:", err);
  }
}

function getCurrentUser() {
  try {
    const data = localStorage.getItem(AUTH_CONFIG.CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error loading current user from localStorage:", err);
    return null;
  }
}

function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_CONFIG.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_CONFIG.CURRENT_USER_KEY);
    }
    updateAuthUI();
  } catch (err) {
    console.error("Error setting current user:", err);
  }
}

function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

function safeToast(msg, type = "success") {
  if (typeof showToast === "function") {
    showToast(msg, type);
  } else if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(msg);
  } else {
    console.log(`[Toast ${type}] ${msg}`);
  }
}

function logoutUser() {
  const user = getCurrentUser();
  const userName = user ? user.name : "User";
  setCurrentUser(null);
  safeToast(`You have been logged out. See you soon, ${userName}! 🌸`, "info");
  closeProfileModal();
  updateAuthUI();
}

// ==========================================================================
// 2. PASSWORD STRENGTH VALIDATOR
// ==========================================================================

/**
 * Validates whether a password is strong according to security standards:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*...)
 */
function evaluatePasswordStrength(password) {
  const pwd = password || "";
  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const checks = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const passedCount = checks.filter(Boolean).length;
  const isStrong = passedCount === 5;

  let label = "Very Weak";
  let color = "#e53e3e";
  let percent = 15;

  if (passedCount === 2) {
    label = "Weak";
    color = "#dd6b20";
    percent = 35;
  } else if (passedCount === 3) {
    label = "Fair";
    color = "#d69e2e";
    percent = 55;
  } else if (passedCount === 4) {
    label = "Good";
    color = "#3182ce";
    percent = 80;
  } else if (passedCount === 5) {
    label = "Strong Password 🌸";
    color = "#38a169";
    percent = 100;
  }

  return {
    pwd,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    passedCount,
    isStrong,
    label,
    color,
    percent
  };
}

// ==========================================================================
// 3. AUTH MODAL DOM INJECTION
// ==========================================================================

function ensureAuthModalsInDOM() {
  if (document.getElementById("fiona-auth-modal")) return;

  const modalMarkup = `
    <!-- Fiona Auth Modal (Login / Register) -->
    <div id="fiona-auth-modal" class="auth-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div class="auth-modal-card">
        <button type="button" class="auth-close-btn" id="auth-close-btn" aria-label="Close dialog">&times;</button>
        
        <div class="auth-modal-header">
          <div class="auth-brand-badge">🌸 Fiona Florist by Dhanika</div>
          <h2 id="auth-modal-title" class="auth-title">Welcome to Our Flower Studio</h2>
          <p class="auth-subtitle" id="auth-modal-subtitle">Login or register to add flowers to your bag & order handmade creations.</p>
        </div>

        <!-- Auth Tabs -->
        <div class="auth-tabs" role="tablist">
          <button type="button" class="auth-tab-btn active" id="tab-btn-login" role="tab" aria-selected="true" data-tab="login">
            Login
          </button>
          <button type="button" class="auth-tab-btn" id="tab-btn-register" role="tab" aria-selected="false" data-tab="register">
            Register (New User)
          </button>
        </div>

        <!-- Alert Banner inside modal -->
        <div id="auth-alert-box" class="auth-alert-box" style="display: none;"></div>

        <!-- LOGIN PANEL -->
        <div class="auth-tab-panel active" id="auth-panel-login">
          <form id="fiona-login-form" novalidate>
            <div class="auth-form-group">
              <label for="login-phone" class="auth-label">
                Mobile Number <span class="auth-req">*</span>
                <span class="auth-hint-inline">(Numbers only, no alphabets)</span>
              </label>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">📱</span>
                <input 
                  type="tel" 
                  id="login-phone" 
                  name="phone"
                  class="auth-input numbers-only-input" 
                  placeholder="Enter 10-digit mobile number" 
                  maxlength="10" 
                  inputmode="numeric"
                  autocomplete="tel"
                  required
                >
              </div>
              <div class="auth-field-error" id="login-phone-error"></div>
            </div>

            <div class="auth-form-group">
              <label for="login-password" class="auth-label">Password <span class="auth-req">*</span></label>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">🔒</span>
                <input 
                  type="password" 
                  id="login-password" 
                  name="password"
                  class="auth-input" 
                  placeholder="Enter your password" 
                  autocomplete="current-password"
                  required
                >
                <button type="button" class="auth-pwd-toggle" data-target="login-password" aria-label="Toggle password visibility">👁️</button>
              </div>
              <div class="auth-field-error" id="login-password-error"></div>
            </div>

            <div class="auth-actions-row">
              <button type="submit" class="btn auth-submit-btn" id="btn-submit-login">
                <span>Login & Continue</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>

            <div class="auth-switch-text">
              Don't have an account yet? 
              <button type="button" class="auth-switch-link" id="switch-to-register">Create an account here</button>
            </div>
          </form>
        </div>

        <!-- REGISTER PANEL -->
        <div class="auth-tab-panel" id="auth-panel-register">
          <form id="fiona-register-form" novalidate>
            <div class="auth-form-row">
              <div class="auth-form-group">
                <label for="reg-name" class="auth-label">Full Name <span class="auth-req">*</span></label>
                <div class="auth-input-wrapper">
                  <span class="auth-input-icon">👤</span>
                  <input 
                    type="text" 
                    id="reg-name" 
                    name="name" 
                    class="auth-input" 
                    placeholder="Your Full Name" 
                    autocomplete="name"
                    required
                  >
                </div>
                <div class="auth-field-error" id="reg-name-error"></div>
              </div>

              <div class="auth-form-group">
                <label for="reg-phone" class="auth-label">
                  Mobile Number <span class="auth-req">*</span>
                  <span class="auth-hint-inline">(Numbers only)</span>
                </label>
                <div class="auth-input-wrapper">
                  <span class="auth-input-icon">📱</span>
                  <input 
                    type="tel" 
                    id="reg-phone" 
                    name="phone" 
                    class="auth-input numbers-only-input" 
                    placeholder="10-digit mobile number" 
                    maxlength="10" 
                    inputmode="numeric"
                    autocomplete="tel"
                    required
                  >
                </div>
                <div class="auth-field-error" id="reg-phone-error"></div>
              </div>
            </div>

            <div class="auth-form-group">
              <label for="reg-city" class="auth-label">City / Town <span class="auth-req">*</span></label>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">📍</span>
                <input 
                  type="text" 
                  id="reg-city" 
                  name="city" 
                  class="auth-input" 
                  placeholder="e.g. Pune, Mumbai, Nashik, Nagpur" 
                  autocomplete="address-level2"
                  required
                >
              </div>
              <div class="auth-field-error" id="reg-city-error"></div>
            </div>

            <div class="auth-form-group">
              <label for="reg-address" class="auth-label">Delivery Address <span class="auth-req">*</span></label>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon" style="top: 14px;">🏠</span>
                <textarea 
                  id="reg-address" 
                  name="address" 
                  class="auth-input auth-textarea" 
                  placeholder="House/Flat No., Building Name, Street & Landmark" 
                  rows="2"
                  autocomplete="street-address"
                  required
                ></textarea>
              </div>
              <div class="auth-field-error" id="reg-address-error"></div>
            </div>

            <div class="auth-form-row">
              <div class="auth-form-group">
                <label for="reg-password" class="auth-label">
                  Set Strong Password <span class="auth-req">*</span>
                </label>
                <div class="auth-input-wrapper">
                  <span class="auth-input-icon">🔐</span>
                  <input 
                    type="password" 
                    id="reg-password" 
                    name="password" 
                    class="auth-input" 
                    placeholder="Create a strong password" 
                    autocomplete="new-password"
                    required
                  >
                  <button type="button" class="auth-pwd-toggle" data-target="reg-password" aria-label="Toggle password visibility">👁️</button>
                </div>
                <div class="auth-field-error" id="reg-password-error"></div>
              </div>

              <div class="auth-form-group">
                <label for="reg-confirm-password" class="auth-label">
                  Confirm Password <span class="auth-req">*</span>
                </label>
                <div class="auth-input-wrapper">
                  <span class="auth-input-icon">🔒</span>
                  <input 
                    type="password" 
                    id="reg-confirm-password" 
                    name="confirmPassword" 
                    class="auth-input" 
                    placeholder="Repeat password" 
                    autocomplete="new-password"
                    required
                  >
                  <button type="button" class="auth-pwd-toggle" data-target="reg-confirm-password" aria-label="Toggle password visibility">👁️</button>
                </div>
                <div class="auth-field-error" id="reg-confirm-password-error"></div>
              </div>
            </div>

            <!-- Live Password Strength Meter & Checklist -->
            <div class="pwd-meter-box" id="pwd-meter-box">
              <div class="pwd-meter-header">
                <span class="pwd-meter-title">Password Security:</span>
                <span class="pwd-meter-badge" id="pwd-meter-badge">Enter password</span>
              </div>
              <div class="pwd-meter-bar-bg">
                <div class="pwd-meter-bar-fill" id="pwd-meter-bar-fill" style="width: 0%;"></div>
              </div>
              <div class="pwd-criteria-grid">
                <span class="pwd-rule" id="rule-len">○ At least 8 characters</span>
                <span class="pwd-rule" id="rule-upper">○ 1 Uppercase (A-Z)</span>
                <span class="pwd-rule" id="rule-lower">○ 1 Lowercase (a-z)</span>
                <span class="pwd-rule" id="rule-num">○ 1 Number (0-9)</span>
                <span class="pwd-rule" id="rule-special">○ 1 Special symbol (!@#$)</span>
              </div>
            </div>

            <div class="auth-actions-row">
              <button type="submit" class="btn auth-submit-btn" id="btn-submit-register">
                <span>Complete Registration & Login</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </button>
            </div>

            <div class="auth-switch-text">
              Already have an account? 
              <button type="button" class="auth-switch-link" id="switch-to-login">Log in here</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Fiona User Profile Modal -->
    <div id="fiona-profile-modal" class="auth-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div class="auth-modal-card profile-card">
        <button type="button" class="auth-close-btn" id="profile-close-btn" aria-label="Close profile dialog">&times;</button>
        
        <div class="profile-header">
          <div class="profile-avatar" id="profile-avatar-initials">🌸</div>
          <h2 id="profile-modal-title" class="profile-name"><span id="profile-user-name">User Name</span></h2>
          <span class="profile-status-pill">🌸 Verified Customer</span>
        </div>

        <div class="profile-details-list">
          <div class="profile-detail-item">
            <span class="profile-detail-label">📱 Registered Mobile:</span>
            <span class="profile-detail-val" id="profile-user-phone">+91 00000 00000</span>
          </div>
          <div class="profile-detail-item">
            <span class="profile-detail-label">📍 City:</span>
            <span class="profile-detail-val" id="profile-user-city">Maharashtra</span>
          </div>
          <div class="profile-detail-item">
            <span class="profile-detail-label">🏠 Delivery Address:</span>
            <span class="profile-detail-val" id="profile-user-address">Complete Address</span>
          </div>
        </div>

        <div class="profile-actions">
          <a href="shop.html" class="btn btn-primary" style="flex: 1; text-align: center;">Explore Shop</a>
          <a href="cart.html" class="btn btn-secondary" style="flex: 1; text-align: center;">View Bag (<span class="cart-count">0</span>)</a>
        </div>

        <button type="button" class="btn-logout" id="profile-btn-logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout of Account
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalMarkup);
  attachAuthEventListeners();
}

// ==========================================================================
// 4. MODAL INTERACTIONS & STATE MANAGEMENT
// ==========================================================================

let pendingCartAction = null;

function openAuthModal(initialTab = "login", options = {}) {
  ensureAuthModalsInDOM();
  const modal = document.getElementById("fiona-auth-modal");
  if (!modal) return;

  if (options.pendingProduct) {
    pendingCartAction = options.pendingProduct;
  }

  const alertBox = document.getElementById("auth-alert-box");
  if (alertBox) {
    if (options.reason) {
      alertBox.textContent = `🌸 ${options.reason}`;
      alertBox.style.display = "block";
    } else {
      alertBox.style.display = "none";
      alertBox.textContent = "";
    }
  }

  // Switch to requested tab
  switchAuthTab(initialTab);

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  // Focus appropriate first input
  setTimeout(() => {
    if (initialTab === "login") {
      const el = document.getElementById("login-phone");
      if (el) el.focus();
    } else {
      const el = document.getElementById("reg-name");
      if (el) el.focus();
    }
  }, 100);
}

function closeAuthModal() {
  const modal = document.getElementById("fiona-auth-modal");
  if (modal) {
    modal.classList.remove("open");
  }
  if (document.body) {
    document.body.style.overflow = "";
  }
}

function openProfileModal() {
  ensureAuthModalsInDOM();
  const user = getCurrentUser();
  if (!user) {
    openAuthModal("login");
    return;
  }

  const modal = document.getElementById("fiona-profile-modal");
  if (!modal) return;

  // Populate data
  const nameEl = document.getElementById("profile-user-name");
  const phoneEl = document.getElementById("profile-user-phone");
  const cityEl = document.getElementById("profile-user-city");
  const addressEl = document.getElementById("profile-user-address");
  const avatarEl = document.getElementById("profile-avatar-initials");

  if (nameEl) nameEl.textContent = user.name || "Customer";
  if (phoneEl) phoneEl.textContent = `+91 ${user.number}`;
  if (cityEl) cityEl.textContent = user.city || "Maharashtra";
  if (addressEl) addressEl.textContent = user.address || "Address not provided";
  
  if (avatarEl) {
    const initials = (user.name || "F").trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    avatarEl.textContent = initials || "🌸";
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProfileModal() {
  const modal = document.getElementById("fiona-profile-modal");
  if (modal) {
    modal.classList.remove("open");
  }
  if (document.body) {
    document.body.style.overflow = "";
  }
}

function switchAuthTab(tabName) {
  const loginTabBtn = document.getElementById("tab-btn-login");
  const regTabBtn = document.getElementById("tab-btn-register");
  const loginPanel = document.getElementById("auth-panel-login");
  const regPanel = document.getElementById("auth-panel-register");
  const title = document.getElementById("auth-modal-title");
  const subtitle = document.getElementById("auth-modal-subtitle");

  if (tabName === "register") {
    if (loginTabBtn) {
      loginTabBtn.classList.remove("active");
      loginTabBtn.setAttribute("aria-selected", "false");
    }
    if (regTabBtn) {
      regTabBtn.classList.add("active");
      regTabBtn.setAttribute("aria-selected", "true");
    }
    if (loginPanel) loginPanel.classList.remove("active");
    if (regPanel) regPanel.classList.add("active");

    if (title) title.textContent = "Create Your Account";
    if (subtitle) subtitle.textContent = "Join Fiona Florist to order everlasting handmade bouquets across Maharashtra.";
  } else {
    if (loginTabBtn) {
      loginTabBtn.classList.add("active");
      loginTabBtn.setAttribute("aria-selected", "true");
    }
    if (regTabBtn) {
      regTabBtn.classList.remove("active");
      regTabBtn.setAttribute("aria-selected", "false");
    }
    if (loginPanel) loginPanel.classList.add("active");
    if (regPanel) regPanel.classList.remove("active");

    if (title) title.textContent = "Welcome Back";
    if (subtitle) subtitle.textContent = "Log in with your registered phone number and password.";
  }
}

// ==========================================================================
// 5. EVENT LISTENERS & INPUT RESTRICTIONS
// ==========================================================================

function attachAuthEventListeners() {
  // Modal Close buttons
  const authCloseBtn = document.getElementById("auth-close-btn");
  if (authCloseBtn) {
    authCloseBtn.addEventListener("click", closeAuthModal);
  }

  const profileCloseBtn = document.getElementById("profile-close-btn");
  if (profileCloseBtn) {
    profileCloseBtn.addEventListener("click", closeProfileModal);
  }

  // Close modals on clicking background overlay
  const authModal = document.getElementById("fiona-auth-modal");
  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  const profileModal = document.getElementById("fiona-profile-modal");
  if (profileModal) {
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) closeProfileModal();
    });
  }

  // Close modals on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAuthModal();
      closeProfileModal();
    }
  });

  // Tab buttons
  const tabLogin = document.getElementById("tab-btn-login");
  const tabReg = document.getElementById("tab-btn-register");
  if (tabLogin) tabLogin.addEventListener("click", () => switchAuthTab("login"));
  if (tabReg) tabReg.addEventListener("click", () => switchAuthTab("register"));

  // Switch links
  const switchToReg = document.getElementById("switch-to-register");
  const switchToLogin = document.getElementById("switch-to-login");
  if (switchToReg) switchToReg.addEventListener("click", () => switchAuthTab("register"));
  if (switchToLogin) switchToLogin.addEventListener("click", () => switchAuthTab("login"));

  // Profile Logout button
  const logoutBtn = document.getElementById("profile-btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }

  // Password visibility toggles
  document.querySelectorAll(".auth-pwd-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === "password") {
          input.type = "text";
          btn.textContent = "🙈";
        } else {
          input.type = "password";
          btn.textContent = "👁️";
        }
      }
    });
  });

  // ========================================================================
  // STRICT NUMERIC INPUT RESTRICTION (No alphabets, no symbols allowed)
  // Requirement: "login only number alphabet charater not allow"
  // ========================================================================
  document.querySelectorAll(".numbers-only-input").forEach(input => {
    // 1. Prevent typing alphabetic characters or symbols via keyboard
    input.addEventListener("keypress", (e) => {
      // Allow navigation/editing keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      const char = String.fromCharCode(e.charCode || e.keyCode);
      // Only digits 0-9 permitted
      if (!/^[0-9]$/.test(char)) {
        e.preventDefault();
        showInputWarning(input, "⚠️ Only numbers (0-9) allowed. Alphabets & symbols are not permitted.");
      }
    });

    // 2. Sanitize pasted content or autofill immediately
    input.addEventListener("input", () => {
      const original = input.value;
      const sanitized = original.replace(/\D/g, ""); // strip all non-digits
      if (original !== sanitized) {
        input.value = sanitized;
        showInputWarning(input, "⚠️ Only numbers (0-9) allowed. Non-numeric characters were removed.");
      } else {
        clearInputWarning(input);
      }
    });
  });

  // ========================================================================
  // LIVE PASSWORD STRENGTH MONITORING (During Registration)
  // Requirement: "set a strong password"
  // ========================================================================
  const regPwdInput = document.getElementById("reg-password");
  if (regPwdInput) {
    regPwdInput.addEventListener("input", () => {
      const val = regPwdInput.value;
      const result = evaluatePasswordStrength(val);

      const fill = document.getElementById("pwd-meter-bar-fill");
      const badge = document.getElementById("pwd-meter-badge");

      if (fill) {
        fill.style.width = val ? `${result.percent}%` : "0%";
        fill.style.backgroundColor = result.color;
      }

      if (badge) {
        badge.textContent = val ? result.label : "Enter password";
        badge.style.color = val ? result.color : "var(--color-text-muted)";
      }

      // Update individual rule pills
      updateRuleState("rule-len", result.hasLength);
      updateRuleState("rule-upper", result.hasUpper);
      updateRuleState("rule-lower", result.hasLower);
      updateRuleState("rule-num", result.hasNumber);
      updateRuleState("rule-special", result.hasSpecial);
    });
  }

  // ========================================================================
  // FORM SUBMISSION: LOGIN
  // ========================================================================
  const loginForm = document.getElementById("fiona-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // ========================================================================
  // FORM SUBMISSION: REGISTER
  // ========================================================================
  const regForm = document.getElementById("fiona-register-form");
  if (regForm) {
    regForm.addEventListener("submit", handleRegisterSubmit);
  }
}

function updateRuleState(ruleId, isPassed) {
  const el = document.getElementById(ruleId);
  if (!el) return;
  if (isPassed) {
    el.classList.add("rule-passed");
    el.textContent = el.textContent.replace(/^○|^✗/, "✓");
  } else {
    el.classList.remove("rule-passed");
    el.textContent = el.textContent.replace(/^✓|^✗/, "○");
  }
}

function showInputWarning(inputEl, message) {
  const parent = inputEl.closest(".auth-form-group");
  if (!parent) return;
  const errorEl = parent.querySelector(".auth-field-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    clearTimeout(errorEl._timer);
    errorEl._timer = setTimeout(() => {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }, 3500);
  }
}

function clearInputWarning(inputEl) {
  const parent = inputEl.closest(".auth-form-group");
  if (!parent) return;
  const errorEl = parent.querySelector(".auth-field-error");
  if (errorEl && errorEl.textContent.includes("Only numbers")) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

// ==========================================================================
// 6. LOGIN HANDLER
// ==========================================================================

function handleLoginSubmit(e) {
  e.preventDefault();

  const phoneInput = document.getElementById("login-phone");
  const pwdInput = document.getElementById("login-password");
  const phoneError = document.getElementById("login-phone-error");
  const pwdError = document.getElementById("login-password-error");

  // Reset errors
  if (phoneError) phoneError.textContent = "";
  if (pwdError) pwdError.textContent = "";

  const phone = (phoneInput ? phoneInput.value : "").trim();
  const password = pwdInput ? pwdInput.value : "";

  // 1. Validate Phone Number (Only numbers, 10 digits)
  if (!phone) {
    if (phoneError) phoneError.textContent = "Please enter your mobile number.";
    if (phoneInput) phoneInput.focus();
    return;
  }

  // Strict check: non-digits not permitted
  if (!/^\d+$/.test(phone)) {
    if (phoneError) phoneError.textContent = "Only numbers are allowed. Alphabets & characters are not permitted!";
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (phone.length !== 10) {
    if (phoneError) phoneError.textContent = "Please enter a complete 10-digit mobile number.";
    if (phoneInput) phoneInput.focus();
    return;
  }

  // 2. Validate Password
  if (!password) {
    if (pwdError) pwdError.textContent = "Please enter your password.";
    if (pwdInput) pwdInput.focus();
    return;
  }

  // 3. Find User
  const users = getRegisteredUsers();
  const matchedUser = users.find(u => u.number === phone);

  if (!matchedUser) {
    if (phoneError) {
      phoneError.textContent = "No account found with this phone number. Please click 'Register' to create one.";
    }
    safeToast("Account not found. Please register first. 🌸", "error");
    return;
  }

  // 4. Verify Password
  if (matchedUser.password !== password) {
    if (pwdError) pwdError.textContent = "Incorrect password. Please try again.";
    safeToast("Incorrect password. Please check and try again.", "error");
    if (pwdInput) pwdInput.focus();
    return;
  }

  // 5. Successful Login
  const sessionUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    number: matchedUser.number,
    city: matchedUser.city,
    address: matchedUser.address,
    loginAt: new Date().toISOString()
  };

  setCurrentUser(sessionUser);
  closeAuthModal();
  safeToast(`Welcome back, ${matchedUser.name}! 🌸`, "success");

  // If there was a pending Add to Bag intent, fulfill it now!
  fulfillPendingCart();
}

// ==========================================================================
// 7. REGISTRATION HANDLER
// ==========================================================================

function handleRegisterSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("reg-name");
  const phoneInput = document.getElementById("reg-phone");
  const cityInput = document.getElementById("reg-city");
  const addressInput = document.getElementById("reg-address");
  const pwdInput = document.getElementById("reg-password");
  const confirmPwdInput = document.getElementById("reg-confirm-password");

  const nameError = document.getElementById("reg-name-error");
  const phoneError = document.getElementById("reg-phone-error");
  const cityError = document.getElementById("reg-city-error");
  const addressError = document.getElementById("reg-address-error");
  const pwdError = document.getElementById("reg-password-error");
  const confirmPwdError = document.getElementById("reg-confirm-password-error");

  // Clear errors
  [nameError, phoneError, cityError, addressError, pwdError, confirmPwdError].forEach(el => {
    if (el) el.textContent = "";
  });

  const name = (nameInput ? nameInput.value : "").trim();
  const phone = (phoneInput ? phoneInput.value : "").trim();
  const city = (cityInput ? cityInput.value : "").trim();
  const address = (addressInput ? addressInput.value : "").trim();
  const password = pwdInput ? pwdInput.value : "";
  const confirmPassword = confirmPwdInput ? confirmPwdInput.value : "";

  // 1. Validate Full Name
  if (!name || name.length < 2) {
    if (nameError) nameError.textContent = "Please enter your full name (at least 2 letters).";
    if (nameInput) nameInput.focus();
    return;
  }

  // 2. Validate Phone Number (Only numbers, 10 digits)
  if (!phone) {
    if (phoneError) phoneError.textContent = "Please enter your 10-digit mobile number.";
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (!/^\d+$/.test(phone)) {
    if (phoneError) phoneError.textContent = "Only numbers are allowed. Alphabets and characters are prohibited!";
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (phone.length !== 10) {
    if (phoneError) phoneError.textContent = "Mobile number must be exactly 10 digits.";
    if (phoneInput) phoneInput.focus();
    return;
  }

  // Check if phone number is already registered
  const users = getRegisteredUsers();
  const alreadyExists = users.some(u => u.number === phone);
  if (alreadyExists) {
    if (phoneError) phoneError.textContent = "This mobile number is already registered. Please log in instead.";
    safeToast("Mobile number already registered! Please switch to Login.", "error");
    if (phoneInput) phoneInput.focus();
    return;
  }

  // 3. Validate City
  if (!city || city.length < 2) {
    if (cityError) cityError.textContent = "Please provide your city/town in Maharashtra.";
    if (cityInput) cityInput.focus();
    return;
  }

  // 4. Validate Address
  if (!address || address.length < 6) {
    if (addressError) addressError.textContent = "Please provide your complete delivery address (minimum 6 characters).";
    if (addressInput) addressInput.focus();
    return;
  }

  // 5. Validate Strong Password
  const pwdEval = evaluatePasswordStrength(password);
  if (!pwdEval.isStrong) {
    if (pwdError) {
      pwdError.textContent = "Please meet all 5 requirements above to set a strong password!";
    }
    safeToast("Please create a strong password meeting all 5 security rules.", "error");
    if (pwdInput) pwdInput.focus();
    return;
  }

  // 6. Validate Password Confirmation
  if (password !== confirmPassword) {
    if (confirmPwdError) confirmPwdError.textContent = "Passwords do not match. Please verify.";
    if (confirmPwdInput) confirmPwdInput.focus();
    return;
  }

  // 7. Save New User
  const newUser = {
    id: "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    name: name,
    number: phone,
    city: city,
    address: address,
    password: password, // stored for local demonstration authentication
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Automatically log user in
  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    number: newUser.number,
    city: newUser.city,
    address: newUser.address,
    loginAt: new Date().toISOString()
  };

  setCurrentUser(sessionUser);
  closeAuthModal();
  safeToast(`Account created successfully! Welcome to Fiona Florist, ${newUser.name}! 🌸`, "success");

  // Reset forms
  regForm.reset();
  const fill = document.getElementById("pwd-meter-bar-fill");
  const badge = document.getElementById("pwd-meter-badge");
  if (fill) fill.style.width = "0%";
  if (badge) badge.textContent = "Enter password";
  ["rule-len", "rule-upper", "rule-lower", "rule-num", "rule-special"].forEach(id => {
    updateRuleState(id, false);
  });

  // Fulfill any pending item
  fulfillPendingCart();
}

/**
 * If the user attempted to add an item while logged out,
 * add it immediately after successful authentication.
 */
function fulfillPendingCart() {
  if (pendingCartAction && typeof addToCart === "function") {
    const item = pendingCartAction;
    pendingCartAction = null;
    setTimeout(() => {
      addToCart(item.productId, item.variant, item.quantity);
    }, 400);
  }
}

// ==========================================================================
// 8. GLOBAL UI SYNCHRONIZATION
// ==========================================================================

function updateAuthUI() {
  const user = getCurrentUser();
  const isLoggedIn = user !== null;

  // 1. Update Desktop Nav Action Button
  const authNavBtns = document.querySelectorAll(".auth-nav-btn");
  authNavBtns.forEach(btn => {
    const dot = btn.querySelector(".user-status-dot");
    const nameLabel = btn.querySelector(".auth-btn-label");

    if (isLoggedIn) {
      btn.classList.add("is-logged-in");
      btn.setAttribute("title", `Logged in as ${user.name} (Click for Profile)`);
      btn.setAttribute("aria-label", `Account Profile: ${user.name}`);
      if (dot) dot.style.display = "block";
      if (nameLabel) {
        nameLabel.textContent = user.name.split(" ")[0];
        nameLabel.style.display = "inline";
      }
    } else {
      btn.classList.remove("is-logged-in");
      btn.setAttribute("title", "Login or Register");
      btn.setAttribute("aria-label", "Login or Register");
      if (dot) dot.style.display = "none";
      if (nameLabel) {
        nameLabel.textContent = "Login";
        nameLabel.style.display = "none";
      }
    }
  });

  // 2. Update Mobile Menu Auth item
  const mobileAuthText = document.getElementById("mobile-auth-text");
  if (mobileAuthText) {
    if (isLoggedIn) {
      mobileAuthText.textContent = `Hi, ${user.name.split(" ")[0]} (My Account)`;
    } else {
      mobileAuthText.textContent = "Login / Register";
    }
  }

  // 3. Auto-fill Checkout fields if currently on checkout.html
  if (isLoggedIn && (document.getElementById("checkout-form") || window.location.href.includes("checkout"))) {
    const nameInput = document.getElementById("cust-name");
    const phoneInput = document.getElementById("cust-phone");
    const cityInput = document.getElementById("cust-city");
    const addressInput = document.getElementById("cust-address");

    if (nameInput && !nameInput.value) nameInput.value = user.name;
    if (phoneInput && !phoneInput.value) phoneInput.value = user.number;
    if (cityInput && !cityInput.value) cityInput.value = user.city;
    if (addressInput && !addressInput.value) addressInput.value = user.address;

    // Show a neat notice
    let notice = document.getElementById("checkout-auth-autofill-notice");
    if (!notice && document.getElementById("checkout-form")) {
      notice = document.createElement("div");
      notice.id = "checkout-auth-autofill-notice";
      notice.className = "checkout-auth-notice";
      notice.innerHTML = `
        <span>🌸 Logged in as <strong>${user.name}</strong> (${user.number}). Delivery details auto-filled!</span>
      `;
      const form = document.getElementById("checkout-form");
      form.parentNode.insertBefore(notice, form);
    }
  }
}

// ==========================================================================
// 9. INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  ensureAuthModalsInDOM();
  updateAuthUI();

  // Desktop Navbar Auth Buttons trigger
  document.querySelectorAll(".auth-nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (isUserLoggedIn()) {
        openProfileModal();
      } else {
        openAuthModal("login");
      }
    });
  });

  // Mobile drawer auth link trigger
  const mobileTrigger = document.getElementById("mobile-auth-trigger");
  if (mobileTrigger) {
    mobileTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      // Close mobile menu if open
      const closeMobile = document.querySelector(".close-mobile-nav");
      if (closeMobile) closeMobile.click();

      if (isUserLoggedIn()) {
        openProfileModal();
      } else {
        openAuthModal("login");
      }
    });
  }
});
