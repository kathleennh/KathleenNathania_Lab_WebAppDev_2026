// Data Produk
const rawProducts = [
  { id: 1, initial: 'K', name: 'Keyboard Mekanik', category: 'Aksesoris', price: 450000, stock: 12 },
  { id: 2, initial: 'M', name: 'Mouse Wireless', category: 'Aksesoris', price: 185000, stock: 30 },
  { id: 3, initial: 'H', name: 'Headset Gaming', category: 'Audio', price: 320000, stock: 8 },
  { id: 4, initial: 'E', name: 'Earbuds TWS', category: 'Audio', price: 275000, stock: 0 },
  { id: 5, initial: 'F', name: 'Flashdisk 64GB', category: 'Penyimpanan', price: 95000, stock: 45 },
  { id: 6, initial: 'S', name: 'SSD Eksternal 1TB', category: 'Penyimpanan', price: 1150000, stock: 5 },
  { id: 7, initial: 'D', name: 'Monitor 24 inci', category: 'Display', price: 1750000, stock: 10 },
  { id: 8, initial: 'W', name: 'Webcam Full HD', category: 'Display', price: 380000, stock: 15 },
  { id: 9, initial: 'P', name: 'Mousepad XL', category: 'Aksesoris', price: 85000, stock: 25 },
];

let products = [...rawProducts];
let cart = [];
let discount = 0;
const FREE_SHIPPING_THRESHOLD = 300000;
const BASE_SHIPPING = 20000;

const rupiah = (num) => 'Rp' + num.toLocaleString('id-ID');

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const productCounter = document.getElementById('productCounter');
const cartContent = document.getElementById('cartContent');
const shippingText = document.getElementById('shippingText');
const progressFill = document.getElementById('progressFill');
const subtotalVal = document.getElementById('subtotalVal');
const discountVal = document.getElementById('discountVal');
const shippingVal = document.getElementById('shippingVal');
const totalVal = document.getElementById('totalVal');
const btnCheckout = document.getElementById('btnCheckout');
const voucherInput = document.getElementById('voucherInput');
const btnVoucher = document.getElementById('btnVoucher');
const checkoutAlert = document.getElementById('checkoutAlert');

function renderProducts() {
  const keyword = searchInput.value.toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;

  let filtered = products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(keyword);
    const matchesCat = category === 'Semua' || p.category === category;
    return matchesName && matchesCat;
  });

  if (sort === 'asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'desc') filtered.sort((a, b) => b.price - a.price);

  productCounter.textContent = `${filtered.length} produk ditampilkan dari total ${products.length}`;
  productGrid.innerHTML = '';

  filtered.forEach(p => {
    const isOutOfStock = p.stock <= 0;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div>
        <div class="product-icon">${p.initial}</div>
        <div class="badge">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">${rupiah(p.price)}</div>
        <div class="product-stock">${isOutOfStock ? 'Stok habis' : 'Stok tersedia: ' + p.stock}</div>
      </div>
      <button class="btn-add" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart(${p.id})">
        ${isOutOfStock ? 'Habis' : 'Tambah'}
      </button>
    `;
    productGrid.appendChild(card);
  });
}

window.addToCart = function(id) {
  const product = products.find(p => p.id === id);
  if (!product || product.stock <= 0) return;

  product.stock -= 1;

  const cartItem = cart.find(item => item.id === id);
  if (cartItem) {
    cartItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderProducts();
  renderCart();
};

function renderCart() {
  if (cart.length === 0) {
    cartContent.innerHTML = `<p class="empty-cart-msg">Keranjang masih kosong.</p>`;
    shippingText.textContent = `Belanja ${rupiah(FREE_SHIPPING_THRESHOLD)} lagi untuk gratis ongkir.`;
    progressFill.style.width = '0%';
    subtotalVal.textContent = 'Rp0';
    discountVal.textContent = '-Rp0';
    shippingVal.textContent = 'Gratis';
    totalVal.textContent = 'Rp0';
    btnCheckout.disabled = true;
    btnCheckout.classList.remove('active');
    return;
  }

  let subtotal = 0;
  cartContent.innerHTML = '';
  const listWrapper = document.createElement('div');
  listWrapper.className = 'cart-items';

  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>${item.qty} x ${rupiah(item.price)}</span>
      </div>
      <div>${rupiah(item.price * item.qty)}</div>
    `;
    listWrapper.appendChild(row);
  });
  cartContent.appendChild(listWrapper);

  const diff = FREE_SHIPPING_THRESHOLD - subtotal;
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  progressFill.style.width = `${progressPercent}%`;

  let shipping = 0;
  if (diff > 0) {
    shippingText.textContent = `Belanja ${rupiah(diff)} lagi untuk gratis ongkir.`;
    shipping = BASE_SHIPPING;
    shippingVal.textContent = rupiah(shipping);
  } else {
    shippingText.textContent = `Anda mendapatkan gratis ongkir!`;
    shipping = 0;
    shippingVal.textContent = 'Gratis';
  }

  const total = Math.max(0, subtotal - discount + shipping);

  subtotalVal.textContent = rupiah(subtotal);
  discountVal.textContent = `-${rupiah(discount)}`;
  totalVal.textContent = rupiah(total);

  btnCheckout.disabled = false;
  btnCheckout.classList.add('active');
}

btnVoucher.addEventListener('click', () => {
  const code = voucherInput.value.trim().toUpperCase();
  if (code === 'DISKON50') {
    discount = 50000;
    alert('Voucher berhasil digunakan: Diskon Rp50.000');
  } else if (code === '') {
    discount = 0;
  } else {
    alert('Kode voucher tidak valid!');
    discount = 0;
  }
  renderCart();
});

btnCheckout.addEventListener('click', () => {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const finalAmount = totalVal.textContent;

  checkoutAlert.textContent = `Pesanan ${totalItems} barang senilai ${finalAmount} berhasil dibuat.`;
  checkoutAlert.style.display = 'block';

  cart = [];
  discount = 0;
  voucherInput.value = '';
  renderCart();
});

searchInput.addEventListener('input', renderProducts);
categorySelect.addEventListener('change', renderProducts);
sortSelect.addEventListener('change', renderProducts);

renderProducts();