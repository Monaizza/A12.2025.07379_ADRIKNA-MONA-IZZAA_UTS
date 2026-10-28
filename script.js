// ===== 1. Toggle menu mobile =====
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", function () {
  navLinks.classList.toggle("open");
});

navLinks.addEventListener("click", function (e) {
  if (e.target.tagName === "A") navLinks.classList.remove("open");
});

// ===== 2. Keranjang belanja (fitur interaktif utama) =====
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const basketList = document.getElementById("basketList");
const basketBtn = document.getElementById("basketBtn");
const basketPanel = document.getElementById("basketPanel");
const clearBtn = document.getElementById("clearBtn");
const summaryList = document.getElementById("summaryList");
const summaryTotal = document.getElementById("summaryTotal");

let cart = [];

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function renderCart() {
  basketList.innerHTML = "";
  summaryList.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  if (cart.length === 0) {
    basketList.innerHTML = "<li>Keranjang masih kosong</li>";
    summaryList.innerHTML = "<li>Belum ada pesanan. Pilih minuman di menu dulu ya.</li>";
  }

  cart.forEach(function (item, index) {
    total += item.price * item.qty;
    totalQty += item.qty;

    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = item.name + " x" + item.qty + " - " + formatRupiah(item.price * item.qty);

    const del = document.createElement("button");
    del.textContent = "hapus";
    del.addEventListener("click", function () {
      item.qty--;
      if (item.qty === 0) cart.splice(index, 1);
      renderCart();
    });

    li.appendChild(info);
    li.appendChild(del);
    basketList.appendChild(li);

    const summaryItem = document.createElement("li");
    summaryItem.textContent = info.textContent;
    summaryList.appendChild(summaryItem);
  });

  cartCount.textContent = totalQty;
  cartTotal.textContent = formatRupiah(total);
  summaryTotal.textContent = formatRupiah(total);
}

function addToCart(name, price) {
  const found = cart.find(function (item) { return item.name === name; });
  if (found) {
    found.qty++;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }
  renderCart();
}

// Semua tombol harga (.buy) memakai satu event listener
document.querySelectorAll(".buy").forEach(function (btn) {
  btn.addEventListener("click", function () {
    addToCart(btn.dataset.name, parseInt(btn.dataset.price, 10));

    btn.classList.add("added");
    setTimeout(function () { btn.classList.remove("added"); }, 400);
  });
});

basketBtn.addEventListener("click", function () {
  basketPanel.hidden = !basketPanel.hidden;
});

clearBtn.addEventListener("click", function () {
  cart = [];
  renderCart();
});

// ===== 3. Tombol order di section promo =====
document.getElementById("promoBtn").addEventListener("click", function () {
  addToCart("Iced Latte (Promo)", 32000);
  basketPanel.hidden = false;
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});

renderCart();

// ===== 4. Slider promo otomatis =====
const slides = document.querySelectorAll(".slide");
const dotsBox = document.getElementById("dots");
const sliderBox = document.getElementById("promos");
let current = 0;
let timer;

slides.forEach(function (_, i) {
  const dot = document.createElement("button");
  dot.className = "dot" + (i === 0 ? " active" : "");
  dot.setAttribute("aria-label", "Promo " + (i + 1));
  dot.addEventListener("click", function () { showSlide(i); restartTimer(); });
  dotsBox.appendChild(dot);
});

function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach(function (s, i) { s.classList.toggle("active", i === current); });
  document.querySelectorAll(".dot").forEach(function (d, i) {
    d.classList.toggle("active", i === current);
  });
}

function startTimer() { timer = setInterval(function () { showSlide(current + 1); }, 4500); }
function restartTimer() { clearInterval(timer); startTimer(); }

document.getElementById("slideNext").addEventListener("click", function () { showSlide(current + 1); restartTimer(); });
document.getElementById("slidePrev").addEventListener("click", function () { showSlide(current - 1); restartTimer(); });
sliderBox.addEventListener("mouseenter", function () { clearInterval(timer); });
sliderBox.addEventListener("mouseleave", startTimer);
startTimer();

// ===== 5. Animasi muncul saat scroll =====
const revealTargets = document.querySelectorAll(".slider, .menu-grid, .promo");
revealTargets.forEach(function (el) { el.classList.add("reveal"); });

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(function (el) { observer.observe(el); });

// ===== 6. Cadangan ekstensi gambar (png -> jpg -> jpeg -> webp) =====
document.querySelectorAll(".drink-pic img, .promo-img img, .slide-art img").forEach(function (img) {
  const base = img.getAttribute("src").replace(/\.[a-z]+$/i, "");
  const exts = ["png", "jpg", "jpeg", "webp"];
  let n = 0;

  img.addEventListener("error", function () {
    n++;
    if (n < exts.length) img.src = base + "." + exts[n];
  });
});

// ===== 7. Form pemesanan (Bootstrap validation) =====
const orderForm = document.getElementById("orderForm");
const addressField = document.getElementById("custAddress");
const addressHint = document.getElementById("addressHint");
const formResult = document.getElementById("formResult");

// Radio button: Take Away tidak perlu alamat
function setAddressMode(takeAway) {
  addressField.disabled = takeAway;
  addressField.required = !takeAway;
  if (takeAway) addressField.value = "";
  addressHint.textContent = takeAway
    ? "Tidak perlu diisi untuk Take Away."
    : "Wajib diisi untuk pesanan Delivery.";
}

document.querySelectorAll('input[name="tipe"]').forEach(function (radio) {
  radio.addEventListener("change", function () {
    setAddressMode(radio.value === "Take Away");
  });
});

function showResult(type, message) {
  formResult.className = "alert mt-4 mb-0 alert-" + type;
  formResult.textContent = message;
  formResult.hidden = false;
}

orderForm.addEventListener("submit", function (e) {
  e.preventDefault();
  formResult.hidden = true;
  orderForm.classList.add("was-validated");

  if (!orderForm.checkValidity()) return;

  if (cart.length === 0) {
    showResult("danger", "Keranjang masih kosong. Pilih minuman di bagian menu dulu ya.");
    return;
  }

  const data = new FormData(orderForm);
  const message = "Terima kasih, " + data.get("nama") + "! Pesanan " + data.get("tipe") +
    " senilai " + cartTotal.textContent + " dengan pembayaran " + data.get("pembayaran") +
    " sudah kami terima.";

  cart = [];
  renderCart();
  orderForm.reset();
  orderForm.classList.remove("was-validated");
  setAddressMode(false);
  showResult("success", message);
});

orderForm.addEventListener("reset", function () {
  orderForm.classList.remove("was-validated");
  formResult.hidden = true;
  setAddressMode(false);
});