/**
 * Fiona Florist by Dhanika - Custom Order Form Logic
 * Validates bespoke bouquet requests and generates a comprehensive WhatsApp inquiry.
 */

document.addEventListener("DOMContentLoaded", () => {
  const customOrderForm = document.getElementById("custom-order-form");

  if (!customOrderForm) return;

  // Set minimum date to tomorrow
  const dateInput = document.getElementById("custom-date");
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  customOrderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("custom-name").value.trim();
    const phone = document.getElementById("custom-phone").value.trim();
    const flowerType = document.getElementById("custom-flower-type").value;
    const colors = document.getElementById("custom-colors").value.trim();
    const size = document.getElementById("custom-size").value;
    const budget = document.getElementById("custom-budget").value;
    const occasion = document.getElementById("custom-occasion").value;
    const requiredDate = document.getElementById("custom-date").value;
    const notes = document.getElementById("custom-notes").value.trim();

    // Validation
    if (!name) {
      showToast("Please provide your name.", "error");
      document.getElementById("custom-name").focus();
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = phone.replace(/[\s\-\+]/g, "").slice(-10);
    if (!phoneRegex.test(cleanedPhone)) {
      showToast("Please enter a valid 10-digit Indian phone number.", "error");
      document.getElementById("custom-phone").focus();
      return;
    }

    if (!flowerType) {
      showToast("Please select your preferred flower type.", "error");
      document.getElementById("custom-flower-type").focus();
      return;
    }

    if (!colors) {
      showToast("Please specify your preferred color theme.", "error");
      document.getElementById("custom-colors").focus();
      return;
    }

    if (!size) {
      showToast("Please choose a bouquet size.", "error");
      document.getElementById("custom-size").focus();
      return;
    }

    if (!requiredDate) {
      showToast("Please select the date by which you need the flowers.", "error");
      document.getElementById("custom-date").focus();
      return;
    }

    // Format WhatsApp bespoke request message
    const customMessage = 
`*💐 BESPOKE CUSTOM BOUQUET REQUEST 💐*
*Fiona Florist by Dhanika* — _Flowers That Never Fade_

*Customer Details:*
• *Name:* ${name}
• *Phone:* ${phone}

*Custom Bouquet Specifications:*
• *Flower Type:* ${flowerType}
• *Preferred Color Palette:* ${colors}
• *Bouquet Size / Volume:* ${size}
• *Estimated Budget:* ${budget || "To be discussed"}
• *Occasion / Theme:* ${occasion || "General gift"}
• *Date Needed by:* ${requiredDate}

${notes ? `*Special Instructions / Ribbon / Wrapping Preferences:*\n"${notes}"\n\n` : ""}
----------------------------------------
_Hello Dhanika! Please let me know your craft availability, recommendations, and pricing estimate for this custom order._`;

    showToast("Opening WhatsApp with your custom bouquet details! 🌸", "success");

    setTimeout(() => {
      openWhatsAppChat(customMessage);
    }, 500);
  });
});
