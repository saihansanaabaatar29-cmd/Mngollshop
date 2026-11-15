
"use strict";

const INSTAGRAM_URL = "https://ig.me/m/h3r0_3.0___";

const IPHONE_MODELS = [
  "iPhone 7", "iPhone 7 Plus",
  "iPhone 8", "iPhone 8 Plus",
  "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone SE (2020)",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone SE (2022)",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max"
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Sukuna утасны гэр",
    price: 8000,
    pairPrice: 15000,
    category: "electronic",
    image: "",
    variantType: "iphone",
    description: "Anime style Sukuna загвар. Хосоороо авбал ердөө 15K 🔥"
  },
  {
    id: 2,
    name: "Энгийн цамц",
    price: 45000,
    category: "clothes",
    image: "",
    description: "Өдөр тутмын casual хэв маяг."
  },
  {
    id: 3,
    name: "Lifestyle хэрэгсэл",
    price: 18000,
    category: "other",
    image: "",
    description: "Өдөр тутмын хэрэглээнд зориулсан."
  }
];

const $ = id => document.getElementById(id);

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

let products = loadData("mongolShopProducts", DEFAULT_PRODUCTS);
let cart = loadData("mongolShopCart", []);
let activeCategory = "all";
let editingId = null;
let searchText = "";

// Хуучин утасны гэрийн мэдээллийг Sukuna бараагаар шинэчлэх
let sukuna = products.find(p => Number(p.id) === 1);

if (sukuna) {
  Object.assign(sukuna, {
    name: "Sukuna утасны гэр",
    price: 8000,
    pairPrice: 15000,
    category: "electronic",
    variantType: "iphone",
    description: "Anime style Sukuna загвар. Хосоороо авбал ердөө 15K 🔥"
  });
} else {
  products.unshift({ ...DEFAULT_PRODUCTS[0] });
}

function saveData() {
  try {
    localStorage.setItem("mongolShopProducts", JSON.stringify(products));
    localStorage.setItem("mongolShopCart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Өгөгдөл хадгалахад алдаа гарлаа:", error);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatPrice(value) {
  return Number(value).toLocaleString("en-US") + "₮";
}

function safeImage(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

// Барааны үнэ: Sukuna гэрийг хосоор авбал 15,000₮
function calculateProductTotal(product, quantity) {
  const price = Number(product.price) || 0;
  const pairPrice = Number(product.pairPrice);

  if (pairPrice > 0) {
    const pairs = Math.floor(quantity / 2);
    const remainder = quantity % 2;
    return pairs * pairPrice + remainder * price;
  }

  return price * quantity;
}

function calculateCartTotal() {
  const grouped = new Map();

  cart.forEach(item => {
    const product = products.find(
      p => Number(p.id) === Number(item.id)
    );

    if (!product) return;

    const id = Number(product.id);
    grouped.set(
      id,
      (grouped.get(id) || 0) + Number(item.quantity)
    );
  });

  let total = 0;

  grouped.forEach((quantity, id) => {
    const product = products.find(p => Number(p.id) === id);
    if (product) {
      total += calculateProductTotal(product, quantity);
    }
  });

  return total;
}

function renderProducts() {
  const grid = $("product-grid");

  let list = products;

  if (activeCategory !== "all") {
    list = list.filter(p => p.category === activeCategory);
  }

  if (searchText) {
    list = list.filter(p =>
      String(p.name).toLowerCase().includes(searchText) ||
      String(p.description || "").toLowerCase().includes(searchText)
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <p class="empty-message">Одоогоор тохирох бараа олдсонгүй.</p>
    `;
    return;
  }

  grid.innerHTML = list.map(p => {
    const image = safeImage(p.image || "");
    const price = Number(p.price) || 0;

    return `
      <article class="product-card">
        <div class="product-image">
          ${
            image
              ? `<img src="${escapeHTML(image)}"
                   alt="${escapeHTML(p.name)}"
                   onerror="this.style.display='none'">`
              : "✳"
          }
        </div>

        <div class="product-info">
          <h3>${escapeHTML(p.name)}</h3>

          <p class="product-description">
            ${escapeHTML(p.description || "Дэлгэрэнгүй мэдээлэл удахгүй.")}
          </p>

          ${
            Number(p.pairPrice) > 0
              ? `
                <div class="pair-offer">
                  <strong>ХОСООРОО 15K 🔥</strong>
                  <p>1 ширхэг ${formatPrice(price)}</p>
                </div>
              `
              : ""
          }

          ${
            price > 0
              ? `<p class="price">${formatPrice(price)}</p>`
              : `<p class="product-status">Үнэ лавлах</p>`
          }

          ${
            p.variantType === "iphone"
              ? `
                <label class="variant-label" for="model-${p.id}">
                  iPhone загвараа сонго
                </label>

                <select class="variant-select" id="model-${p.id}" data-model>
                  <option value="">Загвар сонгох</option>
                  ${IPHONE_MODELS.map(model =>
                    `<option value="${escapeHTML(model)}">${escapeHTML(model)}</option>`
                  ).join("")}
                </select>
              `
              : ""
          }

          ${
            price > 0
              ? `<button class="add-button" data-add="${Number(p.id)}">
                   ＋ Сагсанд хийх
                 </button>`
              : `<button class="add-button" data-inquiry="${Number(p.id)}">
                   Үнэ лавлах ↗
                 </button>`
          }

          <div class="admin-actions">
            <button data-edit="${Number(p.id)}">Засах</button>
            <button class="delete-button" data-delete="${Number(p.id)}">Устгах</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  cart = cart.filter(item => {
    const product = products.find(p => Number(p.id) === Number(item.id));
    return product &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0;
  });

  $("cart-count").textContent = cart.reduce(
    (sum, item) => sum + Number(item.quantity), 0
  );

  if (cart.length === 0) {
    $("cart-items").innerHTML =
      `<p class="empty-message">Сагс одоогоор хоосон байна.</p>`;
  } else {
    $("cart-items").innerHTML = cart.map((item, index) => {
      const p = products.find(product => Number(product.id) === Number(item.id));

      return `
        <div class="cart-item">
          <div>
            <strong>${escapeHTML(p.name)}</strong>
            ${
              item.model
                ? `<p>Загвар: ${escapeHTML(item.model)}</p>`
                : ""
            }
            <p>${formatPrice(p.price)} × ${item.quantity}</p>
          </div>

          <div class="quantity-controls">
            <button data-minus="${index}" aria-label="Хасах">−</button>
            <strong>${item.quantity}</strong>
            <button data-plus="${index}" aria-label="Нэмэх">+</button>
            <button class="remove-button" data-remove="${index}" aria-label="Устгах">✕</button>
          </div>
        </div>
      `;
    }).join("");
  }

  const total = calculateCartTotal();

  $("cart-total").textContent = formatPrice(total);

  saveData();
}

function resetProductForm() {
  $("product-form").reset();
  editingId = null;
  $("product-submit").textContent = "＋ Бараа нэмэх";
  $("cancel-edit").classList.add("hidden");
}

$("product-form").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("new-name").value.trim();
  const price = Number($("new-price").value);
  const category = $("new-category").value;
  const image = safeImage($("new-image").value.trim());
  const description = $("new-description").value.trim();

  if (!name || !Number.isFinite(price) || price < 0) {
    $("admin-message").textContent = "Нэр болон үнийг зөв оруулна уу.";
    return;
  }

  if (editingId !== null) {
    const p = products.find(product => Number(product.id) === Number(editingId));

    if (p) {
      Object.assign(p, { name, price, category, image, description });
    }

    $("admin-message").textContent = "Барааны мэдээлэл шинэчлэгдлээ.";
  } else {
    products.push({
      id: Date.now(),
      name,
      price,
      category,
      image,
      description
    });

    $("admin-message").textContent = "Шинэ бараа нэмэгдлээ.";
  }

  saveData();
  renderProducts();
  renderCart();
  resetProductForm();
});

$("cancel-edit").addEventListener("click", () => {
  resetProductForm();
  $("admin-message").textContent = "Засвар цуцлагдлаа.";
});

$("product-grid").addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const edit = event.target.closest("[data-edit]");
  const remove = event.target.closest("[data-delete]");
  const inquiry = event.target.closest("[data-inquiry]");

  if (add) {
    const id = Number(add.dataset.add);
    const product = products.find(p => Number(p.id) === id);

    if (!product || Number(product.price) <= 0) return;

    let model = "";

    if (product.variantType === "iphone") {
      const selector = add.closest(".product-card").querySelector("[data-model]");
      model = selector ? selector.value : "";

      if (!model) {
        alert("Эхлээд iPhone загвараа сонгоно уу.");
        return;
      }
    }

    const item = cart.find(p =>
      Number(p.id) === id && (p.model || "") === model
    );

    if (item) {
      item.quantity++;
    } else {
      cart.push({ id, model, quantity: 1 });
    }

    renderCart();

    const originalText = add.textContent;
    add.textContent = "✓ Сагсанд нэмэгдлээ";
    add.classList.add("added");

    setTimeout(() => {
      add.textContent = originalText;
      add.classList.remove("added");
    }, 1200);

    return;
  }

  if (inquiry) {
    window.open(INSTAGRAM_URL, "_blank", "noopener");
    return;
  }

  if (edit) {
    const id = Number(edit.dataset.edit);
    const p = products.find(product => Number(product.id) === id);

    if (!p) return;

    editingId = id;
    $("new-name").value = p.name;
    $("new-price").value = p.price;
    $("new-category").value = p.category;
    $("new-image").value = p.image || "";
    $("new-description").value = p.description || "";

    $("product-submit").textContent = "Өөрчлөлт хадгалах";
    $("cancel-edit").classList.remove("hidden");
    $("admin-message").textContent = "Мэдээллээ засаад хадгалаарай.";

    $("admin").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (remove) {
    const id = Number(remove.dataset.delete);
    const p = products.find(product => Number(product.id) === id);

    if (!p || !confirm(p.name + " барааг устгах уу?")) return;

    products = products.filter(product => Number(product.id) !== id);
    cart = cart.filter(item => Number(item.id) !== id);

    saveData();
    renderProducts();
    renderCart();

    $("admin-message").textContent = "Бараа устгагдлаа.";
  }
});

$("categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".category").forEach(btn => {
    btn.classList.toggle("active", btn === button);
  });

  renderProducts();
});

$("product-search").addEventListener("input", event => {
  searchText = event.target.value.trim().toLowerCase();
  renderProducts();
});

$("cart-toggle").addEventListener("click", () => {
  $("cart-section").classList.remove("hidden");
  $("cart-section").scrollIntoView({ behavior: "smooth" });
});

$("close-cart").addEventListener("click", () => {
  $("cart-section").classList.add("hidden");
});

$("cart-items").addEventListener("click", event => {
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove]");

  if (plus) {
    const item = cart[Number(plus.dataset.plus)];
    if (item) item.quantity++;
  }

  if (minus) {
    const item = cart[Number(minus.dataset.minus)];
    if (item) item.quantity--;
    cart = cart.filter(p => p.quantity > 0);
  }

  if (remove) {
    cart.splice(Number(remove.dataset.remove), 1);
  }

  renderCart();
});

$("order-form").addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Эхлээд сагсандаа бараа нэмнэ үү.");
    return;
  }

  const name = $("customer-name").value.trim();
  const phone = $("customer-phone").value.trim();
  const address = $("customer-address").value.trim();

  if (!name || !phone || !address) {
    alert("Захиалгын мэдээллээ бүрэн оруулна уу.");
    return;
  }

  const lines = cart.map(item => {
    const p = products.find(product => Number(product.id) === Number(item.id));
    const modelText = item.model ? ` (${item.model})` : "";

    return `- ${p.name}${modelText} × ${item.quantity}`;
  });

  const total = calculateCartTotal();

  const message = [
    "Сайн байна уу! MONGOL SHOP-оос захиалга өгөх гэсэн юм.",
    "",
    "Нэр: " + name,
    "Утас: " + phone,
    "Хаяг: " + address,
    "",
    "Захиалсан бараа:",
    ...lines,
    "",
    "Хосын урамшуулалтай нийт үнэ: " + formatPrice(total),
    "",
    "Захиалгыг баталгаажуулж өгнө үү."
  ].join("\n");

  $("order-result").innerHTML = `
    <h3>Захиалгын мэдээлэл бэлэн боллоо!</h3>
    <div class="order-message" id="order-message"></div>
    <button type="button" class="primary-button" id="copy-order">
      📋 Мэдээлэл хуулах
    </button>
    <a class="instagram-button"
       href="${INSTAGRAM_URL}"
       target="_blank"
       rel="noopener">
      Instagram чат нээх ↗
    </a>
    <p class="admin-warning">Мэдээллээ хуулж Instagram чат руу Paste хийгээрэй.</p>
  `;

  $("order-message").textContent = message;

  $("copy-order").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert("Мэдээлэл хуулагдлаа! Instagram чат руу Paste хийгээрэй.");
    } catch {
      alert("Автоматаар хуулах боломжгүй байна. Мэдээллээ удаан дарж хуулна уу.");
    }
  });

  $("order-result").scrollIntoView({ behavior: "smooth" });
});

renderProducts();
renderCart();
