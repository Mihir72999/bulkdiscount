(() => {
  "use strict";

  // Prevent double loading
  if (window.__BC_DISCOUNT_WIDGET__) return;
  window.__BC_DISCOUNT_WIDGET__ = true;

  const API_BASE = "https://bgcom.mihir72999.workers.dev";

  /* ============================================================
   * 1. Utilities & Helpers
   * ============================================================ */

  class DOMHelper {
    static query(selector, root = document) {
      return root.querySelector(selector);
    }

    static queryAll(selector, root = document) {
      return [...root.querySelectorAll(selector)];
    }

    static findFirstWithText(selectors) {
      return selectors
        .flatMap((s) => DOMHelper.queryAll(s))
        .find((el) => el.textContent.trim() !== "");
    }
  }

  class CurrencyHelper {
    static parse(text) {
      return parseFloat(String(text).replace(/[^0-9.]/g, "")) || 0;
    }

    static format(amount) {
      return `$${Number(amount).toFixed(2)}`;
    }
  }

  /* ============================================================
   * 2. Product Service (Single Responsibility)
   * ============================================================ */

  class ProductService {
    static isProductPage() {
      return this.getProductId() !== null;
    }

    static getProductId() {
      const selectors = [
        'input[name="product_id"]',
        "[data-product-id]",
        "[data-product-id-value]",
      ];

      for (const selector of selectors) {
        const el = DOMHelper.query(selector);
        if (!el) continue;

        return (
          el.value ||
          el.dataset.productId ||
          el.dataset.productIdValue ||
          null
        );
      }
      return null;
    }

    static getPriceElement() {
      return DOMHelper.findFirstWithText([
        "[data-product-price-with-tax]",
        "[data-product-price-without-tax]",
      ]);
    }

    static getWasPriceElement() {
      return DOMHelper.findFirstWithText([
        "[data-product-non-sale-price-with-tax]",
        "[data-product-non-sale-price-without-tax]",
      ]);
    }

    static getQuantityInput() {
      return (
        DOMHelper.query('input[name="qty[]"]') ||
        DOMHelper.query('input[name="qty"]')
      );
    }

    static getTargetElement() {
      return (
        DOMHelper.query("#add-to-cart-wrapper") ||
        DOMHelper.query(".add-to-cart-wrapper") ||
        DOMHelper.query(".productView-options") ||
        DOMHelper.query(".productView")
      );
    }

    static getSelectedOptionIds() {
      return DOMHelper.queryAll("[data-product-attribute] input:checked").map(
        (input) => Number(input.value)
      );
    }
  }

  /* ============================================================
   * 3. Discount Calculator (Open/Closed + Strategy)
   * ============================================================ */

  class DiscountCalculator {
    /**
     * @param {'percent'|'fixed'|'amount'} type
     * @param {number} price
     * @param {number} discount
     * @param {number} quantity
     */
    static calculate(type, price, discount, quantity = 1) {
      const strategies = {
        percent: () => price - (price * discount) / 100,
        fixed: () => (Number(discount) === 0 ? price : discount),
        amount: () => price - discount,
      };

      const unitPrice = (strategies[type] || strategies.amount)();
      return unitPrice * quantity;
    }

    static unitPrice(type, price, discount) {
      return this.calculate(type, price, discount, 1);
    }
  }

  /* ============================================================
   * 4. API Service (Single Responsibility)
   * ============================================================ */

  class ApiService {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
    }

    async getWidgetSettings(productId) {
      const url = `${this.baseUrl}/api/widgets/settings?domain=${encodeURIComponent(
        window.location.hostname
      )}&product_id=${productId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load widget settings");

      const data = await res.json();
      return data.data;
    }

    async getDiscountRules(productId) {
      const url = `${this.baseUrl}/api/discount/${productId}?domain=${encodeURIComponent(
        window.location.hostname
      )}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return { rules: [], variants: [] };

      const data = await res.json();
      return {
        rules: data.rules || [],
        variants: (data.variants || []).map((v) => ({
          variantId: v.id,
          price: v.price,
          sku: v.sku,
          option_values: v.option_values,
        })),
      };
    }

    async notifyCartUpdate(ignoreIds) {
      const url = `${this.baseUrl}/api/cart?domain=${encodeURIComponent(
        window.location.hostname
      )}&igId=${encodeURIComponent(JSON.stringify(ignoreIds))}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Custom API error: ${res.status}`);
      return res.json();
    }
  }

  /* ============================================================
   * 5. Widget Settings Service
   * ============================================================ */

  class WidgetSettingsService {
    constructor(api) {
      this.api = api;
      this.settings = null;
    }

    async load(productId) {
      this.settings = await this.api.getWidgetSettings(productId);

      if (this.settings) {
        document.documentElement.style.setProperty(
          "--border-radius",
          `${this.settings.borderRadius}px`
        );
        document.documentElement.style.setProperty(
          "--border-color",
          this.settings.borderColor
        );
      }

      return this.settings;
    }
  }

  /* ============================================================
   * 6. Discount Rules Repository
   * ============================================================ */

  class DiscountRulesRepository {
    constructor(api) {
      this.api = api;
      this.rules = [];
      this.variants = [];
      this.discountType = "percent";
    }

    async load(productId) {
      const data = await this.api.getDiscountRules(productId);
      this.rules = data.rules;
      this.variants = data.variants;
      this.discountType = this.rules[0]?.discountType || "percent";
      return this.rules;
    }

    findRuleForQuantity(qty) {
      qty = Number(qty);
      let rule = this.rules.find((r) => r.quantity === qty);

      if (rule) return rule;

      // Fill missing quantities (use previous rule)
      const quantities = this.rules.map((r) => r.quantity);
      const missing = {};

      for (let i = quantities[0]; i <= quantities[quantities.length - 1]; i++) {
        if (!quantities.includes(i)) {
          missing[i] = i - 1;
        }
      }

      if (missing[qty]) {
        const idx = this.rules.findIndex((r) => r.quantity === missing[qty]);
        if (idx !== -1) return this.rules[idx];
      }

      // Fallback to highest rule
      if (qty > quantities[quantities.length - 1]) {
        return this.rules[this.rules.length - 1];
      }

      return null;
    }

    findVariantByOptions(optionIds) {
      return this.variants.find((v) =>
        v.option_values?.every((ov) => optionIds.includes(ov.id))
      );
    }
  }

  /* ============================================================
   * 7. Price Updater (Single Responsibility)
   * ============================================================ */

  class PriceUpdater {
    constructor(priceElement, wasPriceElement) {
      this.priceElement = priceElement;
      this.wasPriceElement = wasPriceElement;
      this.originalPrice = 0;
    }

    setOriginalPrice(price) {
      this.originalPrice = price;
    }

    updateDisplayedPrice(discount, quantity, type) {
      if (!this.priceElement) return;

      const newPrice = DiscountCalculator.calculate(
        type,
        this.originalPrice,
        discount,
        quantity
      );

      this.priceElement.textContent = CurrencyHelper.format(newPrice);
    }

    updateWasPrice(quantity) {
      if (!this.wasPriceElement) return;

      const originalWas =
        this.wasPriceElement.dataset.originalPrice ||
        CurrencyHelper.parse(this.wasPriceElement.textContent);

      if (!this.wasPriceElement.dataset.originalPrice) {
        this.wasPriceElement.dataset.originalPrice = originalWas;
      }

      this.wasPriceElement.textContent = CurrencyHelper.format(
        originalWas * quantity
      );
    }
  }

  /* ============================================================
   * 8. Widget Renderer (Single Responsibility)
   * ============================================================ */

  class DiscountWidgetRenderer {
    constructor(rulesRepo, priceUpdater) {
      this.rulesRepo = rulesRepo;
      this.priceUpdater = priceUpdater;
    }

    render() {
      const { rules, discountType } = this.rulesRepo;
      const originalPrice = this.priceUpdater.originalPrice;

      if (!rules.length) return "";

      const html = rules
        .map((rule) => this._renderRule(rule, originalPrice, discountType))
        .join("");

      return `<div class="bc-discount-widget">${html}</div>`;
    }

    _renderRule(rule, originalPrice, type) {
      const qty = rule.quantity;
      const discount = Number(rule.discount);
      const isZero = discount === 0;

      const unitPrice = DiscountCalculator.unitPrice(type, originalPrice, discount);
      const totalPrice = unitPrice * qty;
      const originalTotal = originalPrice * qty;

      let middleLabel = "";
      if (type === "percent") {
        middleLabel = rule.label || "";
      } else if (type === "fixed") {
        middleLabel = isZero ? "SINGLE" : `${CurrencyHelper.format(originalPrice - discount)} OFF`;
      } else {
        middleLabel = isZero ? "SINGLE" : `${CurrencyHelper.format(discount)} OFF`;
      }

      return `
        <label class="bc-rule">
          <input
            type="radio"
            name="discountQty"
            value="${qty}"
            data-discount="${discount}"
            ${qty === 1 ? "checked" : ""}
          />
          <div class="bc-rule-left">
            <strong class="bc-rule-left-strong">${qty}</strong>
            <small class="bc-rule-left-small">${isZero ? "VIAL" : "VIALS"}</small>
          </div>
          <div class="bc-rule-middle">
            <span class="bc-rule-middle-span">${middleLabel}</span>
            <small class="bc-rule-middle-small">
              ${CurrencyHelper.format(unitPrice)} / VIAL
            </small>
          </div>
          <div class="bc-rule-right">
            <span class="bc-rule-middle-span">${CurrencyHelper.format(totalPrice)}</span>
            <small class="bc-rule-right-small">
              ${isZero ? "" : CurrencyHelper.format(originalTotal)}
            </small>
          </div>
        </label>
      `;
    }

    reRender() {
      const widget = DOMHelper.query(".bc-discount-widget");
      if (widget) {
        widget.outerHTML = this.render();
      }
    }
  }

  /* ============================================================
   * 9. Event Binder (Single Responsibility)
   * ============================================================ */

  class ProductEventBinder {
    constructor(rulesRepo, priceUpdater, renderer) {
      this.rulesRepo = rulesRepo;
      this.priceUpdater = priceUpdater;
      this.renderer = renderer;
      this.qtyInput = ProductService.getQuantityInput();
    }

    bind() {
      if (!this.qtyInput) return;

      this._bindVariantChanges();
      this._bindRadioChanges();
      this._bindQuantityInput();
      this._bindIncDecButtons();
    }

    async _updateVariant() {
      const optionIds = ProductService.getSelectedOptionIds();
      const variant = this.rulesRepo.findVariantByOptions(optionIds);

      if (!variant) return;

      this.priceUpdater.setOriginalPrice(variant.price);
      if (this.priceUpdater.priceElement) {
        this.priceUpdater.priceElement.textContent = variant.price.toFixed(2);
      }

      await this.rulesRepo.load(ProductService.getProductId());
      this.renderer.reRender();
    }

    _bindVariantChanges() {
      document.addEventListener("change", async (e) => {
        if (
          e.target.matches(
            "[data-product-attribute] input, [data-product-attribute] select"
          )
        ) {
          await this._updateVariant();
        }
      });

      document.addEventListener("keyup", async (e) => {
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) &&
          e.target.matches(
            "[data-product-attribute] input, [data-product-attribute] select"
          )
        ) {
          await this._updateVariant();
        }
      });
    }

    _bindRadioChanges() {
      document.addEventListener("change", (e) => {
        const input = e.target;
        if (!input || input.name !== "discountQty") return;

        this.qtyInput.value = input.value;
        this.qtyInput.dispatchEvent(new Event("input", { bubbles: true }));
        this.qtyInput.dispatchEvent(new Event("change", { bubbles: true }));

        this._onQuantityChanged(input.value);
      });
    }

    _bindQuantityInput() {
      this.qtyInput.addEventListener("input", () => {
        this._syncRadios();
        this._onQuantityChanged(this.qtyInput.value);
      });

      this.qtyInput.addEventListener("change", () => {
        this._syncRadios();
        this._onQuantityChanged(this.qtyInput.value);
      });
    }

    _bindIncDecButtons() {
      const incBtn = DOMHelper.query('button[data-action="inc"]');
      const decBtn = DOMHelper.query('button[data-action="dec"]');

      const handler = () => {
        setTimeout(() => {
          this._syncRadios();
          this._onQuantityChanged(this.qtyInput.value);
        }, 50);
      };

      incBtn?.addEventListener("click", handler);
      decBtn?.addEventListener("click", handler);
    }

    _onQuantityChanged(qty) {
      qty = Number(qty);
      this.priceUpdater.updateWasPrice(qty);

      const rule = this.rulesRepo.findRuleForQuantity(qty);
      if (!rule) return;

      this.priceUpdater.updateDisplayedPrice(
        rule.discount,
        qty,
        this.rulesRepo.discountType
      );
    }

    _syncRadios() {
      const qty = Number(this.qtyInput.value);

      DOMHelper.queryAll('input[name="discountQty"]').forEach((radio) => {
        const checked = Number(radio.value) === qty;
        radio.checked = checked;

        if (checked) {
          this.priceUpdater.updateDisplayedPrice(
            Number(radio.dataset.discount),
            qty,
            this.rulesRepo.discountType
          );
        }
      });
    }
  }

  /* ============================================================
   * 10. Cart & Coupon Services
   * ============================================================ */

  class CartService {
    constructor(api) {
      this.api = api;
      this.originalFetch = window.fetch.bind(window);
      this.lastCartSignature = null;
      this.pendingItemId = null;
      this.pendingQty = 0;
    }

    async getCart() {
      try {
        const res = await this.originalFetch("/api/storefront/carts", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Cart API error: ${res.status}`);

        const data = await res.json();
        return data?.[0] || null;
      } catch (err) {
        console.error("Get cart error:", err);
        return null;
      }
    }

    async deleteCoupon(checkoutId, couponCode) {
      if (!checkoutId || !couponCode) return null;

      const url = `/api/storefront/checkouts/${checkoutId}/coupons/${encodeURIComponent(
        couponCode
      )}`;

      try {
        const res = await this.originalFetch(url, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Failed to delete coupon: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error("Error removing coupon:", err);
        return null;
      }
    }

    async updateItemQuantity(itemId, quantity) {
      const formData = new URLSearchParams();
      formData.append("items[0][id]", itemId);
      formData.append("items[0][quantity]", String(quantity));

      const res = await fetch("/remote/v1/cart/update", {
        method: "POST",
        body: formData,
      });

      return res.json();
    }

    async checkCart() {
      try {
        const cart = await this.getCart();
        if (!cart) return;

        const items = cart.lineItems?.physicalItems || [];
        const signature = JSON.stringify(
          items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            listPrice: item.listPrice,
            originalPrice: item.originalPrice,
          }))
        );

        if (signature === this.lastCartSignature) return;

        const coupon = cart.coupons?.[0];
        let ignoreIds = items.map((item) => item.productId);

        items.forEach((item) => {
          if (item.listPrice !== item.originalPrice) {
            ignoreIds = ignoreIds.filter((id) => id !== item.productId);
          }
        });

        ignoreIds = [...new Set(ignoreIds)];

        if (ignoreIds.length === 0 && coupon?.code) {
          await this.deleteCoupon(cart.id, coupon.code);
          this.lastCartSignature = signature;
          return;
        }

        if (!coupon?.code) {
          this.lastCartSignature = signature;
          return;
        }

        await this.api.notifyCartUpdate(ignoreIds);
        this.lastCartSignature = signature;

        if (this.pendingQty > 0 && this.pendingItemId) {
          await this.updateItemQuantity(this.pendingItemId, this.pendingQty);
          this.pendingItemId = null;
          this.pendingQty = 0;
        }
      } catch (err) {
        console.error("checkCart error:", err);
      }
    }

    interceptFetch() {
      const self = this;

      window.fetch = async function (...args) {
        const url = args[0]?.url || args[0];
        const isCartUpdate =
          typeof url === "string" && url.includes("/cart.php");

        const response = await self.originalFetch.apply(this, args);

        if (isCartUpdate) {
          await new Promise((r) => setTimeout(r, 300));
          await self.checkCart();
        }

        return response;
      };
    }

    watchQuantityButtons() {
      document.addEventListener(
        "click",
        (event) => {
          const button = event.target.closest(
            'button[data-cart-update][data-action]'
          );
          if (!button) return;

          const action = button.dataset.action;
          if (action !== "inc" && action !== "dec") return;

          const row = button.closest("tr");
          const qtyInput = row?.querySelector(".cart-item-qty-input");
          if (!qtyInput) return;

          this.pendingItemId = qtyInput.dataset.cartItemid;
          const currentQty = Number(qtyInput.value) || 1;

          this.pendingQty =
            action === "inc" ? currentQty + 1 : Math.max(1, currentQty - 1);
        },
        true
      );
    }
  }

  /* ============================================================
   * 11. CSS Loader
   * ============================================================ */

  class StyleLoader {
    static load(apiBase) {
      if (document.getElementById("bc-discount-widget-css")) return;

      const link = document.createElement("link");
      link.id = "bc-discount-widget-css";
      link.rel = "stylesheet";
      link.href = `${apiBase}/widget.css`;
      document.head.appendChild(link);
    }
  }

  /* ============================================================
   * 12. Application Orchestrator
   * ============================================================ */

  class DiscountWidgetApp {
    constructor() {
      this.api = new ApiService(API_BASE);
      this.settingsService = new WidgetSettingsService(this.api);
      this.rulesRepo = new DiscountRulesRepository(this.api);
      this.cartService = new CartService(this.api);
    }

    async init() {
      // Cart page logic
      if (window.location.pathname === "/cart.php") {
        await this.cartService.checkCart();
        this.cartService.watchQuantityButtons();
        this.cartService.interceptFetch();
        return;
      }

      // Product page logic
      if (!ProductService.isProductPage()) return;

      StyleLoader.load(API_BASE);

      const productId = ProductService.getProductId();
      if (!productId) return;

      const priceElement = ProductService.getPriceElement();
      const wasPriceElement = ProductService.getWasPriceElement();
      const target = ProductService.getTargetElement();

      if (!target) {
        console.warn("Target element not found");
        return;
      }

      const priceUpdater = new PriceUpdater(priceElement, wasPriceElement);
      const originalPrice = CurrencyHelper.parse(priceElement?.textContent || "0");
      priceUpdater.setOriginalPrice(originalPrice);

      await this.settingsService.load(productId);

      try {
        const rules = await this.rulesRepo.load(productId);
        if (!Array.isArray(rules) || rules.length === 0) {
          console.warn("No discount rules found");
          return;
        }
      } catch (err) {
        console.error("Failed to load rules:", err);
        return;
      }

      const renderer = new DiscountWidgetRenderer(this.rulesRepo, priceUpdater);
      target.insertAdjacentHTML("beforebegin", renderer.render());

      const eventBinder = new ProductEventBinder(
        this.rulesRepo,
        priceUpdater,
        renderer
      );
      eventBinder.bind();
    }
  }

  /* ============================================================
   * Bootstrap
   * ============================================================ */

  function bootstrap() {
    const app = new DiscountWidgetApp();
    app.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();