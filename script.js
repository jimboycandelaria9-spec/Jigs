const products = [
  { id: 1, brand: "Apple", category: "apple", name: "iPhone 15", price: 34990, badge: "Popular", bg: "#edf0e4", a: "#bfc9c0", b: "#66776e" },
  { id: 2, brand: "Samsung", category: "samsung", name: "Galaxy S24", price: 42990, badge: "Fan favorite", bg: "#f4e9df", a: "#d6b8a9", b: "#876a64" },
  { id: 3, brand: "Google", category: "android", name: "Pixel 8a", price: 27990, badge: "Great value", bg: "#e8eaf3", a: "#b6b9d2", b: "#72779c" },
  { id: 4, brand: "Apple", category: "apple", name: "iPhone 14", price: 28990, badge: "", bg: "#f3e6e8", a: "#d7aeb8", b: "#a66f80" },
  { id: 5, brand: "Samsung", category: "samsung", name: "Galaxy A55", price: 21990, badge: "Everyday pick", bg: "#e6eee8", a: "#b2c9bc", b: "#628675" },
  { id: 6, brand: "Xiaomi", category: "android", name: "Redmi Note 13", price: 9990, badge: "Budget pick", bg: "#f2ead6", a: "#e2ca8c", b: "#a68c4b" },
  { id: 7, brand: "Apple", category: "apple", name: "iPhone 13", price: 22990, badge: "", bg: "#e9eef1", a: "#b3c5d0", b: "#718e9f" },
  { id: 8, brand: "Samsung", category: "samsung", name: "Galaxy Z Flip5", price: 39990, badge: "Stand out", bg: "#eee7f4", a: "#c8b7d9", b: "#8974a3" }
];

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", maximumFractionDigits: 0
});

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const filters = [...document.querySelectorAll(".filter")];
const cartCount = document.querySelector("#cartCount");
const cartDialog = document.querySelector("#cartDialog");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const toast = document.querySelector("#toast");
let selectedCategory = "all";
let cart = [];
let toastTimer;

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const shown = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = `${product.brand} ${product.name}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (!shown.length) {
    productGrid.innerHTML = '<p class="empty-results">No phones found. Try another search.</p>';
    return;
  }

  productGrid.innerHTML = shown.map(product => `
    <article class="product-card">
      <div class="product-art" style="--product-bg:${product.bg};--phone-a:${product.a};--phone-b:${product.b}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <div class="product-phone"><span class="lens"></span></div>
        <div class="product-phone second"><span class="lens"></span></div>
      </div>
      <div class="product-info">
        <p class="product-brand">${product.brand}</p>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-bottom">
          <span class="product-price">${peso.format(product.price)}</span>
          <button class="add-button" data-add="${product.id}" aria-label="Add ${product.name} to cart">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  renderCart();
  showToast(`${product.name} added to your cart`);
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = count;
  cartTotal.textContent = peso.format(total);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty. Add a phone you like!</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-row">
        <div><strong>${item.name}</strong><small>${item.quantity} × ${peso.format(item.price)}</small></div>
        <button class="remove-item" data-remove="${item.id}" aria-label="Remove ${item.name}">Remove</button>
      </div>
    `).join("");
  }

  const subject = encodeURIComponent("Phone order inquiry");
  const body = encodeURIComponent(
    cart.length
      ? `Hello! I'd like to ask about these phones:\n${cart.map(item => `${item.name} x ${item.quantity} — ${peso.format(item.price * item.quantity)}`).join("\n")}\nEstimated total: ${peso.format(total)}\nPlease confirm availability and final prices.`
      : "Hello! I'd like to ask about your phones."
  );
  document.querySelector("#checkoutButton").href = `mailto:hello@pocket.example?subject=${subject}&body=${body}`;
}

filters.forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    filters.forEach(filter => filter.classList.toggle("active", filter === button));
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  cart = cart.filter(item => item.id !== Number(button.dataset.remove));
  renderCart();
});

document.querySelector("#cartButton").addEventListener("click", () => cartDialog.showModal());
document.querySelector("#closeCart").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", event => {
  if (event.target === cartDialog) cartDialog.close();
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
