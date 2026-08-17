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

////variant Array
let variant ;
let discountType = 'percent'
let rules = null;
let hasVariantOptions;
let widgetSettings = null;
const selections = [];
const priceElement =[
    ...document.querySelectorAll("[data-product-price-with-tax], [data-product-price-without-tax]")].find(el => el.textContent.trim() !== "");
    

  let originalPrice = 0;

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

  function findCart(){
    return {isCartPage :window.location.pathname === '/cart.php'};
  }

  function findTarget() {
    return (
      document.querySelector("#add-to-cart-wrapper") ||
      document.querySelector(".add-to-cart-wrapper") ||
      document.querySelector(".productView-options") ||
      document.querySelector(".productView")
    );
  }


async function loadWidgetSettings() {
  const product_id = getProductId()
  originalPrice = parseFloat(
      priceElement.textContent.replace(/[^0-9.]/g, "")
     );
  try {
    const res = await fetch(
      `${API_BASE}/api/widgets/settings?domain=${encodeURIComponent(window.location.hostname)}&product_id=${product_id}`
    );

    if (!res.ok) {
      throw new Error("Failed to load widget settings");
    }

    const data = await res.json();

    widgetSettings = data.data;
      document.documentElement.style.setProperty(
    "--border-radius",
    `${widgetSettings?.borderRadius}px`
  );

  document.documentElement.style.setProperty(
    "--border-color",
    widgetSettings?.borderColor
  );

    return widgetSettings;
  } catch (err) {
    console.error(err);
    return null;
  }
}



async function getRules() {
    const productId = getProductId();
  if(rules) return rules

// ❌ This reads the product page URL, not the script URL
    if (!productId) {
        console.warn("Product ID not found");
        return [];
    }
    const url = `${API_BASE}/api/discount/${productId}?domain=${encodeURIComponent(window.location.hostname)}`;

    try {
        
        const response = await fetch(url, {
            method: "GET",
              headers: {
             'Content-Type': 'application/json'
      },
        });

        const text = await response.text();

        if (!response.ok) {
            return [];
        }
      
        const r = JSON.parse(text);
        if(r?.variants){
          variant = r?.variants.map(v=>({
           variantId: v.id,
           price: v.price,
           sku: v.sku,
           option_values: v.option_values  
          }))
          hasVariantOptions = (variant ?? []).some(v => v.option_values?.length > 0);
        }
      rules = r.rules
      return rules 
    } catch (error) {

        console.error("Fetch Failed:", error);

        return [];
    }
    }
  
  


function getWasPrice(){
   return [
    ...document.querySelectorAll("[data-product-non-sale-price-with-tax] , [data-product-non-sale-price-without-tax]")
   ].find(el => el.textContent.trim() !== "");
}
function updateWasPrice(quantity) {
  
  const wasPriceElement = getWasPrice();
  
  if (!wasPriceElement) return;

  const originalWasPrice = parseFloat(
    wasPriceElement.dataset.originalPrice ||
    wasPriceElement.textContent.replace(/[^0-9.]/g, "")
  );

  // Save original only once
  if (!wasPriceElement.dataset.originalPrice) {
    wasPriceElement.dataset.originalPrice = originalWasPrice;
  }

  wasPriceElement.textContent =
    "$" + (originalWasPrice * quantity).toFixed(2);
}

  function renderRules() {
    const wasPriceElement = getWasPrice()
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

          rule.discountType === 'fixed' ?            
           ` <label class="bc-rule">
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
               Number(rule.discount) === 0 ? "SINGLE" : "$"+(originalPrice - rule.discount).toFixed(2) + " OFF" 
                }</span>
                <small class="bc-rule-middle-small">
                ${
                 "$" + calculatePrice(originalPrice ,Number(rule.discount) === 0 ? originalPrice : rule.discount).toFixed(2) +" / VIAL"
                }
                </small>
              </div>

             <div class="bc-rule-right">
             <span class="bc-rule-middle-span">
                ${
                rule.quantity === 1 ? "$" + originalPrice.toFixed(2) : "$" + (calculatePrice(originalPrice , rule.discount) * rule.quantity).toFixed(2)
                } 
               </span>
             <small class="bc-rule-right-small">
                ${Number(rule.discount) === 0 ? "" :
                "$" + (originalPrice * rule.quantity).toFixed(2)}
               </small>  
              </div>
            </label>
                
           `:
           `
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
                Number(rule.discount)=== 0 ? "SINGLE" :"$"+(rule.discount).toFixed(2) + " OFF" 
                }</span>
                <small class="bc-rule-middle-small">
                ${
                 "$" + calculatePrice(originalPrice , rule.discount) +" / VIAL"
                }
                </small>
              </div>

             <div class="bc-rule-right">
             <span class="bc-rule-middle-span">
                ${
                 "$" + (calculatePrice(originalPrice * rule.quantity , rule.discount * rule.quantity ) ).toFixed(2)
                } 
               </span>
             <small class="bc-rule-right-small">
                ${Number(rule.discount) === 0 ? "" :
                  "$" + (originalPrice * rule.quantity).toFixed(2)}
               </small>  
              </div>
            </label>
           `
        )
        .join("")}
        </div>
`
  }

 async function updateVariant(){
      const selectedOptionIds = [
            ...document.querySelectorAll(
                '[data-product-attribute] input:checked'
            )
        ].map(input => Number(input.value));
        const selectedVariant = variant.find(v =>
          v.option_values?.every(
            ov => selectedOptionIds.includes(ov.id)
          )
        );


        if (selectedVariant) {
            originalPrice = selectedVariant.price;
            priceElement.textContent =
                selectedVariant.price.toFixed(2);
             rules = 
             await getRules();
                 const widget = document.querySelector(".bc-discount-widget");

           if (widget) {
                widget.outerHTML = renderRules();
          }
        }
 }
function bindEvents() {

    const qtyInput =
        document.querySelector('input[name="qty[]"]') ||
        document.querySelector('input[name="qty"]');

    if (!qtyInput) {
        return;
     }
    

    // -----------------------------
    // Variant Change
    // -----------------------------
    document.addEventListener("change", async(event) => {
    const target = event.target;
 
    //-----------------------------
    // False Event of Variant Change
    //------------------------------
     if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
        return;
    }


    if (
        target.matches(
            '[data-product-attribute] input, [data-product-attribute] select'
        )
    ) {
      await updateVariant()
    }
});

    //------------------------------
    // Keyboar Event Change
    //------------------------------

    document.addEventListener("change", async (event) => {
    if (
        event.target.matches(
            '[data-product-attribute] input, [data-product-attribute] select'
        )
    ) {
        await updateVariant();
    }
});

  document.addEventListener("keyup", async (event) => {
    if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) &&
        event.target.matches(
            '[data-product-attribute] input, [data-product-attribute] select'
        )
    ) {
        await updateVariant();
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

  function calculatePrice(price, discount , type=discountType) {
   return type === 'percent' ? Number(price - (price * discount / 100)) : type === 'fixed' ? Number(price - (price - discount)) : Number(price - discount)  
}
function updateDisplayedPrice(discount, qty , type=discountType ) {

    const newPrice = type === 'percent' ? calculatePrice(originalPrice * qty, discount) : type === 'fixed' ? calculatePrice(originalPrice * qty, Number(discount) === 0 ? originalPrice : discount) * qty : calculatePrice(originalPrice*qty,discount*qty ) ;
    
    priceElement.textContent = `$${newPrice.toFixed(2)}`;
}




async function quantityChanged(qty) {

    qty = Number(qty);
    
    updateWasPrice(qty)

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
 function findCartTable() {
  return document.querySelector("table.cart");
}

async function getCart() {
    try {
        const response = await fetch('/api/storefront/carts');

        if (!response.ok) {
            throw new Error(`Cart API error: ${response.status}`);
        }

        const cartData = await response.json();

        if (!cartData || cartData.length === 0) {
            return null;
        }

        return cartData[0];

    } catch (error) {
        console.error("Get cart error:", error);
        return null;
    }
}

async function checkCart() {
    try {
        // 1. Get latest cart
        const response = await fetch('/api/storefront/carts');
        const cartData = await response.json();

        if (!cartData || cartData.length === 0) return;

        const cart = cartData[0];

        let ignoreIds = cart.lineItems.physicalItems
            .map(item => item.productId);

        // 2. Check bulk pricing
        cart.lineItems.physicalItems.forEach(item => {
            if (item.listPrice !== item.originalPrice) {
                ignoreIds = ignoreIds.filter(
                    id => id !== item.productId
                );
            }
        });

        ignoreIds = [...new Set(ignoreIds)];

        console.log("ignoreIds:", ignoreIds);

        // 3. Call YOUR custom API and WAIT for it
        const customResponse = await fetch(
            `${API_BASE}/api/cart?domain=${encodeURIComponent(
                window.location.hostname
            )}&igId=${encodeURIComponent(JSON.stringify(ignoreIds))}`
        );

        const data = await customResponse.json();

        console.log("Custom API completed:", data);

        // 4. ONLY NOW get cart again
        const updatedCart = await getCart();

        console.log("Cart after custom API:", updatedCart);

        return updatedCart;

    } catch (error) {
        console.error("Cart API error:", error);
    }
}

function watchCouponApply() {

    const cartTable = findCartTable();

    if (cartTable) {
        console.log("Cart table found:", cartTable);

        const cartContainer = cartTable.parentElement;

        const observer = new MutationObserver(async () => {
            console.log("BigCommerce cart DOM changed");

            // Give the browser a chance to finish the DOM replacement
            await Promise.resolve();

            await checkCart();
        
        });

        observer.observe(cartContainer, {
            childList: true,
            subtree: true
        });
    }

    if (window.couponCartWatcherAdded) return;

    window.couponCartWatcherAdded = true;

    document.addEventListener("click", (event) => {

        const button = event.target.closest(
            'button[data-cart-update][data-action]'
        );

        if (!button) return;

        const action = button.dataset.action;

        if (action === "inc" || action === "dec") {
            console.log("Quantity button clicked:", action);
        }
    });
}

async function init() {
    console.log("========== Widget Init ==========");
    const cart = findCart();
    if(cart.isCartPage){
      console.log("========== Cart Init ==========");
      await  checkCart();
      watchCouponApply()
    } 
    
    if (!isProductPage()) {
      
        console.log("❌ Not a product page");
        return;
    }

    console.log("✅ Product page");
   
    loadCSS();
    await loadWidgetSettings()

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
        discountType = rules[0]?.discountType  
 
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
        renderRules()
    );

    await bindEvents();
      
    
    console.log("✅ Widget Rendered");
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


