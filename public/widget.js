class BCDiscountWidget {
    constructor() {
        this.API_BASE = "https://bgcom.mihir72999.workers.dev";

        this.rules = [];
        this.productId = null;
        this.originalPrice = 0;

        this.priceElement =
            document.querySelector("[data-product-price-with-tax]") ||
            document.querySelector("[data-product-price-without-tax]");
    }

    init() {
        if (window.__BC_DISCOUNT_WIDGET__) return;
        window.__BC_DISCOUNT_WIDGET__ = true;

        if (!this.isProductPage()) {
            console.log("Not product page");
            return;
        }

        this.loadCSS();

        this.productId = this.getProductId();

        if (!this.productId) {
            return;
        }

        const target = this.findTarget();

        if (!target) {
            return;
        }

        this.originalPrice = parseFloat(
            this.priceElement?.textContent.replace(/[^0-9.]/g, "") || 0
        );

        this.getRules()
            .then((rules) => {
                this.rules = rules;

                if (!rules.length) {
                    return;
                }

                target.insertAdjacentHTML(
                    "beforebegin",
                    this.renderRules(rules)
                );

                this.bindEvents();
            })
            .catch(console.error);
    }

    loadCSS() {
        if (document.getElementById("bc-discount-widget-css")) {
            return;
        }

        const link = document.createElement("link");

        link.id = "bc-discount-widget-css";
        link.rel = "stylesheet";
        link.href = `${this.API_BASE}/widget.css`;

        document.head.appendChild(link);
    }

    isProductPage() {
        return this.getProductId() !== null;
    }

    getProductId() {
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

    findTarget() {
        return (
            document.querySelector("#add-to-cart-wrapper") ||
            document.querySelector(".add-to-cart-wrapper") ||
            document.querySelector(".productView-options") ||
            document.querySelector(".productView")
        );
    }

    async getRules() {
        try {
            const url =
                `${this.API_BASE}/api/discounts/${this.productId}` +
                `?domain=${encodeURIComponent(window.location.hostname)}`;

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "1",
                },
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();

            return data.rules || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    calculatePrice(price, discount) {
        return price - (price * discount / 100);
    }

    updateDisplayedPrice(discount, qty) {
        const newPrice = this.calculatePrice(
            this.originalPrice * qty,
            discount
        );

        if (this.priceElement) {
            this.priceElement.textContent =
                `$${newPrice.toFixed(2)}`;
        }
    }

    async quantityChanged(qty) {
    qty = Number(qty);
    let rule = this.rules.find(r => r.quantity === qty);
    const arr = this.rules.map(r =>{
      return r.quantity 
    } )

    const missing = {};

for (let i = arr[0]; i <= arr[arr.length - 1]; i++) {
    if (!arr.includes(i)) {
        missing[i] = i-1
    }
}
if(missing[qty]){
  const rs = this.rules.findIndex(r=>r.quantity === missing[qty])
  rule = this.rules[rs]
}
    if (!rule && qty > this.rules.length - 1) {

        rule = this.rules[this.rules?.length - 1]
    }

    updateDisplayedPrice(rule?.discount, qty);
    }

    syncRadioButtons(qtyInput) {
        const qty = Number(qtyInput.value);

        document
            .querySelectorAll('input[name="discountQty"]')
            .forEach((radio) => {
                const checked = Number(radio.value) === qty;

                radio.checked = checked;

                if (checked) {
                    this.updateDisplayedPrice(
                        Number(radio.dataset.discount),
                        qty
                    );
                }
            });
    }

    bindEvents() {
        const qtyInput =
            document.querySelector('input[name="qty[]"]') ||
            document.querySelector('input[name="qty"]');

        if (!qtyInput) {
            return;
        }

        document.addEventListener("change", (event) => {
            const input = event.target;

            if (
                input &&
                input.name === "discountQty"
            ) {
                qtyInput.value = input.value;

                qtyInput.dispatchEvent(
                    new Event("input", {
                        bubbles: true,
                    })
                );

                this.quantityChanged(input.value);
            }
        });

        qtyInput.addEventListener("input", () => {
            this.syncRadioButtons(qtyInput);
            this.quantityChanged(qtyInput.value);
        });

        qtyInput.addEventListener("change", () => {
            this.syncRadioButtons(qtyInput);
            this.quantityChanged(qtyInput.value);
        });
    }

    renderRules(rules) {
        return `
            <div class="bc-discount-widget">
                ${rules.map(rule => `
                    <label class="bc-rule">
                        <input
                            type="radio"
                            name="discountQty"
                            value="${rule.quantity}"
                            data-discount="${rule.discount}"
                            ${rule.quantity === 1 ? "checked" : ""}
                        />

                        <div>
                            ${rule.label}
                        </div>
                    </label>
                `).join("")}
            </div>
        `;
    }
}

const widget = new BCDiscountWidget();

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        () => widget.init()
    );
} else {
    widget.init();
}