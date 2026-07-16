(() => {
  "use strict";

  // Prevent loading twice
  if (window.__BC_DISCOUNT_WIDGET__) {
    return;
  }

  window.__BC_DISCOUNT_WIDGET__ = true;

  const API_BASE = "https://bgcom.mihir72999.workers.dev";

  // Load CSS
  function loadCSS() {
    if (document.getElementById("bc-discount-widget-css")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "bc-discount-widget-css";
    link.rel = "stylesheet";
    link.href = `${API_BASE}/widget.css`;

    document.head.appendChild(link);
  }

  function isProductPage() {
      return getProductId() !== null;
  }

  function getProductId() {
    const selectors = [
      'input[name="product_id"]',
      "[data-product-id]",
      "[data-product-id-value]",
    ];
  
    for (const selector of selectors) {
      const el = document.querySelector(selector);

      if (!el) continue;

      return (
        el.value ||
        el.dataset.productId ||
        el.dataset.productIdValue
      );
    }

    return null;
  }
  function findTarget() {
    return (
      document.querySelector("#add-to-cart-wrapper") ||
      document.querySelector(".add-to-cart-wrapper") ||
      document.querySelector(".productView-options") ||
      document.querySelector(".productView")
    );
  }


function getCurrentPrice() {

    const priceElement =
        document.querySelector(".price--withoutTax") ||
        document.querySelector(".price");

    if (!priceElement)
        return 0;

    return Number(
        priceElement.textContent.replace(/[^0-9.]/g, "")
    );
}

function calculateDiscount(price, qty, discount) {

    const discountedPrice =
        price - (price * discount / 100);

    return {
        unitPrice: discountedPrice,
        total: discountedPrice * qty,
        saving: (price * qty) - (discountedPrice * qty)
    };
}

function updatePrice(result) {

    const priceElement =
        document.querySelector(".price--withoutTax") ||
        document.querySelector(".price");

    if (!priceElement)
        return;

    priceElement.innerHTML = `
        <span>$${result.unitPrice.toFixed(2)}</span>
    `;
}

async function getRules() {
    const productId = getProductId();


// ❌ This reads the product page URL, not the script URL
    if (!productId) {
        console.warn("Product ID not found");
        return [];
    }
    const url = `${API_BASE}/api/discount/${productId}?domain=${encodeURIComponent(window.location.hostname)}`;

    try {
       const accessToken = "5afj1t9xdu77fwa9r61yari9ltc2nu4"
       
        const response = await fetch(url, {
            method: "GET",
              headers: {
             'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "1",
      },
        });


        const text = await response.text();


        if (!response.ok) {
            return [];
        }
      
        const r = JSON.parse(text);
      return r.rules 
    } catch (error) {

        console.error("Fetch Failed:", error);

        return [];
    }
}
const priceElement =
    document.querySelector("[data-product-price-with-tax]") ||
    document.querySelector("[data-product-price-without-tax]");

  const originalPrice = parseFloat(
    priceElement.textContent.replace(/[^0-9.]/g, "")
);
  function renderRules(rules) {
    if (!rules.length) {
      return "";
    }
  
    return `
      <div class="bc-discount-widget">

        ${rules
          .map((rule , _index,arr) => rule.discountType === 'percent' ? `
            <label class="bc-rule">

              <input
                type="radio"
                name="discountQty"
                value="${rule.quantity}"
                data-discount="${rule.discount}"
                ${rule.quantity === 1 ? "checked" : ""}
              />

              <div class="bc-rule-left">
                <strong class="bc-rule-left-strong">${rule.quantity}</strong>
                <small class="bc-rule-left-small">${Number(rule.discount) === 0 ? "VIAL" : "VIALS"}</small>
              </div>

              <div class="bc-rule-middle">
               <span class="bc-rule-middle-span"> ${
                 rule.label
                }</span>
                <small class="bc-rule-middle-small">
                ${
                 "$" + (calculatePrice(originalPrice, rule.discount)).toFixed(2)+" / VIAL"
                }
                </small>
              </div>

             <div class="bc-rule-right">
             <span class="bc-rule-middle-span">
                ${
                 "$" + (calculatePrice(originalPrice, rule.discount) * rule.quantity).toFixed(2)
                } 
               </span>
             <small class="bc-rule-right-small">
                ${Number(rule.discount) === 0 ? "" :
                 "$" + (originalPrice * rule.quantity).toFixed(2)}
               </small>  
              </div>
            </label>
            `
           :
           `<div class="bc-rule-fixed">
            ${_index === arr.length - 1 ? `<h1>will implement soon ${rule.discountType} discount rule</h1>` : ''}
            
           </div>`
        )
        .join("")}
`
  }

 
function bindEvents() {

    const qtyInput =
        document.querySelector('input[name="qty[]"]') ||
        document.querySelector('input[name="qty"]');

    if (!qtyInput) {
        return;
     }
  
    // -----------------------------
    // Product Variant Change
    // -----------------------------
    document.addEventListener("change", (event) => {
    const target = event.target;
    if (
        target.matches(
            '[data-product-attribute] input, [data-product-attribute] select'
        )
    ) {
        console.log("Variant changed");
       const currentPrice = getCurrentPrice()
        // selected option id
        console.log(currentPrice)
        console.log(target.value);

        // recalculate widget
        quantityChanged(qtyInput.value);
    }
});

    // -----------------------------
    // Radio Button Change
    // -----------------------------
    document.addEventListener("change", (event) => {

        const input = event.target;

        if (!input || input.name !== "discountQty") {
            return;
        }

        // Update quantity
        qtyInput.value = input.value;

        // Notify BigCommerce
        qtyInput.dispatchEvent(new Event("input", { bubbles: true }));
        qtyInput.dispatchEvent(new Event("change", { bubbles: true }));

        // Update price
        quantityChanged(qtyInput.value);

    });

    // -----------------------------
    // Manual Quantity Input
    // -----------------------------
    qtyInput.addEventListener("input", () => {
        syncRadioButtons(qtyInput);
        quantityChanged(qtyInput.value);
    });

    qtyInput.addEventListener("change", () => {
        syncRadioButtons(qtyInput);
        quantityChanged(qtyInput.value);
    });

    // -----------------------------
    // Increase Button
    // -----------------------------
    const incBtn = document.querySelector('button[data-action="inc"]');

    incBtn?.addEventListener("click", () => {

        setTimeout(() => {

            syncRadioButtons(qtyInput);
            quantityChanged(qtyInput.value);

        }, 50);
 
         quantityChanged(qtyInput.value);  
    });

    // -----------------------------
    // Decrease Button
    // -----------------------------
    const decBtn = document.querySelector('button[data-action="dec"]');

    decBtn?.addEventListener("click", () => {

        setTimeout(() => {

            syncRadioButtons(qtyInput);
            quantityChanged(qtyInput.value);

        }, 50);

    });

}

  function calculatePrice(price, discount) {
    return Number(price - (price * discount / 100));
}
function updateDisplayedPrice(discount, qty) {

    const newPrice = calculatePrice(originalPrice * qty, discount);
 
    priceElement.textContent = `${newPrice.toFixed(2)}`;
}

function getSelectedOptions() {
  const options = {};

  document
    .querySelectorAll(
      '[data-product-attribute] input:checked, [data-product-attribute] select'
    )
    .forEach(el => {
      options[el.name] = el.value;
    });

  return options;
}


async function quantityChanged(qty) {

    qty = Number(qty);
    const rules = await getRules()
    let rule = rules.find(r => r.quantity === qty);
    const arr = rules.map(r =>{
      return r.quantity 
    } )

    const missing = {};

for (let i = arr[0]; i <= arr[arr.length - 1]; i++) {
    if (!arr.includes(i)) {
        missing[i] = i-1
    }
}
if(missing[qty]){
  const rs = rules.findIndex(r=>r.quantity === missing[qty])
  rule = rules[rs]
}
    if (!rule && qty > rules.length - 1) {

        rule = rules[rules?.length - 1]
    }

    updateDisplayedPrice(rule?.discount, qty);

}



  function syncRadioButtons(qtyInput){
   
      const qty = Number(qtyInput.value);

    document
        .querySelectorAll('input[name="discountQty"]')
        .forEach(radio => {
           const checked = Number(radio.value) === qty;
            radio.checked = checked;
           if(checked){
           updateDisplayedPrice(Number(radio.dataset.discount), qty);
           }

        });
  }

async function init() {
    console.log("========== Widget Init ==========");

    if (!isProductPage()) {
        console.log("❌ Not a product page");
        return;
    }

    console.log("✅ Product page");

    loadCSS();

    const productId = getProductId();

    if (!productId) {
    console.log("Not a product page");
    return;
}

    const target = findTarget();

 
    if (!target) {
        console.warn("❌ Target element not found");
        return;
    }

    let rules = [];

    try {
        console.log("Calling getRules...");

        rules = await getRules();

 
    } catch (err) {
        console.error("getRules Error:", err);
        return;
    }

    if (!Array.isArray(rules)) {
        console.warn("API did not return an array");

        return;
    }

    if (rules.length === 0) {
        console.warn("No discount rules found");

        return;
    }

    target.insertAdjacentHTML(
        "beforebegin",
        renderRules(rules)
    );

    bindEvents();

    console.log("✅ Widget Rendered");
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();