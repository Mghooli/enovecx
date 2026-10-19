const products = [
  { id: 1, name: 'Premium Local Snacks Mix', price: 120, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80', category: 'Snacks', tag: 'Current Offering' },
  { id: 2, name: 'Fresh Green Chilli (1kg)', price: 65, image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=600&q=80', category: 'Vegetables', tag: 'Current Offering' },
  { id: 3, name: 'Agri Home Trowel Tool', price: 299, image: 'https://images.unsplash.com/photo-1416879598555-5c179c7827db?auto=format&fit=crop&w=600&q=80', category: 'Tools', tag: 'Future Expansion' },
  { id: 4, name: 'Spicy Chilli Powder', price: 150, image: 'https://images.unsplash.com/photo-1596683786196-85dd492d242c?auto=format&fit=crop&w=600&q=80', category: 'Spices', tag: 'Current Offering' },
  { id: 5, name: 'Organic Plant Fertilizer', price: 180, image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80', category: 'Garden', tag: 'Future Expansion' },
  { id: 6, name: 'Crunchy Banana Chips', price: 90, image: 'https://images.unsplash.com/photo-1600171092004-984bb1c8286a?auto=format&fit=crop&w=600&q=80', category: 'Snacks', tag: 'Current Offering' }
];

const STORAGE_KEY = 'enovecx_cart';
const BUSINESS_WHATSAPP_NUMBER = '917259975096';
const COMPANY_NAME = 'Enovecx';
let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentInvoiceImage = '';
let currentOrderId = '';
let lastInvoicePayload = {
  items: [],
  total: 0,
  customer: {
    name: 'Not provided',
    email: 'Not provided',
    phone: 'Not provided',
    address: 'Not provided'
  },
  orderId: ''
};

const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}

const slides = document.querySelectorAll('.carousel-item');
let currentSlide = 0;

function nextSlide() {
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}

setInterval(nextSlide, 5000);

const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-pop');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach((el) => revealObserver.observe(el));

const videoEl = document.getElementById('promo-video');
if (videoEl) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        videoEl.play().catch((error) => console.log('Autoplay prevented:', error));
      } else {
        videoEl.pause();
      }
    });
  }, { threshold: 0.3 });

  videoObserver.observe(videoEl);
}

function showSuccessMessage() {
  const form = document.querySelector('#contact form');
  const msg = document.getElementById('success-msg');

  if (!form || !msg) return;

  form.reset();
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 4000);
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = products.map((product, index) => `
    <div class="product-card bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 reveal ${index > 2 ? 'delay-100' : ''}">
      <div class="relative h-48 overflow-hidden group">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">${product.tag}</div>
      </div>
      <div class="product-body p-6 flex flex-col text-gray-900 h-full">
        <h3 class="product-title text-xl font-bold text-blue-900 mb-3">${product.name}</h3>
        <div class="product-footer mt-auto pt-4 border-t border-gray-100">
          <div class="text-2xl font-extrabold text-blue-700 mb-4">₹${product.price}</div>
          <button onclick="addToCart(${product.id})" class="add-to-cart-btn w-full bg-yellow-400 text-blue-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition transform active:scale-95 shadow-md">
            <i class="fas fa-cart-plus text-lg"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('#product-grid .reveal').forEach((el) => revealObserver.observe(el));
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();

  document.querySelectorAll('.fa-shopping-cart').forEach((icon) => {
    icon.classList.add('animate-bounce');
    setTimeout(() => icon.classList.remove('animate-bounce'), 1000);
  });
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, amount) {
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  const nextQuantity = item.quantity + amount;

  if (nextQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = nextQuantity;
  saveCart();
  updateCartUI();
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const desktopBadge = document.getElementById('cart-count-desktop');
  const mobileBadge = document.getElementById('cart-count-mobile');

  if (desktopBadge) desktopBadge.innerText = count;
  if (mobileBadge) mobileBadge.innerText = count;

  const cartContainer = document.getElementById('cart-items');
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="text-center text-gray-500 mt-10">
        <i class="fas fa-box-open text-4xl mb-3"></i>
        <p>Your cart is empty</p>
      </div>
    `;
  } else {
    cartContainer.innerHTML = cart.map((item) => `
      <div class="flex items-center gap-4 bg-white p-3 rounded-lg border shadow-sm text-gray-900">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
        <div class="flex-grow">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-sm font-bold text-gray-800 line-clamp-1">${item.name}</h4>
              <div class="text-blue-700 font-semibold text-sm">₹${item.price}</div>
            </div>
            <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 text-sm" aria-label="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center gap-3">
              <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">-</button>
              <span class="text-sm font-bold">${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">+</button>
            </div>
            <span class="text-sm font-bold text-blue-900">₹${item.price * item.quantity}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  const total = calculateTotal();
  const cartTotal = document.getElementById('cart-total');
  const checkoutTotal = document.getElementById('checkout-total');

  if (cartTotal) cartTotal.innerText = `₹${total}`;
  if (checkoutTotal) checkoutTotal.innerText = `₹${total}`;
}

function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  const panel = document.getElementById('cart-panel');
  if (!overlay || !panel) return;

  if (overlay.classList.contains('open')) {
    panel.classList.remove('open');
    setTimeout(() => overlay.classList.remove('open'), 300);
  } else {
    overlay.classList.add('open');
    setTimeout(() => panel.classList.add('open'), 10);
  }
}

function openCheckout() {
  if (cart.length === 0) return;
  toggleCart();
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.add('open');
}

function closeCheckout() {
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.remove('open');
}

function getCustomerFormData() {
  return {
    name: document.getElementById('customer-name')?.value?.trim() || 'Not provided',
    email: document.getElementById('customer-email')?.value?.trim() || 'Not provided',
    phone: document.getElementById('customer-phone')?.value?.trim() || 'Not provided',
    address: document.getElementById('customer-address')?.value?.trim() || 'Not provided'
  };
}

function generateOrderId() {
  const now = new Date();
  const timeStamp = now.getTime().toString().slice(-8);
  return `ENX-${timeStamp}`;
}

function drawInvoiceTextBlock(ctx, x, y, label, value, color = '#0f172a', bold = false) {
  ctx.font = bold ? '700 14px Arial' : '500 13px Arial';
  ctx.fillStyle = '#475569';
  ctx.fillText(label, x, y);

  ctx.font = bold ? '700 14px Arial' : '500 13px Arial';
  ctx.fillStyle = color;
  const safeValue = value || 'N/A';
  ctx.fillText(String(safeValue), x + 110, y);
}

function prepareInvoiceSnapshot() {
  const customer = getCustomerFormData();
  const orderItems = [...cart];
  const totalAmount = calculateTotal();
  currentOrderId = currentOrderId || generateOrderId();

  lastInvoicePayload = {
    items: orderItems,
    total: totalAmount,
    customer,
    orderId: currentOrderId
  };

  return lastInvoicePayload;
}

function generateInvoiceImage(orderItems, totalAmount) {
  const canvas = document.getElementById('invoice-canvas');
  if (!canvas) return '';

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const customer = lastInvoicePayload.customer || getCustomerFormData();
  const invoiceOrderId = lastInvoicePayload.orderId || currentOrderId || generateOrderId();

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(0, 0, width, 92);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px Arial';
  ctx.fillText(COMPANY_NAME, 24, 52);

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 16px Arial';
  ctx.fillText('Invoice', 24, 118);

  ctx.fillStyle = '#334155';
  ctx.font = '500 12px Arial';
  ctx.fillText(`Order ID: ${invoiceOrderId}`, 24, 138);
  ctx.fillText(`Date: ${new Date().toLocaleString()}`, 24, 154);

  const detailY = 182;
  drawInvoiceTextBlock(ctx, 24, detailY, 'Customer:', customer.name, '#0f172a', true);
  drawInvoiceTextBlock(ctx, 24, detailY + 20, 'Email:', customer.email, '#334155');
  drawInvoiceTextBlock(ctx, 24, detailY + 40, 'Phone:', customer.phone, '#334155');
  drawInvoiceTextBlock(ctx, 24, detailY + 60, 'Address:', customer.address, '#334155');

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 16px Arial';
  ctx.fillText('Order Summary', 24, 280);

  let y = 305;
  const items = orderItems.length ? orderItems : [{ name: 'No items', price: 0, quantity: 1 }];

  items.forEach((item) => {
    const line = `${item.name} x${item.quantity}`;
    const amount = `₹${item.price * item.quantity}`;

    ctx.font = '500 14px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(line, 24, y);

    ctx.font = '700 14px Arial';
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText(amount, width - 110, y);

    y += 25;
  });

  ctx.strokeStyle = '#dbeafe';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, y + 8);
  ctx.lineTo(width - 24, y + 8);
  ctx.stroke();

  ctx.font = '700 18px Arial';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Total', 24, y + 38);
  ctx.fillStyle = '#15803d';
  ctx.fillText(`₹${totalAmount}`, width - 110, y + 38);

  ctx.fillStyle = '#0f172a';
  ctx.font = '500 12px Arial';
  ctx.fillText('Thank you for shopping with Enovecx', 24, height - 28);

  currentInvoiceImage = canvas.toDataURL('image/jpeg', 0.9);
  return currentInvoiceImage;
}

function openInvoiceModal() {
  const invoiceModal = document.getElementById('invoice-modal');
  if (!invoiceModal) return;

  const snapshot = lastInvoicePayload.items.length ? lastInvoicePayload : prepareInvoiceSnapshot();
  generateInvoiceImage(snapshot.items, snapshot.total);

  invoiceModal.classList.remove('hidden');
  invoiceModal.classList.add('open');
}

function closeInvoiceModal() {
  const invoiceModal = document.getElementById('invoice-modal');
  if (!invoiceModal) return;
  invoiceModal.classList.add('hidden');
  invoiceModal.classList.remove('open');
}

function downloadInvoiceImage() {
  if (!currentInvoiceImage) return;

  const link = document.createElement('a');
  link.href = currentInvoiceImage;
  link.download = 'enovecx-invoice.jpg';
  link.click();
}

function sendInvoiceToWhatsApp() {
  const snapshot = lastInvoicePayload.items.length ? lastInvoicePayload : prepareInvoiceSnapshot();
  const customer = snapshot.customer;
  const summary = snapshot.items.length
    ? snapshot.items.map((item) => `${item.name} x${item.quantity} = ₹${item.price * item.quantity}`).join(', ')
    : 'No items';

  const message = `Hello ${COMPANY_NAME}, I would like to place an order.\n\nCustomer: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nAddress: ${customer.address}\nOrder ID: ${snapshot.orderId || generateOrderId()}\nItems: ${summary}\nTotal: ₹${snapshot.total}\nPlease confirm the order.`;

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodedMessage}`;

  if (!currentInvoiceImage) {
    generateInvoiceImage(snapshot.items, snapshot.total);
  }

  if (navigator.share && currentInvoiceImage) {
    fetch(currentInvoiceImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'enovecx-invoice.jpg', { type: 'image/jpeg' });
        navigator.share({
          title: 'Enovecx Invoice',
          text: message,
          files: [file]
        }).catch(() => {
          window.open(waUrl, '_blank');
        });
      })
      .catch(() => {
        window.open(waUrl, '_blank');
      });
    return;
  }

  window.open(waUrl, '_blank');
}

function submitOrder() {
  const customer = getCustomerFormData();
  const orderItems = [...cart];
  const totalAmount = calculateTotal();

  currentOrderId = generateOrderId();
  lastInvoicePayload = {
    items: orderItems,
    total: totalAmount,
    customer,
    orderId: currentOrderId
  };

  generateInvoiceImage(orderItems, totalAmount);
  closeCheckout();

  console.log('Order placed:', {
    orderId: currentOrderId,
    customer,
    items: orderItems,
    total: totalAmount
  });

  cart = [];
  saveCart();
  updateCartUI();

  openInvoiceModal();

  const successModal = document.getElementById('success-modal');
  const successContent = document.getElementById('success-content');

  if (successModal) successModal.classList.add('open');
  if (successContent) setTimeout(() => successContent.classList.add('scale-100'), 10);
}

function closeSuccess() {
  const successContent = document.getElementById('success-content');
  const successModal = document.getElementById('success-modal');

  if (successContent) successContent.classList.remove('scale-100');
  if (successModal) setTimeout(() => successModal.classList.remove('open'), 300);
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
});
